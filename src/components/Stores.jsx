import { useEffect, useState, useRef } from "react";
import "./Stores.css";
import { MapPin, Star } from "lucide-react";
import api from "../api/axiosInstance";
import { cleanImageUrl } from "../utils";
import { useNavigate } from "react-router-dom";

export default function Stores() {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const abortRef = useRef(null);
  const navigate = useNavigate();

  /* ================= FETCH STORES ================= */
  const fetchStoresByFilter = async (filter) => {
    // Abort previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    let url = "/api/v1/stores/get-stores/all";
    if (filter === "Newly Joined")
      url = "/api/v1/stores/get-stores/newly-joined";
    if (filter === "Popular") url = "/api/v1/stores/popular";
    if (filter === "Top Rated") url = "/api/v1/stores/get-stores/top-rated";

    try {
      const res = await api.get(url, {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
        },
        signal: controller.signal,
      });

      const data = res.data?.stores || [];
      setStores(data);
      setFilteredStores(data);
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
        // Request was aborted – ignore
        return;
      }
      console.log("Stores API Error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER CHANGE ================= */
  useEffect(() => {
    fetchStoresByFilter(activeFilter);

    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [activeFilter]);

  /* ================= CATEGORY FILTER ================= */
  useEffect(() => {
    let updated = [...stores];

    if (activeCategory !== "All") {
      updated = updated.filter((s) => s.category === activeCategory);
    }

    setFilteredStores(updated);
  }, [activeCategory, stores]);

  return (
    <div className="stores-page max-w-7xl mx-auto px-4">
      <h2 className="stores-heading">Stores</h2>
      <p className="stores-sub">{filteredStores.length} stores found</p>

      <div className="filter-row">
        <div className="store-filters">
          {["All", "Newly Joined", "Popular", "Top Rated"].map((f) => (
            <button
              key={f}
              className={`filter-btn ${activeFilter === f ? "active" : ""}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {filteredStores.length > 9 && (
          <button
            className="view-more-btn"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "View Less" : "View More"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="stores-grid">
          {[1, 2, 3, 4].map((x) => (
            <div className="skeleton-card" key={x}></div>
          ))}
        </div>
      ) : (
        <div className="stores-grid">
          {(showAll ? filteredStores : filteredStores.slice(0, 9)).map(
            (store) => (
              <div
                className="store-card-6am"
                key={store.id}
                onClick={() => navigate(`/view-stores/${store.id}`)}
              >
                <div className="store-image-wrapper">
                  <img
                    src={cleanImageUrl(
                      store.cover_photo_full_url || store.cover_photo
                    )}
                    alt={store.name}
                    loading="lazy"
                  />
                  {store.offer && (
                    <div className="store-offer-badge">{store.offer}</div>
                  )}
                </div>

                <div className="store-content-vertical">
                  <h3 className="store-name">{store.name}</h3>
                  <p className="store-address">
                    {store.address || "Address unavailable"}
                  </p>

                  <div className="store-bottom-row">
                    <span className="store-distance">
                      <MapPin size={14} />
                      {(store.distance > 1000
                        ? store.distance / 1000
                        : store.distance
                      ).toFixed(1)}{" "}
                      km
                    </span>

                    <span className="store-rating">
                      <Star size={14} fill="#00c16e" stroke="none" />
                      {store.rating || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
