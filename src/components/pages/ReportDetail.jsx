import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "https://www.gogenericpharma.com/api/v1";

const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric"
}) : null;

export default function ReportDetail() {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const [report, setReport]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        fetchReport();
    }, [id]);

    const fetchReport = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/patient/reports/detail/${id}`);
            setReport(res.data.report);
        } catch (err) {
            setError("Report not found or not accessible.");
        }
        setLoading(false);
    };

    if (loading) return (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af", fontSize: 14 }}>
            Loading report...
        </div>
    );

    if (error || !report) return (
        <div style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: 20, color: "#b91c1c", fontSize: 14 }}>
                {error || "Report not found."}
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem" }}>

            {/* Back */}
            <button onClick={() => navigate("/my-reports")}
                style={{ background: "none", border: "none", color: "#6b7280", fontSize: 13, cursor: "pointer", marginBottom: 16, padding: 0 }}>
                ← Back to reports
            </button>

            {/* Report card */}
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden" }}>

                {/* Top header — doctor info */}
                <div style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", padding: "24px 24px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <p style={{ fontSize: 11, color: "#c4b5fd", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>
                                Medical Report
                            </p>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>
                                Dr. {report.doctor_name}
                            </h2>
                            {report.doctor_specialization && (
                                <p style={{ fontSize: 13, color: "#c4b5fd", margin: 0 }}>{report.doctor_specialization}</p>
                            )}
                            {report.clinic_name && (
                                <p style={{ fontSize: 12, color: "#a5b4fc", margin: "4px 0 0" }}>🏥 {report.clinic_name}</p>
                            )}
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: 11, color: "#c4b5fd", margin: "0 0 2px" }}>Date</p>
                            <p style={{ fontSize: 13, color: "#fff", fontWeight: 500, margin: 0 }}>{fmt(report.created_at)}</p>
                        </div>
                    </div>

                    {/* Patient info */}
                    <div style={{ marginTop: 16, background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 24 }}>
                        <div>
                            <p style={{ fontSize: 10, color: "#c4b5fd", margin: "0 0 2px", textTransform: "uppercase" }}>Patient</p>
                            <p style={{ fontSize: 13, color: "#fff", fontWeight: 600, margin: 0 }}>{report.patient_name}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: 10, color: "#c4b5fd", margin: "0 0 2px", textTransform: "uppercase" }}>Phone</p>
                            <p style={{ fontSize: 13, color: "#fff", margin: 0 }}>{report.patient_phone}</p>
                        </div>
                    </div>
                </div>

                <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* Diagnosis */}
                    {report.diagnosis && (
                        <Section title="Diagnosis">
                            <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, margin: 0 }}>{report.diagnosis}</p>
                        </Section>
                    )}

                    {/* Doctor Notes */}
                    {report.doctor_notes && (
                        <Section title="Doctor's Notes">
                            <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, margin: 0 }}>{report.doctor_notes}</p>
                        </Section>
                    )}

                    {/* Prescription */}
                    {report.prescriptions?.length > 0 && (
                        <Section title="Prescription">
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                    <thead>
                                        <tr style={{ background: "#f9fafb" }}>
                                            {["Medicine", "Dosage", "Frequency", "Duration", "Instructions"].map(h => (
                                                <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", borderBottom: "1px solid #e5e7eb" }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.prescriptions.map((med, i) => (
                                            <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                                <td style={{ padding: "10px 12px", fontWeight: 600, color: "#111827" }}>{med.medicine_name}</td>
                                                <td style={{ padding: "10px 12px", color: "#374151" }}>{med.dosage || "—"}</td>
                                                <td style={{ padding: "10px 12px", color: "#374151" }}>{med.frequency || "—"}</td>
                                                <td style={{ padding: "10px 12px", color: "#374151" }}>{med.duration || "—"}</td>
                                                <td style={{ padding: "10px 12px", color: "#374151" }}>{med.instructions || "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Section>
                    )}

                    {/* Test Recommendations */}
                    {report.tests?.length > 0 && (
                        <Section title="Recommended Tests">
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {report.tests.map((test, i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <span style={{ fontSize: 16 }}>🧪</span>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: "#15803d" }}>{test.test_name}</span>
                                        </div>
                                        {test.note && (
                                            <span style={{ fontSize: 12, color: "#6b7280", fontStyle: "italic" }}>{test.note}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Follow Up */}
                    {report.follow_up_date && (
                        <Section title="Follow Up">
                            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                                <div style={{ background: "#eff6ff", borderRadius: 10, padding: "12px 16px", flex: 1, minWidth: 160 }}>
                                    <p style={{ fontSize: 11, color: "#3b82f6", fontWeight: 600, textTransform: "uppercase", margin: "0 0 4px" }}>Next Visit</p>
                                    <p style={{ fontSize: 15, fontWeight: 600, color: "#1e40af", margin: 0 }}>📅 {fmt(report.follow_up_date)}</p>
                                </div>
                                {report.follow_up_instruction && (
                                    <div style={{ background: "#fefce8", borderRadius: 10, padding: "12px 16px", flex: 2 }}>
                                        <p style={{ fontSize: 11, color: "#ca8a04", fontWeight: 600, textTransform: "uppercase", margin: "0 0 4px" }}>Instructions</p>
                                        <p style={{ fontSize: 13, color: "#92400e", margin: 0 }}>{report.follow_up_instruction}</p>
                                    </div>
                                )}
                            </div>
                        </Section>
                    )}

                </div>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 3, height: 16, background: "#6366f1", borderRadius: 2 }} />
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                    {title}
                </h3>
            </div>
            {children}
        </div>
    );
}