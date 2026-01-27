import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { encodeId } from "../utils/idObfuscator";
import "./CategoriesCard.css";
import api from "../api/axiosInstance";
import { cleanImageUrl } from "../utils";
import CategorySchema from "../seo/CategorySchema";

export default function CategoryCards() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(14);

  useEffect(()=>{
    const handleResize = () =>{
      if(window.innerWidth <= 768){
        setVisibleCount(6);
      } else {
        setVisibleCount(14);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return()=> window.removeEventListener("resize", handleResize);
  },[]);

  useEffect(() => {
    api
      .get("/api/v1/categories")
      .then((res) => setCategories(res.data || []))
      .catch((err) => console.error("Categories fetch error:", err));
  }, []);

 const handleCardClick = (cat) => {
  navigate(`/category/${encodeId(cat.id)}`, {
    state: { categoryName: cat.name },
  });
};


  return (
    <>
      <CategorySchema categories={categories} />

      <section className="category-section max-w-7xl mx-auto px-4">
        <div className="cate-header-row">
          <h2 className="cate-title">Browse Our Categories</h2>
        </div>

        {/* ✅ ONLY 6 CATEGORIES */}
        <div className="category-grid">
          {categories.slice(0, visibleCount).map((cat) => (
            <div
              key={cat.id}
              className="category-card"
              onClick={() => handleCardClick(cat)}
            >
              <div className="card-image-box">
                <img
                  src={cleanImageUrl(
                    cat.image_full_url || `/storage/category/${cat.image}`
                  )}
                  alt={cat.name}
                />
              </div>

              <div className="card-info-box">
                <p className="category-name">{cat.name}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ BROWSE ALL BUTTON */}
        <div className="browse-all-wrapper">
          <button
            className="browse-all-btn"
            onClick={() => navigate("/category")}
          >
            Browse All Categories
          </button>
        </div>
      </section>
    </>
  );
}
