import Product from "../models/product.model.js";
import User from "../../user/model/user.model.js";
import ApplicationError from "../../../ErrorHandler/ApplicationError.js";
export default class ProductController{
    static getAllProducts(req, res){
    
        Product.find()
        .then(products => {
            res.status(200).json({products})
        }).catch(err => {
            res.status(500).json({message:err.message})
        });
    }

    static addProduct(req, res){
        const {name,description,imageUrl,category,price,sizes} = req.body;
        const newProduct = {
            name,
            description,
            category,
            price:parseFloat(price),
            imageUrl: req.file.filename,
            sizes: sizes.split(',')
        };
        // res.status(201).json(newProduct);
        Product.create(newProduct)
        .then(product => {
            res.status(201).json({product})
        }).catch(err => {
            res.status(500).json({message:err.message})
        });
       
    }
    static async rateProduct(req, res) {
        try {
            const { productId, rating, userId } = req.query;
    
            const user = await User.findById(userId);
            if (!user) {
                throw new ApplicationError("User not found", 404)
            }
            const product = await Product.findById(productId);
            if (!product) {
                throw new ApplicationError("Product not found", 404)
            }
    
            if (!product.rating) {
                product.rating = [];
                product.rating.push({ user: userId, rating: parseInt(rating) });
                await product.save();
                return res.status(201).json({ message: 'Product rated successfully' });
            } else {
                const userRating = product.rating.find(r => r.user === userId);
                if (userRating) {
                    userRating.rating = parseInt(rating);
                    await product.save();
                    return res.status(201).json({ message: 'Existing rating updated successfully' });
                } else {
                    product.rating.push({ user: userId, rating: parseInt(rating) });
                    await product.save();
                    return res.status(201).json({ message: 'Product rated successfully' });
                }
            }
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
    



    static getOneProduct(req, res){
        Product.findById(req.params.id)
        .then(product => {
            res.status(200).json({product})
        }).catch(err => {
            res.status(500).json({message:err.message})
        });
    
    }

    static getFilterProducts(req, res){
        const {minPrice, maxPrice, category} = req.query;
        const filter = {
            price: { $gte: minPrice, $lte: maxPrice },
            category: category
          };
          
          
        Product.find(filter)
        .then(products => {
            console.log('Filtered Products:', products);
            res.status(201).json({products})
        }).catch(err => {
            res.status(500).json({message:err.message})
        });
    }

}