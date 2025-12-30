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
} from "react-icons/fa";
import { MdPrivacyTip } from "react-icons/md";

import api from "../../api/axiosInstance";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import LoginModal from "../auth/LoginModal";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

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
      console.error("Notification error", err);
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
      console.error("Cart count error:", error);
    }
  };

  useEffect(() => {
    fetchCartCount();
    fetchNotifications();
    window.addEventListener("cart-updated", fetchCartCount);
    return () => window.removeEventListener("cart-updated", fetchCartCount);
  }, [user]);

  /* ---------------- ACTIONS ---------------- */
  const handleProfileClick = () => {
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
    navigate("/");
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-container max-w-7xl mx-auto px-4 py-3">
          <div className="nav-logo">
            <img src="/gogenlogo.png" alt="GoGeneric Logo" />
          </div>

          <div className="flex items-center gap-6">
            {/* DESKTOP LINKS */}
            <ul className="nav-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
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

            {/* NOTIFICATION */}
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

            {/* CART */}
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

            {/* HAMBURGER */}
            <div className="hamburger" onClick={() => setOpen(true)}>
              <HiBars3 />
            </div>
          </div>
        </div>
      </nav>

      {/* OVERLAY */}
      {open && <div className="overlay" onClick={closeMenu} />}

      {/* SIDE MENU */}
      <div className={`side-menu ${open ? "open" : ""}`}>
        <div className="side-header">
          Menu
          <RxCross1 className="close-btn" onClick={closeMenu} />
        </div>

        <ul className="side-links">
          <li>
            <Link
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigate("/profile");
                  }}
                >
                  <FaUser />Profile
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
                handleNavigate("/address");
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
                handleNavigate("/help");
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
                handleNavigate("/refund");
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
                handleNavigate("/privacy");
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
                handleNavigate("/cancel");
              }}
            >
              <FaTimesCircle />Cancellation Policy
            </Link>
          </li>
          <li>
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("/terms");
              }}
            >
              <FaFileContract />Terms and Conditions
            </Link>
          </li>
          <li>
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate("/shipping");
              }}
            >
              <FaShippingFast />Shipping Policy
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

      {/* LOGIN MODAL */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
