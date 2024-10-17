const { NOT_FOUND, INTERNAL_SERVER_ERROR, OK, CREATED, NOT_ACCEPTABLE, BAD_REQUEST} = require("http-status-codes");
const { ProductSchema, CategorySchema,OrderSchema } = require("../schema");
const { BytescaleUtil } = require("../../util");
const mongoose = require("mongoose");
const {ProductStatus} = require("../constant");
const aqp = require("api-query-params");
const OrderStatus = require("../constant/OrderStatus");

const StoreOwnerService = {

  async WinningBidStatistics(req) {
    try {
      const { filter } = aqp(req.query);
      
      filter.user = req.user.id;
      
      const orders = await OrderSchema.find(filter).populate('product').exec();    
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
      const { filter } = aqp(req.query);
   
      filter.bids = { $elemMatch: { user: req.user.id } };
   
      const productAuctioned = await ProductSchema.find(filter).exec();
      
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
      const { filter} = aqp(req.query);
      filter.user=req.user.id
      const products = await ProductSchema.find(filter).exec();   
      const active_bid= 0;
      const revenue= 0;
      const count= 0;
      const current_date=new Date();
      products.map(pro=>{
        if (pro.start_time >= current_date && pro.end_time<=current_date) {
          active_bid+=1;
          revenue+=pro.bids[pro.bids.length-1]
          if(pro.end_time<current_date && pro.bids.length>0) count+=1
        }
      })
      return {quantityOfAuctionProduct:product.length,product };
    } catch (error) {
      console.error(error); 
      return { mess: "INTERNAL SERVER ERROR", status: INTERNAL_SERVER_ERROR };
    }
  },



  async ManageOrder(product_id,status) {
    try {
      const order = await ProductSchema.findOne({ product: product_id, status: OrderStatus.PENDING });
      if (!order) return { mess: "Order not found or not status pending", status: BAD_REQUEST }; 
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
      const product = await ProductSchema.findOne({ _id: auctionProductId, status: ProductStatus.ACCEPT});
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
         user: user_id, img_url: file_url, img_path: file_path,status:'processing'});
      const result= await product.save();
      return {result, status:CREATED};
    } catch (error) {
      return {mess:"Internal server error", status:INTERNAL_SERVER_ERROR}
    }
  },
  async Update(name,category_id,product_id,start_price,step_price,user_id,file,quantity  ) {
    if (!mongoose.isValidObjectId(category_id)) return { error: "Invalid Category id", status: NOT_FOUND };
    if (!mongoose.isValidObjectId(product_id)) return { error: "Invalid Product id", status: NOT_FOUND };
   
    const product = await ProductSchema.findById({ _id: product_id });
    if(!product) return { mess: "Product not found", status: NOT_FOUND };
    if(product.status!=ProductStatus.PROCESSING) return { mess: "Product not found", status: NOT_FOUND };
    if(product.user.toString()!=user_id){
      return { mess: "You are not the author", status: UNAUTHORIZED };
    }
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

        return product.save()
        } catch (error) {
          return {mess:"Internal server error", status:INTERNAL_SERVER_ERROR}
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
