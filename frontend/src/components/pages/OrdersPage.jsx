import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load orders");
        }

        setOrders(data.orders || []);
      } catch (err) {
        console.error("Orders fetch error:", err);
        setError(err.message || "Error loading orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, navigate]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleString();
  };

  const statusColor = (status) => {
    switch (status) {
      case "CREATED":
        return "bg-gray-200 text-gray-800";
      case "ACCEPTED":
        return "bg-blue-100 text-blue-700";
      case "PICKED":
        return "bg-purple-100 text-purple-700";
      case "ONWAY":
        return "bg-orange-100 text-orange-700";
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-8 px-4 flex justify-center">
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Your Orders 📦
            </h2>
            <button
              onClick={() => navigate("/create-order")}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-lg"
            >
              + New Order
            </button>
          </div>

          {loading ? (
            <div>Loading orders...</div>
          ) : error ? (
            <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>
          ) : orders.length === 0 ? (
            <div className="bg-white p-4 rounded shadow">
              No orders yet. Create your first order! 🎉
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div
                  key={o._id}
                  className="bg-white p-4 rounded shadow flex justify-between items-start gap-4"
                >
                  <div>
                    <div className="font-semibold text-gray-800 mb-1">
                      {o.parcelDescription}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      Created: {formatDate(o.createdAt)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">From:</span>{" "}
                      {o.pickupAddress}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">To:</span>{" "}
                      {o.dropAddress}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Price:</span> ₹{o.price}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${statusColor(
                        o.status
                      )}`}
                    >
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
