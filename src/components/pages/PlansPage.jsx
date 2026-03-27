import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getDoctorById, getApprovedDoctorById, getApprovedPlans } from "../../api/doctorApi";
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
        let source = 'normal';
        try {
          doctorData = await getDoctorById(id);
        } catch (err) {
          if (err.response?.status === 404) {
            doctorData = await getApprovedDoctorById(id);
            source = 'approved';
          } else {
            throw err;
          }
        }
        setDoctor({
          ...doctorData,
          isApproved: source === 'approved',
        });

        let plansData = [];

try {
  plansData = await getApprovedPlans(id);
} catch (err) {
  console.warn("No plans found", err);
}

setPlans(plansData);

        setPlans(plansData);
      } catch (err) {
        console.error("Error fetching doctor or plans:", err);
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

if (loading) {
  return (
    <section className="plans-section">
      <div className="plans-wrapper">

        <div className="plans-header-content">
          <SkeletonCard height="30px" width="200px" />
          <SkeletonCard height="16px" width="260px" />
        </div>

        <div className="plans-grid">
          {[1,2,3].map((i)=>(
            <SkeletonCard key={i} height="300px"/>
          ))}
        </div>

      </div>
    </section>
  );
}
  if (error) return <div className="error-msg">{error}</div>;
  if (!doctor) return <div className="error-msg">Doctor not found</div>;

  return (
    <section className="plans-section">
      <div className="plans-wrapper">
        <div className="plans-header-content">
          <h2 className="plans-heading">
            Choose Your <span className="highlight">Plan</span>
          </h2>
          <p className="plans-subheading">
            Simple, sustainable, and effective nutrition coaching.
          </p>
        </div>

        <div className="plans-grid">
          {plans.length === 0 && <p>No plans available for this doctor.</p>}

          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${plan.featured ? "featured-card" : ""}`}
            >
              {plan.featured ? (
                <div className="popular-badge">Recommended</div>
              ) : null}

              <div className="plan-header">
                <span className="plan-title">{plan.plan_name || plan.title}</span> 

                <div className="plan-price-row">
                  <span className="price-amt">₹{plan.price}</span>
                  {plan.id === "monthly" && <span className="price-tenure">/ month</span>}
                </div>
                {plan.duration && (
                  <div className="plan-duration">
                    Duration: {plan.duration}
                  </div>
                )}

                {plan.price === "₹99" && (
                  <div className="refundable-info">
                    <span className="info-icon">!</span>
                    100% Refundable after consultation
                  </div>
                )}
              </div>

              <div className="divider" />

              <ul className="plan-features">
                {plan.features?.map((feature, index) => (
                  <li key={index} className="feature-item">
                    <span className="icon">✓</span>
                    <span className="label">{feature.feature_name}</span>
                    {feature.feature_value && (
                      <span className="value">{feature.feature_value}</span>
                    )}
                  </li>
                ))}
              </ul>

              <button className="plan-button" onClick={() => handleBook(plan)}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            {console.log("Doctor object before modal:", doctor)}
            {console.log("isApproved value being passed:", doctor?.isApproved)}
            {console.log("doctorId being passed:", doctor?.id || id)}
            <div className="modal-header-box">
              <h3 className="modal-title">Confirm Booking</h3>
            </div>

            <BookAppointment
              phone={doctor.phone}
              whatsapp={doctor.whatsapp}
              planName={selectedPlan?.plan_name || selectedPlan?.title}
              planPrice={selectedPlan?.price}
              doctorId={doctor.id || id}
              planId={selectedPlan.id}
              isApprovedDoctor={!!doctor.email}
              onClose={() => setShowModal(false)}
            />

            <button className="close-x" onClick={() => setShowModal(false)}>×</button>
          </div>
        </div>
      )}
    </section>
  );
}