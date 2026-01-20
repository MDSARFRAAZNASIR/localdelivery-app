// src/components/Navbar.jsx
import {React, useState} from "react";
import { useNavigate, NavLink, Link } from "react-router-dom";

export default function Navbar() {
   const [open, setOpen] = useState(false);
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
    <>
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="font-bold text-lg text-orange-600">
          LocalDelivery
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 items-center hidden md:flex items-center gap-4">
          <Link to="/products" className={({ isActive }) =>
            `hover:text-orange-500 ${
              isActive ? "text-orange-500 font-semibold" : "text-gray-700"
            }`
          }>Home</Link>
          <Link to="/userdashboard">Dashboard</Link>
          <Link to="/profile">Profile</Link>

          <Link to="/products">Products</Link>
          {/* <Link to="/cart">Cart</Link> */}
          <Link to="/orders">Orders</Link>
          <Link to="/admin/products">Add Product</Link>

          <Link to="/address">Addresses</Link>
          <Link to="/admin/service-areas">Area</Link>
          <Link to="/admin/orders">Orders List</Link>
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (

        <div className="md:hidden bg-white border-t px-4 py-3 space-y-3">
          <Link onClick={() => setOpen(false)} to="/products">Products</Link>
          <Link onClick={() => setOpen(false)} to="/cart">Cart</Link>
          <Link onClick={() => setOpen(false)} to="/orders">Orders</Link>
          <Link onClick={() => setOpen(false)} to="/addressbook">Addresses</Link>
        </div>
      )}
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
    {/* <nav className="w-full bg-white shadow-md px-4 py-3 flex items-center justify-between"> */}
      {/* Left: Logo / App name */}
      {/* <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/productpage")}
      >
        <span className="text-xl font-bold text-orange-500">LocalDelivery</span>
        <span className="text-xs text-gray-500 hidden sm:inline">
          Customer Panel
        </span>
      </div> */}

      {/* Center: nav links */}
      {/* <div className="hidden md:flex items-center gap-4"> */}
        {/* <NavLink
          to="/products"
          className={({ isActive }) =>
            `hover:text-orange-500 ${
              isActive ? "text-orange-500 font-semibold" : "text-gray-700"
            }`
          }
        >
          Home
        </NavLink> */}
        {/* <NavLink
          to="/userdashboard"
          className={({ isActive }) =>
            `hover:text-orange-500 ${
              isActive ? "text-orange-500 font-semibold" : "text-gray-700"
            }`
          }
        >
          Dashboard
        </NavLink> */}
        {/* Add more links later if needed */}
        {/* <NavLink
          to="/profile"
          className={({ isActive }) =>
            `hover:text-orange-500 ${
              isActive ? "text-orange-500 font-semibold" : "text-gray-700"
            }`
          }
        >
          Profile
        </NavLink> */}

        {/* <NavLink
          to="/products"
          className={({ isActive }) =>
            `hover:text-orange-500 ${
              isActive ? "text-orange-500 font-semibold" : "text-gray-700"
            }`
          }
        >
          Products
        </NavLink> */}

        {/* <NavLink
          to="/orders"
          className={({ isActive }) =>
            `hover:text-orange-500 ${
              isActive ? "text-orange-500 font-semibold" : "text-gray-700"
            }`
          }
        >
          Orders
        </NavLink> */}
        {/* <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            `hover:text-orange-500 ${
              isActive ? "text-orange-500 font-semibold" : "text-gray-700"
            }`
          }
        >
          add pro
        </NavLink> */}
        {/* <NavLink
          to="/address"
          className={({ isActive }) =>
            `hover:text-orange-500 ${
              isActive ? "text-orange-500 font-semibold" : "text-gray-700"
            }`
          }
        >
          My Adresses
        </NavLink> */}
      {/* </div> */}

      {/* Right: user info + logout */}
      {/* <div className="flex items-center gap-3">
        <div className="text-right leading-tight hidden sm:block">
          <div className="text-sm font-semibold text-gray-800">
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
      </div> */}
    {/* </nav> */}
    </>
  );
}
