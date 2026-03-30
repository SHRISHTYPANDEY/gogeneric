// src/pages/PayAppointment.jsx
// Route: /pay/appointment/:id
// Patient WhatsApp se is link pe aata hai aur yahan se payment karta hai

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { openRazorpay } from "../../utils/razorpayPayment";
import api from "../../api/axiosInstance";
import Swal from "sweetalert2";

export default function PayAppointment() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [appt, setAppt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState("");

    // ── Fetch appointment details ──────────────────────────────────────────────
    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get(`/api/v1/doctor/appointments/${id}/details`);
                setAppt(res.data.data);
            } catch (err) {
                setError("Appointment not found or link has expired.");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    // ── Handle Pay ─────────────────────────────────────────────────────────────
    const handlePay = () => {
        if (!appt) return;
        setPaying(true);

        openRazorpay({
            amount: Math.round(appt.plan_price), // paise
            name: "GoGeneric",
            description: `${appt.plan_name} — ${appt.appointment_date}`,
            phone: appt.patient_phone,
            onSuccess: async (response) => {
                try {
                    // Backend ko payment confirm karo
                    await api.post(`/api/v1/doctor/appointments/${id}/confirm-payment`, {
                        razorpay_payment_id: response.razorpay_payment_id,
                    });

                    Swal.fire({
                        icon: "success",
                        title: "Payment Successful! 🎉",
                        html: `
              <b>Plan:</b> ${appt.plan_name}<br/>
              <b>Amount:</b> ₹${appt.plan_price}<br/>
              <b>Date:</b> ${appt.appointment_date}<br/>
              <b>Time:</b> ${appt.time_slot}<br/><br/>
              You will receive confirmation on WhatsApp.
            `,
                        confirmButtonColor: "#10b981",
                        confirmButtonText: "Done",
                    }).then(() => navigate("/"));
                } catch (err) {
                    Swal.fire({
                        icon: "error",
                        title: "Verification Failed",
                        text: "Payment done but confirmation failed. Please contact support.",
                    });
                } finally {
                    setPaying(false);
                }
            },
            onDismiss: () => setPaying(false),
        });
    };

    // ── UI ─────────────────────────────────────────────────────────────────────
    if (loading) return <PaymentSkeleton />;

    if (error) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
                <div className="text-5xl mb-4">😕</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Link Expired</h2>
                <p className="text-gray-400 text-sm">{error}</p>
                <button
                    onClick={() => navigate("/doctors")}
                    className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
                >
                    Back to Doctors
                </button>
            </div>
        </div>
    );

    // Already paid
    if (appt.payment_status === "paid" || appt.status === "confirmed") return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-xl font-bold text-emerald-600 mb-2">Already Paid!</h2>
                <p className="text-gray-400 text-sm">Your appointment is confirmed.</p>
                <div className="mt-4 bg-emerald-50 rounded-xl p-4 text-left text-sm space-y-2">
                    <p><span className="text-gray-400">Date:</span> <span className="font-semibold text-gray-700">{appt.appointment_date}</span></p>
                    <p><span className="text-gray-400">Time:</span> <span className="font-semibold text-gray-700">{appt.time_slot}</span></p>
                    <p><span className="text-gray-400">Type:</span> <span className="font-semibold text-gray-700">{appt.consultation_type === "video_call" ? "🎥 Video Call" : "🏥 In-Person"}</span></p>
                </div>
            </div>
        </div>
    );

    const isVideo = appt.consultation_type === "video_call";
    const typeLabel = isVideo ? "🎥 Video Call" : "🏥 In-Person";

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full overflow-hidden">

                {/* ── Header ── */}
                <div className="bg-indigo-600 px-6 py-5 text-white">
                    <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">
                        Complete Payment
                    </p>
                    <h1 className="text-xl font-bold">Confirm Your Appointment</h1>
                </div>

                {/* ── Appointment Summary ── */}
                <div className="px-6 py-5 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Appointment Details
                    </p>
                    <div className="space-y-3">
                        <Row label="Patient" value={appt.patient_name} />
                        <Row label="Plan" value={appt.plan_name} />
                        <Row label="Date" value={appt.appointment_date} />
                        <Row label="Time" value={appt.time_slot} />
                        <Row label="Type" value={typeLabel} />
                    </div>
                </div>

                {/* ── Info banner ── */}
                <div className={`mx-6 mt-5 px-4 py-3 rounded-xl text-sm ${isVideo ? "bg-blue-50 text-blue-700" : "bg-teal-50 text-teal-700"}`}>
                    {isVideo
                        ? "📹 Doctor will share the video call link before your appointment on WhatsApp."
                        : "🏥 Please visit the clinic at your scheduled time."}
                </div>

                {/* ── Amount + Pay Button ── */}
                <div className="px-6 py-5">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-500 text-sm">Amount to Pay</span>
                        <span className="text-2xl font-bold text-gray-800">
                            ₹{Number(appt.plan_price).toLocaleString("en-IN")}
                        </span>
                    </div>

                    <button
                        onClick={handlePay}
                        disabled={paying}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-xl text-sm shadow-sm shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                    >
                        {paying ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Opening Payment...
                            </>
                        ) : (
                            <>💳 Pay ₹{Number(appt.plan_price).toLocaleString("en-IN")}</>
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-300 mt-3">
                        Secured by Razorpay • UPI, Cards, NetBanking accepted
                    </p>
                </div>
            </div>
        </div>
    );
}

// ── Small helper components ────────────────────────────────────────────────────
function Row({ label, value }) {
    return (
        <div className="flex justify-between text-sm">
            <span className="text-gray-400">{label}</span>
            <span className="font-semibold text-gray-700">{value}</span>
        </div>
    );
}

function PaymentSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full overflow-hidden animate-pulse">
                <div className="bg-indigo-200 h-24" />
                <div className="p-6 space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex justify-between">
                            <div className="h-4 w-20 bg-gray-100 rounded" />
                            <div className="h-4 w-28 bg-gray-100 rounded" />
                        </div>
                    ))}
                    <div className="h-12 bg-indigo-100 rounded-xl mt-4" />
                </div>
            </div>
        </div>
    );
}
