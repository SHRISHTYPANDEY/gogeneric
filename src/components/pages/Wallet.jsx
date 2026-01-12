import React, { useEffect, useState } from "react";
import "./Wallet.css";
import { FaWallet, FaRupeeSign } from "react-icons/fa";
import { useWallet } from "../../context/WalletContext";
import { useAuth } from "../../context/AuthContext";
import Loader from "../Loader";
import { openRazorpay } from "../../utils/razorpayPayment";
import api from "../../api/axiosInstance";

export default function Wallet() {
  const { user } = useAuth();
  const {
    balance = 0,
    transactions = [],
    loading = false,
    fetchWallet,
  } = useWallet();

  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (user) {
      fetchWallet();
    }
  }, [user]);


const handleAddMoney = async () => {
  const numericAmount = Number(amount);

  if (!numericAmount || numericAmount < 10) {
    alert("Minimum amount to add is ₹10");
    return;
  }

  try {
    const res = await api.post("/api/v1/customer/wallet/add-fund", {
      amount: numericAmount,
      payment_method: "razorpay",
    });

    const paymentData = res.data;

    // 🔥 OPEN RAZORPAY MODAL
    openRazorpay({
      key: paymentData.razorpay_key,
      amount: paymentData.amount * 100,
      currency: "INR",
      order_id: paymentData.order_id,
      name: "GoGeneric Wallet",
      description: "Wallet Top-up",
      handler: async function (response) {
        alert("Payment Successful");
        fetchWallet();
        setShowAddMoney(false);
        setAmount("");
      },
      modal: {
        ondismiss: () => {
          alert("Payment cancelled");
        },
      },
    });
  } catch (err) {
    console.error(err);
    alert("Payment initiation failed");
  }
};


  if (loading) {
    return (
      <div className="wallet-loader">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="wallet-page">
        <div className="wallet-header">
          <FaWallet className="wallet-icon" />
          <h2>My Wallet</h2>
        </div>

        <div className="wallet-balance-card">
          <span className="balance-label">Available Balance</span>
          <div className="balance-amount">
            <FaRupeeSign />
            {balance}
          </div>

          <button
            className="add-money-btn"
            onClick={() => setShowAddMoney(true)}
          >
            Add Money
          </button>
        </div>

        <div className="wallet-transactions">
          <h3>Transaction History</h3>

          {transactions.length === 0 ? (
            <p className="empty-text">No wallet transactions found</p>
          ) : (
            <ul className="transaction-list">
              {transactions.map((tx) => {
                const credit = Number(tx.credit || 0);
                const debit = Number(tx.debit || 0);
                const txAmount = credit > 0 ? credit : debit;
                const isCredit = credit > 0;

                return (
                  <li key={tx.id} className="transaction-item">
                    <div>
                      <p className="tx-title">
                        {tx.transaction_type || "Wallet Transaction"}
                      </p>
                      <span className="tx-date">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <span
                      className={`tx-amount ${
                        isCredit ? "credit" : "debit"
                      }`}
                    >
                      {isCredit ? "+" : "-"}₹{txAmount}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {showAddMoney && (
        <div className="wallet-modal-overlay">
          <div className="wallet-modal">
            <h3>Add Money to Wallet</h3>

            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <div className="wallet-modal-actions">
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowAddMoney(false);
                  setAmount("");
                }}
              >
                Cancel
              </button>

              <button
                className="btn-primary"
                onClick={handleAddMoney}
                disabled={!amount || Number(amount) < 10}
              >
                Proceed to Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
