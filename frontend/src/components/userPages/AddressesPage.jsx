import React, { useEffect, useState } from "react";
import Navbar from "../pages/Navbar";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchAddresses = async () => {
    const res = await fetch(
      "https://localdelivery-app-backend.vercel.app/user/addresses",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    setAddresses(data.addresses || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const setDefault = async (id) => {
    await fetch(
      `https://localdelivery-app-backend.vercel.app/user/addresses/${id}/default`,
      { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
    );
    fetchAddresses();
  };

  const deleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    await fetch(
      `https://localdelivery-app-backend.vercel.app/user/addresses/${id}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
    );
    fetchAddresses();
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4">My Addresses</h2>

        {loading ? (
          <div>Loading...</div>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr._id}
              className="border p-4 rounded mb-3 flex justify-between"
            >
              <div>
                <div className="font-semibold">
                  {addr.label}
                  {addr.isDefault && (
                    <span className="ml-2 text-xs text-green-600">
                      (Default)
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
                </div>
              </div>

              <div className="space-x-2">
                {!addr.isDefault && (
                  <button
                    onClick={() => setDefault(addr._id)}
                    className="text-blue-600 text-sm"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => deleteAddress(addr._id)}
                  className="text-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
