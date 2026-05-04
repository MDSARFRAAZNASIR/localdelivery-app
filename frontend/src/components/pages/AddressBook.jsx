

// addAnotherAddressBook


import React, { useEffect, useState, useCallback, useRef } from "react";
import Navbar from "../pages/Navbar";
import { useNavigate } from "react-router-dom";
import MapPicker from "./MapPicker";

export default function AddressBook({ mode = "manage", onSelect }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingPin, setFetchingPin] = useState(false); // New loader for pincode
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [timer, setTimer] = useState(0);
const [canResend, setCanResend] = useState(false);

  // --- NEW OTP STATES ---
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const formRef = useRef(null); // To scroll to form on edit
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    label: "Home",
    name: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  // const token = localStorage.getItem("token");
  // const navigate = useNavigate();
// ------------------ MOCK OTP FUNCTIONS ------------------
  const handleSendOtp = () => {
    if (form.phone.length < 10) return alert("Please enter a valid 10-digit number");
    
    setVerifying(true);
    // Simulate network delay
    setTimeout(() => {
      setOtpSent(true);
      setVerifying(false);
      setTimer(30); // Start 30-second countdown
    setCanResend(false);
      alert("DEBUG MODE: OTP sent! Use '123456' to verify.");
    }, 800);
  };

  const handleVerifyOtp = () => {
    if (otpInput === "123456") {
      setIsVerified(true);
      setOtpSent(false);
      setOtpInput("");
    } else {
      alert("Invalid OTP! Hint: Use 123456");
    }
  };
  // ------------------ CORE FUNCTIONS ------------------
  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("https://localdelivery-app-backend.vercel.app/user/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load addresses");

      setAddresses(data.addresses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchAddresses();
  }, [fetchAddresses, navigate, token]);

  useEffect(() => {
    if (mode === "select" && addresses.length > 0) {
      const def = addresses.find((a) => a.isDefault);
      if (def) {
        setSelectedId(def._id);
        onSelect?.(def);
      }
    }
  }, [addresses, mode, onSelect]);


  // 2. Add this Effect to handle the countdown
