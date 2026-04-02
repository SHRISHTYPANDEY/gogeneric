import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import api from "../../api/axiosInstance";
import SkeletonText from "../skeleton/SkeletonText";
import SkeletonCard from "../skeleton/SkeletonCard";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "../../context/LocationContext";

import {
  LogOut,
  ChevronRight,
  Camera,
  Mail,
  Phone,
  Save,
  Pencil,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { FaUserAltSlash } from "react-icons/fa";
import { useWallet } from "../../context/WalletContext";
import { cleanImageUrl } from "../../utils";
import LoginModal from "../auth/LoginModal";
import "./Profile.css";
import Footer from "../Footer";

// ─── Appointment Status Steps ─────────────────────────────────────────────────
const STEPS = [
  { key: "booked",    label: "Booked",       icon: "📋" },
  { key: "reviewing", label: "Doctor Review", icon: "👨‍⚕️" },
  { key: "payment",   label: "Payment",       icon: "💳" },
  { key: "confirmed", label: "Confirmed",     icon: "✅" },
  { key: "completed", label: "Completed",     icon: "🎉" },
];

function getStepIndex(appt) {
  const s = appt.status;
  const p = appt.payment_status;
  if (s === "rejected")        return -1;
  if (s === "pending")         return 1;
  if (s === "payment_pending") return 2;
  if (s === "confirmed" || (s === "approved" && p === "paid")) return 3;
  if (s === "completed")       return 4;
  if (s === "approved" && (p === "free" || !p || p === "unpaid")) return 3;
  return 1;
}

function getStatusColor(status) {
  switch (status) {
    case "confirmed":       return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "approved":        return "bg-blue-100 text-blue-700 border-blue-200";
    case "payment_pending": return "bg-orange-100 text-orange-700 border-orange-200";
    case "rejected":        return "bg-red-100 text-red-700 border-red-200";
    case "completed":       return "bg-purple-100 text-purple-700 border-purple-200";
    default:                return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }
}

function getStatusLabel(status) {
  switch (status) {
    case "pending":         return "Awaiting Doctor";
    case "approved":        return "Approved";
    case "payment_pending": return "Payment Pending";
    case "confirmed":       return "Confirmed";
    case "completed":       return "Completed";
    case "rejected":        return "Rejected";
    default:                return status;
  }
}

// ─── Appointment Card ─────────────────────────────────────────────────────────
function AppointmentCard({ appt }) {
  const [open, setOpen] = useState(false);
  const stepIndex  = getStepIndex(appt);
  const isRejected = appt.status === "rejected";
  const isVideo    = appt.consultation_type === "video_call";
  

  return (
    <div className="appt-card">
      <div className="appt-card-header" onClick={() => setOpen(!open)}>
        <div className="appt-card-left">
          <span className="appt-plan-name">{appt.plan_name}</span>
          <span className="appt-date">📅 {appt.appointment_date} &nbsp;·&nbsp; ⏰ {appt.time_slot}</span>
        </div>
        <div className="appt-card-right">
          <span className={`appt-status-badge ${getStatusColor(appt.status)}`}>{getStatusLabel(appt.status)}</span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {open && (
        <div className="appt-card-body">
          {!isRejected ? (
            <div className="appt-tracker">
              {STEPS.map((step, i) => {
                const done    = i <= stepIndex;
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
          
          {appt.status === "payment_pending" && (
            <a href={`/pay/appointment/${appt.id}`} className="appt-pay-btn">
              💳 Pay Now — ₹{Number(appt.plan_price).toLocaleString("en-IN")}
            </a>
          )}
          {appt.status === "completed" && (
  <ReviewSection appt={appt} />
)}
        </div>
      
      
      )}
    </div>
  );
}

function ReviewSection({ appt }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    checkReview();
  }, []);

  const checkReview = async () => {
    try {
      const res = await api.get(`/api/v1/doctor/reviews/check/${appt.id}`);
      if (res.data.has_reviewed) {
        setAlreadyReviewed(true);
      }
    } catch (err) {
      console.error("Check review error", err);
    }
  };

  const submitReview = async () => {
    if (!rating) {
      Swal.fire("Error", "Please select rating", "error");
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/v1/doctor/reviews", {
        doctor_id: appt.doctor_id,
        appointment_id: appt.id,
        patient_name: appt.patient_name,
        patient_phone: appt.patient_phone,
        rating,
        review,
      });

      Swal.fire("Success", "Review submitted!", "success");
      setAlreadyReviewed(true);
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || "Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Already reviewed UI
  if (alreadyReviewed) {
    return (
      <div className="review-box">
        ⭐ You have already submitted a review
      </div>
    );
  }

  return (
    <div className="review-box">
      <h4>⭐ Rate Your Experience</h4>

      {/* ⭐ Star Rating */}
      <div className="star-rating">
        {[1,2,3,4,5].map((star) => (
          <span
            key={star}
            onClick={() => setRating(star)}
            style={{
              cursor: "pointer",
              fontSize: "20px",
              color: star <= rating ? "#f59e0b" : "#d1d5db"
            }}
          >
            ★
          </span>
        ))}
      </div>

      {/* 📝 Review */}
      <textarea
        placeholder="Write your review (optional)"
        value={review}
        onChange={(e) => setReview(e.target.value)}
      />

      <button
        className="appt-pay-btn"
        onClick={submitReview}
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}


// ─── My Appointments ──────────────────────────────────────────────────────────
function MyAppointments({ userPhone }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState("active");

  useEffect(() => {
    const fetchData = async () => {
      if (!userPhone) return;
      try {
        const res = await api.get(`/api/v1/doctor/appointments/patient/${userPhone}`);
        setAppointments(res.data.data || []);
      } catch (err) {
        console.error("Appointments fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userPhone]);

  const active    = appointments.filter(a => !["completed", "rejected"].includes(a.status));
  const past      = appointments.filter(a =>  ["completed", "rejected"].includes(a.status));
  const displayed = activeTab === "active" ? active : past;

  return (
    <div className="my-appointments-section">
      <div className="appt-section-header">
        <CalendarCheck size={18} className="text-indigo-600" />
        <h3>My Appointments</h3>
      </div>
      <div className="appt-tabs">
        <button className={`appt-tab ${activeTab === "active" ? "active" : ""}`} onClick={() => setActiveTab("active")}>
          Active {active.length > 0 && <span className="appt-tab-badge">{active.length}</span>}
        </button>
        <button className={`appt-tab ${activeTab === "past" ? "active" : ""}`} onClick={() => setActiveTab("past")}>
          Past
        </button>
      </div>
      {loading ? (
        <div className="appt-loading">Loading appointments...</div>
      ) : displayed.length === 0 ? (
        <div className="appt-empty">
          {activeTab === "active" ? "No active appointments. Book a consultation!" : "No past appointments."}
        </div>
      ) : (
        <div className="appt-list">
          {displayed.map(appt => <AppointmentCard key={appt.id} appt={appt} />)}
        </div>
      )}
    </div>
  );
}

// ─── My Recommended Tests ─────────────────────────────────────────────────────
function MyTests({ userPhone }) {
  const [tests, setTests]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userPhone) return;
      try {
        const res = await api.get(`/api/v1/doctor/test-recommendations/patient/${userPhone}`);
        setTests(res.data.data || []);
      } catch (err) {
        console.error("Tests fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userPhone]);

  if (!loading && tests.length === 0) return null;

  return (
    <div className="my-appointments-section" style={{ marginTop: 16 }}>
      <div className="appt-section-header">
        <span style={{ fontSize: 18 }}>🔬</span>
        <h3>Recommended Tests</h3>
      </div>

      {loading ? (
        <div className="appt-loading">Loading recommended tests...</div>
      ) : (
        <>
          <div className="appt-list">
            {tests.map((test, i) => (
              <div key={test.id || i} className="appt-card">
                <div className="appt-card-header" style={{ cursor: "default" }}>
                  <div className="appt-card-left">
                    <span className="appt-plan-name">🧪 {test.test_name}</span>
                    <span className="appt-date">
                      📂 {test.test_category || "Lab Test"}
                      {test.test_price ? ` · ₹${Number(test.test_price).toLocaleString("en-IN")}` : ""}
                    </span>
                    {test.note && (
                      <span className="appt-date" style={{ marginTop: 2, color: "#6b7280" }}>
                        📝 {test.note}
                      </span>
                    )}
                    <span className="appt-date" style={{ color: "#9ca3af", fontSize: "0.7rem" }}>
                      🗓 {new Date(test.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div className="appt-card-right">
                    <span className="appt-status-badge bg-indigo-100 text-indigo-700 border-indigo-200">
                      Recommended
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <a
            href="/labs"
            className="appt-pay-btn"
            style={{ marginTop: 12, display: "block", textAlign: "center", textDecoration: "none" }}
          >
            🔬 Book a Lab Test
          </a>
        </>
      )}
    </div>
  );
}

// ─── Main Profile ─────────────────────────────────────────────────────────────
export default function Profile() {
  const navigate = useNavigate();
  const { balance } = useWallet();

  const [user, setUser]                             = useState(null);
  const [showLogin, setShowLogin]                   = useState(false);
  const [initialLoading, setInitialLoading]         = useState(true);
  const [editing, setEditing]                       = useState(false);
  const [profileImage, setProfileImage]             = useState(null);
  const [previewImage, setPreviewImage]             = useState("");
  const [loading, setLoading]                       = useState(false);
  const [loyaltyPoints, setLoyaltyPoints]           = useState(0);
  const [totalOrders, setTotalOrders]               = useState(0);
  const [showPasswordModal, setShowPasswordModal]   = useState(false);
  const [oldPassword, setOldPassword]               = useState("");
  const [newPassword, setNewPassword]               = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPwd, setShowPwd]                       = useState(false);
  const [showEditModal, setShowEditModal]           = useState(false);
  const { logout }        = useAuth();
  const { resetLocation } = useLocation();

  const showAlert = (icon, title, text, timer = null) => {
    Swal.fire({ icon, title, text, confirmButtonColor: "#016B61", timer, showConfirmButton: !timer });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { setShowLogin(true); return; }
        const res = await api.get("/api/v1/customer/info", {
          headers: { Authorization: `Bearer ${token}`, zoneId: JSON.stringify([3]), moduleId: 2, "X-localization": "en" },
        });
        const apiUser = res.data?.data || res.data;
        const normalized = {
          id: apiUser.id, email: apiUser.email, phone: apiUser.phone,
          name: `${apiUser.f_name || ""} ${apiUser.l_name || ""}`.trim(),
          f_name: apiUser.f_name, l_name: apiUser.l_name,
          image: apiUser.image_full_url || apiUser.image || "",
        };
        setUser(normalized);
        setPreviewImage(cleanImageUrl(normalized.image));
        localStorage.setItem("user", JSON.stringify(normalized));
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };

    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const oRes = await api.get("/api/v1/customer/order/list", {
          headers: { Authorization: `Bearer ${token}`, zoneId: JSON.stringify([3]), moduleId: 2 },
          params: { limit: 1, offset: 0 },
        });
        setTotalOrders(oRes.data?.total_size || 0);
        const pRes = await api.get("/api/v1/customer/loyalty-point/transactions", {
          headers: { Authorization: `Bearer ${token}`, zoneId: JSON.stringify([3]), moduleId: 2 },
          params: { limit: 20, offset: 0 },
        });
        const pts = pRes.data?.data || [];
        setLoyaltyPoints(pts.reduce((sum, tx) => sum + Number(tx.credit || 0) - Number(tx.debit || 0), 0));
      } catch (err) { console.error(err); }
    };

    fetchProfile();
    fetchStats();
  }, []);

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("⚠️ Are you sure? This will permanently delete your account.");
    if (!confirmDelete) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete("/api/v1/customer/remove-account", {
        headers: { Authorization: `Bearer ${token}`, zoneId: JSON.stringify([3]), moduleId: 2 },
      });
      showAlert("success", "Deleted", "Account deleted successfully", 2000);
      localStorage.clear(); navigate("/");
    } catch (err) {
      showAlert("error", "Failed", err?.response?.data?.message || "Failed to delete account");
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("email", user.email);
      formData.append("phone", user.phone || "");
      formData.append("f_name", user.f_name || user.name.split(" ")[0]);
      formData.append("l_name", user.l_name || "");
      formData.append("button_type", "profile");
      if (profileImage) formData.append("image", profileImage);
      const res = await api.post("/api/v1/customer/update-profile", formData, {
        headers: { Authorization: `Bearer ${token}`, zoneId: JSON.stringify([3]), moduleId: 2, "Content-Type": "multipart/form-data" },
      });
      showAlert("success", "Updated", res.data?.message || "Profile updated", 2000);
      setEditing(false);
    } catch (err) {
      showAlert("error", "Update Failed", err?.response?.data?.errors?.[0]?.message || "Update failed");
    } finally { setLoading(false); }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) { showAlert("warning", "Required", "All fields are required"); return; }
    if (newPassword !== confirmNewPassword) { showAlert("error", "Mismatch", "Passwords do not match"); return; }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await api.put("/api/v1/auth/reset-password",
        { name: user.name, email: user.email, phone: user.phone, old_password: oldPassword, password: newPassword, password_confirmation: confirmNewPassword },
        { headers: { Authorization: `Bearer ${token}`, zoneId: JSON.stringify([3]), moduleId: 2 } }
      );
      showAlert("success", "Success", "Password changed successfully", 2000);
      setOldPassword(""); setNewPassword(""); setConfirmNewPassword("");
      setShowPasswordModal(false);
      logout(); navigate("/login");
    } catch (err) {
      showAlert("error", "Failed", err?.response?.data?.message || "Password update failed");
    } finally { setLoading(false); }
  };

  if (initialLoading) {
    return (
      <div className="premium-profile-page">
        <div className="premium-container">
          <div className="premium-main-card">
            <div className="premium-avatar-box"><SkeletonCard height="120px" width="120px" /></div>
            <div className="premium-user-meta">
              <SkeletonText width="180px" height="24px" />
              <SkeletonText width="220px" height="16px" />
              <SkeletonText width="160px" height="16px" />
            </div>
            <div className="premium-stats-bar"><SkeletonCard height="60px" /></div>
          </div>
          <div className="premium-menu-stack">
            {[1,2].map(i => <SkeletonCard key={i} height="50px" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!user && showLogin) return <LoginModal open onClose={() => navigate("/")} />;

  return (
    <>
      <div className="premium-profile-page">
        <div className="premium-hero-header" />
        <div className="premium-container">

          {/* ── Main Card ── */}
          <div className="premium-main-card">
            <div className="premium-avatar-box">
              <div className="premium-avatar-outline">
                <img src={previewImage || "https://via.placeholder.com/150"} alt="User" className="premium-img" />
                {editing && (
                  <label className="premium-camera-fab">
                    <Camera size={16} />
                    <input type="file" hidden accept="image/*" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) { setProfileImage(file); setPreviewImage(URL.createObjectURL(file)); }
                    }} />
                  </label>
                )}
              </div>
            </div>

            {!editing ? (
              <div className="premium-user-meta">
                <h2 className="premium-display-name">{user.name}</h2>
                <div className="premium-contact-info">
                  <span><Mail size={14} /> {user.email}</span>
                  {user.phone && <span><Phone size={14} /> {user.phone}</span>}
                </div>
              </div>
            ) : (
              <div className="premium-edit-form">
                <input value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} placeholder="Full Name" />
                <input value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} placeholder="Email" />
                <input value={user.phone || ""} onChange={(e) => setUser({ ...user, phone: e.target.value })} placeholder="Phone" />
              </div>
            )}

            <div className="premium-stats-bar">
              <div className="p-stat-box">
                <span className="p-stat-val">{loyaltyPoints}</span>
                <span className="p-stat-lbl">Loyalty Points</span>
              </div>
              <div className="p-stat-divider" />
              <div className="p-stat-box">
                <span className="p-stat-val">{totalOrders}</span>
                <span className="p-stat-lbl">Total Orders</span>
              </div>
              <div className="p-stat-divider" />
              <div className="p-stat-box">
                <span className="p-stat-val">₹{balance}</span>
                <span className="p-stat-lbl">Wallet Balance</span>
              </div>
            </div>

            <div className="premium-footer-btns">
              {!editing ? (
                <button className="premium-action-btn" onClick={() => setShowEditModal(true)}>
                  <Pencil size={18} /> Edit Profile
                </button>
              ) : (
                <button className="premium-action-btn save" onClick={handleProfileUpdate} disabled={loading}>
                  {loading ? "Saving..." : <><Save size={18} /> Save Changes</>}
                </button>
              )}
            </div>
          </div>

          {/* ── MY APPOINTMENTS ── */}
          {user?.phone && <MyAppointments userPhone={user.phone} />}

          {/* ── MY RECOMMENDED TESTS ── */}
          {user?.phone && <MyTests userPhone={user.phone} />}

          {/* ── Menu Stack ── */}
          <div className="premium-menu-stack">
            <div className="premium-menu-link danger" onClick={() => { resetLocation(); logout(); navigate("/"); }}>
              <div className="premium-menu-left">
                <div className="p-icon-circle-red"><LogOut size={20} /></div>
                <span>Logout Account</span>
              </div>
              <ChevronRight size={18} className="opacity-40" />
            </div>
            <div className="premium-menu-link danger" onClick={handleDeleteAccount}>
              <div className="premium-menu-left">
                <div className="p-icon-circle-red"><FaUserAltSlash size={18} /></div>
                <span>Delete Account</span>
              </div>
              <ChevronRight size={18} className="opacity-40" />
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="password-modal-overlay">
          <div className="password-modal">
            <h3>Change Password</h3>
            <div className="password-input"><input type={showPwd ? "text" : "password"} placeholder="Old Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} /></div>
            <div className="password-input"><input type={showPwd ? "text" : "password"} placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
            <div className="password-input"><input type={showPwd ? "text" : "password"} placeholder="Confirm New Password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} /></div>
            <div className="password-actions">
              <label className="show-password"><input type="checkbox" checked={showPwd} onChange={() => setShowPwd(!showPwd)} /> Show Password</label>
              <div className="btn-group">
                <button className="btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleChangePassword} disabled={loading}>{loading ? "Updating..." : "Update Password"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="edit-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Profile</h3>
            <div className="edit-avatar">
              <img src={previewImage || "https://via.placeholder.com/150"} alt="preview" />
              <label className="edit-image-btn">
                <Camera size={16} />
                <input type="file" hidden accept="image/*" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) { setProfileImage(file); setPreviewImage(URL.createObjectURL(file)); }
                }} />
              </label>
            </div>
            <input value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} placeholder="Full Name" />
            <input value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} placeholder="Email" />
            <input value={user.phone || ""} onChange={(e) => setUser({ ...user, phone: e.target.value })} placeholder="Phone" />
            <div className="edit-modal-actions">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={async () => { await handleProfileUpdate(); setShowEditModal(false); }} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
