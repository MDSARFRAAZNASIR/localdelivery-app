import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function RateItem() {
  const { orderId, productId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [item, setItem] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const res = await fetch(`https://localdelivery-app-backend.vercel.app/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          // Find the specific item in the order's items array
          const targetItem = data.order.items.find(it => it.productId === productId);
          setItem(targetItem);
        }
      } catch (err) {
        console.error("Error fetching item context", err);
      }
    };
    fetchItemDetails();
  }, [orderId, productId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert("Please select a rating!");

    setSubmitting(true);
    try {
      const res = await fetch(`https://localdelivery-app-backend.vercel.app/rate-product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, productId, rating, review }),
      });

      if (!res.ok) throw new Error("Failed to submit rating");

      alert(`Review for ${item.name} submitted!`);
      navigate(-1); // Go back to order details
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!item) return <div className="p-10 text-center font-black text-gray-300">Loading item info...</div>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[32px] shadow-xl p-8 border border-gray-100">
          
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Rate this Item</h2>
            <p className="text-orange-500 font-bold text-sm mt-1">{item.name}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Picker */}
            <div className="flex flex-col items-center py-4 bg-gray-50 rounded-3xl">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`text-3xl transition-transform ${star <= (hover || rating) ? "scale-110" : "opacity-20 grayscale"}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {rating > 0 ? `${rating} Stars` : "Tap to rate"}
              </p>
            </div>

            {/* Review Input */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2 block">
                What did you think of the quality?
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Freshness, taste, or packaging..."
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm h-24 resize-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-4 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 ${
                submitting ? "bg-gray-300" : "bg-black hover:bg-orange-600"
              }`}
            >
              {submitting ? "SAVING..." : "SUBMIT ITEM REVIEW"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}