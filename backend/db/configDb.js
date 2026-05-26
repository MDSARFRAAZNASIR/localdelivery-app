


// // db/configDb.js
// const mongoose = require("mongoose");

// const connectDB = async () => {
//   const uri = process.env.MONGODB_URL;
//   if (!uri) {
//     throw new Error("MONGODB_URL is not defined in environment");
//   }

//   // Reuse connection in serverless (Vercel)
//   if (global._mongoConnectPromise) {
//     if (mongoose.connection.readyState === 1) return mongoose;
//     await global._mongoConnectPromise;
//     return mongoose;
//   }

//   global._mongoConnectPromise = mongoose
//     .connect(uri) // ✅ NO deprecated options
//     .then((conn) => {
//       console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
//       return conn;
//     })
//     .catch((err) => {
//       global._mongoConnectPromise = null;
//       console.error("❌ MongoDB connection error:", err.message || err);
//       throw err;
//     });

//   await global._mongoConnectPromise;
//   return mongoose;
// };

// module.exports = connectDB;


// add scalable
// db/configDb.js
const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URL;
  if (!uri) {
    throw new Error("MONGODB_URL is not defined in environment");
  }

  // 1. Check if mongoose is already fully connected
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // 2. If a connection is already in progress, wait for it
  if (global._mongoConnectPromise) {
    await global._mongoConnectPromise;
    return mongoose;
  }

  // 3. Create a new connection promise with production settings
  global._mongoConnectPromise = mongoose
    .connect(uri, {
      maxPoolSize: 5, // 🚀 Restricts connections per container to save DB memory
      serverSelectionTimeoutMS: 5000, // ⏳ Fails fast (5s) instead of hanging your Vercel functions
      socketTimeoutMS: 45000, // Closes idle connections safely
    })
    .then((conn) => {
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    })
    .catch((err) => {
      // Clear the global cache on failure so the next request can try again cleanly
      global._mongoConnectPromise = null;
      console.error("❌ MongoDB connection error:", err.message || err);
      throw err;
    });

  await global._mongoConnectPromise;
  return mongoose;
};

module.exports = connectDB;
