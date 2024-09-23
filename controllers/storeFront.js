const productModel = require("../models/productModel")
const userModel = require("../models/userModel")
const cloudinary = require("../media/cloudinary")
const fs = require("fs")



exports.uploadProduct = async(req, res)=> {
    try {
        const id = req.user.userId
        const { productName, description, price, category, availableStock } = req.body

        const user = await userModel.findById(id)
        if (!user) {
            return res.status(404).json({
                message: "user not found"
            })
        }

        if (!productName || !description || !price || !category || !availableStock) {
          return res.status(400).json({ message: 'Please add all required fields' })
         }

         let Images = []
         if (req.files && req.files.length > 0) {
             try {
                Images = await Promise.all(req.files.map(async (file) => {
                     const result = await cloudinary.uploader.upload(file.path, { resource_type:'image'})
 
                     // Delete the file from local storage
                     fs.unlink(file.path, (err) => {
                         if (err) {
                             console.error('Failed to delete local file', err)
                         }
                     })
 
                     return result.secure_url
                 }))
             } catch (uploadError) {
                 return res.status(500).json({
                     error: "Error uploading files."
                 })
             }
         }
 
         // Validate that at least one of text or media is present
         if (Images.length === 0) {
             return res.status(400).json({
                 error: "Upload images of the products"
             })
         }
      
        const newProduct = await productModel.create({
            productName: productName.toLowerCase().charAt(0).toUpperCase() + productName.slice(1),  
            owner: id,
            price,
            description: description.toLowerCase().charAt(0).toUpperCase() + description.slice(1),
            availableStock, 
            productImage: Images,
            category: category.toLowerCase().charAt(0).toUpperCase() + category.slice(1)
        })
      
        return res.status(201).json(newProduct)

    } catch (error) {
        res.status(500).json({
            error: error.message
       })
    }
}


exports.getAllProducts = async (req, res) => {
    try {

        const allProducts = await productModel.find()
        if (allProducts.length === 0) {
            return res.status(404).json({
                error: "No products found"
            })
        }

        const products = allProducts.map(product => ({
            id: product._id,    
            productName: product.productName,    
            owner: product.owner,
            description: product.description,
            availableStock: product.availableStock, 
            productImage: product.productImage,
            price: product.price,
            category: product.category,
        }))
        
        return res.status(200).json({
            products
        })

    } catch (error) {
        res.status(500).json({
            error: error.message
        }) 
    }
}


exports.searchForProducts = async (req, res) => {
    try {
        const { searchProducts } = req.body

        if (!searchProducts) {
            return res.status(400).json({
                error: "Input the product to search for"
            })
        }

        const regex = new RegExp(searchProducts, 'i') 

        const products = await productModel.find({
            $or: [
                { productName: regex },
                { category: regex }
            ]
        })

        if (products.length === 0) {
            return res.status(404).json({
                message: "No products found"
            })
        }

        const formattedProducts = products.map(product => ({
            id: product._id,    
            productName: product.productName,
            owner: product.owner,
            description: product.description,
            availableStock: product.availableStock,
            productImage: product.productImage,
            price: product.price,
            category: product.category
        }))

        return res.status(200).json({
            products: formattedProducts
        })

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}


exports.getProductById = async(req, res)=>{
    try {
        const {productId} = req.params

        const product = await productModel.findById(productId)

        if (!product) {
            return res.status(404).json({
                message: "product not found"
            })
        } else {
            return res.status(200).json({
                id: product._id,    
                productName: product.productName,
                owner: product.owner,
                description: product.description,
                availableStock: product.availableStock,
                productImage: product.productImage,
                price: product.price,
                category: product.category
            })
        }
        
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}


exports.updateProduct = async (req, res) => {
    try {
        const id = req.user.userId
        const { productId } = req.params
        const { description, price, availableStock } = req.body

        const product = await productModel.findById(productId)
        if (!product) {
            return res.status(404).json({
                error: "Product not found"
            })
        }

        if (product.owner.toString() !== id) {
            return res.status(403).json({
                error: "Unauthorized."
            })
        }

        const updateFields = {}
        if (description !== undefined && description !== "") updateFields.description = description
        if (price !== undefined && price !== "" && !isNaN(price)) {
            updateFields.price = Number(price)
        }
        if (availableStock !== undefined && availableStock !== "") updateFields.availableStock = availableStock

        if (Object.keys(updateFields).length > 0) {
            const updatedProduct = await productModel.findByIdAndUpdate(productId, updateFields, { new: true })
            return res.status(200).json(updatedProduct)
        }

        return res.status(200).json(product)

    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}


exports.deleteProduct = async (req, res) => {
    try {
        const userId = req.user.userId
        const { productId } = req.params

        const product = await productModel.findById(productId)
        if (!product) {
            return res.status(404).json({
                error: "Product not found."
            })
        }

        if (product.owner.toString() !== userId) {
            return res.status(403).json({
                error: "Unauthorized."
            })
        }

        if (product.productImage && product.productImage.length > 0) {
            await Promise.all(product.productImage.map(async (productUrl) => {
                const publicId = productUrl.split("/").pop().split(".")[0]
                const resourceType = productUrl.includes('image') ? 'image' : 'raw'
                await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
            }))
        }

        const deletedProduct = await productModel.findByIdAndDelete(productId)
        if (!deletedProduct) {
            return res.status(400).json({
                error: "Unable to delete product."
            })
        }

        return res.status(200).json({
            message: "Product successfully deleted."
        })

    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}