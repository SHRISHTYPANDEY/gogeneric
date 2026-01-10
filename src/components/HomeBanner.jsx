import { useEffect, useState } from "react";
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
      .then((res) => setBanners(res.data?.banners || []))
      .catch((err) => console.error("Banner error:", err));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  if (banners.length === 0) return <div className="hero-skeleton"></div>;

  return (
    <div className="hero-container">
      <div className="hero-main-layout">
        
        {/* 30% Content Area */}
        <div className="hero-text-section" key={`text-${index}`}>
          <div className="hero-badge">Health Awareness</div>
          <h1 className="hero-title">
            Smart Choice for <br /> <span>Better Health</span>
          </h1>
          <p className="hero-desc">
            High-quality generic medicines and expert advice.
          </p>
          
          <div className="hero-pagination">
            {banners.map((_, i) => (
              <span 
                key={i} 
                className={`pagi-dot ${i === index ? "active" : ""}`}
                onClick={() => setIndex(i)}
              ></span>
            ))}
          </div>
        </div>
        <div className="hero-image-section">
          <div className="image-wrapper" key={`img-${index}`}>
            <img
              src={cleanImageUrl(banners[index]?.image_full_url || banners[index]?.image)}
              alt="Banner"
              className="hero-img"
            />
            <div className="hero-edge-fade"></div>
          </div>
        </div>

      </div>
    </div>
  );
}