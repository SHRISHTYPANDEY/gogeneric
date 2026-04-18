import { useEffect, useState, useRef, useCallback } from "react";
import "./Highlights.css";
import api from "../api/axiosInstance";
import { cleanImageUrl } from "../utils";
import { useNavigate } from "react-router-dom";

export default function Highlights() {
  const [highlights, setHighlights] = useState([]);
  const scrollRef = useRef(null);
  const rafRef = useRef(null);
  const navigate = useNavigate();

const handleCardClick = (id, type) => {
  if (!id) return;

  if (type === "ad") {
    navigate(`/view-stores/${id}`);
  } else {
    navigate(`/doctors/${id}`); 
  }
};
  const fetchHighlights = useCallback(async () => {
  try {
    
    const [adsRes, campaignRes] = await Promise.all([
      api.get("/api/v1/advertisement/list", {
        headers: { zoneId: JSON.stringify([3]), moduleId: 2 },
      }),
      api.get("/api/v1/campaigns/highlights"),
    ]);

    // 🔹 Ads format
    const ads = adsRes.data?.data || adsRes.data || [];
    const formattedAds = ads.map((ad) => ({
      id: `ad-${ad.id}`,
      type: "ad",
      storeId: ad.store_id,
      banner: ad.cover_image_full_url,
      profile: ad.profile_image_full_url || ad.store?.logo_full_url,
      title: ad.title,
      storeName: ad.store?.name,
      description: ad.description,
      reviews: ad.reviews_comments_count,
    }));

    // 🔹 Campaign format
    const campaigns = campaignRes.data || [];
    const formattedCampaigns = campaigns.map((item) => ({
  id: `camp-${item.id}`,
  type: "campaign",
  storeId: item.doctor_id,
  banner: `https://www.gogenericpharma.com/storage/${item.image}`,
  profile: item.doctor_photo
    ? `https://www.gogenericpharma.com/storage/${item.doctor_photo}`
    : null,
  title: item.title,
  storeName: item.doctor_name,
  description: item.description,
}));
console.log("Formatted Ads:", formattedAds);
console.log("Formatted Campaigns:", formattedCampaigns);
    // 🔥 Merge both
    const merged = [...formattedCampaigns, ...formattedAds];

    setHighlights(merged);

  } catch (err) {
    console.error("HIGHLIGHTS ERROR", err);
  }
}, []);
useEffect(() => {
  fetchHighlights();
}, [fetchHighlights]);

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