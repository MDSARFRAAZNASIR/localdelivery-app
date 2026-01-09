// db/models/ServiceArea.js
const mongoose = require("mongoose");

const serviceAreaSchema = new mongoose.Schema({
  pincode: {
    type: String,
    required: true,
    unique: true,
  },
  areaName: String,      // Baisi, Purnia, etc
  city: String,
  state: String,
  deliveryFee: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports =
  mongoose.models.ServiceArea ||
  mongoose.model("ServiceArea", serviceAreaSchema);
