import React, { useEffect } from "react";
import "./Wallet.css";
import { FaWallet, FaRupeeSign } from "react-icons/fa";
import { useWallet } from "../../context/WalletContext";
import { useAuth } from "../../context/AuthContext";
import Loader from "../Loader";

export default function Wallet() {
  const { user } = useAuth();
const {
  balance = 0,
  transactions = [],
  loading = false,
  fetchWallet,
} = useWallet();

  /* ---------------- FETCH WALLET ---------------- */
  useEffect(() => {
    if (user) {
      fetchWallet();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="wallet-loader">
        <Loader />
      </div>
    );
  }

  return (
    <div className="wallet-page">
      {/* WALLET HEADER */}
      <div className="wallet-header">
        <FaWallet className="wallet-icon" />
        <h2>My Wallet</h2>
      </div>

      {/* BALANCE CARD */}
      <div className="wallet-balance-card">
        <span className="balance-label">Available Balance</span>
        <div className="balance-amount">
          <FaRupeeSign />
          {balance}
        </div>
      </div>

      {/* TRANSACTIONS */}
      <div className="wallet-transactions">
        <h3>Transaction History</h3>

        {transactions.length === 0 ? (
          <p className="empty-text">No wallet transactions found</p>
        ) : (
          <ul className="transaction-list">
          {transactions.map((tx) => {
  const credit = Number(tx.credit || 0);
  const debit = Number(tx.debit || 0);
  const amount = credit > 0 ? credit : debit;
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
        className={`tx-amount ${isCredit ? "credit" : "debit"}`}
      >
        {isCredit ? "+" : "-"}₹{amount}
      </span>
    </li>
  );
})}
          </ul>
        )}
      </div>
    </div>
  );
}
