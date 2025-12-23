import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { useAuth } from "./AuthContext";

const WalletContext = createContext({
  walletBalance: 0,
  loading: false,
  transactions: [],
  refreshWallet: () => {},
});


export const WalletProvider = ({ children }) => {
  const { user } = useAuth();

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWallet = async () => {
    try {
      if (!user) {
        setBalance(0);
        setTransactions([]);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);

      const res = await api.get(
        "/api/v1/customer/wallet/transactions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            zoneId: JSON.stringify([3]),
            moduleId: 2,
          },
          params: {
            limit: 100,
            offset: 0,
          },
        }
      );

      const txs = res.data?.transactions || [];

      const total = txs.reduce(
        (sum, tx) => sum + Number(tx.amount || 0),
        0
      );

      setTransactions(txs);
      setBalance(total);
    } catch (err) {
      console.error("Wallet fetch error", err);
      setBalance(0);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Auto refresh on login/logout
  useEffect(() => {
    fetchWallet();
  }, [user]);

  return (
    <WalletContext.Provider
      value={{
        balance,
        transactions,
        loading,
        fetchWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
