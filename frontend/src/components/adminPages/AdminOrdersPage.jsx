// import React, { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";

// import Navbar from "../pages/Navbar";

// const STATUS_OPTIONS = [
//   "CREATED",
//   "CONFIRMED",
//   "OUT_FOR_DELIVERY",
//   "DELIVERED",
// ];
// export default function AdminOrdersPage() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const token = localStorage.getItem("token");

//   const fetchOrders = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(
//         "https://localdelivery-app-backend.vercel.app/admin/orders",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Failed to load orders");

//       setOrders(data.orders || []);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [token]);

//   useEffect(() => {
//     fetchOrders();
//     const interval = setInterval(fetchOrders, 10000);
//     return () => clearInterval(interval);
//   }, [fetchOrders]);

//   const updateStatus = async (orderId, status) => {
//     try {
//       setLoading(true);
//       const res = await fetch(
//         `https://localdelivery-app-backend.vercel.app/admin/orders/${orderId}/status`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ status }),
//         }
//       );

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Status update failed");

//       // update UI instantly
//       setOrders((prev) =>
//         prev.map((o) => (o._id === orderId ? { ...o, status } : o))
//       );
//     } catch (err) {
//       alert(err.message);
//     } finally{
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <Navbar />

//       <div className="p-6 max-w-6xl mx-auto">
//         <h1 className="text-2xl font-bold mb-4">📦 Admin Orders</h1>

//         {loading && <div>Loading orders...</div>}
//         {error && <div className="text-red-600">{error}</div>}

//         {!loading && orders.length === 0 && <div>No orders found.</div>}

//         {!loading && orders.length > 0 && (
//           <div className="overflow-x-auto">
//             <table className="w-full border border-gray-200 bg-white rounded">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="p-2 border">Order ID</th>
//                   <th className="p-2 border">User</th>
//                   <th className="p-2 border">Amount</th>
//                   <th className="p-2 border">Payment</th>

//                   <th className="p-2 border">Status</th>
//                   <th className="p-2 border">Date</th>
//                   <th className="p-2 border">Invoice</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {orders.map((order) => (
//                   <tr key={order._id} className="text-center">
//                     <td className="p-2 border text-xs">
//                       {order._id.slice(-6)}
//                     </td>
//                     <td className="p-2 border">
//                       <div className="font-medium">
//                         {order.userId?.username || "User"}
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         {order.userId?.useremail}
//                       </div>
//                     </td>
//                     <td className="p-2 border font-semibold">
//                       ₹{order.totalAmount}
//                     </td>
//                     <td className="p-2 border">
//                       <div className="text-sm font-medium">
//                         {order.paymentMethod}
//                       </div>
//                       <div
//                         className={`text-xs font-semibold ${
//                           order.paymentStatus === "PAID"
//                             ? "text-green-600"
//                             : "text-orange-600"
//                         }`}
//                       >
//                         {order.paymentStatus}
//                       </div>
//                     </td>

//                     <td className="p-2 border">
//                       <select
//                         value={order.status}
//                         onChange={(e) =>
//                           updateStatus(order._id, e.target.value)
//                         }
//                         className="border rounded px-2 py-1"
//                       >
//                         {STATUS_OPTIONS.map((s) => (
//                           <option key={s} value={s}>
//                             {s}
//                           </option>
//                         ))}
//                       </select>
//                     </td>
//                     <td className="p-2 border text-sm">
//                       {new Date(order.createdAt).toLocaleString()}
//                     </td>
//                     <td className="p-2 border text-sm">
//                       <button
//                         onClick={() => navigate(`/invoice/${order._id}`)}
//                         className="text-sm text-blue-600 underline mt-2"
//                       >
//                         Download Invoice
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../pages/Navbar";

const STATUS_OPTIONS = [
  "CREATED",
  "CONFIRMED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED", // Added Cancelled as a standard option
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 New: Search
  const [statusFilter, setStatusFilter] = useState("ALL"); // 🔍 New: Filter
  
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchOrders = useCallback(async () => {
    try {
      // Don't set loading(true) during auto-refresh to prevent flickering
      const res = await fetch(
        "https://localdelivery-app-backend.vercel.app/admin/orders",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load orders");
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (orderId, status) => {
    try {
      const res = await fetch(
        `https://localdelivery-app-backend.vercel.app/admin/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Status update failed");

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // --- NEW: COMPUTED DATA (Filtering & Stats) ---
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === "CREATED").length,
      revenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    };
  }, [orders]);

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
        {/* --- SUMMARY HEADER --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs font-black uppercase">Total Orders</p>
            <h2 className="text-2xl font-black">{stats.total}</h2>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-orange-400 text-xs font-black uppercase">New (Pending)</p>
            <h2 className="text-2xl font-black">{stats.pending}</h2>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-green-500 text-xs font-black uppercase">Total Revenue</p>
            <h2 className="text-2xl font-black">₹{stats.revenue.toLocaleString()}</h2>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-black text-gray-800">📦 Order Management</h1>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {/* SEARCH */}
            <input 
              type="text"
              placeholder="Search by ID or Name..."
              className="px-4 py-2 rounded-xl border-none shadow-sm text-sm focus:ring-2 focus:ring-green-500 flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* FILTER */}
            <select 
              className="px-4 py-2 rounded-xl border-none shadow-sm text-sm font-bold bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {loading && <div className="text-center py-10 font-bold text-gray-400 animate-pulse">Updating orders...</div>}
        {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-4 font-bold">{error}</div>}

        {!loading && filteredOrders.length === 0 ? (
          <div className="bg-white p-20 text-center rounded-2xl border border-dashed border-gray-200">
             <p className="text-gray-400 font-bold">No orders match your filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-widest border-b">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-mono text-xs text-blue-600 font-bold">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{order.userId?.username || "Guest User"}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{order.userId?.useremail}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-bold text-gray-700">{order.paymentMethod}</div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                          order.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-600"
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4 font-black text-gray-900">₹{order.totalAmount}</td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          className={`text-xs font-bold border-none rounded-lg px-2 py-1 shadow-sm focus:ring-2 focus:ring-green-500 ${
                            order.status === "DELIVERED" ? "bg-green-50 text-green-700" : 
                            order.status === "CANCELLED" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 text-gray-500 font-medium text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString()}<br/>
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => navigate(`/invoice/${order._id}`)}
                          className="bg-gray-100 hover:bg-black hover:text-white text-gray-600 p-2 rounded-lg transition-all"
                          title="View Invoice"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}