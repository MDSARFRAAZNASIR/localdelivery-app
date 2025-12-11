import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const navigate = useNavigate();

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(
          "https://localdelivery-app-backend.vercel.app/products"
        );
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load products");
        }
        setProducts(data.products || []);
      } catch (err) {
        console.error("Products fetch error:", err);
        setError(err.message || "Error loading products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  };

  const goToCart = () => {
    navigate("/cart");
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-6 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Products 🛒
          </h2>
          <button
            onClick={goToCart}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Cart ({cartCount})
          </button>
        </div>

        {loading ? (
          <div className="text-center">Loading products...</div>
        ) : error ? (
          <div className="text-red-600 bg-red-50 p-3 rounded max-w-2xl mx-auto">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center bg-white p-4 rounded shadow max-w-2xl mx-auto">
            No products available. Ask admin to add some.
          </div>
        ) : (
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-lg shadow p-4 flex flex-col"
              >
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400 text-xs">
                    No Image
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 mb-1">
                    {p.name}
                  </div>
                  <div className="text-sm text-gray-500 mb-1">
                    {p.category}
                  </div>
                  <div className="text-sm text-gray-700 mb-2 line-clamp-2">
                    {p.description}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="font-bold text-orange-600">
                    ₹{p.price}
                  </div>
                  <button
                    onClick={() => addToCart(p)}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1.5 rounded"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
