


// add new code
const jwt = require("jsonwebtoken");
const Userdetail = require("../db/models/userModel"); 
// 👆 adjust path if your file name differs

const auth = async (req, res, next) => {
  try {
    // 1️⃣ Read Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1];

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Fetch user from DB
    const user = await Userdetail.findById(decoded.id).lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 5️⃣ Attach user to request
    req.user = user;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

module.exports = auth;

