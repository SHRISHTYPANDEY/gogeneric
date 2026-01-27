import { useNavigate } from "react-router-dom";
import { Truck, XCircle } from "lucide-react";
import { useState } from "react";
import CancelOrder from "./CancelOrder";
import "./OrderCard.css";
import api from "../../api/axiosInstance";
import { RotateCcw } from "lucide-react";
import RefundOrder from "./RefundOrder";
export default function OrderCard({ order, isRunning }) {
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const isDelivered = order.order_status === "delivered";

  const [showRefundModal, setShowRefundModal] = useState(false);

  const handleDownloadInvoice = async (e) => {
    e.stopPropagation();

    try {
      const response = await api.get(`/orders/${order.id}/invoice`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice_Order_${order.id}.pdf`;
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Invoice download error:", error);
      alert("Invoice download failed");
    }
  };
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
          <p>
            {order.details_count > 0
              ? `${order.details_count} items`
              : "Prescription Order"}
          </p>

          <p>₹{order.order_amount}</p>

          {isRunning && order.otp && (
            <p className="order-otp">
              <strong>Delivery OTP:</strong> {order.otp}
            </p>
          )}
        </div>
        <div className="order-footer">
          <span>{new Date(order.created_at).toLocaleString()}</span>
          <div className="order-actions">
            {isDelivered && (
              <button className="invoice-btn" onClick={handleDownloadInvoice}>
                📄 Invoice
              </button>
            )}
            {isDelivered && (
              <button
                className="refund-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRefundModal(true);
                }}
              >
                <RotateCcw size={16} /> Refund
              </button>
            )}
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
      {showCancelModal && (
        <CancelOrder
          order={order}
          onClose={() => setShowCancelModal(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
      {showRefundModal && (
        <RefundOrder
          order={order}
          onClose={() => setShowRefundModal(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}
