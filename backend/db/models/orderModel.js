const mongoose = require("mongoose");

/**
 * Order Item Schema
 * Snapshot of product at order time
 */
const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    subtotal: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

/**
 * Delivery Address Snapshot (IMPORTANT)
 * Stored as object, NOT array
 */
const deliveryAddressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false }
);

/**
 * Main Order Schema
 */
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Userdata", // 👈 matches your user model name
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // rating for the order

  //   rating: {
  //   type: Number,
  //   min: 1,
  //   max: 5,
  //   default: 0
  // },
  // review: {
  //   type: String,
  //   default: ""
  // },
  // isRated: {
  //   type: Boolean,
  //   default: false
  // }


  // --- RATING SECTION (Enhanced) ---
    rating: {
      type: Number,
      // Change: Default to 0, but min is only enforced if value > 0
      default: 0,
      validate: {
        validator: function(v) {
          return v === 0 || (v >= 1 && v <= 5);
        },
        message: 'Rating must be between 1 and 5'
      }
    },
    review: {
      type: String,
      default: "",
      trim: true // Clean up whitespace
    },
    isRated: {
      type: Boolean,
      default: false
    },
    
    

    // ✅ SINGLE deliveryAddress (NOT addresses[])
    deliveryAddress: {
      type: deliveryAddressSchema,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "CREATED",
        "CONFIRMED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "CREATED",
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Safe export (serverless + hot reload)
 */
const Orderdata =
  mongoose.models.Orderdata ||
  mongoose.model("Orderdata", orderSchema);

module.exports = Orderdata;
