// // src/pages/AdminProductsPage.jsx
// import React, { useEffect, useState } from "react";
// // import Navbar from "../components/Navbar";
// import Navbar from "../pages/Navbar";
// import { useNavigate } from "react-router-dom";

// export default function AdminProductsPage() {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [form, setForm] = useState({
//     _id: null,

//     name: "",

//     description: "",
//     price: "",
//     imageUrl: "",
//     category: "",

//     stock: "",
//     isActive: true,
//   });

//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     fetchProducts();
//     // eslint-disable-next-line
//   }, [token]);

//   const fetchProducts = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       const res = await fetch(
//         "https://localdelivery-app-backend.vercel.app/admin/products",
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//       const data = await res.json();
//       if (!res.ok || !data.success) throw new Error(data.message || "Failed");
//       setProducts(data.products || []);
//     } catch (err) {
//       console.error("fetchProducts", err);
//       setError(err.message || "Error loading products");
//     } finally {
//       setLoading(false);
//     }
//   };
//   const startEdit = (p) => {
//     setForm({
//       _id: p._id,
//       name: p.name || "",
//       description: p.description || "",
//       price: p.price || "",
//       imageUrl: p.imageUrl || "",
//       category: p.category || "",
//       stock: p.stock || 0,
//       isActive: !!p.isActive,
//     });
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const resetForm = () =>
//     setForm({
//       _id: null,
//       name: "",
//       description: "",
//       price: "",
//       imageUrl: "",
//       category: "",
//       stock: "",
//       isActive: true,
//     });

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this product?")) return;

//     try {
//       setLoading(true);
//       const res = await fetch(
//         `https://localdelivery-app-backend.vercel.app/admin/products/${id}`,
//         {
//           method: "DELETE",
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );

//       const data = await res.json();
//       if (!res.ok || !data.success) {
//         throw new Error(data.message || "Delete failed");
//       }

//       // remove from UI
//       setProducts((prev) => prev.filter((p) => p._id !== id));
//     } catch (err) {
//       alert(err.message || "Delete error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.name || form.price === "")
//       return alert("Name and price required");
//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     try {
//       setSaving(true);
//       setError("");
//       const payload = {
//         name: form.name,
//         description: form.description,
//         price: Number(form.price),
//         imageUrl: form.imageUrl,
//         category: form.category,
//         stock: Number(form.stock || 0),
//         isActive: !!form.isActive,
//       };

//       let res, data;

//       if (form._id) {
//         res = await fetch(
//           `https://localdelivery-app-backend.vercel.app/admin/products/${form._id}`,
//           {
//             method: "PUT",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//             body: JSON.stringify(payload),
//           },
//         );
//         data = await res.json();
//         if (!res.ok || !data.success)
//           throw new Error(data.message || "Update failed");
//         // update UI
//         setProducts((prev) =>
//           prev.map((p) => (p._id === data.product._id ? data.product : p)),
//         );
//         alert("Product updated");
//       } else {
//         res = await fetch(
//           "https://localdelivery-app-backend.vercel.app/admin/products",
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//             body: JSON.stringify(payload),
//           },
//         );
//         data = await res.json();
//         if (!res.ok || !data.success)
//           throw new Error(data.message || "Create failed");
//         setProducts((prev) => [data.product, ...prev]);
//         alert("Product created");
//       }

//       resetForm();
//     } catch (err) {
//       console.error("save product", err);
//       setError(err.message || "Save failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="min-h-screen bg-gray-100 py-6 px-4">
//         <div className="max-w-6xl mx-auto">
//           <h2 className="text-2xl font-bold mb-4">Admin – Products</h2>

