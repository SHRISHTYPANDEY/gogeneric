import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { cleanImageUrl } from "../../utils";
import "./SearchList.css";
import WishlistButton from "../WishlistButton";
export default function SearchList() {
  const [params] = useSearchParams();
  const query = params.get("query");

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);

  const abortRef = useRef(null);
  const navigate = useNavigate();

  // 📍 Location Logic
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      () => setLocation({ latitude: 0, longitude: 0 })
    );
  }, []);

  // 🔍 Fetch Logic
  useEffect(() => {
    if (!query || query.trim().length < 2 || !location) return;
    fetchMedicines(query.trim());
  }, [query, location]);

  const fetchMedicines = async (searchText) => {
    try {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      setLoading(true);

      const res = await api.get("/api/v1/items/item-or-store-search", {
        params: { name: searchText },
        headers: {
          zoneId: "[3]",
          moduleId: 2,
          latitude: location.latitude,
          longitude: location.longitude,
        },
        signal: abortRef.current.signal,
      });

      setMedicines(res.data?.items || []);
    } catch (err) {
      if (err.name !== "CanceledError") console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="gs-search-container">
      <div className="gs-search-wrapper">
        {/* Header Section */}
        <div className="gs-search-header">
          <h2 className="gs-result-title">
            Search results for <span className="gs-highlight">"{query}"</span>
          </h2>
          {!loading && medicines.length > 0 && (
            <p className="gs-result-count">{medicines.length} items found</p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="gs-status-box">
            <div className="gs-spinner"></div>
            <p className="gs-loader-text">Finding the best results...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && medicines.length === 0 && (
          <div className="gs-status-box">
            <div className="gs-empty-icon">🔍</div>
            <p className="gs-no-results">No medicines found in your area.</p>
            <button className="gs-retry-btn" onClick={() => window.location.reload()}>Try Again</button>
          </div>
        )}

        {/* Results Grid */}
        {!loading && medicines.length > 0 && (
  <div className="gs-medicine-grid">
    {medicines.map((item) => (
      <div
        key={item.id}
        className="gs-medicine-card"
        onClick={() => navigate(`/medicine/${item.id}`)}
      >
        {/* Wishlist */}
        <div
          className="gs-wishlist"
          onClick={(e) => e.stopPropagation()}
        >
          <WishlistButton item={item} />
        </div>

        {/* Image */}
        <div className="gs-img-box">
          <img
            src={cleanImageUrl(item.image_full_url || item.image)}
            alt={item.name}
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div className="gs-card-info">
          <div className="gs-text-group">
            <h4 className="gs-med-name">{item.name}</h4>
            <p className="gs-med-store">
              {item.store_name || "Certified Store"}
            </p>
          </div>

          <button
            className="gs-view-btn"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/medicine/${item.id}`);
            }}
          >
            View Details
          </button>
        </div>
      </div>
    ))}
  </div>
)}

      </div>
    </section>
  );
}