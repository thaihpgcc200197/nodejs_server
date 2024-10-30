const { BytescaleUtil } = require("../../util");
const { UserSchema } = require("../schema");
const { NOT_FOUND } = require("http-status-codes");
const UserService = {
  async UpdateAvatar(user_id, file) {
    const user = await UserSchema.findById(user_id);
    if (!user) {
      return { error: "user not found", code: NOT_FOUND };
    }
    const { file_url, file_path } = await BytescaleUtil.Upload(file, "/upload");
    console.log(user);

    if (user.avatar.path != "default") {
      BytescaleUtil.Delete(user.avatar.path);
    }
    user.avatar.path = file_path;
    user.avatar.url = file_url;
    console.log(user);
    return user.save();
  },

  async UpdateUser(full_name, phone, address, req) {
    const result = await UserSchema.findByIdAndUpdate(
      req.user.id,
      { full_name, phone, address },
      { new: true, runValidators: true }
    );
    return result;
  },

  async ViewProfileUser(req) {
    const user = await UserSchema.findOne({ _id: req.user.id }).select('-password');
    return user;
  },
};
module.exports = UserService;
