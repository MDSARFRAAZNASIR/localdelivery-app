import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, NavLink } from "react-router-dom";


export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const [forgotEmail, setForgotEmail] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  // handle form input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // SignUp submit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("User Signed Up:", formData);
    alert("✅ SignUp Successful! (Check console)");
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-400"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-400"
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-400"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-400"
              />
              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition"
              >
                Sign Up
              </button>
            </form>
             <p className="text-sm text-center text-gray-600 mt-4">
              Have an Account{" "}
              <NavLink> 
                <Link to='login' className="text-orange-500 font-medium hover:underline">LogIn</Link>

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
