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

      console.log("📦 FETCHING ORDERS");
      console.log("TAB:", activeTab);
      console.log("URL:", url);
      console.log("TOKEN:", token);
      console.log("GUEST ID:", guestId);

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

      console.log("✅ FULL API RESPONSE:", res);
      console.log("✅ RESPONSE DATA:", res.data);

      let ordersArray = [];

      if (Array.isArray(res.data?.orders)) {
        console.log("📌 Orders found in res.data.orders");
        ordersArray = res.data.orders;
      } else if (Array.isArray(res.data?.data)) {
        console.log("📌 Orders found in res.data.data");
        ordersArray = res.data.data;
      } else if (Array.isArray(res.data)) {
        console.log("📌 Orders found in res.data (array)");
        ordersArray = res.data;
      } else {
        console.warn("⚠️ Orders NOT found in expected keys");
      }

      console.log("🧾 FINAL ORDERS ARRAY:", ordersArray);
      console.log("🧾 ORDERS COUNT:", ordersArray.length);

      setOrders(ordersArray);
    } catch (error) {
      console.error("❌ Fetch orders failed:", error);
      console.error("❌ ERROR RESPONSE:", error?.response?.data);

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
              key={order.id || order.order_id}
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
