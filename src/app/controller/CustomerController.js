const { CustomerService } = require("../service");
const CustomerController = {
  async MakeBid(req, res) {
    const { auctionProductId, price } = req.body;
    const user_id = req.user.id;
    const result = await CustomerService.MakeBid(
      auctionProductId,
      price,
      user_id
    );
    return res.json(result);
  },
  async CheckoutCart(req, res) {
    const { auctionProductId } = req.params;
    const user_id = req.user.id;
    const result = await CustomerService.CheckoutCard(
      auctionProductId,
      user_id
    );
    return res.json(result);
  },

  async ViewAuctionActivity(req, res) {
    const result = await CustomerService.ViewAuctionActivity(req);
    return res.json(result);
  },
  async SearchAuctionActivity(req, res) {
    const result = await CustomerService.SearchAuctionActivity(req);
    return res.json(result);
  },
};
module.exports = CustomerController;
