export const getAuthErrorMessage = (err, type = "general") => {
  const data = err?.response?.data;

  if (!data) return "Something went wrong. Please try again.";

  // 🔹 Laravel / API validation errors
  if (data.errors?.length) {
    return data.errors[0].message;
  }

  const msg = data.message?.toLowerCase() || "";

  // 🔐 LOGIN
  if (type === "login") {
    if (msg.includes("user") && msg.includes("not"))
      return "Invalid email or phone number";

    if (msg.includes("password"))
      return "Incorrect password";

    if (msg.includes("inactive") || msg.includes("blocked"))
      return "Your account is inactive. Please contact support.";
  }

  // 📝 SIGNUP
  if (type === "signup") {
    if (msg.includes("phone") && msg.includes("exist"))
      return "Phone number already registered";

    if (msg.includes("email") && msg.includes("exist"))
      return "Email already registered";

    if (msg.includes("password"))
      return "Password does not meet security requirements";
  }

  // 🔑 FORGOT PASSWORD
  if (type === "forgot") {
    if (msg.includes("user") && msg.includes("not"))
      return "Phone number not registered";

    if (msg.includes("otp"))
      return "Failed to send OTP. Try again.";
  }

  // 🔁 OTP / RESET
  if (type === "reset") {
    if (msg.includes("token") || msg.includes("otp"))
      return "Invalid or expired OTP";

    if (msg.includes("password"))
      return "Password reset failed. Try again.";
  }

  return data.message || "Action failed";
};
