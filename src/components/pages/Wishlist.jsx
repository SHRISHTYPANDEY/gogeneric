import { useWishlist } from "../../context/WishlistContext";
import { cleanImageUrl } from "../../utils";
import "./Wishlist.css";

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();

  if (wishlist.length === 0) {
    return <p className="empty-text">Your wishlist is empty 💔</p>;
  }

  return (
    <div className="wishlist-page max-w-7xl mx-auto">
      <h2>My Wishlist ❤️</h2>

      <div className="items-grid">
        {wishlist.map((item) => (
          <div key={item.id} className="item-card">
            {/* ❌ remove button */}
            <button
              className="remove-btn"
              onClick={() => removeFromWishlist(item.id)}
            >
              ❌
            </button>

            <img
              src={cleanImageUrl(item.image_full_url)}
              alt={item.name}
            />

            <h4>{item.name}</h4>
            <p>₹{item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
