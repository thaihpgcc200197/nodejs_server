const { StoreOwnerService } = require("../service");
const aqp = require("api-query-params");

const StoreOwnerController = {
  async WinningBidStatistics(req, res) {
    const result = await StoreOwnerService.WinningBidStatistics(req); 
    return res.json(result);
  },
  async WinningBidOrder(req, res) {
    const result = await StoreOwnerService.WinningBidOrder(req); 
    return res.json(result);
  },
  async MyBidStatistics(req, res) {
    const result = await StoreOwnerService.MyBidStatistics(req); 
    return res.json(result);
  },
  async MyActivityStatistics(req, res) {
    const result = await StoreOwnerService.MyActivityStatistics(req); 
    return res.json(result);
  },

  async UpdateOrderStatus(req, res) {
    const {  product_id } = req.params;
    const { status } = req.body; 
    const result = await StoreOwnerService.UpdateOrderStatus(product_id,status); 
    return res.json(result);
  },
 
  async Publish(req, res) {
    const { auctionProductId, start_time,end_time } = req.body; 
    const result = await StoreOwnerService.Publish(auctionProductId,start_time,end_time); 
    return res.json(result);
  },
  async List(req, res) {
    const result = await StoreOwnerService.listProduct(req);
    return res.json(result);
  },

  async Detail(req, res) {
    const {  id } = req.params;
    const result = await StoreOwnerService.Detail(id);
    return res.json(result);
  },
  async Create(req, res) {
    const { name, category_id, start_price, step_price,quantity } = req.body;
    const file=req.file
    const user_id = req.user.id;
    const result = await StoreOwnerService.Create(name,category_id,start_price,step_price,user_id,file,quantity);
    return res.json(result);  
  },
  async Update(req, res) {
    const { name, category_id, start_price, step_price,quantity } = req.body;
    const file=req.file 
    const product_id=req.params.id;
    const user_id = req.user.id;
    const result = await StoreOwnerService.Update(name,category_id,product_id,start_price,step_price,user_id,file,quantity);
    return res.json(result);
  },
  async Delete(req, res) {
    const product_id=req.params.id;
    const user_id = req.user.id;
    const result=await StoreOwnerService.Delete(product_id,user_id)
    return res.json(result);
  },
};
module.exports = StoreOwnerController;