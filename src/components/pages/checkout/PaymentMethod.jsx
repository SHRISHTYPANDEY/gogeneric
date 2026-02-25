import { useState } from "react";
import "./PaymentMethod.css";

export default function PaymentMethod({
  value,
  onChange,
  walletBalance = 0,
  orderAmount = 0,
}) {
  const [open, setOpen] = useState(false);

  // Wallet disabled if balance is less than ₹25
  const isWalletDisabled = walletBalance < 25;

  const methods = [
    { key: "cash_on_delivery", label: "Cash on Delivery" },
    { key: "digital_payment", label: "Pay Online" },
    {
  key: "wallet",
  label: "Wallet (₹25 auto-applied)",
  disabled: true, // cannot select again
}
  ];

  return (
    <div className="checkout-card">
      <button
        type="button"
        className="pay-using-toggle"
        onClick={() => setOpen(!open)}
      >
        Pay Using{" "}
        {value && `• ${methods.find((m) => m.key === value)?.label}`}
      </button>

      {open && (
        <div className="payment-options">
          {methods.map((m) => (
            <label
              key={m.key}
              className={`payment-option
                ${value === m.key ? "active" : ""}
                ${m.disabled ? "disabled" : ""}
              `}
            >
              <input
                type="radio"
                name="payment_method"
                disabled={m.disabled}
                checked={value === m.key}
                onChange={() => {
                  if (m.disabled) return;
                  onChange(m.key);
                  setOpen(false);
                }}
              />

              {m.label}

              {m.key === "wallet" && m.disabled && (
                <span className="wallet-warning">
                  (Wallet can be used from ₹25 balance)
                </span>
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}