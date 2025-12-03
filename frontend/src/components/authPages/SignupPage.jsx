import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [userphone, setUserphone] = useState("");
  const [useremail, setUseremail] = useState("");
  const [userpassword, setUserpassword] = useState("");
  const navigate = useNavigate();

  const [forgotEmail, setForgotEmail] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  // const userSignInHandler = async () => {
  //   console.log(username, userphone, useremail, userpassword);
  //   try {
  //     let result = await fetch("https://localdelivery-app-backend.vercel.app/userregister",
  //       {
  //         method: "post",
  //           headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           username,
  //           userphone,
  //           useremail,
  //           userpassword,
  //         }),
        
  //       }
  //     );

  //     result = await result.json();

  //     if (result._id) {
  //       alert("Signup successful 🎉");
  //       navigate("/productpage");
  //     } else {
  //       alert("Signup failed: " + (result.error || "Unknown error"));
  //     }
  //   } catch (err) {
  //     // console.error(err);
  //     alert("Something went wrong, please try again");
  //   }
  // };


  // add another
  const userSignInHandler = async () => {
  console.log("Signing up:", { username, useremail, userpassword });
  try {
    const resp = await fetch("https://localdelivery-app-backend.vercel.app/userregister", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        // userphone, // omitted if you removed phone
        useremail,
        userpassword,
      }),
    });

    // read response text first for robust logging
    const text = await resp.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      // Not JSON — show raw text
      console.error("Signup: non-json response:", text);
      alert("Signup failed: Unexpected server response");
      return;
    }

    console.log("Signup response:", resp.status, result);

    // Success when backend returned success:true and user object (or resp.ok)
    if ((result && result.success && result.user && result.user._id) || (result && result._id)) {
      alert("Signup successful 🎉");
      // optionally store user in state/localStorage before navigating
      navigate("/productpage");
      return;
    }

    // if server provided a message, show it
    const serverMsg = result && (result.message || result.error || (result.user && result.user.message));
    alert("Signup failed: " + (serverMsg || JSON.stringify(result) || "Unknown error"));
  } catch (err) {
    console.error("Signup network/error:", err);
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
                onChange={(e) => setUsername(e.target.value)}
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
                name="userpassword"
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
