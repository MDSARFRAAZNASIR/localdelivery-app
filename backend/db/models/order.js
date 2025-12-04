// db/models/order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Userdata', required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' }, // optional
  pickup: {
    address: String,
    lat: Number,
    lng: Number
  },
  drop: {
    address: String,
    lat: Number,
    lng: Number
  },
  parcel: {
    weightKg: Number,
    description: String,
    value: Number
  },
  price: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['COD','ONLINE'], default: 'COD' },
  status: { type: String, enum: ['CREATED','ACCEPTED','PICKED','ONWAY','DELIVERED','CANCELLED'], default: 'CREATED' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
