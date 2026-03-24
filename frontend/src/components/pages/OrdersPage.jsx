// // another order page
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// // import Navbar from "../components/Navbar";
// import Navbar from "./Navbar";

// export default function OrdersPage() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     const fetchOrders = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const res = await fetch(
//           "https://localdelivery-app-backend.vercel.app/orders",
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           },
//         );

//         const data = await res.json();

//         if (!res.ok || !data.success) {
//           throw new Error(data.message || "Failed to load orders");
//         }

//         setOrders(data.orders || []);
//       } catch (err) {
//         console.error("Orders fetch error:", err);
//         setError(err.message || "Error loading orders");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, [token, navigate]);

//   const formatDate = (dateStr) => {
//     if (!dateStr) return "";
//     const d = new Date(dateStr);
//     return d.toLocaleString();
//   };

//   // const statusColor = (status) => {
//   //   switch (status) {
//   //     case "CREATED":
//   //       return "bg-gray-200 text-gray-800";
//   //     case "CONFIRMED":
//   //       return "bg-blue-100 text-blue-700";
//   //     case "DISPATCHED":
//   //       return "bg-purple-100 text-purple-700";
//   //     case "DELIVERED":
//   //       return "bg-green-100 text-green-700";
//   //     case "CANCELLED":
//   //       return "bg-red-100 text-red-700";
//   //     default:
//   //       return "bg-gray-200 text-gray-800";
//   //   }
//   // };

//   const statusColor = (status) => {
//     switch (status) {
//       case "CREATED":
//         return "bg-gray-200 text-gray-800";
//       case "CONFIRMED":
//         return "bg-blue-100 text-blue-700";
//       case "OUT_FOR_DELIVERY":
//         return "bg-orange-100 text-orange-700";
//       case "DELIVERED":
//         return "bg-green-100 text-green-700";
//       case "CANCELLED":
//         return "bg-red-100 text-red-700";
//       default:
//         return "bg-gray-100 text-gray-600";
//     }
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="min-h-screen bg-gray-100 py-8 px-4 flex justify-center">
//         <div className="w-full max-w-4xl">
//           {/* <div className="flex justify-between items-center mb-4"> */}
//           {/* new responsive */}
//           <div className="flex flex-col sm:flex:row sm:justify-between sm:items-center gap-3 mb-6">
//             <h2 className="text-2xl font-bold text-gray-800">Your Orders 📦</h2>
//             <button
//               onClick={() => navigate("/products")}
//               className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-lg w-ful sm:w-auto"
//             >
//               + Shop More
//             </button>

//             {/* add invoice */}
//           </div>

