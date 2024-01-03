import express from 'express';
import ProductController from '../controllers/product.controller.js';
import upload from '../../../middlewares/fileupload.middleware.js';

const router = express.Router();


router.get('/filter', ProductController.getFilterProducts)
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getOneProduct);
router.post('/rate', ProductController.rateProduct);

router.post('/', upload.single('imageUrl'), ProductController.addProduct);







export default router;