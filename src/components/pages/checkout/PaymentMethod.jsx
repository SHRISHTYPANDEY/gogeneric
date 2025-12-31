import { useState } from "react";
import "./PaymentMethod.css";

export default function PaymentMethod({
  value,
  onChange,
  walletBalance = 0,
  orderAmount = 0,
}) {
  const [open, setOpen] = useState(false);

  const isWalletDisabled = walletBalance < orderAmount;

  const methods = [
    { key: "cash_on_delivery", label: "Cash on Delivery" },
    { key: "digital_payment", label: "Pay Online" },
    {
      key: "wallet",
      label: "Wallet",
      disabled: isWalletDisabled,
    },
  ];

  return (
    <div className="checkout-card">
      {/* PAY USING BUTTON */}
      <button
        type="button"
        className="pay-using-toggle"
        onClick={() => setOpen(!open)}
      >
        Pay Using{" "}
        {value && `• ${methods.find((m) => m.key === value)?.label}`}
      </button>

      {/* PAYMENT OPTIONS */}
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
                  (Insufficient balance)
                </span>
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
