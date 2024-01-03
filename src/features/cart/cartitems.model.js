import mongoose from "mongoose"

const cartItemSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    products:[{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
}, { timestamps: true });

const CartModel = mongoose.model('CartModel', cartItemSchema);

export default CartModel;

