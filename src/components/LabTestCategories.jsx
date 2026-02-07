import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LabCategories.css";
import api from "../api/axiosInstance";
import { cleanImageUrl } from "../utils";

export default function LabTestCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const labCategoryImages = {
    "blood-general-health": "/lab_cat_img/blood.jpg",
    "diabetes-metabolic": "/lab_cat_img/diabetes.jpg",
    "thyroid-hormone": "/lab_cat_img/thyroid.jpg",
    "heart-lifestyle": "/lab_cat_img/heart.jpg",
    "infection-disease": "/lab_cat_img/infection.png",
    "mens-health": "/lab_cat_img/mens.jpg",
    "organ-specialty": "/lab_cat_img/organ.jpg",
    "health-packages": "/lab_cat_img/health.jpg",
    "womens-health": "/lab_cat_img/women.jpg",
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/v1/lab-test/categories", {
        headers: { zoneId: JSON.stringify([3]), moduleId: 2 },
      });

      if (res.data?.success) setCategories(res.data.data);
    } catch (err) {
      console.error("Failed to load lab categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCardClick = (cat) => {
    navigate(`/lab-tests/${cat.slug}/tests`, {
      state: { categoryName: cat.name },
    });
  };

  return (
    <section className="lab-category-section max-w-7xl mx-auto px-4 py-6">
      <h2 className="lab-cate-titlee">All Lab Categories</h2>

      {loading ? (
        <div className="lab-loader">Loading lab categories...</div>
      ) : (
        <div className="lab-category-grid">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="lab-category-card"
              onClick={() => handleCardClick(cat)}
            >
              <div className="lab-card-image-box">
                <img
                  src={
                    cleanImageUrl(cat.icon) ||
                    labCategoryImages[cat.slug] ||
                    "/no-image.jpg"
                  }
                  alt={cat.name}
                />
              </div>

              <div className="lab-card-info-box">
                <p className="lab-category-name">{cat.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
