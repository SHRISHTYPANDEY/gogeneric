import { useEffect, useRef, useState, useCallback } from "react";
import "./CommonConcern.css";
import api from "../api/axiosInstance";
import { cleanImageUrl } from "../utils";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { addToCart } from "../utils/cartHelper";
import { useNavigate, useLocation } from "react-router-dom";
import WishlistButton from "./WishlistButton";

export default function CommonConcern() {
  const [concerns, setConcerns] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [loading, setLoading] = useState(true);

  const [medicines, setMedicines] = useState([]);
  const [medicineLoading, setMedicineLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const concernAbortRef = useRef(null);
  const medicineAbortRef = useRef(null);

  /* ❌ Cleanup on unmount */
  useEffect(() => {
    return () => {
      concernAbortRef.current?.abort();
      medicineAbortRef.current?.abort();
    };
  }, []);

  /* 🟦 Fetch Concerns (Abort-safe) */
  const fetchConcerns = useCallback(async () => {
    try {
      concernAbortRef.current?.abort();
      concernAbortRef.current = new AbortController();

      setLoading(true);

      const res = await api.get("/api/v1/common-condition", {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
        },
        signal: concernAbortRef.current.signal,
      });

      const data =
        res.data.items ||
        res.data.data ||
        res.data.common_conditions ||
        res.data.conditions ||
        res.data ||
        [];

      setConcerns(data);

      // Auto-select first concern
      if (data.length > 0) {
        setActiveFilter(data[0]);
      }
    } catch (err) {
      if (err.name !== "CanceledError") {
        console.error("Concern fetch error:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /* 💊 Fetch Medicines by Concern (Abort-safe) */
  const fetchMedicines = useCallback(async (concernId) => {
    if (!concernId) return;

    try {
      medicineAbortRef.current?.abort();
      medicineAbortRef.current = new AbortController();

      setMedicineLoading(true);

      const res = await api.get(
        `/api/v1/common-condition/items/${concernId}`,
        {
          params: {
            limit: 10,
            offset: 1,
          },
          headers: {
            zoneId: JSON.stringify([3]),
            moduleId: 2,
          },
          signal: medicineAbortRef.current.signal,
        }
      );

      setMedicines(res.data.products || []);
    } catch (err) {
      if (err.name !== "CanceledError") {
        console.error("Medicine fetch error:", err);
      }
    } finally {
      setMedicineLoading(false);
    }
  }, []);

  /* 🔁 Initial load */
  useEffect(() => {
    fetchConcerns();
  }, [fetchConcerns]);

  /* 🔁 Load medicines on filter change */
  useEffect(() => {
    if (activeFilter?.id) {
      fetchMedicines(activeFilter.id);
    }
  }, [activeFilter, fetchMedicines]);

  if (loading) {
    return null; // or loader if you want
  }

  return (
    <div className="concern-page max-w-7xl mx-auto px-4">
      <h2 className="concern-heading">Common Concerns</h2>
      <p className="concern-sub">{concerns.length} concerns available</p>

      {/* 🟦 Filter Buttons */}
      <div className="filter-row">
        <div className="store-filters">
          {concerns.map((c) => (
            <button
              key={c.id}
              className={`filter-btn ${
                activeFilter?.id === c.id ? "active" : ""
              }`}
              onClick={() => setActiveFilter(c)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* 💊 Medicines */}
      {medicineLoading ? (
        <div className="concern-grid">
          {[1, 2, 3, 4].map((x) => (
            <div className="skeleton-card" key={x} />
          ))}
        </div>
      ) : medicines.length === 0 ? (
        <div className="no-products">No products available</div>
      ) : (
        <div className="concern-grid">
          {medicines.map((item) => (
            <div
              className="concern-card"
              key={item.id}
              onClick={() =>
                navigate(`/medicine/${item.id}`, {
                  state: {
                    price: item.price,
                    store_id: item.store_id,
                  },
                })
              }
            >
              <WishlistButton item={item} />

              {/* ➕ ADD TO CART */}
              <div
                className="add-cart-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart({
                    item,
                    navigate,
                    location,
                  });
                }}
              >
                <Plus size={18} />
              </div>

              <img
                src={
                  cleanImageUrl(item.image_full_url) ||
                  cleanImageUrl(item.full_url) ||
                  cleanImageUrl(item.thumbnail) ||
                  "/no-image.jpg"
                }
                alt={item.name}
                onError={(e) => {
                  e.currentTarget.src = "/no-image.jpg";
                }}
              />

              <h3>{item.name}</h3>
              <p className="price">₹{item.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
