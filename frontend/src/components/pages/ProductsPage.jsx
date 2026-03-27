// src/pages/ProductsPage.jsx
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import CategoriesSidebar from "./CategoriesSidebar";
import { useNavigate } from "react-router-dom";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // --- REINSTATED FILTER/SEARCH STATES ---
  const [selectedCategory, setSelectedCategory] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 24;

  const navigate = useNavigate();

  // Toast Timer
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(
        () => setToast({ visible: false, message: "" }),
        2000,
      );
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // --- FULL FUNCTIONAL FETCH (Searching, Sorting, Pagination) ---
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

        if (!res.ok || !data.success)
          throw new Error(data.message || "Failed to load products");

        if (alive) {
          setProducts(data.products || []);
          setTotal(data.total || 0);
        }
      } catch (err) {
        if (alive) setError(err.message || "Error loading products");
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      alive = false;
    };
  }, [selectedCategory, query, sort, page]); // All dependencies restored

  // --- CART LOGIC ---
  const updateQuantity = (product, delta) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product._id);

// 🚨 STOCK CHECK: If trying to add, check if we have enough stock
    if (delta > 0) {
      const currentQtyInCart = existing ? existing.quantity : 0;
      if (currentQtyInCart >= product.stock) {
        setToast({ visible: true, message: `Only ${product.stock} items available!` });
        return prev; // Don't add more
      }
    }
      if (!existing && delta > 0) {
        setToast({ visible: true, message: `Added ${product.name}` });
        return [
          ...prev,
          {
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: 1,
            stock: product.stock, // Store current stock for checkout reference
          },
        ];
      }

      //
      return prev
        .map((item) => {
          if (item.productId === product._id) {
            const newQty = item.quantity + delta;
            if (newQty === 0)
              setToast({ visible: true, message: `Removed ${product.name}` });
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const getItemQuantity = (productId) => {
    const item = cart.find((it) => it.productId === productId);
    return item ? item.quantity : 0;
  };

  const cartCount = cart.reduce((s, it) => s + it.quantity, 0);
  const cartTotal = cart.reduce((s, it) => s + it.price * it.quantity, 0);
  const pages = Math.max(1, Math.ceil((total || 0) / limit));

  return (
    <>
      <Navbar />

      {/* Toast Notification */}

      {toast.visible && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-bounce-in">
          <div className="bg-gray-900 text-white px-6 py-2 rounded-full shadow-2xl text-xs font-bold border border-gray-700">
            {toast.message}
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-100 py-6 px-4 pb-32">
        <div className="max-w-6xl mx-auto flex gap-4">
          {/* Sidebar (Desktop) */}
          <div className="hidden md:block md:w-64">
            <CategoriesSidebar
              selected={selectedCategory}
              onSelect={(c) => {
                setSelectedCategory(c);
                setPage(1);
              }}
            />
          </div>

          <div className="flex-1">
            {/* --- HEADER WITH SEARCH & SORT --- */}
            <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center mb-6">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                Products
              </h2>

              <div className="flex items-center gap-2">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search snacks, drinks..."
                  className="p-2.5 border border-gray-300 rounded-xl w-full md:w-64 shadow-sm focus:ring-2 focus:ring-green-500 outline-none transition-all"
                />
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="p-2.5 border border-gray-300 rounded-xl bg-white shadow-sm text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                </select>
              </div>
            </div>

            {loading && (
              <div className="text-center py-20 text-gray-400 font-medium animate-pulse">
                Fetching fresh items...
              </div>
            )}
            {error && (
              <div className="text-red-600 p-4 bg-red-50 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            {/* --- PRODUCT GRID --- */}
            {!loading && !error && (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((p) => {
                  const qty = getItemQuantity(p._id);
                  return (
                    <div
                      key={p._id}
                      className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col hover:shadow-lg transition-all group"
                    >
                      {/* Image Section */}
                      <div className="relative overflow-hidden rounded-xl mb-3">
                        <img
                          src={p.imageUrl || "https://via.placeholder.com/150"}
                          alt={p.name}
                          className="w-full h-36 object-contain group-hover:scale-105 transition-transform"
                        />

                        {/* 🔴 OUT OF STOCK OVERLAY */}
                        {p.stock === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-black/70 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                              Sold Out
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3">
                        <h3 className="font-black text-gray-800 text-sm truncate">
                          {p.name}
                        </h3>

                        {/* 🏷️ DYNAMIC STOCK STATUS */}
                        <div className="mt-1 flex items-center gap-2">
                          {p.stock === 0 ? (
                            <span className="text-[9px] font-black text-red-500 uppercase tracking-tight">
                              Out of Stock
                            </span>
                          ) : p.stock <= 5 ? (
                            <span className="text-[9px] font-black text-orange-500 animate-pulse uppercase tracking-tight">
                              🔥 Only {p.stock} left!
                            </span>
                          ) : (
                            <span className="text-[9px] font-black text-green-500 uppercase tracking-tight">
                              In Stock
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
                        {/* Product Name */}

                        {/* --- RATING DISPLAY --- */}
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-500 text-xs">⭐</span>
                          <span className="font-black text-xs text-gray-700">
                            {/* Default to 0.0 if no rating exists */}
                            {p.ratings?.average
                              ? p.ratings.average.toFixed(1)
                              : "0.0"}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold">
                            ({p.ratings?.count || 0})
                          </span>
                        </div>

                        {/* Category Tag */}
                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">
                          {p.category}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="font-black text-gray-900 text-lg">
                          ₹{p.price}
                        </div>

                        {/* ... rest of your Quantity Toggle Logic ... */}

                        {qty > 0 ? (
                          <div className="flex items-center bg-green-700 text-white rounded-lg shadow-inner overflow-hidden">
                            <button
                              onClick={() => updateQuantity(p, -1)}
                              className="px-3 py-1.5 hover:bg-green-800 font-bold"
                            >
                              −
                            </button>
                            <span className="px-1 text-xs font-bold w-6 text-center">
                              {qty}
                            </span>
                            <button
                              onClick={() => updateQuantity(p, 1)}

                              // 🚨 DISABLE IF NO MORE STOCK
                              disabled={qty >= p.stock}
                              className={`px-3 py-1.5 font-bold ${qty >= p.stock ? 'opacity-30 cursor-not-allowed' : 'hover:bg-green-800'}`}
                              // className="px-3 py-1.5 hover:bg-green-800 font-bold"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => updateQuantity(p, 1)}
                            
                      //       className="bg-white border-2 border-green-700 text-green-700 hover:bg-green-700 hover:text-white font-bold text-[10px] px-6 py-2 rounded-lg transition-all active:scale-90"
                      //     >
                      //       ADD
                      //     </button>
                      //   )}
                      // </div>


                      // 🚨 DISABLE IF OUT OF STOCK
      disabled={p.stock <= 0}
      className={`font-bold text-[10px] px-6 py-2 rounded-lg transition-all active:scale-90 border-2 ${
        p.stock <= 0 
          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
          : 'bg-white border-green-700 text-green-700 hover:bg-green-700 hover:text-white'
      }`}
    >
      {p.stock <= 0 ? "SOLD OUT" : "ADD"}
    </button>
  )}
</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* --- PAGINATION RESTORED --- */}
            {!loading && products.length > 0 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 bg-white border rounded-xl disabled:opacity-30 shadow-sm font-medium"
                >
                  Prev
                </button>
                <div className="text-sm font-bold text-gray-500 bg-white px-4 py-2 rounded-xl border">
                  Page {page} / {pages}
                </div>
                <button
                  disabled={page >= pages}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  className="px-4 py-2 bg-white border rounded-xl disabled:opacity-30 shadow-sm font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Categories Row */}
        <div className="md:hidden mt-8 overflow-x-auto no-scrollbar flex gap-2 pb-4">
          <button
            onClick={() => {
              setSelectedCategory("");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold shadow-sm ${selectedCategory === "" ? "bg-green-700 text-white" : "bg-white text-gray-600"}`}
          >
            All
          </button>
          <MobileCategories
            setSelectedCategory={setSelectedCategory}
            setPage={setPage}
            current={selectedCategory}
          />
        </div>
      </div>

      {/* --- FLOATING CART (BLINKIT STYLE) --- */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-[90]">
          <div
            onClick={() => navigate("/cart")}
            className="max-w-lg mx-auto bg-green-800 text-white py-4 px-6 rounded-2xl shadow-[0_15px_50px_-12px_rgba(0,0,0,0.5)] flex justify-between items-center cursor-pointer active:scale-95 transition-all border border-green-700"
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black opacity-70 uppercase tracking-tighter">
                  {cartCount} {cartCount === 1 ? "Item" : "Items"}
                </span>
                <span className="text-lg font-black leading-none">
                  ₹{cartTotal}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 font-black text-sm uppercase">
              View Cart
              <div className="bg-white/10 p-1.5 rounded-lg border border-white/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={4}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-in {
          0% { transform: translate(-50%, -20px); opacity: 0; }
          60% { transform: translate(-50%, 4px); opacity: 1; }
          100% { transform: translate(-50%, 0); }
        }
        .animate-bounce-in { animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}

function MobileCategories({ setSelectedCategory, setPage, current }) {
  const [cats, setCats] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          "https://localdelivery-app-backend.vercel.app/categories",
        );
        const data = await res.json();
        if (data.success) setCats(data.categories || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);
  return (
    <>
      {cats.map((c) => (
        <button
          key={c.category}
          onClick={() => {
            setSelectedCategory(c.category);
            setPage(1);
          }}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold shadow-sm transition-all ${current === c.category ? "bg-green-700 text-white" : "bg-white text-gray-600"}`}
        >
          {c.category}
        </button>
      ))}
    </>
  );
}
