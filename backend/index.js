// index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const colors = require("colors"); // optional
const connectDB = require("./db/configDb");
const User = require("./db/models/userModel");
const Product = require("./db/models/productModel");
const Order = require("./db/models/orderModel");
// const adminMiddle = require("./middleware/adminMiddle");
const adminMiddlle=require("./middleware/adminMiddlle")
const ServiceArea = require("./db/models/serviceAreaModel");
// const ServiceArea = require("./db/models/ServiceArea");

const auth = require("./middleware/auth");
const bcrypt = require("bcryptjs");
const PDFDocument = require("pdfkit");


// load env (important: do this once at entry)
dotenv.config();

// create app
const app = express();

// middleware
app.use(express.json());

// CORS - keep as open for now; tighten to your frontend origin later
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://localdelivery-app-frontend.vercel.app",
      "https://localdelivery-app.vercel.app",
    ],
  })
);
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// small async wrapper to catch errors from async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// connect DB (serverless-safe) — attempt once at startup (local). Serverless handlers also call connectDB before DB ops.
connectDB().catch((err) => {
  console.error("Initial DB connect failed:", err && err.message);
});

// Health for server chaeck
app.get("/", (req, res) => res.send("API is running successfully ✅"));

// Register (replace the previous handler body with this)
app.post(
  "/userregister",
  asyncHandler(async (req, res) => {
    const { username, useremail, userpassword, userphone } = req.body || {};

    if (!username || !useremail || !userpassword) {
      return res.status(400).json({
        success: false,
        message: "username, useremail and userpassword are required",
      });
    }

    // normalize email
    const normalizedEmail = String(useremail).trim().toLowerCase();

    // === phone normalization (Option A: accept many formats, store last 10 digits) ===
    let phoneFinal;
    if (
      typeof userphone !== "undefined" &&
      userphone !== null &&
      String(userphone).trim() !== ""
    ) {
      // remove all non-digits
      const digits = String(userphone).replace(/\D/g, "");
      if (digits.length >= 10) {
        // keep last 10 digits (works for +91XXXXXXXXXX and other prefixes)
        phoneFinal = digits.slice(-10);
      } else {
        return res.status(400).json({
          success: false,
          message: "Please provide at least a 10-digit phone number",
        });
      }
    }
    // ===============================================================================

    // create user object
    const toSave = {
      username,
      useremail: normalizedEmail,
      userpassword,
    };
    if (phoneFinal) toSave.userphone = phoneFinal;

    // ensure we never persist empty/null phone (protects unique index)
    if (!toSave.userphone) delete toSave.userphone;

    // ensure DB is connected (serverless will wait here if needed)
    await connectDB();

    const user = new User(toSave);
    const saved = await user.save();

    const safe = saved.toObject();
    delete safe.userpassword;

    return res.status(201).json({ success: true, user: safe });
  })
);

// add after jwt
// Login
app.post(
  "/userlogin",
  asyncHandler(async (req, res) => {
    const { useremail, userpassword } = req.body || {};

    if (!useremail || !userpassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }

    await connectDB();

    // find user
    const user = await User.findOne({
      useremail: String(useremail).trim().toLowerCase(),
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }

    // compare password
    const isMatch = await bcrypt.compare(userpassword, user.userpassword);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Password" });
    }

    // ---------- ⭐ JWT CREATION ⭐ ----------
    const jwt = require("jsonwebtoken");

    const token = jwt.sign(
      { id: user._id }, // payload
      process.env.JWT_SECRET || "devsecret", // secret
      { expiresIn: "7d" } // expiry
    );
    // ----------------------------------------

    // create clean user object
    const userData = user.toObject();
    delete userData.userpassword;

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token: token, // ⭐ send token to frontend
      user: userData,
    });
  })
);

// user profile upadate
// GET user profile
app.get(
  "/user/profile",
  auth,
  asyncHandler(async (req, res) => {
    const user = { ...req.user };
    delete user.userpassword;
    return res.json({ success: true, user });
  })
);

