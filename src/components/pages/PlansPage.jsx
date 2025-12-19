import "./PlansPage.css";
import { useState } from "react";
import BookAppointment from "./BookAppointment";

export default function DoctorPlans({ doctor }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleBook = (price) => {
    setSelectedPlan(price);
    setShowModal(true);
  };

  return (
    <>
      <div className="plans-section">
        <div className="plans-wrapper">
          <h2 className="plans-heading">
            Choose Your <span className="highlight">Diet Plan</span>
          </h2>
          <p className="plans-subheading">
            Personalized nutrition coaching tailored to your lifestyle.
          </p>

          <div className="plans-grid">
            <PlanCard
              title="Essential"
              subtitle="Start your journey"
              price="₹0"
              features={[
                "Health Assessment",
                "Goal Setting",
                "Basic Diet Tips",
              ]}
              onBook={handleBook}
            />

            <PlanCard
              title="Standard"
              subtitle="Per Appointment"
              price="₹199"
              featured
              features={[
                "Custom Diet Plan",
                "Basic Progress Tracking",
                "WhatsApp Support",
              ]}
              onBook={handleBook}
            />

            <PlanCard
              title="Premium"
              subtitle="Monthly Access"
              price="₹499"
              features={[
                "Weekly Diet Plans",
                "Full WhatsApp Support",
                "Recipes & Motivation",
              ]}
              onBook={handleBook}
            />
          </div>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              Selected Plan: <span>{selectedPlan}</span>
            </h3>

            <BookAppointment
              phone="919211510600"
              whatsapp="919211510600"
            />
          </div>
        </div>
      )}
    </>
  );
}

/* ================= PLAN CARD ================= */

function PlanCard({ title, subtitle, price, features, featured, onBook }) {
  return (
    <div
      className={`plan-card ${featured ? "featured-card" : ""}`}
      onClick={() => onBook(price)}
    >
      {featured && <div className="popular-badge">Most Popular</div>}

      <div className="plan-header">
        <span className="plan-title">{title}</span>
        <p className="plan-subtitle">{subtitle}</p>
        <h3 className="plan-price">{price}</h3>
      </div>

      <ul className="plan-features">
        {features.map((f, i) => (
          <li key={i} className="feature-item">
            ✓ {f}
          </li>
        ))}
      </ul>

      <button
        className={`plan-button ${featured ? "btn-primary" : "btn-outline"}`}
        onClick={(e) => {
          e.stopPropagation();
          onBook(price);
        }}
      >
        Book Appointment
      </button>
    </div>
  );
}
