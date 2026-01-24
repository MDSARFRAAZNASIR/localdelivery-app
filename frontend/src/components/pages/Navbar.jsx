// // src/components/Navbar.jsx
// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";

// export default function Navbar() {
//   const [open, setOpen] = useState(false);
//   const navigate = useNavigate();

//   // get user data from localStorage
//   let user = null;
//   try {
//     const stored = localStorage.getItem("userData");
//     if (stored) user = JSON.parse(stored);
//   } catch (e) {
//     console.error("Failed to parse userData:", e);
//   }
//   const username = user?.username || "User";
//   const email = user?.useremail || "";
//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("userData");
//     navigate("/login");
//   };

//   return (
//     <>
//       {/* <nav className="bg-white shadow sticky top-0 z-50"> */}
//         <nav className="flex items-center gap-3">
//         <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
//           {/* Logo */}
//           <Link to="/" className="font-bold text-lg text-orange-600">
//             LocalDelivery
//           </Link>

//           {/* Desktop Menu */}
//           {/* <div className="hidden md:flex gap-6 items-center hidden md:flex items-center gap-4"> */}
//            <div className="hidden md:flex items-center gap-6">
//             <Link
//               to="/products"
//               className={({ isActive }) =>
//                 `hover:text-orange-500 ${
//                   isActive ? "text-orange-500 font-semibold" : "text-gray-700"
//                 }`
//               }
//             >
//               Home
//             </Link>
//             <Link to="/userdashboard">Dashboard</Link>
//             <Link to="/profile">Profile</Link>
//             <Link to="/products">Products</Link>
//             <Link to="/cart">Cart</Link>
//             <Link to="/orders">Orders</Link>
//             <Link to="/address">Addressesbook</Link>
//             {user?.isAdmin && (<div className="hidden md:flex items-center gap-6"> 
//                 <Link to="/admin/products">Add Product</Link>
//             <Link to="/admin/service-areas">Area</Link>
//             <Link to="/admin/orders">Orders List</Link>

//             </div>
             

//             )}
           
//           </div>

//           {/* Mobile Button */}
//           <button className="md:hidden text-2xl" onClick={() => setOpen(!open)}>
//             ☰
//           </button>
//         </div>

//         {/* Mobile Menu */}
//         {open && (
//           <div className="md:hidden bg-white border-t px-4 py-3 space-y-3">
//             <Link onClick={() => setOpen(false)} to="/userdashboard">
//               Userdashboard
//             </Link>
//             <Link onClick={() => setOpen(false)} to="/profile">
//               Profile
//             </Link>
//             <Link onClick={() => setOpen(false)} to="/products">
//               Products
//             </Link>
//             <Link onClick={() => setOpen(false)} to="/cart">
//               Cart
//             </Link>
//             <Link onClick={() => setOpen(false)} to="/orders">
//               Orders
//             </Link>
//             <Link onClick={() => setOpen(false)} to="/addressbook">
//               Addresses
//             </Link>
//                {user?.isAdmin && (
//                 <div className="hidden md:flex items-center gap-6"> 
                
//             <Link onClick={() => setOpen(false)} to="/admin/products">
//               Add Product
//             </Link>
//             <Link onClick={() => setOpen(false)} to="/admin/service-areas">
//               Area
//             </Link>
//             <Link onClick={() => setOpen(false)} to="/admin/orders">
//               Orders List
//             </Link>
//             </div>
//             )}
//           </div>
//         )}
//         {/* Right: user info + logout */}
//         <div className="flex items-center gap-3">
//           <div className="text-right leading-tight hidden sm:block">
//             <div className="text-sm font-semibold text-gray-800">
//               {/* <h3>Hi</h3> */}
//               <span>Hi, </span>
//               {username}
//             </div>
//             <div className="text-xs text-gray-500 truncate max-w-[140px]">
//               {email}
//             </div>
//           </div>
//           <button
//             onClick={handleLogout}
//             className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded-md"
//           >
//             Logout
//           </button>
//         </div>
//       </nav>
//     </>
//   );
// }




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
