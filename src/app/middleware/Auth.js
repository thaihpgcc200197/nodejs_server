const { UNAUTHORIZED } = require("http-status-codes");
const { JWT } = require("../../util");
const Auth = (roles) => {
  return (req, res, next) => {
    const bearer_token = req.headers["authorization"];
    if (!bearer_token) {
      console.log(1);
      return res.json({ code: UNAUTHORIZED, errors: "UNAUTHORIZED" });
    }
    const token = bearer_token.split(" ");
    if (token[0] != "Bearer") {
      // console.log(token[0]);
      console.log(2);
      return res.json({ code: UNAUTHORIZED, errors: "UNAUTHORIZED" });
    }

    const user = JWT.Verify(token[1]);
    if (!user || !roles.includes(user.role)) {
      // console.log(user);

      console.log(3);
      return res.json({ code: UNAUTHORIZED, errors: "UNAUTHORIZED" });
    }

    req.user = user;
    
    next();
  };
};
module.exports = Auth;