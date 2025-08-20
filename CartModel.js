// server/models/CartModel.js

import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  size: String,
  color: String,
  quantity: { type: Number, required: true, min: 1, default: 1 }
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    items: [cartItemSchema]
  },
  { timestamps: true }
);

cartSchema.methods.calculateTotals = function () {
  return this.items.reduce((acc, item) => {
    acc.count += item.quantity;
    acc.total += item.price * item.quantity;
    return acc;
  }, { count: 0, total: 0 });
};

export default mongoose.model('Cart', cartSchema);
