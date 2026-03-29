


// db/configDb.js
const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URL;
  if (!uri) {
    throw new Error("MONGODB_URL is not defined in environment");
  }

  // Reuse connection in serverless (Vercel)
  if (global._mongoConnectPromise) {
    if (mongoose.connection.readyState === 1) return mongoose;
    await global._mongoConnectPromise;
    return mongoose;
  }

  global._mongoConnectPromise = mongoose
    .connect(uri) // ✅ NO deprecated options
    .then((conn) => {
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    })
    .catch((err) => {
      global._mongoConnectPromise = null;
      console.error("❌ MongoDB connection error:", err.message || err);
      throw err;
    });

  await global._mongoConnectPromise;
  return mongoose;
};

module.exports = connectDB;


