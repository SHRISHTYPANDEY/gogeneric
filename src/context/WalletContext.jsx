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

    // console.log(" WALLET RAW DATA:", res.data);

    const txs = res.data?.data || [];

    // console.log(" WALLET TXs:", txs);

    const latestBalance =
      txs.length > 0 ? Number(txs[0].balance || 0) : 0;

    setTransactions(txs);
    setBalance(latestBalance);
  } catch (err) {
    // console.error("Wallet fetch error", err);
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
