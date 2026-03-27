// import { useEffect, useCallback, useState } from "react";
// import Navbar from "../pages/Navbar";

// export default function AdminServiceAreas() {
//   const [areas, setAreas] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [form, setForm] = useState({
//     pincode: "",
//     areaName: "",
//     deliveryFee: 0,
//     isActive: true,
//   });

//   const token = localStorage.getItem("token");

//   const fetchAreas = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(
//         "https://localdelivery-app-backend.vercel.app/admin/service-areas",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//       const data = await res.json();
//       if (res.ok) setAreas(data.areas || []);
//     } finally {
//       setLoading(false);
//     }
//   }, [token]);

//   useEffect(() => {
//     fetchAreas();
//   }, [fetchAreas]);

//   const saveArea = async () => {
//     if (!form.pincode) return alert("Pincode required");

//     const res = await fetch(
//       "https://localdelivery-app-backend.vercel.app/admin/service-areas",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(form),
//       },
//     );

//     const data = await res.json();
//     if (res.ok) {
//       fetchAreas();
//       setForm({ pincode: "", areaName: "", deliveryFee: 0, isActive: true });
//     } else {
//       alert(data.message);
//     }
//   };

//   const deleteArea = async (id) => {
//     if (!window.confirm("Delete this pincode?")) return;

//     await fetch(
//       `https://localdelivery-app-backend.vercel.app/admin/service-areas/${id}`,
//       {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` },
//       },
//     );
//     fetchAreas();
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="max-w-4xl mx-auto p-4 sm:p-6">
//         <h1 className="text-2xl font-bold mb-4">📍 Service Areas</h1>

//         {/* ADD / UPDATE */}
//         <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
//           <input
//             placeholder="Pincode"
//             value={form.pincode}
//             onChange={(e) => setForm({ ...form, pincode: e.target.value })}
//             className="border p-2 rounded"
//           />
//           <input
//             placeholder="Area Name"
//             value={form.areaName}
//             onChange={(e) => setForm({ ...form, areaName: e.target.value })}
//             className="border p-2 rounded"
//           />
//           <input
//             type="number"
//             placeholder="Delivery Fee"
//             value={form.deliveryFee}
//             onChange={(e) =>
//               setForm({ ...form, deliveryFee: Number(e.target.value) })
//             }
//             className="border p-2 rounded"
//           />
//           <button
//             onClick={saveArea}
//             className="bg-green-600 text-white rounded px-4 py-2 w-full sm:w-auto"
//           >
//             Save
//           </button>
//         </div>

//         {/* LIST */}
//         {loading ? (
//           <div>Loading...</div>
//         ) : (
//           // <table className="w-full border text-sm">
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[640px] border text-sm">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="p-2 border">Pincode</th>
//                   <th className="p-2 border">Area</th>
//                   <th className="p-2 border">Fee</th>
//                   <th className="p-2 border">Active</th>
//                   <th className="p-2 border">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {areas.map((a) => (
//                   <tr key={a._id} className="text-center hover:bg-gray-50">
//                     <td className="border p-2">{a.pincode}</td>
//                     <td className="border p-2">{a.areaName}</td>
//                     <td className="border p-2">₹{a.deliveryFee}</td>
//                     <td className="border p-2">{a.isActive ? "✅" : "❌"}</td>
//                     <td className="border p-2">
//                       <button
//                         onClick={() => deleteArea(a._id)}
//                         className="text-red-600 text-sm px-2 py-1 rounded hover:bg-red-50"
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }



import { useEffect, useCallback, useState } from "react";
import Navbar from "../pages/Navbar";

