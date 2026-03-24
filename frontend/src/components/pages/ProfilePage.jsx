// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Navbar from "./Navbar";

// export default function ProfilePage() {
//   const [username, setUsername] = useState("");
//   const [useremail, setUseremail] = useState("");
//   const [userphone, setUserphone] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const token = localStorage.getItem("token");

//   // load profile on mount
//   useEffect(() => {
//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     const fetchProfile = async () => {
//       try {
//         setLoading(true);
//         setError("");
//         const res = await fetch(
//           "https://localdelivery-app-backend.vercel.app/user/profile",
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           },
//         );

//         const data = await res.json();
//         if (!res.ok || !data.success) {
//           throw new Error(data.message || "Failed to load profile");
//         }

//         setUsername(data.user.username || "");
//         setUseremail(data.user.useremail || "");
//         setUserphone(data.user.userphone || "");
//       } catch (err) {
//         console.error("Profile fetch error:", err);
//         setError(err.message || "Error loading profile");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [token, navigate]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     setSaving(true);
//     setError("");
//     setMessage("");

//     try {
//       const res = await fetch(
//         "https://localdelivery-app-backend.vercel.app/user/profile",
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             username,
//             useremail,
//             userphone,
//           }),
//         },
//       );

//       const data = await res.json();

//       if (!res.ok || !data.success) {
//         throw new Error(data.message || "Update failed");
//       }

//       setMessage("Profile updated successfully ✅");

//       // update localStorage userData so Navbar shows new info
//       localStorage.setItem("userData", JSON.stringify(data.user));
//     } catch (err) {
//       console.error("Profile update error:", err);
//       setError(err.message || "Error updating profile");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <>
//         <Navbar />
//         <div className="p-6 text-center">Loading profile...</div>
//       </>
//     );
//   }

//   return (
//     <>
//       <Navbar />
//       <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-4">
//         <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
//           <h2 className="text-2xl font-bold mb-4 text-gray-800">
//             Edit Profile 👤
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

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Full Name
//               </label>
//               <input
//                 type="text"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Email Address
//               </label>
//               <input
//                 type="email"
//                 value={useremail}
//                 onChange={(e) => setUseremail(e.target.value)}
//                 className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Phone Number
//               </label>
//               <input
//                 type="tel"
//                 value={userphone}
//                 onChange={(e) => setUserphone(e.target.value)}
//                 className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
//                 placeholder="e.g. +91 98765 43210"
//               />
//               <p className="text-xs text-gray-500 mt-1">
//                 We'll store the last 10 digits (India format).
//               </p>
//             </div>

//             <button
//               type="submit"
//               disabled={saving}
//               className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition"
//             >
//               {saving ? "Saving..." : "Save Changes"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// }




import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function ProfilePage() {
  const [username, setUsername] = useState("");
  const [useremail, setUseremail] = useState("");
  const [userphone, setUserphone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false); // New: Toggle for edit mode

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  useEffect(() => {
  if (!token) {
    navigate("/login");
    return;
  }

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("https://localdelivery-app-backend.vercel.app/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // --- ADD THIS CHECK ---
      if (res.status === 401) {
        localStorage.removeItem("token"); // Clear the bad token
        navigate("/login");               // Send them to login
        return;
      }

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load profile");

      setUsername(data.user.username || "");
      setUseremail(data.user.useremail || "");
      setUserphone(data.user.userphone || "");
    } catch (err) {
      setError(err.message || "Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, [token, navigate]);

  // useEffect(() => {
  //   if (!token) {
  //     navigate("/login");
  //     return;
  //   }

  //   const fetchProfile = async () => {
  //     try {
  //       setLoading(true);
  //       setError("");
  //       const res = await fetch("https://localdelivery-app-backend.vercel.app/user/profile", {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });

  //       const data = await res.json();
  //       if (!res.ok || !data.success) throw new Error(data.message || "Failed to load profile");

  //       setUsername(data.user.username || "");
  //       setUseremail(data.user.useremail || "");
  //       setUserphone(data.user.userphone || "");
  //     } catch (err) {
  //       setError(err.message || "Error loading profile");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchProfile();
  // }, [token, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("https://localdelivery-app-backend.vercel.app/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, useremail, userphone }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Update failed");

      setMessage("Profile updated successfully ✅");
      localStorage.setItem("userData", JSON.stringify(data.user));
      setIsEditing(false); // Lock fields after saving
    } catch (err) {
      setError(err.message || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="mt-4 font-black text-gray-400 uppercase text-xs tracking-widest">Loading Account...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white py-10 px-4">
        <div className="max-w-md mx-auto">
          
          {/* Header & Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-orange-500 rounded-[32px] flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-orange-200 mb-4">
              {username ? username.charAt(0).toUpperCase() : "U"}
            </div>
            <h1 className="text-2xl font-black text-gray-900">{username || "User"}</h1>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{useremail}</p>
          </div>

          <div className="bg-gray-50 rounded-[40px] p-8 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-gray-800 uppercase tracking-tighter">Account Details</h2>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-[10px] font-black bg-white border border-gray-200 px-4 py-2 rounded-xl hover:bg-black hover:text-white transition-all"
                >
                  EDIT
                </button>
              )}
            </div>

            {error && <div className="mb-4 text-[10px] font-black text-red-600 bg-red-50 p-3 rounded-2xl border border-red-100 uppercase">{error}</div>}
            {message && <div className="mb-4 text-[10px] font-black text-green-600 bg-green-50 p-3 rounded-2xl border border-green-100 uppercase">{message}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Full Name</label>
                <input
                  disabled={!isEditing}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full mt-1 p-4 rounded-2xl text-sm font-bold border-none transition-all ${isEditing ? 'bg-white shadow-md focus:ring-2 focus:ring-orange-500/20' : 'bg-transparent text-gray-500'}`}
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Email</label>
                <input
                  disabled={!isEditing}
                  type="email"
                  value={useremail}
                  onChange={(e) => setUseremail(e.target.value)}
                  className={`w-full mt-1 p-4 rounded-2xl text-sm font-bold border-none transition-all ${isEditing ? 'bg-white shadow-md focus:ring-2 focus:ring-orange-500/20' : 'bg-transparent text-gray-500'}`}
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Phone Number</label>
                <input
                  disabled={!isEditing}
                  type="tel"
                  value={userphone}
                  onChange={(e) => setUserphone(e.target.value)}
                  className={`w-full mt-1 p-4 rounded-2xl text-sm font-bold border-none transition-all ${isEditing ? 'bg-white shadow-md focus:ring-2 focus:ring-orange-500/20' : 'bg-transparent text-gray-500'}`}
                />
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-4 rounded-2xl font-black text-xs text-gray-400 uppercase tracking-widest bg-white border border-gray-100"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                  >
                    {saving ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              )}
            </form>

            {!isEditing && (
              <div className="mt-10 space-y-3">
                <button 
                  onClick={() => navigate("/address")}
                  className="w-full flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-100 hover:border-orange-200 group transition-all"
                >
                  <span className="text-xs font-black text-gray-600 uppercase">Manage Addresses</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>

                <button 
                  onClick={handleLogout}
                  className="w-full p-4 text-[10px] font-black text-red-500 uppercase tracking-[0.2em] hover:bg-red-50 rounded-2xl transition-all"
                >
                  Logout Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}