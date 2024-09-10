const mongoose = require("mongoose");
const { UserStatus } = require("../constant");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    avatar: {
      path: { type: String, default: "default" },
      url: { type: String, default: "default" },
    },
    full_name: { type: String, require: true },
    email: { type: String, require: true },
    password: { type: String, require: true },
    phone: { type: String },
    birthday: { type: String },
    address: { type: String },
    role: { type: String, require: true },
    status: { type: String, default: UserStatus.VERIFYING },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
