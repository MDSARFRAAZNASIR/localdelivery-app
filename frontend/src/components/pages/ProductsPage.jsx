// // src/pages/ProductsPage.jsx
// import React, { useEffect, useState } from "react";
// import Navbar from "./Navbar"
// import CategoriesSidebar from "./CategoriesSidebar";
// import { useNavigate } from "react-router-dom";

// export default function ProductsPage() {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [cart, setCart] = useState(() => {
//     try { const saved = localStorage.getItem("cart"); return saved ? JSON.parse(saved) : []; } catch { return []; }
//   });

//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [query, setQuery] = useState("");
//   const [sort, setSort] = useState("newest");
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);
//   const limit = 24;

//   const navigate = useNavigate();

//   useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)); }, [cart]);

//   // build fetch with query params
//   useEffect(() => {
//     let alive = true;
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         setError("");
//         const params = new URLSearchParams();
//         if (selectedCategory) params.append("category", selectedCategory);
//         if (query) params.append("q", query);
//         if (sort) params.append("sort", sort);
//         params.append("page", page);
//         params.append("limit", limit);

//         const url = `https://localdelivery-app-backend.vercel.app/products?${params.toString()}`;
//         const res = await fetch(url);
//         const data = await res.json();
//         if (!res.ok || !data.success) throw new Error(data.message || "Failed to load products");
//         if (!alive) return;
//         setProducts(data.products || []);
//         setTotal(data.total || 0);
//       } catch (err) {
//         console.error("Products fetch error:", err);
//         if (alive) setError(err.message || "Error loading products");
//       } finally { if (alive) setLoading(false); }
//     };

//     fetchProducts();
//     return () => { alive = false; };
//   }, [selectedCategory, query, sort, page]);

//   const addToCart = (product) => {
//     setCart((prev) => {
//       const existing = prev.find((item) => item.productId === product._id);
//       if (existing) {
//         return prev.map((item) =>
//           item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item
//         );
//       }
//       return [
//         ...prev,
//         { productId: product._id, name: product.name, price: product.price, quantity: 1 }
//       ];
//     });
//   };

//   const goToCart = () => navigate("/cart");
//   const cartCount = cart.reduce((s, it) => s + it.quantity, 0);
//   const pages = Math.max(1, Math.ceil((total || 0) / limit));

//   return (
//     <>
//       <Navbar />
//       <div className="min-h-screen bg-gray-100 py-6 px-4">
//         <div className="max-w-6xl mx-auto flex gap-4">
//           {/* sidebar */}
//           <div className="hidden md:block md:w-64">
//             <CategoriesSidebar
//               selected={selectedCategory}
//               onSelect={(c) => { setSelectedCategory(c); setPage(1); }}
//             />
//           </div>

//           {/* main content */}
//           <div className="flex-1">
//             {/* <div className="flex justify-between items-center mb-4"> */}
//             <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center mb-4">

//               <h2 className="text-2xl font-bold text-gray-800">Products 🛒</h2>
//               <div className="flex items-center gap-3">
//                 <input
//                   type="search"
//                   value={query}
//                   onChange={(e) => { setQuery(e.target.value); setPage(1); }}
//                   placeholder="Search products..."
//                   className="p-2 border rounded w-full md:w-60"
//                 />
//                 <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="p-2 border rounded w-full md:w-auto">
//                   <option value="newest">Newest</option>
//                   <option value="price_asc">Price: Low → High</option>
//                   <option value="price_desc">Price: High → Low</option>
//                 </select>
//                 <button onClick={goToCart} className=" w-full md:w-auto  bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded fixstk">
//                   Cart ({cartCount})
//                 </button>
//               </div>
//             </div>

//             {/* {loading ? <div>Loading products...</div> : null} */}
//             {loading && (
//   <div className="text-center py-10 text-gray-500">
//     Loading products…
//   </div>
// )}

//             {error ? <div className="text-red-600 p-2 bg-red-50 rounded">{error}</div> : null}

