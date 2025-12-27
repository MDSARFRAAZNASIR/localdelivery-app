const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * Address Sub-schema
 * Used only inside User
 */
const addressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: "Home",
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Invalid phone number"],
    },

    addressLine: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

/**
 * User Schema
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },

    userphone: {
      type: String,
      unique: true,
      sparse: true, // allow multiple users without phone
      match: [/^[0-9]{10}$/, "Invalid phone number"],
    },

    useremail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Invalid email address",
      ],
    },

    userpassword: {
      type: String,
      required: true,
      minlength: 6,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    // ✅ addresses ONLY live here (NOT in Order)
    addresses: {
      type: [addressSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
userSchema.index({ useremail: 1 }, { unique: true });
userSchema.index({ userphone: 1 }, { unique: true, sparse: true });

/**
 * Pre-save hooks
 */
userSchema.pre("save", async function (next) {
  try {
    // normalize phone
    if (this.isModified("userphone") && this.userphone) {
      this.userphone = String(this.userphone).replace(/\D/g, "").slice(-10);
    }

    // normalize email
    if (this.isModified("useremail")) {
      this.useremail = this.useremail.trim().toLowerCase();
    }

    // hash password only if changed
    if (!this.isModified("userpassword")) return next();

    const salt = await bcrypt.genSalt(10);
    this.userpassword = await bcrypt.hash(this.userpassword, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Safe export (serverless + hot reload safe)
 */
const Userdetail =
  mongoose.models.Userdetail ||
  mongoose.model("Userdetail", userSchema);

module.exports = Userdetail;
