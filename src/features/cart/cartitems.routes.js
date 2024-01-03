import express from 'express';
import CartController from './cartitems.controller.js';

const router = express.Router();

router.post('/', CartController.addProductToCart);
router.get('/', CartController.getCartItems);
router.delete('/:id', CartController.deleteCartItem);

export default router;