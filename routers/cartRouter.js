const router = require("express").Router()

const { 
      addToCart, 
      getUserCarts, 
      removeItem } = require("../controllers/cartController")

const authenticate = require("../auth/userAuth")

router.post("/add/cart", authenticate, addToCart)
router.get("/get/carts", authenticate, getUserCarts)
router.post("/remove/cart/:itemId", authenticate, removeItem)


module.exports = router