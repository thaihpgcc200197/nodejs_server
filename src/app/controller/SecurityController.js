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
};

module.exports = SecurityController;
