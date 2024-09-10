const express = require("express");
const router = express.Router();
const UserRouter = require("./UserRouter");
const AdminRouter = require('./AdminRouter')
const SecurityRouter = require("./SecurityRouter");
const CategoryRouter = require("./CategoryRouter");
const ProductRouter = require("./ProductRouter");
const { Auth } = require("../middleware");
const { Role } = require("../constant");

router.use("/security", SecurityRouter);
router.use("/product",ProductRouter)
router.use("/admin",Auth([Role.ADMIN]), AdminRouter);
router.use("/category",Auth([Role.AUCTION_OWNER]),CategoryRouter);
router.use("/user",Auth([Role.ADMIN,Role.AUCTION_OWNER, Role.CUSTOMER]), UserRouter);

module.exports = router;
