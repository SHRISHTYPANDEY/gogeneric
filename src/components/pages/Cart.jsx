import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { Minus, Plus, Trash2 } from "lucide-react";
import "./Cart.css";
import { cleanImageUrl } from "../../utils";
import LoginModal from "../auth/LoginModal";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../../utils/cartHelper";
import Loader from "../Loader";
export default function Cart() {
  const [cart, setCart] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [suggestedLoading, setSuggestedLoading] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  let guestId = localStorage.getItem("guest_id");
  if (!token && !guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem("guest_id", guestId);
  }

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (cart.length) fetchSuggestedItems();
  }, [cart]);

  const fetchCart = async () => {
    try {
      const res = await api.get("/api/v1/customer/cart/list", {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: "2",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        params: !token ? { guest_id: guestId } : {},
      });

      setCart(res.data || []);
    } catch (err) {
      // console.error("Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateQty = async (item, qty) => {
    if (qty < 1) return;

    try {
      await api.post(
        "/api/v1/customer/cart/update",
        {
          cart_id: item.id,
          price: item.price,
          quantity: qty,
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
      fetchCart();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const removeItem = async (item) => {
    setCart((prev) => prev.filter((c) => c.id !== item.id));

    try {
      await api.delete("/api/v1/customer/cart/remove-item", {
        data: {
          cart_id: item.id,
          ...(token ? {} : { guest_id: guestId }),
        },
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: "2",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (err) {
      // console.error("Remove error:", err);
      fetchCart();
    }
  };

  const fetchSuggestedItems = async () => {
  const firstItem = cart[0];
  if (!firstItem) return;

  const storeId = firstItem.item?.store_id || firstItem.item?.store?.id;
  const categoryId =
    firstItem.item?.category_id || firstItem.item?.category?.id;

  if (!storeId || !categoryId) return;

  try {
    setSuggestedLoading(true);

    const res = await api.get("/api/v1/items/latest", {
      headers: {
        zoneId: JSON.stringify([3]),
        moduleId: "2",
      },
      params: {
        store_id: storeId,
        category_id: categoryId,
        offset: 1,
        limit: 6,
      },
    });

    setSuggested(res.data?.products || []);
  } catch (err) {
    // console.error("Suggested error:", err);
  } finally {
    setSuggestedLoading(false);
  }
};

  const addSuggestedToCart = async (product) => {
    try {
      await addToCart({
        item: product, 
      });
      fetchCart();
    } catch (err) {
      // console.error("Add suggested error:", err);
    }
  };

  const total = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  if (loading) {
    return (
      <div className="cart-loader">
        <Loader text="Loading your cart..." />
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2 className="cart-title">My Cart</h2>

      {cart.length === 0 ? (
        <div className="empty-cart-state medical">
          <span className="medical-icon">💊</span>

          <h3>Your cart is currently empty</h3>

          <p>
            Please add required medicines or healthcare
            <br />
            items to continue.
          </p>

          <button className="explore-btn" onClick={() => navigate("/")}>
            Browse Medicines
          </button>
        </div>
      ) : (
        <>
          {/* CART ITEMS */}
          <div className="cart-layout">
            <div className="cart-items">
              {cart.map((c) => {
                const img =
                  c.item?.image_full_url ||
                  c.item?.images_full_url?.[0] ||
                  c.item?.image;

                return (
                  <div key={c.id} className="cart-item">
                    <img
                      src={cleanImageUrl(img)}
                      alt={c.item?.name}
                      className="cart-img"
                      onError={(e) => (e.currentTarget.src = "/no-image.png")}
                    />

                    <div className="item-info">
                      <h4>{c.item?.name}</h4>
                      <p>₹{c.price}</p>
                    </div>

                    <div className="qty-control">
                      <button onClick={() => updateQty(c, c.quantity - 1)}>
                        <Minus size={16} />
                      </button>
                      <span>{c.quantity}</span>
                      <button onClick={() => updateQty(c, c.quantity + 1)}>
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="item-total">₹{c.price * c.quantity}</div>

                    <Trash2 className="delete" onClick={() => removeItem(c)} />
                  </div>
                );
              })}
            </div>
            <div className="cart-summary">
              <h3>Summary</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
              <button
                className="checkout-btn"
                onClick={() =>
                  token ? navigate("/checkout") : setShowLogin(true)
                }
              >
                Confirm Delivery Details
              </button>
            </div>
          </div>

        {/* SUGGESTED ITEMS */}
<div className="suggested-section">
  <h3 className="suggested-title">
    You may also need
  </h3>

  {suggestedLoading ? (
    <Loader text="Loading suggestions..." />
  ) : (
    <div className="suggested-grid">
      {suggested.map((p) => (
        <div key={p.id} className="suggested-card">
          <img
            src={cleanImageUrl(
              p.image_full_url || p.images_full_url?.[0]
            )}
            alt={p.name}
            onError={(e) => (e.currentTarget.src = "/no-image.png")}
          />
          <h4>{p.name}</h4>
          <p>₹{p.price}</p>
          <button onClick={() => addSuggestedToCart(p)}>
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  )}
</div>
          {showLogin && (
            <LoginModal
              onClose={() => {
                setShowLogin(false);
                fetchCart();
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
