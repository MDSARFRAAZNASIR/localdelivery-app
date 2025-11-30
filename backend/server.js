const express = require("express");
const cors = require('cors');
//rest object
const app = express();
const dotenv = require("dotenv");
const connectDB = require("./db/configDb");
const User = require("./db/models/userSchemaDefined");
const colors = require("colors");
app.use(cors());
//middleware
app.use(express.json());

//configure env
dotenv.config();
//database config
connectDB();
// app.use(cors());

// adding for live
app.use(cors({
  origin: [
    "http://localhost:3000", // local testing
    // "https://ignite3i-frontend.vercel.app", // your deployed domain
    
    "https://localdelivery-app-frontend.vercel.app" // if frontend lives here instead
  ],
 
}));

// ✅ Health check

app.get("/", (req, res) => res.send("API is running successfully ✅"));

// Routing and api's connecting Here
// for registation

app.post("/userregister", async (req, resp) => {
  let user = new User(req.body);
  let result = await user.save();
  //    resp.send("api is progress")
  resp.send(result);
  resp.send("Succesfull singUp")
});


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
