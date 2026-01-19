import { useEffect, useState, useRef } from "react";
import { MdLocationOn } from "react-icons/md";
import { IoMdArrowDropdown } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import "./TopHeader.css";
import LocationModal from "../Location/LocationModal";
import LoginModal from "../auth/LoginModal";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { useLocation } from "../../context/LocationContext";
import LogoImg from "../../assets/gogenlogo.png";
import { FaShoppingCart, FaBell,FaDownload } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import SearchOverlayModal from "./SearchOverlayModal";

export default function TopHeader() {
  const { t } = useTranslation();
  const { location, setLocation, notifyAddressChange } = useLocation();

  const [open, setOpen] = useState(false);
  const [openLocationModal, setOpenLocationModal] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);

  const { user, logout } = useAuth();
  const [currentUserName, setCurrentUserName] = useState("Login");
  const navigate = useNavigate();
  const langRef = useRef(null);

  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  const [openSearchModal, setOpenSearchModal] = useState(false);


  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const handleProfileClick = () => {
    if (user) navigate("/profile");
    else setOpenLoginModal(true);
  };

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const guestId = localStorage.getItem("guest_id");

      const res = await api.get("/api/v1/customer/cart/list", {
        headers: {
          moduleId: 2,
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        params: !token && guestId ? { guest_id: guestId } : {},
      });

      setCartCount(Array.isArray(res.data) ? res.data.length : 0);
    } catch {}
  };

  const fetchNotifications = async () => {
  try {
    if (!user) {
      setNotificationCount(0);
      return;
    }

    const token = localStorage.getItem("token");

    const res = await api.get("/api/v1/customer/notifications", {
      headers: {
        Authorization: `Bearer ${token}`,
        moduleId: 2,
        zoneId: JSON.stringify([3]),
      },
    });

    // ✅ status === 0 means UNREAD
    const unreadCount = res.data.filter((n) => n.status === 0).length;
    setNotificationCount(unreadCount);
  } catch (err) {
    console.error("Notification fetch failed");
  }
};

useEffect(() => {
  fetchCartCount();
  fetchNotifications();

  window.addEventListener("cart-updated", fetchCartCount);
  window.addEventListener("notifications-updated", fetchNotifications);

  return () => {
    window.removeEventListener("cart-updated", fetchCartCount);
    window.removeEventListener("notifications-updated", fetchNotifications);
  };
}, [user]);

  return (
    <>
     <nav className="topheader-wrapper w-full">
        <div className="flex items-center justify-between">
          <div className="topheader-icons flex items-center gap-6">
            <img
              src={LogoImg}
              alt="GoGeneric"
              className="cursor-pointer"
              onClick={() => navigate("/")}
            />

            <div
              className="location-trigger group"
              onClick={() => setOpenLocationModal(true)}
            >
              <MdLocationOn size={20} className="text-orange-500" />
              <div className="ml-2">
                <span className="text-xs text-gray-400">{t("location")}</span>
                <div className="text-sm font-semibold">
                  {location?.address || t("selectLocation")}
                </div>
              </div>
              <IoMdArrowDropdown />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* DOWNLOAD APP */}
<div
  className="download-app-btn cursor-pointer"
  onClick={() => window.open("https://play.google.com/store/apps/details?id=com.gogeneric.user", "_blank")}
>
  <FaDownload size={16} />
  <span>Download App</span>
</div>

            {/* SEARCH ICON (New) */}
          <div
  className="relative cursor-pointer md:hidden"
  onClick={() => setOpenSearchModal(true)}
>
  <IoSearch size={20} className="text-white" />
</div>


            {/* NOTIFICATIONS */}
            <div
              className="relative cursor-pointer"
              onClick={() => user ? navigate("/notifications") : setOpenLoginModal(true)}
            >
              <FaBell size={18} />
              {notificationCount > 0 && (
                <span className="badge">{notificationCount}</span>
              )}
            </div>

            {/* CART */}
            <div
              className="relative cursor-pointer"
              onClick={() => navigate("/cart")}
            >
              <FaShoppingCart size={18} />
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </div>

            {/* PROFILE */}
            <div
              className="profile-trigger-premium cursor-pointer"
              onClick={handleProfileClick}
            >
              <CgProfile size={20} />
              <span className="font-semibold">
                {user ? user.name?.split(" ")[0] : t("login")}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {openLoginModal && (
        <LoginModal onClose={() => setOpenLoginModal(false)} />
      )}

      {openLocationModal && (
        <LocationModal
          initialPosition={location}
          onClose={() => setOpenLocationModal(false)}
          onPickLocation={async (loc) => {
            const payload = {
              lat: Number(loc.lat),
              lng: Number(loc.lng),
              address: loc.address,
            };

            setLocation(payload);
            localStorage.setItem("user_location", JSON.stringify(payload));
            localStorage.setItem("location_allowed", "true");
            try {
              const token = localStorage.getItem("token");
              if (!token) return;

              const res = await api.get("/api/v1/customer/address/list", {
                headers: { Authorization: `Bearer ${token}` },
              });
              // console.log("ADDress list", res.data);
              const addresses = res.data?.addresses || [];

              const alreadyExists = addresses.find(
                (a) =>
                  Number(a.latitude) === payload.lat &&
                  Number(a.longitude) === payload.lng
              );

              if (!alreadyExists) {
                await api.post(
                  "/api/v1/customer/address/add",
                  {
                    contact_person_name: user?.name || "Customer",
                    contact_person_number: user?.phone || "",
                    address_type: "Home",
                    address: payload.address,
                    latitude: payload.lat,
                    longitude: payload.lng,
                  },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
              }
              notifyAddressChange();
              toast.success("Delivery location updated");
            } catch (err) {
              console.error(err);
            }

            setOpenLocationModal(false);
          }}
        />
      )}
      {openSearchModal && (
  <SearchOverlayModal onClose={() => setOpenSearchModal(false)} />
)}

    </>
  );
  
}
