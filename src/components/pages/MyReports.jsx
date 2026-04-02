import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { cleanImageUrl } from "../../utils";

const BASE_URL = "https://www.gogenericpharma.com/api/v1";

const fmt = (d) => new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric"
});

export default function MyReports() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user?.phone) return;
        fetchReports();
    }, [user]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/patient/reports/${user.phone}`);
            setReports(res.data.reports || []);
        } catch (err) {
            setError("Failed to load reports.");
        }
        setLoading(false);
    };

    if (!user) return (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ color: "#6b7280", fontSize: 15 }}>Please login to view your reports.</p>
        </div>
    );

    return (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem" }}>

            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 600, color: "#111827", margin: 0 }}>My Reports</h2>
                <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
                    Your consultation reports from doctors
                </p>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: 60, color: "#9ca3af", fontSize: 14 }}>
                    Loading your reports...
                </div>
            ) : error ? (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: 16, color: "#b91c1c", fontSize: 14 }}>
                    {error}
                </div>
            ) : reports.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                    <p style={{ fontSize: 15, color: "#6b7280", fontWeight: 500 }}>No reports yet</p>
                    <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
                        Your doctor will share a report after your consultation.
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {reports.map(report => (
                        <div
                            key={report.id}
                            onClick={() => navigate(`/my-reports/${report.id}`)}
                            style={{
                                background: "#fff",
                                border: "1px solid #e5e7eb",
                                borderRadius: 14,
                                padding: "16px 20px",
                                cursor: "pointer",
                                transition: "box-shadow .15s, border-color .15s",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                                e.currentTarget.style.borderColor = "#a5b4fc";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.boxShadow = "none";
                                e.currentTarget.style.borderColor = "#e5e7eb";
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                                    {/* Doctor photo */}
                                    <div style={{
                                        width: 44, height: 44, borderRadius: "50%",
                                        background: "#ede9fe",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 18, flexShrink: 0,
                                        overflow: "hidden",
                                    }}>
                                        {report.doctor_photo
                                            ? <img
                                                src={cleanImageUrl(report.doctor_photo)}
                                                alt={report.doctor_name}
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                            : "👨‍⚕️"
                                        }
                                    </div>

                                    <div>
                                        <p style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: 0 }}>
                                            Dr. {report.doctor_name}
                                        </p>
                                        {report.doctor_specialization && (
                                            <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>
                                                {report.doctor_specialization}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Date + arrow */}
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                                        {fmt(report.created_at)}
                                    </p>
                                    <span style={{ fontSize: 18, color: "#a5b4fc" }}>→</span>
                                </div>
                            </div>

                            {/* Diagnosis preview */}
                            {report.diagnosis && (
                                <div style={{
                                    marginTop: 12, background: "#f9fafb",
                                    borderRadius: 8, padding: "8px 12px",
                                    fontSize: 13, color: "#374151",
                                    borderLeft: "3px solid #818cf8",
                                }}>
                                    <span style={{ color: "#6b7280", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Diagnosis: </span>
                                    {report.diagnosis.length > 80
                                        ? report.diagnosis.slice(0, 80) + "..."
                                        : report.diagnosis
                                    }
                                </div>
                            )}

                            {/* Follow up */}
                            {report.follow_up_date && (
                                <div style={{ marginTop: 8, fontSize: 12, color: "#059669" }}>
                                    📅 Follow-up: {fmt(report.follow_up_date)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}