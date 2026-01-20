


import { useEffect, useState } from "react";
import Navbar from "../pages/Navbar";


export default function AdminServiceAreas() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    pincode: "",
    areaName: "",
    deliveryFee: 0,
    isActive: true,
  });

  const token = localStorage.getItem("token");

  const fetchAreas = async () => {
    try {
      const res = await fetch(
        "https://localdelivery-app-backend.vercel.app/admin/service-areas",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) setAreas(data.areas || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const saveArea = async () => {
    if (!form.pincode) return alert("Pincode required");

    const res = await fetch(
      "https://localdelivery-app-backend.vercel.app/admin/service-areas",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      }
    );

    const data = await res.json();
    if (res.ok) {
      fetchAreas();
      setForm({ pincode: "", areaName: "", deliveryFee: 0, isActive: true });
    } else {
      alert(data.message);
    }
  };

  const deleteArea = async (id) => {
    if (!window.confirm("Delete this pincode?")) return;

    await fetch(
      `https://localdelivery-app-backend.vercel.app/admin/service-areas/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    fetchAreas();
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">📍 Service Areas</h1>

        {/* ADD / UPDATE */}
        <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-4 gap-3">
          <input
            placeholder="Pincode"
            value={form.pincode}
            onChange={(e) => setForm({ ...form, pincode: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            placeholder="Area Name"
            value={form.areaName}
            onChange={(e) => setForm({ ...form, areaName: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Delivery Fee"
            value={form.deliveryFee}
            onChange={(e) =>
              setForm({ ...form, deliveryFee: Number(e.target.value) })
            }
            className="border p-2 rounded"
          />
          <button
            onClick={saveArea}
            className="bg-green-600 text-white rounded px-4"
          >
            Save
          </button>
        </div>

        {/* LIST */}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Pincode</th>
                <th className="p-2 border">Area</th>
                <th className="p-2 border">Fee</th>
                <th className="p-2 border">Active</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {areas.map((a) => (
                <tr key={a._id} className="text-center">
                  <td className="border p-2">{a.pincode}</td>
                  <td className="border p-2">{a.areaName}</td>
                  <td className="border p-2">₹{a.deliveryFee}</td>
                  <td className="border p-2">
                    {a.isActive ? "✅" : "❌"}
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() => deleteArea(a._id)}
                      className="text-red-600 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
