// src/pages/AdminProductsPage.jsx
import React, { useEffect, useState } from "react";
// import Navbar from "../components/Navbar";
import Navbar from "../pages/Navbar";
import { useNavigate } from "react-router-dom";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
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

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchProducts();
    // eslint-disable-next-line
  }, [token]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(
        "https://localdelivery-app-backend.vercel.app/admin/products",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed");
      setProducts(data.products || []);
    } catch (err) {
      console.error("fetchProducts", err);
      setError(err.message || "Error loading products");
    } finally {
      setLoading(false);
    }
  };
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

  const resetForm = () =>
    setForm({
      _id: null,
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      category: "",
      stock: "",
      isActive: true,
    });

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      setLoading(true);
      const res = await fetch(
        `https://localdelivery-app-backend.vercel.app/admin/products/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Delete failed");
      }

      // remove from UI
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.message || "Delete error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || form.price === "")
      return alert("Name and price required");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        imageUrl: form.imageUrl,
        category: form.category,
        stock: Number(form.stock || 0),
        isActive: !!form.isActive,
      };

      let res, data;

      if (form._id) {
        res = await fetch(
          `https://localdelivery-app-backend.vercel.app/admin/products/${form._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          },
        );
        data = await res.json();
        if (!res.ok || !data.success)
          throw new Error(data.message || "Update failed");
        // update UI
        setProducts((prev) =>
          prev.map((p) => (p._id === data.product._id ? data.product : p)),
        );
        alert("Product updated");
      } else {
        res = await fetch(
          "https://localdelivery-app-backend.vercel.app/admin/products",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          },
        );
        data = await res.json();
        if (!res.ok || !data.success)
          throw new Error(data.message || "Create failed");
        setProducts((prev) => [data.product, ...prev]);
        alert("Product created");
      }

      resetForm();
    } catch (err) {
      console.error("save product", err);
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Admin – Products</h2>

          {/* Form */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h3 className="font-semibold mb-2">
              {form._id ? "Edit Product" : "Add Product"}
            </h3>
            {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="p-2 border rounded"
              />
              <input
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="p-2 border rounded"
              />
              <input
                placeholder="Image URL"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="p-2 border rounded"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="p-2 border rounded"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Price"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="p-2 border rounded"
                />
                <input
                  placeholder="Stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="p-2 border rounded"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
                Active
              </label>
              <div className="flex gap-2">
                <button
                  disabled={saving}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  {saving ? "Saving..." : form._id ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 px-4 py-2 rounded"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Products list */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-3">Products ({products.length})</h3>

            {loading ? (
              <div>Loading...</div>
            ) : products.length === 0 ? (
              <div>No products yet</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {products.map((p) => (
                  <div key={p._id} className="border rounded p-3 flex flex-col">
                    <div className="flex-1">
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.category}</div>
                      <div className="text-sm text-gray-700 mt-2">
                        {p.description}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm">₹{p.price}</div>
                        <div className="text-xs text-gray-500">
                          Stock: {p.stock}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => startEdit(p)}
                          className="text-sm bg-yellow-400 px-3 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="text-sm bg-red-500 text-white px-3 py-1 rounded"
                        >
                          Delete
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
    </>
  );
}
