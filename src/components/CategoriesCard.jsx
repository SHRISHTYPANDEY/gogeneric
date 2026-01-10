import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./CategoriesCard.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api/axiosInstance";
import { cleanImageUrl } from "../utils"; 
import CategorySchema from "../seo/CategorySchema";

export default function CategoryCards() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  useEffect(() => {
    api.get("/api/v1/categories")
      .then((res) => {
        setCategories(res.data || []); 
      })
      .catch((err) => {
        console.error("Categories fetch error:", err);
      });
  }, []);
  const handleCardClick = (cat) => {
  navigate(`/category/${cat.id}`, {
    state: { categoryName: cat.name },
  });
};
  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <>
    <CategorySchema categories={categories} />
    <div className="category-section max-w-7xl mx-auto px-4 ">
      <h2 className="cate-title">Top Categories</h2>
<p className="cate-subtitle">
  Browse medicines & health products by category
</p>
      {/* LEFT BUTTON */}
      <button className="scroll-btn left" onClick={scrollLeft}>
        <ChevronLeft size={22} />
      </button>

      {/* SCROLLABLE WRAPPER */}
      <div className="category-wrapper" ref={scrollRef}>
        <div className="category-scroll">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="category-card"
              onClick={() => handleCardClick(cat)}
            >
              <img
                src={cleanImageUrl(cat.image_full_url || `/storage/category/${cat.image}`)}
                alt={cat.name}
              />
              <p>{cat.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT BUTTON */}
      <button className="scroll-btn right" onClick={scrollRight}>
        <ChevronRight size={22} />
      </button>
    </div>
    </>
  );
}