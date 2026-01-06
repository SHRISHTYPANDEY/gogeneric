import { useEffect, useRef, useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import api from "../../api/axiosInstance";
import "./Searchbar.css";
import { cleanImageUrl } from "../../utils";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";

export default function Searchbar() {
  const fuseOptions = {
  keys: ["name"],
  threshold: 0.4,   // 🔥 typo tolerance (0 = exact, 1 = loose)
  distance: 100,
  minMatchCharLength: 2,
};

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const cacheRef = useRef({});

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

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      clearTimeout(debounceRef.current);
    };
  }, []);

  const triggerSearch = useCallback(
    (text) => {
      const searchText = text.trim().toLowerCase();

      if (searchText.length < 2 || !location) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        fetchResults(searchText);
      }, 300);
    },
    [location]
  );

  useEffect(() => {
    triggerSearch(query);
  }, [query, triggerSearch]);

  /* 🔍 Fetch API */
  const fetchResults = async (searchText) => {
  try {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);

    const safeQuery = searchText.slice(0, 3); // ✅ CORRECT PLACE

    const res = await api.get("/api/v1/items/item-or-store-search", {
      params: { name: safeQuery },
      headers: {
        zoneId: "[3]",
        moduleId: 2,
        latitude: location.latitude,
        longitude: location.longitude,
      },
      signal: abortRef.current.signal,
    });

    const rawData = [
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

    const fuse = new Fuse(rawData, {
      keys: ["name"],
      threshold: 0.45,
      ignoreLocation: true,
    });

    const finalResults = fuse.search(searchText).map(r => r.item);

    setResults(finalResults);
    setShowDropdown(true);
  } catch (err) {
    if (err.name !== "CanceledError") console.error(err);
  } finally {
    setLoading(false);
  }
};



  const handleKeyDown = (e) => {
  if (e.key === "Enter") {
    e.preventDefault();

    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) return;
    setShowDropdown(false);
    setIsMobileOpen(false);
    setActiveIndex(-1);

    navigate(`/searchlist?query=${encodeURIComponent(trimmedQuery)}`);
    return;
  }

  if (!showDropdown || results.length === 0) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    setActiveIndex((i) => (i + 1) % results.length);
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();
    setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
  }

  if (e.key === "Escape") {
    setShowDropdown(false);
    setActiveIndex(-1);
  }
};
  const handleSelect = (item) => {
    setShowDropdown(false);
    setIsMobileOpen(false);
    setActiveIndex(-1);

    const id = item.id.split("-")[1];

    navigate(
      item.type === "medicine" ? `/medicine/${id}` : `/view-stores/${id}`
    );
  };

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

  return (
    <header className="header-main max-w-7xl mx-auto px-4 py-3">
      <div className="header-container">
        <h2 className="logo">GOGENRIC Healthcare</h2>

        <div
          className={`search-wrapper ${isMobileOpen ? "mobile-open" : ""}`}
          ref={wrapperRef}
        >
          <div className="search-bar">
            <Search size={18} />
            <input
              value={query}
              placeholder="Search medicines, brands, stores..."
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
