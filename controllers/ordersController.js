const orderModel = require("../models/orderModels")
const cartModel = require("../models/cartModel")



exports.checkOut = async(req, res)=>{
  try {
    
  } catch (error) {
    return res.status(500).json({
      error: error.message
    })
  }
}

exports.placeOrders = async(req, res)=>{
  try {
    const id = req.user.userId


    const cart = await cartModel.findOne({buyer: id})
  } catch (error) {
    return res.status(500).json({
      error: error.message
    })
  }
}



// Place an order
router.post('/orders', async (req, res) => {
    const { userId } = req.body;
  
    try {
      const cart = await Cart.findOne({ userId }).populate('items.productId');
      
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }
  
      const orderItems = cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.productId.price, // Get the price at the time of order
      }));
  
      const totalAmount = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
      const newOrder = new Order({ userId, items: orderItems, totalAmount });
      await newOrder.save();
  
      // Optionally, clear the user's cart after placing the order
      await Cart.deleteOne({ userId });
  
      res.status(201).json(newOrder);
    } catch (error) {
      res.status(500).json({ message: 'Error placing order' });
    }
  });
  