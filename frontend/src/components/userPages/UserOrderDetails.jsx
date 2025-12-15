import React, { useEffect, useState, useCallback } from "react";

import { useParams, useNavigate } from "react-router-dom";

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

const fetchOrder = useCallback(async () => {
  try {
    setLoading(true);
    const res = await fetch(
      `https://localdelivery-app-backend.vercel.app/user/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load order");

    setOrder(data.order);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}, [orderId, token]);


useEffect(() => {
  if (!token) {
    navigate("/login");
    return;
  }

  fetchOrder();
  const interval = setInterval(fetchOrder, 10000);
  return () => clearInterval(interval);
}, [fetchOrder, navigate, token]);


  if (loading) return <div className="p-6">Loading order...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

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

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-2">
            Order #{order._id.slice(-6)}
          </h2>

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
                  <div className="font-medium">
                    {item.product?.name || "Product"}
                  </div>
                  <div className="text-xs text-gray-500">
                    Qty: {item.quantity}
                  </div>
                </div>
                <div className="font-semibold">
                  ₹{item.price * item.quantity}
                </div>
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
