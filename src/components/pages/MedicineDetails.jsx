import { useEffect, useState, useRef } from "react";
import ProductSchema from "../../seo/ProductSchema";
import { useParams, useLocation } from "react-router-dom";
import api from "../../api/axiosInstance";
import "./MedicineDetails.css";
import { cleanImageUrl } from "../../utils";
import { toast } from "react-hot-toast";
import WishlistButton from "../WishlistButton";
import Loader from "../Loader";
import AddToCartButton from "../CartButton";

export default function MedicineDetails() {
  const { id } = useParams();
  const location = useLocation();

  const detailsAbortRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const passedPrice = location.state?.price || null;

  /* ---------------- FETCH DETAILS ---------------- */
  useEffect(() => {
    fetchMedicineDetails();
    return () => detailsAbortRef.current?.abort();
  }, [id]);

  const fetchMedicineDetails = async () => {
  // Abort previous request
  detailsAbortRef.current?.abort();

  const controller = new AbortController();
  detailsAbortRef.current = controller;

  try {
    setLoading(true);

    const res = await api.get(`/api/v1/items/details/${id}`, {
      headers: {
        zoneId: JSON.stringify([3]),
        moduleId: 2,
      },
      signal: controller.signal,
    });

    if (!controller.signal.aborted) {
      setMedicine(res.data || null);
    }
  } catch (err) {
    if (
      err.name === "CanceledError" ||
      err.name === "AbortError" ||
      err.code === "ERR_CANCELED" ||
      controller.signal.aborted
    ) {
      return;
    }

    console.error("Medicine fetch error:", err);
    toast.error("Failed to load medicine details");
  } finally {
    if (!controller.signal.aborted) {
      setLoading(false);
    }
  }
};


  /* ---------------- IMAGE HANDLING ---------------- */
  useEffect(() => {
    if (!medicine) return;

    const imgs = [];

    if (medicine.image_full_url) imgs.push(medicine.image_full_url);
    if (Array.isArray(medicine.images_full_url))
      imgs.push(...medicine.images_full_url);

    if (Array.isArray(medicine.storage)) {
      medicine.storage.forEach((s) => {
        if (s.key === "image" && s.value) {
          imgs.push(
            `https://www.gogenericpharma.com/storage/product/${s.value}`
          );
        }
      });
    }

    setImages([...new Set(imgs)].map(cleanImageUrl));
    setActiveIndex(0);
  }, [medicine]);

  /* ---------------- SWIPE HANDLERS ---------------- */
  const handleTouchStart = (e) =>
    (touchStartX.current = e.touches[0].clientX);

  const handleTouchMove = (e) =>
    (touchEndX.current = e.touches[0].clientX);

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;

    if (diff > 50 && activeIndex < images.length - 1)
      setActiveIndex((p) => p + 1);

    if (diff < -50 && activeIndex > 0)
      setActiveIndex((p) => p - 1);
  };

  /* ---------------- PRICE ---------------- */
  const basePrice =
    passedPrice ||
    medicine?.price ||
    medicine?.unit_price ||
    medicine?.variations?.[0]?.price ||
    null;

  const discountedPrice =
    medicine?.discount && basePrice
      ? medicine.discount_type === "percent"
        ? Math.round(basePrice - (basePrice * medicine.discount) / 100)
        : Math.max(basePrice - medicine.discount, 0)
      : null;

  const finalPrice = discountedPrice || basePrice;

  const discountPercent =
    discountedPrice && basePrice
      ? Math.round(((basePrice - discountedPrice) / basePrice) * 100)
      : null;

  return (
    <>
      <ProductSchema medicine={medicine} price={finalPrice} />

      <div className="med-det-page-container">
        {loading && <Loader text="Loading medicine details..." />}

        {!loading && medicine && (
          <div className="med-det-main-card">
            <div className="med-det-save-wrapper">
              <WishlistButton item={medicine} />
            </div>

            {/* IMAGE CAROUSEL */}
            <div
              className="med-det-left-section"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {discountPercent && (
                <span className="med-det-discount-badge">
                  {discountPercent}% OFF
                </span>
              )}

              {images.length > 0 && (
                <img
                  className="med-det-product-img"
                  src={images[activeIndex]}
                  alt={medicine.name}
                />
              )}

              {images.length > 1 && (
                <div className="med-det-dots">
                  {images.map((_, idx) => (
                    <span
                      key={idx}
                      className={`dot ${
                        idx === activeIndex ? "active" : ""
                      }`}
                      onClick={() => setActiveIndex(idx)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT SECTION */}
            <div className="med-det-right-section">
              <h1 className="med-det-title">{medicine.name}</h1>

              <div className="med-det-price-container">
                {discountedPrice ? (
                  <>
                    <span className="med-det-old-price">₹{basePrice}</span>
                    <span className="med-det-new-price">
                      ₹{discountedPrice}
                    </span>
                  </>
                ) : (
                  <span className="med-det-new-price">₹{basePrice}</span>
                )}
              </div>

              {medicine.description && (
                <div className="med-det-desc-wrapper">
                  <h3 className="med-det-desc-heading">Description</h3>
                  <p className="med-det-description">
                    {medicine.description}
                  </p>
                </div>
              )}

              <div className="med-det-action-area">
                <AddToCartButton item={medicine} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
