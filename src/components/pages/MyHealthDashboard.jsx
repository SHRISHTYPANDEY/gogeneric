import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { CalendarCheck, FileText } from "lucide-react";
import AppointmentCard from "./AppointmentCard";
import LoginModal from "../auth/LoginModal";
import Footer from "../Footer";

const getCategoryIcon = (category) => {
    const c = (category || "").toLowerCase();
    if (c.includes("haem") || c.includes("blood")) return "🩸";
    if (c.includes("diab") || c.includes("sugar")) return "🔭";
    if (c.includes("urine") || c.includes("renal")) return "🧫";
    if (c.includes("radio") || c.includes("scan") || c.includes("xray")) return "🩻";
    if (c.includes("cardio") || c.includes("heart")) return "❤️";
    return "🧪";
};

function TestCard({ test, onClick }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex", alignItems: "center", gap: 14,
                background: hovered ? "#E1F5EE" : "var(--color-background-primary)",
                border: `0.5px solid ${hovered ? "#5DCAA5" : "var(--color-border-tertiary)"}`,
                borderRadius: "var(--border-radius-lg)",
                padding: "12px 14px",
                cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s",
            }}                        
        >
            <div style={{
                width: 40, minWidth: 40, height: 40,
                borderRadius: "var(--border-radius-md)",
                background: "#E1F5EE",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
            }}>
                {getCategoryIcon(test.test_category)}
            </div>

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
            </div>

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
                <span style={{ fontSize: 14, color: "#5DCAA5" }}>→</span>
            </div>
        </div>
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
                    My Lab Reports
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>
                    View all uploaded &amp; doctor-shared reports
                </div>
            </div>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>→</span>
        </div>
    );
}

export default function MyHealthDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showLogin, setShowLogin] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [tests, setTests] = useState([]);
    const [activeTab, setActiveTab] = useState("active");
    const [loading, setLoading] = useState(true);

    const phone = user?.phone;

    useEffect(() => {
        if (!phone) { setShowLogin(true); return; }
        const fetchAll = async () => {
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
        };
        fetchAll();
    }, [phone]);

    if (!user && showLogin) return <LoginModal open onClose={() => navigate("/")} />;

    const active    = appointments.filter(a => !["completed", "rejected"].includes(a.status));
    const past      = appointments.filter(a =>  ["completed", "rejected"].includes(a.status));
    const displayed = activeTab === "active" ? active : past;

    return (
        <>
            <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>

                {/* ── Summary Cards ── */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginBottom: 24 }}>
                    {[
                        { label: "Total Consultations", value: appointments.length, icon: "📋" },
                        { label: "Recommended Tests",   value: tests.length,        icon: "🔬" },
                        { label: "Completed",           value: past.filter(a => a.status === "completed").length, icon: "✅" },
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

                {/* ── My Reports ── */}
                <ReportsCard onClick={() => navigate("/my-reports")} />

                {/* ── Appointments ── */}
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
                                color:      activeTab === t ? "#534AB7" : "var(--color-text-secondary)",
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

                {/* ── Recommended Tests ── */}
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
                                    onClick={() => navigate("/labs")}
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