import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import { cleanImageUrl } from "../../utils";
import Loader from "../Loader";
import "./FeaturedStoreDetails.css";

export default function FeaturedStoreDetails() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendedItems();
  }, [id]);

  const fetchRecommendedItems = async () => {
    try {
      const res = await api.get("/api/v1/items/recommended", {
        params: {
          store_id: id,
          limit: 20,
          offset: 0,
        },
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
        },
      });
      // console.log("Recommended API full response:", res.data);
      
      // console.log("Store ID from URL:", id);


      setItems(res.data?.data?.items || []);

    } catch (err) {
      console.error("Recommended items error:", err?.response?.data);
    } finally {
      setLoading(false);
    }
  };

    if (loading) { 
    return <Loader text="Loading recommended products..." />;
  }

  return (
    <div className="store-details-page max-w-7xl mx-auto px-4 py-6">
      <h2 className="section-title">Recommended Products</h2>

      {items.length === 0 ? (
  <div className="empty-state">
    <p>No recommended products available for this store.</p>
  </div>
) : (
        <div className="items-grid">
          {items.map((item) => (
            
            <div key={item.id} className="item-card">
              <img
                src={cleanImageUrl(item.image_full_url)}
                alt={item.name}
                onError={(e) => (e.target.src = "/no-image.png")}
              />
              <h4>{item.name}</h4>
              <p>₹{item.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
