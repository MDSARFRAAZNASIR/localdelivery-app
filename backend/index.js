// const express = require("express");
// const cors = require('cors');
// //rest object
// const app = express();
// const dotenv = require("dotenv");
// const connectDB = require("./db/configDb");
// const User = require("./db/models/userSchemaDefined");
// const colors = require("colors");
// app.use(cors());
// //middleware
// app.use(express.json());

// //configure env
// dotenv.config();
// //database config
// connectDB();
// app.use(cors());

// adding for live
// app.use(cors({
//   origin: [
//     "http://localhost:3000", // local testing
//     "https://localdelivery-app-frontend.vercel.app" // if frontend lives here instead
//   ],
 
// }));

// ✅ Health check

// app.get("/", (req, res) => res.send("API is running successfully ✅"));

// Routing and api's connecting Here
// for registation

// app.post("/userregister", async (req, resp) => {
//   let user = new User(req.body);
//   let result = await user.save();
//   //    resp.send("api is progress")
//   resp.send(result);
//   resp.send("Succesfull singUp")
// });


//   for LogIn
// app.post("/userlogin", async (req, resp) => {
//   const { useremail, userpassword } = req.body;

//   if (!useremail || !userpassword) {
//     return resp.status(400).json({ message: "All fields required" });
//   }

  // 1. Find user only by email
  // const user = await User.findOne({ useremail });

  // if (!user) {
  //   return resp.status(404).json({ message: "User Not Found" });
  // }

  // 2. Compare password
  // const isMatch = await bcrypt.compare(userpassword, user.userpassword);

  // if (!isMatch) {
  //   return resp.status(401).json({ message: "Invalid Password" });
  // }

  // 3. Remove password before sending
//   const userData = user.toObject();
//   delete userData.userpassword;

//   return resp.status(200).json({
//     message: "Login Successful",
//     user: userData
//   });
// });


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
// module.exports=app


// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const colors = require('colors'); // optional
const connectDB = require('./db/configDb');
const User = require('./db/models/userSchemaDefined');
const bcrypt = require('bcryptjs');

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
      'http://localhost:3000',
      'https://localdelivery-app-frontend.vercel.app',
      'https://localdelivery-app.vercel.app',
    ],
  })
);

// small async wrapper to catch errors from async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// connect DB (serverless-safe) — attempt once at startup (local). Serverless handlers also call connectDB before DB ops.
connectDB().catch((err) => {
  console.error('Initial DB connect failed:', err && err.message);
});

// Health
app.get('/', (req, res) => res.send('API is running successfully ✅'));

// Register
// app.post(
//   '/userregister',
//   asyncHandler(async (req, res) => {
//     const { username, useremail, userpassword, userphone } = req.body || {};

//     if (!username || !useremail || !userpassword) {
//       return res.status(400).json({
//         success: false,
//         message: 'username, useremail and userpassword are required',
//       });
//     }

//     // normalize email
//     const normalizedEmail = String(useremail).trim().toLowerCase();

//     // if phone provided, normalize and validate; else leave undefined
//     let phoneFinal;
//     if (typeof userphone !== 'undefined' && userphone !== null && String(userphone).trim() !== '') {
//       let digits = String(userphone).replace(/\D/g, '');
//       if (digits.length > 10) digits = digits.slice(-10);
//       if (!/^[0-9]{10}$/.test(digits)) {
//         return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit phone number' });
//       }
//       phoneFinal = digits;
//     }

//     // create user object
//     const toSave = {
//       username,
//       useremail: normalizedEmail,
//       userpassword,
//     };
//     if (phoneFinal) toSave.userphone = phoneFinal;

//     // ensure DB is connected (serverless will wait here if needed)
//     await connectDB();

//     const user = new User(toSave);
//     const saved = await user.save();

//     const safe = saved.toObject();
//     delete safe.userpassword;

//     return res.status(201).json({ success: true, user: safe });
//   })
// );

// Register (replace the previous handler body with this)
app.post(
  '/userregister',
  asyncHandler(async (req, res) => {
    const { username, useremail, userpassword, userphone } = req.body || {};

    if (!username || !useremail || !userpassword) {
      return res.status(400).json({
        success: false,
        message: 'username, useremail and userpassword are required',
      });
    }

    // normalize email
    const normalizedEmail = String(useremail).trim().toLowerCase();

    // === phone normalization (Option A: accept many formats, store last 10 digits) ===
    let phoneFinal;
    if (typeof userphone !== 'undefined' && userphone !== null && String(userphone).trim() !== '') {
      // remove all non-digits
      const digits = String(userphone).replace(/\D/g, '');
      if (digits.length >= 10) {
        // keep last 10 digits (works for +91XXXXXXXXXX and other prefixes)
        phoneFinal = digits.slice(-10);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Please provide at least a 10-digit phone number',
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


// Login
app.post(
  '/userlogin',
  asyncHandler(async (req, res) => {
    const { useremail, userpassword } = req.body || {};
    if (!useremail || !userpassword) {
      return res.status(400).json({ message: 'All fields required' });
    }

    await connectDB();

    const user = await User.findOne({ useremail: String(useremail).trim().toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User Not Found' });

    const isMatch = await bcrypt.compare(userpassword, user.userpassword);
    if (!isMatch) return res.status(401).json({ message: 'Invalid Password' });

    const userData = user.toObject();
    delete userData.userpassword;

    return res.status(200).json({ message: 'Login Successful', user: userData });
  })
);

// GLOBAL error handler (single, last middleware)
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err && (err.stack || err.message || err));
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
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
