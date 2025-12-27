import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axiosInstance";
import { cleanImageUrl } from "../../utils";
import { addToCart } from "../../utils/cartHelper";
import WishlistButton from "../WishlistButton";
import toast from "react-hot-toast";
import { FileText } from "lucide-react";
import {
  MapPin,
  Star,
  Phone,
  Mail,
  Share2,
  Navigation,
  Plus,
} from "lucide-react";
import AddToCartButton from "../CartButton";
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

  const getDialablePhone = (phone) => {
    if (!phone) return null;
    return phone.replace(/\D/g, "");
  };

  const handleShare = async () => {
    const shareData = {
      title: store.name,
      text: `Check out ${store.name}\n${store.address}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`
        );
        toast.success("Store link copied!");
      }
    } catch (err) {
      toast.error("Share failed");
      console.error("Share failed", err);
    }
  };

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
    <div className="sd-main-container">
      <p className="sd-breadcrumb">Home / Stores / {store.name}</p>

      {/* ===== HEADER SECTION ===== */}
      <div className="sd-header-box">
        <div>
          <h1 className="sd-store-title">{store.name}</h1>
          <div className="sd-tags">
            {store.category_details?.map((c) => (
              <span key={c.id} className="sd-tag-item">
                {c.name}
              </span>
            ))}
          </div>
          <p className="sd-location">
            <MapPin size={16} /> {store.address}
          </p>
        </div>

        <div className="sd-rating-card">
          <div className="sd-rating-num">
            {store.avg_rating || "N/A"}
            <Star size={18} fill="#fff" stroke="none" />
          </div>
          <span className="sd-rating-label">Store Rating</span>
        </div>
      </div>

      {/* ===== ACTION BUTTONS ===== */}
      <div className="sd-action-btns">
        <button className="sd-btn">
          <Navigation size={18} /> Direction
        </button>
        <button className="sd-btn" onClick={handleShare}>
          <Share2 size={18} /> Share
        </button>
        <button
          className="sd-btn"
          onClick={() => {
            const phone = getDialablePhone(store.phone);
            if (!phone) {
              toast.error("Phone not available");
              return;
            }
            window.location.href = `tel:${phone}`;
          }}
        >
          <Phone size={18} /> Call
        </button>
      </div>

      {/* ===== HERO IMAGE ===== */}
      <div className="sd-hero-image-container">
        <img
          className="sd-hero-img"
          src={cleanImageUrl(store.cover_photo_full_url)}
          alt={store.name}
        />
      </div>

      {/* ===== TABS & SEARCH ===== */}
      <div className="sd-tabs-nav">
        <div className="sd-tabs-list">
          {["products", "overview", "reviews"].map((tab) => (
            <span
              key={tab}
              className={`sd-tab-link ${activeTab === tab ? "sd-active" : ""}`}
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
            className="sd-search-bar"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}
      </div>

      {/* ===== TAB CONTENT ===== */}

      {/* PRODUCTS TAB */}
      {activeTab === "products" && (
        <div className="sd-products-grid">
          {productsLoading ? (
            <Loader text="Loading products..." />
          ) : filteredProducts.length === 0 ? (
            <p>No products found</p>
          ) : (
            filteredProducts.map((p) => (
              <div
                key={p.id}
                className="sd-prod-card"
                onClick={() =>
                  navigate(`/medicine/${p.id}`, {
                    state: { price: p.price, store_id: store.id },
                  })
                }
              >
                  <WishlistButton item={p} />
                  <AddToCartButton item={p} />
                <div className="sd-prod-img-box">
                  <img
                    src={cleanImageUrl(p.image_full_url)}
                    alt={p.name}
                    onError={(e) => (e.currentTarget.src = "/no-image.jpg")}
                  />
                </div>
                <h4 className="sd-prod-name">{p.name}</h4>
                <p className="sd-prod-price">₹{p.price}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="sd-content-section">
          <div className="sd-ov-section">
            <h3>Contact Information</h3>
            <p>
              <Phone size={16} /> {store.phone || "N/A"}
            </p>
            <p>
              <Mail size={16} /> {store.email || "N/A"}
            </p>
          </div>
          <div className="sd-ov-section">
            <h3>Available Categories</h3>
            <div className="sd-tags">
              {store.category_details?.map((c) => (
                <span key={c.id} className="sd-tag-item">
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REVIEWS TAB */}
      {activeTab === "reviews" && (
        <div className="sd-reviews-list">
          {reviewsLoading ? (
            <Loader text="Loading reviews..." />
          ) : filteredReviews.length === 0 ? (
            <p>No reviews found</p>
          ) : (
            filteredReviews.map((r) => (
              <div key={r.id} className="sd-rev-card">
                <div className="sd-rev-header">
                  <strong>{r.customer_name || "Anonymous"}</strong>
                  <span className="sd-rev-stars">
                    <Star size={14} fill="#16a34a" stroke="none" /> {r.rating}
                  </span>
                </div>
                <p>{r.comment}</p>
              </div>
            ))
          )}
        </div>
      )}
     <div
  className="sd-floating-prescription"
  onClick={() =>
    navigate("/checkout", {
      state: {
        store_id: store.id,
        isPrescriptionOrder: true,
      },
    })
  }
>
  <FileText size={24} />
  <span>Prescription</span>
</div>
 
    </div>
  );
}
