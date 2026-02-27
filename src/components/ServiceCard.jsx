import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import "./ServiceCard.css";

export default function ServiceCard() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/api/v1/categories")
      .then((res) => setCategories(res.data || []))
      .catch((err) => console.error("Category fetch error:", err));
  }, []);

  const services = [
    { id: 1, title: "Pharmacy", image: "/service_img/pharmacy.jpg", route: "/pharmacy", description: "Premium medications & health products" },
    { id: 2, title: "Lab Tests", image: "/service_img/lab.jpg", route: "/labs", description: "Advanced diagnostics & reports" },
    { id: 3, title: "Doctors", image: "/service_img/doctor.avif", route: "/doctors", description: "Expert medical consultations" },
    { id: 4, title: "Hospital", image: "/service_img/hospital.jpg", route: "/hospital", description: "Book hospital services", comingsoon: true },
    { id: 5, title: "Home Care", image: "/service_img/home-healthcare.jpg", route: "/healthcare", description: "Nursing & elderly care at home", comingsoon: true },
    { id: 6, title: "Insurance", image: "/service_img/finance.avif", route: "/insurance", description: "Expert policy advice", comingsoon: true },
  ];

  return (
    <section className="service-section">
      <div className="section-header">
        <div className="title-wrapper">
          <h2 className="section-titlee">
            <span className="title-gradient">Premium Health Services</span>
          </h2>
          <div className="title-decoration">
            <div className="decoration-line"></div>
            <div className="decoration-dot"></div>
            <div className="decoration-line"></div>
          </div>
        </div>
        <p className="section-subtitle1">Exclusive healthcare solutions for your wellness journey</p>
      </div>

      <div className="service-grid">
        {services.map((item) => (
          <div
            key={item.id}
            className="service-card"
            onClick={() => !item.comingsoon && item.route && navigate(item.route)}
            style={{ cursor: item.comingsoon ? "not-allowed" : "pointer" }}
          >
            <div className="image-container">
              <img src={item.image} alt={item.title} className="service-image" />
              <div className="image-overlay"></div>
            </div>

            <div className="card-content">
              <h3 className="card-title">{item.title}</h3>
              <p className="card-description">{item.description}</p>
            </div>

            <div className="card-footer">
              <button className="explore-btnn" disabled={item.comingsoon}>
                {item.comingsoon ? "Coming Soon" : "Explore Service →"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}