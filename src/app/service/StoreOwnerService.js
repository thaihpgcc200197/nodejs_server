const { NOT_FOUND, INTERNAL_SERVER_ERROR, OK, CREATED, NOT_ACCEPTABLE, BAD_REQUEST} = require("http-status-codes");
const { ProductSchema, CategorySchema,OrderSchema } = require("../schema");
const { BytescaleUtil } = require("../../util");
const mongoose = require("mongoose");
const {ProductStatus} = require("../constant");
const aqp = require("api-query-params");
const OrderStatus = require("../constant/OrderStatus");

const StoreOwnerService = {
  async OverallStatistics(req) { 
    try {
        const user_id = req.user.id;
        const now = new Date();
        let filterAuctioned = {
          end_time: {
              $lt: now, 
              $gte: new Date(now.getFullYear(), now.getMonth(), 1),
              $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
          },
          user: new mongoose.Types.ObjectId(user_id)  
      };

        let filterAuctioning = { 
            status: ProductStatus.AUCTIONING,
            start_time: { $lte: now },
            end_time: { $gte: now },
            user: new mongoose.Types.ObjectId(user_id)  
        };
        
        const productsAuctioned = await ProductSchema.find(filterAuctioned).exec();
        const quantityProductAuctioning = await ProductSchema.countDocuments(filterAuctioning).exec();

        let totalHighestBidsPrice = 0;
        productsAuctioned.forEach(product => {
            if (product.bids && product.bids.length > 0) {
                const maxBidPrice = Math.max(...product.bids.map(bid => bid.price));
                totalHighestBidsPrice += maxBidPrice;
            }
        });
        return {
            quantityproduct: productsAuctioned.length, 
            totalHighestBidsPrice, 
            quantity_product_auctioning: quantityProductAuctioning, 
            status: OK
        };
    } catch (error) {
        console.error(error);
        return { mess: "INTERNAL SERVER ERROR", status: INTERNAL_SERVER_ERROR };
    }
  },

  async WinningBidStatistics(req) {
    try {
      const { filter, limit } = aqp(req.query, { blacklist: ['from_date', 'to_date','status','name'] });
      const { page, from_date, to_date,status,name } = req.query;
      
      if (from_date || to_date) {
        filter.$and = [];
        if (from_date) filter.$and.push({ start_time: { $gte: new Date(from_date) } });
        if (to_date) filter.$and.push({ end_time: { $lte: new Date(to_date) } });
      }
      filter.user = req.user.id;
      if (name) filter.name = { $regex: name, $options: 'i' }; 
      let orderFilter = {};
      console.log(status);
      
      if (status)  orderFilter.status = status;
      const orders = await OrderSchema.find(orderFilter).select('product').exec();    
      const orderedProductIds = orders.map(order => order.product);
      filter._id = { $in: orderedProductIds };
  
      const products = await ProductSchema.find(filter).skip((page - 1) * limit).limit(limit).exec();
      const total = await ProductSchema.countDocuments(filter);
  
      return {
        quantityOfAuctionProduct: products.length,
        page: Number.parseInt(page),
        lastpage: Math.ceil(total / limit),
        products
      };
    } catch (error) {
      console.error(error);
      return { mess: "INTERNAL SERVER ERROR", status: INTERNAL_SERVER_ERROR };
    }
  },

  async MyActivityStatistics(req) {
    try {
      const { filter, limit } = aqp(req.query, { blacklist: ['from_date', 'to_date', 'name'] });
      const { page, from_date, to_date, name } = req.query;
  
      if (from_date || to_date) {
        filter.$and = [];
        if (from_date) filter.$and.push({ start_time: { $gte: new Date(from_date) } });
        if (to_date) filter.$and.push({ end_time: { $lte: new Date(to_date) } });
      }
  
      if (name) filter.name = { $regex: name, $options: 'i' };
  
      filter.bids = { $elemMatch: { user: req.user.id } };
   
  
      const orders = await OrderSchema.find({user : req.user.id}).select('product').exec();    
      const orderedProductIds = orders.map(order => order.product);

      const productAuctioned = await ProductSchema.find({ _id: { $in: orderedProductIds } }).exec();
  
      filter._id = { $nin: orderedProductIds };
  
      const filteredProducts = await ProductSchema.find(filter).skip((page - 1) * limit).limit(limit).exec();
      const total = await ProductSchema.countDocuments(filter);
      
      return {
        productAuctioned, 
        filteredProducts,  
        quantityOfAuctionProduct: filteredProducts.length,
        page: Number.parseInt(page),
        lastpage: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error(error);
      return { mess: "INTERNAL SERVER ERROR", status: INTERNAL_SERVER_ERROR };
    }
  },
  



   async MyBidStatistics(req) {
    try {
      const { filter, limit } = aqp(req.query,{blacklist:['from_date', 'to_date','name']});
      const { page, from_date, to_date,name } = req.query;
      if (from_date || to_date) {
        filter.$and = [];
        if (from_date) filter.$and.push({ start_time: { $gte: new Date(from_date) } });
        if (to_date) filter.$and.push({ end_time: { $lte: new Date(to_date) } });
      }
      filter.user=req.user.id
      if (name) filter.name = { $regex: name, $options: 'i' }; 
      const product = await ProductSchema.find(filter).skip((page - 1) * limit).limit(limit).exec();
      const total = await ProductSchema.countDocuments(filter);
      
      return {quantityOfAuctionProduct:product.length,
        page: Number.parseInt(page), lastpage: Math.ceil(total / limit),product };
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

  
    async Create(name, category_id, start_price, step_price, user_id, file) {
    if (!category_id.match(/^[0-9a-fA-F]{24}$/)) {
      return { error: "Invalid Category id", status: NOT_FOUND };
    }
    const cate = await CategorySchema.findById({ _id: category_id });
    try {
      const { file_url, file_path } = await BytescaleUtil.Upload(file,"/upload");
      if (!cate) {
        return { mess: "Category not found", status: NOT_FOUND };
      }
      const product = new ProductSchema({ name, cate: category_id, start_price, step_price,
         user: user_id, img_url: file_url, img_path: file_path,status:'processing'});
      const result= await product.save();
      return {result, status:CREATED};
    } catch (error) {
      return {mess:"Internal server error", status:INTERNAL_SERVER_ERROR}
    }
  },
  async Update(name,category_id,product_id,start_price,step_price,user_id,file  ) {
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
