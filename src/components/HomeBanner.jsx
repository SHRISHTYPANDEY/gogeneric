import { useEffect, useState, useCallback } from "react";
import "./HomeBanner.css";
import api from "../api/axiosInstance";
import { cleanImageUrl } from "../utils";

export default function HomeBanner() {
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    api.get("/api/v1/banners", {
        headers: { zoneId: "[3]", moduleId: "2", Accept: "application/json" },

      })
      .then((res) => {
        // console.log("API Response:", res.data); 
        const bannerData = res.data?.banners || [];
        // console.log("Banners Array:", bannerData); 
        bannerData.forEach((b, i) => {
          // console.log(`Banner ${i} ID: ${b.id}`);
          // console.log(`Banner ${i} Image Raw:`, b.image);
          // console.log(`Banner ${i} Image Full URL:`, b.image_full_url);
          // console.log(`Banner ${i} Cleaned URL:`, cleanImageUrl(b.image_full_url || b.image));
        });
        setBanners(bannerData);
      })
      .catch((err) => console.error("Banner error:", err));
  }, []);

  const nextSlide = useCallback(() => {
    if (banners.length > 0) {
      setIndex((prev) => (prev + 1) % banners.length);
    }
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [banners.length, nextSlide]);

  if (banners.length === 0) return <div className="hero-skeleton"></div>;

  return (
    <div className="hero-full-width">
      <div className="hero-slider-wrapper">
        {banners.map((banner, i) => (
          <div 
            className={`hero-slide ${i === index ? "active" : ""}`} 
            key={banner.id || i}
          >
            <img
              src={cleanImageUrl(banner?.image_full_url || banner?.image)}
              alt="Premium Banner"
              className="hero-img-full"
            />
            <div className="hero-overlay-dark"></div>
          </div>
        ))}

        {/* Dots Pagination */}
        <div className="hero-dots-container">
          {banners.map((_, i) => (
            <span 
              key={i} 
              className={`hero-dot ${i === index ? "active" : ""}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}