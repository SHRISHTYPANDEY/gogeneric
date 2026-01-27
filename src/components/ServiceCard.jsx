import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { encodeId } from "../utils/idObfuscator";
import "./ServiceCard.css";

export default function ServiceCard() {
  const navigate = useNavigate();

  const [skinCareCategoryId, setSkinCareCategoryId] = useState(null);
  const [vitaminCategoryId, setVitaminCategoryId] = useState(null);

  useEffect(() => {
    api
      .get("/api/v1/categories")
      .then((res) => {
        const categories = res.data || [];

        const skinCare = categories.find((cat) =>
          cat.name?.toLowerCase().includes("skin")
        );

        const vitamins = categories.find((cat) =>
          cat.name?.toLowerCase().includes("vitamin")
        );

        if (skinCare) setSkinCareCategoryId(skinCare.id);
        if (vitamins) setVitaminCategoryId(vitamins.id);
      })
      .catch((err) => console.error("Category fetch error:", err));
  }, []);

  const services = [
    {
      id: 1,
      title: "Pharmacy",
      image: "/service_img/pharmacy.jpg",
      route: "/pharmacy",
      description: "Premium medications & health products",
    },
    {
      id: 2,
      title: "Lab Tests",
      image: "/service_img/lab.jpg",
      route: "/labs",
      description: "Advanced diagnostics & reports",
    },
    {
      id: 3,
      title: "Doctors",
      image: "/service_img/doctor.avif",
      route: "/doctors",
      description: "Expert medical consultations",
    },

    {
      id: 4,
      title: "Supplements",
      image: "/service_img/supplements.jpg",
      route: vitaminCategoryId
        ? `/category/${encodeId(vitaminCategoryId)}`
        : null,
      categoryName: "Vitamins & Minerals",
      description: "Essential vitamins & minerals for daily wellness",
    },

    {
      id: 5,
      title: "Skin Care",
      image: "/service_img/skincare.jpg",
      route: skinCareCategoryId
        ? `/category/${encodeId(skinCareCategoryId)}`
        : null,
      categoryName: "Skin Care",
      description: "Luxury dermatology products",
    },

    {
      id: 6,
      title: "Finance",
      image: "/service_img/finance.avif",
      route: "/finance",
      description: "Health investment plans",
    },
  ];

  return (
    <section className="service-section">
      <div className="section-header">
        <div className="title-wrapper">
          <h2 className="section-titlee">
            <span className="title-gradient">Premium Health </span>
            <span className="title-accent">Services</span>
          </h2>
          <div className="title-decoration">
            <div className="decoration-line"></div>
            <div className="decoration-dot"></div>
            <div className="decoration-line"></div>
          </div>
        </div>

        <p className="section-subtitle1">
          Discover our exclusive healthcare solutions designed for your wellness journey
        </p>
      </div>

      <div className="service-grid">
        {services.map((item) => (
          <div
            key={item.id}
            className="service-card"
            onClick={() =>
              item.route &&
              navigate(item.route, {
                state: { categoryName: item.categoryName },
              })
            }
            style={{ cursor: item.route ? "pointer" : "not-allowed" }}
          >
            <div className="image-container">
              <div className="image-overlay"></div>
              <img
                src={item.image}
                alt={item.title}
                className="service-image"
              />
              <div className="image-gradient"></div>
            </div>

            <div className="card-content">
              <h3 className="card-title">{item.title}</h3>
              <p className="card-description">{item.description}</p>
            </div>

            <div className="card-footer">
              <button className="explore-btn" disabled={!item.route}>
                Explore Service <span className="arrow-icon"> →</span>
              </button>
            </div>

            <div className="card-glow"></div>
          </div>
        ))}
      </div>
    </section>
  );
}
