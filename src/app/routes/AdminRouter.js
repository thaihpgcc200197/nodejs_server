const express = require('express')
const router=express.Router()
const {AdminController}=require('../controller')

router.get("/list-user",AdminController.GetListUser)
router.get("/list-product",AdminController.GetListProduct)
router.post("/censor",AdminController.Censor)

module.exports=router