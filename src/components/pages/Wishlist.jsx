import { useWishlist } from "../../context/WishlistContext";
import { cleanImageUrl } from "../../utils";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";
import "./Wishlist.css";
import { X, ShoppingCart, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  let guestId = localStorage.getItem("guest_id");
  if (!token && !guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem("guest_id", guestId);
  }

  /* ================= MOVE TO CART ================= */
  const moveToCart = async (item) => {
    if (!item?.id || !item?.price) {
      toast.error("Invalid product");
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
      toast.success("Moved to cart");
    } catch (err) {
      toast.error(
        err.response?.data?.errors?.[0]?.message || "Something went wrong"
      );
    }
  };

  /* ================= EMPTY STATE ================= */
  if (wishlist.length === 0) {
    return (
      <div className="empty-wishlist medical">
        <div className="empty-icon">🔖</div>
        <h3>No saved items yet</h3>
        <p>
          Bookmark medicines you like<br />
          for quick access later.
        </p>
        <button className="explore-btn" onClick={() => navigate("/")}>
          Browse Medicines
        </button>
      </div>
    );
  }

  return (
    <div className="wishlist-page max-w-7xl mx-auto">
      <h2 className="wishlist-heading">
        <Bookmark size={22} /> My Wishlist
      </h2>

      <div className="items-grid">
        {wishlist.map((item) => (
          <div key={item.id} className="item-card1">
            {/* REMOVE */}
            <button
              className="remove-btn"
              onClick={() => removeFromWishlist(item.id)}
            >
              <X size={16} />
            </button>

            <img
              src={cleanImageUrl(item.image_full_url || item.image)}
              alt={item.name}
              onError={(e) => (e.currentTarget.src = "/no-image.png")}
            />

            <h4>{item.name}</h4>
            <p className="price">₹{item.price}</p>

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
