import { useEffect, useState } from "react";
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

  const [categoryName, setCategoryName] = useState(
    location.state?.categoryName || "Category Products"
  );

  useEffect(() => {
    setLoading(true);
    fetchCategoryItems();
  }, [id]);

  useEffect(() => {
    if (!search) {
      setFilteredItems(items);
    } else {
      setFilteredItems(
        items.filter((item) =>
          item.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, items]);

  const fetchCategoryItems = async () => {
    try {
      const res = await api.get(`/api/v1/categories/items/${id}`, {
        params: {
          limit: 20,
          offset: 1,
        },
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
        },
      });

      const data =
        res.data?.items ||
        res.data?.products ||
        [];

      setItems(data);
      setFilteredItems(data);
    } catch (err) {
      console.error("Category items error:", err?.response?.data);
    } finally {
      setLoading(false);
    }
  };

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
            >
              <WishlistButton item={item} />

              <div
                className="add-cart-btn"
                onClick={() =>
                  addToCart({
                    item,
                    navigate,
                    location,
                  })
                }
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