useEffect(() => {
  let interval;
  if (timer > 0) {
    interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
  } else if (timer === 0 && otpSent) {
    setCanResend(true);
    clearInterval(interval);
  }
  return () => clearInterval(interval);
}, [timer, otpSent]);

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setForm({
      label: "Home",
      name: "",
      phone: "",
      addressLine: "",
      city: "",
      state: "",
      pincode: "",
    });
  };

  const saveAddress = async () => {
    // if (!form.name.trim() || !form.phone.trim() || !form.addressLine.trim()) {
    //   alert("Please fill in Name, Phone, and Address");
    //   return;
    // }

// 🔥 Check verification before saving NEW addresses
    if (!editingId && !isVerified) {
      alert("Please verify your phone number first!");
      return;
    }
    try {
      const url = editingId
        ? `https://localdelivery-app-backend.vercel.app/user/addresses/${editingId}`
        : "https://localdelivery-app-backend.vercel.app/user/addresses";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");

      setAddresses(data.addresses);
      resetForm();
    } catch (err) {
      alert(err.message);
    }
  };

  const setDefault = async (id) => {
    try {
      const res = await fetch(`https://localdelivery-app-backend.vercel.app/user/addresses/${id}/default`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAddresses(data.addresses);
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      const res = await fetch(`https://localdelivery-app-backend.vercel.app/user/addresses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAddresses(data.addresses);
    } catch (err) {
      alert(err.message);
    }
  };

  const fetchByPincode = async (pin) => {
    if (pin.length !== 6) return;
    setFetchingPin(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data[0].Status !== "Success") {
        alert("Invalid pincode");
        return;
      }
      const postOffice = data[0].PostOffice[0];
      setForm((prev) => ({ ...prev, city: postOffice.District, state: postOffice.State }));
    } catch (err) {
      console.error("Pin fetch failed");
    } finally {
      setFetchingPin(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto p-4 sm:p-8 bg-white min-h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Address Book</h1>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Manage delivery locations</p>
          </div>
          {mode === "manage" && (
            <button
              onClick={() => { setShowForm(true); formRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
              className="bg-black text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              + Add New
            </button>
          )}
        </header>

        {loading && <div className="text-center py-10 font-black text-gray-200 animate-pulse">Loading Addresses...</div>}
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-4 text-sm font-bold">{error}</div>}

        <div className="space-y-4 mb-10">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              onClick={() => { if(mode === "select") { setSelectedId(addr._id); onSelect?.(addr); } }}
              className={`relative border-2 rounded-[24px] p-5 transition-all cursor-pointer ${
                selectedId === addr._id || addr.isDefault ? "border-orange-500 bg-orange-50/30" : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-gray-900 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                        Default
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-gray-800">{addr.name}</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    {addr.addressLine}, {addr.city}, {addr.state} - <span className="text-black font-bold">{addr.pincode}</span>
                  </p>

                  {/* <div className="text-xs font-black text-gray-400 mt-2 uppercase tracking-tighter">📞 {addr.phone}</div> */}
                  <div className="text-xs font-black text-gray-400 mt-1 uppercase">📞 {addr.phone}</div>
                </div>
                {/* <div className="flex flex-col gap-2">
                   <button onClick={() => { setEditingId(addr._id); setForm(addr); setShowForm(true); setIsVerified(true); }} className="text-[10px] font-black text-orange-600">EDIT</button>
                </div> */}

                {mode === "manage" && (
                  <div className="flex flex-col gap-2">
                    <button onClick={(e) => { 
                      e.stopPropagation(); 
                      setEditingId(addr._id); 
                      setShowForm(true); 
                      setForm(addr); 
                      setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                    }} className="text-[10px] font-black text-orange-600 hover:underline">EDIT</button>
                    {!addr.isDefault && (
                      <button onClick={(e) => { e.stopPropagation(); setDefault(addr._id); }} className="text-[10px] font-black text-blue-600 hover:underline">DEFAULT</button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); deleteAddress(addr._id); }} className="text-[10px] font-black text-red-600 hover:underline">DELETE</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div ref={formRef}>
          {showForm ? (
            <div className="bg-gray-50 rounded-[32px] p-6 sm:p-8 border border-gray-100 shadow-inner space-y-4">
              <div className="flex justify-between items-center mb-2">
                 <h2 className="font-black text-lg">{editingId ? "Edit Address" : "New Address"}</h2>
                 <button onClick={resetForm} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500">Cancel</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase mb-1 ml-1 block">Address Label</label>
                   <select value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full bg-white border-none rounded-2xl p-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-orange-500/20">
                    <option>Home</option>
                    <option>Office</option>
                    <option>Other</option>
                  </select>
                </div>

                <input placeholder="Receiver's Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="col-span-2 sm:col-span-1 bg-white border-none rounded-2xl p-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-orange-500/20" />
                {/* <input placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="col-span-2 sm:col-span-1 bg-white border-none rounded-2xl p-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-orange-500/20" /> */}
                {/* Phone & OTP UI */}
              <div className="relative">
                <input 
                  placeholder="Phone" 
                  value={form.phone} 
                  disabled={isVerified}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                  className={`w-full rounded-2xl p-4 text-sm font-bold border-none ${isVerified ? 'bg-green-100 text-green-700' : 'bg-white shadow-sm'}`} 
                />
                {!isVerified && !otpSent && (
                  <button onClick={handleSendOtp} className="absolute right-2 top-2 bottom-2 bg-black text-white px-4 rounded-xl text-[10px] font-black">
                    {verifying ? "..." : "VERIFY"}
                  </button>
                )}
                {isVerified && <span className="absolute right-4 top-4 text-green-600 text-xs font-bold">✔ Verified</span>}
              </div>

            


              {otpSent && (
  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
    <div className="flex gap-2">
      <input 
        placeholder="Enter 123456" 
        value={otpInput} 
        onChange={(e) => setOtpInput(e.target.value)} 
        className="flex-1 p-3 rounded-xl border-none text-sm font-black shadow-inner" 
      />
      <button 
        onClick={handleVerifyOtp} 
        className="bg-orange-600 text-white px-6 py-2 rounded-xl font-black text-xs hover:bg-orange-700 transition-colors"
      >
        CHECK
      </button>
    </div>
    
    <div className="mt-3 flex justify-between items-center px-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
        Didn't get the code?
      </p>
      {canResend ? (
        <button 
          onClick={handleSendOtp} 
          className="text-[10px] font-black text-orange-600 hover:underline"
        >
          RESEND NOW
        </button>
      ) : (
        <span className="text-[10px] font-black text-gray-300">
          RESEND IN {timer}s
        </span>
      )}
    </div>
  </div>
)}
                
                <textarea placeholder="House No., Building, Street Name..." value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} className="col-span-2 bg-white border-none rounded-2xl p-4 text-sm font-bold shadow-sm h-24 focus:ring-2 focus:ring-orange-500/20" />

                <div className="col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative">
                    <input placeholder="Pincode" maxLength={6} value={form.pincode} onBlur={() => fetchByPincode(form.pincode)} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="w-full bg-white border-none rounded-2xl p-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-orange-500/20" />
                    {fetchingPin && <span className="absolute right-3 top-4 animate-spin text-orange-500">⏳</span>}
                  </div>
                  <input placeholder="City" value={form.city} readOnly className="bg-gray-100 border-none rounded-2xl p-4 text-sm font-bold text-gray-400 cursor-not-allowed" />
                  <input placeholder="State" value={form.state} readOnly className="bg-gray-100 border-none rounded-2xl p-4 text-sm font-bold text-gray-400 cursor-not-allowed" />
                </div>
              </div>

              <button onClick={saveAddress} className="w-full bg-black text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-orange-600 transition-all active:scale-95">
                {editingId ? "Update Address" : "Save Location"}
              </button>
            </div>
          ) : (
            <button onClick={() => setShowMap(true)} className="w-full py-6 border-2 border-dashed border-gray-100 rounded-[32px] text-gray-400 font-black text-xs uppercase tracking-widest hover:border-blue-200 hover:text-blue-500 transition-all">
              📍 Use Interactive Map to Pin Location
            </button>
          )}
        </div>

        {showMap && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
             <div className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl">
               <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                  <span className="font-black text-xs uppercase">Move pin to your doorstep</span>
                  <button onClick={() => setShowMap(false)} className="text-xl">×</button>
               </div>
               <MapPicker
                onSelect={async ({ lat, lng }) => {
                  try {
                    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}`);
                    const data = await res.json();
                    const comp = data.results[0].address_components;
                    const get = (type) => comp.find((c) => c.types.includes(type))?.long_name || "";
                    setForm({
                      ...form,
                      addressLine: data.results[0].formatted_address,
                      city: get("locality"),
                      state: get("administrative_area_level_1"),
                      pincode: get("postal_code"),
                    });
                    setShowMap(false);
                    setShowForm(true);
                  } catch (err) { alert("Failed to fetch address"); }
                }}
              />
             </div>
          </div>
        )}
      </div>
    </>
  );
}



// addAnotherPage

// import React, { useEffect, useState, useCallback, useRef } from "react";
// import Navbar from "../pages/Navbar";
// import { useNavigate } from "react-router-dom";
// import MapPicker from "./MapPicker";

// export default function AddressBook({ mode = "manage", onSelect }) {
//   const [addresses, setAddresses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [fetchingPin, setFetchingPin] = useState(false);
//   const [error, setError] = useState("");
//   const [showForm, setShowForm] = useState(false);
//   const [selectedId, setSelectedId] = useState("");
//   const [editingId, setEditingId] = useState(null);
//   const [showMap, setShowMap] = useState(false);

//   // --- NEW OTP STATES ---
//   const [otpSent, setOtpSent] = useState(false);
//   const [otpInput, setOtpInput] = useState("");
//   const [isVerified, setIsVerified] = useState(false);
//   const [verifying, setVerifying] = useState(false);

//   const formRef = useRef(null);
//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     label: "Home",
//     name: "",
//     phone: "",
//     addressLine: "",
//     city: "",
//     state: "",
//     pincode: "",
//   });

//   // ------------------ MOCK OTP FUNCTIONS ------------------
//   const handleSendOtp = () => {
//     if (form.phone.length < 10) return alert("Please enter a valid 10-digit number");
    
//     setVerifying(true);
//     // Simulate network delay
//     setTimeout(() => {
//       setOtpSent(true);
//       setVerifying(false);
//       alert("DEBUG MODE: OTP sent! Use '123456' to verify.");
//     }, 800);
//   };

//   const handleVerifyOtp = () => {
//     if (otpInput === "123456") {
//       setIsVerified(true);
//       setOtpSent(false);
//       setOtpInput("");
//     } else {
//       alert("Invalid OTP! Hint: Use 123456");
//     }
//   };

//   // ------------------ CORE FUNCTIONS ------------------
//   const fetchAddresses = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await fetch("https://localdelivery-app-backend.vercel.app/user/addresses", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res.status === 401) return navigate("/login");
//       const data = await res.json();
//       setAddresses(data.addresses || []);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [token, navigate]);

//   useEffect(() => {
//     if (!token) navigate("/login");
//     else fetchAddresses();
//   }, [fetchAddresses, navigate, token]);

//   const resetForm = () => {
//     setEditingId(null);
//     setShowForm(false);
//     setIsVerified(false); // Reset verification for next time
//     setOtpSent(false);
//     setForm({ label: "Home", name: "", phone: "", addressLine: "", city: "", state: "", pincode: "" });
//   };

//   const saveAddress = async () => {
//     // 🔥 Check verification before saving NEW addresses
//     if (!editingId && !isVerified) {
//       alert("Please verify your phone number first!");
//       return;
//     }

//     try {
//       const url = editingId
//         ? `https://localdelivery-app-backend.vercel.app/user/addresses/${editingId}`
//         : "https://localdelivery-app-backend.vercel.app/user/addresses";

//       const res = await fetch(url, {
//         method: editingId ? "PUT" : "POST",
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Save failed");

//       setAddresses(data.addresses);
//       resetForm();
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   const fetchByPincode = async (pin) => {
//     if (pin.length !== 6) return;
//     setFetchingPin(true);
//     try {
//       const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
//       const data = await res.json();
//       if (data[0].Status === "Success") {
//         const po = data[0].PostOffice[0];
//         setForm(prev => ({ ...prev, city: po.District, state: po.State }));
//       }
//     } catch (err) { console.error(err); }
//     finally { setFetchingPin(false); }
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="max-w-3xl mx-auto p-4 sm:p-8 bg-white min-h-screen">
//         <header className="flex justify-between items-center mb-8">
//           <h1 className="text-3xl font-black text-gray-900 tracking-tight">Address Book</h1>
//           <button onClick={() => { setShowForm(true); setIsVerified(false); }} className="bg-black text-white px-5 py-2.5 rounded-2xl font-black text-xs">
//             + Add New
//           </button>
//         </header>

//         {/* --- ADDRESS LIST --- */}
//         <div className="space-y-4 mb-10">
//           {addresses.map((addr) => (
//             <div key={addr._id} className={`border-2 rounded-[24px] p-5 ${addr.isDefault ? "border-orange-500 bg-orange-50/30" : "border-gray-100"}`}>
//               <div className="flex justify-between items-start">
//                 <div>
//                   <span className="bg-gray-900 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">{addr.label}</span>
//                   <h3 className="font-black text-gray-800 mt-2">{addr.name}</h3>
//                   <p className="text-sm text-gray-500">{addr.addressLine}, {addr.city} - {addr.pincode}</p>
//                   <div className="text-xs font-black text-gray-400 mt-1 uppercase">📞 {addr.phone}</div>
//                 </div>
//                 <div className="flex flex-col gap-2">
//                    <button onClick={() => { setEditingId(addr._id); setForm(addr); setShowForm(true); setIsVerified(true); }} className="text-[10px] font-black text-orange-600">EDIT</button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* --- FORM SECTION --- */}
//         <div ref={formRef}>
//           {showForm && (
//             <div className="bg-gray-50 rounded-[32px] p-6 border border-gray-100 space-y-4">
//               <h2 className="font-black text-lg">{editingId ? "Edit Address" : "New Address"}</h2>

//               <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-white rounded-2xl p-4 text-sm font-bold shadow-sm border-none" />

//               {/* Phone & OTP UI */}
//               <div className="relative">
//                 <input 
//                   placeholder="Phone" 
//                   value={form.phone} 
//                   disabled={isVerified}
//                   onChange={(e) => setForm({ ...form, phone: e.target.value })} 
//                   className={`w-full rounded-2xl p-4 text-sm font-bold border-none ${isVerified ? 'bg-green-100 text-green-700' : 'bg-white shadow-sm'}`} 
//                 />
//                 {!isVerified && !otpSent && (
//                   <button onClick={handleSendOtp} className="absolute right-2 top-2 bottom-2 bg-black text-white px-4 rounded-xl text-[10px] font-black">
//                     {verifying ? "..." : "VERIFY"}
//                   </button>
//                 )}
//                 {isVerified && <span className="absolute right-4 top-4 text-green-600 text-xs font-bold">✔ Verified</span>}
//               </div>

//               {otpSent && (
//                 <div className="bg-orange-100 p-4 rounded-2xl flex gap-2">
//                   <input placeholder="Enter 123456" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} className="flex-1 p-3 rounded-xl border-none text-sm font-black" />
//                   <button onClick={handleVerifyOtp} className="bg-orange-600 text-white px-6 py-2 rounded-xl font-black text-xs">CHECK</button>
//                 </div>
//               )}

//               <textarea placeholder="Address Line" value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} className="w-full bg-white rounded-2xl p-4 text-sm font-bold shadow-sm h-20 border-none" />

//               <div className="grid grid-cols-2 gap-3">
//                  <input placeholder="Pincode" maxLength={6} value={form.pincode} onBlur={() => fetchByPincode(form.pincode)} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="bg-white rounded-2xl p-4 text-sm font-bold border-none" />
//                  <input placeholder="City" value={form.city} readOnly className="bg-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-400 border-none" />
//               </div>

//               <div className="flex gap-2">
//                 <button onClick={resetForm} className="flex-1 bg-gray-200 text-gray-600 py-4 rounded-2xl font-black text-xs">CANCEL</button>
//                 <button 
//                   onClick={saveAddress} 
//                   disabled={!isVerified && !editingId}
//                   className={`flex-[2] py-4 rounded-2xl font-black text-sm transition-all ${ (isVerified || editingId) ? "bg-black text-white" : "bg-gray-300 text-white cursor-not-allowed"}`}
//                 >
//                   {editingId ? "UPDATE" : "SAVE ADDRESS"}
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }