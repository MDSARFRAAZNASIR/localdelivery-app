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

  

  // new one Repayment Function
  const handleRetryPayment = async (order) => {
    try {
      // Step 1: Tell backend to generate a NEW Razorpay ID for this OLD order
      const res = await fetch(
        "https://localdelivery-app-backend.vercel.app/payments/razorpay/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderId: order._id }), // This is the MongoDB ID
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const options = {
        key: data.key, // Best to get this from backend data.key
        amount: data.razorpayOrder.amount,
        currency: "INR",
        name: "Local Delivery",
        description: "Retry Payment",
        order_id: data.razorpayOrder.id, // The NEW Razorpay Order ID from backend
        handler: async (response) => {
          // Step 2: Send the new payment details back for verification
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
                orderId: order._id, // Sending the MongoDB ID so backend knows which one to update
              }),
            },
          );

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert("Payment Successful! 🎉");
            window.location.reload();
          } else {
            alert(
              "Verification failed. Please check your bank and contact us.",
            );
          }
        },
        prefill: { contact: order.userphone || "" },
        theme: { color: "#2563eb" },
      };

      const rzp = new window.Razorpay(options);

      // add new rv
      // 🔥 Add this listener
      rzp.on("payment.failed", async function (response) {
        // console.log("Payment failed logic triggered");
        console.error("Payment Failed:", response.error.description);

        // Update backend to 'FAILED'
        await fetch(
          `https://your-backend.vercel.app/payments/razorpay/payment-failed`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              orderId: order._id,
              // status: 'FAILED'
              errorDescription: response.error.description,
            }),
          },
        );
        // Optional: Show a toast or alert
        alert("Payment Failed: " + response.error.description);

        // Refresh UI to show the "Failed" message
        window.location.reload();
      });

      rzp.open();
    } catch (err) {
      console.error("Retry Error:", err);
      alert("Could not start payment.");
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
                          {order.paymentStatus === "PAID"
                            ? "Paid on "
                            : "Placed "}
                          {new Date(
                            order.paidAt || order.updatedAt || order.createdAt,
                          ).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
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

                        {/* another  repayment and date fixing*/}
                      
                        <div>
                          <h3 className="text-xs font-thin text-gray-400 uppercase tracking-widest">
                            {order.paymentStatus === "PAID"
                              ? "Paid on "
                              : "Placed "}
                            {new Date(
                              order.paidAt || order.createdAt,
                            ).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </h3>

                          {/* Dynamic Status Badge */}
                          {/* <div > */}
                          {order.paymentStatus === "FAILED" ? (
                            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded uppercase">
                              ⚠️ Online: Payment Failed
                            </span>
                          ) : order.paymentStatus === "PAID" ? (
                            <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-bold rounded uppercase">
                              ✅ Paid
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs font-bold rounded uppercase">
                              ⏳ Pending
                            </span>
                          )}
                          {/* </div> */}

                          {/* Show Error Reason if it exists */}
                          {order.paymentStatus === "FAILED" &&
                            order.paymentError && (
                              <p className="text-[10px] text-red-400 mt-1 italic">
                                Reason: {order.paymentError}
                              </p>
                            )}
                        </div>

                        {/* Retry Button - Only show if not paid */}
                        {order.paymentStatus !== "PAID" && (
                          <button
                            onClick={() => handleRetryPayment(order)}
                            className=" text-blue-600 hover:bg-green-600 hover:text-white rounded"
                          >
                            Retry Payment
                          </button>
                        )}
                        {/* </div> */}
                        {/* </div> */}
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
                          <div
                            key={item.productId}
                            className="flex items-center justify-between p-4 border-b"
                          >
                            <div>
                              <p className="font-bold text-gray-800">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-400 font-bold">
                                Qty: {item.quantity}
                              </p>
                            </div>

                            <div>
                              {item.isRated ? (
                                <div className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full">
                                  <span className="text-[10px] font-black text-orange-600">
                                    {item.rating} ⭐
                                  </span>
                                </div>
                              ) : order.status === "DELIVERED" ? (
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/rate-item/${order._id}/${item.productId}`,
                                    )
                                  }
                                  // className="text-[10px] font-black bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-orange-500 transition-colors"
                                  className="text-xs bg-gray-100 px-3 py-1 rounded-full font-bold"
                                >
                                  rate-item
                                </button>
                              ) : null}
                            </div>
                          </div>
                        ))}

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
