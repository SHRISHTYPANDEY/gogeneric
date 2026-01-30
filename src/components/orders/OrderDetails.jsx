import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cleanImageUrl } from "../../utils";
import { ArrowLeft, Phone, Mail, PackageSearch } from "lucide-react";
import api from "../../api/axiosInstance";
import Loader from "../../components/Loader";
import "./OrderDetails.css";

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState([]);
  const [store, setStore] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const guestId = localStorage.getItem("guest_id");

      const res = await api.get("/api/v1/customer/order/details", {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: "2",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        params: {
          order_id: orderId,
          ...(!token && guestId ? { guest_id: guestId } : {}),
        },
      });
      console.log("orderdetailssss", res.data);
      const data = res.data;

      let normalized = [];
      if (Array.isArray(data)) {
        normalized = data;
      } else if (data && typeof data === "object") {
        normalized = [data];
      }

      setDetails(normalized);

      const orderInfo = normalized[0];
      if (orderInfo?.store_id && !orderInfo.store && !orderInfo.store_details) {
        fetchStoreDetails(orderInfo.store_id);
      }
    } catch (err) {
      console.error("Order details error:", err);
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreDetails = async (storeId) => {
    try {
      const res = await api.get(`/api/v1/stores/details/${storeId}`, {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: "2",
        },
      });

      setStore(res.data);
    } catch (err) {
      console.error("Store fetch error:", err);
    }
  };

  if (loading) return <Loader />;
  if (!details.length) return <p className="text-center">Order not found</p>;

  const orderInfo = details[0];

  // ✅ FINAL store resolver
  const resolvedStore =
    store ||
    orderInfo?.store ||
    orderInfo?.store_details ||
    orderInfo?.item_details?.store ||
    null;

  const hasItems = details.some((d) => d.item_details);

  const itemTotal = hasItems
    ? details.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 0),
        0,
      )
    : 0;

  const deliveryFee = Number(orderInfo.delivery_charge ?? 0);
  const totalPayable = Number(orderInfo.order_amount ?? itemTotal);

  const handleTrackOrder = () => {
    if (!resolvedOrderId) return;
    navigate(`/orders/${resolvedOrderId}/track`);
  };

  const safeImage = (val) =>
    typeof val === "string" ? cleanImageUrl(val) : "";
  const resolvedOrderId = orderInfo?.order_id || orderInfo?.id;

  return (
    <div className="order-details-page">
      <header className="order-details-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={18} />
        </button>
        <h3>Order #{resolvedOrderId}</h3>
      </header>

      <div className={`order-status ${orderInfo.order_status}`}>
        {orderInfo.order_status}
      </div>

      <div className="order-section">
        <h4>General Info</h4>
        <p>
          <strong>Order ID:</strong> #{resolvedOrderId}
        </p>

        <p>
          <strong>Order Date:</strong>{" "}
          {new Date(orderInfo.created_at).toLocaleString()}
        </p>
        <p>
          <strong>Payment:</strong>{" "}
          {orderInfo.payment_method || "Cash on Delivery"}
        </p>
      </div>

      {resolvedStore && (
        <div className="order-section store-section">
          <h4>Store</h4>

          <div className="store-info">
            <img
              src={safeImage(resolvedStore.logo_full_url)}
              alt={resolvedStore.name || "Store"}
              className="store-logo"
              onError={(e) => {
                e.currentTarget.src = "/images/store-placeholder.png";
              }}
            />

            <div>
              <p className="store-name">{resolvedStore.name}</p>

              {resolvedStore.phone && (
                <p className="store-contact">
                  <Phone size={14} /> {resolvedStore.phone}
                </p>
              )}

              {resolvedStore.email && (
                <p className="store-contact">
                  <Mail size={14} /> {resolvedStore.email}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {hasItems && (
        <div className="order-section">
          <h4>Items</h4>

          {details.map((item) => (
            <div key={item.id} className="order-item">
              <div className="item-info">
                <strong>{item.item_details?.name}</strong>
              </div>

              <div className="item-meta">
                <span>Qty: {item.quantity}</span>
                <span>₹{item.price}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {orderInfo.order_attachment_full_url &&
        Array.isArray(orderInfo.order_attachment_full_url) &&
        orderInfo.order_attachment_full_url.length > 0 && (
          <div className="order-section">
            <h4>Prescription</h4>

            <div className="prescription-preview">
              <img
                src={cleanImageUrl(orderInfo.order_attachment_full_url[0])}
                alt="Prescription"
                className="prescription-image"
                onClick={() =>
                  window.open(
                    cleanImageUrl(orderInfo.order_attachment_full_url[0]),
                    "_blank",
                  )
                }
                onError={(e) => {
                  e.currentTarget.src = "/images/prescription-placeholder.png";
                }}
              />
            </div>
          </div>
        )}

      {orderInfo.delivery_address && (
        <div className="order-section">
          <h4>Delivery Address</h4>
          <p>{orderInfo.delivery_address.address}</p>
          <p>{orderInfo.delivery_address.contact_person_name}</p>
          <p>{orderInfo.delivery_address.contact_person_number}</p>
        </div>
      )}

      <div className="order-section">
        <h4>Order Summary</h4>

        {hasItems && (
          <div className="summary-row">
            <span>Item Total</span>
            <span>₹{itemTotal}</span>
          </div>
        )}

        <div className="summary-row">
          <span>Delivery Fee</span>
          <span>₹{deliveryFee}</span>
        </div>

        <div className="summary-row total">
          <strong>Total Amount</strong>
          <strong>₹{totalPayable}</strong>
        </div>
      </div>

      <div className="order-actions">
        <button className="track-btn" onClick={handleTrackOrder}>
          <PackageSearch size={16} /> Track Order
        </button>

        {["pending", "failed"].includes(orderInfo.order_status) && (
          <button className="cancel-btn">Cancel Order</button>
        )}
      </div>
    </div>
  );
}
