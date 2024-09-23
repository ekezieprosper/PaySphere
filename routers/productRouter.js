const router = require("express").Router()

const { 
       uploadProduct,
       getAllProducts, 
       searchForProducts, 
       getProductById, 
       updateProduct, 
       deleteProduct,
       getAllProductsOfTheUser} = require("../controllers/storeFront")

const uploadFile = require("../media/productFiles")
const authenticate = require("../auth/userAuth")

router.post('/upload/product', authenticate, uploadFile.array('productImage', 5), uploadProduct)
router.get('/get_all/products', getAllProducts)
router.get("/products/owner/:ownerId", getAllProductsOfTheUser)
router.get('/search/products', searchForProducts)
router.get('/get/product/:productId', getProductById)
router.put('/edit/product/:productId', authenticate, updateProduct)
router.delete('/delete/product/:productId', authenticate, deleteProduct)


module.exports = router