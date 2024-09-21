const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")
const userModel = require("../models/userModel")



exports.getUserCarts = async(req, res)=>{
  try {
    const id = req.user.userId
    let cart = await cartModel.findOne({ buyer:id })


    if (!cart) {
      cart = new cartModel({
         buyer: id,
          items: []
    })
      await cart.save()
    }

    return res.status(201).json({
      Cart: cart
    })

  } catch (error) {
    return res.status(500).json({
      error: error.message
    })
  }
}


exports.addToCart = async (req, res) => {
  try {
    const buyerId = req.user.userId
    const { productId } = req.body
    const quantity = 1 

    const user = await userModel.findById(buyerId)
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      })
    }

    const product = await productModel.findById(productId)
    if (!product) {
      return res.status(404).json({ 
        message: 'Product not found' 
      })
    }

    let cart = await cartModel.findOne({ buyer: buyerId })
    if (!cart) {
      cart = new cartModel({
         buyer: buyerId,
        items: [], 
        totalPrice: 0 
      })
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId)

    if (itemIndex > -1) {
      const currentQuantity = cart.items[itemIndex].quantity

      if (currentQuantity + quantity > product.availableStock) {
        return res.status(400).json({
           message: 'Not enough stock available' 
        })
      }

      cart.items[itemIndex].quantity += quantity
      cart.totalPrice += product.price

    } else {
      if (quantity > product.availableStock) {
        return res.status(400).json({
           message: 'Out of stock' 
          })
      }

      cart.items.push({ product: productId, quantity: quantity })
      cart.totalPrice += product.price * quantity
    }
    await cart.save()

    res.status(200).json({
       Cart: cart 
      })

  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    })
  }
}


exports.removeFromCart = async (req, res) => {
  try {
    const buyerId = req.user.userId
    const { productId } = req.body

    const cart = await cartModel.findOne({ buyer: buyerId })
    if (!cart) {
      return res.status(404).json({
         message: 'Cart not found' 
        })
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId)
    if (itemIndex === -1) {
      return res.status(404).json({ 
        message: 'No item in cart' 
      })
    }

    const product = await productModel.findById(productId)
    if (!product) {
      return res.status(404).json({
         message: 'Product not found' 
        })
    }

    const quantityToRemove = cart.items[itemIndex].quantity

    cart.totalPrice -= product.price * quantityToRemove

    cart.items.splice(itemIndex, 1)
    await cart.save()

    res.status(200).json({
      Cart: cart 
    })

  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    })
  }
}