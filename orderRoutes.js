import Router from '../utils/router.js';
import { getOrders, getOrderById, createOrder, cancelOrder } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = new Router();

router.get('', protect, getOrders);
router.post('', protect, createOrder);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/status', protect, cancelOrder);

export default router;
