import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import OrderCard from "../../components/orders/OrderCard";
import Loader from "../../components/Loader";
import LoginModal from "../../components/auth/LoginModal";
import "./Orders.css";
import CancelOrder from "../orders/CancelOrder";

const TABS = {
  RUNNING: "running",
  HISTORY: "history",
};

export default function Orders() {
  const [activeTab, setActiveTab] = useState(TABS.RUNNING);
  const [orders, setOrders] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [cancelOrder, setCancelOrder] = useState(null);


  const fetchOrders = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const guestId = localStorage.getItem("guest_id");

      const isRunning = activeTab === TABS.RUNNING;

      const url = isRunning
        ? "/api/v1/customer/order/running-orders"
        : "/api/v1/customer/order/list";

      const res = await api.get(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        params: {
          limit: 10,
          offset: 1,
          ...(token ? {} : { guest_id: guestId }),
        },
      });

      // ✅ ALWAYS pick orders array safely
      const ordersArray = Array.isArray(res.data?.orders)
        ? res.data.orders
        : [];

      setOrders(ordersArray);
    } catch (error) {
      console.error("❌ Fetch orders failed:", error);

      if (error?.response?.status === 401) {
        setShowLogin(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  return (
    <div className="orders-page">
      <h2>My Orders</h2>

      {/* Tabs */}
      <div className="orders-tabs">
        <button
          className={activeTab === TABS.RUNNING ? "active" : ""}
          onClick={() => setActiveTab(TABS.RUNNING)}
        >
          Running Orders
        </button>

        <button
          className={activeTab === TABS.HISTORY ? "active" : ""}
          onClick={() => setActiveTab(TABS.HISTORY)}
        >
          Order History
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <Loader />
      ) : orders.length === 0 ? (
        <p className="empty-text">No orders found</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isRunning={activeTab === TABS.RUNNING}
              onCancel={(order) => setCancelOrder(order)}
            />
          ))}
        </div>
      )}
  {cancelOrder && (
  <CancelOrder
    order={cancelOrder}
    onClose={() => setCancelOrder(null)}
    onSuccess={fetchOrders}
  />
)}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}


    </div>
  );
}
