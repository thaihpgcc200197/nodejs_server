const {
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  OK,
  CREATED,
  NOT_ACCEPTABLE,
  BAD_REQUEST,
} = require("http-status-codes");
const { ProductSchema, CategorySchema } = require("../schema");
const { BytescaleUtil } = require("../../util");
const mongoose = require("mongoose");
const { ProductStatus } = require("../constant");
const aqp = require("api-query-params");

const ProductService = {
  async makeBid(auctionProductId, price, user_id) {
    try {
      const product = await ProductSchema.findOne({
        _id: auctionProductId,
        status: ProductStatus.AUCTIONING,
      });
      const { mess, status } = await this.validateProductAndPrice(
        product,
        price
      );
      if (mess != "") {
        return { mess, status };
      }
      product.bids.push({
        user: new mongoose.Types.ObjectId(user_id),
        price: price,
      });
      await product.save();
      return { mess: "Bid placed successfully", status: OK };
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
    }, product.start_price);
    const validPrice = highestBidPrice + product.step_price;
    if (price <= validPrice) {
      return {
        mess: "Price must be greater than base price plus step price",
        status: BAD_REQUEST,
      };
    }
    return { mess: "", status: OK };
  },

  async searchProductsByName(name) {
    try {
      const products = await ProductSchema.find({
        name: { $regex: name, $options: "i" },
      })
        .populate("cate")
        .populate("user")
        .populate("bids.user");
      return { mess: "Products search successfully", status: OK, products };
    } catch (error) {
      console.error(error);
      return { mess: "INTERNAL SERVER ERROR", status: INTERNAL_SERVER_ERROR };
    }
  },

  async listProduct(req) {
    try {
      const { filter, limit, sort } = aqp(req.query, {
        blacklist: ["page", "status"],
      });
      filter.status = ProductStatus.AUCTIONING;
      const { page } = req.query;
      const product = await ProductSchema.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort(sort)
        .populate("cate")
        .populate("user")
        .populate("bids.user")
        .exec();
      const total = await ProductSchema.countDocuments(filter);
      return {
        total,
        page: Number.parseInt(page),
        lastpage: Math.ceil(total / limit),
        product,
      };
    } catch (error) {
      console.error(error);
      return { mess: "INTERNAL SERVER ERROR", status: INTERNAL_SERVER_ERROR };
    }
  },

  async Detail(_id) {
    try {
      const product = await ProductSchema.findOne({
        _id: new mongoose.Types.ObjectId(_id),
      })
        .populate("cate")
        .populate("user")
        .populate("bids.user");
      if (!product) return { mess: "Product not found", statusCode: NOT_FOUND };
      return { product, statusCode: OK };
    } catch (error) {
      console.error(error);
      return {
        mess: "Internal server error",
        statusCode: INTERNAL_SERVER_ERROR,
      };
    }
  },
};
module.exports = ProductService;
