import { useEffect, useState } from "react";
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
  const [activeTab, setActiveTab] = useState("overview");
const [reviews, setReviews] = useState([]);
const [reviewsLoading, setReviewsLoading] = useState(false);

  const navigate = useNavigate();

  

  async function fetchStoresByFilter(filter) {
    console.log(" FETCH TRIGGERED FOR FILTER:", filter);

    setLoading(true);

    let url = "/api/v1/stores/get-stores/all";

    if (filter === "Newly Joined")
      url = "/api/v1/stores/get-stores/newly-joined";

    if (filter === "Popular") url = "/api/v1/stores/popular";

    if (filter === "Top Rated") url = "/api/v1/stores/get-stores/top-rated";

    // console.log("API URL:", url);

    try {
      const res = await api.get(url, {
        headers: { zoneId: JSON.stringify([3]),
           moduleId: 2,
         },
       
      });

      console.log("API RESPONSE:", res.data);

      const data = res.data.stores;

      setStores(data);
      setFilteredStores(data);
    } catch (err) {
      console.log(" Filtered API Error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStoresByFilter(activeFilter);
  }, [activeFilter]);

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
                style={{ cursor: "pointer" }}
              >
                <div className="store-image-wrapper">
                  <img
                    src={cleanImageUrl(
                      store.cover_photo_full_url || store.cover_photo
                    )}
                    alt={store.name}
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
                      {store.distance > 1000
                        ? (store.distance / 1000).toFixed(1)
                        : Number(store.distance).toFixed(1)}{" "}
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
