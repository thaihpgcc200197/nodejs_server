const mongoose = require("mongoose");
const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    user: { type: Schema.ObjectId, ref: "User", required: true },
    cate: { type: Schema.ObjectId, ref: "Category", required: true },
    name: { type: String, require: true },
    img_url: { type: String, require: true },
    img_path: { type: String, require: true },
    start_time: { type: String, require: true },
    end_time: { type: String, require: true },
    step_price: { type: Number, require: true },
    start_price: { type: Number, require: true },
    quantity: { type: String, require: true },
    status: { type: String, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);