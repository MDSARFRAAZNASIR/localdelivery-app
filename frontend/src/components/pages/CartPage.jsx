// // add again
// import React, { useEffect, useState } from "react";
// import Navbar from "./Navbar";
// import { useNavigate } from "react-router-dom";
// // import AddressBook from "./AddressBook";

// export default function CartPage() {
//   const [cart, setCart] = useState([]);
//   const [addresses, setAddresses] = useState([]);
//   const [selectedAddressId, setSelectedAddressId] = useState("");
//   const [paymentMethod, setPaymentMethod] = useState("COD");
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [serviceArea, setServiceArea] = useState(null);
//   const [checkingArea, setCheckingArea] = useState(false);

//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   // ------------------ LOAD CART ------------------
//   useEffect(() => {
//     try {
//       const saved = localStorage.getItem("cart");
//       setCart(saved ? JSON.parse(saved) : []);
//     } catch {
//       setCart([]);
//     }
//   }, []);
//   //  Auto Select default address
//   useEffect(() => {
//     const def = addresses.find((a) => a.isDefault);
//     if (def) {
//       setSelectedAddressId(def._id);
//     }
//   }, [addresses]);

//   // ------------------ LOAD ADDRESSES ------------------
//   useEffect(() => {
//     if (!token) return;

//     const fetchAddresses = async () => {
//       try {
//         const res = await fetch(
//           "https://localdelivery-app-backend.vercel.app/user/addresses",
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           },
//         );

//         const data = await res.json();
//         if (!res.ok)
//           throw new Error(data.message || "Failed to load addresses");

//         setAddresses(data.addresses || []);

//         // auto select default address
//         const def = data.addresses?.find((a) => a.isDefault);
//         if (def) setSelectedAddressId(def._id);
//       } catch (err) {
//         console.error("Address load error:", err);
//       }
//     };

//     fetchAddresses();
//   }, [token]);

//   // check pin code
//   const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

//   useEffect(() => {
//     if (!selectedAddress) return;

//     const checkArea = async () => {
//       setCheckingArea(true);

//       const res = await fetch(
//         `https://localdelivery-app-backend.vercel.app/service-area/check?pincode=${selectedAddress.pincode}`,
//       );
//       const data = await res.json();

//       setServiceArea(data);
//       setCheckingArea(false);
//     };

//     checkArea();
//   }, [selectedAddress]);

//   // ------------------ CART HELPERS ------------------
//   const updateCart = (newCart) => {
//     setCart(newCart);
//     localStorage.setItem("cart", JSON.stringify(newCart));
//   };

//   const increaseQty = (productId) => {
//     updateCart(
//       cart.map((item) =>
//         item.productId === productId
//           ? { ...item, quantity: item.quantity + 1 }
//           : item,
//       ),
//     );
//   };

//   const decreaseQty = (productId) => {
//     updateCart(
//       cart
//         .map((item) =>
//           item.productId === productId
//             ? { ...item, quantity: item.quantity - 1 }
//             : item,
//         )
//         .filter((item) => item.quantity > 0),
//     );
//   };

//   const removeItem = (productId) => {
//     updateCart(cart.filter((item) => item.productId !== productId));
//   };

//   const totalAmount = cart.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0,
//   );

//   // ------------------ PLACE ORDER ------------------
//   const handlePlaceOrder = async () => {
//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     if (cart.length === 0) {
//       setError("Cart is empty");
//       return;
//     }

//     if (!selectedAddressId) {
//       setError("Please select a delivery address");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setMessage("");

//     try {
//       const res = await fetch(
//         "https://localdelivery-app-backend.vercel.app/orders",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },

//           body: JSON.stringify({
//             items: cart.map((item) => ({
//               productId: item.productId,
//               quantity: item.quantity,
//             })),
//             deliveryAddressId: selectedAddressId, // 🔥 IMPORTANT
//             paymentMethod,
//           }),
//         },
//       );

//       const data = await res.json();
//       if (!res.ok || !data.success) {
//         throw new Error(data.message || "Failed to place order");
//       }

//       updateCart([]);
//       setMessage("Order placed successfully ✅");

//       const orderId = data.order?._id;

//       setTimeout(() => {
//         if (paymentMethod === "ONLINE" && orderId) {
//           navigate(`/user/orders/${orderId}`); // Pay-Now screen
//         } else {
//           navigate("/orders"); // COD flow
//         }
//       }, 800);
//     } catch (err) {
//       console.error("Place order error:", err);
//       setError(err.message || "Error placing order");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ------------------ UI ------------------
//   return (
//     <>
//       <Navbar />

