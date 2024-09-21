const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")
const userModel = require("../models/userModel")



exports.addToCart = async (req, res) => {
    try {
      const buyerId = req.user.userId 
      const { itemId } = req.body 
      const quantity = 1
  
      const user = await userModel.findById(buyerId)
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        })
      }
  
      const product = await productModel.findById(itemId)
      if (!product) {
        return res.status(404).json({
          message: 'Product not found',
        })
      }
  
      if (product.availableStock < quantity) {
        return res.status(400).json({
          message: 'Not enough stock available',
        })
      }
  
      let cartItem = await cartModel.findOne({ buyer: buyerId, product: itemId })
  
      if (cartItem) {
        cartItem.quantity += 1
      } else {
        cartItem = new cartModel({
          buyer: buyerId,
          product: itemId,
          quantity: 1,
        })
      }
  
      await cartItem.save()
  
      return res.status(200).json({
        message: "Cart successfully added",
        cart: cartItem,
      })
  
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      })
    }
  }


exports.getUserCarts = async (req, res) => {
    try {
        const id = req.user.userId

        // Retrieve all cart for the user
        const carts = await cartModel.find({ buyer: id })
        if (carts.length === 0) {
            return res.status(404).json({
                message: "No carts found"
            })
        }

        return res.status(200).json(carts)

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}


exports.removeItem = async (req, res) => {
    try {
        const buyerId = req.user.userId
        const { itemId } = req.params 

        const cart = await cartModel.findOne({_id: itemId, buyer: buyerId })
        if (!cart) {
            return res.status(404).json({
                message: 'Cart not found',
            })
        }

        const removeCart = await cartModel.findByIdAndDelete(itemId)
        if (!removeCart) {
            return res.status(400).json({
                message: 'Unable to delete cart',
            })
        }
        
        return res.status(200).json({
            message: 'Cart has been deleted successfully',
        })

    } catch (error) {
        return res.status(500).json({
            error: error.message,
        })
    }
}