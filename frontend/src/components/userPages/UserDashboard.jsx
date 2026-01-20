


// for New
// src/pages/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../pages/Navbar";

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Load profile
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "https://localdelivery-app-backend.vercel.app/user/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load profile");
        }
        setUser(data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  // Load recent orders
  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const res = await fetch(
          "https://localdelivery-app-backend.vercel.app/orders",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load orders");
        }
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-6">Loading profile...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="p-6 text-red-600">Error: {error}</div>
      </>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleString();
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Profile card */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-2">
            Welcome, {user?.username || "User"}
          </h2>
          <p className="text-sm text-gray-600">
            Email: {user?.useremail || "Not available"}
          </p>
          <p className="text-sm text-gray-600">
            Phone: {user?.userphone || "Not provided"}
          </p>
          <div className="mt-4 flex gap-2">
            <button
              className="bg-orange-500 text-white px-4 py-2 rounded text-sm"
              onClick={() => navigate("/profile")}
            >
              Edit Profile
            </button>
            <button
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm"
              onClick={() => navigate("/products")}
            >
              Shop Now
            </button>
          </div>
        </div>

        {/* Orders summary */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          {ordersLoading ? (
            <div>Loading orders...</div>
          ) : orders.length === 0 ? (
            <div>No orders yet. Start shopping from Products! 🛒</div>
          ) : (
            <ul className="space-y-3">
              {orders.slice(0, 5).map((o) => {
                const firstItems = o.items?.slice(0, 2) || [];
                const moreCount = (o.items?.length || 0) - firstItems.length;

                return (
                  <li
                    key={o._id}
                    className="border p-3 rounded flex justify-between items-start gap-4"
                  >
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Order ID:{" "}
                        <span className="font-mono">{o._id.slice(-8)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        Placed: {formatDate(o.createdAt)}
                      </div>
                      <div className="text-sm text-gray-700 mb-1">
                        {firstItems.map((it, idx) => (
                          <div key={idx}>
                            {it.name} × {it.quantity} (₹{it.subtotal})
                          </div>
                        ))}
                        {moreCount > 0 && (
                          <div className="text-xs text-gray-500">
                            + {moreCount} more item(s)
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">Total:</span> ₹
                        {o.totalAmount}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {o.status}
                      </span>
                      <button
                        className="text-xs text-blue-600"
                        onClick={() => navigate("/orders")}
                      >
                        View all orders
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
