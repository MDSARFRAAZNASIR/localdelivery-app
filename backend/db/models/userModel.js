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
// const userSchema = new mongoose.Schema(
//   {
//     username: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 30,
//     },

//     userphone: {
//       type: String,
//       unique: true,
//       sparse: true, // allow multiple users without phone
//       match: [/^[0-9]{10}$/, "Invalid phone number"],
//     },

//     useremail: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//       match: [
//         /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
//         "Invalid email address",
//       ],
//     },

//     userpassword: {
//       type: String,
//       required: true,
//       minlength: 6,
//     },

//     isAdmin: {
//       type: Boolean,
//       default: false,
//     },

//     // ✅ addresses ONLY live here (NOT in Order)
//     addresses: {
//       type: [addressSchema],
//       default: [],
//     },
//   },
//   {
//     timestamps: true,
//   }
// );



const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      maxlength: [15, "Name cannot be more than 15 characters"],
    },

    // phone removed from required (you removed it from form)
    userphone: {
      type: String,
      unique: true,
      sparse: true, // allow multiple docs with no phone
      match: [/^[0-9]{10}$/, "Please fill a valid 10-digit phone number"],
    },

    useremail: {
      type: String,
      unique: [true, "Email is already present"],
      required: [true, "Please add an email"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },

    userpassword: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Password must be at least 6 characters"],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*).",
      ],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    // address of user
    addresses: [
  {
    label: { type: String, default: "Home" },
    name: String,
    phone: String,
    addressLine: { type: String, required: true },
    city: String,
    state: String,
    pincode: String,
    isDefault: { type: Boolean, default: false },
  },
],

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
