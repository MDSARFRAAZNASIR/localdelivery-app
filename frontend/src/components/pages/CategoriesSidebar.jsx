// src/components/CategoriesSidebar.jsx
import React, { useEffect, useState } from "react";

export default function CategoriesSidebar({ selected, onSelect }) {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchCats = async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch("https://localdelivery-app-backend.vercel.app/categories");
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to load categories");
        if (mounted) setCats(data.categories || []);
      } catch (e) {
        console.error("categories fetch", e);
        if (mounted) setErr(e.message || "Error");
      } finally { if (mounted) setLoading(false); }
    };
    fetchCats();
    return () => { mounted = false; };
  }, []);

  return (
    <aside className="w-full md:w-64 p-3 bg-white rounded-md shadow">
      <h4 className="font-semibold mb-2">Categories</h4>

      {loading ? <div className="text-sm text-gray-500">Loading...</div> : null}
      {err ? <div className="text-xs text-red-600">{err}</div> : null}

      <ul className="space-y-2 mt-2">
        <li>
          <button
            className={`w-full text-left px-2 py-1 rounded ${!selected ? "bg-orange-50 text-orange-600 font-semibold" : "hover:bg-gray-100"}`}
            onClick={() => onSelect("")}
          >
            All
          </button>
        </li>
        
        {cats.map((c) => (
          <li key={c.category}>
            <button
              className={`w-full text-left px-2 py-1 rounded flex justify-between items-center ${selected === c.category ? "bg-orange-50 text-orange-600 font-semibold" : "hover:bg-gray-100"}`}
              onClick={() => onSelect(c.category)}
            >
              <span>{c.category}</span>
              <span className="text-xs text-gray-500">({c.count})</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
