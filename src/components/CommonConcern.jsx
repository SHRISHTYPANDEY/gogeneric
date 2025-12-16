import { useEffect, useState } from "react";
import "./CommonConcern.css";
import api from "../api/axiosInstance";
import { cleanImageUrl } from "../utils";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { addToCart } from "../utils/cartHelper";
import { useNavigate, useLocation } from "react-router-dom";
import WishlistButton from "./WishlistButton";

export default function CommonConcern() {
  const [concerns, setConcerns] = useState([]);
  const [activeFilter, setActiveFilter] = useState("");
  const [loading, setLoading] = useState(true);
   const navigate = useNavigate();
  const location = useLocation();

  const [medicines, setMedicines] = useState([]);
  const [medicineLoading, setMedicineLoading] = useState(false);

  const handleAddToCart = async (item) => {
  const token = localStorage.getItem("token");

  try {
    const payload = {
      item_id: item.id,
      quantity: 1,
      price: item.price,
      model: "Item",
    };

    await api.post(
      "/api/v1/customer/cart/add",
      payload,
      {
        headers: {
          moduleId: 2,
          zoneId: JSON.stringify([3]),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    toast.success("Added to cart");
    window.dispatchEvent(new Event("cart-updated"));
  } catch (err) {
    console.log("Add to cart error:", err?.response?.data);
    toast.error(
      err?.response?.data?.errors?.[0]?.message ||
      "Add to cart failed"
    );
  }
};


  // 🟦 Fetch Concerns
  async function fetchConcerns() {
    setLoading(true);

    try {
      const res = await api.get("/api/v1/common-condition", {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
        },
      });

      const data =
        res.data.items ||
        res.data.data ||
        res.data.common_conditions ||
        res.data.conditions ||
        res.data ||
        [];

      setConcerns(data);

      // Auto-select first concern
      if (data.length > 0) {
        setActiveFilter(data[0]);
      }
    } catch (err) {
      console.error("Concern fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMedicines(concernId) {
    setMedicineLoading(true);

    try {
    const res = await api.get(
 `/api/v1/common-condition/items/${concernId}?limit=10&offset=1`
,
  {
    headers: {
  zoneId: JSON.stringify([3]),  
  moduleId: 2                   
}

  }
);


      setMedicines(res.data.products || []);

    } catch (err) {
      console.error("Medicine fetch error:", err);
    } finally {
      setMedicineLoading(false);
    }
  }

  // 🟦 Fetch concerns first time
  useEffect(() => {
    fetchConcerns();
  }, []);

  // 🟦 Fetch medicines when active filter changes
  useEffect(() => {
    if (activeFilter?.id) {
      fetchMedicines(activeFilter.id);
    }
  }, [activeFilter]);


    return (
  <div className="concern-page max-w-7xl mx-auto px-4">
    <h2 className="concern-heading">Common Concerns</h2>
    <p className="concern-sub">{concerns.length} concerns available</p>

    {/* Filter Buttons */}
    <div className="filter-row">
      <div className="store-filters">
        {concerns.map((c) => (
          <button
            key={c.id}
            className={`filter-btn ${
              activeFilter.id === c.id ? "active" : ""
            }`}
            onClick={() => setActiveFilter(c)}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>

{medicineLoading ? (
  <div className="concern-grid">
    {[1, 2, 3, 4].map((x) => (
      <div className="skeleton-card" key={x}></div>
    ))}
  </div>
) : medicines.length === 0 ? (
  <div className="no-products">No products available</div>
) : (
  <div className="concern-grid">
    {medicines.map((item) => (
    <div className="concern-card" key={item.id}>
      <WishlistButton item={item} />
              {/* ➕ ADD TO CART */}
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
                src={
                  cleanImageUrl(item.image_full_url) ||
                  cleanImageUrl(item.full_url) ||
                  cleanImageUrl(item.thumbnail) ||
                  "/no-image.jpg"
                }
                alt={item.name}
                onError={(e) => {
                  e.currentTarget.src = "/no-image.jpg";
                }}
              />

              <h3>{item.name}</h3>
              <p className="price">₹{item.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
