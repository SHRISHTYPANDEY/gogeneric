import { useState } from "react";
import { useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../api/axiosInstance";

const STEPS = [
    { key: "booked", label: "Booked", icon: "📋" },
    { key: "reviewing", label: "Doctor Review", icon: "👨‍⚕️" },
    { key: "payment", label: "Payment", icon: "💳" },
    { key: "confirmed", label: "Confirmed", icon: "✅" },
    { key: "completed", label: "Completed", icon: "🎉" },
];

function getStepIndex(appt) {
    const s = appt.status;
    const p = appt.payment_status;
    if (s === "rejected") return -1;
    if (s === "pending") return 1;
    if (s === "payment_pending") return 2;
    if (s === "confirmed" || (s === "approved" && p === "paid")) return 3;
    if (s === "completed") return 4;
    if (s === "rescheduled") return 3;
    if (s === "approved" && (p === "free" || !p || p === "unpaid")) return 3;
    return 1;
}

const statusConfig = {
    pending:         { bg: "#FEF3C7", color: "#92400E", label: "Awaiting Doctor" },
    approved:        { bg: "#DBEAFE", color: "#1E40AF", label: "Approved" },
    payment_pending: { bg: "#FFEDD5", color: "#9A3412", label: "Payment Pending" },
    confirmed:       { bg: "#E1F5EE", color: "#085041", label: "Confirmed" },
    completed:       { bg: "#EDE9FE", color: "#4C1D95", label: "Completed" },
    rejected:        { bg: "#FEE2E2", color: "#991B1B", label: "Rejected" },
    rescheduled:     { bg: "#FDF4FF", color: "#6B21A8", label: "🗓️ Rescheduled" },
};

function ReviewSection({ appt }) {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");
    const [loading, setLoading] = useState(false);
    const [alreadyReviewed, setAlreadyReviewed] = useState(false);

    useEffect(() => { checkReview(); }, []);

    const checkReview = async () => {
        try {
            const res = await api.get(`/api/v1/doctor/reviews/check/${appt.id}`);
            if (res.data.has_reviewed) setAlreadyReviewed(true);
        } catch (err) { console.error(err); }
    };

    const submitReview = async () => {
        if (!rating) { Swal.fire("Error", "Please select rating", "error"); return; }
        try {
            setLoading(true);
            await api.post("/api/v1/doctor/reviews", {
                doctor_id: appt.doctor_id, appointment_id: appt.id,
                patient_name: appt.patient_name, patient_phone: appt.patient_phone,
                rating, review,
            });
            Swal.fire("Success", "Review submitted!", "success");
            setAlreadyReviewed(true);
        } catch (err) {
            Swal.fire("Error", err?.response?.data?.message || "Failed", "error");
        } finally { setLoading(false); }
    };

    if (alreadyReviewed) return <div className="review-box">⭐ You have already submitted a review</div>;

    return (
        <div className="review-box">
            <h4>⭐ Rate Your Experience</h4>
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} onClick={() => setRating(star)}
                        style={{ cursor: "pointer", fontSize: "20px", color: star <= rating ? "#f59e0b" : "#d1d5db" }}>★</span>
                ))}
            </div>
            <textarea placeholder="Write your review (optional)" value={review} onChange={e => setReview(e.target.value)} />
            <button className="appt-pay-btn" onClick={submitReview} disabled={loading}>
                {loading ? "Submitting..." : "Submit Review"}
            </button>
        </div>
    );
}