// PUT update profile (name / phone / email)
app.put(
  "/user/profile",
  auth,
  asyncHandler(async (req, res) => {
    const { username, useremail, userphone } = req.body || {};
    const updates = {};

    if (username) updates.username = username.trim();
    if (useremail) updates.useremail = String(useremail).trim().toLowerCase();

    // phone normalization — same logic as signup (last 10 digits, India-style)
    if (
      typeof userphone !== "undefined" &&
      userphone !== null &&
      String(userphone).trim() !== ""
    ) {
      const digits = String(userphone).replace(/\D/g, "");
      if (digits.length >= 10) {
        updates.userphone = digits.slice(-10);
      } else {
        return res.status(400).json({
          success: false,
          message: "Please provide at least a 10-digit phone number",
        });
      }
    }

    if (!updates.username && !updates.useremail && !updates.userphone) {
      return res
        .status(400)
        .json({ success: false, message: "No valid fields to update" });
    }

    try {
      const updated = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      }).lean();

      if (!updated) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      delete updated.userpassword;

      return res.json({
        success: true,
        message: "Profile updated successfully",
        user: updated,
      });
    } catch (err) {
      console.error("/user/profile PUT error ->", err);

      // handle duplicate email / phone
      if (err && err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "field";
        return res
          .status(409)
          .json({ success: false, message: `${field} already exists` });
      }

      return res
        .status(500)
        .json({ success: false, message: err.message || "Update failed" });
    }
  })
);

// User: get single order details
app.get(
  "/user/orders/:orderId",
  auth,
  asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    await connectDB();

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    }).populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({ success: true, order });
  })
);

// User: cancel order (only if CREATED)
app.put(
  "/user/orders/:orderId/cancel",
  auth,
  asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    await connectDB();

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status !== "CREATED") {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled now",
      });
    }

    order.status = "CANCELLED";
    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  })
);

// get all address of user
app.get(
  "/user/addresses",
  auth,
  asyncHandler(async (req, res) => {
    await connectDB();
    const user = await User.findById(req.user._id).select("addresses");
    res.json({ success: true, addresses: user.addresses || [] });
  })
);

// add new address of user
app.post(
  "/user/addresses",
  auth,
  asyncHandler(async (req, res) => {
    const address = req.body;

    if (!address.addressLine) {
      return res
        .status(400)
        .json({ success: false, message: "Address required" });
    }

    await connectDB();
    const user = await User.findById(req.user._id);

    // first address becomes default
    if (!user.addresses.some((a) => a.isDefault)) {
      address.isDefault = true;
    }

    user.addresses.push(address);
    await user.save();

    res.status(201).json({ success: true, addresses: user.addresses });
  })
);

// PUT /user/addresses/:id/default
app.put(
  "/user/addresses/:id/default",
  auth,
  asyncHandler(async (req, res) => {
    await connectDB();

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // reset all
    user.addresses.forEach((a) => (a.isDefault = false));

    // set selected
    const addr = user.addresses.id(req.params.id);
    if (!addr) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    addr.isDefault = true;
    await user.save();

    res.json({ success: true, addresses: user.addresses });
  })
);

// delete address of user
app.delete(
  "/user/addresses/:id",
  auth,
  asyncHandler(async (req, res) => {
    await connectDB();
    const user = await User.findById(req.user._id);

    user.addresses = user.addresses.filter(
      (a) => a._id.toString() !== req.params.id
    );

    // ensure one default remains
    if (!user.addresses.some((a) => a.isDefault) && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({ success: true, addresses: user.addresses });
  })
);


// UPDATE address
app.put(
  "/user/addresses/:id",
  auth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { label, name, phone, addressLine, city, state, pincode } = req.body;

    await connectDB();

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const address = user.addresses.id(id);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // update fields
    address.label = label;
    address.name = name;
    address.phone = phone;
    address.addressLine = addressLine;
    address.city = city;
    address.state = state;
    address.pincode = pincode;

    await user.save();

    res.json({
      success: true,
      addresses: user.addresses,
    });
  })
);


