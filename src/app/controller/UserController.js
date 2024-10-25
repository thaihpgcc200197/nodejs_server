const { json } = require("express");
const { UserService } = require("../service");
const UserController = {
 async UpdateAvatar(req, res) {
    
    return  res.json( await UserService.UpdateAvatar(req.user.id, req.file));
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
  async ViewProfileUser(req,res) {
    const result = await UserService.ViewProfileUser(req);
    console.log(result);
    return res.json(result);
  },
};
module.exports = UserController;
