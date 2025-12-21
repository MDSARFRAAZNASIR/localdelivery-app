// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// // Define the User schema
// const userSchemaDefined = new mongoose.Schema(
//   {
//     username: {
//       type: String,
//       required: [true, "Please add a name"],
//       trim: true,
//       maxlength: [15, "Name cannot be more than 15 characters"],
//     },
//     // userphone: {
//     //   type: String,
//     //   required: [true, "Please add a phone number"],
//     //   unique: true, // Ensures no two users have the same phone number
//     //   // Regex for a 10-digit phone number
//     //   match: [/^[0-9]{10}$/, "Please fill a valid 10-digit phone number"],
//     // },

//     useremail: {
//       type: String,
//       unique: [true, "Email is all redy persent"],
//       required: [true, "Please add an email"],
//       lowercase: true,
//       match: [
//         /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
//         "Please fill a valid email address",
//       ],
//       // validate(value){
//       //     if(!validator.ismail(value)){
//       //         throw error("Email id Invalid")
//       //     }
//       // }
//     },

//     userpassword: {
//       type: String,
//       required: [true, "Please add a password"],
//       minlength: [6, "Password must be at least 6 characters"],
//       match: [
//         /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})/,
//         "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*).",
//       ],
//     },
//   },
//   {
//     timestamps: true, //adds createdAt and updatedAt timestaps
//   }
// );
// // Mongoose middleware to hash the password before saving a new user
// userSchemaDefined.pre("save", async function (next) {
//   // Only hash if the password field is being modified
//   if (!this.isModified("userpassword")) {
//     return next();
//   }
//   // Generate a salt and hash the password
//   const salt = await bcrypt.genSalt(10);
//   this.userpassword = await bcrypt.hash(this.userpassword, salt);
//   next();
// });

// // Create and export the User model
// const UserData = mongoose.model("Userdata", userSchemaDefined);
// module.exports = UserData;

//  other chatgpt
// db/models/userSchemaDefined.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchemaDefined = new mongoose.Schema(
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




// indexes
userSchemaDefined.index({ userphone: 1 }, { unique: true, sparse: true });
userSchemaDefined.index({ useremail: 1 }, { unique: true, sparse: true });

// Pre-save: normalize fields & hash password
userSchemaDefined.pre("save", async function (next) {
  try {
    if (this.isModified("userphone") && this.userphone) {
      // remove non-digits and keep last 10 digits
      this.userphone = String(this.userphone).replace(/\D/g, "").slice(-10);
    }

    if (this.isModified("useremail") && this.useremail) {
      this.useremail = String(this.useremail).trim().toLowerCase();
    }

    if (!this.isModified("userpassword")) return next();

    const salt = await bcrypt.genSalt(10);
    this.userpassword = await bcrypt.hash(this.userpassword, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Safe export for serverless / HMR
const Userdata =
  mongoose.models.User || mongoose.model("Userdata", userSchemaDefined);
module.exports = Userdata;
