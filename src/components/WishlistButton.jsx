import { Bookmark } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import "./WishlistButton.css";
import Swal from "sweetalert2";


export default function WishlistButton({ item }) {
  const { toggleWishlist, isWishlisted } = useWishlist();

  if (!item || !item.id) return null;

  const active = isWishlisted(item.id);

  const showAlert = (icon, title, timer = 1200) => {
  Swal.fire({
    icon,
    title,
    timer,
    showConfirmButton: false,
    confirmButtonColor: "#016B61",
  });
};

  return (
    <button
      className={`premium-wish-btn ${active ? "active" : ""}`}
      onClick={(e) => {
  e.stopPropagation();

  if (active) {
    toggleWishlist(item);
    showAlert("info", "Removed from Wishlist");
  } else {
    toggleWishlist(item);
    showAlert("success", "Saved to Wishlist");
  }
}}
label={active ? "Remove from wishlist" : "Add to wishlist"}
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