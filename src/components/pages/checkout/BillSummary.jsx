import "./BillSummary.css";
export default function BillSummary({ cartItems, deliveryType, walletDiscount, totalPayable }) {
  const itemTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const platformFee = 2;
  const deliveryCharge = deliveryType === "delivery" ? 50 : 0;
  const grandTotal = itemTotal + platformFee + deliveryCharge;

  return (
    <div className="checkout-card">
      <h4>Bill Summary</h4>

      <div className="bill-row">
        <span>Cart Amount</span>
        <span>₹{itemTotal.toFixed(2)}</span>
      </div>

      <div className="bill-row">
        <span>Platform Fee</span>
        <span>₹{platformFee.toFixed(2)}</span>
      </div>

      <div className="bill-row">
        <span>Delivery Charges</span>
        <span>₹{deliveryCharge.toFixed(2)}</span>
      </div>

      {walletDiscount > 0 && (
        <div className="bill-row">
          <span>Wallet Discount</span>
          <span style={{ color: "green" }}>-₹{walletDiscount.toFixed(2)}</span>
        </div>
      )}

      <hr />

      <div className="bill-row total">
        <strong>Total Payable</strong>
        <strong>₹{totalPayable.toFixed(2)}</strong>
      </div>
    </div>
  );

}
