const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY: JWT_SECRET_KEY } = require("../env");
const JWT = {
  Create(object) {
    return jwt.sign(object, JWT_SECRET_KEY);
  },
  CreateWithExpire(object, expiresIn) {
    return jwt.sign(object, JWT_SECRET_KEY, { expiresIn });
  },
  Verify(token) {
    try {
      return jwt.verify(token, JWT_SECRET_KEY);
    } catch (error) {
      return false;
    }
  },
};

module.exports = JWT;
