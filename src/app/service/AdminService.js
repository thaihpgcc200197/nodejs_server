const { UserSchema } = require("../schema");
const { BAD_REQUEST, NOT_FOUND, OK } = require("http-status-codes");
const { UserStatus } = require("../constant");
const AdminService = {
  async GetListUser(filter, Page, limit, skip) {
    // console.log(filter);
    const result = await UserSchema.find(filter).skip(skip).limit(limit);
    // console.log(result);
  },

  async Banned(user_id) {
    try {
      const user = await UserSchema.findOne({ _id: user_id });
      if (!user) {
        return { error: "User not found", code: NOT_FOUND };
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