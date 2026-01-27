import { useState } from "react";
import "./ReviewPopup.css";
import api from "../api/axiosInstance";

export default function ReviewPopup({ order, onClose, onSuccess }) {
  // 🛑 Guard: prevent crash if order is null
  if (!order || !order.store) return null;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submitReview = async () => {
    if (!rating) {
      alert("Please give a rating");
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/v1/items/reviews/submit", {
        order_id: order.id,
        store_id: order.store.id,
        rating,
        comment,
      });

      onSuccess?.(); // safe callback
      onClose?.();   // close popup after success
    } catch (err) {
      console.error("Review submit failed", err);
      alert("Something went wrong while submitting review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-overlay">
      <div className="review-popup">
        <h3>Rate your order</h3>
        <p className="store-name">{order.store.name}</p>

        {/* ⭐ Rating Stars */}
        <div className="rating-row">
          {[1, 2, 3, 4, 5].map((r) => (
            <span
              key={r}
              className={`star ${r <= rating ? "active" : ""}`}
              onClick={() => setRating(r)}
            >
              ★
            </span>
          ))}
        </div>

        {/* ✍️ Comment */}
        <textarea
          placeholder="Write your feedback (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {/* 🔘 Actions */}
        <div className="review-actions">
          <button
            className="later-btn"
            onClick={onClose}
            disabled={loading}
          >
            Later
          </button>

          <button
            className="submit-btn"
            onClick={submitReview}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
