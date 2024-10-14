const express = require("express");
const router = express.Router();
const { SecurityController } = require("../controller");
const { Auth } = require("../middleware");
const { Role } = require("../constant");

router.post("/login", SecurityController.Login);
router.post("/register",SecurityController.Register)
router.post("/change-pass-word",Auth([Role.ADMIN,Role.STORE_OWNER, Role.CUSTOMER]),SecurityController.ChangePassWord)


module.exports = router;