//           {/* Form */}
//           <div className="bg-white p-4 rounded shadow mb-6">
//             <h3 className="font-semibold mb-2">
//               {form._id ? "Edit Product" : "Add Product"}
//             </h3>
//             {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
//             <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
//               <input
//                 placeholder="Name"
//                 value={form.name}
//                 onChange={(e) => setForm({ ...form, name: e.target.value })}
//                 className="p-2 border rounded"
//               />
//               <input
//                 placeholder="Category"
//                 value={form.category}
//                 onChange={(e) => setForm({ ...form, category: e.target.value })}
//                 className="p-2 border rounded"
//               />
//               <input
//                 placeholder="Image URL"
//                 value={form.imageUrl}
//                 onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
//                 className="p-2 border rounded"
//               />
//               <textarea
//                 placeholder="Description"
//                 value={form.description}
//                 onChange={(e) =>
//                   setForm({ ...form, description: e.target.value })
//                 }
//                 className="p-2 border rounded"
//               />
//               <div className="grid grid-cols-2 gap-2">
//                 <input
//                   placeholder="Price"
//                   type="number"
//                   value={form.price}
//                   onChange={(e) => setForm({ ...form, price: e.target.value })}
//                   className="p-2 border rounded"
//                 />
//                 <input
//                   placeholder="Stock"
//                   type="number"
//                   value={form.stock}
//                   onChange={(e) => setForm({ ...form, stock: e.target.value })}
//                   className="p-2 border rounded"
//                 />
//               </div>
//               <label className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   checked={form.isActive}
//                   onChange={(e) =>
//                     setForm({ ...form, isActive: e.target.checked })
//                   }
//                 />
//                 Active
//               </label>
//               <div className="flex gap-2">
//                 <button
//                   disabled={saving}
//                   className="bg-green-600 text-white px-4 py-2 rounded"
//                 >
//                   {saving ? "Saving..." : form._id ? "Update" : "Create"}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={resetForm}
//                   className="bg-gray-200 px-4 py-2 rounded"
//                 >
//                   Reset
//                 </button>
//               </div>
//             </form>
//           </div>

//           {/* Products list */}
//           <div className="bg-white p-4 rounded shadow">
//             <h3 className="font-semibold mb-3">Products ({products.length})</h3>

//             {loading ? (
//               <div>Loading...</div>
//             ) : products.length === 0 ? (
//               <div>No products yet</div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
//                 {products.map((p) => (
//                   <div key={p._id} className="border rounded p-3 flex flex-col">
//                     <div className="flex-1">
//                       <div className="font-semibold">{p.name}</div>
//                       <div className="text-xs text-gray-500">{p.category}</div>
//                       <div className="text-sm text-gray-700 mt-2">
//                         {p.description}
//                       </div>
//                     </div>

//                     <div className="mt-3 flex items-center justify-between">
//                       <div>
//                         <div className="text-sm">₹{p.price}</div>
//                         <div className="text-xs text-gray-500">
//                           Stock: {p.stock}
//                         </div>
//                       </div>
//                       <div className="flex flex-col gap-2">
//                         <button
//                           onClick={() => startEdit(p)}
//                           className="text-sm bg-yellow-400 px-3 py-1 rounded"
//                         >
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => handleDelete(p._id)}
//                           className="text-sm bg-red-500 text-white px-3 py-1 rounded"
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }




