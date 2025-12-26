import { useState } from "react";
import "./LoginModal.css";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

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

  /* ================= SIGNUP ================= */
  const handleSignup = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    const formattedPhone = phone.startsWith("+91")
  ? phone
  : `+91${phone}`;

if (!/^\+91\d{10}$/.test(formattedPhone)) {
  toast.error("Phone must be 10 digits");
  return;
}


    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be at least 8 characters and include uppercase, lowercase, number & special character"
      );
      return;
    }

    try {
      const res = await api.post("/api/v1/auth/sign-up", {
        name,
        email,
        phone:formattedPhone,
        password,
      });

      const apiUser = res.data?.data;

      const normalizedUser = {
        id: apiUser?.id,
        name: apiUser?.name,
        email: apiUser?.email,
        phone: apiUser?.phone, // ✅ always saved
      };

      login(normalizedUser, res.data?.token || null);
      toast.success("Signup successful!");
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.errors?.[0]?.message ||
          "Signup failed"
      );
    }
  };

  /* ================= GUEST LOGIN ================= */
const handleGuestLogin = async () => {
  try {
    const res = await api.post("/api/v1/auth/guest/request");

    const guestId =
      res.data?.guest_id ||
      res.data?.data?.guest_id ||
      res.data?.id;

    const token = res.data?.token || null;

    if (!guestId) {
      toast.error("Guest login failed");
      return;
    }

    // ✅ Save guest id for cart merge later
    localStorage.setItem("guest_id", guestId);

    const guestUser = {
      id: guestId,
      name: "Guest User",
      email: null,
      phone: null,
      isGuest: true,
    };

    login(guestUser, token);

    toast.success("Logged in as Guest");
    onClose();
  } catch (err) {
    toast.error(
      err?.response?.data?.message || "Guest login failed"
    );
  }
};
  /* ================= LOGIN ================= */
const handleLogin = async () => {
  if (!identifier || !password) {
    toast.error("Email/Phone & Password required");
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

    const normalizedUser = {
      id: apiUser?.id,
      name: apiUser?.name || "",
      email: apiUser?.email,
      phone: apiUser?.phone || null,
    };

    login(normalizedUser, res.data?.token);

    toast.success(`Welcome ${normalizedUser.name}`);
    onClose();
  } catch (err) {
    console.log("LOGIN ERROR FULL:", err.response?.data);
    toast.error(
      err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.message ||
        "Login failed"
    );
  }
};
  /* ================= FORGOT PASSWORD ================= */
  const handleForgotPassword = async () => {
    if (!forgotValue) {
      toast.error("Email or phone is required");
      return;
    }

    try {
      await api.post("/api/v1/auth/forgot-password", {
        email_or_phone: forgotValue,
        field_type: forgotValue.includes("@") ? "email" : "phone",
      });

      toast.success("Reset link / OTP sent successfully 📩");
      setForgotValue("");
      setIsForgot(false);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.errors?.[0]?.message ||
          "Failed to send reset link"
      );
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-box">
        <span className="close-icon" onClick={onClose}>×</span>

        {isForgot ? (
          <>
            <h2 className="title">Reset Password</h2>

            <input
              className="input"
              placeholder="Enter email or phone"
              value={forgotValue}
              onChange={(e) => setForgotValue(e.target.value)}
            />

            <button className="submit-btn" onClick={handleForgotPassword}>
              Send Reset Link
            </button>

            <p className="switch-text">
              Remember password?
              <span onClick={() => setIsForgot(false)}> Login</span>
            </p>
          </>
        ) : isSignup ? (
          <>
            <h2 className="title">Create an Account</h2>

            <input
              className="input"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

           <input
  className="input"
  placeholder="Phone (10 digits)"
  value={phone}
  maxLength={10}
  onChange={(e) => {
    const val = e.target.value.replace(/\D/g, "");
    setPhone(val);
  }}
/>
            <div className="password-wrapper">
              <input
                className="input"
                type={showSignupPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="eye-icon"
                onClick={() => setShowSignupPassword(!showSignupPassword)}
              >
                {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <div className="password-wrapper">
              <input
                className="input"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                className="eye-icon"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
            <button className="submit-btn" onClick={handleSignup}>
              Signup
            </button>
            <p className="switch-text">
              Already have an account?
              <span onClick={() => { setIsSignup(false); resetFields(); }}>
                {" "}Login
              </span>
            </p>
          </>
        ) : (
          <>
            <h2 className="title">Welcome Back</h2>

            <input
              className="input"
              placeholder="Email or Phone"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <div className="password-wrapper">
              <input
                className="input"
                type={showLoginPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="eye-icon"
                onClick={() =>
                  setShowLoginPassword(!showLoginPassword)
                }
              >
                {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <button className="submit-btn" onClick={handleLogin}>
              Login
            </button>
            <button
  className="guest-btn"
  onClick={handleGuestLogin}
>
  Continue as Guest
</button>
            <p className="forgot-text" onClick={() => setIsForgot(true)}>
              Forgot Password?
            </p>

            <p className="switch-text">
              Don’t have an account?
              <span onClick={() => { setIsSignup(true); resetFields(); }}>
                {" "}Signup
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
