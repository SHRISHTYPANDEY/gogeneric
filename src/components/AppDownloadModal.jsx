import React, { useEffect } from "react";
import "./AppDownloadModal.css";
import LogoImg from "../assets/gogenlogo.png";

export default function AppDownloadModal({ onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="app-modal-overlay" onClick={onClose}>
      <div className="app-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="close-btn" onClick={onClose} aria-label="Close">
  ×
</button>
        </div>
        <div className="modal-body">
        <div className="app-icon-container">
  <img
     src={LogoImg}
    alt="GoGeneric"
    className="gg-logo"
  />
</div>
          <h1 className="modal-title">
            GoGeneric App
            <span className="title-sub">for Premium Healthcare</span>
          </h1>
          <p className="modal-description">
            Experience healthcare reimagined with our exclusive mobile application designed for modern wellness.
          </p>

          <div className="offer-card">
            <div className="offer-badge">Limited Time Offer</div>
            <div className="offer-content">
              <div className="offer-icon">🎁</div>
              <div>
                <div className="offer-title">Welcome Bonus</div>
                <div className="offer-amount">₹100 Wallet Credit</div>
                <div className="offer-note">On first app purchase</div>
              </div>
            </div>
          </div>

          <div className="download-section">
  <a
    href="https://play.google.com/store/apps/details?id=com.gogeneric.user"
    target="_blank"
    rel="noopener noreferrer"
    className="playstore-badge-link"
  >
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
      alt="Get it on Google Play"
      className="playstore-badge"
    />
  </a>

  <p className="download-note">Available for Android devices</p>
</div>
          <div className="security-note">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L14 4V7C14 10.866 11.179 14.286 8 15C4.821 14.286 2 10.866 2 7V4L8 1Z" fill="#00FFC8" fillOpacity="0.2"/>
              <path d="M8 1L14 4V7C14 10.866 11.179 14.286 8 15C4.821 14.286 2 10.866 2 7V4L8 1Z" stroke="#00FFC8" strokeWidth="1"/>
              <path d="M10.5 7L7.5 10L5.5 8" stroke="#00FFC8" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Secure & Trusted • No Spam • Easy Uninstall</span>
          </div>
        </div>
      </div>
    </div>
  );
}