//             {!loading && !error && products.length === 0 ? (
//               <div className="bg-white p-4 rounded shadow">No products found</div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                 {products.map(p => (
//                   <div key={p._id} className="bg-white rounded-lg shadow p-4 flex flex-col">
//                     {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-36 object-cover rounded mb-3" /> : <div className="w-full h-36 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400">No image</div>}
//                     <div className="flex-1">
//                       <div className="font-semibold">{p.name}</div>
//                       <div className="text-xs text-gray-500">{p.category}</div>
//                       <div className="text-sm text-gray-700 mt-2 line-clamp-2">{p.description}</div>
//                     </div>
//                     <div className="flex items-center justify-between mt-3">
//                       <div className="font-bold text-orange-600">₹{p.price}</div>
//                       <button onClick={() => addToCart(p)} className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1.5 rounded">Add</button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* pagination */}
//             <div className="mt-6 flex items-center justify-center gap-2">
//               <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 border rounded">Prev</button>
//               <div className="text-sm">Page {page} / {pages}</div>
//               <button disabled={page>=pages} onClick={()=>setPage(p=>Math.min(pages,p+1))} className="px-3 py-1 border rounded">Next</button>
//             </div>
//           </div>
//         </div>

//         {/* mobile categories row */}
//         <div className="md:hidden mt-4">
//           <div className="flex gap-2 overflow-x-auto pb-2">
//             <button onClick={()=>{setSelectedCategory(""); setPage(1);}} className={`px-3 py-2 rounded ${selectedCategory==="" ? "bg-orange-50 text-orange-600" : "bg-white"}`}>All</button>
//             {/* small fetch of categories for mobile (simple) */}
//             <MobileCategories setSelectedCategory={setSelectedCategory} setPage={setPage} />
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// // lightweight mobile categories component fetches categories quickly
// function MobileCategories({ setSelectedCategory, setPage }) {
//   const [cats, setCats] = useState([]);
//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const res = await fetch("https://localdelivery-app-backend.vercel.app/categories");
//         const data = await res.json();
//         if (!res.ok || !data.success) throw new Error(data.message || "err");
//         if (mounted) setCats(data.categories || []);
//       } catch (e) { console.error(e); }
//     })();
//     return () => mounted = false;
//   }, []);
//   return (
//     <>
//       {cats.map(c => (
//         <button key={c.category} onClick={()=>{ setSelectedCategory(c.category); setPage(1); }} className="px-3 py-2 rounded bg-white">
//           {c.category}
//         </button>
//       ))}
//     </>
//   );
// }

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

      if (!existing && delta > 0) {
        setToast({ visible: true, message: `Added ${product.name}` });
        return [
          ...prev,
          {
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: 1,
          },
        ];
      }

  //     return prev
  //       .map((item) => {
  //         if (item.productId === product._id) {
  //           const newQty =  delta - item.quantity + delta;
  //           if (newQty === 0)
  //             setToast({ visible: true, message: `Removed ${product.name}` });
  //           return newQty > 0 ? { ...item, quantity: newQty } : null;
  //         }
  //         return item;
  //       })
  //       .filter(Boolean);
  //   });
  // };
      return prev.map((item) => {
        if (item.productId === product._id) {
          const newQty = item.quantity + delta;
          if (newQty === 0) setToast({ visible: true, message: `Removed ${product.name}` });
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
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
                      <div className="relative overflow-hidden rounded-xl mb-3">
                        <img
                          src={p.imageUrl || "https://via.placeholder.com/150"}
                          alt={p.name}
                          className="w-full h-36 object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="font-bold text-sm text-gray-800 line-clamp-2 leading-tight h-10">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">
                          {p.category}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="font-black text-gray-900 text-lg">
                          ₹{p.price}
                        </div>

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
                              className="px-3 py-1.5 hover:bg-green-800 font-bold"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => updateQuantity(p, 1)}
                            className="bg-white border-2 border-green-700 text-green-700 hover:bg-green-700 hover:text-white font-bold text-[10px] px-6 py-2 rounded-lg transition-all active:scale-90"
                          >
                            ADD
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
