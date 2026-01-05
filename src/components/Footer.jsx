import React from "react";
import LogoImg from "../assets/gogenlogo.png";
import "./Footer.css";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="ak-footer-container">
      {/* 1. TOP CTA SECTION */}
      <div className="ak-footer-cta">
        <div className="cta-icon">✦</div>
        <h2>Spread Health Awareness Today</h2>
        <p>
          Stay updated with generic medicine knowledge and healthcare insights.
        </p>
        <button className="cta-btn">
          <a
            href="https://gogenericpharma.com/vendor/apply"
            target="_blank"
            rel="noopener noreferrer"
            className="vendor-apply-btn"
          >
            Apply as Vendor
          </a>
        </button>
      </div>
      <div className="ak-footer-card">
        <div className="ak-container">
          <div className="ak-footer-content">
          
            <div className="ak-footer-col main-brand">
              <Link to="/">
                <img
                  src={LogoImg}
                  alt="Go Generic"
                  className="ak-footer-logo-img"
                />
              </Link>
              <p className="ak-footer-text">
                Go Generic is an informational platform focused on spreading
                awareness about generic medicines and healthcare. We do not sell
                medicines.
              </p>
              <div className="ak-footer-social-icon">
                <a href="https://www.facebook.com/profile.php?id=61575015842306&mibextid=ZbWKwL">
                  <FaFacebookF />
                </a>
                <a href="https://x.com/GoGenericPharma">
                  <FaTwitter />
                </a>
                <a href="https://www.instagram.com/gogenericpharma/?igsh=Z3RmbmVjaHlubHg2#">
                  <FaInstagram />
                </a>
                <a href="https://www.youtube.com/@go_generic">
                  <FaYoutube />
                </a>
              </div>
            </div>
            {/* MIDDLE : Links */}
            <div className="ak-footer-col">
              <h3 className="ak-footer-widget-heading">Navigate</h3>
              <ul className="ak-footer-links">
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/aboutus">About Us</Link>
                </li>
                <li>
                  <Link to="/labs">Labs</Link>
                </li>
                 <li>
                  <Link to="/pharmacy">Pharmacy</Link>
                </li>
                <li>
                  <Link to="/doctors">Doctors</Link>
                </li>
              </ul>
            </div>
            {/* Support Links */}
            <div className="ak-footer-col">
              <h3 className="ak-footer-widget-heading">Support</h3>
              <ul className="ak-footer-links">
                <li>
                  <Link to="/blog">Our Blog</Link>
                </li>
    
                <li>
                  <Link to="/contactus">Contact Support</Link>
                </li>
                <li>
                  <Link to="/privacy-policy">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/terms-and-conditions">Terms & Conditions</Link>
                </li>
              </ul>
            </div>
          
            <div className="ak-footer-col">
              <h3 className="ak-footer-widget-heading">Get our App</h3>
              <p className="ak-footer-text">
                Download for a better experience.
              </p>
              <div className="app-buttons">
                <a
                  href="https://play.google.com/store/apps/details?id=com.gogeneric.user"
                  target="_blank"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                    alt="Play Store"
                  />
                </a>
              </div>
            </div>
          </div>
          <div className="ak-bottom-bar">
            <p>© {new Date().getFullYear()} Go Generic. All Rights Reserved.</p>
            <div className="bottom-links">
              <span>
                <Link to="/privacy">Privacy & Policy</Link>
              </span>
              <span>
                <Link to="/terms">Terms & Condition</Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
