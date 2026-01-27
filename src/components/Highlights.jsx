import { useEffect, useState, useRef, useCallback } from "react";
import "./Highlights.css";
import api from "../api/axiosInstance";
import { cleanImageUrl } from "../utils";
import WishlistButton from "./WishlistButton";
import { useNavigate } from "react-router-dom";

export default function Highlights() {
  const [highlights, setHighlights] = useState([]);
  const scrollRef = useRef(null);
  const rafRef = useRef(null);
  const navigate = useNavigate();

  const handleCardClick = (storeId) => {
    if (!storeId) return;
    navigate(`/view-stores/${storeId}`);
  };
  const fetchAdvertisements = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/advertisement/list", {
        headers: { zoneId: JSON.stringify([3]), moduleId: 2 },
      });
      const ads = res.data?.data || res.data || [];
      const formattedAds = ads.map((ad) => ({
        id: ad.id,
        storeId: ad.store_id,
        banner: ad.cover_image_full_url,
        profile: ad.profile_image_full_url || ad.store?.logo_full_url,
        title: ad.title,
        storeName: ad.store?.name,
        description: ad.description,
        rating: ad.average_rating,
        reviews: ad.reviews_comments_count,
      }));
      setHighlights(formattedAds);
    } catch (err) {
      console.error("HIGHLIGHTS ERROR", err);
    }
  }, []);

  useEffect(() => {
    fetchAdvertisements();
  }, [fetchAdvertisements]);

useEffect(() => {
  const slider = scrollRef.current;
  if (!slider) return;

  const speed = window.innerWidth <= 768 ? 0.6 : 1.2;

  const autoScroll = () => {
    slider.scrollLeft += speed;

    if (slider.scrollLeft >= slider.scrollWidth / 2) {
      slider.scrollLeft = 0;
    }
    rafRef.current = requestAnimationFrame(autoScroll);
  };

  rafRef.current = requestAnimationFrame(autoScroll);
  return () => cancelAnimationFrame(rafRef.current);
}, [highlights]);

  return (
    <div className="highlight-section">
      <h2 className="highlight-title">Highlights for You</h2>
      <div className="highlight-wrapper" ref={scrollRef}>
        <div className="highlight-scroll">
          {[...highlights, ...highlights].map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="highlight-card clickable"
              onClick={() => handleCardClick(item.storeId)}
            >
              <div className="highlight-header">
                <div className="highlight-store-row">
                  <img
                    src={cleanImageUrl(item.profile)}
                    alt={item.storeName}
                    className="highlight-profile"
                  />
                  <p className="highlight-store">{item.storeName}</p>
                </div>

                <div className="highlight-rating">
                  ★ <span>{item.reviews || 0}+</span>
                </div>
              </div>

              <div className="highlight-media">
                <img src={cleanImageUrl(item.banner)} alt={item.title} />
              </div>

              <div className="highlight-content">
                <h3 className="ad-title">{item.title}</h3>
                <p className="highlight-description">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