export default function AdminServiceAreas() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 New: Search
  const [editingId, setEditingId] = useState(null); // 📝 New: Track if editing
  const [form, setForm] = useState({
    pincode: "",
    areaName: "",
    deliveryFee: 0,
    isActive: true,
  });

  const token = localStorage.getItem("token");

  const fetchAreas = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://localdelivery-app-backend.vercel.app/admin/service-areas",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (res.ok) setAreas(data.areas || []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  // --- ENHANCED: SAVE OR UPDATE ---
  const saveArea = async () => {
    if (!form.pincode || !form.areaName) return alert("Pincode and Area Name required");

    // If editingId exists, use PUT/PATCH (depending on your backend), otherwise POST
    const method = editingId ? "PUT" : "POST"; 
    const url = editingId 
      ? `https://localdelivery-app-backend.vercel.app/admin/service-areas/${editingId}`
      : "https://localdelivery-app-backend.vercel.app/admin/service-areas";

    const res = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      fetchAreas();
      cancelEdit(); // Reset form
    } else {
      alert(data.message);
    }
  };

  // --- NEW: TOGGLE ACTIVE STATUS QUICKLY ---
  const toggleStatus = async (area) => {
    const res = await fetch(`https://localdelivery-app-backend.vercel.app/admin/service-areas/${area._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...area, isActive: !area.isActive }),
    });
    if (res.ok) fetchAreas();
  };

  const deleteArea = async (id) => {
    if (!window.confirm("Delete this pincode?")) return;
    await fetch(`https://localdelivery-app-backend.vercel.app/admin/service-areas/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchAreas();
  };

  // --- NEW: EDIT HANDLERS ---
  const startEdit = (area) => {
    setEditingId(area._id);
    setForm({
      pincode: area.pincode,
      areaName: area.areaName,
      deliveryFee: area.deliveryFee,
      isActive: area.isActive
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ pincode: "", areaName: "", deliveryFee: 0, isActive: true });
  };

  // --- NEW: FILTER LOGIC ---
  const filteredAreas = areas.filter(a => 
    a.pincode.includes(searchTerm) || 
    a.areaName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">📍 Service Management</h1>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
            {areas.length} Active Codes
          </span>
        </div>

        {/* ADD / UPDATE FORM */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
            {editingId ? "Edit Service Area" : "Add New Service Area"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 ml-1">PINCODE</label>
              <input
                placeholder="Ex: 800001"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                className="w-full border-gray-200 border p-2.5 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 ml-1">AREA NAME</label>
              <input
                placeholder="Ex: Patna City"
                value={form.areaName}
                onChange={(e) => setForm({ ...form, areaName: e.target.value })}
                className="w-full border-gray-200 border p-2.5 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 ml-1">DELIVERY FEE (₹)</label>
              <input
                type="number"
                value={form.deliveryFee}
                onChange={(e) => setForm({ ...form, deliveryFee: Number(e.target.value) })}
                className="w-full border-gray-200 border p-2.5 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-4 py-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.isActive} 
                  onChange={(e) => setForm({...form, isActive: e.target.checked})}
                  className="w-4 h-4 accent-green-600"
                />
                <span className="text-sm font-bold text-gray-600">Active</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveArea}
                className="flex-1 bg-green-600 hover:bg-black text-white font-bold rounded-xl px-4 py-2.5 transition-all shadow-md shadow-green-100"
              >
                {editingId ? "Update" : "Save"}
              </button>
              {editingId && (
                <button onClick={cancelEdit} className="bg-gray-100 text-gray-500 px-4 py-2.5 rounded-xl font-bold">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="mb-4">
          <input 
            type="text"
            placeholder="Search pincode or area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 border-none shadow-sm rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* LIST TABLE */}
        {loading ? (
          <div className="py-20 text-center animate-pulse text-gray-400 font-bold">Loading areas...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm text-left">
                <thead className="bg-gray-50 text-gray-400 font-black uppercase text-[10px] tracking-widest border-b">
                  <tr>
                    <th className="p-4">Pincode</th>
                    <th className="p-4">Area</th>
                    <th className="p-4">Fee</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredAreas.map((a) => (
                    <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-gray-700">{a.pincode}</td>
                      <td className="p-4 font-medium text-gray-600">{a.areaName}</td>
                      <td className="p-4 font-black text-gray-800">₹{a.deliveryFee}</td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => toggleStatus(a)}
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${
                            a.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                          }`}
                        >
                          {a.isActive ? "● Active" : "○ Inactive"}
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => startEdit(a)}
                          className="text-blue-500 font-bold hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteArea(a._id)}
                          className="text-red-400 font-bold hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredAreas.length === 0 && (
                <div className="p-10 text-center text-gray-400 font-bold">No matching areas found.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}