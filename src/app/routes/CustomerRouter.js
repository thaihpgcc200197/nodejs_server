const express=require('express')
const router=express.Router()
const {CustomerController} = require('../controller')
router.post('/make-bid',CustomerController.MakeBid)
router.post('/checkout-card/:auctionProductId',CustomerController.CheckoutCart)

module.exports = router;