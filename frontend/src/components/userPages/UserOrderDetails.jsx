import React, { useEffect, useState, useCallback } from "react";

import { useParams, useNavigate } from "react-router-dom";
import OrderStatusStepper from "../pages/OrderStatusStepper";

import Navbar from "../pages/Navbar";
const STATUS_COLORS = {
  CREATED: "bg-gray-200 text-gray-800",
  CONFIRMED: "bg-blue-100 text-blue-700",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-green-100 text-green-700",
};

export default function UserOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");



  // another code add in place of above
  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);

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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId, token, navigate]);

  

  // add another inplace of above code

  useEffect(() => {
    fetchOrder();

    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  if (loading) return <div className="p-6">Loading order...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  const cancelOrder = async () => {
    if (!window.confirm("Cancel this order?")) return;

    try {
      const res = await fetch(
        `https://localdelivery-app-backend.vercel.app/user/orders/${order._id}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setOrder(data.order);
    } catch (err) {
      alert(err.message || "Cancel failed");
    }
  };

  // pay now handler
  const handleOnlinePayment = async () => {
    try {
      // 1. Create Razorpay order from backend
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

      // 2. Razorpay options
      const options = {
        key: data.key, // Razorpay public key
        amount: data.razorpayOrder.amount,
        currency: "INR",
        name: "Local Delivery App",
        description: "Order Payment",
        order_id: data.razorpayOrder.id,

        handler: async function (response) {
          // 3. Verify payment on backend
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
          if (!verifyRes.ok)
            throw new Error(
              verifyData.message || "Payment verification failed"
            );

          alert("✅ Payment Successful");
          setOrder(verifyData.order); // refresh UI
        },

        theme: {
          color: "#f97316", // orange
        },
      };

      // 4. Open Razorpay popup
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err.message || "Payment failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-sm text-blue-600"
        >
          ← Back
        </button>
        {order.status === "CREATED" && (
          <button
            onClick={cancelOrder}
            className="mb-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Cancel Order
          </button>
        )}
        <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
          <div>
            Payment Method:
            <span className="font-semibold ml-1">{order.paymentMethod}</span>
          </div>
          <div>
            Payment Status:
            <span
              className={`font-semibold ml-1 ${
                order.paymentStatus === "PAID"
                  ? "text-green-600"
                  : "text-orange-600"
              }`}
            >
              {order.paymentStatus}
            </span>
          </div>
          {order.paymentMethod === "ONLINE" &&
            order.paymentStatus === "PENDING" && (
              <button
                onClick={handleOnlinePayment}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded"
              >
                Pay Now
              </button>
            )}
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-2">
            Order #{order._id.slice(-6)}
          </h2>
          <OrderStatusStepper status={order.status} />

          <div
            className={`inline-block px-3 py-1 rounded text-sm font-semibold mb-4 ${
              STATUS_COLORS[order.status]
            }`}
          >
            {order.status}
          </div>

          <div className="text-sm text-gray-600 mb-4">
            Placed on: {new Date(order.createdAt).toLocaleString()}
          </div>

          <h3 className="font-semibold mb-2">Items</h3>

        
          <ul className="divide-y">
            {order.items.map((item) => (
              <li key={item._id} className="py-2 flex justify-between">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">
                    Qty: {item.quantity}
                  </div>
                </div>
                <div className="font-semibold">₹{item.subtotal}</div>
                <button
                  onClick={() => navigate(`/invoice/${order._id}`)}
                  className="mt-4 bg-gray-800 text-white px-4 py-2 rounded"
                >
                  🧾 View Invoice
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>
      </div>
    </>
  );
}
