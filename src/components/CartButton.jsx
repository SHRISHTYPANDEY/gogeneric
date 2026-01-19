import { ShoppingBag, Check } from "lucide-react";
import { addToCart } from "../utils/cartHelper";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CartButton.css";

export default function AddToCartButton({ item }) {
  const btnRef = useRef(null);
  const navigate = useNavigate();
  const [inCart, setInCart] = useState(false);

  const checkInCart = () => {
    const ids = JSON.parse(
      localStorage.getItem("cart_item_ids") || "[]"
    );
    setInCart(ids.includes(item.id));
  };

  useEffect(() => {
    checkInCart();

    const handler = () => checkInCart();
    window.addEventListener("cart-updated", handler);

    return () => {
      window.removeEventListener("cart-updated", handler);
    };
  }, [item.id]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (inCart) {
      navigate("/cart");
      return;
    }

    // animation
    btnRef.current?.classList.add("clicked");
    setTimeout(() => {
      btnRef.current?.classList.remove("clicked");
    }, 200);

    addToCart({ item });
  };

  return (
    <button
      ref={btnRef}
      className={`apply-now-btn ${inCart ? "added" : ""}`}
      onClick={handleClick}
    >
      {inCart ? (
        <>
          <span>Go to Cart</span>
          <Check size={16} strokeWidth={2.5} />
        </>
      ) : (
        <>
          <span>Add to Cart</span>
          <ShoppingBag size={16} strokeWidth={2.5} />
        </>
      )}
    </button>
  );
}
