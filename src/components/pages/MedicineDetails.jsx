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

export default function MedicineDetails() {
  const { id } = useParams();
  const location = useLocation();
  const abortRef = useRef(null);
  const hasLoadedRef = useRef(false);

  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);

  const passedPrice = location.state?.price || null;

  useEffect(() => {
    fetchMedicineDetails();

    return () => {
      abortRef.current?.abort();
    };
  }, [id]);

  const fetchMedicineDetails = async () => {
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setMedicine(null);

    try {
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
  const rawPrice =
    passedPrice ||
    medicine?.price ||
    medicine?.unit_price ||
    medicine?.variations?.[0]?.price ||
    null;

  const price = Number(rawPrice);

  const isValidPrice = price && !isNaN(price) && price > 0;

  const handleAddToCart = async () => {
    if (!medicine) return;

    if (!isValidPrice) {
      toast.error("This product cannot be added to cart");
      return;
    }

    await addToCart({
      item: {
        id: medicine.id,
        name: medicine.name,
        price,
        image: medicine.image_full_url || medicine.image || "/no-image.jpg",
        quantity: 1,
      },
    });
  };
  return (
  <>
    <ProductSchema medicine={medicine} price={isValidPrice ? price : null} />
    <div className="medicine-page">
      {loading && (
        <div className="medicine-loader">
          <Loader text="Loading medicine details..." />
        </div>
      )}

      {!loading && hasLoadedRef.current && !medicine && (
        <p className="text-center">Medicine not found</p>
      )}

      {!loading && medicine && (
        <div className="medicine-card">
          <div className="medicine-image">
            <div className="medicine-wishlist">
              <WishlistButton item={medicine} />
            </div>

            <img
              src={cleanImageUrl(medicine.image_full_url || medicine.image)}
              alt={medicine.name}
              onError={(e) => (e.currentTarget.src = "/no-image.jpg")}
            />
          </div>

          <div className="medicine-info">
            <h1>{medicine.name}</h1>

            {isValidPrice ? (
              <p className="medicine-price">₹{price}</p>
            ) : (
              <p className="medicine-price unavailable">Price unavailable</p>
            )}

            {medicine.description && (
              <p className="medicine-desc">{medicine.description}</p>
            )}

            <div className="medicine-actions">
              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={!isValidPrice}
              >
                {isValidPrice ? "Add to Cart" : "Unavailable"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
