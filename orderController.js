import Order from '../models/OrderModel.js';
import Cart from '../models/CartModel.js'; 
import Product from '../models/ProductModel.js';

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt')
      .populate('items.product', 'title images price');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: orders }));
  } catch (error) {
    console.error('Get orders error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Failed to fetch orders' }));
  }
};

export const getOrderById = async (req, res) => {
  try {
    const parts = req.url.split('/');
    const orderId = parts[parts.length - 1].split('?')[0];
    if (!orderId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Order ID is required' }));
    }
    const order = await Order.findOne({ _id: orderId, user: req.user._id })
      .populate('items.product', 'title images price');
    if (!order) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Order not found' }));
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: order }));
  } catch (error) {
    console.error('Get order by id error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Failed to fetch order' }));
  }
};

export const createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Cart is empty' }));
    }
    
    const { shippingAddress, paymentMethod } = req.body;
    
    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Shipping address and payment method are required' }));
    }

    // Compute totals server-side for integrity
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const shipping = subtotal > 100 ? 0 : 15;
    const total = Math.round((subtotal + tax + shipping) * 100) / 100;
    const order = await Order.create({
      user: req.user._id,
      items: cart.items,
      shippingAddress,
      paymentMethod,
      subtotal,
      tax,
      shipping,
      total
    });
    
    // Update stock
    for (let item of cart.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }
    
    // Clear cart
    cart.items = [];
    await cart.save();
    
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Order placed', data: order }));
  } catch (error) {
    console.error('Create order error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Failed to create order' }));
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const urlParts = req.url.split('/');
    const orderId = urlParts[urlParts.length - 2]; // Get ID before 'cancel' or 'status'
    const { status } = req.body || {};
    
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Order not found' }));
    }
    
    // Handle status update or cancellation
    const newStatus = status || 'cancelled';
    
    if (order.status !== 'pending' && newStatus === 'cancelled') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Order cannot be cancelled' }));
    }
    
    order.status = newStatus;
    await order.save();
    
    // Restore stock only for cancellation
    if (newStatus === 'cancelled') {
      for (let item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    }
    
    const message = newStatus === 'cancelled' ? 'Order cancelled' : 'Order status updated';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message, data: { order } }));
  } catch (error) {
    console.error('Update order error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Failed to update order' }));
  }
};
