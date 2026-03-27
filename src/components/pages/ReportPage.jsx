import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle, FaPaperPlane, FaArrowLeft } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosInstance";
import "./ReportPage.css";
import Swal from "sweetalert2";

const ReportPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        type: "complaint",
        subject: "",
        description: "",
        orderId: "",
    });

const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.subject.trim() || !formData.description.trim()) {
            setError("Subject and description are required");
            return;
        }

        if (!user) {
            setError("Please login to submit report");
            navigate("/login");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const payload = {
                type: formData.type,
                subject: formData.subject,
                description: formData.description,
                order_id: formData.orderId || null,        
                userId: user.id,
                userName: user.f_name || user.name || "Anonymous User",
                email: user.email,
            };

            console.log("Sending payload:", payload);   // ← Debug ke liye

            const response = await api.post("/api/v1/customer/feedback", payload);
            
            console.log("Success Response:", response.data);

            setSuccess(true);

            setTimeout(() => {
                navigate("/");
            }, 2500);

        }catch (err) {
    console.error("Full Error Object:", err);

    let errorMsg = "Failed to submit report. Please try again.";

    if (err.response?.data) {
        // Laravel validation errors (422)
        if (err.response.data.errors) {
            const errors = err.response.data.errors;

            // First error message pick karo
            const firstError = Object.values(errors)[0][0];
            errorMsg = firstError;
        } else {
            errorMsg =
                err.response.data.message ||
                err.response.data.debug ||
                errorMsg;
        }
    }

    Swal.fire({
        icon: "error",
        title: "Oops...",
        text: errorMsg,
        confirmButtonColor: "#d33",
    });

    setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="report-success-page">
                <div className="success-container">
                    <div className="big-check">✓</div>
                    <h1>Thank You!</h1>
                    <p>Your report has been submitted successfully.</p>
                    <p>We will review your feedback/complaint shortly.</p>

                    <button
                        className="home-btn"
                        onClick={() => navigate("/")}
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="report-page">
            <div className="report-container">

                <div className="report-header">
                    <FaExclamationTriangle className="report-main-icon" />
                    <h1>Report / Feedback</h1>
                    <p>Tell us about your complaint or suggestion</p>
                </div>

                <form onSubmit={handleSubmit} className="report-form">
                    <div className="form-group">
                        <label>Report Type</label>
                        <div className="type-options">
                            <label className={`type-card ${formData.type === "complaint" ? "active" : ""}`}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="complaint"
                                    checked={formData.type === "complaint"}
                                    onChange={handleChange}
                                />
                                <span>Complaint</span>
                            </label>

                            <label className={`type-card ${formData.type === "feedback" ? "active" : ""}`}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="feedback"
                                    checked={formData.type === "feedback"}
                                    onChange={handleChange}
                                />
                                <span>Feedback / Suggestion</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Subject <span className="required">*</span></label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Example: Delivery is taking too long"
                            required
                        />
                    </div>

                    {user && (
                        <div className="form-group">
                            <label>Order ID (Optional)</label>
                            <input
                                type="text"
                                name="orderId"
                                value={formData.orderId}
                                onChange={handleChange}
                                placeholder="ORD-123456"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Description <span className="required">*</span></label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Please describe your issue or suggestion in detail..."
                            rows="8"
                            required
                        />
                    </div>

                    {error && <div className="error-alert">{error}</div>}

                    <button
                        type="submit"
                        className="submit-report-btn"
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : (
                            <>
                                <FaPaperPlane /> Submit Report
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );  
};

export default ReportPage;