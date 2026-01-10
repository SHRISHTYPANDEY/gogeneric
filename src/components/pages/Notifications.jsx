import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import "./Notifications.css";
import Footer from "../Footer";
import { cleanImageUrl } from "../../utils";

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState(null); 

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
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p className="text-center mt-10">Please login</p>;
  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <>
      <div className="notifications-page">
        <h2>Notifications</h2>

        {notifications.length === 0 && (
          <p className="empty">No notifications found</p>
        )}

        {notifications.map((n) => (
          <div
            key={n.id}
            className={`notification-card ${n.status === 0 ? "unread" : ""}`}
            onClick={() => setSelectedNotif(n)}
          >
            {(n.image_full_url || n.image || n.data?.image) && (
              <img
                src={cleanImageUrl(n.image_full_url || n.image || n.data?.image)}
                alt={n.data?.title || n.title}
                className="notification-image"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            )}
            <div className="notification-content">
              <h4>{n.data?.title || n.title}</h4>
              <p>{n.data?.description || n.description}</p>
              <span>{new Date(n.created_at).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedNotif && (
        <div className="modal-overlay" onClick={() => setSelectedNotif(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedNotif(null)}>&times;</button>
            
            {(selectedNotif.image_full_url || selectedNotif.image || selectedNotif.data?.image) && (
              <img
                src={cleanImageUrl(selectedNotif.image_full_url || selectedNotif.image || selectedNotif.data?.image)}
                alt="Notification"
                className="modal-image"
              />
            )}
            
            <div className="modal-body">
              <h3>{selectedNotif.data?.title || selectedNotif.title}</h3>
              <p className="modal-date">{new Date(selectedNotif.created_at).toLocaleString()}</p>
              <div className="modal-desc">
                {selectedNotif.data?.description || selectedNotif.description}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}