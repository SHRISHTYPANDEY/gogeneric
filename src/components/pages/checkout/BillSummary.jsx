import "./BillSummary.css";
import { getFinalPrice } from "../../../utils/priceUtils";

export default function BillSummary({
  cartItems,
  deliveryType,
  walletDiscount = 0,
  totalPayable,
  discountMap = {},
}) {
  // Total MRP (original prices)
  const totalMRP = cartItems.reduce((sum, item) => {
    const basePrice = item.item?.mrp
      ? parseFloat(item.item.mrp)
      : parseFloat(item.item?.price || 0);
    return sum + basePrice * item.quantity;
  }, 0);

  // Total Discount
  const totalDiscount = cartItems.reduce((sum, item) => {
    const basePrice = item.item?.mrp
      ? parseFloat(item.item.mrp)
      : parseFloat(item.item?.price || 0);
    const finalPrice = getFinalPrice(item.item, discountMap);
    return sum + (basePrice - finalPrice) * item.quantity;
  }, 0);

  // Subtotal after item discounts
  const subtotal = totalMRP - totalDiscount;

  const platformFee = 2;
  const deliveryCharge = deliveryType === "delivery" ? 50 : 0;

  // Grand Total after wallet discount
  const grandTotal = subtotal + platformFee + deliveryCharge - walletDiscount;

  return (
    <div className="checkout-card">
      <h4>Bill Summary</h4>

      <div className="bill-row">
        <span>Total MRP</span>
        <span>₹{totalMRP.toFixed(2)}</span>
      </div>

      <div className="bill-row">
        <span>Total Discount</span>
        <span style={{ color: "green" }}>-₹{totalDiscount.toFixed(2)}</span>
      </div>

      <div className="bill-row">
        <span>Subtotal (After Discounts)</span>
        <span>₹{subtotal.toFixed(2)}</span>
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
        <strong>₹{grandTotal.toFixed(2)}</strong>
      </div>
    </div>
  );
}