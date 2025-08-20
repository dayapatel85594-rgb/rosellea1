import Router from '../utils/router.js';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';

const router = new Router();

router.get('', protect, getCart);
router.post('/add', protect, addToCart);
router.put('/item/:id', protect, updateCartItem);
router.delete('/item/:id', protect, removeFromCart);
router.delete('/clear', protect, clearCart);

export default router;
