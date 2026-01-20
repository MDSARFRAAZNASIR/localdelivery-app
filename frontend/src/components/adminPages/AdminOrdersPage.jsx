import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../pages/Navbar";

const STATUS_OPTIONS = [
  "CREATED",
  "CONFIRMED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://localdelivery-app-backend.vercel.app/admin/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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

      // update UI instantly
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <Navbar />

      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">📦 Admin Orders</h1>

        {loading && <div>Loading orders...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && orders.length === 0 && <div>No orders found.</div>}

        {!loading && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 bg-white rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Order ID</th>
                  <th className="p-2 border">User</th>
                  <th className="p-2 border">Amount</th>
                  <th className="p-2 border">Payment</th>

                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="text-center">
                    <td className="p-2 border text-xs">
                      {order._id.slice(-6)}
                    </td>
                    <td className="p-2 border">
                      <div className="font-medium">
                        {order.userId?.username || "User"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.userId?.useremail}
                      </div>
                    </td>
                    <td className="p-2 border font-semibold">
                      ₹{order.totalAmount}
                    </td>
                    <td className="p-2 border">
                      <div className="text-sm font-medium">
                        {order.paymentMethod}
                      </div>
                      <div
                        className={`text-xs font-semibold ${
                          order.paymentStatus === "PAID"
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      >
                        {order.paymentStatus}
                      </div>
                    </td>

                    <td className="p-2 border">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatus(order._id, e.target.value)
                        }
                        className="border rounded px-2 py-1"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 border text-sm">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="p-2 border text-sm">
                      <button
                        onClick={() => navigate(`/invoice/${order._id}`)}
                        className="text-sm text-blue-600 underline mt-2"
                      >
                        Download Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
