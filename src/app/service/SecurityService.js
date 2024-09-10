const { UserSchema } = require("../schema");
const { HashUtil, JWT } = require("../../util");
const { BAD_REQUEST, NOT_FOUND, OK } = require("http-status-codes");
const { UserStatus } = require("../constant");
const SecurityService = {
  async Login(email, pass) {
    const user = await UserSchema.findOne({ email });
    if (!user || user.status != UserStatus.ACTIVATED) {
      return { error: "user is verifying or banned", code: BAD_REQUEST };
    }
    const { _id, password, full_name, role } = user;
    const pass_valid = await HashUtil.Compare(pass, password);
    if (!pass_valid) {
      return { error: "wrong email or password", code: BAD_REQUEST };
    }
    const token = JWT.Create({ id: _id, email, full_name, role });
    return { token, code: OK };
  },

  async Register(email, f, p, cf_p) {
    if (p != cf_p) {
      return {
        error: "Password and confirm password not match",
        code: BAD_REQUEST,
      };
    }
    const user = await UserSchema.findOne({ email });
    if (user) {
      return {
        error: "Email has been used. Please choose another email!",
        code: BAD_REQUEST,
      };
    } else {
      const us = new UserSchema({
        email: email,
        full_name: f,
        password: await HashUtil.Hash(p),
        role: "customer",
      });
      return us.save();
    }
  },
};

module.exports = SecurityService;
