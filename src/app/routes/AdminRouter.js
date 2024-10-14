const express = require('express')
const router=express.Router()
const {AdminController}=require('../controller')

router.get("/list-user",AdminController.GetListUser)
router.get("/list-product",AdminController.GetListProduct)
router.post("/censor",AdminController.Censor)
router.post("/banned/:id",AdminController.Banned)

module.exports=router