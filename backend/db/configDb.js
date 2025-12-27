

// // db/configDb.js
// const mongoose = require('mongoose');
// // const dotenv = require("dotenv");
// // dotenv.config();


// const connectDB = async () => {
//   const uri = process.env.MONGODB_URL;
//   if (!uri) {
//     throw new Error('MONGODB_URL is not defined in environment');
//   }

//   // Reuse an existing connection promise in serverless environments
//   if (global._mongoConnectPromise) {
//     // If mongoose already connected, simply return
//     if (mongoose.connection.readyState === 1) return mongoose;
//     // otherwise await reuse
//     await global._mongoConnectPromise;
//     return mongoose;
//   }

//   global._mongoConnectPromise = mongoose
//     .connect(uri, {
//       // modern mongoose does not require these options, but left for compatibility
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     })
//     .then((conn) => {
//       console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
//       return conn;
//     })
//     .catch((err) => {
//       // remove the global promise if connection fails, so next invocation can retry
//       global._mongoConnectPromise = null;
//       console.error('❌ MongoDB connection error:', err.message || err);
//       throw err;
//     });

//   await global._mongoConnectPromise;
//   return mongoose;
// };

// module.exports = connectDB;


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


