// import React, { useEffect, useState, useCallback } from "react";

// import { useParams, useNavigate } from "react-router-dom";
// import OrderStatusStepper from "../pages/OrderStatusStepper";

// import Navbar from "../pages/Navbar";
// const STATUS_COLORS = {
//   CREATED: "bg-gray-200 text-gray-800",
//   CONFIRMED: "bg-blue-100 text-blue-700",
//   OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
//   DELIVERED: "bg-green-100 text-green-700",
// };

// export default function UserOrderDetails() {
//   const { orderId } = useParams();
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // another code add in place of above
//   const fetchOrder = useCallback(async () => {
//     try {
//       setLoading(true);

//       const res = await fetch(
//         `https://localdelivery-app-backend.vercel.app/user/orders/${orderId}`,
//         {
//           headers: token ? { Authorization: `Bearer ${token}` } : {},
//         },
//       );

//       if (res.status === 401) {
//         navigate("/login", { replace: true });
//         return;
//       }

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Failed to load order");

//       setOrder(data.order);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [orderId, token, navigate]);

//   // add another inplace of above code

//   useEffect(() => {
//     fetchOrder();

//     const interval = setInterval(fetchOrder, 10000);
//     return () => clearInterval(interval);
//   }, [fetchOrder]);

//   if (loading) return <div className="p-6">Loading order...</div>;
//   if (error) return <div className="p-6 text-red-600">{error}</div>;

//   const cancelOrder = async () => {
//     if (!window.confirm("Cancel this order?")) return;

//     try {
//       const res = await fetch(
//         `https://localdelivery-app-backend.vercel.app/user/orders/${order._id}/cancel`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);

//       setOrder(data.order);
//     } catch (err) {
//       alert(err.message || "Cancel failed");
//     }
//   };

//   // pay now handler
//   const handleOnlinePayment = async () => {
//     try {
//       // 1. Create Razorpay order from backend
//       const res = await fetch(
//         "https://localdelivery-app-backend.vercel.app/payments/razorpay/create-order",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ orderId: order._id }),
//         },
//       );

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Failed to create payment");

//       // 2. Razorpay options
//       const options = {
//         key: data.key, // Razorpay public key
//         amount: data.razorpayOrder.amount,
//         currency: "INR",
//         name: "Local Delivery App",
//         description: "Order Payment",
//         order_id: data.razorpayOrder.id,

//         handler: async function (response) {
//           // 3. Verify payment on backend
//           const verifyRes = await fetch(
//             "https://localdelivery-app-backend.vercel.app/payments/razorpay/verify",
//             {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${token}`,
//               },
//               body: JSON.stringify({
//                 razorpay_order_id: response.razorpay_order_id,
//                 razorpay_payment_id: response.razorpay_payment_id,
//                 razorpay_signature: response.razorpay_signature,
//                 orderId: order._id,
//               }),
//             },
//           );

//           const verifyData = await verifyRes.json();
//           if (!verifyRes.ok)
//             throw new Error(
//               verifyData.message || "Payment verification failed",
//             );

//           alert("✅ Payment Successful");
//           setOrder(verifyData.order); // refresh UI
//         },

//         theme: {
//           color: "#f97316", // orange
//         },
//       };

//       // 4. Open Razorpay popup
//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (err) {
//       alert(err.message || "Payment failed");
//     }
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="p-6 max-w-3xl mx-auto">
//         <button
//           onClick={() => navigate(-1)}
//           className="mb-4 text-sm text-blue-600"
//         >
//           ← Back
//         </button>
//         {order.status === "CREATED" && (
//           <button
//             onClick={cancelOrder}
//             className="mb-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
//           >
//             Cancel Order
//           </button>
//         )}
//         <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
//           <div>
//             Payment Method:
//             <span className="font-semibold ml-1">{order.paymentMethod}</span>
//           </div>
//           <div>
//             Payment Status:
//             <span
//               className={`font-semibold ml-1 ${
//                 order.paymentStatus === "PAID"
//                   ? "text-green-600"
//                   : "text-orange-600"
//               }`}
//             >
//               {order.paymentStatus}
//             </span>
//           </div>
//           {order.paymentMethod === "ONLINE" &&
//             order.paymentStatus === "PENDING" && (
//               <button
//                 onClick={handleOnlinePayment}
//                 className="mt-4 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded"
//               >
//                 Pay Now
//               </button>
//             )}
//         </div>

//         <div className="bg-white p-6 rounded shadow">
//           <h2 className="text-xl font-bold mb-2">
//             Order #{order._id.slice(-6)}
//           </h2>
//           <OrderStatusStepper status={order.status} />

//           <div
//             className={`inline-block px-3 py-1 rounded text-sm font-semibold mb-4 ${
//               STATUS_COLORS[order.status]
//             }`}
//           >
//             {order.status}
//           </div>

//           <div className="text-sm text-gray-600 mb-4">
//             Placed on: {new Date(order.createdAt).toLocaleString()}
//           </div>

//           <h3 className="font-semibold mb-2">Items</h3>

