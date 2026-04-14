import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getDoctorById,
  getApprovedDoctorById,
  getApprovedPlans,
  getDoctorPlans,
} from "../../api/doctorApi";
import "./PlansPage.css";
import BookAppointment from "./BookAppointment";
import SkeletonCard from "../skeleton/SkeletonCard";

export default function PlansPage() {
  const { id } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let doctorData;
        let isApproved = false;

        // ✅ Doctor fetch
        try {
          doctorData = await getDoctorById(id);

          // Static plans
          if (doctorData?.plans?.length > 0) {
            setPlans(doctorData.plans);
          }

        } catch (err) {
          if (err.response?.status === 404) {
            doctorData = await getApprovedDoctorById(id);
            isApproved = true;
          } else {
            throw err;
          }
        }

        setDoctor({ ...doctorData, isApproved });

        // ✅ DB plans
        if (isApproved) {
          let plansData = await getApprovedPlans(id);

          if (!plansData || plansData.length === 0) {
            plansData = await getDoctorPlans(id);
          }

          setPlans(plansData || []);
        }

      } catch (err) {
        console.error(err);
        setError("Doctor or plans not found");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBook = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  // 🔹 LOADING
  if (loading) {
    return (
      <section className="plans-section">
        <div className="plans-wrapper">
          <div className="plans-grid">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} height="300px" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) return <div className="error-msg">{error}</div>;

  return (
    <section className="plans-section">
      <div className="plans-wrapper">

        <div className="plans-header-content">
          <h2 className="plans-heading">
            Choose Your <span className="highlight">Plan</span>
          </h2>
          <p className="plans-subheading">
            Simple, sustainable, and effective care plans.
          </p>
        </div>

        <div className="plans-grid">

          {plans.length === 0 && (
            <p>No plans available for this doctor.</p>
          )}

          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${plan.featured ? "featured-card" : ""}`}
            >

              {plan.featured === true && (
  <div className="popular-badge">Recommended</div>
)}

              {/* HEADER */}
              <div className="plan-header">
                <span className="plan-title">
                  {plan.plan_name || plan.title}
                </span>

                <div className="plan-price-row">
                  <span className="price-amt">
                    {plan.price}
                  </span>
                </div>

                {plan.duration && (
                  <div className="plan-duration">
                    Duration: {plan.duration}
                  </div>
                )}
              </div>

              <div className="divider" />

              {/* FEATURES */}
              <ul className="plan-features">

                {/* STATIC FEATURES */}
                {plan.features && !Array.isArray(plan.features) &&
                  Object.entries(plan.features).map(([key, value], i) => (
                    <li key={i} className="feature-item">
                      <span className={`icon ${value ? "check" : "cross"}`}>
                        {value ? "✓" : "✕"}
                      </span>

                      <div className="feature-text">
                        <span className="label">{key}</span>

                        {typeof value === "string" && (
                          <span className="value">{value}</span>
                        )}
                      </div>
                    </li>
                  ))
                }

                {/* DB FEATURES */}
                {Array.isArray(plan.features) &&
                  plan.features.map((f, i) => (
                    <li key={i} className="feature-item">
                      <span className="icon check">✓</span>

                      <div className="feature-text">
                        <span className="label">{f.feature_name}</span>

                        {f.feature_value && (
                          <span className="value">
                            {f.feature_value}
                          </span>
                        )}
                      </div>
                    </li>
                  ))
                }

              </ul>

              {/* BUTTON */}
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

      {/* MODAL */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <BookAppointment
              phone={doctor?.phone}
              whatsapp={doctor?.whatsapp}
              planName={selectedPlan?.plan_name || selectedPlan?.title}
              planPrice={selectedPlan?.price}
              doctorId={doctor?.id || id}
              planId={selectedPlan?.id}
              isApprovedDoctor={doctor?.isApproved}
              onClose={() => setShowModal(false)}
            />

            <button
              className="close-x"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </section>
  );
}