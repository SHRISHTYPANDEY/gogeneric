import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
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

  const [discountMap, setDiscountMap] = useState({});

  const fileInputRef = useRef(null);

  const handlePrescriptionClick = () => {
  fileInputRef.current?.click();
};

const handlePrescriptionFile = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  navigate("/checkout", {
    state: {
      store_id: store.id,
      isPrescriptionOrder: true,
      prescriptionFile: file,
    },
  });
};

  useEffect(() => {
    fetchStoreDetails();
  }, [id]);

  const fetchStoreDetails = async () => {
    try {
      const res = await api.get(`/api/v1/stores/details/${id}`, {
        headers: { zoneId: JSON.stringify([3]), moduleId: 2 },
      });
      // console.log("store api data", res.data);
      setStore(res.data);
      
    } catch {
      toast.error("Failed to load store");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchDiscountedProducts();
  }, [id]);

  useEffect(() => {
    if (!store?.id) return;
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(1);
  }, [store?.id]);

  useEffect(() => {
    if (!store?.id) return;

    const delay = setTimeout(() => {
      if (searchTerm.trim() === "") {
        setProducts([]);
        setPage(1);
        setHasMore(true);
        fetchProducts(1);
      } else {
        setHasMore(false);
        searchProducts(searchTerm.trim());
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  const searchProducts = async (keyword) => {
    try {
      setProductsLoading(true);
      const res = await api.get("/api/v1/items/search", {
        params: { name: keyword, store_id: id, limit: 10000, offset: 1 },
        headers: { zoneId: JSON.stringify([3]), moduleId: 2 },
      });
      setProducts(res.data?.items || res.data?.products || []);
      setHasMore(false);
    } finally {
      setProductsLoading(false);
    }
  };

 const fetchProducts = async (pageNumber) => {
  try {
    setProductsLoading(true);

    const res = await api.get("/api/v1/items/latest", {
      params: {
        store_id: id,
        category_id: store.category_details?.[0]?.id || 1,
        limit: 20,
        offset: pageNumber,
      },
      headers: { zoneId: JSON.stringify([3]), moduleId: 2 },
    });

    // console.log("LATEST PRODUCTS API RESPONSE 👉", res.data);

    const newProducts = res.data.products || res.data.items || [];

    // console.log("NEW PRODUCTS (page " + pageNumber + ") 👉", newProducts);

    setProducts((prev) => {
  const merged = pageNumber === 1
    ? newProducts
    : [...prev, ...newProducts];

  const uniqueMap = new Map();
  merged.forEach((item) => {
    uniqueMap.set(item.id, item); 
  });

  return Array.from(uniqueMap.values());
});


    setHasMore(newProducts.length === 20);
  } finally {
    setProductsLoading(false);
  }
};

  const fetchDiscountedProducts = async () => {
    try {
      const res = await api.get("/api/v1/items/discounted", {
        params: { store_id: id, limit: 1000, offset: 1 },
        headers: { zoneId: JSON.stringify([3]), moduleId: 2 },
      });

      const items = res.data.products || res.data.items || [];
      const map = {};
      items.forEach((item) => {
        if (item.id && item.discounted_price) {
          map[item.id] = item.discounted_price;
        }
      });
      setDiscountMap(map);
    } catch {}
  };''

  const getDiscountedPrice = (item) => {
    if (discountMap[item.id]) return discountMap[item.id];
    if (!item.discount || item.discount === 0) return null;

    const price = item.price || item.unit_price || 0;
    if (item.discount_type === "percent")
      return Math.round(price - (price * item.discount) / 100);
    if (item.discount_type === "amount")
      return Math.max(price - item.discount, 0);
    return null;
  };

  const getDiscountPercent = (item) => {
    const base = item.price || item.unit_price;
    const discounted = getDiscountedPrice(item);
    if (!base || !discounted || discounted >= base) return null;
    return Math.round(((base - discounted) / base) * 100);
  };

  useEffect(() => {
    if (
      activeTab !== "products" ||
      !hasMore ||
      productsLoading ||
      searchTerm.trim() !== ""
    )
      return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPage((prev) => {
            const next = prev + 1;
            fetchProducts(next);
            return next;
          });
        }
      },
      { threshold: 0.2 }
    );

    const sentinel = document.getElementById("scroll-sentinel");
    if (sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, productsLoading, activeTab, searchTerm]);

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await api.get("/api/v1/stores/reviews", {
        params: { store_id: id },
        headers: { zoneId: JSON.stringify([3]), moduleId: 2 },
      });
      setReviews(res.data.reviews || []);
    } finally {
      setReviewsLoading(false);
    }
  };

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

      <div className="sd-header-box">
        <div>
          <h1 className="sd-store-title">{store.name}</h1>
          <p className="sd-location">
            <MapPin size={16} /> {store.address}
          </p>
        </div>
      <div className="sd-rating-card">
  <div className="sd-rating-num">
    <span className="sd-rating-value">
      {store.avg_rating || "N/A"}
    </span>
    <Star className="sd-rating-star" size={18} />
  </div>
  <span className="sd-rating-label"></span>
</div>
      </div>
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

      {activeTab === "products" && (
        <>
          <div className="sd-products-grid">
            {products.map((p) => (
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

                {getDiscountPercent(p) && (
                  <span className="sd-discount-badge">
                    {getDiscountPercent(p)}% OFF
                  </span>
                )}

                <h4 className="sd-prod-name">{p.name}</h4>

                <div className="sd-price-row">
                  {getDiscountedPrice(p) ? (
                    <>
                      <span className="sd-price-old">₹{p.price}</span>
                      <span className="sd-price-new">
                        ₹{getDiscountedPrice(p)}
                      </span>
                    </>
                  ) : (
                    <span className="sd-price-new">₹{p.price}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

    {productsLoading && (
  <div className="sd-products-loader">
    <Loader text="Loading more products..." inline />
  </div>
)}

          {hasMore && <div id="scroll-sentinel" style={{ height: 1 }} />}
        </>
      )}

      {activeTab === "overview" && (
        <div className="sd-content-section">
          <p>
            <Phone size={16} /> {store.phone || "N/A"}
          </p>
          <p>
            <Mail size={16} /> {store.email || "N/A"}
          </p>
        </div>
      )}

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

     <div
  className="sd-floating-prescription"
  onClick={handlePrescriptionClick}
>
  <FileText size={24} />
  <span>Prescription</span>
</div>

{/* Hidden file input */}
<input
  type="file"
  accept="image/*,.pdf"
  ref={fileInputRef}
  onChange={handlePrescriptionFile}
  style={{ display: "none" }}
/>

    </div>
  );
}
