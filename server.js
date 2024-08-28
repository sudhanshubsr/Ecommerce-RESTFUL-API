import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import mongoose from 'mongoose';

// ? Importing Routes
import CartRouter from './src/features/cart/cartitems.routes.js';
import ProductRouter from './src/features/product/routes/product.routes.js';
import UserRouter from './src/features/user/routes/user.routes.js';

// ? Authentication Middlewares
import passport from './src/config/passport_jwt.js';
import basicAuthorizer from './src/middlewares/basicAuth.middleware.js';
import jwtAuth from './src/middlewares/jwtAuth.middleware.js';

// ? Swagger UI Express
import swagger from 'swagger-ui-express';

// ? Importing Logger Middlewares
import winstonloggerMiddleware from './src/middlewares/winstonlogger.middleware.js';

// ? Importing Error Handler
import ApplicationError from './src/ErrorHandler/ApplicationError.js';

// ? Express Server
const server = express();
const apiDocs = JSON.parse(fs.readFileSync('./swagger.json', 'utf-8'));
dotenv.config();

//? Middleware to parse the urlencoded data
server.use(express.urlencoded({ extended: true }));

//? Middleware to parse the request body
server.use(express.json());

//? Express Middleware to handle errors
server.use((err, req, res, next) => {
  console.log(err);
  // application error
  if (err instanceof ApplicationError) {
    res.status(err.code).send(err.message);
  }
  // server error
  res.status(500).send('Something went wrong');
});

//? Routing All request for products to ProductRouter
server.use(winstonloggerMiddleware);
server.use('/api/products', jwtAuth, ProductRouter);
server.use('/api/cartItems', jwtAuth, CartRouter);
server.use('/api/users', UserRouter);
server.use('/api/docs', swagger.serve, swagger.setup(apiDocs));

//? Middleware to handle 404 error
server.use((req, res) => {
  res.status(404).json({
    message: 'Not Found',
    'Please Check Our Documentation': '/api/docs',
  });
});

//? Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL);
export const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected successfully to MongoDB');
});

const PORT = process.env.PORT || 3001;

server.get('/test', (req, res) => {
  res.send(`Server is running on ${PORT}`);
});

try {
  server.listen(PORT, (error) => {
    if (error) console.log('Error in Starting Server');
    console.log(`Server listening on PORT: ${PORT}`);
  });
} catch (error) {
  console.log(error);
}
