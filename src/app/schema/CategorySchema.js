const mongoose = require("mongoose");
const { Schema } = mongoose;

const CategorySchema = new Schema(
  {
    user: { type: Schema.ObjectId, ref: "User", required: true },
    name: { type: String, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);
