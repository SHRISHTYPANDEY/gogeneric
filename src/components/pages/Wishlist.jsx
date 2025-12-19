import { useWishlist } from "../../context/WishlistContext";
import { cleanImageUrl } from "../../utils";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";
import "./Wishlist.css";
import { X, ShoppingCart, Heart } from "lucide-react";

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const token = localStorage.getItem("token");

  let guestId = localStorage.getItem("guest_id");
  if (!token && !guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem("guest_id", guestId);
  }

  /* ================= MOVE TO CART ================= */
  const moveToCart = async (item) => {
    if (!item?.id || !item?.price) {
      console.error("Invalid wishlist item:", item);
      toast.error("Invalid product data");
      return;
    }

    try {
      await api.post(
        "/api/v1/customer/cart/add",
        {
          item_id: item.id,
          quantity: 1,
          price: item.price,
          model: "Item",
          ...(token ? {} : { guest_id: guestId }),
        },
        {
          headers: {
            zoneId: JSON.stringify([3]),
            moduleId: "2",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      await removeFromWishlist(item.id);
      window.dispatchEvent(new Event("cart-updated"));

      toast.success("Item moved to cart");
    } catch (err) {
      console.error("Move to cart error:", err.response?.data);
      toast.error(
        err.response?.data?.errors?.[0]?.message ||
          "Failed to move item"
      );
    }
  };

  if (wishlist.length === 0) {
    return (
      <p className="empty-text">
        Your wishlist is empty
      </p>
    );
  }

  return (
    <div className="wishlist-page max-w-7xl mx-auto">
      <h2 className="wishlist-heading">
        <Heart size={20} /> Your Wishlist
      </h2>

      <div className="items-grid">
        {wishlist.map((item) => (
          <div key={item.id} className="item-card">
            {/* REMOVE BUTTON */}
            <button
              className="remove-btn"
              onClick={() => removeFromWishlist(item.id)}
            >
              <X size={16} />
            </button>

            <img
              src={cleanImageUrl(
                item.image_full_url || item.image
              )}
              alt={item.name}
              onError={(e) =>
                (e.currentTarget.src = "/no-image.png")
              }
            />

            <h4>{item.name}</h4>
            <p className="price">₹{item.price}</p>

            {/* MOVE TO CART */}
            <button
              className="move-cart-btn"
              onClick={() => moveToCart(item)}
            >
              <ShoppingCart size={16} />
              <span>Move to Cart</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
