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
        product.bids.push({ user: new mongoose.Types.ObjectId(user_id), price: price });
        await product.save();
        const bid = product.bids[product.bids.length - 1]
        bid.user=user;
        return { mess: "Bid placed successfully", status: OK,product,bid};
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

  async CheckoutCard(auctionProductId, user_id,owner_id) {
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
      order.user_id = new mongoose.Types.ObjectId(user_id);
      order.owner_id = new mongoose.Types.ObjectId(owner_id);
      order.status=OrderStatus.PENDING;
      await order.save();
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