//           <ul className="divide-y">
//             {order.items.map((item) => (
//               <li key={item._id} className="py-2 flex justify-between">
//                 <div>
//                   <div className="font-medium">{item.name}</div>
//                   <div className="text-xs text-gray-500">
//                     Qty: {item.quantity}
//                   </div>
//                 </div>
//                 <div className="font-semibold">₹{item.subtotal}</div>
//                 <button
//                   onClick={() => navigate(`/invoice/${order._id}`)}
//                   className="mt-4 bg-gray-800 text-white px-4 py-2 rounded"
//                 >
//                   🧾 View Invoice
//                 </button>
//               </li>
//             ))}
//           </ul>

//           <div className="mt-4 border-t pt-4 flex justify-between font-bold">
//             <span>Total</span>
//             <span>₹{order.totalAmount}</span>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }



import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OrderStatusStepper from "../pages/OrderStatusStepper";
import Navbar from "../pages/Navbar";

const STATUS_COLORS = {
  CREATED: "bg-gray-200 text-gray-800 border-gray-300",
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700 border-orange-200 animate-pulse",
  DELIVERED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

export default function UserOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null); // Added this to fix 'user is not defined' error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(
        `https://localdelivery-app-backend.vercel.app/user/orders/${orderId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (res.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load order");

      setOrder(data.order);
      // If the backend returns user info inside the order, set it here
      if (data.order.userId) setUser(data.order.userId); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId, token, navigate]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  const cancelOrder = async () => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      const res = await fetch(
        `https://localdelivery-app-backend.vercel.app/user/orders/${order._id}/cancel`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrder(data.order);
    } catch (err) {
      alert(err.message || "Cancel failed");
    }
  };

  const handleOnlinePayment = async () => {
    try {
      const res = await fetch(
        "https://localdelivery-app-backend.vercel.app/payments/razorpay/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderId: order._id }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create payment");

      const options = {
        key: data.key,
        amount: data.razorpayOrder.amount,
        currency: "INR",
        name: "Local Delivery App",
        description: "Order Payment",
        order_id: data.razorpayOrder.id,
        handler: async function (response) {
          const verifyRes = await fetch(
            "https://localdelivery-app-backend.vercel.app/payments/razorpay/verify",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: order._id,
              }),
            }
          );
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) throw new Error(verifyData.message || "Payment verification failed");
          alert("✅ Payment Successful");
          setOrder(verifyData.order);
        },
        theme: { color: "#f97316" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err.message || "Payment failed");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen text-orange-500 font-bold animate-pulse">
      Tracking your order... 📦
    </div>
  );
  
  if (error) return (
    <div className="p-10 text-center text-red-600 font-medium">
      <p>Error: {error}</p>
      <button onClick={() => navigate(-1)} className="mt-4 underline">Go Back</button>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="p-4 md:p-6 max-w-3xl mx-auto">
          
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => navigate(-1)} className="text-sm font-bold text-gray-500 hover:text-black tracking-tight">
              ← Back
            </button>
            <button onClick={() => navigate(`/invoice/${order._id}`)} className="text-xs bg-white border border-gray-200 px-4 py-2 rounded-lg font-bold shadow-sm">
              🧾 Download Invoice
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
                    Order #{order._id.slice(-6)}
                  </h2>
                  <p className="text-xs text-gray-400 font-medium">
                    Placed on {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-black border ${STATUS_COLORS[order.status] || "bg-gray-100"}`}>
                  {order.status}
                </span>
              </div>

              <OrderStatusStepper status={order.status} />
              
              {order.status === "CREATED" && (
                <button onClick={cancelOrder} className="mt-6 w-full md:w-auto text-xs font-bold text-red-500 border border-red-100 bg-red-50 px-6 py-2 rounded-xl">
                  Cancel Order
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xs font-black text-gray-400 uppercase mb-4 tracking-widest">Payment Info</h3>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 font-medium">Method</span>
                        <span className="text-sm font-bold">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-600 font-medium">Status</span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded ${order.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                            {order.paymentStatus}
                        </span>
                    </div>
                    {order.paymentMethod === "ONLINE" && order.paymentStatus === "PENDING" && (
                        <button onClick={handleOnlinePayment} className="w-full bg-orange-500 text-white font-black py-3 rounded-xl text-sm">
                            Pay ₹{order.totalAmount} Now
                        </button>
                    )}
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xs font-black text-gray-400 uppercase mb-4 tracking-widest">Delivery Details</h3>
                    {/* Fixed the 'user' error by checking order data first */}
                    <p className="text-sm font-bold text-gray-800">{user?.username || order.customerName || "Customer"}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {order.address || "No address provided"}
                    </p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase mb-6 tracking-widest">Order Summary</h3>
                <ul className="space-y-4">
                    {order.items.map((item) => (
                    <li key={item._id} className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-lg">📦</div>
                            <div>
                                <div className="font-bold text-sm text-gray-800">{item.name}</div>
                                <div className="text-[10px] text-gray-400 font-bold tracking-tighter">QTY: {item.quantity}</div>
                            </div>
                        </div>
                        <div className="font-black text-sm text-gray-800">₹{item.subtotal}</div>
                    </li>
                    ))}
                </ul>

                <div className="mt-8 border-t border-dashed pt-6">
                    <div className="flex justify-between items-center text-gray-500 text-sm mb-2">
                        <span>Items Total</span>
                        <span>₹{order.totalAmount}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <span className="font-black text-gray-800">Amount Paid</span>
                        <span className="text-xl font-black text-orange-600">₹{order.totalAmount}</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}