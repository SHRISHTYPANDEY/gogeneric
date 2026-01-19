  import { useEffect, useState, useRef } from "react";
  import ProductSchema from "../../seo/ProductSchema";
  import { useParams, useLocation } from "react-router-dom";
  import api from "../../api/axiosInstance";
  import "./MedicineDetails.css";
  import { cleanImageUrl } from "../../utils";
  import { addToCart } from "../../utils/cartHelper";
  import { toast } from "react-hot-toast";
  import WishlistButton from "../WishlistButton";
  import Loader from "../Loader";
import AddToCartButton from "../CartButton";

  export default function MedicineDetails() {
    const { id } = useParams();
    const location = useLocation();

    const detailsAbortRef = useRef(null);

    const [medicine, setMedicine] = useState(null);
    const [loading, setLoading] = useState(true);

    const passedPrice = location.state?.price || null;

    /* ---------------- FETCH MEDICINE DETAILS ---------------- */
    useEffect(() => {
      fetchMedicineDetails();

      return () => {
        detailsAbortRef.current?.abort();
      };
    }, [id]);

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
          setMedicine(res.data || null);
        }
      } catch (err) {
        if (err.code === "ERR_CANCELED") return;
        toast.error("Failed to load medicine details");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    /* ---------------- PRICE & DISCOUNT LOGIC ---------------- */

    const basePrice =
      passedPrice ||
      medicine?.price ||
      medicine?.unit_price ||
      medicine?.variations?.[0]?.price ||
      null;

    const getDiscountedPrice = (item) => {
      if (!item?.discount || item.discount === 0 || !basePrice) return null;

      if (item.discount_type === "percent") {
        return Math.round(basePrice - (basePrice * item.discount) / 100);
      }

      if (item.discount_type === "amount") {
        return Math.max(basePrice - item.discount, 0);
      }

      return null;
    };

    const discountedPrice = medicine ? getDiscountedPrice(medicine) : null;
    const finalPrice = discountedPrice || basePrice;

    const isValidPrice = finalPrice && finalPrice > 0;

    const discountPercent =
      discountedPrice && basePrice
        ? Math.round(((basePrice - discountedPrice) / basePrice) * 100)
        : null;

    /* ---------------- ADD TO CART ---------------- */

    const handleAddToCart = async () => {
      if (!medicine || !isValidPrice) {
        toast.error("This product cannot be added to cart");
        return;
      }

      await addToCart({
        item: {
          id: medicine.id,
          name: medicine.name,
          price: finalPrice,
          image: medicine.image_full_url || medicine.image || "/no-image.jpg",
          quantity: 1,
        },
      });
    };

return (
  <>
    <ProductSchema medicine={medicine} price={finalPrice} />

    <div className="med-det-page-container">
      {loading && <Loader text="Loading medicine details..." />}

      {!loading && medicine && (
        <div className="med-det-main-card">
          {/* Top-Right Save/Wishlist Button */}
          <div className="med-det-save-wrapper">
            <WishlistButton item={medicine} />
          </div>

          {/* LEFT SIDE: IMAGE */}
          <div className="med-det-left-section">
            {discountPercent && (
              <span className="med-det-discount-badge">
                {discountPercent}% OFF
              </span>
            )}
            <img
              className="med-det-product-img"
              src={cleanImageUrl(medicine.image_full_url || medicine.image)}
              alt={medicine.name}
              onError={(e) => (e.currentTarget.src = "/no-image.jpg")}
            />
          </div>

          {/* RIGHT SIDE: INFO */}
          <div className="med-det-right-section">
            <h1 className="med-det-title">{medicine.name}</h1>

            <div className="med-det-price-container">
              {discountedPrice ? (
                <>
                  <span className="med-det-old-price">₹{basePrice}</span>
                  <span className="med-det-new-price">₹{discountedPrice}</span>
                </>
              ) : (
                <span className="med-det-new-price">₹{basePrice}</span>
              )}
            </div>

            {/* Description Section with Heading */}
            {medicine.description && (
              <div className="med-det-desc-wrapper">
                <h3 className="med-det-desc-heading">Description</h3>
                <p className="med-det-description">{medicine.description}</p>
              </div>
            )}

            {/* Action Area for Cart Button */}
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
