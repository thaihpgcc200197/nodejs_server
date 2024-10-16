const {
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  OK,
  BAD_REQUEST,
} = require("http-status-codes");
const { ProductSchema, OrderSchema, UserSchema } = require("../schema");
const mongoose = require("mongoose");
const { ProductStatus } = require("../constant");
const aqp = require("api-query-params");
const OrderStatus = require("../constant/OrderStatus");

const CustomerService = {

  async SearchAuctionActivity(req) {
    try {
      const { filter, limit } = aqp(req.query,{blacklist:['from_date', 'to_date','status']});
      const { page, from_date, to_date } = req.query;
      filter.status=ProductStatus.AUCTIONING;
      if (from_date || to_date) {
        filter.$and = [];
        if (from_date) filter.$and.push({ start_time: { $gte: new Date(from_date) } });
        if (to_date) filter.$and.push({ end_time: { $lte: new Date(to_date) } });
      }
  
      const product = await ProductSchema.find(filter).skip((page - 1) * limit).limit(limit).exec();
      const total = await ProductSchema.countDocuments(filter);
  
      return { total, page: Number.parseInt(page), lastpage: Math.ceil(total / limit), product, status: OK };
    } catch (error) {
      console.error(error);
      return { mess: "INTERNAL SERVER ERROR", status: INTERNAL_SERVER_ERROR };
    }
  },
  
  async ViewAuctionActivity(req) {
    try {
      const { filter, limit, sort} = aqp(req.query);
      const {page} = req.query
      filter.bids = { $elemMatch: { user: req.user.id } };
      const product = await ProductSchema.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sort)
      .exec();
      const total = await ProductSchema.countDocuments(filter);  
      return {total,page:Number.parseInt(page),lastpage:Math.ceil(total / limit),product,status:OK};
    } catch (error) {
      console.error(error);
      return {mess: "INTERNAL SERVER ERROR", status: INTERNAL_SERVER_ERROR };
    }
  },
  async MakeBid(auctionProductId, price, user_id) {
  
    try {
        const now = new Date();  
        const user = await UserSchema.findById({_id:user_id})
        const product = await ProductSchema.findOne({
            _id: auctionProductId,
            status: ProductStatus.AUCTIONING,
            start_time: { $lte: now },  
            end_time: { $gte: now } 
        });
        
        if (!product) return { mess: "Product not found or bidding period has ended.", status: NOT_FOUND }; 
        const { mess, status } = await this.validateProductAndPrice(product, price);
        if (mess) return { mess, status };
        const bid={ user: new mongoose.Types.ObjectId(user_id), price: price };
        product.bids.push(bid);
        await product.save();
        return { mess: "Bid placed successfully", status: OK,product,user,bid};
    } catch (error) {
        console.error(error);
        return { mess: "Internal server error", status: INTERNAL_SERVER_ERROR };
    }
  },

  validateProductAndPrice(product, price) {
    if (!product) {
      return {
        mess: "Product not found in ongoing auction",
        status: NOT_FOUND,
      };
    }
    if (product.end_time < new Date()) {
      return { mess: "The auction has ended.", status: BAD_REQUEST };
    }
    if (price == null || price == "") {
      return { mess: "Price is required", status: BAD_REQUEST };
    }
    const highestBidPrice = product.bids.reduce((highestPrice, currentBid) => {
      if (currentBid.price > highestPrice) {
        return currentBid.price;
      }
      return highestPrice;
    }, 0);
    const validPrice = highestBidPrice + product.step_price;
    if (price <= validPrice) {
      return {
        mess: "Price must be greater than base price plus step price",
        status: BAD_REQUEST,
      };
    }
    return { mess: "", status: OK };
  },

  async CheckoutCard(auctionProductId, user_id) {
    try {
      const product = await ProductSchema.findOne({
        _id: new mongoose.Types.ObjectId(auctionProductId),
        status: ProductStatus.AUCTIONING,
        end_time: { $lte: new Date()}
      });
      const { mess, status } = await this.validateProduct(product, user_id);
      if (mess != "") return { mess, status };
      const highestBidPrice = product.bids.reduce(
        (highestPrice, currentBid) => {
          if (
            currentBid.price > highestPrice &&
            currentBid.user.toString() == user_id
          ) {
            return currentBid.price;
          }
          return highestPrice;
        },
        0
      );
      const order = new OrderSchema();
      order.product = new mongoose.Types.ObjectId(auctionProductId);
      order.user = new mongoose.Types.ObjectId(user_id);
      order.status=OrderStatus.PENDING;
      order.save();
      return { mess: "CheckoutCard successfully", status: OK, highestBidPrice };
    } catch (error) {
      console.log(error);
      
      return { mess: "Internal server error", status: INTERNAL_SERVER_ERROR };
    }
  },
  
  validateProduct(product) {
    if (!product) {
      return { mess: "No auctioned products found", status: NOT_FOUND };
    }
    if (product.end_time > new Date()) {
      return { mess: "The auction is not over yet.", status: BAD_REQUEST };
    }
    return { mess: "", status: OK };
  },
};
module.exports = CustomerService;
