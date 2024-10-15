const { UserSchema, ProductSchema } = require("../schema");
const {
  BAD_REQUEST,
  NOT_FOUND,
  OK,
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
} = require("http-status-codes");
const aqp = require("api-query-params");
const { UserStatus, Role, ProductStatus } = require("../constant");
const { default: mongoose } = require("mongoose");
const AdminService = {
  async GetListUser(req) {
    try {
      const { filter, limit, sort} = aqp(req.query,{blacklist:['page']});
      const {page} = req.query
      const product = await UserSchema.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sort)
      .exec();
      const total = await UserSchema.countDocuments(filter);  
      return {total,page:Number.parseInt(page),lastpage:Math.ceil(total / limit),product };
    } catch (error) {
      console.error(error);
      return {mess: "INTERNAL SERVER ERROR", status: INTERNAL_SERVER_ERROR };
    }
  },

  async GetListProduct(req) {
    try {
      const { filter, limit, sort} = aqp(req.query,{blacklist:['page']});
      const {page} = req.query
      const product = await ProductSchema.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sort)
      .populate('user','-password')
      .exec();
      const total = await ProductSchema.countDocuments(filter);  
      return {total,page:Number.parseInt(page),lastpage:Math.ceil(total / limit),product };
    } catch (error) {
      console.error(error);
      return {mess: "INTERNAL SERVER ERROR", status: INTERNAL_SERVER_ERROR };
    }
  },

  async Censor(user_id, auctionProductId, status) {
    try {
      const user = await UserSchema.findOne({
        _id: new mongoose.Types.ObjectId(user_id),
      });
      if (!user || user.role != Role.ADMIN) {
        return { error: "Admin only functions", code: UNAUTHORIZED };
      }
      const product = await ProductSchema.findOne({
        _id: new mongoose.Types.ObjectId(auctionProductId),
      });
      if (status == ProductStatus.ACCEPT) {
        product.status = ProductStatus.ACCEPT;
        product.save();
        return { success: "Product has been accepted successfully", code: OK };
      } else {
        product.status = ProductStatus.REFUSE;
        product.save();
        return { success: "Product has been refuse successfully", code: OK };
      }
    } catch (error) {
      return { error: error, code: BAD_REQUEST };
    }
  },

  async Banned(user_id) {
    try {
      const user = await UserSchema.findOne({ _id: user_id });
      if (!user || user.role != Role.ADMIN) {
        return { error: "Admin only functions", code: UNAUTHORIZED };
      }
      user.status = UserStatus.BANNED;
      user.save();
      return { success: "Account banned successfully", code: OK };
    } catch (error) {
      return { error: error, code: BAD_REQUEST };
    }
  },
};

module.exports = AdminService;
