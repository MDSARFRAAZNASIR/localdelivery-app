import { React, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../context/LoadingContext";

export default function LogInPage() {
  const [useremail, setUseremail] = useState("");
  const [userpassword, setUserpassword] = useState("");
  const navigate = useNavigate();
  const { setLoading } = useLoading();



  // add token
  const userLogInHandler = async () => {
    try {
      setLoading(true);
      // console.log("login attempt:", useremail, userpassword);

      const res = await fetch(
        "https://localdelivery-app-backend.vercel.app/userlogin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ useremail, userpassword }),
        }
      );

      // If not JSON, read text (avoid uncaught SyntaxError)
      const contentType = res.headers.get("Content-Type") || "";
      let payload;

      if (contentType.includes("application/json")) {
        payload = await res.json();
      } else {
        const text = await res.text();
        try {
          payload = JSON.parse(text);
        } catch {
          payload = { message: text || "Unexpected response", ok: res.ok };
        }
      }

      // ❌ Login failed
      if (!res.ok) {
        alert(payload.message || `Login failed (status ${res.status})`);
        console.error("Login failed:", res.status, payload);
        return;
      }

      console.log("Login success payload:", payload);

      // ✅ SUCCESS CHECK
      if (payload.success && payload.token && payload.user) {
        // ⭐ STORE JWT TOKEN (IMPORTANT)
        localStorage.setItem("token", payload.token);

        // optional: store user data
        localStorage.setItem("userData", JSON.stringify(payload.user));

        alert("Login successful 🎉");

        // redirect to protected route
        // navigate("/productpage"); // or /dashboard
        navigate("/products");
      } else {
        alert(payload.message || "Login failed: invalid server response");
        console.warn("Unexpected login payload:", payload);
      }
      
    }
    catch (err) {
      console.error("Login error:", err);
      alert("Network error or server not reachable.");
    } finally{
      setLoading(false)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-yellow-100 to-orange-200 p-6">
      <motion.div
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Welcome Back 👋
        </h2>

        <input
          type="useremail"
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
          placeholder="Your Password"
          value={userpassword}
          onChange={(e) => setUserpassword(e.target.value)}
          required
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-400"
        />
        <button
          type="submit"
          onClick={userLogInHandler}
          className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition"
        >
          Login
        </button>

        <p className="text-sm text-center text-gray-600 mt-4">
          Forgot password?{" "}
          <a
            href="/forgot"
            className="text-blue-500 font-medium hover:underline"
          >
            Reset Here
          </a>
        </p>
        <p className="text-sm text-center text-gray-600 mt-2">
          Don’t have an account?{" "}
          <a
            href="/signup"
            className="text-orange-500 font-medium hover:underline"
          >
            Sign Up
          </a>
        </p>
      </motion.div>
    </div>
  );
}
