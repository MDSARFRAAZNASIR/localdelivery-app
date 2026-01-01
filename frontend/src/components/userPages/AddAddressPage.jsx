import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../pages/Navbar";

export default function AddAddressPage() {
  const [form, setForm] = useState({
    label: "Home",
    name: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const submit = async () => {
    const res = await fetch(
      "https://localdelivery-app-backend.vercel.app/user/addresses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      }
    );

    if (res.ok) navigate("/addresses");
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Add Address</h2>

        {Object.keys(form).map((k) => (
          <input
            key={k}
            placeholder={k}
            className="w-full border p-2 mb-2 rounded"
            value={form[k]}
            onChange={(e) => setForm({ ...form, [k]: e.target.value })}
          />
        ))}

        <button
          onClick={submit}
          className="w-full bg-orange-500 text-white py-2 rounded"
        >
          Save Address
        </button>
      </div>
    </>
  );
}
