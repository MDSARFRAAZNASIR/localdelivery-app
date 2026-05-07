import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [serviceArea, setServiceArea] = useState(null);
  const [checkingArea, setCheckingArea] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ------------------ LOAD CART ------------------
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cart");
      setCart(saved ? JSON.parse(saved) : []);
    } catch {
      setCart([]);
    }
  }, []);

  // ------------------ LOAD ADDRESSES ------------------

  useEffect(() => {
    if (!token) return;
    const fetchAddresses = async () => {
      try {
        const res = await fetch(
          "https://localdelivery-app-backend.vercel.app/user/addresses",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to load addresses");

        setAddresses(data.addresses || []);
        const def = data.addresses?.find((a) => a.isDefault);
        if (def) setSelectedAddressId(def._id);
      } catch (err) {
        console.error("Address load error:", err);
      }
    };
    fetchAddresses();
  }, [token]);

  // ------------------ SERVICE AREA CHECK ------------------
  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);
  useEffect(() => {
    if (!selectedAddress) {
      setServiceArea(null);
      return;
    }
    const checkArea = async () => {
      setCheckingArea(true);
      try {
        const res = await fetch(
          `https://localdelivery-app-backend.vercel.app/service-area/check?pincode=${selectedAddress.pincode}`,
        );
        const data = await res.json();
        setServiceArea(data);
      } catch (err) {
        console.error("Area check error", err);
      } finally {
        setCheckingArea(false);
      }
    };
    checkArea();
  }, [selectedAddress]);

  // ------------------ CART HELPERS ------------------
  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const increaseQty = (productId) => {
    updateCart(
      cart.map((item) => {
        if (item.productId === productId) {
          // 🚨 Check if adding 1 exceeds stock
          if (item.quantity >= item.stock) {
            setError(`Only ${item.stock} units available in stock!`);
            return item;
          }
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      }),
    );
  };

  const decreaseQty = (productId) => {
    updateCart(
      cart
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (productId) => {
    updateCart(cart.filter((item) => item.productId !== productId));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryFee = serviceArea?.serviceable ? serviceArea.deliveryFee : 0;
  const grandTotal = subtotal + deliveryFee;

  // ------------------ PLACE ORDER ------------------

  const handlePlaceOrder = async () => {
    // --- SAFETY CHECKS ---
    if (!token) return navigate("/login");
    if (cart.length === 0) return setError("Cart is empty");
    if (!selectedAddressId) return setError("Please select a delivery address");

    const outOfStockItem = cart.find((item) => item.quantity > item.stock);
    if (outOfStockItem) {
      setError(`${outOfStockItem.name} only has ${outOfStockItem.stock} left.`);
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      // 1. CREATE ORDER IN DATABASE
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
            deliveryAddressId: selectedAddressId,
            paymentMethod, // This comes from your state (COD or ONLINE)
          }),
        },
      );

      const data = await res.json();
      // const data = await res.json();
      console.log("Full Server Response:", data);
      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to place order");

      const orderId = data.order?._id;
      const totalAmount = data.order?.totalAmount;

      // 2. CLEAR CART IMMEDIATELY (Order is already saved in DB)
      updateCart([]);

      // 3. LOGIC BRANCHING: COD vs ONLINE
      if (paymentMethod === "COD") {
        setMessage("Order placed successfully! ✅");
        setTimeout(() => navigate("/orders"), 1500);
      } else {
        // Trigger Razorpay Modal
        handleRazorpayPayment(orderId, totalAmount);
      }
    } catch (err) {
      setError(err.message || "Error placing order");
    } finally {
      setLoading(false);
    }
  };

  // for the trigger the page after the online place order
  const handleRazorpayPayment = async (orderId, amount) => {
    try {
      // Fetch the Razorpay Order ID from your backend
      const res = await fetch(
        "https://localdelivery-app-backend.vercel.app/payments/razorpay/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderId }),
        },
      );

      const data = await res.json();
      // 🛡️ SAFETY CHECK: If the server gave an error, stop here!
      if (!res.ok || !data.razorpayOrder) {
        throw new Error(
          data.message || "Server failed to create Razorpay Order",
        );
      }

      const options = {
        // key: data.key,

        key: "rzp_live_SlRoLg9MFbnLUV",
        amount: data.razorpayOrder.amount,
        currency: "INR",
        name: "Local Delivery",
        description: "Order Payment",
        order_id: data.razorpayOrder.id,

        handler: async (response) => {
          // VERIFY PAYMENT
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
                orderId: orderId,
              }),
            },
          );

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert("Payment Successful! Your order is confirmed.🎉");
            // navigate(`/orders`);
            window.location.href = "/orders";
          } else {
            setError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "User", // You can pass actual user name from profile
        },
        theme: { color: "#16a34a" }, // Green theme to match your app
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("DEBUG PAYMENT ERROR:", err); // 👈 Add this line
      setError(`Payment Error: ${err.message}`);
      // setError("Could not initialize payment gateway.");
    }
  };

  // signature varify

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex justify-center pb-24">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Items and Address */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black flex items-center gap-2">
                  Your Basket{" "}
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-sm">
                    {cart.length} Items
                  </span>
                </h2>

                {/* 1. TOP ADD MORE BUTTON */}
                {cart.length > 0 && (
                  <button
                    onClick={() => navigate("/products")}
                    className="text-[10px] font-black text-green-700 bg-green-50 px-3 py-2 rounded-xl uppercase tracking-widest hover:bg-green-100 transition-colors"
                  >
                    + Add More
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-400 mb-4 font-bold">
                    Your cart is feeling light...
                  </p>
                  <button
                    onClick={() => navigate("/products")}
                    className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-50">
                    {cart.map((item) => (
                      <div
                        key={item.productId}
                        className="py-4 flex items-center justify-between group"
                      >
                        <div className="flex-1">
                          <div className="font-bold text-gray-800">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-400 font-bold">
                            ₹{item.price} per unit
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center bg-gray-100 rounded-xl p-1">
                            <button
                              onClick={() => decreaseQty(item.productId)}
                              className="w-8 h-8 flex items-center justify-center font-black text-gray-500 hover:text-black"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-black text-sm">
                              {item.quantity}
                            </span>

                            {/* <button onClick={() => increaseQty(item.productId)} className="w-8 h-8 flex items-center justify-center font-black text-gray-500 hover:text-black">+</button> */}
                            <button
                              onClick={() => increaseQty(item.productId)}
                              disabled={item.quantity >= item.stock} // 🚨 Disable if max stock reached
                              className={`w-8 h-8 flex items-center justify-center font-black transition-colors ${
                                item.quantity >= item.stock
                                  ? "text-gray-200 cursor-not-allowed"
                                  : "text-gray-500 hover:text-black"
                              }`}
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-red-400 hover:text-red-600 p-2 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 2. BOTTOM ADD MORE "DASHED" BUTTON */}
                  <button
                    onClick={() => navigate("/products")}
                    className="w-full mt-4 py-4 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center gap-2 text-gray-400 font-bold hover:border-green-200 hover:text-green-600 hover:bg-green-50/30 transition-all group"
                  >
                    <span className="text-xl group-hover:scale-125 transition-transform">
                      +
                    </span>
                    <span className="text-sm">
                      Forgot something? Add more items
                    </span>
                  </button>
                </>
              )}
            </div>

            {/* ... (rest of your Address selection code) ... */}

            {/* Address Selection */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black">Delivery Address</h2>
                <button
                  onClick={() => navigate("/address")}
                  className="text-xs font-black text-blue-600 uppercase tracking-widest"
                >
                  + Add New
                </button>
              </div>

              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    onClick={() => setSelectedAddressId(addr._id)}
                    className={`relative p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                      selectedAddressId === addr._id
                        ? "border-green-500 bg-green-50/30"
                        : "border-gray-50 bg-gray-50/50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="font-black text-sm mb-1">{addr.label}</div>
                    <div className="text-xs text-gray-500 leading-relaxed font-medium">
                      <h3 className="font-black text-gray-800">{addr.name}</h3>
                      {addr.addressLine}, {addr.city} , {addr.state} -{" "}
                      <span className="text-black font-bold">
                        {addr.pincode}
                      </span>
                      <div className="text-xs font-black text-gray-400 mt-1 uppercase">
                        📞 {addr.phone}
                      </div>
                    </div>
                    {selectedAddressId === addr._id && (
                      <div className="absolute top-4 right-4 text-green-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Summary and Payment * * new add application upi is show */}

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-24">
              <h3 className="font-black text-lg mb-6">Bill Details</h3>

              {/* --- Price Breakdown --- */}
              <div className="space-y-3 text-sm font-bold text-gray-500 mb-6">
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span className="text-gray-800">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span
                    className={
                      deliveryFee > 0 ? "text-gray-800" : "text-green-600"
                    }
                  >
                    {deliveryFee > 0 ? `₹${deliveryFee}` : "FREE"}
                  </span>
                </div>
                {checkingArea && (
                  <div className="text-[10px] text-orange-500 animate-pulse">
                    Checking pincode serviceability...
                  </div>
                )}
                <div className="border-t border-dashed pt-3 flex justify-between text-lg font-black text-black">
                  <span>Grand Total</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>

              {/* --- Payment Selection --- */}
              <div className="mb-6">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">
                  Choose Payment Method
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {/* COD Option */}
                  <button
                    onClick={() => setPaymentMethod("COD")}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === "COD"
                        ? "border-green-600 bg-green-50"
                        : "border-gray-100 bg-gray-50 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">💵</span>
                      <span className="font-bold text-sm text-gray-800">
                        Cash on Delivery
                      </span>
                    </div>
                    {paymentMethod === "COD" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-green-600 shadow-[0_0_8px_rgba(22,163,74,0.5)]" />
                    )}
                  </button>

                  {/* Online Payment Option */}
                  <button
                    onClick={() => setPaymentMethod("ONLINE")}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === "ONLINE"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-100 bg-gray-50 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📱</span>
                      <div className="text-left">
                        <p className="font-bold text-sm text-gray-800">
                          Online Payment
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium">
                          Fast & Secure
                        </p>
                      </div>
                    </div>
                    {paymentMethod === "ONLINE" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                    )}
                  </button>
                </div>

                {/* --- Visual Payment Icons (Shows when ONLINE is selected) --- */}
                {paymentMethod === "ONLINE" && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-around animate-in fade-in slide-in-from-top-2">
                    <img
                      src="https://img.icons8.com/color/48/google-pay-india.png"
                      className="h-6 grayscale hover:grayscale-0 transition-all"
                      alt="GPay"
                    />
                    <img
                      src="https://img.icons8.com/color/48/phone-pe.png"
                      className="h-6 grayscale hover:grayscale-0 transition-all"
                      alt="PhonePe"
                    />
                    <img
                      src="https://img.icons8.com/color/48/visa.png"
                      className="h-4 grayscale hover:grayscale-0 transition-all"
                      alt="Visa"
                    />
                    <img
                      src="https://img.icons8.com/color/48/mastercard.png"
                      className="h-6 grayscale hover:grayscale-0 transition-all"
                      alt="Mastercard"
                    />
                    <span className="text-[8px] font-black text-gray-400 uppercase">
                      Secure by Razorpay
                    </span>
                  </div>
                )}
              </div>

              {/* --- Error/Success Messages --- */}
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl mb-4 text-center border border-red-100">
                  {error}
                </div>
              )}
              {message && (
                <div className="p-3 bg-green-50 text-green-600 text-xs font-bold rounded-xl mb-4 text-center border border-green-100">
                  {message}
                </div>
              )}

              {/* --- Submit Button --- */}
              <button
                onClick={handlePlaceOrder}
                disabled={
                  loading ||
                  (selectedAddressId && serviceArea && !serviceArea.serviceable)
                }
                className={`w-full py-4 rounded-2xl text-white font-black shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  serviceArea?.serviceable
                    ? "bg-black hover:bg-gray-900 shadow-gray-900/20"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    PROCESSING...
                  </>
                ) : paymentMethod === "ONLINE" ? (
                  "PAY & PLACE ORDER"
                ) : (
                  "CONFIRM ORDER"
                )}
              </button>

              {!serviceArea?.serviceable &&
                selectedAddressId &&
                !checkingArea && (
                  <p className="text-[10px] text-red-500 font-bold text-center mt-3 leading-tight uppercase tracking-tighter">
                    🚫 We don't deliver to {selectedAddress?.pincode} yet!
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
