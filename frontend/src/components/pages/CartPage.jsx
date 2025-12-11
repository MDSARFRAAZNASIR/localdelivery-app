import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cart");
      setCart(saved ? JSON.parse(saved) : []);
    } catch {
      setCart([]);
    }
  }, []);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const increaseQty = (productId) => {
    updateCart(
      cart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQty = (productId) => {
    updateCart(
      cart
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId) => {
    updateCart(cart.filter((item) => item.productId !== productId));
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (cart.length === 0) {
      setError("Cart is empty");
      return;
    }
    if (!deliveryAddress.trim()) {
      setError("Please enter delivery address");
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
            items: cart.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
            deliveryAddress,
            paymentMethod,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to place order");
      }

      setMessage("Order placed successfully ✅");
      updateCart([]);
      setDeliveryAddress("");

      setTimeout(() => {
        navigate("/orders"); // show orders list
      }, 800);
    } catch (err) {
      console.error("Place order error:", err);
      setError(err.message || "Error placing order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-6 px-4 flex justify-center">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Your Cart 🛒
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

          {cart.length === 0 ? (
            <div className="text-gray-600">
              Cart is empty. Go to products and add items.
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <div className="font-semibold text-gray-800">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        ₹{item.price} × {item.quantity} ={" "}
                        <span className="font-semibold">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decreaseQty(item.productId)}
                        className="px-2 py-1 border rounded"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => increaseQty(item.productId)}
                        className="px-2 py-1 border rounded"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-xs text-red-500 ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 mb-4 flex justify-between items-center">
                <div className="text-lg font-semibold">
                  Total: ₹{totalAmount}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Delivery Address
                </label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Your full delivery address"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="COD">Cash on Delivery (COD)</option>
                  <option value="ONLINE">Online Payment (later)</option>
                </select>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg"
              >
                {loading ? "Placing order..." : "Place Order"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
