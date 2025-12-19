import { useEffect, useState, useRef, useCallback } from "react";
import "./NearbyStores.css";
import api from "../api/axiosInstance";
import { cleanImageUrl } from "../utils";
import { Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { addToCart } from "../utils/cartHelper";
import Loader from "./Loader";
import WishlistButton from "./WishlistButton";

export default function NearbyStores() {
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  /* ❌ Cleanup */
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  /* 📦 Fetch basic medicines (Abort-safe) */
  const fetchBasicMedicines = useCallback(async () => {
    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setLoading(true);

      const res = await api.get("/api/v1/items/basic", {
        params: {
          limit: 20,
          offset: 0,
        },
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
        },
        signal: abortRef.current.signal,
      });

      const products =
        res.data.items ||
        res.data.products ||
        res.data.data ||
        res.data.medicines ||
        [];

      const cats =
        res.data.categories ||
        res.data.filters ||
        res.data.category_list ||
        [];

      setStores(products);
      setCategories(cats);
    } catch (err) {
      if (err.name !== "CanceledError") {
        console.error("API ERROR:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /* 🔁 Initial load */
  useEffect(() => {
    fetchBasicMedicines();
  }, [fetchBasicMedicines]);

  /* 🔍 Derived filter */
  const filteredStores =
    activeFilter === "All"
      ? stores
      : stores.filter((p) => p.category_id === activeFilter);

  /* ⬅️➡️ Scroll controls */
  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className="nearby-section max-w-7xl mx-auto">
      <h2 className="nearby-title">Basic Medicines Near You</h2>
      <p className="nearby-subtitle">
        Browse essential medicines available near you
      </p>

      {loading ? (
        <Loader text="Loading medicines..." />
      ) : (
        <>
          {/* 🟦 FILTERS */}
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

          {/* ⬅️ */}
          <button className="nearby-btn left" onClick={scrollLeft}>
            ❮
          </button>

          <div className="nearby-wrapper" ref={scrollRef}>
            <div className="nearby-scroll">
              {filteredStores.length === 0 ? (
                <p className="empty-text">No medicines found</p>
              ) : (
                filteredStores.map((store) => (
                  <div
                    className="store-card"
                    key={store.id}
                    onClick={() => navigate(`/medicine/${store.id}`)}
                  >
                    {/* ❤️ Wishlist */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <WishlistButton item={store} />
                    </div>

                    {/* ➕ Add to Cart */}
                    <div
                      className="add-cart-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart({
                          item: store,
                          navigate,
                          location,
                        });
                      }}
                    >
                      <Plus size={18} />
                    </div>

                    <img
                      src={
                        cleanImageUrl(store.image_full_url) ||
                        cleanImageUrl(store.full_url) ||
                        cleanImageUrl(store.thumbnail) ||
                        "/no-image.jpg"
                      }
                      alt={store.name}
                      onError={(e) => {
                        e.currentTarget.src = "/no-image.jpg";
                      }}
                    />

                    <h4>{store.name}</h4>
                    <p className="price">
                      ₹{store.price || store.unit_price || 0}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ➡️ */}
          <button className="nearby-btn right" onClick={scrollRight}>
            ❯
          </button>
        </>
      )}
    </div>
  );
}
