


// src/pages/ProductsPage.jsx
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar"
import CategoriesSidebar from "./CategoriesSidebar";
import { useNavigate } from "react-router-dom";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState(() => {
    try { const saved = localStorage.getItem("cart"); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const [selectedCategory, setSelectedCategory] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 24;

  const navigate = useNavigate();

  useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)); }, [cart]);

  // build fetch with query params
  useEffect(() => {
    let alive = true;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const params = new URLSearchParams();
        if (selectedCategory) params.append("category", selectedCategory);
        if (query) params.append("q", query);
        if (sort) params.append("sort", sort);
        params.append("page", page);
        params.append("limit", limit);
        

        const url = `https://localdelivery-app-backend.vercel.app/products?${params.toString()}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to load products");
        if (!alive) return;
        setProducts(data.products || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error("Products fetch error:", err);
        if (alive) setError(err.message || "Error loading products");
      } finally { if (alive) setLoading(false); }
    };

    fetchProducts();
    return () => { alive = false; };
  }, [selectedCategory, query, sort, page]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        { productId: product._id, name: product.name, price: product.price, quantity: 1 }
      ];
    });
  };

  const goToCart = () => navigate("/cart");
  const cartCount = cart.reduce((s, it) => s + it.quantity, 0);
  const pages = Math.max(1, Math.ceil((total || 0) / limit));

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-6 px-4">
        <div className="max-w-6xl mx-auto flex gap-4">
          {/* sidebar */}
          <div className="hidden md:block md:w-64">
            <CategoriesSidebar
              selected={selectedCategory}
              onSelect={(c) => { setSelectedCategory(c); setPage(1); }}
            />
          </div>

          {/* main content */}
          <div className="flex-1">
            {/* <div className="flex justify-between items-center mb-4"> */}
            <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center mb-4">

              <h2 className="text-2xl font-bold text-gray-800">Products 🛒</h2>
              <div className="flex items-center gap-3">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  placeholder="Search products..."
                  className="p-2 border rounded w-full md:w-60"
                />
                <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="p-2 border rounded w-full md:w-auto">
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                </select>
                <button onClick={goToCart} className=" w-full md:w-auto  bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded">
                  Cart ({cartCount})
                </button>
              </div>
            </div>

            {/* {loading ? <div>Loading products...</div> : null} */}
            {loading && (
  <div className="text-center py-10 text-gray-500">
    Loading products…
  </div>
)}

            {error ? <div className="text-red-600 p-2 bg-red-50 rounded">{error}</div> : null}

            {!loading && !error && products.length === 0 ? (
              <div className="bg-white p-4 rounded shadow">No products found</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(p => (
                  <div key={p._id} className="bg-white rounded-lg shadow p-4 flex flex-col">
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-36 object-cover rounded mb-3" /> : <div className="w-full h-36 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400">No image</div>}
                    <div className="flex-1">
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.category}</div>
                      <div className="text-sm text-gray-700 mt-2 line-clamp-2">{p.description}</div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="font-bold text-orange-600">₹{p.price}</div>
                      <button onClick={() => addToCart(p)} className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1.5 rounded">Add</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* pagination */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 border rounded">Prev</button>
              <div className="text-sm">Page {page} / {pages}</div>
              <button disabled={page>=pages} onClick={()=>setPage(p=>Math.min(pages,p+1))} className="px-3 py-1 border rounded">Next</button>
            </div>
          </div>
        </div>

        {/* mobile categories row */}
        <div className="md:hidden mt-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button onClick={()=>{setSelectedCategory(""); setPage(1);}} className={`px-3 py-2 rounded ${selectedCategory==="" ? "bg-orange-50 text-orange-600" : "bg-white"}`}>All</button>
            {/* small fetch of categories for mobile (simple) */}
            <MobileCategories setSelectedCategory={setSelectedCategory} setPage={setPage} />
          </div>
        </div>
      </div>
    </>
  );
}

// lightweight mobile categories component fetches categories quickly
function MobileCategories({ setSelectedCategory, setPage }) {
  const [cats, setCats] = useState([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("https://localdelivery-app-backend.vercel.app/categories");
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "err");
        if (mounted) setCats(data.categories || []);
      } catch (e) { console.error(e); }
    })();
    return () => mounted = false;
  }, []);
  return (
    <>
      {cats.map(c => (
        <button key={c.category} onClick={()=>{ setSelectedCategory(c.category); setPage(1); }} className="px-3 py-2 rounded bg-white">
          {c.category}
        </button>
      ))}
    </>
  );
}
