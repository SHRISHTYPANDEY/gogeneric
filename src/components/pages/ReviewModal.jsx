import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const BASE_URL = "https://www.gogenericpharma.com/api/v1";

export default function ReviewModal({ appointment, onClose }) {
    const [rating, setRating]       = useState(0);
    const [hover, setHover]         = useState(0);
    const [review, setReview]       = useState("");
    const [saving, setSaving]       = useState(false);
    const [alreadyReviewed, setAlreadyReviewed] = useState(false);
    const [checking, setChecking]   = useState(true);

    useEffect(() => {
        checkExisting();
    }, []);

    const checkExisting = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/doctor/reviews/check/${appointment.id}`);
            if (res.data.has_reviewed) {
                setAlreadyReviewed(true);
                const r = res.data.review;
                setRating(r.rating);
                setReview(r.review || "");
            }
        } catch (err) {
            console.error(err);
        }
        setChecking(false);
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            Swal.fire("Please select a rating", "", "warning");
            return;
        }
        setSaving(true);
        try {
            await axios.post(`${BASE_URL}/doctor/reviews`, {
                doctor_id:      appointment.doctor_id,
                appointment_id: appointment.id,
                patient_name:   appointment.patient_name,
                patient_phone:  appointment.patient_phone,
                rating,
                review: review || null,
            });
            Swal.fire({
                icon: "success",
                title: "Thank you!",
                text: "Your review has been submitted.",
                timer: 2000,
                showConfirmButton: false,
            });
            onClose?.();
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to submit review.";
            Swal.fire("Error", msg, "error");
        }
        setSaving(false);
    };

    const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16
        }}>
            <div style={{
                background: "#fff", borderRadius: 20, padding: 28,
                width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
            }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                        <p style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: 0 }}>
                            {alreadyReviewed ? "Your Review" : "Rate your consultation"}
                        </p>
                        <p style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>
                            {appointment.doctor_name || "Doctor"} · {appointment.appointment_date}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9ca3af" }}>✕</button>
                </div>

                {checking ? (
                    <div style={{ textAlign: "center", padding: 30, color: "#9ca3af", fontSize: 14 }}>Checking...</div>
                ) : (
                    <>
                        {/* Stars */}
                        <div style={{ textAlign: "center", marginBottom: 8 }}>
                            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <span
                                        key={star}
                                        onClick={() => !alreadyReviewed && setRating(star)}
                                        onMouseEnter={() => !alreadyReviewed && setHover(star)}
                                        onMouseLeave={() => !alreadyReviewed && setHover(0)}
                                        style={{
                                            fontSize: 36,
                                            cursor: alreadyReviewed ? "default" : "pointer",
                                            color: (hover || rating) >= star ? "#f59e0b" : "#e5e7eb",
                                            transition: "color .15s, transform .1s",
                                            transform: (hover || rating) >= star ? "scale(1.15)" : "scale(1)",
                                            display: "inline-block",
                                        }}
                                    >★</span>
                                ))}
                            </div>
                            {(hover || rating) > 0 && (
                                <p style={{ fontSize: 13, fontWeight: 600, color: "#f59e0b", margin: 0 }}>
                                    {labels[hover || rating]}
                                </p>
                            )}
                        </div>

                        {/* Review text */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 6 }}>
                                Write a review (optional)
                            </label>
                            <textarea
                                rows={4}
                                value={review}
                                onChange={e => setReview(e.target.value)}
                                disabled={alreadyReviewed}
                                placeholder="Share your experience with the doctor..."
                                style={{
                                    width: "100%", border: "1px solid #e5e7eb", borderRadius: 12,
                                    padding: "10px 14px", fontSize: 13, resize: "none",
                                    outline: "none", boxSizing: "border-box",
                                    background: alreadyReviewed ? "#f9fafb" : "#fff",
                                    color: "#374151",
                                }}
                            />
                        </div>

                        {/* Button */}
                        {!alreadyReviewed ? (
                            <button
                                onClick={handleSubmit}
                                disabled={saving || rating === 0}
                                style={{
                                    width: "100%", background: "#4f46e5", color: "#fff",
                                    border: "none", borderRadius: 12, padding: "12px 0",
                                    fontSize: 14, fontWeight: 700, cursor: "pointer",
                                    opacity: saving || rating === 0 ? 0.6 : 1,
                                }}
                            >
                                {saving ? "Submitting..." : "Submit Review"}
                            </button>
                        ) : (
                            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "12px 16px", textAlign: "center", fontSize: 13, color: "#15803d", fontWeight: 600 }}>
                                ✅ You have already reviewed this consultation
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}