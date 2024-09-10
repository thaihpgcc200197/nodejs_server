/* 
Schema
Status
*/

const { NOT_FOUND, INTERNAL_SERVER_ERROR, OK, CREATED, NOT_ACCEPTABLE } = require("http-status-codes");
const { ProductSchema, CategorySchema } = require("../schema");
const { BytescaleUtil } = require("../../util");
const mongoose = require("mongoose");
const {ProductStatus} = require("../constant");

const ProductService = {
    async Create(name, category_id, start_price, step_price, user_id, file) {
    if (!category_id.match(/^[0-9a-fA-F]{24}$/)) {
      return { error: "Invalid Category id", status: NOT_FOUND };
    }
    const cate = await CategorySchema.findById({ _id: category_id });
    try {
      const { file_url, file_path } = await BytescaleUtil.Upload(file,"/upload");
      if (!cate) {
        return { error: "Category not found", status: NOT_FOUND };
      }
      const product = new ProductSchema({ name, cate: category_id, start_price, step_price,
         user: user_id, img_url: file_url, img_path: file_path,status:'processing'});
      return product.save();
    } catch (error) {
      return {error:error, status:INTERNAL_SERVER_ERROR}
    }
  },
  async Update(name,category_id,product_id,start_price,step_price,user_id,file  ) {
    if (!mongoose.isValidObjectId(category_id)) return { error: "Invalid Category id", status: NOT_FOUND };
    if (!mongoose.isValidObjectId(product_id)) return { error: "Invalid Product id", status: NOT_FOUND };
    const product = await ProductSchema.findById({ _id: product_id });
    if(!product) return { error: "Product not found", status: NOT_FOUND };
    if(product.user.toString()!=user_id){
      return { error: "You are not the author", status: UNAUTHORIZED };
    }
      try {
        if(file){
        BytescaleUtil.Delete(product.img_path)
        const {file_url , file_path} = await BytescaleUtil.Upload(file,"/upload")
        product.img_url = file_url
        product.img_path = file_path
        }
        product.name = name
        product.cate = new mongoose.Types.ObjectId(category_id)
        product.start_price=start_price;
        product.step_price=step_price;
        return product.save()
        } catch (error) {
          return {error:error, status:INTERNAL_SERVER_ERROR}
        }
  },
  async Delete(product_id, user_id) {
    try {
      const product = await ProductSchema.findById({ _id: product_id });
      if (!product || product.status == ProductStatus.DELETED) {
        return { error: "Product not found", status: NOT_FOUND};
      }
      if (user_id != product.user.toString()) {
        return { error: "You are not the author", status: UNAUTHORIZED };
      }
      if (product.status == ProductStatus.UP_FOR_AUCTION) {
        return { error: "It is not possible to delete a product while it is in auction.", status: NOT_ACCEPTABLE };
      }
      if (product.status == ProductStatus.HAS_BEEN_AUCTIONED) {
          product.status=ProductStatus.DELETED;
          product.save()
        return { success: "Delete product successfully", status: OK };
      }      
      BytescaleUtil.Delete(product.img_path);
      await ProductSchema.deleteOne({ _id: new mongoose.Types.ObjectId(product_id)});
      return { success: "Delete product successfully", status: OK };
    } catch (error) {
      return {error:error, status:INTERNAL_SERVER_ERROR}
    }
  },
};
module.exports = ProductService;
