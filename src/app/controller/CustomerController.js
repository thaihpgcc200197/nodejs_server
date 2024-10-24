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
    const { auctionProductId,owner_id } = req.params;
    const user_id = req.user.id;
    const result = await CustomerService.CheckoutCard(
      auctionProductId,
      user_id,
      owner_id
    );
    return res.json(result);
  },
};
module.exports = CustomerController;
