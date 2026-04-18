import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { CalendarCheck, FileText, Upload, X, Eye, Trash2, CheckCircle, Loader } from "lucide-react";
import AppointmentCard from "./AppointmentCard";
import LoginModal from "../auth/LoginModal";
import Footer from "../Footer";
import Swal from "sweetalert2";

const getCategoryIcon = (category) => {
    const c = (category || "").toLowerCase();
    if (c.includes("haem") || c.includes("blood")) return "🩸";
    if (c.includes("diab") || c.includes("sugar")) return "🔭";
    if (c.includes("urine") || c.includes("renal")) return "🧫";
    if (c.includes("radio") || c.includes("scan") || c.includes("xray")) return "🩻";
    if (c.includes("cardio") || c.includes("heart")) return "❤️";
    return "🧪";
};
/* ══════════════════════════════════════════
Upload Modal — FIXED & REDESIGNED
══════════════════════════════════════════ */
function UploadReportModal({ test, patient, onClose, onSuccess }) {
    const fileInputRef = useRef();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [notes, setNotes] = useState("");
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dragOver, setDragOver] = useState(false);
    const uploadRef = useRef(false);

    const handleFile = (f) => {
        if (!f) return;
        const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "image/webp"];
        if (!allowed.includes(f.type)) {
            Swal.fire("Invalid file", "Only PDF, JPG, PNG, WEBP allowed", "error");
            return;
        }
        if (f.size > 10 * 1024 * 1024) {
            Swal.fire("Too large", "Max file size is 10MB", "error");
            return;
        }
        setFile(f);
        if (f.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = e => setPreview(e.target.result);
            reader.readAsDataURL(f);
        } else {
            setPreview("pdf");
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleUpload = async () => {
        if (uploadRef.current || !file || uploading) return;
        uploadRef.current = true;
        setUploading(true);
        setProgress(0);

        const formData = new FormData();
        formData.append("report_file", file);
        formData.append("notes", notes || "");
        formData.append("patient_phone", patient.phone);
        formData.append("patient_name", patient.name);
        formData.append("test_name", test.test_name);
        formData.append("doctor_id", test.doctor_id);
        if (test.appointment_id) formData.append("appointment_id", test.appointment_id);

        try {
            await api.post(`/api/v1/doctor/test-recommendations/${test.id}/upload-report`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (e) => {
                    if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
                },
            });
            onSuccess();
            onClose();
        } catch (err) {
            Swal.fire("Upload failed", err?.response?.data?.message || "Please try again", "error");
            uploadRef.current = false;
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <div
            onClick={e => e.target === e.currentTarget && onClose()}
            style={{
                position: "fixed", inset: 0, zIndex: 1000,
                background: "rgba(10, 20, 15, 0.55)",
                backdropFilter: "blur(6px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "20px",
            }}
        >
            <div style={{
                background: "#fff",
                borderRadius: 20,
                width: "100%",
                maxWidth: 460,
                boxShadow: "0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(29,158,117,0.12)",
                overflow: "hidden",
                animation: "modalSlideUp 0.22s ease",
            }}>
                <style>{`
                    @keyframes modalSlideUp {
                        from { opacity: 0; transform: translateY(20px) scale(0.97); }
                        to   { opacity: 1; transform: translateY(0) scale(1); }
                    }
                `}</style>

                {/* Header */}
                <div style={{
                    background: "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)",
                    padding: "18px 20px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 36, height: 36,
                            background: "rgba(255,255,255,0.2)",
                            borderRadius: 10,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <Upload size={17} color="#fff" />
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Upload Report</div>
                            <div style={{
                                fontSize: 11, color: "rgba(255,255,255,0.75)",
                                marginTop: 1,
                                maxWidth: 280,
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>
                                {test.test_name}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: "rgba(255,255,255,0.15)",
                        border: "none", cursor: "pointer",
                        width: 30, height: 30, borderRadius: 8,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff",
                        transition: "background 0.15s",
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: "20px" }}>

                    {/* Drop zone or preview */}
                    {!file ? (
                        <div
                            onDrop={handleDrop}
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onClick={() => fileInputRef.current.click()}
                            style={{
                                border: `2px dashed ${dragOver ? "#1D9E75" : "#B8E8D8"}`,
                                borderRadius: 14,
                                padding: "28px 20px",
                                textAlign: "center",
                                cursor: "pointer",
                                background: dragOver ? "#E8F8F3" : "#F6FDF9",
                                transition: "all 0.18s ease",
                            }}
                        >
                            <div style={{
                                width: 52, height: 52,
                                background: "linear-gradient(135deg, #E1F5EE, #C8EFE0)",
                                borderRadius: 14,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 12px",
                                boxShadow: "0 4px 12px rgba(29,158,117,0.15)",
                            }}>
                                <Upload size={22} color="#1D9E75" />
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "#0F4A38" }}>
                                {dragOver ? "Drop it here!" : "Tap to select or drag & drop"}
                            </div>
                            <div style={{
                                fontSize: 11, color: "#6BAF96", marginTop: 6,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            }}>
                                <span style={{
                                    background: "#E1F5EE", borderRadius: 6,
                                    padding: "2px 8px", fontWeight: 500,
                                }}>PDF</span>
                                <span style={{
                                    background: "#E1F5EE", borderRadius: 6,
                                    padding: "2px 8px", fontWeight: 500,
                                }}>JPG</span>
                                <span style={{
                                    background: "#E1F5EE", borderRadius: 6,
                                    padding: "2px 8px", fontWeight: 500,
                                }}>PNG</span>
                                <span style={{ color: "#A0C4B8" }}>· Max 10MB</span>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            border: "1.5px solid #B8E8D8",
                            borderRadius: 14, overflow: "hidden",
                            position: "relative",
                            background: "#F6FDF9",
                        }}>
                            {preview === "pdf" ? (
                                <div style={{
                                    padding: "16px",
                                    display: "flex", alignItems: "center", gap: 12,
                                }}>
                                    <div style={{
                                        width: 44, height: 44,
                                        background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
                                        borderRadius: 10,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 22, flexShrink: 0,
                                        boxShadow: "0 2px 8px rgba(245,158,11,0.2)",
                                    }}>📄</div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{
                                            fontSize: 12, fontWeight: 600, color: "#0F4A38",
                                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                        }}>{file.name}</div>
                                        <div style={{ fontSize: 11, color: "#6BAF96", marginTop: 2 }}>
                                            {(file.size / 1024 / 1024).toFixed(2)} MB · PDF Document
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <img src={preview} alt="preview"
                                    style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block" }} />
                            )}
                            {/* Remove file */}
                            <button
                                onClick={() => { setFile(null); setPreview(null); }}
                                style={{
                                    position: "absolute", top: 8, right: 8,
                                    background: "rgba(0,0,0,0.45)", border: "none",
                                    borderRadius: "50%", width: 26, height: 26,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", color: "#fff",
                                }}
                            >
                                <X size={13} />
                            </button>
                            {/* Re-select */}
                            <div
                                onClick={() => fileInputRef.current.click()}
                                style={{
                                    padding: "8px 14px",
                                    borderTop: "1px solid #E1F5EE",
                                    fontSize: 11, color: "#1D9E75",
                                    cursor: "pointer", fontWeight: 500,
                                    textAlign: "center",
                                    background: "#F0FBF7",
                                }}
                            >
                                ↩ Choose a different file
                            </div>
                        </div>
                    )}

                    <input
                        ref={fileInputRef} type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        style={{ display: "none" }}
                        onChange={e => handleFile(e.target.files[0])}
                    />

                    {/* Notes */}
                    <div style={{ marginTop: 14 }}>
                        <label style={{
                            fontSize: 11, fontWeight: 600, color: "#6BAF96",
                            textTransform: "uppercase", letterSpacing: "0.5px",
                            display: "block", marginBottom: 6,
                        }}>
                            Notes (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="e.g. Fasting sample, done at SRL labs..."
                            rows={2}
                            style={{
                                width: "100%", padding: "10px 12px",
                                fontSize: 12,
                                border: "1.5px solid #D4EFE5",
                                borderRadius: 10, resize: "none",
                                background: "#F6FDF9",
                                color: "#0F4A38",
                                outline: "none",
                                boxSizing: "border-box",
                                fontFamily: "inherit",
                                transition: "border-color 0.15s",
                            }}
                            onFocus={e => e.target.style.borderColor = "#1D9E75"}
                            onBlur={e => e.target.style.borderColor = "#D4EFE5"}
                        />
                    </div>

                    {/* Progress bar */}
                    {uploading && (
                        <div style={{ marginTop: 12 }}>
                            <div style={{
                                height: 6, borderRadius: 6,
                                background: "#E1F5EE",
                                overflow: "hidden",
                            }}>
                                <div style={{
                                    height: "100%", borderRadius: 6,
                                    background: "linear-gradient(90deg, #1D9E75, #5DCAA5)",
                                    width: `${progress}%`,
                                    transition: "width 0.2s ease",
                                }} />
                            </div>
                            <div style={{
                                fontSize: 11, color: "#1D9E75",
                                marginTop: 5, textAlign: "right", fontWeight: 500,
                            }}>
                                Uploading... {progress}%
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                        <button onClick={onClose} style={{
                            flex: 1, padding: "11px",
                            fontSize: 13, fontWeight: 500,
                            border: "1.5px solid #D4EFE5",
                            borderRadius: 12, cursor: "pointer",
                            background: "#fff",
                            color: "#6BAF96",
                            transition: "all 0.15s",
                        }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = "#1D9E75"}
                            onMouseLeave={e => e.currentTarget.style.borderColor = "#D4EFE5"}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            style={{
                                flex: 2, padding: "11px",
                                fontSize: 13, fontWeight: 600,
                                border: "none", borderRadius: 12,
                                cursor: file && !uploading ? "pointer" : "not-allowed",
                                background: file && !uploading
                                    ? "linear-gradient(135deg, #1D9E75, #0F6E56)"
                                    : "#E1F5EE",
                                color: file && !uploading ? "#fff" : "#A0C4B8",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                                transition: "all 0.15s",
                                boxShadow: file && !uploading ? "0 4px 14px rgba(29,158,117,0.3)" : "none",
                            }}
                        >
                            {uploading ? (
                                <><Loader size={14} className="animate-spin" /> Uploading... {progress}%</>
                            ) : (
                                <><Upload size={14} /> Upload Report</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
/* ══════════════════════════════════════════
    TestCard with upload
══════════════════════════════════════════ */
function TestCard({ test, patient, onClick, onUploadSuccess }) {
    const [hovered, setHovered] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const hasReport = test.report_uploaded;

    return (
        <>
            <div
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    display: "flex", alignItems: "center", gap: 14,
                    background: hovered ? "#E1F5EE" : "var(--color-background-primary)",
                    border: `0.5px solid ${hovered ? "#5DCAA5" : "var(--color-border-tertiary)"}`,
                    borderRadius: "var(--border-radius-lg)",
                    padding: "12px 14px",
                    transition: "border-color 0.15s, background 0.15s",
                }}
            >
                {/* Icon */}
                <div style={{
                    width: 40, minWidth: 40, height: 40,
                    borderRadius: "var(--border-radius-md)",
                    background: "#E1F5EE",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18,
                }}>
                    {getCategoryIcon(test.test_category)}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontSize: 13, fontWeight: 500,
                        color: "var(--color-text-primary)",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                    }}>
                        {test.test_name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>
                        {test.test_category || "Lab Test"}
                    </div>
                    {test.note && (
                        <div style={{
                            fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 2,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                        }}>
                            {test.note}
                        </div>
                    )}

                    {/* Report uploaded badge */}
                    {hasReport && (
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            marginTop: 4, fontSize: 10, fontWeight: 500,
                            color: "#085041", background: "#E1F5EE",
                            border: "0.5px solid #5DCAA5",
                            borderRadius: 20, padding: "2px 8px",
                        }}>
                            <CheckCircle size={10} /> Report uploaded
                        </div>
                    )}
                </div>

                {/* Right actions */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    {test.test_price && (
                        <span style={{
                            fontSize: 12, fontWeight: 500,
                            background: "#E1F5EE", color: "#085041",
                            padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap"
                        }}>
                            ₹{Number(test.test_price).toLocaleString("en-IN")}
                        </span>
                    )}

                    {/* Book test button */}
                    <button
                        onClick={onClick}
                        style={{
                            fontSize: 11, padding: "4px 10px",
                            background: "transparent",
                            border: "0.5px solid #5DCAA5",
                            borderRadius: 20, color: "#0F6E56",
                            cursor: "pointer", whiteSpace: "nowrap",
                        }}
                    >
                        Book →
                    </button>

                    {/* Upload button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowUpload(true); }}
                        style={{
                            fontSize: 11, padding: "4px 10px",
                            background: hasReport ? "#E1F5EE" : "#1D9E75",
                            border: "none",
                            borderRadius: 20,
                            color: hasReport ? "#085041" : "#fff",
                            cursor: "pointer", whiteSpace: "nowrap",
                            display: "flex", alignItems: "center", gap: 4,
                        }}
                    >
                        <Upload size={10} />
                        {hasReport ? "Re-upload" : "Upload Report"}
                    </button>
                </div>
            </div>

            {showUpload && (
                <UploadReportModal
                    test={test}
                    patient={patient}
                    onClose={() => setShowUpload(false)}
                    onSuccess={() => {
                        setShowUpload(false);
                        Swal.fire({
                            icon: "success",
                            title: "Report Uploaded! ✅",
                            text: "Your doctor will be notified and can now view this report.",
                            confirmButtonColor: "#1D9E75",
                        });
                        onUploadSuccess();
                    }}
                />
            )}
        </>
    );
}

function ReportsCard({ onClick }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered ? "var(--color-background-secondary)" : "var(--color-background-primary)",
                border: `0.5px solid ${hovered ? "var(--color-border-secondary)" : "var(--color-border-tertiary)"}`,
                borderRadius: "var(--border-radius-lg)",
                padding: "14px 16px",
                display: "flex", alignItems: "center", gap: 12,
                cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s",
                marginBottom: 20,
            }}
        >
            <div style={{
                width: 38, height: 38, minWidth: 38,
                borderRadius: "var(--border-radius-md)",
                background: "#E6F1FB",
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <FileText size={18} style={{ color: "#185FA5" }} />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>
                    My Reports
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>
                    View all uploaded &amp; doctor-shared reports
                </div>
            </div>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>→</span>
        </div>
    );
}

/* ══════════════════════════════════════════
    Main Dashboard
══════════════════════════════════════════ */
export default function MyHealthDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showLogin, setShowLogin] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [tests, setTests] = useState([]);
    const [activeTab, setActiveTab] = useState("active");
    const [loading, setLoading] = useState(true);

    const phone = user?.phone;
    const patient = { phone: user?.phone, name: user?.name };

    const fetchAll = useCallback(async () => {
        if (!phone) return;
        setLoading(true);
        try {
            const [apptRes, testRes] = await Promise.all([
                api.get(`/api/v1/doctor/appointments/patient/${phone}`),
                api.get(`/api/v1/doctor/test-recommendations/patient/${phone}`),
            ]);
            setAppointments(apptRes.data.data || []);
            setTests(testRes.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [phone]);

    useEffect(() => {
        if (!phone) { setShowLogin(true); return; }
        fetchAll();

        const onFocus = () => fetchAll();
        const onVisible = () => { if (document.visibilityState === "visible") fetchAll(); };

        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onVisible);
        window.addEventListener("appointment-updated", fetchAll);

        return () => {
            window.removeEventListener("focus", onFocus);
            document.removeEventListener("visibilitychange", onVisible);
            window.removeEventListener("appointment-updated", fetchAll);
        };
    }, [phone, fetchAll]);

    if (!user && showLogin) return <LoginModal open onClose={() => navigate("/")} />;

    const active = appointments.filter(a => !["completed", "rejected"].includes(a.status));
    const past = appointments.filter(a => ["completed", "rejected"].includes(a.status));
    const displayed = activeTab === "active" ? active : past;

    return (
        <>
            <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>

                {/* Summary Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginBottom: 24 }}>
                    {[
                        { label: "Total Consultations", value: appointments.length, icon: "📋" },
                        { label: "Recommended Tests", value: tests.length, icon: "🔬" },
                        { label: "Completed", value: past.filter(a => a.status === "completed").length, icon: "✅" },
                    ].map(s => (
                        <div key={s.label} style={{
                            background: "var(--color-background-primary)",
                            border: "0.5px solid var(--color-border-tertiary)",
                            borderRadius: "var(--border-radius-lg)",
                            padding: "14px 12px", textAlign: "center"
                        }}>
                            <div style={{ fontSize: 22 }}>{s.icon}</div>
                            <div style={{ fontSize: 22, fontWeight: 500, color: "var(--color-text-primary)" }}>{s.value}</div>
                            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* My Reports */}
                <ReportsCard onClick={() => navigate("/my-reports")} />

                {/* Appointments */}
                <div style={{
                    background: "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "var(--border-radius-lg)",
                    marginBottom: 20, overflow: "hidden"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                        <CalendarCheck size={16} />
                        <h3 style={{ fontSize: 14, fontWeight: 500 }}>My Appointments</h3>
                        {active.length > 0 && (
                            <span style={{ marginLeft: "auto", fontSize: 11, background: "#E1F5EE", color: "#0F6E56", padding: "2px 8px", borderRadius: 20 }}>
                                {active.length} active
                            </span>
                        )}
                    </div>

                    <div style={{ display: "flex", gap: 6, padding: "10px 16px 0" }}>
                        {["active", "past"].map(t => (
                            <button key={t} onClick={() => setActiveTab(t)} style={{
                                fontSize: 12, padding: "4px 12px", borderRadius: 20,
                                border: "0.5px solid var(--color-border-tertiary)", cursor: "pointer",
                                background: activeTab === t ? "#EEEDFE" : "transparent",
                                color: activeTab === t ? "#534AB7" : "var(--color-text-secondary)",
                                fontWeight: activeTab === t ? 500 : 400
                            }}>
                                {t === "active" ? `Active (${active.length})` : `Past (${past.length})`}
                            </button>
                        ))}
                    </div>

                    <div style={{ padding: "10px 16px" }}>
                        {loading ? (
                            <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Loading...</p>
                        ) : displayed.length === 0 ? (
                            <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", textAlign: "center", padding: "16px 0" }}>
                                {activeTab === "active" ? "No active appointments." : "No past appointments."}
                            </p>
                        ) : (
                            displayed.map(appt => <AppointmentCard key={appt.id} appt={appt} />)
                        )}
                    </div>
                </div>

                {/* Recommended Tests */}
                {tests.length > 0 && (
                    <div style={{
                        background: "var(--color-background-primary)",
                        border: "0.5px solid var(--color-border-tertiary)",
                        borderRadius: "var(--border-radius-lg)",
                        marginBottom: 20, overflow: "hidden"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                            <span style={{ fontSize: 16 }}>🔬</span>
                            <h3 style={{ fontSize: 14, fontWeight: 500 }}>Recommended Tests</h3>
                            <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 500, background: "#E1F5EE", color: "#085041", padding: "3px 10px", borderRadius: 20 }}>
                                {tests.length} {tests.length === 1 ? "test" : "tests"}
                            </span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 16px" }}>
                            {tests.map((test, i) => (
                                <TestCard
                                    key={test.id || i}
                                    test={test}
                                    patient={patient}
                                    onClick={() => navigate("/labs")}
                                    onUploadSuccess={fetchAll}
                                />
                            ))}
                        </div>

                        <div
                            onClick={() => navigate("/labs")}
                            onMouseEnter={e => e.currentTarget.style.background = "#9FE1CB"}
                            onMouseLeave={e => e.currentTarget.style.background = "#E1F5EE"}
                            style={{
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                margin: "0 16px 14px",
                                padding: "11px 16px",
                                background: "#E1F5EE", border: "0.5px solid #5DCAA5",
                                borderRadius: "var(--border-radius-md)",
                                fontSize: 13, fontWeight: 500, color: "#085041",
                                cursor: "pointer",
                            }}
                        >
                            🔬 Book a Lab Test
                        </div>
                    </div>
                )}
                
            </div>
            <Footer />
        </>
    );
}