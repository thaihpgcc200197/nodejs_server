const { ProductService } = require("../service");
const { ProductSchema } = require("../schema");
const { json } = require("express");

const ProductController = {
  List(res) {
    return json();
  },
  Detail(res) {
    return json();
  },
  async Create(req, res) {
    const { name, category_id, start_price, step_price } = req.body;
    const file=req.file
    const user_id = req.user.id;
    const result = await ProductService.Create(name,category_id,start_price,step_price,user_id,file);
    return res.json(result);  
  },
  async Update(req, res) {
    const { name, category_id, start_price, step_price } = req.body;
    const file=req.file 
    const product_id=req.params.id;
    const user_id = req.user.id;
    
    const result = await ProductService.Update(name,category_id,product_id,start_price,step_price,user_id,file);
    return res.json(result);
  },
  async Delete(req, res) {
    const product_id=req.params.id;
    const user_id = req.user.id;
    const result=await ProductService.Delete(product_id,user_id)
    return res.json(result);
  },
};
module.exports = ProductController;