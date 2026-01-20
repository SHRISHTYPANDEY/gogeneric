import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { cleanImageUrl } from "../../utils";
import "./CategoryItems.css";
import { Search } from "lucide-react";
import Loader from "../Loader";
import WishlistButton from "../WishlistButton";
import AddToCartButton from "../CartButton";

export default function CategoryItems() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  const categoryName =
    location.state?.categoryName || "Category Products";

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    setItems([]);
    setFilteredItems([]);
    setSearch("");
    setIsLoading(true);
  }, [id]);

 const requestIdRef = useRef(0);

const fetchCategoryItems = useCallback(async () => {
  const requestId = ++requestIdRef.current;

  try {
    setIsLoading(true);

    const res = await api.get(`/api/v1/categories/items/${id}`, {
      params: { limit: 20, offset: 1 },
      headers: {
        zoneId: JSON.stringify([3]),
        moduleId: 2,
      },
    });

    if (requestId !== requestIdRef.current) return;

    const data =
      res.data?.items ||
      res.data?.products ||
      [];

    setItems(data);
    setFilteredItems(data);
  } catch (err) {
    if (requestId === requestIdRef.current) {
      console.error("Category items error:", err);
    }
  } finally {
    if (requestId === requestIdRef.current) {
      setIsLoading(false);
    }
  }
}, [id]);
  useEffect(() => {
    fetchCategoryItems();
  }, [fetchCategoryItems]);

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

  if (isLoading) {
    return (
      <div className="category-items-page">
        <div className="category-loader">
          <Loader text="Loading medicines..." />
        </div>
      </div>
    );
  }

  return (
    <div className="category-items-page">
      {/* 🔹 HEADER */}
      <div className="category-header">
        <h2 className="page-title">Best Medicines for {categoryName}</h2>

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

      {items.length === 0 && (
        <p className="empty-text">No medicines found</p>
      )}

      {filteredItems.length > 0 && (
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
              <AddToCartButton item={item} />
<div className="card-img-wrapper">
    <img src={cleanImageUrl(item.image_full_url)} alt={item.name} />
  </div>
            <div className="card-content">
    <h4>{item.name}</h4>
    <p className="price">₹{item.price}</p>
  </div>
</div>
          ))}
        </div>
      )}
    </div>
  );
}
