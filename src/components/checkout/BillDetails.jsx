import { useEffect, useState } from "react";
import { Info, FileText } from "lucide-react";
import api from "../../api/axiosInstance";
import "./BillDetails.css";

export default function BillDetails() {
  const token = localStorage.getItem("token");
  let guestId = localStorage.getItem("guest_id");

  if (!token && !guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem("guest_id", guestId);
  }

  const PLATFORM_FEE = 2;

  const [bill, setBill] = useState({
    itemTotal: 0,
    deliveryFee: 0,
    discount: 0,
    tax: 0,
    platformFee: PLATFORM_FEE,
    toPay: 0,
  });

  const fetchBill = async () => {
    try {
      const res = await api.get("/api/v1/customer/cart/list", {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: "2",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        params: !token ? { guest_id: guestId } : {},
      });

      const cart = res.data || [];

      const itemTotal = cart.reduce(
        (sum, c) => sum + c.price * c.quantity,
        0
      );

      const discount = itemTotal >= 300 ? 50 : 0;
      const deliveryFee = itemTotal >= 499 ? 0 : 50;
      const tax = Math.round(itemTotal * 0.05);

      const toPay =
        itemTotal +
        tax +
        deliveryFee +
        PLATFORM_FEE -
        discount;

      setBill({
        itemTotal,
        discount,
        deliveryFee,
        tax,
        platformFee: PLATFORM_FEE,
        toPay,
      });
    } catch (err) {
      console.error("Bill fetch error", err);
    }
  };

  useEffect(() => {
    fetchBill();

    window.addEventListener("cart-updated", fetchBill);
    return () =>
      window.removeEventListener("cart-updated", fetchBill);
  }, []);

  return (
    <>
      {/* BILL DETAILS */}
      <div className="bill-card">
        <div className="bill-header">
          <p className="bill-title">Bill Details</p>
          <Info size={16} className="bill-info" />
        </div>

        <div className="bill-row">
          <span>Item Total</span>
          <span>₹{bill.itemTotal}</span>
        </div>

        <div className="bill-row">
          <span>Delivery Fee</span>
          <span>
            {bill.deliveryFee === 0
              ? "Free"
              : `₹${bill.deliveryFee}`}
          </span>
        </div>

        <div className="bill-row">
          <span>Platform Fee</span>
          <span>₹{bill.platformFee}</span>
        </div>

        {bill.discount > 0 && (
          <div className="bill-row discount">
            <span>Promo Discount</span>
            <span>-₹{bill.discount}</span>
          </div>
        )}

        <div className="bill-row">
          <span>Taxes & Charges</span>
          <span>₹{bill.tax}</span>
        </div>

        <div className="bill-divider" />

        <div className="bill-row total">
          <span>To Pay</span>
          <span>₹{bill.toPay}</span>
        </div>
      </div>

      {/* NOTE */}
      <div className="note-card">
        <div className="note-header">
          <FileText size={16} />
          <p>Additional Note</p>
        </div>

        <textarea
          className="note-input"
          placeholder="Any instructions for delivery partner or store?"
        />
      </div>

      {/* POLICY */}
      <div className="policy-card">
        <label className="policy-checkbox">
          <input type="checkbox" />
          <span>
            I agree to the{" "}
            <a href="/privacy-policy">Privacy Policy</a>,{" "}
            <a href="/terms-conditions">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="/refund-policy">
              Refund Policy
            </a>.
          </span>
        </label>
      </div>
    </>
  );
}
