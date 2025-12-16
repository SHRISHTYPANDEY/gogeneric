import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axiosInstance";
import { cleanImageUrl } from "../../utils";
import { addToCart } from "../../utils/cartHelper";
import WishlistButton from "../WishlistButton";

import {
  MapPin,
  Star,
  Phone,
  Mail,
  Share2,
  Navigation,
  Plus,
} from "lucide-react";

import "./StoreDetails.css";
import Loader from "../Loader";

export default function StoreDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  /* ================= Fetch Store ================= */
  useEffect(() => {
    fetchStoreDetails();
  }, [id]);

  useEffect(() => {
    if (store?.id) fetchProducts();
  }, [store]);

  const fetchStoreDetails = async () => {
    try {
      const res = await api.get(`/api/v1/stores/details/${id}`, {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
        },
      });
      setStore(res.data);
    } catch (err) {
      console.error("Store details error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  /* ================= Products ================= */
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await api.get("/api/v1/items/latest", {
        params: {
          store_id: id,
          category_id: store.category_details?.[0]?.id || 1,
          limit: 20,
          offset: 1,
        },
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
        },
      });

      setProducts(res.data.products || res.data.items || []);
    } catch (err) {
      console.error("Products error:", err.response?.data);
    } finally {
      setProductsLoading(false);
    }
  };

  /* ================= Reviews ================= */
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await api.get("/api/v1/stores/reviews", {
        params: { store_id: id },
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
        },
      });
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error("Reviews error:", err.response?.data);
    } finally {
      setReviewsLoading(false);
    }
  };

  /* ================= Search Filters ================= */
  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReviews = reviews.filter(
    (r) =>
      r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loader text="Loading store details..." />;
  if (!store) return <div>Store not found</div>;

  return (
    <div className="z-store-page">
      <p className="breadcrumb">Home / Stores / {store.name}</p>

      {/* ===== Header ===== */}
      <div className="store-header">
        <div>
          <h1 className="store-title">{store.name}</h1>
          <p className="store-categories">
            {store.category_details?.map((c) => c.name).join(", ")}
          </p>
          <p className="store-address">
            <MapPin size={14} /> {store.address}
          </p>
        </div>

        <div className="rating-box">
          <div className="rating-value">
            {store.avg_rating || "N/A"}
            <Star size={14} fill="#fff" stroke="none" />
          </div>
          <p>Store Rating</p>
        </div>
      </div>

      {/* ===== Actions ===== */}
      <div className="action-row">
        <button><Navigation size={16} /> Direction</button>
        <button><Share2 size={16} /> Share</button>
        <button><Phone size={16} /> Call</button>
      </div>

      {/* ===== Image ===== */}
      <div className="single-image">
        <img src={cleanImageUrl(store.cover_photo_full_url)} alt={store.name} />
      </div>

      {/* ===== Tabs + Search ===== */}
      <div className="tabs-row">
        <div className="tabs">
          {["products", "overview", "reviews"].map((tab) => (
            <span
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => {
                setActiveTab(tab);
                setSearchTerm("");
                if (tab === "reviews" && reviews.length === 0) fetchReviews();
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </span>
          ))}
        </div>

        {(activeTab === "products" || activeTab === "reviews") && (
          <input
            className="tab-search"
            placeholder={
              activeTab === "products"
                ? "Search products..."
                : "Search reviews..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}
      </div>

      {/* ===== OVERVIEW ===== */}
      {activeTab === "overview" && (
        <>
          <div className="overview-section">
            <h3>Contact Information</h3>
            <p><Phone size={14} /> {store.phone || "N/A"}</p>
            <p><Mail size={14} /> {store.email || "N/A"}</p>
          </div>

          <div className="overview-section">
            <h3>Available Categories</h3>
            <p>{store.category_details?.map((c) => c.name).join(", ")}</p>
          </div>
        </>
      )}

      {/* ===== PRODUCTS ===== */}
      {activeTab === "products" && (
        <div className="products-section">
          {productsLoading ? (
            <Loader text="Loading products..." />
          ) : filteredProducts.length === 0 ? (
            <p>No products found</p>
          ) : (
            filteredProducts.map((p) => (
              <div key={p.id} className="product-card">
                <WishlistButton item={p} />

                <div
                  className="add-cart-btn"
                  onClick={() =>
                    addToCart({ item: p, navigate, location })
                  }
                >
                  <Plus size={18} />
                </div>

                <img
                  src={cleanImageUrl(p.image_full_url)}
                  alt={p.name}
                  onError={(e) => (e.currentTarget.src = "/no-image.jpg")}
                />
                <h4>{p.name}</h4>
                <p>₹{p.price}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* ===== REVIEWS ===== */}
      {activeTab === "reviews" && (
        <div className="reviews-section">
          {reviewsLoading ? (
            <Loader text="Loading reviews..." />
          ) : filteredReviews.length === 0 ? (
            <p>No reviews found</p>
          ) : (
            filteredReviews.map((r) => (
              <div key={r.id} className="review-card">
                <strong>{r.customer_name || "Anonymous"}</strong>
                <span>
                  <Star size={14} fill="#00c16e" stroke="none" /> {r.rating}
                </span>
                <p>{r.comment}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
