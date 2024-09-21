const router = require("express").Router()

const { 
       uploadProduct,
       getAllProducts, 
       searchForProducts, 
       getProductById, 
       updateProduct, 
       deleteProduct } = require("../controllers/storeFront")

const uploadFile = require("../media/productFiles")
const authenticate = require("../auth/userAuth")

router.post('/upload/product', authenticate, uploadFile.array('productImage', 10), uploadProduct)
router.get('/get_all/products', authenticate, getAllProducts)
router.get('/search/products', authenticate, searchForProducts)
router.get('/get/product/:productId', authenticate, getProductById)
router.put('/edit/product/:productId', authenticate, updateProduct)
router.delete('/delete/product/:productId', authenticate, deleteProduct)


module.exports = router