import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Phone, Mail } from "lucide-react";
import api from "../../api/axiosInstance";
import { cleanImageUrl } from "../../utils";
import Loader from "../Loader";
import BackToTop from "../BackToTop";
import LabCategoryCards from "../LabCategories";
import "./Labs.css";

export default function Labs() {
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchLab = async () => {
      try {
        const res = await api.get("/api/v1/stores/details/74", {
          headers: {
            zoneId: JSON.stringify([3]),
            moduleId: "2",
            Accept: "application/json",
          },
        });

        if (isMounted) setLab(res.data || null);
      } catch (err) {
        console.error("Lab fetch error:", err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLab();
    return () => (isMounted = false);
  }, []);

  if (loading) {
    return (
      <div className="labs-page max-w-7xl mx-auto px-4">
        <h2 className="labs-heading">Our Partner Lab</h2>
        <Loader />
      </div>
    );
  }

  if (error || !lab) {
    return (
      <div className="labs-page max-w-7xl mx-auto px-4">
        <h2 className="labs-heading">Our Partner Lab</h2>
        <p className="labs-error">Lab information is currently unavailable.</p>
      </div>
    );
  }

  const showDistance = typeof lab.distance === "number" && lab.distance < 50000;
  const distance = showDistance ? `${(lab.distance / 1000).toFixed(1)} km` : null;

  return (
    <>
  <LabCategoryCards />

  <div className="labs-page max-w-7xl mx-auto px-4">
    <h2 className="labs-heading">Our Partner Lab</h2>
    <p className="labs-sub">Trusted diagnostic partner</p>

    <div
      className="store-card-6am lab-card"
      onClick={() => navigate(`/view-stores/${lab.id}`)}
    >
      {/* IMAGE */}
      <div className="store-image-wrapper">
        <img
          src={cleanImageUrl(lab.cover_photo_full_url || lab.cover_photo || "")}
          alt={lab.name || "Lab Image"}
          loading="lazy"
        />
      </div>

      {/* CONTENT */}
      <div className="store-content-vertical">
        <h3 className="store-name">{lab.name}</h3>
        <p className="store-address">{lab.address || "Address unavailable"}</p>
        {lab.phone && (
          <p className="store-address">
            <Phone size={14} /> {lab.phone}
          </p>
        )}
        {lab.email && (
          <p className="store-address">
            <Mail size={14} /> {lab.email}
          </p>
        )}
        <div className="store-bottom-row">
          {typeof lab.distance === "number" && lab.distance < 50000 && (
            <span className="store-distance1">
              <MapPin size={14} />
              {(lab.distance / 1000).toFixed(1)} km
            </span>
          )}
          <span className="store-rating">
            <Star size={14} fill="#00c16e" stroke="none" />
            {lab.avg_rating > 0 ? lab.avg_rating : "N/A"}
          </span>
        </div>
      </div>
    </div>
  </div>

  <BackToTop />
</>

  );
}
