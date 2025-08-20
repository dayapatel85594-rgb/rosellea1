// server/cartController.js

import Cart from '../models/CartModel.js';
import Product from '../models/ProductModel.js';

export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'title images price');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    const totals = cart.calculateTotals();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        items: cart.items,
        totalAmount: totals.total,
        totalItems: totals.count
      }
    }));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Failed to get cart' }));
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;
    if (!productId || !quantity) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'productId and quantity are required' }));
    }

    const product = await Product.findById(productId).lean();
    if (!product || !product.isActive) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Product not found' }));
    }
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    const existing = cart.items.find(
      i => i.product.toString() === productId && i.size === size && i.color === color
    );
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, 99);
    } else {
      cart.items.push({
        product: productId,
        quantity,
        size,
        color,
        title: product.title,
        price: product.price,
        image: (product.images && product.images[0]) || ''
      });
    }
    await cart.save();
    await cart.populate('items.product', 'title images price');
    const totals = cart.calculateTotals();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Cart updated',
      data: {
        items: cart.items,
        totalAmount: totals.total,
        totalItems: totals.count
      }
    }));
  } catch (error) {
    console.error('Add to cart error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Failed to add to cart' }));
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const itemId = req.url.split('/item/')[1]?.split('?')[0];
    const { quantity } = req.body;

    if (!itemId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Item ID is required' }));
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Cart not found' }));
    }

    const item = cart.items.id(itemId);
    if (!item) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Item not found in cart' }));
    }

    item.quantity = Math.max(1, Math.min(quantity, 99));
    await cart.save();
    await cart.populate('items.product', 'title images price');
    const totals = cart.calculateTotals();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: { items: cart.items, totalAmount: totals.total, totalItems: totals.count } }));
  } catch (error) {
    console.error('Update cart item error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Failed to update cart item' }));
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const itemId = req.url.split('/item/')[1]?.split('?')[0];

    if (!itemId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Item ID is required' }));
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Cart not found' }));
    }

    cart.items = cart.items.filter(i => i._id.toString() !== itemId);
    await cart.save();
    await cart.populate('items.product', 'title images price');
    const totals = cart.calculateTotals();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Item removed', data: { items: cart.items, totalAmount: totals.total, totalItems: totals.count } }));
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Failed to remove item' }));
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Cart not found' }));
    }
    cart.items = [];
    await cart.save();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Cart cleared', data: { items: [], totalAmount: 0, totalItems: 0 } }));
  } catch (error) {
    console.error('Clear cart error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Failed to clear cart' }));
  }
};
