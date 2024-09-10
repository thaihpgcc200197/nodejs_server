const { BytescaleUtil } = require("../../util");
const { UserSchema } = require("../schema");
const { NOT_FOUND } = require("http-status-codes");
const UserService = {
  async UpdateAvatar(user_id, file) {
    const user = UserSchema.findById(user_id);
    if (!user) {
      return { error: "user not found", code: NOT_FOUND };
    }
    const { file_url, file_path } = await BytescaleUtil.Upload(file, "/upload");
    if (user.avatar.path != "default") {
      BytesaleUtcil.Delete(user.avatar.path);
    }
    user.avatar.path = file_path;
    user.avatar.url = file_url;
    return user.save();
  },

  async UpdateUser(full_name, phone, birthday, address, req) {
    const result = await UserSchema.findByIdAndUpdate(
      req.user.id,
      { full_name, phone, birthday, address },
      { new: true, runValidators: true }
    );
    return result;
  },

  async ViewProfileUser(req) {
    const { full_name, email, address, birthday, phone } =
      await UserSchema.findOne({ _id: req.user.id });
    return { full_name, email, address, birthday, phone };
  },
};
module.exports = UserService;
