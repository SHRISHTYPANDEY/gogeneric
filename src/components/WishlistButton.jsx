import { Heart } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import "./WishlistButton.css";

export default function WishlistButton({ item }) {
  const { toggleWishlist, isWishlisted } = useWishlist();
  
  if (!item || !item.id) return null;

  const active = isWishlisted(item.id);

  return (
    <button
      className={`premium-wish-btn ${active ? "active" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        toggleWishlist(item);
      }}
      aria-label="Add to wishlist"
    >
      <div className="wish-icon-container">
        <Heart 
          size={18} 
          strokeWidth={active ? 0 : 2.5} 
          className="heart-icon" 
        />
        {/* Click par ek ring effect aayega */}
        <span className="ring-effect"></span>
      </div>
    </button>
  );
}