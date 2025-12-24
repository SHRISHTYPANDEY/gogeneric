import { useEffect, useState } from "react";
import { useParams, useNavigate,useLocation } from "react-router-dom";
import api from "../../api/axiosInstance";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import "./OrderDetails.css";

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState([]);
  const orderSummary = location.state || {};
  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const handleTrackOrder = () => {
  navigate(`/orders/${orderInfo.order_id}/track`);
};


  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const guestId = localStorage.getItem("guest_id");

      const res = await api.get(
        "/api/v1/customer/order/details",
        {
          headers: {
            zoneId: JSON.stringify([3]),
            moduleId: "2",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          params: {
            order_id: orderId,
            ...(!token && guestId ? { guest_id: guestId } : {}),
          },
        }
      );

      console.log("ORDER DETAILS API RESPONSE from order details 👉", res.data);
      setDetails(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Order details error:", err);
      toast.error("Unable to load order details");
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  if (!details.length)
    return <p className="text-center">Order not found</p>;

  const orderInfo = details[0];

  const itemTotal = details.reduce(
  (sum, item) => sum + Number(item.price) * Number(item.quantity),
  0
);

const deliveryFee = Number(orderInfo.delivery_charge ?? 0);
const discount = Number(orderInfo.total_discount ?? 0);

// checkout style final bill
const totalPayable = Number(orderInfo.order_amount ?? itemTotal);


  const itemPrice = details.reduce(
  (sum, item) => sum + Number(item.price) * Number(item.quantity),
  0
);


  // ✅ FINAL AMOUNT — FROM BACKEND ONLY
  const finalAmount = Number(orderInfo.order_amount ?? 0);

  return (
    <div className="order-details-page">
      {/* HEADER */}
      <header className="order-details-header">
        <button onClick={() => navigate(-1)}>←</button>
        <h3>Order #{orderInfo.order_id}</h3>
      </header>

      {/* STATUS */}
      <div className={`order-status ${orderInfo.order_status}`}>
        {orderInfo.order_status}
      </div>

      {/* GENERAL INFO */}
      <div className="order-section">
        <h4>General Info</h4>
        <p><strong>Order ID:</strong> #{orderInfo.order_id}</p>
        <p>
          <strong>Order Date:</strong>{" "}
          {new Date(orderInfo.created_at).toLocaleString()}
        </p>
        {orderInfo.delivery_verification_code && (
          <p>
            <strong>Delivery Code:</strong>{" "}
            {orderInfo.delivery_verification_code}
          </p>
        )}
        <p>
          <strong>Payment:</strong>{" "}
          {orderInfo.payment_method || "Cash on Delivery"}
        </p>
      </div>
      {/* STORE */}
      <div className="order-section">
        <h4>Store</h4>
        <p>{orderInfo.store_name}</p>
      </div>

      {/* ITEMS */}
      <div className="order-section">
        <h4>Items</h4>

        {details.map((item) => (
          <div key={item.id} className="order-item">
            <div className="item-info">
              <strong>{item.item_details?.name}</strong>

              {/* VARIATION SAFE PARSE */}
              {item.variation && (() => {
                try {
                  const parsed =
                    typeof item.variation === "string"
                      ? JSON.parse(item.variation)
                      : item.variation;

                  return parsed?.[0]?.type ? (
                    <div className="variation">{parsed[0].type}</div>
                  ) : null;
                } catch {
                  return null;
                }
              })()}
            </div>

            <div className="item-meta">
              <span>Qty: {item.quantity}</span>
              <span>₹{item.price}</span>
            </div>
          </div>
        ))}
      </div>

      {/* DELIVERY ADDRESS */}
      {orderInfo.delivery_address && (
        <div className="order-section">
          <h4>Delivery Address</h4>
          <p>{orderInfo.delivery_address.address}</p>
          <p>{orderInfo.delivery_address.contact_person_name}</p>
          <p>{orderInfo.delivery_address.contact_person_number}</p>
        </div>
      )}

    {/* ORDER SUMMARY */}
<div className="order-section">
  <h4>Order Summary</h4>

  <div className="summary-row">
    <span>Item Total</span>
    <span>₹{itemTotal}</span>
  </div>

  <div className="summary-row">
    <span>Delivery Fee</span>
    <span>₹{deliveryFee}</span>
  </div>

  <div className="summary-row">
    <span>Discount</span>
    <span>- ₹{discount}</span>
  </div>

  <div className="summary-row total">
    <strong>Total Amount</strong>
    <strong>₹{totalPayable}</strong>
  </div>
</div>


      {/* ACTIONS */}
      <div className="order-actions">
        <button className="track-btn" onClick={handleTrackOrder}>Track Order</button>
        {["pending", "failed"].includes(orderInfo.order_status) && (
          <button className="cancel-btn">Cancel Order</button>
        )}
      </div>
    </div>
  );
}
