const bcrypt = require("bcryptjs");
const salt = 10;
const HashUtil = {
  Hash(string) {
    return bcrypt.hash(string, salt);
  },
  Compare(string, hash) {
    return bcrypt.compare(string, hash);
  },
};

module.exports = HashUtil;
