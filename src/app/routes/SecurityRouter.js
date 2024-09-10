const express = require("express");
const router = express.Router();
const { SecurityController } = require("../controller");

router.post("/login", SecurityController.Login);
router.post("/register",SecurityController.Register)


module.exports = router;
