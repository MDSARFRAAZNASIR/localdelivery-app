// import React, { useEffect, useState } from "react";
// import Navbar from "./Navbar";
// import { useNavigate } from "react-router-dom";

// export default function CartPage() {
//   const [cart, setCart] = useState([]);
//   const [deliveryAddress, setDeliveryAddress] = useState("");
//   const [paymentMethod, setPaymentMethod] = useState("COD");
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [addresses, setAddresses] = useState([]);
//   const [selectedAddressId, setSelectedAddressId] = useState("");

//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     try {
//       const saved = localStorage.getItem("cart");
//       setCart(saved ? JSON.parse(saved) : []);
//     } catch {
//       setCart([]);
//     }
//   }, []);

//   const updateCart = (newCart) => {
//     setCart(newCart);
//     localStorage.setItem("cart", JSON.stringify(newCart));
//   };

//   const increaseQty = (productId) => {
//     updateCart(
//       cart.map((item) =>
//         item.productId === productId
//           ? { ...item, quantity: item.quantity + 1 }
//           : item
//       )
//     );
//   };

//   const decreaseQty = (productId) => {
//     updateCart(
//       cart
//         .map((item) =>
//           item.productId === productId
//             ? { ...item, quantity: item.quantity - 1 }
//             : item
//         )
//         .filter((item) => item.quantity > 0)
//     );
//   };

//   const removeItem = (productId) => {
//     updateCart(cart.filter((item) => item.productId !== productId));
//   };

//   const totalAmount = cart.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );

//   const handlePlaceOrder = async () => {
//     if (!token) {
//       navigate("/login");
//       return;
//     }
//     if (cart.length === 0) {
//       setError("Cart is empty");
//       return;
//     }
//     if (!deliveryAddress.trim()) {
//       setError("Please enter delivery address");
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
//             deliveryAddress,
//             paymentMethod,
//           }),
//         }
//       );

//       const data = await res.json();
//       if (!res.ok || !data.success) {
//         throw new Error(data.message || "Failed to place order");
//       }

//       setMessage("Order placed successfully ✅");
//       updateCart([]);
//       setDeliveryAddress("");
//       // old one
//       // setTimeout(() => {
//       //   navigate("/orders"); // show orders list
//       // }, 800);
//       // new one
//       const orderId = data.order?._id;

//       setTimeout(() => {
//         if (paymentMethod === "ONLINE" && orderId) {
//           navigate(`/user/orders/${orderId}`); // 👈 Pay Now page
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

//   return (
//     <>
//       <Navbar />
//       <div className="min-h-screen bg-gray-100 py-6 px-4 flex justify-center">
//         <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6">
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">
//             Your Cart 🛒
//           </h2>

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
//               <div className="space-y-3 mb-4">
//                 {cart.map((item) => (
//                   <div
//                     key={item.productId}
//                     className="flex justify-between items-center border-b pb-2"
//                   >
//                     <div>
//                       <div className="font-semibold text-gray-800">
//                         {item.name}
//                       </div>
//                       <div className="text-sm text-gray-600">
//                         ₹{item.price} × {item.quantity} ={" "}
//                         <span className="font-semibold">
//                           ₹{item.price * item.quantity}
//                         </span>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => decreaseQty(item.productId)}
//                         className="px-2 py-1 border rounded"
//                       >
//                         -
//                       </button>
//                       <span>{item.quantity}</span>
//                       <button
//                         onClick={() => increaseQty(item.productId)}
//                         className="px-2 py-1 border rounded"
//                       >
//                         +
//                       </button>
//                       <button
//                         onClick={() => removeItem(item.productId)}
//                         className="text-xs text-red-500 ml-2"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <div className="border-t pt-3 mb-4 flex justify-between items-center">
//                 <div className="text-lg font-semibold">
//                   Total: ₹{totalAmount}
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <label className="block text-sm font-medium mb-1">
//                   Delivery Address
//                 </label>
//                 {/*
//                 <textarea
//                   value={deliveryAddress}
//                   onChange={(e) => setDeliveryAddress(e.target.value)}
//                   className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
//                   placeholder="Your full delivery address"
//                 /> */}
//                 <select value={selectedAddressId}>
//                   {addresses.map((addr) => (
//                     <option key={addr._id} value={addr._id}>
//                       {addr.label} - {addr.addressLine}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="mb-4">
//                 <label className="block text-sm font-medium mb-1">
//                   Payment Method
//                 </label>
//                 <select
//                   value={paymentMethod}
//                   onChange={(e) => setPaymentMethod(e.target.value)}
//                   className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
//                 >
//                   <option value="COD">Cash on Delivery (COD)</option>
//                   <option value="ONLINE">Online Payment (later)</option>
//                 </select>
//               </div>

