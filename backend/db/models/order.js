// backend/db/models/order.js
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },          // snapshot of product name
    price: { type: Number, required: true },         // price at time of order
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Userdata", required: true },

    items: {
      type: [orderItemSchema],
      validate: [arr => arr.length > 0, "Order must have at least one item"],
    },

    totalAmount: { type: Number, required: true, min: 0 },

    deliveryAddress: { type: String, required: true },
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD",
    },

    status: {
      type: String,
      enum: ["CREATED", "CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"],
      default: "CREATED",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Order || mongoose.model("Order", orderSchema);
