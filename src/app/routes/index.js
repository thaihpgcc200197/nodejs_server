const express = require("express");
const router = express.Router();
const UserRouter = require("./UserRouter");
const AdminRouter = require('./AdminRouter')
const SecurityRouter = require("./SecurityRouter");
const ProductRouter = require("./ProductRouter");
const StoreOwnerRouter = require("./StoreOwnerRouter");
const CustomerRouter = require("./CustomerRouter");
const { Auth } = require("../middleware");
const { Role } = require("../constant");

router.use("/security", SecurityRouter);
router.use("/product",ProductRouter)
router.use("/admin",Auth([Role.ADMIN]), AdminRouter);
router.use("/store-owner",Auth([Role.CUSTOMER,Role.STORE_OWNER]), StoreOwnerRouter);
router.use("/customer",Auth([Role.CUSTOMER,Role.STORE_OWNER]), CustomerRouter);  

router.use("/user",Auth([Role.ADMIN,Role.STORE_OWNER, Role.CUSTOMER]), UserRouter);
module.exports = router;