//           {loading ? (
//             <div>Loading orders...</div>
//           ) : error ? (
//             <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>
//           ) : orders.length === 0 ? (
//             <div className="bg-white p-4 rounded shadow">
//               No orders yet. Start shopping from Products! 🛒
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {orders.map((order) => (
//                 <div
//                   key={order._id}
//                   className="bg-white p-4 rounded-lg shadow border space-y-3"
//                 >
//                   {/* new responsive */}

//                   <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
//                     <div>
//                       <div className="text-sm text-gray-500">
//                         Order ID:{" "}
//                         <span className="font-mono">{order._id.slice(-8)}</span>
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         Placed: {formatDate(order.createdAt)}
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-3">
//                       <span
//                         className={`text-xs px-3 py-1 rounded-full ${statusColor(
//                           order.status,
//                         )}`}
//                       >
//                         {order.status}
//                       </span>

//                       <button
//                         onClick={() => navigate(`/invoice/${order._id}`)}
//                         className="text-sm text-blue-600 underline"
//                       >
//                         Invoice
//                       </button>
//                     </div>
//                   </div>

//                   <div className="text-sm text-gray-600 space-y-1">
//                     {order.deliveryAddress &&
//                     typeof order.deliveryAddress === "object" ? (
//                       <>
//                         <div className="font-medium">
//                           {order.deliveryAddress.name || "Customer"}
//                           {order.deliveryAddress.label &&
//                             ` (${order.deliveryAddress.label})`}
//                         </div>

//                         <div>{order.deliveryAddress.addressLine}</div>

//                         <div>
//                           {order.deliveryAddress.city},{" "}
//                           {order.deliveryAddress.state} –{" "}
//                           {order.deliveryAddress.pincode}
//                         </div>

//                         <div className="text-xs text-gray-500">
//                           📞 {order.deliveryAddress.phone}
//                         </div>
//                       </>
//                     ) : (
//                       <span className="italic text-gray-400">
//                         Address not available
//                       </span>
//                     )}
//                   </div>

//                   {/* new responsive for items */}

//                   <div>
//                     <div className="text-sm font-medium text-gray-700 mb-2">
//                       Items
//                     </div>

//                     <ul className="space-y-2">
//                       {order.items.map((it, idx) => (
//                         <li
//                           key={idx}
//                           className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm"
//                         >
//                           <span>
//                             {it.name} × {it.quantity}
//                           </span>

//                           <span className="text-gray-700">
//                             ₹{it.price} × {it.quantity} ={" "}
//                             <span className="font-semibold">
//                               ₹{it.subtotal}
//                             </span>
//                           </span>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>

//                   {/* ne responsive paytem page add */}

//                   <div className="border-t pt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
//                     <div className="text-sm text-gray-600">
//                       Payment:{" "}
//                       <span className="font-medium">{order.paymentMethod}</span>
//                     </div>

//                     <div className="text-lg font-bold text-orange-600">
//                       Total: ₹{order.totalAmount}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Navbar from "./Navbar";

// export default function OrdersPage() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     const fetchOrders = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const res = await fetch(
//           "https://localdelivery-app-backend.vercel.app/orders",
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         const data = await res.json();

//         if (!res.ok || !data.success) {
//           throw new Error(data.message || "Failed to load orders");
//         }

//         setOrders(data.orders || []);
//       } catch (err) {
//         console.error("Orders fetch error:", err);
//         setError(err.message || "Error loading orders");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, [token, navigate]);

//   const formatDate = (dateStr) => {
//     if (!dateStr) return "";
//     const d = new Date(dateStr);
//     return d.toLocaleString("en-IN", {
//       dateStyle: "medium",
//       timeStyle: "short",
//     });
//   };

//   const statusColor = (status) => {
//     switch (status) {
//       case "CREATED":
//         return "bg-gray-100 text-gray-600 border-gray-200";
//       case "CONFIRMED":
//         return "bg-blue-50 text-blue-600 border-blue-100";
//       case "OUT_FOR_DELIVERY":
//         return "bg-orange-50 text-orange-600 border-orange-100";
//       case "DELIVERED":
//         return "bg-green-50 text-green-600 border-green-100";
//       case "CANCELLED":
//         return "bg-red-50 text-red-600 border-red-100";
//       default:
//         return "bg-gray-50 text-gray-500 border-gray-100";
//     }
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="min-h-screen bg-[#f8f9fa] py-10 px-4">
//         <div className="max-w-4xl mx-auto">

//           {/* Header Section */}
//           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
//             <div>
//               <h2 className="text-3xl font-black text-gray-900 tracking-tight">
//                 Order History 📦
//               </h2>
//               <p className="text-gray-500 text-sm font-medium mt-1">
//                 You have placed {orders.length} orders so far.
//               </p>
//             </div>
//             <button
//               onClick={() => navigate("/products")}
//               className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-orange-100 transition-all active:scale-95 text-sm"
//             >
//               + New Order
//             </button>
//           </div>

//           {loading ? (
//             <div className="flex flex-col items-center justify-center py-20 space-y-4">
//               <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
//               <p className="text-gray-400 font-bold text-sm">Loading your history...</p>
//             </div>
//           ) : error ? (
//             <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 text-sm font-bold text-center">
//               ⚠️ {error}
//             </div>
//           ) : orders.length === 0 ? (
//             <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
//               <div className="text-5xl mb-4">🛒</div>
//               <h3 className="text-lg font-bold text-gray-800">No orders yet</h3>
//               <p className="text-gray-500 text-sm mb-6">Looks like you haven't ordered anything yet.</p>
//               <button
//                  onClick={() => navigate("/products")}
//                  className="text-orange-500 font-black text-sm hover:underline"
//               >
//                 Browse Products →
//               </button>
//             </div>
//           ) : (
//             <div className="grid gap-6">
//               {orders.map((order) => (
//                 <div
//                   key={order._id}
//                   className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
//                 >
//                   {/* Card Header */}
//                   <div className="p-5 border-b border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
//                     <div className="flex items-center gap-3">
//                       <div className="bg-white p-2 rounded-lg shadow-sm">
//                         <span className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Order</span>
//                         <div className="font-mono font-bold text-gray-800">#{order._id.slice(-8)}</div>
//                       </div>
//                       <div>
//                         <div className="text-[10px] font-black text-gray-400 uppercase">Placed On</div>
//                         <div className="text-xs font-bold text-gray-700">{formatDate(order.createdAt)}</div>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2">
//                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border ${statusColor(order.status)} uppercase tracking-tighter`}>
//                         {order.status.replace(/_/g, " ")}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Card Body */}
//                   <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {/* Items Summary */}
//                     <div>
//                       <h4 className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Items</h4>
//                       <ul className="space-y-2">
//                         {order.items.slice(0, 2).map((it, idx) => (
//                           <li key={idx} className="text-xs font-bold text-gray-700 flex justify-between">
//                             <span>{it.name} <span className="text-gray-400 font-medium">× {it.quantity}</span></span>
//                             <span>₹{it.subtotal}</span>
//                           </li>
//                         ))}
//                         {order.items.length > 2 && (
//                           <li className="text-[10px] font-bold text-orange-500 italic">
//                             + {order.items.length - 2} more items
//                           </li>
//                         )}
//                       </ul>
//                     </div>

//                     {/* Delivery Summary */}
//                     <div>
//                       <h4 className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Ship To</h4>
//                       {order.deliveryAddress && typeof order.deliveryAddress === "object" ? (
//                         <div className="text-xs leading-relaxed text-gray-600 font-medium">
//                           <span className="text-gray-800 font-bold">{order.deliveryAddress.name}</span><br/>
//                           {order.deliveryAddress.addressLine}, {order.deliveryAddress.city}
//                         </div>
//                       ) : (
//                         <p className="text-xs italic text-gray-400 font-medium">Address detail unavailable</p>
//                       )}
//                     </div>
//                   </div>

//                   {/* Card Footer */}
//                   <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
//                     <div className="flex items-center gap-4 w-full sm:w-auto">
//                         <div className="text-sm">
//                             <span className="text-gray-400 font-bold">Total: </span>
//                             <span className="text-lg font-black text-gray-900">₹{order.totalAmount}</span>
//                         </div>
//                         <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded uppercase">{order.paymentMethod}</span>
//                     </div>

//                     <div className="flex gap-2 w-full sm:w-auto">
//                         <button
//                           onClick={() => navigate(`/invoice/${order._id}`)}
//                           className="flex-1 sm:flex-none text-xs font-bold text-gray-500 border border-gray-200 bg-white px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
//                         >
//                           Invoice
//                         </button>
//                         <button
//                           onClick={() => navigate(`/user/orders/${order._id}`)}
//                           className="flex-1 sm:flex-none text-xs font-black text-white bg-gray-900 px-6 py-2 rounded-lg hover:bg-black transition-all active:scale-95"
//                         >
//                           Track Order
//                         </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//           )}
//         </div>
//       </div>
//     </>
//   );
// }

// import React, { useEffect, useState, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import Navbar from "./Navbar";

// export default function OrdersPage() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("ALL");

//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     const fetchOrders = async () => {
//       try {
//         setLoading(true);
//         setError("");
//         const res = await fetch("https://localdelivery-app-backend.vercel.app/orders", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();
//         if (!res.ok || !data.success) throw new Error(data.message || "Failed to load orders");
//         setOrders(data.orders || []);
//       } catch (err) {
//         setError(err.message || "Error loading orders");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOrders();
//   }, [token, navigate]);

//   const filteredOrders = useMemo(() => {
//     return orders.filter((order) => {
//       const matchesSearch =
//         order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
//       const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
//       return matchesSearch && matchesStatus;
//     });
//   }, [orders, searchQuery, statusFilter]);

//   const statusColor = (status) => {
//     switch (status) {
//       case "CREATED": return "bg-gray-100 text-gray-600 border-gray-200";
//       case "CONFIRMED": return "bg-blue-100 text-blue-700 border-blue-200";
//       case "OUT_FOR_DELIVERY": return "bg-orange-100 text-orange-700 border-orange-200 animate-pulse";
//       case "DELIVERED": return "bg-green-100 text-green-700 border-green-200";
//       case "CANCELLED": return "bg-red-100 text-red-700 border-red-200";
//       default: return "bg-gray-50 text-gray-500 border-gray-100";
//     }
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="min-h-screen bg-gray-50/50 py-8 px-4">
//         <div className="max-w-4xl mx-auto">

//           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
//             <h2 className="text-3xl font-black text-gray-900 tracking-tight">Orders History 📦</h2>
//             <button onClick={() => navigate("/products")} className="bg-orange-500 hover:bg-orange-600 text-white font-black py-2.5 px-6 rounded-2xl shadow-lg transition-all active:scale-95 text-sm">
//               + New Order
//             </button>
//           </div>

//           {/* Search & Tabs */}
//           <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-8 space-y-4">
//             <div className="relative">
//               <span className="absolute left-4 top-3.5">🔍</span>
//               <input
//                 type="text" placeholder="Search orders or items..." value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500/20 transition-all"
//               />
//             </div>
//             <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
//               {["ALL", "CREATED", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].map((status) => (
//                 <button key={status} onClick={() => setStatusFilter(status)}
//                   className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${statusFilter === status ? "bg-black text-white border-black" : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"}`}>
//                   {status}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {loading ? (
//             <div className="text-center py-20 font-bold text-gray-300">Loading your orders...</div>
//           ) : filteredOrders.length === 0 ? (
//             <div className="text-center bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-gray-400 font-bold">No orders found.</div>
//           ) : (
//             <div className="space-y-6">
//               {filteredOrders.map((order) => {
//                 const totalItems = order.items.reduce((acc, curr) => acc + curr.quantity, 0);

//                 return (
//                   <div key={order._id} className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">

//                     {/* Header: ID and Status */}
//                     <div className="p-6 pb-4 flex justify-between items-start border-b border-gray-50">
//                       <div>
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="text-xs font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded uppercase tracking-tighter">
//                             {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
//                           </span>
//                           <span className="text-[10px] font-bold text-gray-300 font-mono">#{order._id.slice(-8)}</span>
//                         </div>
//                         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
//                           Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric'})}
//                         </h3>
//                       </div>
//                       <span className={`text-[10px] font-black px-4 py-2 rounded-full border shadow-sm ${statusColor(order.status)} uppercase tracking-widest`}>
//                         {order.status.replace(/_/g, " ")}
//                       </span>
//                     </div>

//                     {/* Middle: Items & Address Side-by-Side */}
//                     <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">

//                       {/* Items Column */}
//                       <div className="space-y-3">
//                         <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Order Summary</h4>
//                         <ul className="space-y-2">
//                           {order.items.map((it, idx) => (
//                             <li key={idx} className="flex justify-between items-center text-sm">
//                               <span className="font-bold text-gray-700">{it.name} <span className="text-gray-300 ml-1">×{it.quantity}</span></span>
//                               <span className="font-mono text-gray-400">₹{it.subtotal}</span>
//                             </li>
//                           ))}
//                         </ul>
//                       </div>

//                       {/* Address Column - ENHANCED VIEW */}
//                       <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 relative overflow-hidden">
//                         <div className="absolute top-0 right-0 p-2 text-gray-100 text-4xl select-none opacity-20">📍</div>
//                         <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Delivery Address</h4>
//                         {order.deliveryAddress ? (
//                           <div className="text-xs text-gray-600 leading-relaxed font-medium">
//                             <p className="text-gray-900 font-black mb-1">{order.deliveryAddress.name || "Recipient"}</p>
//                             <p className="line-clamp-2">{order.deliveryAddress.addressLine}</p>
//                             <p>{order.deliveryAddress.city}, {order.deliveryAddress.pincode}</p>
//                             <p className="mt-2 text-orange-600 font-bold tracking-tighter italic">📞 {order.deliveryAddress.phone}</p>
//                           </div>
//                         ) : (
//                           <p className="text-xs italic text-gray-300 font-bold">Address Details Hidden</p>
//                         )}
//                       </div>
//                     </div>

//                     {/* Footer: Price & Actions */}
//                     <div className="px-6 py-5 bg-gray-50/80 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
//                       <div className="flex items-end gap-2">
//                         <div className="text-[10px] font-black text-gray-400 uppercase pb-1 leading-none">Total Paid</div>
//                         <div className="text-2xl font-black text-gray-900 leading-none tracking-tighter">₹{order.totalAmount}</div>
//                         <div className="text-[8px] font-black bg-white border border-gray-100 text-blue-500 px-2 py-0.5 rounded uppercase mb-1">{order.paymentMethod}</div>
//                       </div>

//                       <div className="flex gap-3 w-full sm:w-auto">
//                         <button onClick={() => navigate(`/invoice/${order._id}`)} className="flex-1 sm:flex-none text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
//                           Invoice
//                         </button>
//                         <button onClick={() => navigate(`/user/orders/${order._id}`)} className="flex-1 sm:flex-none bg-black text-white text-xs font-black px-8 py-3 rounded-2xl shadow-xl shadow-gray-200 hover:scale-105 active:scale-95 transition-all">
//                           TRACK ORDER
//                         </button>
//                       </div>
//                     </div>

//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(
          "https://localdelivery-app-backend.vercel.app/orders",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        if (!res.ok || !data.success)
          throw new Error(data.message || "Failed to load orders");
        setOrders(data.orders || []);
        // } catch (err) {
        //   setError(err.message || "Error loading orders");
      } catch (err) {
        setError(err?.message || "Error loading orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token, navigate]);

  // --- EXISTING SEARCH & FILTER LOGIC ---
  // const filteredOrders = useMemo(() => {
  //   return orders.filter((order) => {
  //     const matchesSearch =
  //       order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  //     const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
  //     return matchesSearch && matchesStatus;
  //   });
  // }, [orders, searchQuery, statusFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.items || []).some((item) =>
          item?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // --- NEW RE-ORDER FUNCTIONALITY ---
  const handleReorder = (order) => {
    // Logic: Navigate to products or directly add items to cart state/localStorage
    console.log("Re-ordering items:", order.items);
    alert(
      "Items from this order have been added back to your cart simulation!",
    );
    navigate("/products");
  };

  // --- NEW RATE ORDER FUNCTIONALITY ---
  const handleRateOrder = (orderId) => {
    // Logic: Navigate to a review page or open a rating modal
    navigate(`/rate-order/${orderId}`);
  };

  const statusColor = (status) => {
    switch (status) {
      case "CREATED":
        return "bg-gray-100 text-gray-600 border-gray-200";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "OUT_FOR_DELIVERY":
        return "bg-orange-100 text-orange-700 border-orange-200 animate-pulse";
      case "DELIVERED":
        return "bg-green-100 text-green-700 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-500 border-gray-100";
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50/50 py-8 px-4 font-sans">
        {/* <div className="max-w-4xl mx-auto"> */}
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="bg-red-100 text-red-600 px-4 py-3 rounded-xl mb-4 font-bold text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* rest of your UI */}

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Orders History 📦
            </h2>
            <button
              onClick={() => navigate("/products")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black py-2.5 px-6 rounded-2xl shadow-lg transition-all active:scale-95 text-sm"
            >
              + New Order
            </button>
          </div>

          {/* Search & Tabs */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-8 space-y-4">
            <div className="relative">
              <span className="absolute left-4 top-3.5">🔍</span>
              <input
                type="text"
                placeholder="Search orders or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                "ALL",
                "CREATED",
                "CONFIRMED",
                "OUT_FOR_DELIVERY",
                "DELIVERED",
                "CANCELLED",
              ].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${statusFilter === status ? "bg-black text-white border-black" : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 font-bold text-gray-300">
              Loading your orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-gray-400 font-bold">
              No orders found.
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                // const totalItems = order.items.reduce((acc, curr) => acc + curr.quantity, 0);
                const totalItems = (order.items || []).reduce(
                  (acc, curr) => acc + curr.quantity,
                  0,
                );

                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
                  >
                    {/* Card Header */}
                    <div className="p-6 pb-4 flex justify-between items-start border-b border-gray-50">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded uppercase tracking-tighter">
                            {totalItems} {totalItems === 1 ? "Item" : "Items"}
                          </span>
                          <span className="text-[10px] font-bold text-gray-300 font-mono">
                            #{order._id.slice(-8)}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          Placed{" "}
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-IN",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )}
                        </h3>
                      </div>
                      <span
                        className={`text-[10px] font-black px-4 py-2 rounded-full border shadow-sm ${statusColor(order.status)} uppercase tracking-widest`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    {/* Middle Section */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">
                      {/* Items Column */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                            Order Summary
                          </h4>
                          {/* RE-ORDER BUTTON */}
                          <button
                            onClick={() => handleReorder(order)}
                            className="text-[10px] font-black text-blue-600 hover:underline"
                          >
                            🔄 RE-ORDER
                          </button>
                        </div>
                        <ul className="space-y-2">
                          {order.items.map((it, idx) => (
                            <li
                              key={it._id || idx}
                              className="flex justify-between items-center text-sm"
                            >
                              <span className="font-bold text-gray-700">
                                {it.name}{" "}
                                <span className="text-gray-300 ml-1">
                                  ×{it.quantity}
                                </span>
                              </span>
                              <span className="font-mono text-gray-400">
                                ₹{it.subtotal}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Enhanced Address Column */}
                      <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 text-gray-100 text-4xl select-none opacity-20">
                          📍
                        </div>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                          Delivery Address
                        </h4>
                        {order.deliveryAddress ? (
                          <div className="text-xs text-gray-600 leading-relaxed font-medium">
                            <p className="text-gray-900 font-black mb-1">
                              {order.deliveryAddress.name || "Recipient"}
                            </p>
                            <p className="line-clamp-2">
                              {order.deliveryAddress.addressLine}
                            </p>
                            <p>
                              {order.deliveryAddress.city},{" "}
                              {order.deliveryAddress.pincode}
                            </p>
                            <p className="mt-2 text-orange-600 font-bold tracking-tighter italic">
                              📞 {order.deliveryAddress.phone}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs italic text-gray-300 font-bold">
                            Address Details Hidden
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer Section */}
                    <div className="px-6 py-5 bg-gray-50/80 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex items-end gap-2">
                        <div className="text-[10px] font-black text-gray-400 uppercase pb-1 leading-none">
                          Total Paid
                        </div>
                        <div className="text-2xl font-black text-gray-900 leading-none tracking-tighter">
                          ₹{order.totalAmount}
                        </div>
                        <div className="text-[8px] font-black bg-white border border-gray-100 text-blue-500 px-2 py-0.5 rounded uppercase mb-1">
                          {order.paymentMethod}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button
                          onClick={() => navigate(`/invoice/${order._id}`)}
                          className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          Invoice
                        </button>

                        {/* CONDITIONAL RATE ORDER BUTTON */}

                        {/* {order.status === "DELIVERED" && (
                          <button
                            onClick={() => handleRateOrder(order._id)}
                            className="text-xs font-black text-green-600 hover:text-green-700 transition-colors"
                          >
                            ⭐ RATE ORDER
                          </button>
                        )} */}

                        {/* Only show "RATE ORDER" if status is DELIVERED and it HASN'T been rated yet */}
                        {order.status === "DELIVERED" && !order.isRated && (
                          <button
                            onClick={() => handleRateOrder(order._id)}
                            className="text-xs font-black text-green-600 hover:text-green-700"
                          >
                            ⭐ RATE ORDER
                          </button>
                        )}

                        {/* Show "RATED" text if already done */}
                        {order.isRated && (
                          <span className="text-[10px] font-black text-gray-300">
                            STARS: {order.rating} ⭐
                          </span>
                        )}

                        {/* for rating the indivisual items */}
{/* 
                        {order.items.map((item) => (
                          <div
                            key={item.productId}
                            className="flex justify-between items-center py-2"
                          >
                            <span>{item.name}</span>

                            {item.isRated ? (
                              <span className="text-orange-500 font-bold">
                                ⭐ {item.rating}
                              </span>
                            ) : order.status === "DELIVERED" ? (
                              <button
                                onClick={() =>
                                  navigate(
                                    `/rate-item/${order._id}/${item.productId}`,
                                  )
                                }
                                className="text-xs bg-gray-100 px-3 py-1 rounded-full font-bold"
                              >
                                Rate Item
                              </button>
                            ) : null}
                          </div>
                        ))} */}

                        {order.items.map((item) => (
  <div key={item.productId} className="flex items-center justify-between p-4 border-b">
    <div>
      <p className="font-bold text-gray-800">{item.name}</p>
      <p className="text-xs text-gray-400 font-bold">Qty: {item.quantity}</p>
    </div>
    
    <div>
      {item.isRated ? (
        <div className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full">
          <span className="text-[10px] font-black text-orange-600">{item.rating} ⭐</span>
        </div>
      ) : order.status === "DELIVERED" ? (
        <button 
          onClick={() => navigate(`/rate-item/${order._id}/${item.productId}`)}
          // className="text-[10px] font-black bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-orange-500 transition-colors"
                                className="text-xs bg-gray-100 px-3 py-1 rounded-full font-bold"


                                

        >
          rate-item
        </button>
      ) : null}
    </div>
  </div>
))}

                        {/* <button
                          onClick={() => navigate(`/user/orders/${order._id}`)}
                          className="flex-1 sm:flex-none bg-black text-white text-xs font-black px-8 py-3 rounded-2xl shadow-xl shadow-gray-200 hover:scale-105 active:scale-95 transition-all"
                        >
                          TRACK ORDER
                        </button> */}
                         <button 
                                                // onClick={() => navigate(`/orders`)}
                          onClick={() => navigate(`/user/orders/${order._id}`)}

                                                className="text-[10px] font-black uppercase text-gray-400 hover:text-orange-600 px-2"
                                            >
                                                Track →
                                            </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
