import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { HiBars3 } from "react-icons/hi2";
import { cleanImageUrl } from "../../utils"
import {
  FaSignOutAlt,
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
  FaCoins,
  FaStore, FaMotorcycle 
} from "react-icons/fa";
import { MdPrivacyTip } from "react-icons/md";
import api from "../../api/axiosInstance";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import LoginModal from "../auth/LoginModal";
import { useLocation } from "../../context/LocationContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const { resetLocation } = useLocation();
  const [categories, setCategories] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [labs, setLabs] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
useEffect(() => {
  api.get("/api/v1/categories")
    .then((res) => setCategories(res.data || []))
    .catch((err) => console.error("Navbar categories error:", err));
  api.get("/api/v1/stores/get-stores/all", {
    headers: { zoneId: JSON.stringify([3]), moduleId: "2" }
  })
    .then((res) => {
      const storeList = Array.isArray(res?.data?.stores) ? res.data.stores : [];
      setPharmacies(storeList);
    })
    .catch((err) => console.error("Navbar stores error:", err));

      api.get("/api/v1/stores/details/74")
    .then((res) => {
      const labData = res?.data?.stores || res?.data || [];
      setLabs(Array.isArray(labData) ? labData : [labData]);
    })
    .catch((err) => console.error("Navbar labs error:", err));

}, []);
  const closeMenu = () => setOpen(false);

  const handleNavigate = (path) => {
    closeMenu();
    navigate(path);
  };

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
      <div className="nav-container">
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li className="category-dropdown-container">
              <Link to="/category" className="category-trigger">
                Category
              </Link>
              
              <div className="mega-dropdown">
                <div className="dropdown-inner-grid">
                  {categories.slice(0, 15).map((cat) => (
                    <div 
                      key={cat.id} 
                      className="dropdown-card"
                      onClick={() => {
                        navigate(`/category/${cat.id}`, { state: { categoryName: cat.name } });
                        closeMenu();
                      }}
                    >
                      <div className="dropdown-circle-img">
                        <img
                          src={cleanImageUrl(cat.image_full_url || `/storage/category/${cat.image}`)}
                          alt={cat.name}
                        />
                      </div>
                      <span className="dropdown-cat-name">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </li>
          <li
  className="category-dropdown-container"
  onMouseEnter={() => setOpenDropdown("pharmacy")}
  onMouseLeave={() => setOpenDropdown(null)}
>
  <Link to="/pharmacy" className="category-trigger">
    Pharmacy
  </Link>

  {openDropdown === "pharmacy" && (
    <div className="mega-dropdown">
      <div className="dropdown-inner-grid">
        {pharmacies.map((store) => (
          <div
            key={store.id}
            className="dropdown-card"
            onClick={() => {
              navigate(`/view-stores/${store.id}`);
              setOpenDropdown(null);
            }}
          >
            <div className="dropdown-circle-img">
              <img
                src={cleanImageUrl(store.logo_full_url)}
                alt={store.name}
              />
            </div>
            <span className="dropdown-cat-name">
              {store.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )}
</li>

          <li className="category-dropdown-container">
  <Link to="/labs" className="category-trigger">Labs</Link>

  <div className="mega-dropdown">
    <div className="dropdown-inner-grid">
      {labs.map((lab) => (
        <div
          key={lab.id}
          className="dropdown-card"
          onClick={() => {
            navigate(`/view-stores/${lab.id}`);
            closeMenu();
          }}
        >
          <div className="dropdown-circle-img">
            <img
              src={cleanImageUrl(lab.logo_full_url || lab.image_full_url)}
              alt={lab.name}
            />
          </div>
          <span className="dropdown-cat-name">{lab.name}</span>
        </div>
      ))}
    </div>
  </div>
</li>

          <li><Link to="/doctors">Doctors</Link></li>
          <li><Link to="/blog">Blog</Link></li>
          <li><Link to="/aboutus">About</Link></li>
          <li><Link to="/contactus">Contact Us</Link></li>
          <li><Link to="/who-we-are">Who We Are</Link></li>
        </ul>

        <div className="hamburger" onClick={() => setOpen(true)}>
          <HiBars3 />
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

          {user && (
  <li>
    <Link
      to="#"
      onClick={(e) => {
        e.preventDefault();
        handleNavigate("/loyalty-points");
      }}
    >
      <FaCoins /> Loyalty Points
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
      window.open("https://gogenericpharma.com/vendor/apply", "_blank");
    }}
  >
    <FaStore /> Apply as Vendor
  </Link>
</li>

<li>
  <Link
    to="#"
    onClick={(e) => {
      e.preventDefault();
     window.open("https://gogenericpharma.com/deliveryman/apply", "_blank");
    }}
  >
    <FaMotorcycle /> Apply as Deliveryman
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
