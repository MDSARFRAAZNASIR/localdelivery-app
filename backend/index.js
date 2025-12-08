

// index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const colors = require("colors"); // optional
const connectDB = require("./db/configDb");
const User = require("./db/models/userSchemaDefined");
const Order = require('./db/models/order');
const auth = require('./middleware/auth');

const bcrypt = require("bcryptjs");


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


// add other route
// inside index.js (or separate router)

// GET profile
app.get('/user/profile', auth, async (req, res) => {
  // req.user from middleware
  const user = req.user;
  // remove sensitive if any
  delete user.userpassword;
  res.json({ success: true, user });
});

// PUT update profile
app.put('/user/profile', auth, async (req, res) => {
  try {
    const updates = {};
    const allowed = ['username', 'userphone', 'useremail'];
    allowed.forEach(k => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    // (Optional) validate phone/email here
    const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).lean();
    delete updated.userpassword;
    res.json({ success: true, user: updated });
  } catch (err) {
    console.error('/user/profile PUT err', err);
    res.status(400).json({ success:false, message: err.message || 'Update failed' });
  }
});

// GET orders (paginated)
app.get('/user/orders', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ userId: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments({ userId: req.user._id })
    ]);

    res.json({ success: true, page, limit, total, orders });
  } catch (err) {
    console.error('/user/orders err', err);
    res.status(500).json({ success:false, message: 'Failed to fetch orders' });
  }
});

// GET single order
app.get('/user/orders/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!order) return res.status(404).json({ success:false, message:'Order not found' });
    res.json({ success:true, order });
  } catch (err) {
    console.error('/user/orders/:id err', err);
    res.status(500).json({ success:false, message:'Error' });
  }
});



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
