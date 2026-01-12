export const openRazorpay = ({
  amount,
  name,
  description,
  phone,
  onSuccess,
}) => {
  if (!window.Razorpay) {
    alert("Razorpay SDK not loaded");
    return;
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: amount * 100,
    currency: "INR",
    name,
    description,
    handler: function (response) {
      onSuccess?.(response);
    },
    prefill: {
      contact: phone,
    },
    theme: {
      color: "#0d6efd",
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};
