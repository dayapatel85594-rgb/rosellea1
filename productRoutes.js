import Router from '../utils/router.js';
import { getProducts, getProductById, getProductsByCategory, searchProducts } from '../controllers/productController.js';

const router = new Router();

// Ensure all routes work correctly
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/category/*', getProductsByCategory);
router.get('/:id', getProductById);

export default router;
