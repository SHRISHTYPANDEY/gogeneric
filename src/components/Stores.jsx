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
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const canShowViewMore = filteredStores.length > 9;


  const [userCoords, setUserCoords] = useState(null); // ✅ STATE

  const abortRef = useRef(null);
  const navigate = useNavigate();

  /* ================= USER LOCATION LISTENER ================= */
  useEffect(() => {
    const loadLocation = () => {
      const stored = localStorage.getItem("user_location");
      setUserCoords(stored ? JSON.parse(stored) : null);
    };

    loadLocation(); // initial load

    // 🔥 listen when location changes (custom event)
    window.addEventListener("location-updated", loadLocation);

    return () => {
      window.removeEventListener("location-updated", loadLocation);
    };
  }, []);

  const hasUserLocation = userCoords?.lat && userCoords?.lng;

  /* ================= FETCH STORES ================= */
  const fetchStoresByFilter = async (filter) => {
    if (abortRef.current) abortRef.current.abort();

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
          moduleId: "2",
          ...(hasUserLocation && {
            latitude: userCoords.lat,
            longitude: userCoords.lng,
          }),
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      const data = res.data?.stores || [];
      setStores(data);
      setFilteredStores(data);
    } catch (err) {
      if (err.name !== "CanceledError") {
        console.log("Stores API Error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  /* 🔁 Re-fetch when filter OR location changes */
  useEffect(() => {
    fetchStoresByFilter(activeFilter);
    return () => abortRef.current?.abort();
  }, [activeFilter, hasUserLocation]);

  /* ================= UI ================= */
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
            (store) => {
              const showDistance =
                hasUserLocation && typeof store.distance === "number";

              const distance = showDistance
                ? `${(store.distance / 1000).toFixed(1)} km`
                : null;

              return (
                <div
                  key={store.id}
                  className="store-card-6am"
                  onClick={() => navigate(`/view-stores/${store.id}`)}
                >
                  <div className="store-image-wrapper">
                    <img
                      src={cleanImageUrl(
                        store.cover_photo_full_url || store.cover_photo
                      )}
                      alt={store.name}
                    />
                  </div>

                  <div className="store-content-vertical">
                    <h3 className="store-name">{store.name}</h3>
                    <p className="store-address">
                      {store.address || "Address unavailable"}
                    </p>

                    <div className="store-bottom-row">
                      {showDistance && (
                        <span className="store-distance">
                          <MapPin size={14} /> {distance}
                        </span>
                      )}

                      <span className="store-rating">
                        <Star size={14} fill="#00c16e" stroke="none" />
                        {store.rating || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                
              );
            }
          )}
        </div>
        
      )}
      {!loading && canShowViewMore && (
  <div className="view-more-bottom">
    <button
      className="view-more-btn"
      onClick={() => setShowAll(!showAll)}
    >
      {showAll ? "View Less" : "View More"}
    </button>
  </div>
)}
    </div>
  );
}