// Create product (admin use via Postman for now)
app.post(
  "/admin/products",
  auth,
  // adminOnly,
  adminMiddlle,
  asyncHandler(async (req, res) => {
    const { name, description, price, imageUrl, category, stock } =
      req.body || {};

    if (!name || typeof price === "undefined") {
      return res
        .status(400)
        .json({ success: false, message: "name and price are required" });
    }

    await connectDB();

    const product = new Product({
      name,
      description: description || "",
      price: Number(price),
      imageUrl: imageUrl || "",
      category: category || "",
      stock: typeof stock !== "undefined" ? Number(stock) : 0,
    });

    const saved = await product.save();
    return res.status(201).json({ success: true, product: saved });
  })
);

// ---------- Admin product management (list/edit/delete) ----------
/**
 * GET /admin/products        - list all products (admin view)
 * PUT /admin/products/:id    - update product
 * DELETE /admin/products/:id - delete product
 *
 * Protected with auth middleware. You can add role-check later.
 */

app.get(
  "/admin/products",
  auth,
  // adminOnly,
  adminMiddlle,
  asyncHandler(async (req, res) => {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, products });
  })
);

app.put(
  "/admin/products/:id",
  auth,
  // adminOnly,
  adminMiddlle,
  asyncHandler(async (req, res) => {
    const updates = {};
    const fields = [
      "name",
      "description",
      "price",
      "imageUrl",
      "category",
      "stock",
      "isActive",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    await connectDB();
    const updated = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    return res.json({ success: true, product: updated });
  })
);

app.delete(
  "/admin/products/:id",

  auth,
  // adminOnly,
  adminMiddlle,
  asyncHandler(async (req, res) => {
    await connectDB();
    const deleted = await Product.findByIdAndDelete(req.params.id).lean();
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    return res.json({ success: true, message: "Product deleted" });
  })
);
// Admin: get all orders
app.get(
  "/admin/orders",
  auth,
  // adminOnly,
  adminMiddlle,
  asyncHandler(async (req, res) => {
    await connectDB();

    const orders = await Order.find()
      .populate({
        path: "userId",
        // model: "Userdata", // 🔥 FIX
        // model: "User", // 🔥 FIX AGAIN
          //  model: "Userdata", // 🔥 FIX
        model: "Userdetail", // 🔥 FIX AGAIN

        select: "username useremail userphone",
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  })
);

// GET /products?category=Fruits&q=milk&min=10&max=200&page=1&limit=24&sort=price_asc

app.get(
  "/products",
  asyncHandler(async (req, res) => {
    await connectDB();

    const {
      category,
      q,
      min,
      max,
      page = 1,
      limit = 24,
      sort,
    } = req.query || {};

    const filter = { isActive: true };

    // category filter
    if (category) {
      filter.category = String(category).trim();
    }

    // text search on name/description
    if (q && String(q).trim()) {
      const s = String(q).trim();
      filter.$or = [
        { name: { $regex: s, $options: "i" } },
        { description: { $regex: s, $options: "i" } },
      ];
    }

    // price range
    if (min || max) {
      filter.price = {};
      if (min) filter.price.$gte = Number(min);
      if (max) filter.price.$lte = Number(max);
    }

    // sorting
    const sortOption = {};
    if (sort === "price_asc") sortOption.price = 1;
    else if (sort === "price_desc") sortOption.price = -1;
    else if (sort === "newest") sortOption.createdAt = -1;
    else sortOption.createdAt = -1;

    const p = Math.max(1, parseInt(page || 1));
    const lim = Math.min(200, parseInt(limit || 24));
    const skip = (p - 1) * lim;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(lim).lean(),
      Product.countDocuments(filter),
    ]);

    return res.json({ success: true, page: p, limit: lim, total, products });
  })
);

// GET /categories  -> returns list of categories and counts (optional)
app.get(
  "/categories",
  asyncHandler(async (req, res) => {
    await connectDB();

    // use aggregation to get counts per category (only active)
    const agg = await Product.aggregate([
      { $match: { isActive: true, category: { $exists: true, $ne: "" } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { _id: 0, category: "$_id", count: 1 } },
      { $sort: { category: 1 } },
    ]);

    // fallback: if no categories found return empty array
    return res.json({ success: true, categories: agg });
  })
);

// Public list of active products
app.get(
  "/products",
  asyncHandler(async (req, res) => {
    await connectDB();
    const products = await Product.find({ isActive: true }).lean();
    return res.json({ success: true, products });
  })
);

// create item from cart
// app.post(
//   "/orders",
//   auth,
//   asyncHandler(async (req, res) => {
//     // const { items, deliveryAddress, paymentMethod } = req.body || {};
//     const { items, deliveryAddressId, paymentMethod } = req.body || {};

//     // if (!deliveryAddress || !Array.isArray(items)) {
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: "items[] and deliveryAddress are required",
//     //   });
//     // }
//     //  Basic Validation
//     if (!deliveryAddressId || !Array.isArray(items)) {
//       return res.status(400).json({
//         success: false,
//         message: "items[] and deliveryAddressId are required",
//       });
//     }

//     // Clean Cart Items
//     const cleanedItems = items
//       .map((it) => ({
//         productId: it.productId,
//         quantity: Number(it.quantity || 0),
//       }))
//       .filter((it) => it.productId && it.quantity > 0);

//     if (!cleanedItems.length) {
//       return res.status(400).json({
//         success: false,
//         message: "No valid cart items",
//       });
//     }
//     //  DB Connection
//     await connectDB();

//     // 🔐 fetch user + address snapshot
//     const user = await User.findById(req.user._id);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const address = user.addresses.find(
//       (a) => a._id.toString() === deliveryAddressId
//     );

//     if (!address) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid delivery address",
//       });
//     }

//     // Fetch Products
//     const products = await Product.find({
//       _id: { $in: cleanedItems.map((i) => i.productId) },
//       isActive: true,
//     }).lean();

//     const productMap = new Map(products.map((p) => [String(p._id), p]));

//     // Build Order Items

//     let totalAmount = 0;
//     const orderItems = [];

//     for (const it of cleanedItems) {
//       const prod = productMap.get(String(it.productId));
//       if (!prod) continue;

//       const price = Number(prod.price);
//       const qty = Number(it.quantity);

//       if (Number.isNaN(price) || Number.isNaN(qty)) continue;

//       const subtotal = price * qty;
//       totalAmount += subtotal;

//       orderItems.push({
//         productId: prod._id,
//         name: prod.name,
//         price,
//         quantity: qty,
//         subtotal,
//       });
//     }

//     if (!orderItems.length || totalAmount <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid order items",
//       });
//     }

//     // add on paymentMethod Logic
//     const finalPaymentMethod = paymentMethod === "ONLINE" ? "ONLINE" : "COD";

//     // const paymentStatus = "PENDING"; // 🔥 ALWAYS pending at creation
//     const paymentStatus = finalPaymentMethod === "ONLINE" ? "PENDING" : "COD";

//     // Create Order

//     const order = new Order({
//       userId: req.user._id,

//       items: orderItems,
//       totalAmount,

//       // add fress
//       paymentMethod: paymentMethod === "ONLINE" ? "ONLINE" : "COD",
//       paymentStatus: "PENDING", // ✅ ALWAYS PENDING at creation
//       status: "CREATED",

//       // 🔥 ADDRESS SNAPSHOT (IMMUTABLE)
//       deliveryAddress: {
//         label: address.label,
//         name: address.name,
//         phone: address.phone,
//         addressLine: address.addressLine,
//         city: address.city,
//         state: address.state,
//         pincode: address.pincode,
//       },

//       addresses: [
//         {
//           label: String,
//           name: String,
//           phone: String,
//           addressLine: String,
//           city: String,
//           state: String,
//           pincode: String,
//           isDefault: { type: Boolean, default: false },
//         },
//       ],
//     });

//     const saved = await order.save();
//     // Response

//     return res.status(201).json({
//       success: true,
//       order: saved,
//       message: "Order created successfully",
//     });
//   })
// );

// CREATE ORDER FROM CART
app.post(
  "/orders",
  auth,
  asyncHandler(async (req, res) => {
    const { items, deliveryAddressId, paymentMethod } = req.body || {};

    // 1️⃣ Basic validation
    if (!Array.isArray(items) || items.length === 0 || !deliveryAddressId) {
      return res.status(400).json({
        success: false,
        message: "items[] and deliveryAddressId are required",
      });
    }

    // 2️⃣ Clean cart items
    const cleanedItems = items
      .map((it) => ({
        productId: it.productId,
        quantity: Number(it.quantity),
      }))
      .filter((it) => it.productId && it.quantity > 0);

    if (!cleanedItems.length) {
      return res.status(400).json({
        success: false,
        message: "No valid cart items",
      });
    }

    // 3️⃣ DB connect
    await connectDB();

    // 4️⃣ Fetch user & selected address
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const address = user.addresses.find(
      (a) => a._id.toString() === deliveryAddressId
    );

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery address",
      });
    }

    // 🔟 Area / Pincode validation
const serviceArea = await ServiceArea.findOne({
  pincode: address.pincode,
  isActive: true,
});

if (!serviceArea) {
  return res.status(400).json({
    success: false,
    message: "Sorry, delivery is not available in your area",
  });
}


    // 5️⃣ Fetch products
    const products = await Product.find({
      _id: { $in: cleanedItems.map((i) => i.productId) },
      isActive: true,
    }).lean();

    const productMap = new Map(
      products.map((p) => [String(p._id), p])
    );

    // 6️⃣ Build order items + total
    // old one
    // let totalAmount = 0;

    // add delivary charge
    let totalAmount = 0;
const deliveryFee = serviceArea.deliveryFee || 0;

    const orderItems = [];

    for (const it of cleanedItems) {
      const prod = productMap.get(String(it.productId));
      if (!prod) continue;

      const price = Number(prod.price);
      const qty = Number(it.quantity);

      if (Number.isNaN(price) || Number.isNaN(qty)) continue;

      const subtotal = price * qty;
      // totalAmount += subtotal ;
totalAmount += deliveryFee;


      orderItems.push({
        productId: prod._id,
        name: prod.name,
        price,
        quantity: qty,
        subtotal,
      });
    }

    if (!orderItems.length || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order items",
      });
    }

    // 7️⃣ Payment logic
    const finalPaymentMethod =
      paymentMethod === "ONLINE" ? "ONLINE" : "COD";

    // 8️⃣ Create order (NO addresses[] HERE ❌)
    const order = new Order({
      userId: req.user._id,
      items: orderItems,
      totalAmount,

      paymentMethod: finalPaymentMethod,
      paymentStatus: "PENDING",
      status: "CREATED",

      // ✅ Address snapshot (immutable)
      deliveryAddress: {
        label: address.label,
        name: address.name,
        phone: address.phone,
        addressLine: address.addressLine,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      },
    });

    
    const savedOrder = await order.save();

    // 9️⃣ Response
    return res.status(201).json({
      success: true,
      order: savedOrder,
      message: "Order created successfully",
    });
  })
);



