import React, { useEffect, useState } from "react";
import Navbar from "../pages/Navbar";
import { useNavigate } from "react-router-dom";
import MapPicker from "./MapPicker";

export default function AddressBook({ mode = "manage", onSelect }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const [form, setForm] = useState({
    label: "Home",
    name: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://localdelivery-app-backend.vercel.app/user/addresses",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (mode === "select" && addresses.length > 0) {
      const def = addresses.find((a) => a.isDefault);
      if (def) {
        setSelectedId(def._id);
        onSelect?.(def);
      }
    }
  }, [addresses, mode, onSelect]);

 

  const saveAddress = async () => {
    if (!form.addressLine.trim()) {
      alert("Address is required");
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
      setShowForm(false);
      setEditingId(null);
      setForm({
        label: "Home",
        name: "",
        phone: "",
        addressLine: "",
        city: "",
        state: "",
        pincode: "",
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const setDefault = async (id) => {
    try {
      const res = await fetch(
        `https://localdelivery-app-backend.vercel.app/user/addresses/${id}/default`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
      const res = await fetch(
        `https://localdelivery-app-backend.vercel.app/user/addresses/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setAddresses(data.addresses);
    } catch (err) {
      alert(err.message);
    }
  };

  const fetchByPincode = async (pin) => {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const data = await res.json();

    if (data[0].Status !== "Success") {
      alert("Invalid pincode");
      return;
    }

    const postOffice = data[0].PostOffice[0];

    setForm((prev) => ({
      ...prev,
      city: postOffice.District,
      state: postOffice.State,
    }));
  };

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">🏠 My Addresses</h1>

        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && addresses.length === 0 && <div>No addresses found.</div>}

        <div className="space-y-4">
          {/* {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`border p-4 rounded ${
                addr.isDefault ? "border-green-500 bg-green-50" : ""
              }`}
              
            > */}
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`border p-4 rounded ${
                addr.isDefault ? "border-green-500 bg-green-50" : ""
              }`}
            >
              {/* add on mode after */}
              {mode === "select" && (
                <label className="flex gap-3 items-start cursor-pointer">
                  <input
                    type="radio"
                    checked={selectedId === addr._id}
                    onChange={() => {
                      setSelectedId(addr._id);
                      onSelect?.(addr);
                    }}
                  />
                  <div>
                    <div className="font-semibold">
                      {addr.label} {addr.isDefault && "(Default)"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {addr.addressLine}, {addr.city}, {addr.state} -{" "}
                      {addr.pincode}
                    </div>
                    {addr.phone && (
                      <div className="text-sm">📞 {addr.phone}</div>
                    )}
                  </div>
                </label>
              )}

              {/* add manage mode */}
              {mode === "manage" && (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">
                        {addr.label} {addr.isDefault && "(Default)"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {addr.addressLine}, {addr.city}, {addr.state} -{" "}
                        {addr.pincode}
                      </div>
                      {addr.phone && (
                        <div className="text-sm">📞 {addr.phone}</div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {/* add new update address */}
                      <button
                        onClick={() => {
                          setEditingId(addr._id);
                          setShowForm(true);
                          setForm({
                            label: addr.label,
                            name: addr.name,
                            phone: addr.phone,
                            addressLine: addr.addressLine,
                            city: addr.city,
                            state: addr.state,
                            pincode: addr.pincode,
                          });
                        }}
                        className="text-xs text-orange-600"
                      >
                        Edit
                      </button>

                      {!addr.isDefault && (
                        <button
                          onClick={() => setDefault(addr._id)}
                          className="text-xs text-blue-600"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => deleteAddress(addr._id)}
                        className="text-xs text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}

           
            </div>
          ))}
        </div>

        {/* Add Address */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-6 bg-orange-500 text-white px-4 py-2 rounded"
        >
          + Add New Address
        </button>
        <button
          onClick={() => setShowMap(!showMap)}
          className="text-sm text-blue-600 underline"
        >
          📍 Pick from Map
        </button>

        {/* add for google map */}
        {showMap && (
          <MapPicker
            onSelect={async ({ lat, lng }) => {
              try {
                const res = await fetch(
                  `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}`
                );
                const data = await res.json();

                const comp = data.results[0].address_components;

                const get = (type) =>
                  comp.find((c) => c.types.includes(type))?.long_name || "";

                setForm({
                  ...form,
                  addressLine: data.results[0].formatted_address,
                  city: get("locality"),
                  state: get("administrative_area_level_1"),
                  pincode: get("postal_code"),
                });

                setShowMap(false);
              } catch (err) {
                alert("Failed to fetch address");
              }
            }}
          />
        )}

        {showForm && (
          <div className="mt-4 border p-4 rounded bg-gray-50 space-y-3">
            <select
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="w-full border p-2 rounded"
            >
              <option>Home</option>
              <option>Office</option>
              <option>Other</option>
            </select>

            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border p-2 rounded"
            />

            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border p-2 rounded"
            />

            <textarea
              placeholder="Address line"
              value={form.addressLine}
              onChange={(e) =>
                setForm({ ...form, addressLine: e.target.value })
              }
              className="w-full border p-2 rounded"
            />

            <div className="grid grid-cols-3 gap-2">
              <input
                placeholder="Pincode"
                // value={form.pincode}
                value={form.pincode}
                onBlur={() => fetchByPincode(form.pincode)}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                placeholder="City"
                value={form.city}
                readOnly
                onKeyDown={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
                // onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                placeholder="State"
                value={form.state}
                readOnly
                onKeyDown={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
                // onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="border p-2 rounded"
              />

              {/* <input
  value={form.pincode}
  onBlur={() => fetchByPincode(form.pincode)}
/> */}
            </div>
            {/* <button
              onClick={addAddress}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Save Address
            </button> */}

            <button
              onClick={saveAddress}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {editingId ? "Update Address" : "Save Address"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
