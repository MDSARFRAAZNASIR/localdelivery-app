// const express = require("express");
// // const confiDb=require("./db/configDb")
// const connectDB = require("./db/configDb");
// const dotenv = require("dotenv");
// const colors = require("colors");
// const cors = require('cors');
// // const bcrypt=require("bcryptjs")

// // const User=require("./db/models/userSchemaDef")
// const User = require("./db/models/userSchemaDefined");
// //rest object
// const app = express();
// //configure env
// dotenv.config();
// //database config
// connectDB();
// // app.use(cors());

// //middleware
// app.use(express.json());




// // adding for live
// app.use(cors({
//   origin: [
//     "http://localhost:3000", // local testing
//     // "https://ignite3i-frontend.vercel.app", // your deployed domain
    
//     "https://localdelivery-app-frontend.vercel.app" // if frontend lives here instead
//   ],
 
// }));

// // ✅ Health check

// app.get("/", (req, res) => res.send("API is running successfully ✅"));

// // Routing and api's connecting Here
// // for registation

// app.post("/userregister", async (req, resp) => {
//   let user = new User(req.body);
//   let result = await user.save();
//   //    resp.send("api is progress")
//   resp.send(result);
//   resp.send("Succesfull singUp")
// });
 // server.js
require('express-async-errors'); // optional: npm i express-async-errors
const express = require('express');
const connectDB = require('./db/configDb');
const dotenv = require('dotenv');
const colors = require('colors'); // optional
const cors = require('cors');

// Load env first
dotenv.config();

const app = express();

// Connect DB (ensure MONGO_URI is set in env)
connectDB().catch(err => {
  console.error('Failed to connect DB at startup:', err);
});

// Middleware
app.use(express.json());

// CORS (allow list)
const allowedOrigins = [
  'http://localhost:3000',
  'https://localdelivery-app-frontend.vercel.app'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(204).end();
    return next();
  }
  // Blocked origin
  res.status(403).json({ success: false, message: 'CORS blocked' });
});

// Health
app.get('/', (req, res) => res.send('API is running successfully ✅'));

// Model
const User = require('./db/models/userSchemaDefined');

// Registration route - robust
app.post('/userregister', async (req, res, next) => {
  try {
    const { username, userphone, useremail, userpassword } = req.body || {};

    if (!username || !userphone || !useremail || !userpassword) {
      return res.status(400).json({ success: false, message: 'username, userphone, useremail and userpassword are required' });
    }

    const user = new User(req.body);
    const result = await user.save();

    const safe = result.toObject();
    delete safe.userpassword;

    return res.status(201).json({ success: true, user: safe });
  } catch (err) {
    console.error('/userregister error ->', err && (err.stack || err.message || err));

    // duplicate key (unique) error
    if (err && err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || 'field';
      return res.status(409).json({ success: false, message: `${field} already exists` });
    }

    // validation or other errors
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : (err.message || 'Server error')
    });
  }
});

// Global error handler (last)
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR', err && (err.stack || err.message || err));
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

// If running locally: start server. If deploying serverless, remove this or keep for local dev.
if (process.env.NODE_ENV !== 'vercel') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on ${PORT}`.yellow));
}

// Export app for serverless adapters if needed (Vercel setups may require /api functions instead)
module.exports = app;


//   for LogIn
app.post("/userlogin", async (req, resp) => {
  const { useremail, userpassword } = req.body;

  if (!useremail || !userpassword) {
    return resp.status(400).json({ message: "All fields required" });
  }

  // 1. Find user only by email
  const user = await User.findOne({ useremail });

  if (!user) {
    return resp.status(404).json({ message: "User Not Found" });
  }

  // 2. Compare password
  const isMatch = await bcrypt.compare(userpassword, user.userpassword);

  if (!isMatch) {
    return resp.status(401).json({ message: "Invalid Password" });
  }

  // 3. Remove password before sending
  const userData = user.toObject();
  delete userData.userpassword;

  return resp.status(200).json({
    message: "Login Successful",
    user: userData
  });
});


//run listen
//  for local server
// const PORT = process.env.PORT || 4500;
// app.listen(PORT, () => {
//   console.log(
//     `server running on ${process.env.DEV_NODE} mode on port ${PORT}`.bgCyan
//       .white
//   );
// });

// do not use app.listen in vercel
// for the vercel
module.exports=app
