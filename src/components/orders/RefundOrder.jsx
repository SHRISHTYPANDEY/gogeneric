import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import Swal from "sweetalert2";
import "./RefundOrder.css";

export default function RefundOrder({ order, onClose, onSuccess }) {
  const [reasons, setReasons] = useState([]);
  const [reasonId, setReasonId] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const isAlreadyRequested =
    order.refund_status === "requested" ||
    order.refund_status === "approved" ||
    order.refund_status === "refunded";

  // 🔥 Fetch refund reasons
  useEffect(() => {
    api
      .get("/api/v1/customer/order/refund-reasons")
      .then((res) => {
        setReasons(res.data.refund_reasons || []);
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Oops!",
          text: "Failed to load refund reasons",
          confirmButtonColor: "#016B61",
        });
      });
  }, []);

  // 🔥 Submit refund request
  const handleSubmit = async () => {
    if (!reasonId) {
      Swal.fire({
        icon: "warning",
        title: "Required",
        text: "Please select a refund reason",
        confirmButtonColor: "#016B61",
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        order_id: order.id,
        customer_reason: reasonId,
        note: note,
      };

      const response = await api.post(
        "/api/v1/customer/order/refund-request",
        payload
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: response.data?.message || "Refund request submitted",
        confirmButtonColor: "#016B61",
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.errors?.[0]?.message ||
          "Refund request failed",
        confirmButtonColor: "#016B61",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Refund Order #{order.id}</h3>

        {isAlreadyRequested && (
          <p className="refund-info">
            Refund already requested for this order
          </p>
        )}

        <select
          value={reasonId}
          disabled={isAlreadyRequested}
          onChange={(e) => setReasonId(e.target.value)}
        >
          <option value="">Select refund reason</option>
          {reasons.map((r) => (
            <option key={r.id} value={r.id}>
              {r.reason}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Additional note (optional)"
          value={note}
          disabled={isAlreadyRequested}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">
            Close
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || isAlreadyRequested}
            className="btn-submit"
          >
            {loading ? (
              <span className="spinner" />
            ) : isAlreadyRequested ? (
              "Refund Requested"
            ) : (
              "Submit Refund"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
