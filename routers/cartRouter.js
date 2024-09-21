const router = require("express").Router()

const { 
      getUserCarts, 
      addToCart, 
      removeFromCart } = require("../controllers/cartController")

const authenticate = require("../auth/userAuth")

router.get("/get/cart", authenticate, getUserCarts)
router.post("/add/cart", authenticate, addToCart)
router.post("/remove/cart", authenticate, removeFromCart)


module.exports = router