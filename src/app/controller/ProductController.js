const { ProductService } = require("../service");
const aqp = require("api-query-params");

const ProductController = {

  async Search(req, res) {  
    const result = await ProductService.searchProductsByName(req);
    return res.json(result);
  },
  
  async List(req, res) {
    const result = await ProductService.listProduct(req);
    return res.json(result);
  },

  async Detail(req, res) {
    const {  id } = req.params;
    const result = await ProductService.Detail(id);
    return res.json(result);
  },
};
module.exports = ProductController;