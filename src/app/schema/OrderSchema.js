const mongoose = require("mongoose");
const { Schema } = mongoose;

const OrderSchema = new Schema(
  {
    user_id: { type: Schema.ObjectId, ref: "User", required: true },
    owner_id: { type: Schema.ObjectId, ref: "User", required: true },
    product: { type: Schema.ObjectId, ref: "Product", required: true },
    status: { type: String, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
