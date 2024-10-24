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
 
  async searchProductsByName(req) {
    const { filter, limit, sort } = aqp(req.query);
    const { name } = req.params;
    try {
      filter.name= { $regex: name, $options: "i" }
      const products = await ProductSchema.find(filter).sort(sort)
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
