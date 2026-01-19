import { useEffect, useState, useRef, useCallback } from "react";
import "./Highlights.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api/axiosInstance";
import { cleanImageUrl } from "../utils";

export default function Highlights() {
  const [highlights, setHighlights] = useState([]);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const fetchAdvertisements = useCallback(async () => {
    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      const token = localStorage.getItem("token");
      const res = await api.get("/api/v1/advertisement/list", {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: abortRef.current.signal,
      });

      const ads = res.data || [];
      const formattedAds = ads.map((ad) => ({
        id: ad.id,
        type: ad.type === "video" ? "video" : "image",
        src: ad.cover_image_full_url,
        title: ad.store?.name || "Advertisement",
      }));
      setHighlights(formattedAds);
    } catch (err) {
      if (err.name !== "CanceledError") console.error("API error:", err);
    }
  }, []);

  useEffect(() => {
    fetchAdvertisements();
  }, [fetchAdvertisements]);

  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;
    let speed = 0.6;
    const autoScroll = () => {
      slider.scrollLeft += speed;
      if (slider.scrollLeft >= slider.scrollWidth - slider.clientWidth) {
        slider.scrollLeft = 0;
      }
      rafRef.current = requestAnimationFrame(autoScroll);
    };
    rafRef.current = requestAnimationFrame(autoScroll);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className="highlight-section max-w-7xl mx-auto px-4">
      <h2 className="highlight-title">Highlights for You</h2>
      <div className="highlight-wrapper" ref={scrollRef}>
        <div className="highlight-scroll">
          {highlights.map((item) => (
            <div key={item.id} className="highlight-card">
              <div className="highlight-media">
                {item.type === "image" ? (
                  <img src={cleanImageUrl(item.src)} alt={item.title} />
                ) : (
                  <iframe
                    src={item.src.includes("youtube") ? item.src : `https://www.youtube.com/embed/${item.src}`}
                    title={item.title}
                    allowFullScreen
                  />
                )}
              </div>
              <p className="highlight-name">{item.title}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="health-quote">“Invest in your body — it’s the only place you have to live.”</div>
    </div>
  );
}