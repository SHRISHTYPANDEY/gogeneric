import { useEffect, useState, useCallback } from "react";
import "./HomeBanner.css";
import api from "../api/axiosInstance";
import { cleanImageUrl } from "../utils";
import { FastAverageColor } from "fast-average-color";
const fac = new FastAverageColor();

export default function HomeBanner() {
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);
  const [themeColor, setThemeColor] = useState("#016B61"); // fallback

  // ✅ Utility to check if src is Base64
  function isBase64Image(src) {
    return src.startsWith("data:image/");
  }

  useEffect(() => {
    api.get("/api/v1/banners", {
        headers: { zoneId: "[3]", moduleId: "2", Accept: "application/json" },
      })
      .then((res) => {
        const bannerData = res.data?.banners || [];
        setBanners(bannerData);

        // Optional: log first banner type
        if (bannerData[0]?.image || bannerData[0]?.image_full_url) {
          const firstImage = cleanImageUrl(bannerData[0].image_full_url || bannerData[0].image);
          console.log("First banner is Base64?", isBase64Image(firstImage));
        }
      })
      .catch((err) => console.error("Banner error:", err));
  }, []);

  // Color extraction (only for Base64 images)
  useEffect(() => {
    if (banners.length === 0) return;

    const imgSrc = cleanImageUrl(banners[index].image_full_url || banners[index].image);
    if (!imgSrc || !isBase64Image(imgSrc)) return; // skip if not Base64

    const img = new Image();
    img.src = imgSrc;

    img.onload = () => {
      try {
        const color = fac.getColor(img, { defaultColor: [1, 107, 97] }); // fallback
        const hex = rgbToHex(color.value[0], color.value[1], color.value[2]);
        setThemeColor(hex);
      } catch (e) {
        console.warn("Color extraction failed", e);
      }
    };

    img.onerror = () => console.warn("Image load failed for color extraction");
  }, [index, banners]);

  const rgbToHex = (r, g, b) =>
    "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");

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
    <>
      <style>{`
        :root {
          --primary-deep: ${themeColor};
        }
      `}</style>
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
    </>
  );
}