import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function RateOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderDate, setOrderDate] = useState("");

  // Optional: Fetch order details to show what they are rating
  useEffect(() => {
    const fetchMinimalOrder = async () => {
      try {
        const res = await fetch(`https://localdelivery-app-backend.vercel.app/user/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setOrderDate(data.order.createdAt);
      } catch (err) {
        console.error("Failed to fetch order context", err);
      }
    };
    fetchMinimalOrder();
  }, [orderId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert("Please select a star rating");

    setSubmitting(true);
    try {
      const res = await fetch(`https://localdelivery-app-backend.vercel.app/user/orders/${orderId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (!res.ok) throw new Error("Failed to submit rating");

      alert("Thank you for your feedback! ⭐");
      navigate("/orders");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                {orderDate && <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-4 text-sm font-bold">{orderDate}</div>}
        <div className="max-w-md w-full bg-white rounded-[40px] shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
          
          {/* Header */}
          <div className="text-center mb-8">
            <button 
              onClick={() => navigate(-1)} 
              className="text-xs font-bold text-gray-400 hover:text-black mb-4 block mx-auto"
            >
              ← Back to Orders
            </button>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Rate Your Order</h2>
            <p className="text-gray-400 text-sm font-medium mt-1">
              Order #{orderId.slice(-8)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Star Rating Section */}
            <div className="flex flex-col items-center">
              <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-4">How was the experience?</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`text-4xl transition-all transform ${
                      star <= (hover || rating) ? "scale-125 grayscale-0" : "grayscale opacity-30"
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <div className="mt-4 h-6">
                {rating > 0 && (
                  <span className="text-orange-500 font-black text-xs uppercase tracking-tighter">
                    {["Terrible", "Bad", "Okay", "Good", "Amazing"][rating - 1]}!
                  </span>
                )}
              </div>
            </div>

            {/* Comment Section */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2 block">
                Share more details (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="The food was hot and the delivery was fast..."
                className="w-full bg-gray-50 border-none rounded-3xl p-5 text-sm focus:ring-2 focus:ring-orange-500/20 h-32 resize-none transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-4 rounded-3xl font-black text-white shadow-lg transition-all active:scale-95 ${
                submitting ? "bg-gray-300 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 shadow-orange-100"
              }`}
            >
              {submitting ? "SUBMITTING..." : "SUBMIT REVIEW"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}