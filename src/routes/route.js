const express = require('express');
const router = express.Router();
const { createUser, login, getProfile, updateUser} = require('../controllers/userController')
const { createProduct, getProductByQuery, getProductsById, updateProduct, deleteProduct} = require('../controllers/productController')
const {createCart, updatecart, getCart, deleteCart} = require('../controllers/cartController')
const { createorder, updateorder } = require('../controllers/orderController')
const { authentication } = require('../middleware/auth')


//------- user api --------//

router.post("/register",  createUser)

router.post("/login", login)

router.get("/user/:userId/profile", authentication,  getProfile)

router.put("/user/:userId/profile", authentication,updateUser )


//------- product api --------//

router.post("/products", createProduct )

router.get("/products", getProductByQuery )

router.get("/products/:productId", getProductsById)

router.put("/products/:productId", updateProduct )

router.delete("/products/:productId", deleteProduct)


//------------ cart api ---------//

router.post("/users/:userId/cart", authentication,  createCart )

router.put("/users/:userId/cart", authentication,  updatecart )

router.get("/users/:userId/cart", authentication,  getCart )

router.delete("/users/:userId/cart", authentication, deleteCart )


//------------ order api ---------//

router.post("/users/:userId/orders", authentication,  createorder )

router.put("/users/:userId/orders", authentication, updateorder )


module.exports = router;   