import React from "react";
import { useNavigate } from "react-router-dom";

export default function UserDashboard({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login"); // simple logout
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-100 to-yellow-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🚀 My Dashboard</h1>
        {user && (
          <div className="flex items-center space-x-4">
            <span className="font-medium text-gray-700">Hi, {user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Welcome {user ? user.name : "Guest"} 🎉</h2>
        <p className="text-gray-600">
          This is your personal dashboard. Here you can manage orders, track deliveries, and much more.
        </p>
      </div>
    </div>
  );
}
