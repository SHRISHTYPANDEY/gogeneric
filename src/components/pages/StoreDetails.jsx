import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { cleanImageUrl } from "../../utils";
import WishlistButton from "../WishlistButton";
import AddToCartButton from "../CartButton";
import Loader from "../Loader";
import toast from "react-hot-toast";
import { FileText, MapPin, Star, Phone, Mail } from "lucide-react";
import "./StoreDetails.css";

export default function StoreDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("products");

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
  if (!store?.id) return;

  if (searchTerm.trim() === "") return;
  const delay = setTimeout(() => {
    setPage(1);
    setHasMore(true);
    fetchProducts(1, searchTerm.trim());
  }, 400); // debounce

  return () => clearTimeout(delay);
}, [searchTerm, store?.id]);

  /* ================= FETCH STORE ================= */
  useEffect(() => {
    fetchStoreDetails();
  }, [id]);

  useEffect(() => {
    if (store?.id) {
      setPage(1);
      setHasMore(true);
      fetchProducts(1);
    }
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
      console.error(err);
      toast.error("Failed to load store");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async (pageNumber = 1, keyword = "") => {
  try {
    setProductsLoading(true);

    const res = await api.get("/api/v1/items/latest", {
      params: {
        store_id: id,
        category_id: store.category_details?.[0]?.id || 1,
        search: keyword || undefined,   
        limit: 20,
        offset: pageNumber,
      },
      headers: {
        zoneId: JSON.stringify([3]),
        moduleId: 2,
      },
    });

    const newProducts = res.data.products || res.data.items || [];

    if (pageNumber === 1) {
      setProducts(newProducts);
    } else {
      setProducts((prev) => [...prev, ...newProducts]);
    }

    setHasMore(newProducts.length === 20);
  } catch (err) {
    console.error(err);
  } finally {
    setProductsLoading(false);
  }
};


  /* ================= INFINITE SCROLL ================= */
  useEffect(() => {
  if (
    activeTab !== "products" ||
    !hasMore ||
    productsLoading
  )
    return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setPage((prev) => {
          const next = prev + 1;
          fetchProducts(next, searchTerm.trim()); // 🔥 SEARCH KE SAATH
          return next;
        });
      }
    },
    { threshold: 0.3 }
  );

  const sentinel = document.getElementById("scroll-sentinel");
  if (sentinel) observer.observe(sentinel);

  return () => observer.disconnect();
}, [hasMore, productsLoading, activeTab, searchTerm]);

  /* ================= FETCH REVIEWS ================= */
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
      console.error(err);
    } finally {
      setReviewsLoading(false);
    }
  };

  /* ================= FILTERS ================= */
  

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

      {/* ===== HEADER ===== */}
      <div className="sd-header-box">
        <div>
          <h1 className="sd-store-title">{store.name}</h1>
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

      {/* ===== TABS + SEARCH ===== */}
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
              {tab}
            </span>
          ))}
        </div>

        {activeTab === "products" && (
          <input
            type="text"
            className="sd-search-input"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}
      </div>

      {/* ================= PRODUCTS ================= */}
      {activeTab === "products" && (
        <>
          <div className="sd-products-grid">
            {productsLoading && page === 1 ? (
              <Loader text="Loading products..." />
            ) : products.length === 0 ? (
              <p>No products found</p>
            ) : (
              products.map((p) => (
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
                      onError={(e) =>
                        (e.currentTarget.src = "/no-image.jpg")
                      }
                    />
                  </div>

                  <h4 className="sd-prod-name">{p.name}</h4>
                  <p className="sd-prod-price">₹{p.price}</p>
                </div>
              ))
            )}
          </div>

          {hasMore && <div id="scroll-sentinel" />}
          {productsLoading && page > 1 && (
            <Loader text="Loading more products..." />
          )}
        </>
      )}

      {/* ================= OVERVIEW ================= */}
      {activeTab === "overview" && (
        <div className="sd-content-section">
          <p><Phone size={16} /> {store.phone || "N/A"}</p>
          <p><Mail size={16} /> {store.email || "N/A"}</p>
        </div>
      )}

      {/* ================= REVIEWS ================= */}
      {activeTab === "reviews" && (
        <div className="sd-reviews-list">
          {reviewsLoading ? (
            <Loader text="Loading reviews..." />
          ) : (
            filteredReviews.map((r) => (
              <div key={r.id} className="sd-rev-card">
                <strong>{r.customer_name}</strong> ⭐ {r.rating}
                <p>{r.comment}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* ===== PRESCRIPTION BUTTON ===== */}
      <div
        className="sd-floating-prescription"
        onClick={() =>
          navigate("/checkout", {
            state: { store_id: store.id, isPrescriptionOrder: true },
          })
        }
      >
        <FileText size={24} />
        <span>Prescription</span>
      </div>
    </div>
  );
}
