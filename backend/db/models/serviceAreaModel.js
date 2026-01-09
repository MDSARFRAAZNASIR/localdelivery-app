const mongoose = require("mongoose");

const serviceAreaSchema = new mongoose.Schema(
  {
    pincode: {
      type: String,
      required: true,
      unique: true,
      match: [/^[0-9]{6}$/, "Invalid pincode"],
    },
    areaName: { type: String, default: "" }, // optional label
    deliveryFee: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ServiceArea ||
  mongoose.model("ServiceArea", serviceAreaSchema);
