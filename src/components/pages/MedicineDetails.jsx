import { useEffect, useState, useRef } from "react";
import ProductSchema from "../../seo/ProductSchema";
import { useParams, useLocation } from "react-router-dom";
import api from "../../api/axiosInstance";
import "./MedicineDetails.css";
import { cleanImageUrl } from "../../utils";
import Swal from "sweetalert2";
import WishlistButton from "../WishlistButton";
import Loader from "../Loader";
import AddToCartButton from "../CartButton";
import { decodeId } from "../../utils/idObfuscator";

export default function MedicineDetails() {
  const { hash } = useParams();
  const id = hash ? decodeId(hash) : null;

  const location = useLocation();
  const detailsAbortRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const passedPrice = location.state?.price || null;

  const showAlert = (icon, title, text, timer = null) => {
    Swal.fire({
      icon,
      title,
      text,
      confirmButtonColor: "#016B61",
      timer,
      showConfirmButton: !timer,
    });
  };
  const fetchMedicineDetails = async () => {
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
        // console.log("🧪 MEDICINE DETAIL API:", res.data);
        setMedicine(res.data || null);
      }
    } catch (err) {
      if (
        err.name === "CanceledError" ||
        err.name === "AbortError" ||
        err.code === "ERR_CANCELED"
      ) {
        return;
      }

      console.error("Medicine fetch error:", err);
      showAlert("error", "Error", "Failed to load medicine details");
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      showAlert("error", "Invalid Link", "This medicine link is not valid");
      return;
    }

    fetchMedicineDetails();
    return () => detailsAbortRef.current?.abort();
  }, [id]);

  useEffect(() => {
    if (!medicine) return;

    let imgs = [];

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

    imgs = [...new Set(imgs)]
      .map(cleanImageUrl)
      .filter(Boolean);

    if (imgs.length === 0) imgs = ["/no-image.jpg"];

    setImages(imgs);
    setActiveIndex(0);
  }, [medicine]);

  const mrp =
    medicine?.mrp ||
    medicine?.price ||
    medicine?.unit_price ||
    medicine?.variations?.[0]?.price ||
    null;

  // ✅ Final price priority:
  // 1. passedPrice (from listing)
  // 2. backend discount
  // 3. mrp
  const finalPrice = passedPrice
    ? passedPrice
    : medicine?.discount && mrp
    ? medicine.discount_type === "percent"
      ? Math.round(mrp - (mrp * medicine.discount) / 100)
      : Math.max(mrp - medicine.discount, 0)
    : mrp;

  const showOldPrice = mrp && finalPrice < mrp;

  const discountPercent = showOldPrice
    ? Math.round(((mrp - finalPrice) / mrp) * 100)
    : null;

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

  return (
    <>
      {medicine && <ProductSchema medicine={medicine} price={finalPrice} />}

      <div className="med-det-page-container">
        {loading && <Loader text="Loading medicine details..." />}

        {!loading && medicine && (
          <div className="med-det-main-card">
            <div className="med-det-save-wrapper">
              <WishlistButton item={medicine} />
            </div>

            {/* IMAGE SECTION */}
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

              <img
                className="med-det-product-img"
                src={images[activeIndex]}
                alt={medicine.name}
                onError={(e) => (e.currentTarget.src = "/no-image.jpg")}
              />

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

              {(medicine.store_name || medicine.store?.name) && (
                <p className="med-det-store-name">
                  {medicine.store_name || medicine.store?.name}
                </p>
              )}

              {/* ✅ MRP + DISCOUNTED PRICE */}
              <div className="med-det-price-container">
                {showOldPrice ? (
                  <>
                    <span className="med-det-old-price">₹{mrp}</span>
                    <span className="med-det-new-price">₹{finalPrice}</span>
                  </>
                ) : (
                  <span className="med-det-new-price">₹{finalPrice}</span>
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
                <AddToCartButton
                  item={{
                    ...medicine,
                    price: finalPrice,
                    original_price: mrp,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
