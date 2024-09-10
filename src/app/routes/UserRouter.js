const express = require("express");
const router = express.Router();
const { FileHandler, Auth } = require("../middleware");
const { UserController } = require("../controller");
const Role = require("../constant/Role");

router.put("/update-user",UserController.UpdateUser)
router.get("/view-profile-user",UserController.ViewProfileUser)

router.put(
  "/update-avatar",
  FileHandler().single("avatar"),
  UserController.UpdateAvatar
);

module.exports = router;