//       {/* add another addres book */}

//       <div className="min-h-screen bg-gray-100 py-6 px-4 flex justify-center">
//         <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6">
//           <h2 className="text-2xl font-bold mb-4">Your Cart 🛒</h2>

//           {error && (
//             <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">
//               {error}
//             </div>
//           )}
//           {message && (
//             <div className="mb-3 text-sm text-green-600 bg-green-50 p-2 rounded">
//               {message}
//             </div>
//           )}

//           {cart.length === 0 ? (
//             <div className="text-gray-600">
//               Cart is empty. Go to products and add items.
//             </div>
//           ) : (
//             <>
//               {/* responsive */}

//               <div className="space-y-4 mb-6">
//                 {cart.map((item) => (
//                   <div
//                     key={item.productId}
//                     className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b pb-4"
//                   >
//                     {/* Left */}
//                     <div>
//                       <div className="font-semibold text-base">{item.name}</div>
//                       <div className="text-sm text-gray-600">
//                         ₹{item.price} × {item.quantity} = ₹
//                         {item.price * item.quantity}
//                       </div>
//                     </div>

//                     {/* Right */}
//                     <div className="flex items-center justify-between md:justify-end gap-4">
//                       <div className="flex items-center gap-3">
//                         <button
//                           onClick={() => decreaseQty(item.productId)}
//                           className="px-3 py-1 border rounded"
//                         ></button>

//                         <span className="font-semibold">{item.quantity}</span>

//                         <button
//                           onClick={() => increaseQty(item.productId)}
//                           className="px-3 py-1 border rounded"
//                         >
//                           +
//                         </button>
//                       </div>

//                       <button
//                         onClick={() => removeItem(item.productId)}
//                         className="text-red-500 text-sm"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* TOTAL */}

//               <div className="border-t pt-4 mb-6 flex justify-between font-semibold text-lg">
//                 <span>Total</span>
//                 <span>₹{totalAmount}</span>
//               </div>

//               {/* ADDRESS SELECT */}
//               <div className="mb-4">
//                 <label className="block text-sm font-medium mb-1">
//                   Select Delivery Address
//                 </label>

//                 {addresses.length === 0 ? (
//                   <div className="text-sm text-gray-600">
//                     No saved address.
//                     <button
//                       onClick={() => navigate("/address")}
//                       className="ml-2 text-blue-600 underline"
//                     >
//                       Add Address
//                     </button>
//                   </div>
//                 ) : (
//                   // responsive

//                   <div className="space-y-4">
//                     {addresses.map((addr) => (
//                       <div
//                         key={addr._id}
//                         onClick={() => setSelectedAddressId(addr._id)}
//                         className={`border rounded-lg p-4 cursor-pointer transition ${
//                           selectedAddressId === addr._id
//                             ? "border-orange-500 bg-orange-50"
//                             : "border-gray-300"
//                         }`}
//                       >
//                         <div className="flex justify-between items-center">
//                           <div className="font-semibold">
//                             {addr.label}
//                             {addr.isDefault && (
//                               <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
//                                 Default
//                               </span>
//                             )}
//                           </div>
//                         </div>

//                         <div className="text-sm text-gray-600 mt-1">
//                           {addr.name}, {addr.phone}
//                         </div>

//                         <div className="text-sm text-gray-600">
//                           {addr.addressLine}, {addr.city}, {addr.state} –{" "}
//                           {addr.pincode}
//                         </div>

//                         {selectedAddressId === addr._id && (
//                           <div className="mt-2 text-sm font-semibold text-orange-600">
//                             ✔ Delivering here
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* PAYMENT */}
//               <div className="mb-4">
//                 <label className="block text-sm font-medium mb-1">
//                   Payment Method
//                 </label>
//                 <select
//                   value={paymentMethod}
//                   onChange={(e) => setPaymentMethod(e.target.value)}
//                   className="w-full border rounded px-3 py-2 text-sm md:text-base"
//                 >
//                   <option value="COD">Cash on Delivery</option>
//                   <option value="ONLINE">Online Payment</option>
//                 </select>
//               </div>

//               {/* add extra button */}

//               {checkingArea && (
//                 <div className="text-sm text-gray-500">
//                   Checking delivery area…
//                 </div>
//               )}

