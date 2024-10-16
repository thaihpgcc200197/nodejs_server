const { UserSchema } = require("../schema");
const { HashUtil, JWT } = require("../../util");
const { BAD_REQUEST, OK, INTERNAL_SERVER_ERROR, NOT_FOUND } = require("http-status-codes");
const { UserStatus } = require("../constant");
const SecurityService = {
  async Login(email, pass) {
    const user = await UserSchema.findOne({ email });
    if (!user || user.status != UserStatus.ACTIVATED) {
      return { mess: "user is verifying or banned", status: BAD_REQUEST };
    }
    const { _id, password, full_name, role } = user;
    const pass_valid = await HashUtil.Compare(pass, password);
    if (!pass_valid) {
      return { mess: "wrong email or password", status: BAD_REQUEST };
    }
    const token = JWT.Create({ id: _id, email, full_name, role });
    return { toke,role, status: OK };
  },
  async ChangePassWord(old_password, new_password, confirm_password, user_id) {
    try {
      const user = await UserSchema.findOne({ _id: user_id });
      if (!user ) return  {mess: "User not found", status:NOT_FOUND}
      if( new_password != confirm_password) return {mess: "Password and confirm password not match", status:BAD_REQUEST}
      if (old_password != user.password ) return  {mess: "wrong password", status:BAD_REQUEST}
      
      user.password = await HashUtil.Hash(new_password);
      user.save();
      return { mess: "Change password successful", status: OK };
    } catch (error) {
      return { mess: "Internal server error", status: INTERNAL_SERVER_ERROR };
    }
  },

  async Register(e, f, p, cf_p) {
    try {
      if (p != cf_p) {
        return {
          mess: "Password and confirm password not match",
          status: BAD_REQUEST,
        };
      }
      const user = await UserSchema.findOne({ email: e });
      if (user) {
        return {
          mess: "Email has been used. Please choose another email!",
          status: BAD_REQUEST,
        };
      }
      const us = new UserSchema({
        email: e,
        full_name: f,
        password: await HashUtil.Hash(p),
        role: "customer",
      });
      const result= await us.save();
      return {result,status:OK}
    } catch (error) {
      return { mess: "Internal server error", status: INTERNAL_SERVER_ERROR };
    }
  },
};

module.exports = SecurityService;
