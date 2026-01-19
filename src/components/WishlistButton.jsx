import { Bookmark } from "lucide-react";
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
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
    >
      <span className="wish-text">{active ? "Saved" : "Save"}</span>
      <div className="wish-icon-container">
        <Bookmark
          size={14}
          strokeWidth={2.5}
          className="bookmark-icon"
        />
        <span className="ring-effect"></span>
      </div>
    </button>
  );
}