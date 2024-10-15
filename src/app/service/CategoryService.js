const {
  NOT_FOUND,
  OK,
  INTERNAL_SERVER_ERROR,
  NOT_ACCEPTABLE,
  CREATED,
  UNAUTHORIZED,
} = require("http-status-codes");
const { CategorySchema, ProductSchema } = require("../schema");
const { CategoryStatus } = require("../constant");
const CategoryService = {
  Create(user_id, name) {
    const new_cate = new CategorySchema({ user: user_id, name });
    return new_cate.save();
  },
  async Update(user_id, cate_id, category_name) {
    try {
      const cate = await CategorySchema.findById({ _id: cate_id });
      if (!cate) {
        return { mess: "Category not found", status: NOT_FOUND };
      }
      if (user_id != cate.user._id) {
        return {
          mess: "This function is only performed by the author",
          status: UNAUTHORIZED,
        };
      }
      cate.name = category_name;
      cate.save();
      return { mess: "The category has been updated successfully", status: OK };
    } catch (error) {
      return { mess: "INTERNAL SERVER ERROR", status: INTERNAL_SERVER_ERROR };
    }
  },
  async Delete(user_id, cate_id) {
    try {
      const cate = await CategorySchema.findById({ _id: cate_id });
      if (!cate) {
        return { mess: "Category not found", status: NOT_FOUND };
      }
      const cate_used = ProductSchema.find({ cate: cate_id });
      if (cate_used) {
        return { mess: "Category has been used", status: NOT_ACCEPTABLE };
      }
      if (user_id != cate.user._id) {
        return {
          mess: "This function is only performed by the author",
          status: UNAUTHORIZED,
        };
      }
      await CategorySchema.deleteOne(cate);
      return { mess: "The category has been updated successfully", status: OK };
    } catch (error) {
      return { mess: "INTERNAL SERVER ERROR", status: INTERNAL_SERVER_ERROR };
    }
  },
  async View(user_id) {
    try {
      const list_cate = await CategorySchema.find({
        user: user_id,
        status: { $ne: CategoryStatus.DELETED },
      }).populate("user", "-password");
      if (!list_cate) {
        return { mess: "Category not found", status: NOT_FOUND };
      } else {
        return list_cate;
      }
    } catch (error) {
      return { mess: "INTERNAL SERVER ERROR", status: INTERNAL_SERVER_ERROR };
    }
  },
};

module.exports = CategoryService;
