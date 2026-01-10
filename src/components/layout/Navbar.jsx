import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { HiBars3 } from "react-icons/hi2";
import {
  FaSignOutAlt,
  FaShoppingCart,
  FaBell,
  FaUser,
  FaShoppingBag,
  FaMapMarkedAlt,
  FaLanguage,
  FaTags,
  FaHeadset,
  FaComments,
  FaUndo,
  FaWallet,
  FaTimesCircle,
  FaFileContract,
  FaHeart,
  FaShippingFast,
  FaHome,
  FaInfoCircle,
  FaClinicMedical,
  FaFlask,
  FaUserMd,
  FaNewspaper,
  FaPhoneAlt,
  FaUsers,
} from "react-icons/fa";
import { MdPrivacyTip } from "react-icons/md";
import api from "../../api/axiosInstance";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import LoginModal from "../auth/LoginModal";
import LogoImg from "../../assets/gogenlogo.png";
import { useLocation } from "../../context/LocationContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const { resetLocation } = useLocation();

  /* ---------------- COMMON CLOSE ---------------- */
  const closeMenu = () => setOpen(false);

  /* ---------------- NOTIFICATIONS ---------------- */
  const fetchNotifications = async () => {
    try {
      if (!user) return;
      const token = localStorage.getItem("token");

      const res = await api.get("/api/v1/customer/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
          moduleId: 2,
          zoneId: JSON.stringify([3]),
        },
      });

      setNotificationCount(res.data.filter((n) => !n.read).length);
    } catch (err) {
      // console.error("Notification error", err);
    }
  };
  const handleNavigate = (path) => {
    closeMenu();
    navigate(path);
  };

  /* ---------------- CART COUNT ---------------- */
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
    } catch (error) {
      // console.error("Cart count error:", error);
    }
  };

  useEffect(() => {
    fetchCartCount();
    fetchNotifications();
    window.addEventListener("cart-updated", fetchCartCount);
    return () => window.removeEventListener("cart-updated", fetchCartCount);
  }, [user]);

  const handleProfileClick = () => {
    closeMenu();
    const token = localStorage.getItem("token");

    if (!token) {
      setShowLogin(true);
      return;
    }

    navigate("/profile");
  };

  const handleLogout = () => {
    closeMenu();
    logout();
    resetLocation();
    navigate("/");
  };

  return (
    <>
     
      <nav className="navbar">
        <div className="nav-container max-w-7xl mx-auto px-4 py-3">
          <div className="nav-logo">
            <Link
              to="/"
              onClick={() => {
                closeMenu();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <img src={LogoImg} alt="GoGeneric Logo" />
            </Link>
          </div>

          <div className="flex items-center gap-6">
            
            <ul className="nav-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/aboutus">About</Link>
              </li>
              <li>
                <Link to="/who-we-are">Who We Are</Link>
              </li>
              <li>
                <Link to="/pharmacy">Pharmacy</Link>
              </li>
              <li>
                <Link to="/labs">Labs</Link>
              </li>
              <li>
                <Link to="/doctors">Doctors</Link>
              </li>
              <li>
                <Link to="/blog">Blog</Link>
              </li>
              <li>
                <Link to="/contactus">Contact Us</Link>
              </li>
            </ul>

            
            <div
              className="notification-icon"
              onClick={() => {
                closeMenu();
                user ? navigate("/notifications") : setShowLogin(true);
              }}
            >
              <FaBell />
              {notificationCount > 0 && (
                <span className="notification-badge">{notificationCount}</span>
              )}
            </div>

            
            <div
              className="cart-icon"
              onClick={() => {
                closeMenu();
                navigate("/cart");
              }}
            >
              <FaShoppingCart />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>

           
            <div className="hamburger" onClick={() => setOpen(true)}>
              <HiBars3 />
            </div>
          </div>
        </div>
      </nav>

      {open && <div className="overlay" onClick={closeMenu} />}

      <div className={`side-menu ${open ? "open" : ""}`}>
        <div className="side-header">
          Menu
          <RxCross1 className="close-btn" onClick={closeMenu} />
        </div>

        <ul className="side-links">
          <li>
            <Link to="/" onClick={() => handleNavigate("/")}>
              <FaHome /> Home
            </Link>
          </li>

          <li>
            <Link to="/aboutus" onClick={() => handleNavigate("/aboutus")}>
              <FaInfoCircle /> About
            </Link>
          </li>

          <li>
            <Link to="/pharmacy" onClick={() => handleNavigate("/pharmacy")}>
              <FaClinicMedical /> Pharmacy
            </Link>
          </li>

          <li>
            <Link to="/labs" onClick={() => handleNavigate("/labs")}>
              <FaFlask /> Labs
            </Link>
          </li>

          <li>
            <Link to="/doctors" onClick={() => handleNavigate("/doctors")}>
              <FaUserMd /> Doctors
            </Link>
          </li>

          <li>
            <Link to="/blog" onClick={() => handleNavigate("/blog")}>
              <FaNewspaper /> Blog
            </Link>
          </li>

          <li>
            <Link to="/contactus" onClick={() => handleNavigate("/contactus")}>
              <FaPhoneAlt /> Contact Us
            </Link>
          </li>

          <li>
            <Link to="/who-we-are" onClick={() => handleNavigate("/whoweare")}>
              <FaUsers /> Who We Are
            </Link>
          </li>
          <li>
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                handleProfileClick();
              }}
            >
              <FaUser /> Profile
            </Link>
          </li>

          <li>
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                closeMenu();
                user ? navigate("/wishlist") : setShowLogin(true);
              }}
            >
              <FaHeart /> My Wishlist
              {wishlist.length > 0 && (
                <span className="wishlist-badge">{wishlist.length}</span>
              )}
            </Link>
          </li>

          {user && (
            <li>
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigate("/orders");
                }}
              >
                <FaShoppingBag /> My Orders
              </Link>
            </li>
          )}

          {user && (
            <li>
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigate("/wallet");
                }}
              >
                <FaWallet /> My Wallet
              </Link>
            </li>
          )}

          <li>
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("/my-address");
              }}
            >
              <FaMapMarkedAlt /> My Address
            </Link>
          </li>
          <li>
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("/language");
              }}
            >
              <FaLanguage /> Language
            </Link>
          </li>
          <li>
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("/coupon");
              }}
            >
              <FaTags /> Coupon
            </Link>
          </li>
          <li>
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("/contactus");
              }}
            >
              <FaHeadset /> Help and Support
            </Link>
          </li>
          <li>
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("/livechat");
              }}
            >
              <FaComments /> Live Chat
            </Link>
          </li>
          <li>
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("/refund-policy");
              }}
            >
              <FaUndo /> Refund Policy
            </Link>
          </li>
          <li>
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("/privacy-policy");
              }}
            >
              <MdPrivacyTip /> Privacy Policy
            </Link>
          </li>
          <li>
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("/cancellation-policy");
              }}
            >
              <FaTimesCircle />
              Cancellation Policy
            </Link>
          </li>
          <li>
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("/terms-and-conditions");
              }}
            >
              <FaFileContract />
              Terms and Conditions
            </Link>
          </li>
          <li>
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("/shipping-policy");
              }}
            >
              <FaShippingFast />
              Shipping Policy
            </Link>
          </li>

          <li>
            {user ? (
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                <FaSignOutAlt /> Sign Out
              </Link>
            ) : (
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  closeMenu();
                  setShowLogin(true);
                }}
              >
                <FaUser /> Sign In
              </Link>
            )}
          </li>
        </ul>
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
