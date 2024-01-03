import CartModel from "./cartitems.model.js"
export default class  CartController{

    static async addProductToCart(req,res,next){
        const {productId, quantity} = req.query;
        const userId = req.user.id;
        try{
            
            const cart = await CartModel.findOne({user: userId});
            if(cart){
                const product = cart.products.find((p)=> p.product == productId)
                if(product){
                    product.quantity += Number(quantity);
                    await cart.save();
                    res.status(201).json({
                        message: 'Product added to cart',
                        data: cart
                    })
                }
                else{
                    cart.products.push({product: productId, quantity: quantity})
                    await cart.save();
                    res.status(201).json({
                        message: 'Product added to cart',
                        data: cart
                    })
                }
            }
            else{
                const cart = await CartModel.create({user: userId, products: [{product: productId, quantity: quantity}]});
                res.status(201).json({
                    message: 'Product added to cart',
                    data: cart
                })
            }
        }catch(err){
            console.error(err);
        }
    }


    static async getCartItems(req,res,next){
        const userId = req.user.id;
        try{
            const cartItems = await CartModel.find({user: userId})
            if(cartItems){
                res.status(200).json({
                    message: 'Cart Items fetched successfully',
                    data: cartItems
                })
            }
            else{
                res.status(400).json({
                    message: 'Cart Items not found'
                })
            }
        }
        catch(err){
            console.error(err);
        }

    }

    static async deleteCartItem(req,res,next){
        const userId = req.user.id;
        const cart = await CartModel.findOne({user: userId});
        const productId = req.params.id;

        if(cart){
            const product = cart.products.find((p)=> p.product == productId)
            if(product){
                cart.products.pull(product);
                await cart.save();
                res.status(200).json({
                    message: 'Product deleted from cart',
                    data: cart
                })
            }
            else{
                res.status(400).json({
                    message: 'Product not found in cart'
                })
            }
        }
        else{
            res.status(400).json({
                message: 'Cart not found'
            })
        }
    }
}