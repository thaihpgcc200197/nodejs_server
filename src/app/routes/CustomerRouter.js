const express=require('express')
const router=express.Router()
const {CustomerController} = require('../controller')
router.post('/make-bid',CustomerController.MakeBid)
router.post('/checkout-card/:auctionProductId',CustomerController.CheckoutCart)

router.get('/view-auction-activity',CustomerController.ViewAuctionActivity)
router.get('/search-auction-activity',CustomerController.SearchAuctionActivity)
module.exports = router;