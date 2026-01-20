


  // another order page
  import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import Navbar from "../components/Navbar";
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
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";
      case "DISPATCHED":
        return "bg-purple-100 text-purple-700";
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
              onClick={() => navigate("/products")}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-lg"
            >
              + Shop More
            </button>

            {/* add invoice */}
   

          </div>

          {loading ? (
            <div>Loading orders...</div>
          ) : error ? (
            <div className="text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white p-4 rounded shadow">
              No orders yet. Start shopping from Products! 🛒
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white p-4 rounded shadow border"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-sm text-gray-500">
                        Order ID:{" "}
                        <span className="font-mono">
                          {order._id.slice(-8)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Placed: {formatDate(order.createdAt)}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${statusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                 
                    <span>
                                                   {/* <button
  onClick={() => navigate(`/invoice/${order._id}`)}
  className="text-sm text-blue-600 underline"
>
  View Invoice
</button> */}
<button
  onClick={() => navigate(`/invoice/${order._id}`)}
  className="text-sm text-blue-600 underline mt-2"
>
  Download Invoice
</button>


                    </span>

                  </div>


<div className="text-sm text-gray-600">
  {order.deliveryAddress && typeof order.deliveryAddress === "object" ? (
    <>
      <div className="font-medium">
        {order.deliveryAddress.name || "Customer"}
        {order.deliveryAddress.label && ` (${order.deliveryAddress.label})`}
      </div>

      <div>{order.deliveryAddress.addressLine}</div>

      <div>
        {order.deliveryAddress.city}, {order.deliveryAddress.state} –{" "}
        {order.deliveryAddress.pincode}
      </div>

      <div className="text-xs text-gray-500">
        📞 {order.deliveryAddress.phone}
      </div>
    </>
  ) : (
    <span className="italic text-gray-400">Address not available</span>
  )}
</div>




                  <div className="mt-2">
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Items
                    </div>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {order.items.map((it, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between items-center"
                        >
                          <span>
                            {it.name} × {it.quantity}
                          </span>
                          <span>
                            ₹{it.price} × {it.quantity} ={" "}
                            <span className="font-semibold">
                              ₹{it.subtotal}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t mt-3 pt-2 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Payment:{" "}
                      <span className="font-medium">
                        {order.paymentMethod}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-orange-600">
                      Total: ₹{order.totalAmount}
                    </div>
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
