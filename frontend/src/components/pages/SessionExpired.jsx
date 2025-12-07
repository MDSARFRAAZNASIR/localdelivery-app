import React from "react";
import { useNavigate } from "react-router-dom";

export default function SessionExpired() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // just in case
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-3">
          Session Expired 🔐
        </h2>

        <p className="text-gray-600 mb-6">
          Your session has expired for security reasons.
          <br />
          Please log in again to continue.
        </p>

        <button
          onClick={handleLogin}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition"
        >
          Login Again
        </button>
      </div>
    </div>
  );
}
