import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import "./Pharmacy.css";
import { cleanImageUrl } from "../../utils";
import Loader from "../Loader";
import { MdLocationOn } from "react-icons/md";
import { AiFillStar } from "react-icons/ai";
import Footer from "../Footer";
import BackToTop from "../../components/BackToTop";

export default function Pharmacy() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userCoords, setUserCoords] = useState(null);

  useEffect(() => {
    const loadLocation = () => {
      const stored = localStorage.getItem("user_location");
      setUserCoords(stored ? JSON.parse(stored) : null);
    };
    loadLocation();
    window.addEventListener("location-updated", loadLocation);
    return () => window.removeEventListener("location-updated", loadLocation);
  }, []);

  const hasUserLocation = userCoords?.lat && userCoords?.lng;

  useEffect(() => {
    fetchStores();
  }, [hasUserLocation]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/v1/stores/get-stores/all", {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: "2",
          ...(hasUserLocation && {
            latitude: userCoords.lat,
            longitude: userCoords.lng,
          }),
          Accept: "application/json",
        },
      });
      console.log("pharmacy data", res.data);
      const storeList = Array.isArray(res?.data?.stores) ? res.data.stores : [];
      setStores(storeList);
    } catch (error) {
      console.error("Failed to fetch pharmacies", error);
    } finally {
      setLoading(false);
    }
  };

const filteredStores = stores.filter((store) => {
  if (store?.id === 74) return false;

  const searchText = search.toLowerCase();

  const nameMatch = (store?.name || "")
    .toLowerCase()
    .includes(searchText);

  const addressMatch = (store?.address || "")
    .toLowerCase()
    .includes(searchText);

  return nameMatch || addressMatch;
});


  if (loading) {
    return (
      <div className="pharmacy-loader">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="pharmacy-page">
        {/* --- Updated Header Section --- */}
        <div className="pharmacy-header">
          <h1 className="pharmacy-title">Pharmacies</h1>
          <input
            type="text"
            placeholder="Search pharmacy..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pharmacy-search"
          />
        </div>

        <div className="pharmacy-grid">
          {filteredStores.length > 0 ? (
            filteredStores.map((store, index) => {
              const showDistance =
                hasUserLocation && typeof store.distance === "number";
              const distance = showDistance
                ? `${(store.distance / 1000).toFixed(1)} km`
                : null;
              const isOpen = store.open === 1;

              return (
                <div
                  className="pharmacy-card"
                  key={store.id || index}
                  onClick={() => navigate(`/view-stores/${store.id}`)}
                >
                  <img
                    src={cleanImageUrl(store.logo_full_url)}
                    alt={store.name}
                    className="pharmacy-image"
                  />

                  <div className="pharmacy-info">
                    <h3 className="pharmacy-name">
                      {store.name || "Unnamed Pharmacy"}
                    </h3>
                    <p className="pharmacy-address">
                      {store.address || "Address not available"}
                    </p>

                    <div className="pharmacy-meta">
                      <span className="pharmacy-rating">
                        <AiFillStar size={14} /> {store.rating || "N/A"}
                      </span>
                      {distance && (
                        <span className="pharmacy-distance">
                          <MdLocationOn size={14} /> {distance}
                        </span>
                      )}

                      <span
                        className={isOpen ? "status-open" : "status-closed"}
                      >
                        {isOpen ? "Open" : "Closed"}
                      </span>
                    </div>

                    <button
                      className="visit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/view-stores/${store.id}`);
                      }}
                    >
                      Visit Store <span>→</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-data">No pharmacies found</p>
          )}
        </div>
      </div>
      <BackToTop />
      <Footer />
    </>
  );
}
