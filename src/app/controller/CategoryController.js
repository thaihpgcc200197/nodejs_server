const { json } = require("express");
const { CategoryService } = require("../service");
const CategoryController = {
  async Create(req, res) {
    const user_id = req.user.id;
    const { category_name } = req.body;
    return res.json(await CategoryService.Create(user_id, category_name))
  },
  async Update(req, res) {
    const user_id = req.user.id;
    const cate_id = req.params.id;
    const { category_name } = req.body;
    return res.json(await CategoryService.Update(user_id,cate_id,category_name))

  },
  async Delete(req, res) {
    const user_id = req.user.id;
    const cate_id = req.params.id;    
    // if xa cate used
    return res.json(await CategoryService.Delete(user_id, cate_id))
  },
  async View(req, res) {
    const user_id = req.user.id;    
    return res.json(await CategoryService.View(user_id))
  },
};
module.exports = CategoryController;