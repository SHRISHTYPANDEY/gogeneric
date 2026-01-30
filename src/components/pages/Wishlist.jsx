import { useWishlist } from "../../context/WishlistContext";
import { cleanImageUrl } from "../../utils";
import api from "../../api/axiosInstance";
import Swal from "sweetalert2";
import "./Wishlist.css";
import { X, ShoppingCart, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useDiscounts from "../../hooks/useDiscounts";
import {
  getDiscountedPrice,
  getFinalPrice,
  getDiscountPercent,
} from "../../utils/priceUtils";

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { discountMap, fetchDiscountedItems } = useDiscounts();

  const showAlert = (icon, title, text, timer = null) => {
  Swal.fire({
    icon,
    title,
    text,
    confirmButtonColor: "#016B61",
    timer,
    showConfirmButton: !timer,
  });
};
const confirmRemove = (id) => {
  Swal.fire({
    title: "Remove item?",
    text: "This item will be removed from your wishlist",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#016B61",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, remove",
  }).then((result) => {
    if (result.isConfirmed) {
      removeFromWishlist(id);
      showAlert("success", "Removed", "Item removed from wishlist", 1200);
    }
  });
};

  useEffect(() => {
    fetchDiscountedItems();
  }, [fetchDiscountedItems]);

  let guestId = localStorage.getItem("guest_id");
  if (!token && !guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem("guest_id", guestId);
  }

  const moveToCart = async (item) => {
    if (!item?.id || !item?.price) {
showAlert("error", "Invalid Product", "Invalid product");
      return;
    }

    try {
      await api.post(
        "/api/v1/customer/cart/add",
        {
          item_id: item.id,
          quantity: 1,
          price: getFinalPrice(item, discountMap),
          original_price: item.price || item.unit_price,
          model: "Item",
          ...(token ? {} : { guest_id: guestId }),
        },
        {
          headers: {
            zoneId: JSON.stringify([3]),
            moduleId: "2",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      await removeFromWishlist(item.id);
      window.dispatchEvent(new Event("cart-updated"));
showAlert("success", "Added", "Moved to cart", 1500);
    } catch (err) {
     showAlert(
  "error",
  "Failed",
  err.response?.data?.errors?.[0]?.message ||
    "Something went wrong"
);

    }
  };

  if (wishlist.length === 0) {
    return (
      <div className="empty-wishlist medical">
        <div className="empty-icon">🔖</div>
        <h3>No saved items yet</h3>
        <p>
          Bookmark medicines you like
          <br />
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
            <button
  className="remove-btn"
  onClick={() => confirmRemove(item.id)}
>
  <X size={16} />
</button>


            <img
              src={cleanImageUrl(item.image_full_url || item.image)}
              alt={item.name}
              onError={(e) => (e.currentTarget.src = "/no-image.png")}
            />

            <h4>{item.name}</h4>
            <div className="price-box">
              {getDiscountedPrice(item, discountMap) ? (
                <>
                  <span className="original-price-wish">
                    ₹{item.price || item.unit_price}
                  </span>
                  <span className="discounted-price-wish">
                    ₹{getDiscountedPrice(item, discountMap)}
                  </span>
                </>
              ) : (
                <span className="discounted-price-wish">
                  ₹{item.price || item.unit_price}
                </span>
              )}
            </div>

            <button className="move-cart-btn" onClick={() => moveToCart(item)}>
              <ShoppingCart size={16} />
              <span>Move to Cart</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