import React, { useCallback, useEffect, useState } from "react";
import Navbar from "../pages/Navbar";
import { useNavigate } from "react-router-dom";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    _id: null,
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    category: "",
    stock: "",
    isActive: true,
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (!token) {
  //     navigate("/login");
  //     return;
  //   }
  //   fetchProducts();
  // }, [token, navigate, fetchProducts,]);

  // Search Logic
  useEffect(() => {
    const results = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  const fetchProducts =useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("https://localdelivery-app-backend.vercel.app/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed");
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message || "Error loading products");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 3. Add fetchProducts to the useEffect dependency array
useEffect(() => {
  if (!token) {
    navigate("/login");
    return;
  }
  fetchProducts();
}, [token, navigate, fetchProducts]); // Now it's safe to include

  const startEdit = (p) => {
    setForm({
      _id: p._id,
      name: p.name || "",
      description: p.description || "",
      price: p.price || "",
      imageUrl: p.imageUrl || "",
      category: p.category || "",
      stock: p.stock || 0,
      isActive: !!p.isActive,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => setForm({ _id: null, name: "", description: "", price: "", imageUrl: "", category: "", stock: "", isActive: true });

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      const res = await fetch(`https://localdelivery-app-backend.vercel.app/admin/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) { alert(err.message); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || form.price === "") return alert("Name and price required");
    try {
      setSaving(true);
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock || 0) };
      const url = form._id 
        ? `https://localdelivery-app-backend.vercel.app/admin/products/${form._id}` 
        : "https://localdelivery-app-backend.vercel.app/admin/products";
      
      const res = await fetch(url, {
        method: form._id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (form._id) {
        setProducts(prev => prev.map(p => p._id === data.product._id ? data.product : p));
      } else {
        setProducts(prev => [data.product, ...prev]);
      }
      resetForm();
      alert("Success!");
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
{error && <p className="text-red-500">{error}</p>}

          
          {/* Header & Stats */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Inventory Management</h1>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Total Items: {products.length}</p>
            </div>
            <div className="flex gap-2">
              <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase">Out of Stock</p>
                <p className="text-lg font-black text-red-500">{products.filter(p => p.stock <= 0).length}</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase">Active</p>
                <p className="text-lg font-black text-green-500">{products.filter(p => p.isActive).length}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT: FORM */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-gray-200/50 sticky top-24 border border-gray-100">
                <h3 className="font-black text-xl mb-6 text-gray-800 flex items-center gap-2">
                  {form._id ? "📝 Edit Item" : "✨ New Product"}
                </h3>
                
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-2xl mb-4 bg-gray-50 border border-gray-100" />
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20" />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20" />
                    <input placeholder="Price (₹)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20" />
                  </div>

                  <input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20" />
                  
                  <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold h-24 focus:ring-2 focus:ring-blue-500/20" />
                  
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                       <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-20 bg-gray-50 border-none rounded-xl p-2 text-sm font-bold" />
                       <span className="text-[10px] font-black text-gray-400">STOCK</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded text-blue-600" />
                      <span className="text-[10px] font-black text-gray-400">ACTIVE</span>
                    </label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button type="submit" disabled={saving} className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all">
                      {saving ? "..." : form._id ? "Update" : "Create"}
                    </button>
                    {form._id && (
                      <button type="button" onClick={resetForm} className="bg-gray-100 text-gray-400 px-6 rounded-2xl font-black text-xs">✕</button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* RIGHT: LIST */}
            <div className="lg:col-span-2">
              <div className="mb-6 relative">
                <input 
                  type="text" 
                  placeholder="Search inventory by name or category..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-100 rounded-[24px] p-5 pl-12 shadow-sm font-bold text-sm focus:ring-2 focus:ring-blue-500/10"
                />
                <span className="absolute left-5 top-5 opacity-30">🔍</span>
              </div>

              {loading ? (
                <div className="text-center py-20 font-black text-gray-200 animate-pulse text-2xl uppercase tracking-tighter">Syncing Database...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProducts.map((p) => (
                    <div key={p._id} className="bg-white border border-gray-100 rounded-[32px] p-5 hover:shadow-xl hover:shadow-gray-200/40 transition-all group">
                      <div className="flex gap-4">
                        <img src={p.imageUrl} alt="" className="w-20 h-20 object-cover rounded-2xl bg-gray-50 border border-gray-50" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-lg uppercase tracking-widest">{p.category}</span>
                            <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${p.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                              {p.isActive ? 'Live' : 'Hidden'}
                            </span>
                          </div>
                          <h4 className="font-black text-gray-800 mt-1 line-clamp-1">{p.name}</h4>
                          <p className="text-lg font-black text-gray-900">₹{p.price}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Current Stock</span>
                            <span className={`text-xs font-black ${p.stock <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-800'}`}>{p.stock} Units</span>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => startEdit(p)} className="bg-gray-900 text-white p-2 rounded-xl hover:bg-orange-500 transition-colors">
                               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button onClick={() => handleDelete(p._id)} className="bg-red-50 text-red-500 p-2 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}