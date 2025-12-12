

// index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const colors = require("colors"); // optional
const connectDB = require("./db/configDb");
const User = require("./db/models/userSchemaDefined");
const Order = require('./db/models/order');
const Product=require('./db/models/product')
const auth = require('./middleware/auth');

const bcrypt = require("bcryptjs");
const adminOnly=require("./middleware/adminOnly")


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

// small async wrapper to catch errors from async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// connect DB (serverless-safe) — attempt once at startup (local). Serverless handlers also call connectDB before DB ops.
connectDB().catch((err) => {
  console.error("Initial DB connect failed:", err && err.message);
});

// Health
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
  '/userlogin',
  asyncHandler(async (req, res) => {
    const { useremail, userpassword } = req.body || {};

    if (!useremail || !userpassword) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    await connectDB();

    // find user
    const user = await User.findOne({
      useremail: String(useremail).trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User Not Found' });
    }

    // compare password
    const isMatch = await bcrypt.compare(userpassword, user.userpassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Password' });
    }

    // ---------- ⭐ JWT CREATION ⭐ ----------
    const jwt = require('jsonwebtoken');

    const token = jwt.sign(
      { id: user._id },                      // payload
      process.env.JWT_SECRET || 'devsecret', // secret
      { expiresIn: '7d' }                    // expiry
    );
    // ----------------------------------------

    // create clean user object
    const userData = user.toObject();
    delete userData.userpassword;

    return res.status(200).json({
      success: true,
      message: 'Login Successful',
      token: token,        // ⭐ send token to frontend
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
    if (typeof userphone !== "undefined" && userphone !== null && String(userphone).trim() !== "") {
      const digits = String(userphone).replace(/\D/g, "");
      if (digits.length >= 10) {
        updates.userphone = digits.slice(-10);
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Please provide at least a 10-digit phone number" });
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
        return res.status(404).json({ success: false, message: "User not found" });
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


// // GET orders (paginated)
// app.get('/user/orders', auth, async (req, res) => {
//   try {
//     const page = Math.max(1, parseInt(req.query.page) || 1);
//     const limit = Math.min(50, parseInt(req.query.limit) || 10);
//     const skip = (page - 1) * limit;

//     const [orders, total] = await Promise.all([
//       Order.find({ userId: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
//       Order.countDocuments({ userId: req.user._id })
//     ]);

//     res.json({ success: true, page, limit, total, orders });
//   } catch (err) {
//     console.error('/user/orders err', err);
//     res.status(500).json({ success:false, message: 'Failed to fetch orders' });
//   }
// });

// // GET single order
// app.get('/user/orders/:id', auth, async (req, res) => {
//   try {
//     const order = await Order.findOne({ _id: req.params.id, userId: req.user._id }).lean();
//     if (!order) return res.status(404).json({ success:false, message:'Order not found' });
//     res.json({ success:true, order });
//   } catch (err) {
//     console.error('/user/orders/:id err', err);
//     res.status(500).json({ success:false, message:'Error' });
//   }
// });



// ================== ORDERS ROUTES ==================

// Create new order (for logged-in user like porter)
// app.post(
//   "/orders",
//   auth,
//   asyncHandler(async (req, res) => {
//     const {
//       pickupAddress,
//       pickupPhone,
//       dropAddress,
//       dropPhone,
//       parcelDescription,
//       parcelWeightKg,
//       price,
//       paymentMethod,
//     } = req.body || {};

//     if (!pickupAddress || !dropAddress || !parcelDescription) {
//       return res.status(400).json({
//         success: false,
//         message: "pickupAddress, dropAddress and parcelDescription are required",
//       });
//     }

//     await connectDB();

//     const order = new Order({
//       userId: req.user._id,
//       pickupAddress,
//       pickupPhone,
//       dropAddress,
//       dropPhone,
//       parcelDescription,
//       parcelWeightKg: parcelWeightKg || 0,
//       price: price || 0,
//       paymentMethod: paymentMethod || "COD",
//     });

//     const saved = await order.save();

//     return res.status(201).json({ success: true, order: saved });
//   })
// );

// // Get all orders for logged-in user (with pagination for order create by user like porter)
// app.get(
//   "/orders",
//   auth,
//   asyncHandler(async (req, res) => {
//     const page = Math.max(1, parseInt(req.query.page) || 1);
//     const limit = Math.min(50, parseInt(req.query.limit) || 10);
//     const skip = (page - 1) * limit;

//     await connectDB();

//     const [orders, total] = await Promise.all([
//       Order.find({ userId: req.user._id })
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean(),
//       Order.countDocuments({ userId: req.user._id }),
//     ]);

//     return res.json({
//       success: true,
//       page,
//       limit,
//       total,
//       orders,
//     });
//   })
// );

// // Get single order detail
// app.get(
//   "/orders/:id",
//   auth,
//   asyncHandler(async (req, res) => {
//     await connectDB();

//     const order = await Order.findOne({
//       _id: req.params.id,
//       userId: req.user._id,
//     }).lean();

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     return res.json({ success: true, order });
//   })
// );

// Create product (admin use via Postman for now)
app.post(
  "/admin/products",
  auth, adminOnly,
  asyncHandler(async (req, res) => {
    const { name, description, price, imageUrl, category, stock } = req.body || {};

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
  auth, adminOnly,
  asyncHandler(async (req, res) => {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, products });
  })
);

app.put(
  "/admin/products/:id",
  auth, adminOnly,
  asyncHandler(async (req, res) => {
    const updates = {};
    const fields = ["name", "description", "price", "imageUrl", "category", "stock", "isActive"];
    fields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    await connectDB();
    const updated = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) return res.status(404).json({ success: false, message: "Product not found" });
    return res.json({ success: true, product: updated });
  })
);

app.delete(
  "/admin/products/:id",
  auth, adminOnly,
  asyncHandler(async (req, res) => {
    await connectDB();
    const deleted = await Product.findByIdAndDelete(req.params.id).lean();
    if (!deleted) return res.status(404).json({ success: false, message: "Product not found" });
    return res.json({ success: true, message: "Product deleted" });
  })
);

// GET /products?category=Fruits&q=milk&min=10&max=200&page=1&limit=24&sort=price_asc
app.get("/products", asyncHandler(async (req, res) => {
  await connectDB();

  const {
    category, q, min, max, page = 1, limit = 24, sort
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
    Product.countDocuments(filter)
  ]);

  return res.json({ success: true, page: p, limit: lim, total, products });
}));

// GET /categories  -> returns list of categories and counts (optional)
app.get("/categories", asyncHandler(async (req, res) => {
  await connectDB();

  // use aggregation to get counts per category (only active)
  const agg = await Product.aggregate([
    { $match: { isActive: true, category: { $exists: true, $ne: "" } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $project: { _id: 0, category: "$_id", count: 1 } },
    { $sort: { category: 1 } }
  ]);

  // fallback: if no categories found return empty array
  return res.json({ success: true, categories: agg });
}));


// Public list of active products
app.get(
  "/products",
  asyncHandler(async (req, res) => {
    await connectDB();

    const products = await Product.find({ isActive: true }).lean();
    return res.json({ success: true, products });
  })
);

// Create order from cart items
app.post(
  "/orders",
  auth,
  asyncHandler(async (req, res) => {
    const { items, deliveryAddress, paymentMethod } = req.body || {};

    if (!deliveryAddress || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "items[] and deliveryAddress are required",
      });
    }

    // validate items structure
    const cleanedItems = items
      .map((it) => ({
        productId: it.productId,
        quantity: Number(it.quantity || 0),
      }))
      .filter((it) => it.productId && it.quantity > 0);

    if (cleanedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one valid item (productId + quantity > 0) is required",
      });
    }

    await connectDB();

    const productIds = cleanedItems.map((it) => it.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    }).lean();

    if (products.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No valid products found in cart" });
    }

    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const orderItems = [];
    let totalAmount = 0;

    for (const it of cleanedItems) {
      const prod = productMap.get(String(it.productId));
      if (!prod) continue;

      const subtotal = prod.price * it.quantity;
      totalAmount += subtotal;

      orderItems.push({
        productId: prod._id,
        name: prod.name,
        price: prod.price,
        quantity: it.quantity,
        subtotal,
      });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart items are invalid or products inactive",
      });
    }

    const order = new Order({
      userId: req.user._id,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      paymentMethod: paymentMethod || "COD",
    });

    const saved = await order.save();

    return res
      .status(201)
      .json({ success: true, order: saved, message: "Order created" });
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
