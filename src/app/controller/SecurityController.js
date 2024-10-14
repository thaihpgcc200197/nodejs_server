const { SecurityService } = require("../service");
const SecurityController = {
  async Login(req, res) {
    const { email, password } = req.body;
    const result = await SecurityService.Login(email, password);
    return res.json(result);
  },
  async Register(req, res) {    
    const {email,full_name,password,confirm_password} =req.body    
    const result= await SecurityService.Register(email,full_name,password,confirm_password);
    return res.json(result)
  },
  async ChangePassWord(req, res) {    
    const {old_password,new_password,confirm_password} =req.body
    const result= await SecurityService.ChangePassWord(old_password,new_password,confirm_password, req.user.id);
    return res.json(result)
  },
};

module.exports = SecurityController;
