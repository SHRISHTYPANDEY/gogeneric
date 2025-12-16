import { useEffect, useState } from "react";
import "./HomeBanner.css";
import api from "../api/axiosInstance";
import { cleanImageUrl } from "../utils";
import Loader from "./Loader";

const DUMMY_BANNER = "/orange.png"; 

export default function HomeBanner() {
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const getBannerUrl = (banner) => {
    if (!banner) return DUMMY_BANNER;

    const rawImage =
      banner.image_full_url ||
      banner.image ||
      banner.image_url ||
      banner.photo;

    if (!rawImage) return DUMMY_BANNER;

    let normalizedPath = rawImage;

    if (!rawImage.includes("/")) {
      normalizedPath = `/storage/banner/${rawImage}`;
    }

    return cleanImageUrl(normalizedPath) || DUMMY_BANNER;
  };

  useEffect(() => {
    setLoading(true);

    api
      .get("/api/v1/banners", {
        headers: {
          zoneId: "[1]",
          moduleId: "2",
          Accept: "application/json",
        },
      })
      .then((res) => {
        setBanners(res.data?.banners || []);
      })
      .catch((err) => {
        console.error("Banner fetch error:", err);
        setBanners([]); 
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners]);

  return (
    <div className="banner-container max-w-7xl mx-auto px-4 py-2">
      {loading ? (
        <Loader text="Loading banners..." />
      ) : (
        <img
          src={
            banners.length > 0
              ? getBannerUrl(banners[index])
              : DUMMY_BANNER
          }
          alt="banner"
          className="banner-image fade"
          onError={(e) => {
            e.currentTarget.src = DUMMY_BANNER;
          }}
        />
      )}
    </div>
  );
}
