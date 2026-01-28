import { useEffect, useState, useRef, useCallback } from "react";
import "./NearbyStores.css";
import api from "../api/axiosInstance";
import { cleanImageUrl } from "../utils";
import { useNavigate } from "react-router-dom";
import AddToCartButton from "./CartButton";
import Loader from "./Loader";
import WishlistButton from "./WishlistButton";
import useDiscounts from "../hooks/useDiscounts";
import { encodeId } from "../utils/idObfuscator";

import {
  getDiscountedPrice,
  getFinalPrice,
  getDiscountPercent,
} from "../utils/priceUtils";

export default function NearbyStores() {
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef(null);
  const abortRef = useRef(null);
  const navigate = useNavigate();

  const { discountMap, fetchDiscountedItems } = useDiscounts();

  const fetchBasicMedicines = useCallback(async () => {
    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setLoading(true);

      let allItems = [];
      let offset = 0;
      const limit = 50;
      let hasMore = true;
      let categoriesSet = false;

      while (hasMore) {
        const res = await api.get("/api/v1/items/basic", {
          params: { limit, offset },
          headers: { zoneId: JSON.stringify([3]), moduleId: 2 },
          signal: abortRef.current.signal,
        });

        const items = res.data.items || res.data.products || [];
        allItems = [...allItems, ...items];

        if (!categoriesSet) {
          setCategories(res.data.categories || res.data.filters || []);
          categoriesSet = true;
        }

        hasMore = items.length === limit;
        offset += limit;
      }

      setStores(allItems);
    } catch (err) {
      if (err.name !== "CanceledError") console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBasicMedicines();
    fetchDiscountedItems();
  }, [fetchBasicMedicines, fetchDiscountedItems]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const filteredStores =
    activeFilter === "All"
      ? stores
      : stores.filter((p) => p.category_id === activeFilter);

  return (
    <div className="nearby-section max-w-7xl mx-auto">
      <h2 className="nearby-title">Basic Medicines Near You</h2>

      {loading ? (
        <Loader text="Loading medicines..." />
      ) : (
        <>
          {/* FILTERS */}
          <div className="nearby-filters">
            <button
              className={`nearby-filter-btn ${
                activeFilter === "All" ? "active" : ""
              }`}
              onClick={() => setActiveFilter("All")}
            >
              All
            </button>

            {categories.map((c) => (
              <button
                key={c.id}
                className={`nearby-filter-btn ${
                  activeFilter === c.id ? "active" : ""
                }`}
                onClick={() => setActiveFilter(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* LIST */}
          <div className="nearby-wrapper" ref={scrollRef}>
            <div className="nearby-scroll">
              {filteredStores.length === 0 ? (
                <p className="empty-text">No medicines found</p>
              ) : (
                filteredStores.map((store) => {
                  const discountedPrice = getDiscountedPrice(
                    store,
                    discountMap
                  );
                  const discountPercent = getDiscountPercent(
                    store,
                    discountMap
                  );

                  return (
                    <div
                      className="store-card"
                      key={store.id}
                      onClick={() =>
                        navigate(`/medicine/${encodeId(store.id)}`, {
                          state: {
                            price: getFinalPrice(store, discountMap),
                          },
                        })
                      }
                    >
                      <div
                        className="top-actions"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <WishlistButton item={store} />
                      </div>

                      {discountPercent && (
                        <div className="discount-badge">
                          {discountPercent}% OFF
                        </div>
                      )}

                      <div className="image-wrapper">
                        <img
                          src={
                            cleanImageUrl(store.image_full_url) ||
                            "/no-image.jpg"
                          }
                          alt={store.name}
                          onError={(e) =>
                            (e.currentTarget.src = "/no-image.jpg")
                          }
                        />
                      </div>

                      <h4 className="medicine-name">{store.name}</h4>

                      <p className="storee-name">{store.store_name}</p>

                      <div className="card-footer">
                        <div className="price-box">
                          {discountedPrice ? (
                            <>
                              <span className="original-price">
                                ₹{store.price || store.unit_price}
                              </span>
                              <span className="discounted-price">
                                ₹{discountedPrice}
                              </span>
                            </>
                          ) : (
                            <span className="discounted-price">
                              ₹{store.price || store.unit_price}
                            </span>
                          )}
                        </div>

                        <div
                          className="cart-action"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <AddToCartButton
                            item={{
                              ...store,
                              price: getFinalPrice(store, discountMap),
                              original_price:
                                store.price || store.unit_price,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
