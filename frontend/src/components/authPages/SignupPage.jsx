import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, NavLink, useNavigate } from "react-router-dom";
// import { toast } from "react-hot-toast";
// import axios from "axios";

export default function SignupPage() {
const [username, setUsername]=useState("")
  const [userphone, setUserphone] = useState("");
  const [useremail, setUseremail] = useState("");
  const [userpassword, setUserpassword] = useState("");
  const navigate = useNavigate();

  const [forgotEmail, setForgotEmail] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  // const userSignInHandler = async (e) => {
  //   e.preventDefault();
  //   try {
  //     let res = await axios.post(`${process.env.REACT_APP_API}/userregister`, {
  //       name,
  //       phone,
  //       email,
  //       password,
  //     });
  //     if (res && res.data.message) {
  //       toast.success(res.message && res.data);
  //       navigate = "/login";
  //     } else {
  //       toast.error(res.data.message);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     toast.error("Something went wrong");
  //   }
  // };

  // api integration

  // const userSignInHandler = async () => {
  //   console.log(username, userphone, useremail, userpassword);
  //   let result = await fetch("http://127.0.0.1:4500/userregister", {
  //     method: "POST",

  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({username, userphone, useremail, userpassword}),
  //   });
  //   result = await result.json();
  //   console.log(result);
  // };
const userSignInHandler = async () => {
  console.log(username, userphone, useremail, userpassword);
  try {
    let result = await fetch("http://localhost:4500/userregister", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, userphone, useremail, userpassword }),
    });

    result = await result.json();

    if (result._id) {
      alert("Signup successful 🎉");
      navigate("/productpage");   // ✅ go to login page
    } else {
      alert("Signup failed: " + (result.error || "Unknown error"));
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong, please try again");
  }
};

  
  // Forget Password submit
  const handleForgotPassword = (e) => {
    e.preventDefault();
    console.log("Forgot Password Email:", forgotEmail);
    alert("📩 Reset link sent to " + forgotEmail);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-100 to-yellow-200 p-6">
      <motion.div
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {!showForgot ? (
          <>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
              Sign Up 🚀
            </h2>
            <div className="space-y-5">
              <input
               type="text"
               placeholder="Full name"
               value={username}
               onChange={(e)=>setUsername(e.target.value)}
               required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-400"
              />
              <input
                type="tel"
                name="userphone"
                placeholder="Phone Number"
                value={userphone}
                onChange={(e) => setUserphone(e.target.value)}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-400"
              />
              <input
                type="email"
                name="useremail"
                placeholder="Email Address"
                value={useremail}
                onChange={(e) => setUseremail(e.target.value)}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-400"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={userpassword}
                onChange={(e) => setUserpassword(e.target.value)}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-400"
              />
              <button
                type="submit"
                onClick={userSignInHandler}
                className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition"
              >
                Sign Up
              </button>
            </div>
            <p className="text-sm text-center text-gray-600 mt-4">
              Have an Account{" "}
              <NavLink>
                <Link
                  to="login"
                  className="text-orange-500 font-medium hover:underline"
                >
                  LogIn
                </Link>
              </NavLink>
            </p>

            <p className="text-sm text-center text-gray-600 mt-4">
              Forgot your password?{" "}
              <button
                onClick={() => setShowForgot(true)}
                className="text-orange-500 font-medium hover:underline"
              >
                Click Here
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Forgot Password 🔑
            </h2>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-400"
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
              >
                Send Reset Link
              </button>
            </form>
            <p className="text-sm text-center text-gray-600 mt-4">
              Back to{" "}
              <button
                onClick={() => setShowForgot(false)}
                className="text-orange-500 font-medium hover:underline"
              >
                Sign Up
              </button>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