export default function AppointmentCard({ appt }) {
    const [open, setOpen] = useState(false);
    const stepIndex = getStepIndex(appt);
    const isRejected = appt.status === "rejected";
    const isRescheduled = appt.status === "rescheduled";
    const isVideo = appt.consultation_type === "video_call";

    const statusMeta = statusConfig[appt.status] || statusConfig.pending;

    return (
        <div className="appt-card">
            <div className="appt-card-header" onClick={() => setOpen(!open)}>
                <div className="appt-card-left">
                    <span className="appt-plan-name">{appt.plan_name}</span>
                    <span className="appt-date">
                        📅 {isRescheduled && appt.appointment_date
                            ? appt.appointment_date
                            : appt.appointment_date}
                        &nbsp;·&nbsp;
                        ⏰ {appt.time_slot}
                    </span>
                </div>
                <div className="appt-card-right">
                    <span
                        className="appt-status-badge"
                        style={{
                            background: statusMeta.bg,
                            color: statusMeta.color,
                            border: `0.5px solid ${statusMeta.color}33`,
                            borderRadius: 20,
                            padding: "3px 10px",
                            fontSize: 11,
                            fontWeight: 500,
                        }}
                    >
                        {statusMeta.label}
                    </span>
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </div>

            {open && (
                <div className="appt-card-body">

                    {/* ── Rescheduled info banner ── */}
                    {isRescheduled && (
                        <div style={{
                            display: "flex", alignItems: "flex-start", gap: 10,
                            background: "#FDF4FF",
                            border: "0.5px solid #D8B4FE",
                            borderRadius: 10,
                            padding: "10px 14px",
                            marginBottom: 14,
                        }}>
                            <span style={{ fontSize: 18, lineHeight: 1 }}>🗓️</span>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 500, color: "#6B21A8" }}>
                                    Appointment Rescheduled
                                </div>
                                <div style={{ fontSize: 11, color: "#7E22CE", marginTop: 3 }}>
                                    New date: <b>{appt.appointment_date}</b> &nbsp;·&nbsp; <b>{appt.time_slot}</b>
                                </div>
                                {appt.reschedule_reason && (
                                    <div style={{ fontSize: 11, color: "#9333EA", marginTop: 2 }}>
                                        Reason: {appt.reschedule_reason}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Progress tracker ── */}
                    {!isRejected ? (
                        <div className="appt-tracker">
                            {STEPS.map((step, i) => {
                                const done = i <= stepIndex;
                                const current = i === stepIndex;
                                return (
                                    <div key={step.key} className="appt-step-wrap">
                                        <div className={`appt-step ${done ? "done" : ""} ${current ? "current" : ""}`}>
                                            <div className={`appt-step-circle ${done ? "done" : ""} ${current ? "current" : ""}`}>
                                                {done ? "✓" : step.icon}
                                            </div>
                                            <span className={`appt-step-label ${done ? "done" : ""}`}>{step.label}</span>
                                        </div>
                                        {i < STEPS.length - 1 && <div className={`appt-step-line ${i < stepIndex ? "done" : ""}`} />}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="appt-rejected-banner">❌ Your appointment was rejected. You can book again.</div>
                    )}

                    {/* ── Details grid ── */}
                    <div className="appt-details-grid">
                        <div className="appt-detail-row">
                            <span className="appt-detail-label">Type</span>
                            <span className="appt-detail-value">{isVideo ? "🎥 Video Call" : "🏥 In-Person"}</span>
                        </div>
                        <div className="appt-detail-row">
                            <span className="appt-detail-label">Plan Price</span>
                            <span className="appt-detail-value font-semibold">₹{Number(appt.plan_price).toLocaleString("en-IN")}</span>
                        </div>
                        {appt.problem && (
                            <div className="appt-detail-row">
                                <span className="appt-detail-label">Problem</span>
                                <span className="appt-detail-value">{appt.problem}</span>
                            </div>
                        )}
                        {appt.meeting_link && (
                            <div className="appt-detail-row">
                                <span className="appt-detail-label">Video Link</span>
                                <a href={appt.meeting_link} target="_blank" rel="noreferrer" className="appt-meeting-link">🔗 Join Meeting</a>
                            </div>
                        )}
                    </div>

                    {/* ── Action buttons ── */}
                    {appt.status === "payment_pending" && (
                        <a href={`/pay/appointment/${appt.id}`} className="appt-pay-btn">
                            💳 Pay Now — ₹{Number(appt.plan_price).toLocaleString("en-IN")}
                        </a>
                    )}
                    {appt.status === "completed" && <ReviewSection appt={appt} />}
                </div>
            )}
        </div>
    );
}