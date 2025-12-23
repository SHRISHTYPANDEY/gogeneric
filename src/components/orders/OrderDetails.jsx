import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import "./OrderDetails.css";

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState([]);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const guestId = localStorage.getItem("guest_id");

      const res = await api.get(
        `/api/v1/customer/order/details`,
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
      console.log("ORDER DETAILS API RESPONSE 👉", res.data);
      setDetails(res.data || []);
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
  const totalAmount = details.reduce((sum, item) => {
  return sum + Number(item.price) * Number(item.quantity);
}, 0);


  return (
    <div className="order-details-page">
      <header className="order-details-header">
        <button onClick={() => navigate(-1)}>←</button>
        <h3>Order #{orderInfo.order_id}</h3>
      </header>

      {/* STATUS */}
      <div className={`order-status ${orderInfo.order_status}`}>
        {orderInfo.order_status}
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
            <div>
              <strong>{item.item_details?.name}</strong>
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

      {/* TOTAL */}
<div className="order-section total">
  <span>Total Amount</span>
  <strong>₹{totalAmount.toFixed(2)}</strong>
</div>

      {/* ADDRESS */}
      {orderInfo.delivery_address && (
        <div className="order-section">
          <h4>Delivery Address</h4>
          <p>{orderInfo.delivery_address.address}</p>
          <p>{orderInfo.delivery_address.contact_person_name}</p>
          <p>{orderInfo.delivery_address.contact_person_number}</p>
        </div>
      )}

      {/* TIME */}
      <div className="order-section">
        <h4>Ordered At</h4>
        <p>
          {new Date(orderInfo.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
