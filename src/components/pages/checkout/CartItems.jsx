import "./CartItems.css";
import { cleanImageUrl } from "../../../utils";
import { getFinalPrice } from "../../../utils/priceUtils";

export default function CartItems({ cartItems, discountMap = {} }) {
  return (
    <div className="checkout-card">
      <h4>Cart Items</h4>

      {cartItems.map((item) => {
        // get raw image URL
        const rawImg =
          item.item?.image_full_url ||
          item.item?.images_full_url?.[0] ||
          item.item?.image;

        // Handle invalid URLs and fallback to placeholder
        const img =
          !rawImg ||
          rawImg === "null" ||
          rawImg === "undefined" ||
          rawImg === "/"
            ? "/no-image.jpg"
            : cleanImageUrl(rawImg);

        // Final price after discount
        const finalPrice = getFinalPrice(item.item, discountMap);
        const basePrice = item.item?.mrp
          ? Math.floor(parseFloat(item.item.mrp))
          : Math.floor(parseFloat(item.item?.price || 0));

        return (
          <div key={item.id} className="checkout-cart-item">
            <img
              src={img}
              alt={item.item?.name}
              className="cart-item-image"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/no-image.jpg";
              }}
            />

            <div className="cart-item-info">
              <p className="cart-item-name">{item.item?.name}</p>
              <p className="cart-item-qty">Qty: {item.quantity}</p>
            </div>

            <div className="cart-item-price">
              {finalPrice < basePrice ? (
                <>
                  <span className="original-price">₹{basePrice}</span>
                  <span className="discounted-price">
                    ₹{(finalPrice * item.quantity).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="discounted-price">
                  ₹{(finalPrice * item.quantity).toFixed(2)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}