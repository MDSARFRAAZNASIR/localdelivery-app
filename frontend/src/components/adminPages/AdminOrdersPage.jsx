

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../pages/Navbar";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "../pages/firebaseConfig"; // Your web firebase config
import { messaging } from "../pages/firebaseConfig";
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

  // const requestPermission = async () => {
  //   try {
  //     const messaging = getMessaging(app);
  //     const permission = await Notification.requestPermission();
      
  //     if (permission === "granted") {
  //       const token = await getToken(messaging, { 
  //         vapidKey: "BHBDE6qygOrUtILhtP8TyD0hzu9jjHH2_u7iSbWt_ImyJrYjR4-Y001FwiRScoCT8Yqh60u8M-I3PVw9njA6JKU" 
  //       });
        
  //       console.log("Admin Notification Token:", token);
  //       // Save this token to your backend admin user profile
  //       alert("Notifications Enabled! ✅");
  //     }
  //   } catch (err) {
  //     console.error("Permission denied", err);
  //   }
  // };


  const requestPermission = async () => {
  try {
    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();
    
    if (permission === "granted") {
      const token = await getToken(messaging, { 
        vapidKey: "BHBDE6qygOrUtILhtP8TyD0hzu9jjHH2_u7iSbWt_ImyJrYjR4-Y001FwiRScoCT8Yqh60u8M-I3PVw9njA6JKU" 
      });
      
      console.log("Admin Notification Token:", token);

      // --- 🔗 LINKING TO YOUR VERCEL BACKEND ---
      const backendUrl = "https://localdelivery-app-backend.vercel.app";
      
      const response = await fetch(`${backendUrl}/api/subscribe-admin`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Assuming you store your login token in localStorage
          'Authorization': `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();
      
      if (data.success) {
        alert("Notifications Enabled & Subscribed to Orders! ✅🔔");
      } else {
        console.error("Subscription failed:", data.message);
      }
    }
  } catch (err) {
    console.error("Permission or Subscription failed", err);
  }
};

 
  
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


//   // for new order notification
//   const requestPermission = async () => {
//   try {
//     const permission = await Notification.requestPermission();
//     if (permission === "granted") {
//       const token = await getToken(messaging, { 
//         vapidKey: "YOUR_VAPID_KEY" 
//       });

//       if (token) {
//         console.log("Admin Token:", token);
        
//         // 🔗 LINK THE TOKEN TO THE TOPIC
//         await axios.post(`${process.env.REACT_APP_API_URL}/api/subscribe-admin`, 
//           { token },
//           { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
//         );
        
//         alert("System Ready: You will now receive order alerts! 🔔");
//       }
//     }
//   } catch (err) {
//     console.error("Setup failed:", err);
//   }
// };


   // Listen for foreground messages while the app is open
  // useEffect(() => {
  //   const messaging = getMessaging(app);
  //   const unsubscribe = onMessage(messaging, (payload) => {
  //     // Show a toast or simple alert when a new order arrives
  //     alert(`New Order: ${payload.notification.body}`);
  //     fetchOrders(); // Refresh the list automatically
  //   });
  //   return () => unsubscribe();
  // }, [fetchOrders]);
  

//   useEffect(() => {
//   // 🔔 Single listener for all foreground messages
//     // const messaging = getMessaging(app);

//   const unsubscribe = onMessage(messaging, (payload) => {
//     console.log("New Order Received:", payload);
    

//     // 1. Play the Notification Sound
//     const audio = new Audio("/notification.mp3");
//     audio.play().catch(err => console.log("Audio play blocked:", err));

//     // 2. Show the Alert
//     alert(`🔔 New Order: ${payload.notification.body}`);

//     // 3. Refresh your UI (Important!)
//     if (fetchOrders) {
//       fetchOrders(); 
//     }
//   });

//   return () => unsubscribe(); 
// }, [fetchOrders]); // Runs once, but updates if fetchOrders changes


useEffect(() => {
  // 🔔 Listen for orders while the dashboard is open
  const unsubscribe = onMessage(messaging, (payload) => {
    console.log("New Order Received:", payload);

    // 1. Play the corrected sound file
    const audio = new Audio("/notification.mp3");
    audio.play().catch(err => console.log("Playback blocked by browser:", err));

    // 2. Show the alert with order details
    alert(`🛍️ ${payload.notification.title}\n${payload.notification.body}`);

    // 3. Refresh the order list so the new order appears immediately
    if (typeof fetchOrders === "function") {
      fetchOrders();
    }
  });

  return () => unsubscribe();
}, [fetchOrders]);


  

  return (
    <>
      <Navbar />

      <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
         {/* {error && (
            <div className="bg-red-100 text-red-600 px-4 py-3 rounded-xl mb-4 font-bold text-sm">
              ⚠️ {error}
            </div>
          )} */}
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
          {/* 🔔 NEW NOTIFICATION BUTTON */}
          <button 
            onClick={requestPermission}
            className="flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-orange-200 transition-all"
          >
            <span className="text-lg">🔔</span> Enable Desktop Alerts
          </button>
          
  {/* // Manual trigger to test the sound/alert logic locally */}
  {/* <button onClick={async () => {
  try {
    // Note the "/" at the beginning - it looks in the 'public' folder
    const audio = new Audio("/notification.mp3"); 
    
    // Force the browser to load it before playing
    audio.load(); 
    
    await audio.play();
    alert("🔔 Sound is working!");
  } catch (err) {
    console.error("Audio Error Details:", err);
    alert("Sound failed. Check if notification.mp3 is in the public folder!");
  }
}}>
  Test Sound System
</button>
   */}
          
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