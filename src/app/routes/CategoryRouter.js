const express = require("express");
const router = express.Router();
const { CategoryController } = require("../controller");

router.get("/view", CategoryController.View);
router.post("/create", CategoryController.Create);
router.put("/update/:id", CategoryController.Update);
router.delete("/delete/:id", CategoryController.Delete);

module.exports = router;