import { useEffect, useRef } from "react";
import api from "../api/axiosInstance";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import { cleanImageUrl } from "../utils";

/**
 * Center modal notification helper
 */
const showNotificationModal = ({ title, description, image }) => {
  Swal.fire({
    title: title || "Notification",
    html: `
      <div style="display:flex; gap:12px; align-items:flex-start; text-align:left;">
        ${
          image
            ? `<img src="${image}" style="width:56px;height:56px;object-fit:contain;border-radius:8px;background:#f5f5f5;padding:6px;" />`
            : ""
        }
        <div>
          <p style="margin:0;font-size:14px;color:#444;line-height:1.4;">
            ${description || ""}
          </p>
        </div>
      </div>
    `,
    showConfirmButton: false,
    timer: 6000,
    backdrop: "rgba(0,0,0,0.45)",
    width: 420,
  });
};

export default function NotificationListener() {
  const { user } = useAuth();
  const lastNotificationId = useRef(null);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await api.get("/api/v1/customer/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
            moduleId: 2,
            zoneId: JSON.stringify([3]),
          },
        });

        const notifications = res.data || [];
        const unread = notifications.find((n) => n.status === 0);

        if (unread && unread.id !== lastNotificationId.current) {
          lastNotificationId.current = unread.id;

          showNotificationModal({
            title: unread.data?.title || unread.title,
            description:
              unread.data?.description || unread.description,
            image: unread.image
              ? cleanImageUrl(unread.image)
              : null,
          });
        }
      } catch (err) {
        console.error("Notification fetch failed", err);
      }
    }, 10000); 

    return () => clearInterval(interval);
  }, [user]);

  return null;
}
