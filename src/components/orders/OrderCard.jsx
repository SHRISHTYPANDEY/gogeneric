import { useNavigate } from "react-router-dom";
import { Truck, XCircle } from "lucide-react";
import { useState } from "react";
import CancelOrder from "./CancelOrder";
import "./OrderCard.css";

export default function OrderCard({ order, isRunning }) {
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const handleTrackOrder = (e) => {
    e.stopPropagation();
    navigate(`/orders/${order.id}/track`);
  };
  const canCancel = ["pending", "failed"].includes(order.order_status);
  return (
    <>
    <div
  className="order-card"
  onClick={() =>
  navigate(`/orders/${order.id}`, {
  state: {
    orderAmount: order.order_amount,
    itemPrice: order.item_price,
    deliveryFee: order.delivery_charge,
    discount: order.discount_amount,
  },
})
  }
>
        <div className="order-header">
          <span>Order #{order.id}</span>
          <span className={`status-badge ${order.order_status}`}>
            {order.order_status}
          </span>
        </div>

        <div className="order-body">
          <p>{order.store?.name}</p>
          <p>{order.details_count} items</p>
          <p>₹{order.order_amount}</p>
        </div>

        <div className="order-footer">
          <span>{new Date(order.created_at).toLocaleString()}</span>

          <div className="order-actions">
            {isRunning && (
              <button className="track-btn" onClick={handleTrackOrder}>
                <Truck size={16} /> Track
              </button>
            )}

            {canCancel && (
              <button
                className="cancel-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCancelModal(true); 
                }}
              >
                <XCircle size={16} /> Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 🔥 CANCEL MODAL */}
      {showCancelModal && (
        <CancelOrder
          order={order}
          onClose={() => setShowCancelModal(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}
