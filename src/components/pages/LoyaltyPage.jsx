import React, { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "./LoyaltyPage.css";
import Loader from "../Loader";

export default function LoyaltyPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);

  const [showConvertModal, setShowConvertModal] = useState(false);
  const MIN_POINTS = 51;

  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);

  const fetchLoyaltyData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await api.get("/api/v1/customer/loyalty-point/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
          moduleId: 2,
          zoneId: JSON.stringify([3]),
        },
        params: { limit: 20, offset: 0 },
      });
      console.log("loyalty point response", res);
      const pts = res.data?.data || [];
      setTransactions(pts);

      const total = pts.reduce(
        (sum, tx) => sum + Number(tx.credit || 0) - Number(tx.debit || 0),
        0
      );

      setTotalPoints(total);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load loyalty points");
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();

    if (!receiver || !amount) {
      toast.error("All fields are required");
      return;
    }

    if (amount <= 0) {
      toast.error("Invalid amount");
      return;
    }

    if (amount > totalPoints) {
      toast.error("Insufficient points");
      return;
    }

    try {
      setTransferLoading(true);
      const token = localStorage.getItem("token");

      await api.post(
        "/api/v1/customer/loyalty-point/point-transfer",
        {
          receiver,
          amount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            moduleId: 2,
            zoneId: JSON.stringify([3]),
          },
        }
      );
      console.log("loyalty point transfer response", res);
      toast.success("Points transferred successfully");
      setReceiver("");
      setAmount("");
      fetchLoyaltyData();
    } catch (err) {
      console.error(err);
      toast.error("Transfer failed");
    } finally {
      setTransferLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  if (loading) {
    return <Loader text="Loading loyalty points" />;
  }

  return (
    <>
      <div className="loyalty-page">
        <h1>Loyalty Points</h1>

        <div className="loyalty-balance">
          <h2>Total Points</h2>
          <span>{totalPoints}</span>
        </div>
        <button
          className="convert-btn"
          disabled={totalPoints < MIN_POINTS}
          onClick={() => setShowConvertModal(true)}
        >
          Convert to Wallet Money
        </button>

        {totalPoints < MIN_POINTS && (
          <p className="hint-text">
            Minimum {MIN_POINTS} loyalty points required
          </p>
        )}

        <div className="loyalty-transactions">
          <h2>Recent Transactions</h2>

          {transactions.length === 0 ? (
            <p>No transactions found</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Credit</th>
                  <th>Debit</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr key={i}>
                    <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                    <td>{tx.reference || "—"}</td>
                    <td className="credit">{tx.credit || "-"}</td>
                    <td className="debit">{tx.debit || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {showConvertModal && (
        <div className="convert-modal-overlay">
          <div className="convert-modal">
            <h3>Convert Loyalty Points</h3>

            <div className="convert-row">
              <label>Total Loyalty Points</label>
              <input type="number" value={totalPoints} disabled />
            </div>

            <p className="conversion-note">1 Loyalty Point = ₹1</p>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowConvertModal(false)}
              >
                Cancel
              </button>

              <button
                className="btn-primary"
                onClick={() => {
                  if (totalPoints < MIN_POINTS) {
                    toast.error("Minimum 51 loyalty points required");
                    return;
                  }

                  toast("Conversion will be available soon", {
                    icon: "ℹ️",
                  });
                  setShowConvertModal(false);
                }}
              >
                Convert
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
