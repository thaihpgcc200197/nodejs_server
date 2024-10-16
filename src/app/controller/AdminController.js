const { json } = require("express");
const { AdminService } = require("../service");
const apq = require("api-query-params");
const { UserStatus } = require("../constant");
const { NOT_FOUND, OK, BAD_REQUEST, CONFLICT } = require("http-status-codes");

const AdminController = {
  async GetListUser(req, res) {
    const result = await AdminService.GetListUser(req);
    return res.json(result);
  },
  async GetListProduct(req, res) {
    const result = await AdminService.GetListProduct(req);
    return res.json(result);
  },
  async Censor(req, res) {
    const user_id = req.params.id;
    const { auctionProductId,  status} = req.body;
    const result = await AdminService.Censor(user_id,auctionProductId,status);
    console.log(result);
    return res.json(result);
  },
};
module.exports = AdminController;
