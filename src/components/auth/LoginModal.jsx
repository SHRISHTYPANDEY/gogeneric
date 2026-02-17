import { useState } from "react";
import "./LoginModal.css";
import api from "../../api/axiosInstance";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, Mail, Phone, User, Lock, ArrowLeft } from "lucide-react";

const showAlert = (icon, title, text = "") => {
  Swal.fire({
    icon,
    title,
    text,
    showConfirmButton: false,
    timer: 2200,
    backdrop: "rgba(0,0,0,0.6)",

    customClass: {
      popup: "gg-swal-popup",
      backdrop: "gg-swal-backdrop",
    },
  });
};

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

  const [isReset, setIsReset] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const { login } = useAuth();

  const resetFields = () => {
    setPassword("");
    setConfirmPassword("");
  };

  const handleSignup = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      showAlert("error", "Missing Fields", "All fields are required");
      return;
    }

    const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
    if (!/^\+91\d{10}$/.test(formattedPhone)) {
      showAlert("error", "Invalid Phone", "Phone must be 10 digits");
      return;
    }

    if (password !== confirmPassword) {
      showAlert("error", "Password Mismatch");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      showAlert(
        "error",
        "Weak Password",
        "Use uppercase, lowercase, number & special character"
      );
      return;
    }

    try {
      await api.post("/api/v1/auth/sign-up", {
        name,
        email,
        phone: formattedPhone,
        password,
      });

      showAlert("success", "Signup Successful", "Please login to continue");
      setIsSignup(false);
      resetFields();
    } catch (err) {
      const errors = err?.response?.data?.errors;
      showAlert(
        "error",
        "Signup Failed",
        errors?.[0]?.message || err?.response?.data?.message
      );
    }
  };

  const handleLogin = async () => {
    if (!identifier || !password) {
      showAlert("error", "Missing Credentials");
      return;
    }

    const guestId = localStorage.getItem("guest_id");
    const isEmail = identifier.includes("@");
    const formattedIdentifier = isEmail
      ? identifier
      : identifier.startsWith("+91")
      ? identifier
      : `+91${identifier}`;

    try {
      const res = await api.post("/api/v1/auth/login", {
        login_type: "manual",
        email_or_phone: formattedIdentifier,
        field_type: isEmail ? "email" : "phone",
        password,
        guest_id: guestId,
      });

      const apiUser = res.data?.user || res.data;
      login(
        {
          id: apiUser?.id,
          name: apiUser?.name || "",
          email: apiUser?.email,
          phone: apiUser?.phone || null,
        },
        res.data?.token
      );

      showAlert("success", "Welcome Back", apiUser?.name);
      localStorage.setItem("location_allowed", "true");
      onClose();
    } catch (err) {
      showAlert(
        "error",
        "Login Failed",
        err?.response?.data?.message || "Invalid credentials"
      );
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotValue) {
      showAlert("error", "Phone Required");
      return;
    }

    const phone = forgotValue.startsWith("+91")
      ? forgotValue
      : `+91${forgotValue}`;

    try {
      await api.post("/api/v1/auth/forgot-password", { phone });
      showAlert("success", "OTP Sent");
      setIsReset(true);
    } catch (err) {
      const errors = err?.response?.data?.errors;
      showAlert(
        "error",
        "Failed",
        errors?.[0]?.message || err?.response?.data?.message
      );
    }
  };

  const handleResetPassword = async () => {
    if (!forgotValue || !otp || !newPassword || !confirmNewPassword) {
      showAlert("error", "All fields are required");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showAlert("error", "Password Mismatch");
      return;
    }

    try {
      await api.put("/api/v1/auth/reset-password", {
        phone: `+91${forgotValue}`,
        reset_token: otp,
        password: newPassword,
        confirm_password: confirmNewPassword,
      });

      showAlert("success", "Password Reset Successful");
      setIsReset(false);
      setIsForgot(false);
    } catch (err) {
      const errors = err?.response?.data?.errors;
      showAlert(
        "error",
        "Reset Failed",
        errors?.[0]?.message || err?.response?.data?.message
      );
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <span className="close-icon" onClick={onClose}>
          ×
        </span>

        <div className="login-left">
          <div className="brand-content">
            <h1>GoGeneric</h1>
            <p>
              Healthcare Simplified. Get genuine medicines delivered to your
              home.
            </p>
            <div className="brand-badge">💊 Verified Quality</div>
          </div>
        </div>

        <div className="login-right">
          {isForgot && !isReset ? (
            <div className="form-content">
              <div className="back-nav" onClick={() => setIsForgot(false)}>
                <ArrowLeft size={16} /> Back to login
              </div>

              <h2 className="title">Forgot Password</h2>
              <p className="subtext">
                Enter registered phone number to receive OTP
              </p>

              <div className="input-group">
                <Mail className="input-icon" size={18} />
                <input
                  className="input"
                  placeholder="Phone Number"
                  value={forgotValue}
                  onChange={(e) =>
                    setForgotValue(e.target.value.replace(/\D/g, ""))
                  }
                />
              </div>

              <button className="submit-btn" onClick={handleForgotPassword}>
                Send OTP
              </button>
            </div>
          ) : isReset ? (
            <div className="form-content">
              <h2 className="title">Reset Password</h2>

              <div className="input-group">
                <Lock className="input-icon" size={18} />
                <input
                  className="input"
                  placeholder="OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              <div className="input-group">
                <Lock className="input-icon" size={18} />
                <input
                  className="input"
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="input-group">
                <Lock className="input-icon" size={18} />
                <input
                  className="input"
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>

              <button className="submit-btn" onClick={handleResetPassword}>
                Reset Password
              </button>
            </div>
          ) : isSignup ? (
            <div className="form-content">
              <h2 className="title">Create Account</h2>
              <p className="subtext">Fill in the details to get started.</p>

              <div className="input-group">
                <User className="input-icon" size={18} />
                <input
                  className="input"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="input-group">
                <Mail className="input-icon" size={18} />
                <input
                  className="input"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="input-group">
                <Phone className="input-icon" size={18} />
                <input
                  className="input"
                  placeholder="Phone"
                  value={phone}
                  maxLength={10}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              <div className="input-group">
                <Lock className="input-icon" size={18} />
                <input
                  className="input"
                  type={showSignupPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  className="eye-toggle"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                >
                  {showSignupPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </span>
              </div>

              <div className="input-group">
                <Lock className="input-icon" size={18} />
                <input
                  className="input"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <span
                  className="eye-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </span>
              </div>

              <button className="submit-btn" onClick={handleSignup}>
                Signup
              </button>
              <p className="switch-text">
                Member?{" "}
                <span
                  onClick={() => {
                    setIsSignup(false);
                    resetFields();
                  }}
                >
                  Login
                </span>
              </p>
            </div>
          ) : (
            <div className="form-content">
              <h2 className="title">Welcome Back</h2>
              <p className="subtext">
                Log in to your account to continue shopping.
              </p>

              <div className="input-group">
                <Mail className="input-icon" size={18} />
                <input
                  className="input"
                  placeholder="Email or Phone"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>

              <div className="input-group">
                <Lock className="input-icon" size={18} />
                <input
                  className="input"
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  className="eye-toggle"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>

              <p className="forgot-link" onClick={() => setIsForgot(true)}>
                Forgot Password?
              </p>

              <button className="submit-btn" onClick={handleLogin}>
                Login
              </button>

              <p className="switch-text">
                New here?{" "}
                <span
                  onClick={() => {
                    setIsSignup(true);
                    resetFields();
                  }}
                >
                  Signup
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
