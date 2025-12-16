import React, { useState,useEffect } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { HiBars3 } from "react-icons/hi2";
import { FaSignOutAlt, FaShoppingCart } from "react-icons/fa";
import api from "../../api/axiosInstance";
import { FaHeart } from "react-icons/fa";
import { useWishlist } from "../../context/WishlistContext";

import {
  FaUser,
  FaShoppingBag,
  FaMapMarkedAlt,
  FaLanguage,
  FaTags,
  FaHeadset,
  FaComments,
  FaUndo,
  FaTimesCircle,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import LoginModal from "../auth/LoginModal";
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { wishlist } = useWishlist();

  const handleProfileClick = () => {
  setOpen(false);
  if (user) {
    navigate("/profile");
  } else {
    setShowLogin(true);
  }
};
const handleLogout = () => {
  logout();        
  setOpen(false);
  navigate("/");
};
  useEffect(() => {
  fetchCartCount();
   window.addEventListener("cart-updated", fetchCartCount);
  return () =>
    window.removeEventListener("cart-updated", fetchCartCount);
}, [user]);
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
    console.error(
      "Cart count error:",
      error?.response?.data || error.message
    );
  }
};
  return (
    <>
      <nav className="navbar">
        <div className="nav-container max-w-7xl mx-auto px-4 py-3">
          {/* LOGO */}
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

           {/* CART */}
  <div
    className="cart-icon"
    onClick={() => navigate("/cart")}
  >
    <FaShoppingCart />
     {cartCount > 0 && (
    <span className="cart-badge">{cartCount}</span>
  )}
  </div>

            {/* HAMBURGER */}
            <div className="hamburger" onClick={() => setOpen(true)}>
              <HiBars3 />
            </div>
          </div>
        </div>
      </nav>

      {/* OVERLAY */}
      {open && <div className="overlay" onClick={() => setOpen(false)}></div>}

      {/* SIDE MENU */}
      <div className={`side-menu ${open ? "open" : ""}`}>
        <div className="side-header">
          Menu
          <RxCross1 className="close-btn" onClick={() => setOpen(false)} />
        </div>

        <ul className="side-links">
          {/* PROFILE CLICK */}
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
      setOpen(false);
      if (user) {
        navigate("/wishlist");
      } else {
        setShowLogin(true);
      }
    }}
  >
    <FaHeart />
    My Wishlist
    {wishlist.length > 0 && (
      <span className="wishlist-badge">
        {wishlist.length}
      </span>
    )}
  </Link>
</li>

          <li>
            
            <Link to="/orders">
              <FaShoppingBag /> My Orders
            </Link>
          </li>

          <li>
            <Link to="/address">
              <FaMapMarkedAlt /> My Address
            </Link>
          </li>

          <li>
            <Link to="/language">
              <FaLanguage /> Language
            </Link>
          </li>

          <li>
            <Link to="/coupon">
              <FaTags /> Coupon
            </Link>
          </li>

          <li>
            <Link to="/help">
              <FaHeadset /> Help & Support
            </Link>
          </li>

          <li>
            <Link to="/livechat">
              <FaComments /> Live Chat
            </Link>
          </li>

          <li>
            <Link to="/refund">
              <FaUndo /> Refund Policy
            </Link>
          </li>

          <li>
            <Link to="/cancel">
              <FaTimesCircle /> Cancellation Policy
            </Link>
          </li>
          <li>
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
            >
              <FaSignOutAlt /> Sign Out
            </Link>
          </li>
        </ul>
      </div>

      {/* LOGIN MODAL */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
