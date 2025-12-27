import { useState } from "react";
import "./LoginModal.css";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, Mail, Phone, User, Lock, ArrowLeft } from "lucide-react";

export default function LoginModal({ onClose }) {
  const [isSignup, setIsSignup] = useState(false);
  const [isForgot, setIsForgot] = useState(false);

  const [forgotValue, setForgotValue] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login } = useAuth();

  const resetFields = () => {
    setPassword("");
    setConfirmPassword("");
  };

  /* ================= ALL LOGIC FUNCTIONS (UNCHANGED) ================= */
  const handleSignup = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
    if (!/^\+91\d{10}$/.test(formattedPhone)) {
      toast.error("Phone must be 10 digits");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error("Password must be at least 8 characters and include uppercase, lowercase, number & special character");
      return;
    }
    try {
      const res = await api.post("/api/v1/auth/sign-up", { name, email, phone: formattedPhone, password });
      const apiUser = res.data?.data;
      const normalizedUser = { id: apiUser?.id, name: apiUser?.name, email: apiUser?.email, phone: apiUser?.phone };
      login(normalizedUser, res.data?.token || null);
      toast.success("Signup successful!");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Signup failed");
    }
  };

  const handleGuestLogin = async () => {
    try {
      const res = await api.post("/api/v1/auth/guest/request");
      const guestId = res.data?.guest_id || res.data?.data?.guest_id || res.data?.id;
      const token = res.data?.token || null;
      if (!guestId) { toast.error("Guest login failed"); return; }
      localStorage.setItem("guest_id", guestId);
      const guestUser = { id: guestId, name: "Guest User", email: null, phone: null, isGuest: true };
      login(guestUser, token);
      toast.success("Logged in as Guest");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Guest login failed");
    }
  };

  const handleLogin = async () => {
    if (!identifier || !password) { toast.error("Email/Phone & Password required"); return; }
    const guestId = localStorage.getItem("guest_id");
    const isEmail = identifier.includes("@");
    const formattedIdentifier = isEmail ? identifier : identifier.startsWith("+91") ? identifier : `+91${identifier}`;
    try {
      const res = await api.post("/api/v1/auth/login", {
        login_type: "manual",
        email_or_phone: formattedIdentifier,
        field_type: isEmail ? "email" : "phone",
        password,
        guest_id: guestId,
      });
      const apiUser = res.data?.user || res.data;
      const normalizedUser = { id: apiUser?.id, name: apiUser?.name || "", email: apiUser?.email, phone: apiUser?.phone || null };
      login(normalizedUser, res.data?.token);
      toast.success(`Welcome ${normalizedUser.name}`);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotValue) { toast.error("Email or phone is required"); return; }
    try {
      await api.post("/api/v1/auth/forgot-password", {
        email_or_phone: forgotValue,
        field_type: forgotValue.includes("@") ? "email" : "phone",
      });
      toast.success("Reset link / OTP sent successfully 📩");
      setForgotValue("");
      setIsForgot(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send reset link");
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <span className="close-icon" onClick={onClose}>×</span>

        {/* 🔹 LEFT BRAND PANEL (Dribbble Inspired) */}
        <div className="login-left">
          <div className="brand-content">
            <h1>GoGeneric</h1>
            <p>Healthcare Simplified. Get genuine medicines delivered to your home.</p>
            <div className="brand-badge">💊 Verified Quality</div>
          </div>
        </div>

        {/* 🔹 RIGHT FORM PANEL */}
        <div className="login-right">
          {isForgot ? (
            <div className="form-content">
              <div className="back-nav" onClick={() => setIsForgot(false)}>
                <ArrowLeft size={16} /> Back to login
              </div>
              <h2 className="title">Reset Password</h2>
              <p className="subtext">Enter your email or phone to receive a link.</p>
              
              <div className="input-group">
                <Mail className="input-icon" size={18} />
                <input
                  className="input"
                  placeholder="Email or Phone"
                  value={forgotValue}
                  onChange={(e) => setForgotValue(e.target.value)}
                />
              </div>

              <button className="submit-btn" onClick={handleForgotPassword}>
                Send Reset Link
              </button>
            </div>
          ) : isSignup ? (
            <div className="form-content">
              <h2 className="title">Create Account</h2>
              <p className="subtext">Fill in the details to get started.</p>

              <div className="input-group">
                <User className="input-icon" size={18} />
                <input className="input" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="input-group">
                <Mail className="input-icon" size={18} />
                <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="input-group">
                <Phone className="input-icon" size={18} />
                <input className="input" placeholder="Phone" value={phone} maxLength={10} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} />
              </div>

              <div className="input-group">
                <Lock className="input-icon" size={18} />
                <input className="input" type={showSignupPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <span className="eye-toggle" onClick={() => setShowSignupPassword(!showSignupPassword)}>
                  {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>

              <div className="input-group">
                <Lock className="input-icon" size={18} />
                <input className="input" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <span className="eye-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>

              <button className="submit-btn" onClick={handleSignup}>Signup</button>
              <p className="switch-text">Member? <span onClick={() => { setIsSignup(false); resetFields(); }}>Login</span></p>
            </div>
          ) : (
            <div className="form-content">
              <h2 className="title">Welcome Back</h2>
              <p className="subtext">Log in to your account to continue shopping.</p>

              <div className="input-group">
                <Mail className="input-icon" size={18} />
                <input className="input" placeholder="Email or Phone" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
              </div>

              <div className="input-group">
                <Lock className="input-icon" size={18} />
                <input className="input" type={showLoginPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <span className="eye-toggle" onClick={() => setShowLoginPassword(!showLoginPassword)}>
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>

              <p className="forgot-link" onClick={() => setIsForgot(true)}>Forgot Password?</p>
              
              <button className="submit-btn" onClick={handleLogin}>Login</button>
              
              <button className="guest-btn-outline" onClick={handleGuestLogin}>Continue as Guest</button>

              <p className="switch-text">New here? <span onClick={() => { setIsSignup(true); resetFields(); }}>Signup</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}