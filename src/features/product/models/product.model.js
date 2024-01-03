import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    sizes: {
        type: Array,
        required: true
    },
    rating:{
        type: Array,
        required: false
    }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// Check if there are any documents in the Product collection
Product.countDocuments()
    .then(count => {
        if (count === 0) {
            // Default products to be created only if no documents exist
            const products = [
                { name: 'Product 1', description: 'This is product 1', imageUrl: 'https://picsum.photos/200', category: 'category1', price: 100, sizes: ['S', 'M', 'L'] },
                { name: 'Product 2', description: 'This is product 2', imageUrl: 'https://picsum.photos/200', category: 'category2', price: 200, sizes: ['S', 'M', 'L'] },
                { name: 'Product 3', description: 'This is product 3', imageUrl: 'https://picsum.photos/200', category: 'category3', price: 300, sizes: ['S', 'M', 'L'] },
                { name: 'Product 4', description: 'This is product 4', imageUrl: 'https://picsum.photos/200', category: 'category4', price: 400, sizes: ['S', 'M', 'L'] },
            ];

            // Create the default products
            return Product.create(products);
        }
    })
    .catch(err => {
        console.error('Error:', err);
    });

export default Product;
