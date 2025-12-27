import { ShoppingBag } from "lucide-react"; // ShoppingBag zyada premium lagta hai
import { useNavigate, useLocation } from "react-router-dom";
import { addToCart } from "../utils/cartHelper";
import './CartButton.css';

export default function AddToCartButton({ item }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <button
      className="premium-add-btn"
      aria-label="Add to cart"
      onClick={(e) => {
        e.stopPropagation();
        // Click hone par button thoda shrink hoga (active state)
        e.currentTarget.classList.add('clicked');
        setTimeout(() => e.currentTarget.classList.remove('clicked'), 200);
        
        addToCart({
          item,
          navigate,
          location,
        });
      }}
    >
      <div className="btn-icon-wrapper">
        <ShoppingBag size={18} strokeWidth={2.5} />
      </div>
      <span className="btn-tooltip">Add</span>
    </button>
  );
}