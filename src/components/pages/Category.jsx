import React, { useEffect, useState } from "react";
import "./Category.css";
import api from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { cleanImageUrl } from "../../utils";
import Loader from "../Loader";

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/v1/categories")
      .then((res) => {
        setCategories(res.data || []);
      })
      .catch((err) => console.error("Category page error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Loader text="Loading Categories..." />;
  }

  return (
    <>
    <div className="all-cat-page-container">
      <h1 className="all-cat-main-title">All Categories</h1>

      <div className="all-cat-grid-layout">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="all-cat-item-card"
            onClick={() =>
              navigate(`/category/${cat.id}`, {
                state: { categoryName: cat.name },
              })
            }
          >
            <div className="all-cat-image-section">
              <img
                src={cleanImageUrl(cat.image_full_url || `/storage/category/${cat.image}`)}
                alt={cat.name}
                onError={(e) => (e.currentTarget.src = "/no-image.jpg")}
              />
            </div>
            <div className="all-cat-info-section">
               <p className="all-cat-text-name">{cat.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}