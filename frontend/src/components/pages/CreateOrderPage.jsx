import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function CreateOrderPage() {
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupPhone, setPickupPhone] = useState("");
  const [dropAddress, setDropAddress] = useState("");
  const [dropPhone, setDropPhone] = useState("");
  const [parcelDescription, setParcelDescription] = useState("");
  const [parcelWeightKg, setParcelWeightKg] = useState("");
  const [price, setPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(
        "https://localdelivery-app-backend.vercel.app/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pickupAddress,
            pickupPhone,
            dropAddress,
            dropPhone,
            parcelDescription,
            parcelWeightKg: parcelWeightKg ? Number(parcelWeightKg) : 0,
            price: price ? Number(price) : 0,
            paymentMethod,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create order");
      }

      setMessage("Order created successfully ✅");
      // Optionally redirect to orders list
      setTimeout(() => {
        navigate("/orders");
      }, 800);
    } catch (err) {
      console.error("Create order error:", err);
      setError(err.message || "Error creating order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Create New Order 📦
          </h2>

          {error && (
            <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-3 text-sm text-green-600 bg-green-50 p-2 rounded">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pickup */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Pickup Address *
              </label>
              <textarea
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Pickup Phone
              </label>
              <input
                type="tel"
                value={pickupPhone}
                onChange={(e) => setPickupPhone(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="+91 98765 43210"
              />
            </div>

            {/* Drop */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Drop Address *
              </label>
              <textarea
                value={dropAddress}
                onChange={(e) => setDropAddress(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Drop Phone
              </label>
              <input
                type="tel"
                value={dropPhone}
                onChange={(e) => setDropPhone(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="+91 98765 43210"
              />
            </div>

            {/* Parcel */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Parcel Description *
              </label>
              <input
                type="text"
                value={parcelDescription}
                onChange={(e) => setParcelDescription(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
                placeholder="Documents, food, clothes, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Parcel Weight (kg)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={parcelWeightKg}
                onChange={(e) => setParcelWeightKg(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="e.g. 1.5"
              />
            </div>

            {/* Price + payment */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Approx Price (₹)
              </label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="e.g. 120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="COD">Cash on Delivery (COD)</option>
                <option value="ONLINE">Online Payment</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition"
            >
              {loading ? "Creating..." : "Create Order"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
