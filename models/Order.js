import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  quantity: Number,
  totalPrice: Number,
});

const customerSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  street: String,
  city: String,
  "postal-code": String,
  leaveMessage: String,
});

const orderSchema = new mongoose.Schema({
  items: [itemSchema],
  customer: customerSchema,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
