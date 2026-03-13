


// src/components/Navbar.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  let user = null;
  try {
    const stored = localStorage.getItem("userData");
    if (stored) user = JSON.parse(stored);
  } catch {}

  const username = user?.username || "User";
  const email = user?.useremail || "";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="text-lg font-bold text-orange-600">
          LocalDelivery
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 text-sm">
                   <Link to="/userdashboard" className="hover:text-orange-500">Dashboard</Link>

          <Link to="/products" className="hover:text-orange-500">Products</Link>
          <Link to="/orders" className="hover:text-orange-500">Orders</Link>
          <Link to="/cart" className="hover:text-orange-500">Cart</Link>

          <Link to="/address" className="hover:text-orange-500">Addresses</Link>
          <Link to="/profile" className="hover:text-orange-500">Profile</Link>



          {/* for admin */}
           {user?.isAdmin && (
            <div className="hidden md:flex items-center gap-6 text-sm"> 
           
               <Link to="/admin/products"  className="hover:text-orange-500">Add Product</Link> 
                         <Link to="/admin/service-areas"  className="hover:text-orange-500">Area</Link>

         <Link to="/admin/orders"  className="hover:text-orange-500">Orders List</Link>

            </div>
             

            )}
          
        </div>

        {/* Desktop User */}
        <div className="hidden md:flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-semibold">Hi, {username}</div>
            <div className="text-xs text-gray-500 truncate max-w-[150px]">
              {email}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1.5 rounded text-sm"
          >
            Logout
          </button>
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
        <div className="md:hidden bg-white border-t px-4 py-4 space-y-4">
          
          {/* User Info */}
          <div className="border-b pb-3">
            <div className="font-semibold">Hi, {username}</div>
            <div className="text-xs text-gray-500">{email}</div>
          </div>

          {/* Links */}
          <Link onClick={() => setOpen(false)} to="/userdashboard" className="block">
            UserDashboard
          </Link>
          <Link onClick={() => setOpen(false)} to="/products" className="block">
            Products
          </Link>
          <Link onClick={() => setOpen(false)} to="/cart" className="block">
            Cart
          </Link>
          
          <Link onClick={() => setOpen(false)} to="/orders" className="block">
            Orders
          </Link>
          <Link onClick={() => setOpen(false)} to="/address" className="block">
            AddressesBook
          </Link>
          <Link onClick={() => setOpen(false)} to="/profile" className="block">
            Profile
          </Link>

          {/* for admin */}
            {user?.isAdmin && (
              <div className=" md:hidden bg-white border-t px-4 py-4 space-y-4">
       
                
            <Link onClick={() => setOpen(false)} to="/admin/products" className="block">
              Add Product
            </Link>
            <Link onClick={() => setOpen(false)} to="/admin/service-areas " className="block">
              Area
            </Link>
            <Link onClick={() => setOpen(false)} to="/admin/orders" className="block">
              Orders List
            </Link>
            </div>
     
            )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
