import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import "./Notifications.css";

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/api/v1/customer/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
          moduleId: 2,
          zoneId: JSON.stringify([3]),
        },
      });

      setNotifications(res.data || []);
    } catch (err) {
      toast.error("Failed to load notifications");
      console.error("Notification error:", err?.response);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <p className="text-center mt-10">Please login</p>;
  }

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="notifications-page">
      <h2>Notifications</h2>

      {notifications.length === 0 && (
        <p className="empty">No notifications found</p>
      )}

      {notifications.map((n) => (
        <div
          key={n.id}
          className={`notification-card ${!n.read ? "unread" : ""}`}
        >
          <h4>{n.title}</h4>
          <p>{n.description}</p>
          <span>
            {new Date(n.created_at).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
