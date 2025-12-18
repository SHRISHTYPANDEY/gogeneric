import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../api/axiosInstance";
import { Pencil } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";


export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showChangePassword, setShowChangePassword] = useState(false);
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [showNewPass, setShowNewPass] = useState(false);
const [showConfirmPass, setShowConfirmPass] = useState(false);
const [loading, setLoading] = useState(false);


  /* ================= FETCH USER ================= */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleChangePassword = async () => {
  if (!newPassword || !confirmPassword) {
    toast.error("All fields are required");
    return;
  }

  if (newPassword !== confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  try {
    setLoading(true);

    await api.post("/api/v1/auth/forgot-password", {
      password: newPassword,
      confirm_password: confirmPassword,
    });

    toast.success("Password updated successfully");

    // reset + close modal
    setShowChangePassword(false);
    setNewPassword("");
    setConfirmPassword("");
  } catch (err) {
    console.error("Password error:", err);
    toast.error(
      err?.response?.data?.message || "Failed to update password"
    );
  } finally {
    setLoading(false);
  }
};

  /* ================= FETCH WALLET ================= */
 const fetchWalletBalance = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await api.get(
      "/api/v1/customer/wallet/transactions",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          zoneId: JSON.stringify([3]),
          moduleId: 2,
        },
        params: {
          limit: 100,
          offset: 0,
        },
      }
    );

    console.log("Wallet API FULL RESPONSE:", res.data);

    const transactions = res.data?.transactions || [];

    const total = transactions.reduce(
      (sum, tx) => sum + Number(tx.amount || 0),
      0
    );

    setWalletBalance(total);
  } catch (err) {
    console.error("🔴 Wallet error:");
    console.log("Status:", err?.response?.status);
    console.log("Response:", err?.response?.data);
    toast.error("Failed to fetch wallet balance");
  }
};


  useEffect(() => {
    fetchWalletBalance();
  }, []);

  if (!user) return null;

 return (
  <>
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* ===== PROFILE HEADER ===== */}
      <div className="bg-teal-50 rounded-2xl p-6 flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-teal-200 flex items-center justify-center text-xl font-bold text-teal-800">
            {user?.name?.[0] || "U"}
          </div>

          <div>
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>

        <button
          onClick={() => setEditing(true)}
          className="bg-white shadow p-2 rounded-full"
        >
          <Pencil size={18} className="text-teal-700" />
        </button>
      </div>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Loyalty Points" value="0" />
        <StatCard title="Total Orders" value="0" />
        <StatCard title="Wallet Balance" value={`₹${walletBalance}`} />
      </div>

      {/* ===== PROFILE DETAILS ===== */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h3 className="font-semibold mb-4">Profile Details</h3>

        {editing ? (
          <>
            <Input
              label="Name"
              value={user.name}
              onChange={(e) =>
                setUser({ ...user, name: e.target.value })
              }
            />

            <Input label="Email" value={user.email} disabled />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  localStorage.setItem("user", JSON.stringify(user));
                  setEditing(false);
                  toast.success("Profile updated");
                }}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>

              <button
                onClick={() => setEditing(false)}
                className="border px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        )}
      </div>

      {/* ===== SETTINGS ===== */}
      <div className="bg-white rounded-2xl shadow divide-y">
        <SettingToggle
          label="Notifications"
          value={notifications}
          onChange={setNotifications}
        />

        <SettingItem
          label="Change Password"
          onClick={() => setShowChangePassword(true)}
        />

        <SettingItem
          label="Logout"
          onClick={() => {
            localStorage.clear();
            toast.success("Logged out");
            navigate("/login");
          }}
        />

        <SettingItem
          label="Delete Account"
          danger
          onClick={() => toast.error("Delete account API pending")}
        />
      </div>
    </div>

    {/* ===== CHANGE PASSWORD MODAL ===== */}
    {showChangePassword && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <h2 className="text-lg font-semibold mb-1">Change Password</h2>
          <p className="text-sm text-gray-500 mb-4">
            Enter your new password and confirm password
          </p>

          {/* New Password */}
          <div className="mb-4 relative">
            <label className="text-sm font-medium mb-1 block">
              New Password
            </label>
            <input
              type={showNewPass ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 pr-10"
            />
            <button
              onClick={() => setShowNewPass(!showNewPass)}
              className="absolute right-3 top-9 text-gray-500"
            >
              {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="mb-6 relative">
            <label className="text-sm font-medium mb-1 block">
              Confirm Password
            </label>
            <input
              type={showConfirmPass ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 pr-10"
            />
            <button
              onClick={() => setShowConfirmPass(!showConfirmPass)}
              className="absolute right-3 top-9 text-gray-500"
            >
              {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="flex-1 bg-teal-600 text-white py-2 rounded-lg"
            >
              {loading ? "Updating..." : "Submit"}
            </button>

            <button
              onClick={() => setShowChangePassword(false)}
              className="flex-1 border py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);

}

/* ===== COMPONENTS ===== */

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="mb-3">
      <label className="text-sm font-medium block mb-1">{label}</label>
      <input
        {...props}
        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-gray-100"
      />
    </div>
  );
}

function SettingToggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between p-4">
      <span className="font-medium">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition ${
          value ? "bg-teal-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full transform transition ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function SettingItem({ label, onClick, danger }) {
  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer font-medium ${
        danger ? "text-red-500" : ""
      }`}
    >
      {label}
    </div>
  );
}
