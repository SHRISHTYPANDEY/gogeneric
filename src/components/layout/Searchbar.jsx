import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import api from "../../api/axiosInstance";
import "./Searchbar.css";
import { cleanImageUrl } from "../../utils";

export default function Searchbar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const wrapperRef = useRef(null);
  const abortRef = useRef(null);
  const cacheRef = useRef({});

  // 📍 Location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      () => setLocation({ latitude: 0, longitude: 0 })
    );
  }, []);

  // 🔍 Debounce
  useEffect(() => {
    if (!query.trim() || query.length < 2 || !location) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      fetchResults(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, location]);

  // ❌ Outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ⌨️ Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev <= 0 ? results.length - 1 : prev - 1
      );
    }

    if (e.key === "Enter" && activeIndex >= 0) {
      handleSelect(results[activeIndex]);
    }

    if (e.key === "Escape") {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  // 🚀 Fetch (with cache)
  const fetchResults = async (searchText) => {
    if (cacheRef.current[searchText]) {
      setResults(cacheRef.current[searchText]);
      setShowDropdown(true);
      return;
    }

    try {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setLoading(true);

      const res = await api.get("/api/v1/items/item-or-store-search", {
        params: { name: searchText },
        headers: {
          zoneId: "[3]",
          moduleId: 2,
          latitude: location.latitude,
          longitude: location.longitude,
        },
        signal: abortRef.current.signal,
      });

      const data = [
        ...(res.data?.items || []).map((i) => ({
          id: `item-${i.id}`,
          type: "medicine",
          name: i.name,
          image: i.image_full_url || i.image,
        })),
        ...(res.data?.stores || []).map((s) => ({
          id: `store-${s.id}`,
          type: "store",
          name: s.name,
          image: s.logo || s.image_full_url,
        })),
      ];

      cacheRef.current[searchText] = data;
      setResults(data);
      setShowDropdown(true);
    } catch (err) {
      if (err.name !== "CanceledError") console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Select item
  const handleSelect = (item) => {
    console.log("SELECTED:", item);
    setShowDropdown(false);
    setIsMobileOpen(false);
    setActiveIndex(-1);
  };

  return (
    <header className="header-main">
      <div className="header-container">
        <h2 className="logo">GOGENRIC Healthcare</h2>

        <div
          className={`search-wrapper ${isMobileOpen ? "mobile-open" : ""}`}
          ref={wrapperRef}
        >
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search medicines, brands, stores..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                setShowDropdown(true);
                if (window.innerWidth < 768) setIsMobileOpen(true);
              }}
              onKeyDown={handleKeyDown}
            />
            {isMobileOpen && (
              <X className="close-btn" onClick={() => setIsMobileOpen(false)} />
            )}
          </div>

          {showDropdown && (
            <div className="search-dropdown">
              {loading && <div className="loader">Searching…</div>}

              {!loading && results.length === 0 && (
                <p className="empty-text">No results found</p>
              )}

              {!loading &&
                results.map((item, index) => (
                  <div
                    key={item.id}
                    className={`search-item ${
                      index === activeIndex ? "active" : ""
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => handleSelect(item)}
                  >
                    <img
                      src={cleanImageUrl(item.image) || "/no-image.jpg"}
                      alt={item.name}
                    />
                    <div className="search-info">
                      <p>{item.name}</p>
                      <span className={`search-type ${item.type}`}>
                        {item.type}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
