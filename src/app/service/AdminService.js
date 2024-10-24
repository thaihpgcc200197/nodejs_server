const { UserSchema, ProductSchema } = require("../schema");
const {
  BAD_REQUEST,
  NOT_FOUND,
  OK,
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
} = require("http-status-codes");
const aqp = require("api-query-params");
const { ProductStatus } = require("../constant");
const { default: mongoose } = require("mongoose");
const AdminService = {
  async GetListUser(req) {
    try {
      const { filter,sort } = aqp(req.query);
      const product = await UserSchema.find(filter).sort(sort).exec();
      return { product, status: OK };
    } catch (error) {
      console.error(error);
      return { mess: "INTERNAL SERVER ERROR", status: INTERNAL_SERVER_ERROR };
    }
  },

  async GetListProduct(req) {
    try {
      const { filter,sort } = aqp(req.query);

      const product = await ProductSchema.find(filter).sort(sort)
        .populate("user", "-password")
        .populate("bids.user")
        .exec();
      return { product, status: OK };
    } catch (error) {
      console.error(error);
      return { mess: "INTERNAL SERVER ERROR", status: INTERNAL_SERVER_ERROR };
    }
  },

  async Censor(auctionProductId, status) {
    try {
      const product = await ProductSchema.findById(auctionProductId);
      if (!product) return { mess: "Product not found", status: NOT_FOUND };
      if (status == ProductStatus.ACCEPT) {
        product.status = ProductStatus.ACCEPT;
        product.save();
        return { mess: "Product has been accepted successfully", status: OK };
      }
      if (status==ProductStatus.REFUSE) {
        product.status = ProductStatus.REFUSE;
        product.save();
        return { mess: "Product has been refuse successfully", status: OK };
      } else {
        return { mess: "Status product invalid", status:BAD_REQUEST };
      }
    } catch (error) {
      return { mess: error, status: BAD_REQUEST };
    }
  },
};

module.exports = AdminService;
