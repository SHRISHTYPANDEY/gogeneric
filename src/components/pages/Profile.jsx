import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import AppointmentCard from "./AppointmentCard";

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



function MyTests({ userPhone }) {
  const [tests, setTests]     = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();

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

  const getCategoryIcon = (category) => {
    const c = (category || "").toLowerCase();
    if (c.includes("haem") || c.includes("blood")) return "🩸";
    if (c.includes("diab") || c.includes("sugar")) return "🔭";
    if (c.includes("urine") || c.includes("renal")) return "🧫";
    if (c.includes("radio") || c.includes("scan") || c.includes("xray")) return "🩻";
    if (c.includes("cardio") || c.includes("heart")) return "❤️";
    return "🧪";
  };

  return (
    <div className="my-appointments-section" style={{ marginTop: 16 }}>

      {/* Header */}
      <div className="appt-section-header" style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 18 }}>🔬</span>
        <h3>Recommended Tests</h3>
        <span style={{
          marginLeft: "auto", fontSize: 11, fontWeight: 500,
          background: "#E1F5EE", color: "#085041",
          padding: "3px 10px", borderRadius: 20
        }}>
          {tests.length} {tests.length === 1 ? "test" : "tests"}
        </span>
      </div>

      {loading ? (
        <div className="appt-loading">Loading recommended tests...</div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tests.map((test, i) => (
              <div
                key={test.id || i}
                onClick={() => navigate("/labs")}
                style={{
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--border-radius-lg)",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  cursor: "pointer",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#5DCAA5";
                  e.currentTarget.style.background  = "#E1F5EE";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--color-border-tertiary)";
                  e.currentTarget.style.background  = "var(--color-background-primary)";
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
                </div>

                {/* Price + Arrow */}
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
            ))}
          </div>

          {/* Book Button */}
          <div
            onClick={() => navigate("/labs")}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, marginTop: 14, padding: "11px 16px",
              background: "#E1F5EE", border: "0.5px solid #5DCAA5",
              borderRadius: "var(--border-radius-md)",
              fontSize: 13, fontWeight: 500, color: "#085041",
              cursor: "pointer",
            }}
          >
            🔬 Book a Lab Test
          </div>
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
