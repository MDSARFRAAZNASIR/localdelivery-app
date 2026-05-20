

// src/pages/UserDashboard.jsx
import React, { useEffect, useState ,useContext} from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../pages/Navbar";
import { LanguageContext } from "../../context/LanguageContext";


export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [reorderToast, setReorderToast] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
    const { t } = useContext(LanguageContext);
  

  // --- SUPPORT CONFIG ---
  const SUPPORT_NUMBER = "919798253680"; // Replace with your actual WhatsApp number
  const supportMessage = encodeURIComponent("Hello! I need help with my order.");

  // --- RE-ORDER LOGIC (Existing) ---
  const handleReorder = (orderItems) => {
    try {
      const saved = localStorage.getItem("cart");
      let currentCart = saved ? JSON.parse(saved) : [];
      const itemsToAdd = orderItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));
      itemsToAdd.forEach(newItem => {
        const existingIdx = currentCart.findIndex(c => c.productId === newItem.productId);
        if (existingIdx > -1) {
          currentCart[existingIdx].quantity += newItem.quantity;
        } else {
          currentCart.push(newItem);
        }
      });
      localStorage.setItem("cart", JSON.stringify(currentCart));
      setReorderToast(true);
      setTimeout(() => {
        setReorderToast(false);
        navigate("/cart");
      }, 1000);
    } catch (err) {
      console.error("Reorder failed", err);
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "CREATED": return "bg-gray-200 text-gray-800 border-gray-300";
      case "CONFIRMED": return "bg-blue-100 text-blue-700 border-blue-200";
      case "OUT_FOR_DELIVERY": return "bg-orange-100 text-orange-700 border-orange-200 animate-pulse";
      case "DELIVERED": return "bg-green-100 text-green-700 border-green-200";
      case "CANCELLED": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch("https://localdelivery-app-backend.vercel.app/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to load profile");
        setUser(data.user);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const res = await fetch("https://localdelivery-app-backend.vercel.app/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to load orders");
        setOrders(data.orders || []);
      } catch (err) { setError(err.message); }
      finally { setOrdersLoading(false); }
    };
    fetchOrders();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh] text-orange-600 font-bold animate-pulse">
        🚀{t("Preparing your dashboard...")} 
      </div>
    </>
  );

  if (error) return (
    <>
      <Navbar />
      <div className="p-6 max-w-xl mx-auto mt-10 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
        <p className="font-bold">{t("Oops! Something went wrong")}</p>
        <p className="text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-xs underline">Try Again</button>
      </div>
    </>
  );

  const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "";
  const activeOrdersCount = orders.filter(o => ["CREATED", "CONFIRMED", "OUT_FOR_DELIVERY"].includes(o.status)).length;

  return (
    <>
      <Navbar />

      {/* --- FLOATING WHATSAPP BUTTON --- */}
      <a 
        href={`https://wa.me/${SUPPORT_NUMBER}?text=${supportMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-transform active:scale-90 flex items-center justify-center"
        title="Chat with Support"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
        </svg>
      </a>

      {reorderToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-2 rounded-full shadow-lg z-50 animate-bounce">
          {t("Items added to cart! Redirecting...")}
        </div>
      )}

      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-800">{t("Hello")}, {user?.username || "Friend"}! 👋</h1>
                <p className="text-gray-500 text-sm">{t("Manage your orders and account settings")}</p>
            </div>
            <button onClick={handleLogout} className="text-xs font-bold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all">
                {t("Logout")}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase">{t("Total Spent")}</p>
                <p className="text-xl font-black text-gray-800">₹{orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-2xl shadow-sm border border-orange-100">
                <p className="text-xs font-bold text-orange-400 uppercase">{t("Active Orders")}</p>
                <p className="text-xl font-black text-orange-600">{activeOrdersCount} {t("Running")}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-2xl shadow-sm border border-green-100">
                <p className="text-xs font-bold text-green-400 uppercase">{t("Phone Number")}</p>
                <p className="text-xl font-black text-green-700">{user?.userphone || "N/A"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-1 space-y-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl mb-4">👤</div>
                    <h2 className="text-lg font-bold text-gray-800">{user?.username}</h2>
                    <p className="text-xs text-gray-500 mb-4 truncate">{user?.useremail}</p>
                    <button className="w-full bg-gray-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-black active:scale-95 transition-all" onClick={() => navigate("/profile")}>{t("Edit Details")}</button>
                    <button className="w-full mt-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 active:scale-95 transition-all shadow-md shadow-orange-200" onClick={() => navigate("/products")}>{t("Shop Now")} 🛒</button>
                </div>

                {/* --- HELP & SUPPORT CARD --- */}
                <div className="bg-blue-600 p-6 rounded-2xl shadow-lg text-white">
                    <h3 className="font-black text-lg mb-1">{t("Need Help")}? 🆘</h3>
                    <p className="text-xs opacity-80 mb-4">{t("Facing issues with your delivery or payment")}?</p>
                    <div className="space-y-2">
                        <a 
                            href={`https://wa.me/${SUPPORT_NUMBER}?text=${supportMessage}`}
                            className="block w-full text-center bg-white text-blue-600 py-2 rounded-lg text-xs font-black hover:bg-blue-50 transition-colors"
                        >
                            {t("Chat with Support")}
                        </a>
                        <button 
                            onClick={() => window.location.href = "tel:+919798253680"}
                            className="block w-full text-center bg-blue-500 text-white py-2 rounded-lg text-xs font-black hover:bg-blue-400 transition-colors"
                        >
                            {t("Call Support")}
                        </button>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black text-gray-800">{t("Recent Orders")}</h3>
                        <button onClick={() => navigate("/orders")} className="text-xs font-bold text-orange-600 hover:underline">{t("View History")}</button>
                    </div>

                    {ordersLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-gray-400 font-medium">{t("Fetching your orders")}...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed">
                            <p className="text-3xl mb-2">🛍️</p>
                            <p className="text-gray-500 font-medium">{t("No orders yet.")}</p>
                            <button onClick={() => navigate("/products")} className="mt-4 text-orange-600 font-bold text-sm">Start Shopping →</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.slice(0, 5).map((o) => (
                                <div key={o._id} className="group border border-gray-100 p-4 rounded-xl hover:bg-gray-50 transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {o._id.slice(-8)}</p>
                                            <p className="text-xs text-gray-500">{formatDate(o.createdAt)}</p>
                                        </div>
                                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-black border ${statusColor(o.status)}`}>
                                            {o.status}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-1 mb-3">
                                        {o.items?.slice(0, 2).map((it, idx) => (
                                            <p key={idx} className="text-sm text-gray-700 font-medium">
                                                {it.name} <span className="text-gray-400 text-xs">×{it.quantity}</span>
                                            </p>
                                        ))}
                                        {o.items?.length > 2 && (
                                            <p className="text-[10px] text-orange-500 font-bold">+ {o.items.length - 2}  {t("more items")}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                        <p className="text-sm font-black text-gray-800">₹{o.totalAmount}</p>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleReorder(o.items)}
                                                className="bg-green-50 text-green-700 border border-green-100 hover:bg-green-700 hover:text-white px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all"
                                            >
                                                {t("Re-order")} 🔄
                                            </button>
                                            <button 
                                                onClick={() => navigate(`/orders`)}
                                                className="text-[10px] font-black uppercase text-gray-400 hover:text-orange-600 px-2"
                                            >
                                                {t("Track")}  →
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
      </div>
    </>
  );
}