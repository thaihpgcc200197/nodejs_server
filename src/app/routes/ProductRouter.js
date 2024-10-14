const {Auth, FileHandler}=require('../middleware')
const express=require('express')
const router=express.Router()
const {ProductController} = require('../controller')
const { STORE_OWNER: AUCTION_OWNER, CUSTOMER } = require('../constant/Role')

router.get('/list',ProductController.List)
router.get('/detail/:id',ProductController.Detail)
router.get('/search/:name', ProductController.Search)

module.exports=router

