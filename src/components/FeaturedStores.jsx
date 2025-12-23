import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./FeaturedStores.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api/axiosInstance";
import { cleanImageUrl } from "../utils";

export default function FeaturedStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const animationRef = useRef(null);
  const navigate = useNavigate();

  /* ================= FETCH STORES ================= */
  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
  try {
    const stored = localStorage.getItem("user_location");

    if (!stored) {
      console.warn("User location missing");
      return;
    }

    const { lat, lng } = JSON.parse(stored);

    console.log("FINAL USER COORDS:", lat, lng);


    const res = await api.get("/api/v1/stores/recommended", {
      params: {
        limit: 10,
        offset: 0,
        type: "all", 
      },
      headers: {
        zoneId: JSON.stringify([3]),
        moduleId: "2",
         latitude: lat,         
    longitude: lng,  
        Accept: "application/json",
      },
    });
console.log("STORES RAW:", res.data?.stores);

    setStores(res.data?.stores || []);
  } catch (error) {
    console.log("ERROR:", error);
  } finally {
    setLoading(false);
  }
};



  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider || stores.length === 0) return;

    let speed = 0.6;

    const autoScroll = () => {
      slider.scrollLeft += speed;

      if (slider.scrollLeft >= slider.scrollWidth - slider.clientWidth) {
        slider.scrollLeft = 0;
      }

      animationRef.current = requestAnimationFrame(autoScroll);
    };

    animationRef.current = requestAnimationFrame(autoScroll);

    return () => cancelAnimationFrame(animationRef.current);
  }, [stores]);

  const pauseScroll = () => cancelAnimationFrame(animationRef.current);
  const resumeScroll = () => {
    animationRef.current = requestAnimationFrame(() => {
      scrollRef.current.scrollLeft += 0.6;
    });
  };

  /* ================= MANUAL SCROLL ================= */
  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -400, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 400, behavior: "smooth" });
  };

  /* ================= UI ================= */
  return (
    <div className="fs-container max-w-7xl mx-auto px-4">
      <div className="fs-header">
        <h2 className="fs-main-title">Featured Stores</h2>
        <button className="fs-see-all-btn" onClick={() => navigate("/stores")}>
          See All →
        </button>
      </div>

      {loading && <p className="fs-loading">Loading Stores...</p>}

      {!loading && stores.length > 0 && (
        <div className="fs-relative-wrapper">
          <button className="fs-scroll-btn fs-left" onClick={scrollLeft}>
            <ChevronLeft size={22} />
          </button>

          <div
            className="fs-wrapper"
            ref={scrollRef}
            onMouseEnter={pauseScroll}
            onMouseLeave={resumeScroll}
          >
            <div className="fs-scroll-content">
              {stores.map((store) => {
                const rawImage =
                  store.logo ||
                  store.cover_photo ||
                  store.image ||
                  store.image_full_url;

                const imagePath =
                  rawImage && !rawImage.includes("/")
                    ? `/storage/store/${rawImage}`
                    : rawImage;

                const image = cleanImageUrl(imagePath);

                console.log("FINAL FEATURED IMAGE:", image);

                console.log("Store Image URL:", image);
                const isOpen = store.open === 1 || store.is_open === 1;
                const distance = store.distance
  ? `${(store.distance / 1000).toFixed(1)} km`
  : null;


                return (
                  <div
                    key={store.id}
                    className="fs-card"
                    onClick={() => navigate(`/store/${store.id}`)}
                  >
                    <div className="fs-img-container">
                      <img
                        src={image || "/no-image.jpg"}
                        alt={store.name}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/no-image.jpg";
                        }}
                      />
                    </div>

                    <h3 className="fs-name">{store.name}</h3>
                    <p className="fs-address">
                      {store.address || "Address not available"}
                    </p>

                    <div className="fs-meta">
                      {distance && (
                        <span className="fs-distance">📍 {distance}</span>
                      )}
                      <span
                        className={`fs-status ${
                          isOpen ? "fs-open" : "fs-closed"
                        }`}
                      >
                        {isOpen ? "Open Now" : "Closed"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button className="fs-scroll-btn fs-right" onClick={scrollRight}>
            <ChevronRight size={22} />
          </button>
        </div>
      )}
    </div>
  );
}
