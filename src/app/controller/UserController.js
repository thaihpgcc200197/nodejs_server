const { json } = require("express");
const { UserService } = require("../service");
const UserController = {
  UpdateAvatar(req, res) {
    return res.json(UserService.UpdateAvatar(req.user.id, req.file));
  },
  async UpdateUser(req, res) {
    const { full_name, phone, birthday, address } = req.body;
    const result = await UserService.UpdateUser(
      full_name,
      phone,
      birthday,
      address,
      req
    );
    console.log(result);
    return json(result);
  },
  async ViewProfileUser(req) {
    const result = await UserService.ViewProfileUser(req);
    console.log(result);
    return json(result);
  },
};
module.exports = UserController;
