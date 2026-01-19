import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { cleanImageUrl } from "../utils";
import { useNavigate } from "react-router-dom";
import "./VisitAgain.css";
import Loader from "./Loader";
import { MapPin, Clock } from "lucide-react";

export default function VisitAgain() {
  const [visitAgain, setVisitAgain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState(null);

  const navigate = useNavigate();

  // ✅ Load location (same as Stores)
  useEffect(() => {
    const loadLocation = () => {
      const stored = localStorage.getItem("user_location");
      setUserCoords(stored ? JSON.parse(stored) : null);
    };

    loadLocation();
    window.addEventListener("location-updated", loadLocation);

    return () =>
      window.removeEventListener("location-updated", loadLocation);
  }, []);

  const hasUserLocation = userCoords?.lat && userCoords?.lng;

  // ✅ Fetch API when location is ready
  useEffect(() => {
    fetchVisitAgain();
  }, [hasUserLocation]);

  const fetchVisitAgain = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/v1/customer/visit-again", {
        headers: {
          moduleId: "2",
          zoneId: JSON.stringify([3]),
          ...(hasUserLocation && {
            latitude: userCoords.lat,
            longitude: userCoords.lng,
          }),
          Accept: "application/json",
        },
      });

      const data = Array.isArray(res.data) ? res.data : [];

      // ✅ SORT BY DISTANCE (same logic as Stores)
      const sortedData = hasUserLocation
        ? sortByDistance(data)
        : data;

      setVisitAgain(sortedData);
    } catch (err) {
      console.log("Visit Again Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Distance sorting helper
  const sortByDistance = (list) => {
    return [...list].sort((a, b) => {
      if (!a.distance) return 1;
      if (!b.distance) return -1;
      return a.distance - b.distance;
    });
  };

  return (
    <div className="visit-again-section">
      <h2 className="section-title1">Visit Again</h2>
      <p className="section-subtitle">
        Get your recent purchase from the shop you recently visited
      </p>

      {loading ? (
        <Loader text="Loading..." />
      ) : (
        <div className="visit-again-scroll">
          {visitAgain.map((item) => {
            const distance =
              hasUserLocation && item.distance
                ? `${(item.distance / 1000).toFixed(1)} km`
                : null;

            return (
              <div
                key={item.id}
                className="visit-card"
                onClick={() => navigate(`/view-stores/${item.id}`)}
              >
                <img
                  src={cleanImageUrl(
                    item.logo
                      ? `/storage/store/${item.logo}`
                      : item.cover_photo
                  )}
                  alt={item.name}
                />

                <p className="visit-name">{item.name}</p>

                {item.address && (
                  <p className="visit-address">{item.address}</p>
                )}

                <div className="visit-meta">
                  {distance && (
                    <span className="visit-distance">
                      <MapPin size={14} /> {distance}
                    </span>
                  )}

                  {item.delivery_time && (
                    <span className="visit-delivery">
                      <Clock size={14} /> {item.delivery_time}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