//               {serviceArea && !serviceArea.serviceable && (
//                 <div className="bg-red-100 text-red-700 p-3 rounded mt-3">
//                   ❌ Sorry, delivery is not available in your area
//                 </div>
//               )}

//               {serviceArea?.serviceable && (
//                 <div className="bg-green-50 text-green-700 p-3 rounded mt-3">
//                   🚚 Delivering to <b>{serviceArea.areaName || "your area"}</b>
//                   <br />
//                   Delivery Fee: <b>₹{serviceArea.deliveryFee}</b>
//                 </div>
//               )}

//               <button
//                 onClick={handlePlaceOrder}
//                 disabled={!serviceArea?.serviceable}
//                 className={`w-full py-3  rounded text-white text-lg font-semibold ${
//                   serviceArea?.serviceable
//                     ? "bg-orange-500 hover:bg-orange-600"
//                     : "bg-gray-400 cursor-not-allowed"
//                 }`}
//               >
//                 {loading ? "Placing order..." : "Place Order"}
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

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
      cart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
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
    if (!token) {
      navigate("/login");
      return;
    }
    if (cart.length === 0) {
      setError("Cart is empty");
      return;
    }
    if (!selectedAddressId) {
      setError("Please select a delivery address");
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
            deliveryAddressId: selectedAddressId,
            paymentMethod,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to place order");

      updateCart([]);
      setMessage("Order placed successfully ✅");
      const orderId = data.order?._id;

      setTimeout(() => {
        if (paymentMethod === "ONLINE" && orderId) {
          navigate(`/user/orders/${orderId}`);
        } else {
          navigate("/orders");
        }
      }, 800);
    } catch (err) {
      setError(err.message || "Error placing order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex justify-center pb-24">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8">


          {/* LEFT COLUMN: Items and Address */}
          {/* <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                Your Basket{" "}
                <span className="bg-gray-100 px-2 py-0.5 rounded text-sm">
                  {cart.length} Items
                </span>
              </h2>

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
                          <button
                            onClick={() => increaseQty(item.productId)}
                            className="w-8 h-8 flex items-center justify-center font-black text-gray-500 hover:text-black"
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
              )}
            </div> */}
            {/* LEFT COLUMN: Items and Address */}
<div className="lg:col-span-2 space-y-6">
  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-black flex items-center gap-2">
        Your Basket <span className="bg-gray-100 px-2 py-0.5 rounded text-sm">{cart.length} Items</span>
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
        <p className="text-gray-400 mb-4 font-bold">Your cart is feeling light...</p>
        <button onClick={() => navigate("/products")} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold">Start Shopping</button>
      </div>
    ) : (
      <>
        <div className="divide-y divide-gray-50">
          {cart.map((item) => (
            <div key={item.productId} className="py-4 flex items-center justify-between group">
              <div className="flex-1">
                <div className="font-bold text-gray-800">{item.name}</div>
                <div className="text-sm text-gray-400 font-bold">₹{item.price} per unit</div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-xl p-1">
                  <button onClick={() => decreaseQty(item.productId)} className="w-8 h-8 flex items-center justify-center font-black text-gray-500 hover:text-black">−</button>
                  <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                  <button onClick={() => increaseQty(item.productId)} className="w-8 h-8 flex items-center justify-center font-black text-gray-500 hover:text-black">+</button>
                </div>
                <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600 p-2 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
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
          <span className="text-xl group-hover:scale-125 transition-transform">+</span>
          <span className="text-sm">Forgot something? Add more items</span>
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
                      {addr.addressLine}, {addr.city} - {addr.pincode}
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

          {/* RIGHT COLUMN: Summary and Payment */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-24">
              <h3 className="font-black text-lg mb-6">Bill Details</h3>

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

              <div className="mb-6">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                  Payment Mode
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-green-500/20"
                >
                  <option value="COD">Cash on Delivery</option>
                  <option value="ONLINE">Pay via Online (UPI/Card)</option>
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl mb-4 text-center">
                  {error}
                </div>
              )}
              {message && (
                <div className="p-3 bg-green-50 text-green-600 text-xs font-bold rounded-xl mb-4 text-center">
                  {message}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={
                  loading ||
                  (selectedAddressId && serviceArea && !serviceArea.serviceable)
                }
                className={`w-full py-4 rounded-2xl text-white font-black shadow-lg transition-all active:scale-95 ${
                  serviceArea?.serviceable
                    ? "bg-black hover:bg-green-700 shadow-green-900/10"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {loading ? "PROCESSING..." : "PLACE ORDER"}
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
