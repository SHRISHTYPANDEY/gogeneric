import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import Loader from "../../components/Loader";
import "./TrackOrder.css";

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "out_for_delivery", label: "On the Way" },
  { key: "delivered", label: "Delivered" },
];

export default function TrackOrder() {
  const { id } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTracking = async () => {
    try {
      const token = localStorage.getItem("token");
      const guestId = localStorage.getItem("guest_id");

      const res = await api.get("/api/v1/customer/order/track", {
        params: {
          order_id: id,
          ...(token ? {} : { guest_id: guestId }),
        },
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      // console.log("📦 TRACK ORDER FULL RESPONSE:", res.data);
      setTracking(res.data);
    } catch (error) {
      console.error("❌ Track order failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
  }, []);

  if (loading) return <Loader />;
  if (!tracking) return <p>No tracking data found</p>;

  const currentStep = STATUS_STEPS.findIndex(
    (s) => s.key === tracking.order_status
  );

  return (
    <div className="track-order-page">
      <h2>Tracking Order #{id}</h2>

      {/* STATUS STEPPER */}
      <div className="order-stepper">
        {STATUS_STEPS.map((step, index) => (
          <div key={step.key} className="step-wrapper">
            <div
              className={`step-circle ${
                index <= currentStep ? "active" : ""
              }`}
            >
              {index + 1}
            </div>
            <p
              className={`step-label ${
                index <= currentStep ? "active" : ""
              }`}
            >
              {step.label}
            </p>

            {index !== STATUS_STEPS.length - 1 && (
              <div
                className={`step-line ${
                  index < currentStep ? "active" : ""
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* DETAILS CARD */}
      <div className="track-card">
        <p><b>Status:</b> {tracking.order_status}</p>
        <p><b>Store:</b> {tracking.store?.name}</p>

        {tracking.delivery_man && (
          <>
            <p><b>Delivery Partner:</b> {tracking.delivery_man.name}</p>
            <p><b>Phone:</b> {tracking.delivery_man.phone}</p>
          </>
        )}
      </div>
    </div>
  );
}
