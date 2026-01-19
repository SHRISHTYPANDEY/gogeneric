import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { doctors } from "../../data/Doctor";
import "./PlansPage.css";
import BookAppointment from "./BookAppointment";

export default function PlansPage() {
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const doctor = doctors.find((d) => d.id === id);

  if (!doctor) return <div className="error-msg">Doctor not found</div>;

  const handleBook = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  return (
    <section className="plans-section">
      <div className="plans-wrapper">
        <div className="plans-header-content">
          <h2 className="plans-heading">
            Choose Your <span className="highlight">Diet Plan</span>
          </h2>
          <p className="plans-subheading">Simple, sustainable, and effective nutrition coaching.</p>
        </div>

        <div className="plans-grid">
          {doctor.plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`plan-card ${plan.featured ? "featured-card" : ""}`}
            >
             
              <div className="popular-badge">Recommended</div>
              
              <div className="plan-header">
                <span className="plan-title">{plan.title}</span>
                <p className="plan-subtitle">{plan.subtitle}</p>
                
                <div className="plan-price-row">
                  <span className="price-amt">{plan.price}</span>
                  {plan.id === "monthly" && <span className="price-tenure">/ month</span>}
                </div>

                {plan.price === "₹99" && (
                  <div className="refundable-info">
                    <span className="info-icon">!</span>
                    100% Refundable after consultation
                  </div>
                )}
              </div>

              <div className="divider" />

              <ul className="plan-features">
                {Object.entries(plan.features).map(([key, value], index) => {
                  if (value === false) return (
                    <li key={index} className="feature-item disabled">
                      <span className="icon cross">✕</span> 
                      <span className="label">{key}</span>
                    </li>
                  );
                  return (
                    <li key={index} className="feature-item">
                      <span className="icon check">✓</span>
                      <div className="feature-text">
                        <span className="label">{key}</span>
                        {typeof value === "string" && <span className="value">{value}</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <button 
                className="plan-button"
                onClick={() => handleBook(plan)}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-box">
               <h3 className="modal-title">Confirm Booking</h3>
            </div>
            
            <BookAppointment 
              phone={doctor.phone} 
              whatsapp={doctor.whatsapp} 
              planName={selectedPlan?.title}
              planPrice={selectedPlan?.price}
              onClose={() => setShowModal(false)} 
            />

            <button className="close-x" onClick={() => setShowModal(false)}>×</button>
          </div>
        </div>
      )}
    </section>
  );
}