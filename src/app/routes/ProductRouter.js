/* 
Express ()
Auth
Role
Controller 
 */

const {Auth, FileHandler}=require('../middleware')
const express=require('express')
const route=express.Router()
const {ProductController} = require('../controller')
const { AUCTION_OWNER } = require('../constant/Role')

route.get('/list',ProductController.List)
route.get('/detail/:id',ProductController.Detail)

route.post('/create',Auth([AUCTION_OWNER]),FileHandler().single('file'),ProductController.Create)
route.put('/update/:id',Auth([AUCTION_OWNER]),FileHandler().single('file'),ProductController.Update)
route.delete('/delete/:id',Auth([AUCTION_OWNER]),ProductController.Delete)
module.exports=route

