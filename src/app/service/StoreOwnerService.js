const { NOT_FOUND, INTERNAL_SERVER_ERROR, OK, CREATED, NOT_ACCEPTABLE, BAD_REQUEST, UNAUTHORIZED} = require("http-status-codes");
const { ProductSchema, CategorySchema,OrderSchema } = require("../schema");
const { BytescaleUtil } = require("../../util");
const mongoose = require("mongoose");
const {ProductStatus} = require("../constant");
const aqp = require("api-query-params");
const OrderStatus = require("../constant/OrderStatus");

const StoreOwnerService = {

  async WinningBidOrder(req) {
    try {
      const { filter,sort } = aqp(req.query);
      
      filter.owner_id = req.user.id;
      
      const orders = await OrderSchema.find(filter).populate('product').populate('user_id').populate('owner_id').sort(sort).exec();    
      return {
        orders, status:OK
      };
    } catch (error) {
      console.error(error);
      return { mess: "INTERNAL SERVER ERROR", status: INTERNAL_SERVER_ERROR };
    }
  },

  async WinningBidStatistics(req) {
    try {
      const { filter,sort } = aqp(req.query);
      
      filter.user_id = req.user.id;
      
      const orders = await OrderSchema.find(filter).populate('product').populate('user_id').populate('owner_id').sort(sort).exec();    
      return {
        orders, status:OK
      };
    } catch (error) {
      console.error(error);
      return { mess: "INTERNAL SERVER ERROR", status: INTERNAL_SERVER_ERROR };
    }
  },

  async MyActivityStatistics(req) {
    try {
      const list_product_id_order= await OrderSchema.find({user_id:req.user.id,status:{$in:[OrderStatus.PENDING,OrderStatus.Delivery]}}).select('product');
      const product_blur = list_product_id_order.map((order)=>{
            return order.product
      })
      const { filter,sort } = aqp(req.query);
      filter._id= {$nin:product_blur };
      filter.bids = { $elemMatch: { user: req.user.id } };
      filter.status =ProductStatus.AUCTIONING;

      const productAuctioned = await ProductSchema.find(filter).populate('cate').populate('bids.user').populate('user').sort(sort).exec();
      return {
        productAuctioned
      };
    } catch (error) {
      console.error(error);
      return { mess: "INTERNAL SERVER ERROR", status: INTERNAL_SERVER_ERROR };
    }
  },
  
  async MyBidStatistics(req) {
    try {
      const { filter,sort} = aqp(req.query);
      filter.user=req.user.id
      filter.status = { $ne: ProductStatus.DELETED };
      const products = await ProductSchema.find(filter).populate('cate').populate('bids.user').populate('user').sort(sort).exec();   
      let active_bid= 0;
      let revenue= 0;
      let winner= 0;
      let current_date=new Date();
      products.map(pro=>{
        if (pro.start_time <= current_date && pro.end_time>=current_date) {
          active_bid+=1;
          revenue+=pro.bids[pro.bids.length-1].price
          if(pro.end_time<current_date && pro.bids.length>0) winner+=1
        }
      })
      return {products,winner, revenue, active_bid };
    } catch (error) {
      console.error(error); 
      return { mess: "INTERNAL SERVER ERROR", status: INTERNAL_SERVER_ERROR };
    }
  },


  async UpdateOrderStatus(order_id,status) {
    try {
      const order = await OrderSchema.findOne({ _id: order_id});
      if (!order) return { mess: "Order not found", status: BAD_REQUEST }; 
      order.status=status;
      const result= await order.save()
      return { mess: "Update order successful", status: OK,result }; 
    } catch (error) {
      console.error(error);
      return { mess: "Internal server error", status: INTERNAL_SERVER_ERROR }; 
    }
  },
   async Publish(auctionProductId,start_time,end_time) {
    try {
      const product = await ProductSchema.findOne({ _id: auctionProductId, status: { $in: [ProductStatus.ACCEPT, ProductStatus.AUCTIONING] } });
      const {mess,status} = await this.validatePublish(product,start_time,end_time);
      if(mess!="") return {mess,status}     
      product.status=ProductStatus.AUCTIONING;
      product.start_time= new Date(start_time);
      product.end_time= new Date(end_time);
      await product.save();
      return { mess: "Create a successful auction", status: OK }; 
    } catch (error) {
      console.error(error);
      return { mess: "Internal server error", status: INTERNAL_SERVER_ERROR }; 
    }
  },
  validatePublish(product,start_time,end_time){
    if(!product) return { mess: "No accepted auction items found", status: NOT_FOUND}; 
    if(start_time > end_time) return { mess: "Start time must be less than end time", status: NOT_FOUND}; 
    return {mess:"",status:OK}
  },

  
    async Create(name, category_id, start_price, step_price, user_id, file,quantity) {
    if (!category_id.match(/^[0-9a-fA-F]{24}$/)) {
      return { error: "Invalid Category id", status: NOT_FOUND };
    }
    const cate = await CategorySchema.findById({ _id: category_id });
    try {
      const { file_url, file_path } = await BytescaleUtil.Upload(file,"/upload");
      if (!cate) {
        return { mess: "Category not found", status: NOT_FOUND };
      }
      const product = new ProductSchema({ name, cate: category_id, start_price, step_price,quantity,
         user: user_id, img_url: file_url, img_path: file_path,status:ProductStatus.ACCEPT});
         console.log(123);
         product.save()
      return {product, status:CREATED};
    } catch (error) {
      return {mess:"Internal server error", status:INTERNAL_SERVER_ERROR}
    }
  },
  async Update(name,category_id,product_id,start_price,step_price,user_id,file,quantity  ) {   
    let product = await ProductSchema.findById(product_id).populate('cate').exec();
    const cate= await CategorySchema.findById(category_id);
    if(!cate) return { error: "Invalid category id", status: NOT_FOUND }; 
    if(!product) return { mess: "Product not found", status: NOT_FOUND };
    if(product.user.toString() !=user_id){
      return { mess: "You are not the author", status: UNAUTHORIZED };
    }
    if(product.status==ProductStatus.ACCEPT) {
      try {
        if(file){
        BytescaleUtil.Delete(product.img_path)
        const {file_url , file_path} = await BytescaleUtil.Upload(file,"/upload")
        product.img_url = file_url
        product.img_path = file_path
        }
        product.name = name
        product.cate = new mongoose.Types.ObjectId(category_id)
        product.start_price=start_price;
        product.step_price=step_price;
        product.quantity=quantity;
        product=await product.save();
        product.cate=cate;
        return {product,status:OK}
        } catch (error) {
          return {mess:"Internal server error", status:INTERNAL_SERVER_ERROR}
        }
    }else{
      return { mess: "Product not found or not status ", status: NOT_FOUND };
    } 
  
  },
  async Delete(product_id, user_id) {
    try {
      const product = await ProductSchema.findById({ _id: product_id });
      if (!product || product.status == ProductStatus.DELETED) {
        return { mess: "Product not found", status: NOT_FOUND};
      }
      if (user_id != product.user.toString()) {
        return { mess: "You are not the author", status: UNAUTHORIZED };
      }
      if (product.status == ProductStatus.AUCTIONING) {
        return { mess: "It is not possible to delete a product while it is in auction.", status: NOT_ACCEPTABLE };
      }
        product.status=ProductStatus.DELETED;
        product.save()
      return { mess: "Delete product successfully", status: OK };

    } catch (error) {
      return {mess:"Internal server error", status:INTERNAL_SERVER_ERROR}
    }
  },
};
module.exports = StoreOwnerService;