// add add delivary region

// ➕ Add / Update pincode
app.post("/admin/service-areas", auth, adminOnly, asyncHandler(async (req, res) => {
  const { pincode, areaName, deliveryFee, isActive } = req.body;
  if (!pincode) return res.status(400).json({ success:false, message:"pincode required" });

  await connectDB();

  const area = await ServiceArea.findOneAndUpdate(
    { pincode },
    { areaName, deliveryFee, isActive },
    { upsert: true, new: true }
  );

  res.json({ success:true, area });
}));

// 📋 List all pincodes
app.get("/admin/service-areas", auth, adminOnly, asyncHandler(async (req, res) => {
  await connectDB();
  const areas = await ServiceArea.find().sort({ pincode: 1 });
  res.json({ success:true, areas });
}));

// ❌ Delete pincode
app.delete("/admin/service-areas/:id", auth, adminOnly, asyncHandler(async (req, res) => {
  await connectDB();
  await ServiceArea.findByIdAndDelete(req.params.id);
  res.json({ success:true });
}));



// Admin: update order status
app.put(
  "/admin/orders/:id/status",
  auth,
  // adminOnly,
  adminMiddlle,
  asyncHandler(async (req, res) => {
    const { status } = req.body;

    const allowed = [
      "CREATED",
      "CONFIRMED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    await connectDB();

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Order status updated",
      order,
    });
  })
);

