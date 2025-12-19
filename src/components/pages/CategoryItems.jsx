import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { cleanImageUrl } from "../../utils";
import "./CategoryItems.css";
import { Plus, Search } from "lucide-react";
import { addToCart } from "../../utils/cartHelper";
import Loader from "../Loader";
import WishlistButton from "../WishlistButton";

export default function CategoryItems() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  const [categoryName] = useState(
    location.state?.categoryName || "Category Products"
  );

  /* ❌ Cleanup */
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      clearTimeout(debounceRef.current);
    };
  }, []);

  /* 📦 Fetch category items (AbortController) */
  const fetchCategoryItems = useCallback(async () => {
    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setLoading(true);

      const res = await api.get(`/api/v1/categories/items/${id}`, {
        params: {
          limit: 20,
          offset: 1,
        },
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
        },
        signal: abortRef.current.signal,
      });

      const data =
        res.data?.items ||
        res.data?.products ||
        [];

      setItems(data);
      setFilteredItems(data);
    } catch (err) {
      if (err.name !== "CanceledError") {
        console.error("Category items error:", err?.response?.data);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  /* 🔁 Load when category changes */
  useEffect(() => {
    fetchCategoryItems();
  }, [fetchCategoryItems]);

  /* 🔍 Debounced local search */
  useEffect(() => {
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (!search.trim()) {
        setFilteredItems(items);
        return;
      }

      const lower = search.toLowerCase();
      setFilteredItems(
        items.filter((item) =>
          item.name.toLowerCase().includes(lower)
        )
      );
    }, 250);

    return () => clearTimeout(debounceRef.current);
  }, [search, items]);

  if (loading) {
    return <Loader text="Loading products..." />;
  }

  return (
    <div className="category-items-page">
      {/* 🔹 HEADER ROW */}
      <div className="category-header">
        <h2 className="page-title">{categoryName}</h2>

        {/* 🔍 SEARCH BOX */}
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <p className="empty-text">No products found</p>
      ) : (
        <div className="items-grid">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className={`item-card grad-${(index % 8) + 1}`}
              onClick={() =>
                navigate(`/medicine/${item.id}`, {
                  state: {
                    price: item.price,
                    store_id: item.store_id,
                  },
                })
              }
            >
              <WishlistButton item={item} />

              <div
                className="add-cart-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart({
                    item,
                    navigate,
                    location,
                  });
                }}
              >
                <Plus size={18} />
              </div>

              <img
                src={cleanImageUrl(item.image_full_url)}
                alt={item.name}
                onError={(e) => {
                  e.currentTarget.src = "/no-image.png";
                }}
              />

              <h4>{item.name}</h4>
              <p>₹{item.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
