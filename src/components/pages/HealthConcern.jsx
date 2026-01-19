import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import "./HealthConcern.css";
import { cleanImageUrl } from "../../utils";
import WishlistButton from "../WishlistButton";
import AddToCartButton from "../CartButton";
import Loader from "../Loader";
const HealthConcern = () => {
  const { concernSlug } = useParams();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const concernName = location.state?.concernName || "Medicines";
  const headingText = `Best Medicines for ${concernName} Care`;
  useEffect(() => {
    fetchMedicines();
  }, [concernSlug]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(
        `/api/v1/common-condition/items/${concernSlug}`,
        {
          params: {
            limit: 10,
            offset: 1,
          },
          headers: {
            zoneId: JSON.stringify([3]),
            moduleId: 2,
            Accept: "application/json",
          },
        }
      );

      setMedicines(res.data?.products || []);
    } catch (err) {
      console.error(err);
      setError("Medicines not available");
    } finally {
      setLoading(false);
    }
  };
  const handleProductClick = (item) => {
    navigate(`/medicine/${item.id}`);
  };

  return (
    <div className="concern-page">
      {/* HEADER */}
      <div className="concern-header">
        <h1 className="concern-title">{headingText}</h1>
        <div className="concern-search">
          <input
            type="text"
            placeholder="Search medicines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="concern-line"></div>
      </div>

      {loading && <Loader text="Loading Medicines..." />}
      {error && <p className="status-text error">{error}</p>}

      {!loading && medicines.length > 0 && (
        <div className="medicine-grid">
          {medicines
            .filter((item) =>
              item.name?.toLowerCase().includes(search.toLowerCase())
            )
            .map((item) => (
              <div
                className="medicine-card"
                key={item.id}
                onClick={() => handleProductClick(item)}
                role="button"
                tabIndex={0}
              >
                <div onClick={(e) => e.stopPropagation()}>
                  <WishlistButton item={item} />
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <AddToCartButton item={item} />
                </div>

                <div className="card-img-wrapper">
                  <img
                    src={
                      cleanImageUrl(item.image_full_url) ||
                      cleanImageUrl(item.image) ||
                      "/no-image.jpg"
                    }
                    alt={item.name}
                    onError={(e) => (e.currentTarget.src = "/no-image.jpg")}
                  />
                </div>

                <div className="card-content">
                  <h3>{item.name}</h3>
                  {/* Rupee Symbol ke saath price */}
                  <p className="price">₹{item.price}</p>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default HealthConcern;