//  create order with rozpay

app.post(
  "/payments/razorpay/create-order",
  auth,
  asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    await connectDB();

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(400).json({ message: "Order already paid" });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: order.totalAmount * 100, // paise
      currency: "INR",
      receipt: `order_${order._id}`,
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      key: process.env.RAZORPAY_KEY_ID,
      razorpayOrder,
    });
  })
);

// verify rozpay
const crypto = require("crypto");

app.post(
  "/payments/razorpay/verify",
  auth,
  asyncHandler(async (req, res) => {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    await connectDB();

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.paymentStatus = "PAID";
    order.paymentMethod = "ONLINE";
    order.razorpayPaymentId = razorpay_payment_id;

    await order.save();

    res.json({ success: true, message: "Payment successful", order });
  })
);

// Get all orders for logged-in user
app.get(
  "/orders",
  auth,
  asyncHandler(async (req, res) => {
    await connectDB();

    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, orders });
  })
);


// add code for invoice generation
app.get(
  "/orders/:orderId/invoice",
  auth,
  asyncHandler(async (req, res) => {
    await connectDB();

    const order = await Order.findById(req.params.orderId).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // User can only access own invoice
    if (!req.user.isAdmin && String(order.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Build invoice object
    const invoice = {
      invoiceNumber: `INV-${order._id.toString().slice(-6).toUpperCase()}`,
      orderId: order._id,
      orderDate: order.createdAt,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      status: order.status,

      customer: {
        name: order.deliveryAddress?.name || "Customer",
        phone: order.deliveryAddress?.phone || "",
        address: order.deliveryAddress
          ? `${order.deliveryAddress.addressLine}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}`
          : "Address not available",
      },

      items: order.items,
      totalAmount: order.totalAmount,
    };

    res.json({ success: true, invoice });
  })
);





// app.get(
//   "/invoice/:orderId",
//   auth,
//   asyncHandler(async (req, res) => {
//     await connectDB();

//     const order = await Order.findById(req.params.orderId)
//       .populate("userId", "username useremail")
//       .lean();

//     if (!order) {
//       return res.status(404).send("Order not found");
//     }

//     const doc = new PDFDocument({ size: "A4", margin: 50 });

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=invoice-${order._id}.pdf`
//     );

//     doc.pipe(res);

//     // 🧾 HEADER
//     doc.fontSize(20).text("INVOICE", { align: "center" });
//     doc.moveDown();

//     doc.fontSize(10).text(`Invoice ID: ${order._id}`);
//     doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
//     doc.moveDown();

//     // 👤 CUSTOMER
//     doc.fontSize(12).text("Billed To:");
//     doc.text(order.userId.username);
//     doc.text(order.userId.useremail);
//     doc.moveDown();

//     // 📍 ADDRESS
//     if (order.deliveryAddress) {
//       const a = order.deliveryAddress;
//       doc.text("Delivery Address:");
//       doc.text(`${a.name}`);
//       doc.text(`${a.addressLine}`);
//       doc.text(`${a.city}, ${a.state} - ${a.pincode}`);
//       doc.text(`Phone: ${a.phone}`);
//       doc.moveDown();
//     }

//     // 📦 ITEMS
//     doc.text("Items:");
//     doc.moveDown(0.5);

//     order.items.forEach((item, i) => {
//       doc.text(
//         `${i + 1}. ${item.name}  |  ₹${item.price} × ${item.quantity} = ₹${item.subtotal}`
//       );
//     });

//     doc.moveDown();
//     doc.fontSize(14).text(`Total Amount: ₹${order.totalAmount}`, {
//       align: "right",
//     });

//     doc.moveDown();
//     doc.fontSize(10).text("Thank you for shopping with us!", {
//       align: "center",
//     });

//     doc.end();
//   })
// );


// GLOBAL error handler (single, last middleware)
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err && (err.stack || err.message || err));
  res
    .status(err.status || 500)
    .json({ success: false, message: err.message || "Server error" });
});

// If running locally (dev), start the server with listen
if (require.main === module) {
  const PORT = process.env.PORT || 4500;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`.yellow);
  });
}
// Export app so Vercel can use it as handler

module.exports = app;
