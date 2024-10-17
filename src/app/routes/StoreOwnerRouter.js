const express=require('express')
const router=express.Router()
const {StoreOwnerController} = require('../controller')
const CategoryRouter = require("./CategoryRouter");
const { FileHandler } = require('../middleware');

router.use("/category",CategoryRouter);

router.post('/product/publish', StoreOwnerController.Publish)
router.post('/product/create', FileHandler().single("upload"),StoreOwnerController.Create)
router.put('/product/update/:id', FileHandler().single("upload"),StoreOwnerController.Update)
router.delete('/product/delete/:id',StoreOwnerController.Delete)

router.delete('/manage_order',StoreOwnerController.ManageOrder)
router.get('/list-order',StoreOwnerController.ListOrder)

router.get('/my-bid-statistics',StoreOwnerController.MyBidStatistics)
router.get('/my-activity-statistics',StoreOwnerController.MyActivityStatistics)
router.get('/winning-bid-statistics',StoreOwnerController.WinningBidStatistics)
router.get('/winning-bid-order',StoreOwnerController.WinningBidOrder)

module.exports = router;
