import express from 'express';
import bodyParser from 'body-parser';
import mongoose, { connect } from 'mongoose';
import dotenv from 'dotenv';

// ? Importing Routes
import ProductRouter from './src/features/product/routes/product.routes.js';
import UserRouter from './src/features/user/routes/user.routes.js';
import CartRouter from './src/features/cart/cartitems.routes.js';

// ? Authentication Middlewares
import basicAuthorizer from './src/middlewares/basicAuth.middleware.js';
import jwtAuth from './src/middlewares/jwtAuth.middleware.js';
import passport from './src/config/passport_jwt.js';

// ? Swagger UI Express
import swagger from 'swagger-ui-express';
import apiDocs from './swagger.json' assert { type: "json" };

// ? Importing Logger Middlewares
import loggerMiddleware from './src/middlewares/logger.middleware.js';
import winstonloggerMiddleware from './src/middlewares/winstonlogger.middleware.js';

// ? Importing Error Handler
import ApplicationError from './src/ErrorHandler/ApplicationError.js';


// ? Importing MongoDB Connection
import connectToMongoDB from './src/config/mongodb.js';

// ? Express Server
const server = express();
dotenv.config();

//? Middleware to parse the urlencoded data
server.use(express.urlencoded({extended:true}));
    
//? Middleware to parse the request body
server.use(bodyParser.json());



//? Express Middleware to handle errors
server.use((err,req,res,next)=>{
    console.log(err);
    // application error
    if(err instanceof ApplicationError){
        res.status(err.code).send(err.message);
    }
    // server error
    res.status(500).send("Something went wrong");
});



//? Routing All request for products to ProductRouter   
server.use(winstonloggerMiddleware);
server.use('/api/products',jwtAuth, ProductRouter);
server.use('/api/cartItems',jwtAuth, CartRouter);
server.use('/api/users', UserRouter);
server.use('/api/docs', swagger.serve, swagger.setup(apiDocs)); 

//? Middleware to handle 404 error
server.use((req,res)=>{
    res.status(404).json({
        message:"Not Found",
        "Please Check Our Documentation":"http://localhost:3000/api/docs"
})
});

//? Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL);
export const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connected successfully to MongoDB");
});




server.get('/',(req,res)=>{
    res.send("Welcome to Ecommerce API")
})

server.listen(3000,(err)=>{
    if(err){
        console.log(err)
    }
    console.log("Server is running on port 3000")
    // connectToMongoDB();
});
