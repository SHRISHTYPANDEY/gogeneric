import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../api/axiosInstance";
import {
  ShieldCheck,
  LogOut,
  ChevronRight,
  Camera,
  Heart,
  MessageSquare,
  Mail,
  Phone,
  Save,
  Pencil,
} from "lucide-react";
import { useWallet } from "../../context/WalletContext";
import { cleanImageUrl } from "../../utils";
import LoginModal from "../auth/LoginModal";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const { balance } = useWallet();

  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const [loading, setLoading] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setShowLogin(true);
          return;
        }

        const res = await api.get("/api/v1/customer/info", {
          headers: {
            Authorization: `Bearer ${token}`,
            zoneId: JSON.stringify([3]),
            moduleId: 2,
            "X-localization": "en",
          },
        });

        const apiUser = res.data?.data || res.data;
        const normalized = {
          id: apiUser.id,
          email: apiUser.email,
          phone: apiUser.phone,
          name: `${apiUser.f_name || ""} ${apiUser.l_name || ""}`.trim(),
          f_name: apiUser.f_name,
          l_name: apiUser.l_name,
          image: apiUser.image_full_url || apiUser.image || "",
        };

        setUser(normalized);
        setPreviewImage(cleanImageUrl(normalized.image));
        localStorage.setItem("user", JSON.stringify(normalized));
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false); // 🔑 FIX
      }
    };

    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const oRes = await api.get("/api/v1/customer/order/list", {
          headers: {
            Authorization: `Bearer ${token}`,
            zoneId: JSON.stringify([3]),
            moduleId: 2,
          },
          params: { limit: 1, offset: 0 },
        });
        setTotalOrders(oRes.data?.total_size || 0);

        const pRes = await api.get(
          "/api/v1/customer/loyalty-point/transactions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              zoneId: JSON.stringify([3]),
              moduleId: 2,
            },
            params: { limit: 20, offset: 0 },
          }
        );

        const pts = pRes.data?.data || [];
        setLoyaltyPoints(
          pts.reduce(
            (sum, tx) =>
              sum + Number(tx.credit || 0) - Number(tx.debit || 0),
            0
          )
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
    fetchStats();
  }, []);

  /* ================= UPDATE PROFILE ================= */
  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("email", user.email);
      formData.append("f_name", user.f_name || user.name.split(" ")[0]);
      formData.append("l_name", user.l_name || user.name.split(" ")[1] || "");
      formData.append("phone", user.phone || "");
      formData.append("button_type", "profile");
      if (profileImage) formData.append("image", profileImage);

      const res = await api.post(
        "/api/v1/customer/update-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            zoneId: JSON.stringify([3]),
            moduleId: 2,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(res.data?.message || "Profile updated");
      setEditing(false);
    } catch (err) {
      toast.error(
        err?.response?.data?.errors?.[0]?.message || "Update failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER GUARDS ================= */

  // ⛔ Prevent flicker
  if (initialLoading) return null;

  // 🔐 Not logged in
  if (!user && showLogin) {
    return <LoginModal open onClose={() => navigate("/")} />;
  }

  /* ================= UI ================= */
  return (
    <div className="premium-profile-page">
      <div className="premium-hero-header" />

      <div className="premium-container">
        <div className="premium-main-card">
          <div className="premium-avatar-box">
            <div className="premium-avatar-outline">
              <img
                src={previewImage || "https://via.placeholder.com/150"}
                alt="User"
                className="premium-img"
              />

              {editing && (
                <label className="premium-camera-fab">
                  <Camera size={16} />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setProfileImage(file);
                        setPreviewImage(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          {!editing ? (
            <div className="premium-user-meta">
              <h2 className="premium-display-name">{user.name}</h2>
              <div className="premium-contact-info">
                <span>
                  <Mail size={14} /> {user.email}
                </span>
                {user.phone && (
                  <span>
                    <Phone size={14} /> {user.phone}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="premium-edit-form">
              <input
                value={user.name}
                onChange={(e) =>
                  setUser({ ...user, name: e.target.value })
                }
                placeholder="Full Name"
              />
              <input
                value={user.email}
                onChange={(e) =>
                  setUser({ ...user, email: e.target.value })
                }
                placeholder="Email"
              />
              <input
                value={user.phone || ""}
                onChange={(e) =>
                  setUser({ ...user, phone: e.target.value })
                }
                placeholder="Phone"
              />
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
              <button
                className="premium-action-btn"
                onClick={() => setEditing(true)}
              >
                <Pencil size={18} /> Edit Profile
              </button>
            ) : (
              <button
                className="premium-action-btn save"
                onClick={handleProfileUpdate}
                disabled={loading}
              >
                {loading ? "Saving..." : <><Save size={18}/> Save Changes</>}
              </button>
            )}
          </div>
        </div>

        <div className="premium-menu-stack">
          <div className="premium-menu-link">
            <div className="premium-menu-left">
              <div className="p-icon-circle">
                <ShieldCheck size={20} />
              </div>
              <span>Change Password</span>
            </div>
            <ChevronRight size={18} className="opacity-40" />
          </div>

          <div
            className="premium-menu-link danger"
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
          >
            <div className="premium-menu-left">
              <div className="p-icon-circle-red">
                <LogOut size={20} />
              </div>
              <span>Logout Account</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
