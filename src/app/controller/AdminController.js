const { json } = require("express");
const { AdminService } = require("../service");
const apq = require("api-query-params");
const { UserStatus } = require("../constant");
const { NOT_FOUND, OK, BAD_REQUEST, CONFLICT } = require("http-status-codes");

const AdminController = {
  async GetListUser(req,res) {
    // console.log(apq(req.query));

    const { filter, Page, limit,skip, email, phone, status } = apq(req.query);
    // console.log({ filter, Page, limit, email, phone, status });

    const result = await AdminService.GetListUser(filter, Page, limit,skip);

    return json("result");
  },

  async Banned(req,res) {
    const user_id = req.params.id;
    const result = await AdminService.Banned(user_id);
    console.log(result);
    return res.json(result);
  },
};
module.exports = AdminController;
