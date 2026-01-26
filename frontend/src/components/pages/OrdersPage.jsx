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
          },
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

  // const statusColor = (status) => {
  //   switch (status) {
  //     case "CREATED":
  //       return "bg-gray-200 text-gray-800";
  //     case "CONFIRMED":
  //       return "bg-blue-100 text-blue-700";
  //     case "DISPATCHED":
  //       return "bg-purple-100 text-purple-700";
  //     case "DELIVERED":
  //       return "bg-green-100 text-green-700";
  //     case "CANCELLED":
  //       return "bg-red-100 text-red-700";
  //     default:
  //       return "bg-gray-200 text-gray-800";
  //   }
  // };


  const statusColor = (status) => {
  switch (status) {
    case "CREATED":
      return "bg-gray-200 text-gray-800";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-700";
    case "OUT_FOR_DELIVERY":
      return "bg-orange-100 text-orange-700";
    case "DELIVERED":
      return "bg-green-100 text-green-700";
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};


  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-8 px-4 flex justify-center">
        <div className="w-full max-w-4xl">
          {/* <div className="flex justify-between items-center mb-4"> */}
          {/* new responsive */}
          <div className="flex flex-col sm:flex:row sm:justify-between sm:items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Orders 📦</h2>
            <button
              onClick={() => navigate("/products")}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-lg w-ful sm:w-auto"
            >
              + Shop More
            </button>

            {/* add invoice */}
          </div>

          {loading ? (
            <div>Loading orders...</div>
          ) : error ? (
            <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>
          ) : orders.length === 0 ? (
            <div className="bg-white p-4 rounded shadow">
              No orders yet. Start shopping from Products! 🛒
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white p-4 rounded-lg shadow border space-y-3"
                >

                  {/* new responsive */}

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
  <div>
    <div className="text-sm text-gray-500">
      Order ID:{" "}
      <span className="font-mono">{order._id.slice(-8)}</span>
    </div>
    <div className="text-xs text-gray-500">
      Placed: {formatDate(order.createdAt)}
    </div>
  </div>

  <div className="flex items-center gap-3">
    <span
      className={`text-xs px-3 py-1 rounded-full ${statusColor(
        order.status
      )}`}
    >
      {order.status}
    </span>

    <button
      onClick={() => navigate(`/invoice/${order._id}`)}
      className="text-sm text-blue-600 underline"
    >
      Invoice
    </button>
  </div>
</div>


                  <div className="text-sm text-gray-600 space-y-1">
                    {order.deliveryAddress &&
                    typeof order.deliveryAddress === "object" ? (
                      <>
                        <div className="font-medium">
                          {order.deliveryAddress.name || "Customer"}
                          {order.deliveryAddress.label &&
                            ` (${order.deliveryAddress.label})`}
                        </div>

                        <div>{order.deliveryAddress.addressLine}</div>

                        <div>
                          {order.deliveryAddress.city},{" "}
                          {order.deliveryAddress.state} –{" "}
                          {order.deliveryAddress.pincode}
                        </div>

                        <div className="text-xs text-gray-500">
                          📞 {order.deliveryAddress.phone}
                        </div>
                      </>
                    ) : (
                      <span className="italic text-gray-400">
                        Address not available
                      </span>
                    )}
                  </div>


                  {/* new responsive for items */}

                  <div>
  <div className="text-sm font-medium text-gray-700 mb-2">
    Items
  </div>

  <ul className="space-y-2">
    {order.items.map((it, idx) => (
      <li
        key={idx}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm"
      >
        <span>
          {it.name} × {it.quantity}
        </span>

        <span className="text-gray-700">
          ₹{it.price} × {it.quantity} ={" "}
          <span className="font-semibold">₹{it.subtotal}</span>
        </span>
      </li>
    ))}
  </ul>
</div>


                 


                  {/* ne responsive paytem page add */}

        <div className="border-t pt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
  <div className="text-sm text-gray-600">
    Payment:{" "}
    <span className="font-medium">{order.paymentMethod}</span>
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
