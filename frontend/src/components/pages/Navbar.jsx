// src/components/Navbar.jsx
import React from "react";
import { useNavigate, NavLink } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  // get user data from localStorage
  let user = null;
  try {
    const stored = localStorage.getItem("userData");
    if (stored) user = JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse userData:", e);
  }

  const username = user?.username || "User";
  const email = user?.useremail || "";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  return (
    <nav className="w-full bg-white shadow-md px-4 py-3 flex items-center justify-between">
      {/* Left: Logo / App name */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/productpage")}
      >
        <span className="text-xl font-bold text-orange-500">LocalDelivery</span>
        <span className="text-xs text-gray-500 hidden sm:inline">
          Customer Panel
        </span>
      </div>

      {/* Center: nav links */}
      <div className="hidden sm:flex gap-4 text-sm">
        <NavLink
          to="/products"
          className={({ isActive }) =>
            `hover:text-orange-500 ${
              isActive ? "text-orange-500 font-semibold" : "text-gray-700"
            }`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/userdashboard"
          className={({ isActive }) =>
            `hover:text-orange-500 ${
              isActive ? "text-orange-500 font-semibold" : "text-gray-700"
            }`
          }
        >
          Dashboard
        </NavLink>
        {/* Add more links later if needed */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `hover:text-orange-500 ${
              isActive ? "text-orange-500 font-semibold" : "text-gray-700"
            }`
          }
        >
          Profile
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            `hover:text-orange-500 ${
              isActive ? "text-orange-500 font-semibold" : "text-gray-700"
            }`
          }
        >
          Products
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `hover:text-orange-500 ${
              isActive ? "text-orange-500 font-semibold" : "text-gray-700"
            }`
          }
        >
          Orders
        </NavLink>
        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            `hover:text-orange-500 ${
              isActive ? "text-orange-500 font-semibold" : "text-gray-700"
            }`
          }
        >
          add pro
        </NavLink>
        <NavLink
          to="/address"
          className={({ isActive }) =>
            `hover:text-orange-500 ${
              isActive ? "text-orange-500 font-semibold" : "text-gray-700"
            }`
          }
        >
          My Adresses
        </NavLink>
      </div>

      {/* Right: user info + logout */}
      <div className="flex items-center gap-3">
        <div className="text-right leading-tight hidden sm:block">
          <div className="text-sm font-semibold text-gray-800">
            {/* <h3>Hi</h3> */}
            <span>Hi, </span>
            {username}
          </div>
          <div className="text-xs text-gray-500 truncate max-w-[140px]">
            {email}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded-md"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
