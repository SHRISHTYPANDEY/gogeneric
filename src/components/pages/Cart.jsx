import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { Minus, Plus, Trash2 } from "lucide-react";
import "./Cart.css";
import { cleanImageUrl } from "../../utils";
import LoginModal from "../auth/LoginModal";
import { useNavigate } from "react-router-dom";
import AddToCartButton from "../CartButton";
import WishlistButton from "../WishlistButton";
import Loader from "../Loader";
import useDiscounts from "../../hooks/useDiscounts";
import {
  getDiscountedPrice,
  getFinalPrice,
  getDiscountPercent,
} from "../../utils/priceUtils";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [suggestedLoading, setSuggestedLoading] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const { discountMap, fetchDiscountedItems } = useDiscounts();

  let guestId = localStorage.getItem("guest_id");
  if (!token && !guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem("guest_id", guestId);
  }

  useEffect(() => {
    fetchCartAndSync();
    fetchDiscountedItems();

    const handler = () => fetchCartAndSync();
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, []);

  useEffect(() => {
    if (cart.length) fetchSuggestedItems();
  }, [cart]);

  const fetchCartAndSync = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/v1/customer/cart/list", {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: "2",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        params: !token ? { guest_id: guestId } : {},
      });

      const cartItems = res.data || [];
      setCart(cartItems);
      localStorage.setItem(
        "cart_item_ids",
        JSON.stringify(cartItems.map((c) => c.item_id))
      );
    } catch (err) {
      console.error("Cart sync error", err);
    } finally {
      setLoading(false);
    }
  };

  const updateQty = async (item, qty) => {
    if (qty < 1) return;

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

    window.dispatchEvent(new Event("cart-updated"));
  };

  const removeItem = async (item) => {
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

    window.dispatchEvent(new Event("cart-updated"));
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
      setSuggestedLoading(false);
    } finally {
      setSuggestedLoading(false);
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

                    <div className="item-total">
                      ₹{c.price * c.quantity}
                    </div>
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

          <div className="suggested-section">
            <h3 className="suggested-title">You may also need</h3>

            {suggestedLoading ? (
              <Loader text="Loading suggestions..." />
            ) : (
              <div className="suggested-grid">
                {suggested.map((p) => {
                  const discountedPrice = getDiscountedPrice(
                    p,
                    discountMap
                  );
                  const discountPercent = getDiscountPercent(
                    p,
                    discountMap
                  );

                  return (
                    <div key={p.id} className="suggested-card">
                      {discountPercent && (
                        <div className="discount-badge">
                          {discountPercent}% OFF
                        </div>
                      )}

                      <div className="suggested-img-container">
                        <img
                          src={cleanImageUrl(
                            p.image_full_url || p.images_full_url?.[0]
                          )}
                          alt={p.name}
                          onError={(e) =>
                            (e.currentTarget.src = "/no-image.png")
                          }
                        />
                      </div>

                      <div className="suggested-info">
                        <h4>{p.name}</h4>

                        {discountedPrice ? (
                          <>
                            <span className="original-price">
                              ₹{p.price}
                            </span>
                            <span className="discounted-price">
                              ₹{discountedPrice}
                            </span>
                          </>
                        ) : (
                          <span className="discounted-price">
                            ₹{p.price}
                          </span>
                        )}
                      </div>

                      <div className="suggested-actions">
                        <WishlistButton item={p} />
                        <AddToCartButton
                          item={{
                            ...p,
                            price: getFinalPrice(p, discountMap),
                            original_price: p.price,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {showLogin && (
            <LoginModal
              onClose={() => {
                setShowLogin(false);
                fetchCartAndSync();
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
