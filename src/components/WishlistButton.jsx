import { Heart } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import "./WishlistButton.css";

export default function WishlistButton({ item }) {
  const { toggleWishlist, isWishlisted } = useWishlist();

  const active = isWishlisted(item.id);

  return (
    <button
      className={`wishlist-btn ${active ? "active" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        toggleWishlist(item);
      }}
    >
      <Heart size={20} />
    </button>
  );
} 