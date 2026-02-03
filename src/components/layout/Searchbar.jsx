import { useEffect, useRef, useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import api from "../../api/axiosInstance";
import "./Searchbar.css";
import { cleanImageUrl } from "../../utils";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import { encodeId } from "../../utils/idObfuscator";
export default function Searchbar({ isModal = false, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (isModal) document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "unset");
  }, [isModal]);

  useEffect(() => {
    if (!isModal) return;
    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [isModal, onClose]);

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

  const fetchResults = async (searchText) => {
  try {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const res = await api.get("/api/v1/items/item-or-store-search", {
      params: { name: searchText.slice(0, 3) },
      headers: {
        zoneId: "[3]",
        moduleId: 2,
        latitude: location.latitude,
        longitude: location.longitude,
      },
      signal: abortRef.current.signal,
    });
// console.log("item-store-search data", res.data);
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

    const fuse = new Fuse(data, { keys: ["name"], threshold: 0.45 });
    setResults(fuse.search(searchText).map((r) => r.item));
  } catch (e) {
    if (e.name !== "CanceledError") console.error(e);
  } finally {
    setLoading(false);
  }
};

const triggerSearch = useCallback(
  (text) => {
    if (!location || text.length < 2) {
      setShowDropdown(false);
      return;
    }

    setShowDropdown(true); 
    setLoading(true);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchResults(text);
    }, 300);
  },
  [location]
);


  useEffect(() => {
    triggerSearch(query);
  }, [query, triggerSearch]);

  const handleSelect = (item) => {
  onClose?.();

  const rawId = item.id.split("-")[1];
  const encodedId = encodeId(rawId);

  navigate(
    item.type === "medicine"
      ? `/medicine/${encodedId}`
      : `/view-stores/${encodedId}`
  );
};

  const handleKeyDown = (e) => {
  if (e.key !== "Enter") return;

  if (activeIndex >= 0 && results[activeIndex]) {
    handleSelect(results[activeIndex]);
    return;
  }

  if (query.trim()) {
    onClose?.();
    navigate(`/searchlist?query=${encodeURIComponent(query.trim())}`);
  }
};
useEffect(() => {
  setActiveIndex(-1);
}, [query]);
const handleClear = () => {
  setQuery("");
  setResults([]);
  setShowDropdown(false);
  setActiveIndex(-1);
};


return (
  <header className={`header-main ${isModal ? "modal-mode" : ""}`}>
    <div className="header-container">
      <div className="search-wrapper" ref={wrapperRef}>
        <div className="search-bar">
          <Search size={22} className="search-icon" />
          <input
            autoFocus={isModal}
            value={query}
            placeholder="Search medicines or stores..."
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e)}
          />
          {/* Input clear karne ke liye chota cross */}
          {query && (
            <X size={20} className="clear-query" onClick={handleClear} />
          )}
        </div>

        {showDropdown && (
  <div className="search-dropdown">
    {loading && <div className="loader">Searching...</div>}

    {!loading && results.length === 0 && (
      <div className="empty-state">No results found</div>
    )}

    {!loading &&
      results.map((item) => (
        <div
          key={item.id}
          className="search-item"
          onClick={() => handleSelect(item)}
        >
          <img src={cleanImageUrl(item.image)} alt={item.name} />
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
