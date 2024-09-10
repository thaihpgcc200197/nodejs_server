//express
//route => express
//Auth
//Role
//Controller
const express = require('express')
const router=express.Router()
const {AdminController}=require('../controller')

router.get("/list",AdminController.GetListUser)
router.get("/banned/:id",AdminController.Banned)

module.exports=router