//               <button
//                 onClick={handlePlaceOrder}
//                 disabled={loading}
//                 className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg"
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

// add again
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
// import AddressBook from "./AddressBook";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
  //  Auto Select default address
  useEffect(() => {
    const def = addresses.find((a) => a.isDefault);
    if (def) {
      setSelectedAddressId(def._id);
    }
  }, [addresses]);

  // ------------------ LOAD ADDRESSES ------------------
  useEffect(() => {
    if (!token) return;

    const fetchAddresses = async () => {
      try {
        const res = await fetch(
          "https://localdelivery-app-backend.vercel.app/user/addresses",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to load addresses");

        setAddresses(data.addresses || []);

        // auto select default address
        const def = data.addresses?.find((a) => a.isDefault);
        if (def) setSelectedAddressId(def._id);
      } catch (err) {
        console.error("Address load error:", err);
      }
    };

    fetchAddresses();
  }, [token]);

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

    // if (!selectedAddressId) {
    //   setError("Please select a delivery address");
    //   return;
    // }
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
          // body: JSON.stringify({
          //   items: cart.map((item) => ({
          //     productId: item.productId,
          //     quantity: item.quantity,
          //   })),
          //   deliveryAddressId: selectedAddressId,
          //   paymentMethod,
          // }),
          body: JSON.stringify({
            items: cart.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
            deliveryAddressId: selectedAddressId, // 🔥 IMPORTANT
            paymentMethod,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to place order");
      }

      updateCart([]);
      setMessage("Order placed successfully ✅");

      const orderId = data.order?._id;

      setTimeout(() => {
        if (paymentMethod === "ONLINE" && orderId) {
          navigate(`/user/orders/${orderId}`); // Pay-Now screen
        } else {
          navigate("/orders"); // COD flow
        }
      }, 800);
    } catch (err) {
      console.error("Place order error:", err);
      setError(err.message || "Error placing order");
    } finally {
      setLoading(false);
    }
  };

  // ------------------ UI ------------------
  return (
    <>
      <Navbar />

      {/* add another addres book */}

      
      <div className="min-h-screen bg-gray-100 py-6 px-4 flex justify-center">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Your Cart 🛒</h2>

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
              {/* CART ITEMS */}
              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-gray-600">
                        ₹{item.price} × {item.quantity} = ₹
                        {item.price * item.quantity}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => decreaseQty(item.productId)}>
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => increaseQty(item.productId)}>
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-red-500 text-xs ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* TOTAL */}
              <div className="border-t pt-3 mb-4 flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{totalAmount}</span>
              </div>

              {/* ADDRESS SELECT */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Select Delivery Address
                </label>

                {addresses.length === 0 ? (
                  <div className="text-sm text-gray-600">
                    No saved address.
                    <button
                      onClick={() => navigate("/addresses")}
                      className="ml-2 text-blue-600 underline"
                    >
                      Add Address
                    </button>
                  </div>
                ) : (
                  // <select
                  //   value={selectedAddressId}
                  //   onChange={(e) => setSelectedAddressId(e.target.value)}
                  //   className="w-full border rounded px-3 py-2"
                  // >
                  //   {addresses.map((addr) => (
                  //     <option key={addr._id} value={addr._id}>
                  //       {addr.label} — {addr.addressLine}
                  //     </option>
                  //   ))}
                  // </select>

                  // again
                  //                   <select
                  //   value={selectedAddressId}
                  //   onChange={(e) => setSelectedAddressId(e.target.value)}
                  //   className="w-full border rounded-lg px-3 py-2"
                  // >
                  //   <option value="">Select address</option>
                  //   {addresses.map((addr) => (
                  //     <option key={addr._id} value={addr._id}>
                  //       {addr.label} - {addr.addressLine}
                  //     </option>
                  //   ))}
                  // </select>
                  // add new function
                  

                  // for default
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr._id}
                        className={`border rounded-lg p-3 cursor-pointer ${
                          selectedAddressId === addr._id
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-300"
                        }`}
                        onClick={() => setSelectedAddressId(addr._id)}

                      >
                        
                        <div className="font-semibold">
                          {addr.label}
                          {addr.isDefault && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {addr.name}, {addr.phone}
                        </div>
                        <div className="text-sm text-gray-600">
                          {addr.addressLine}, {addr.city}, {addr.state} –{" "}
                          {addr.pincode}
                        </div>

                        {selectedAddressId === addr._id && (
                          <div className="mt-2 text-sm font-semibold text-orange-600">
                            ✔ Delivering here
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PAYMENT */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="COD">Cash on Delivery</option>
                  <option value="ONLINE">Online Payment</option>
                </select>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded"
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
