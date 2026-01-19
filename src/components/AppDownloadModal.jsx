import React from "react";
import "./AppDownloadModal.css";

export default function AppDownloadModal({ onClose }) {
  return (
    <div className="app-modal-overlay">
      <div className="app-modal">
        <button className="close-btn" onClick={onClose}>×</button>

        <h2>Download GoGeneric App</h2>
        <p>Order faster & get exclusive offers</p>

        <div className="app-buttons">
        <a href="https://play.google.com/store/apps/details?id=com.gogeneric.user" className="android-btn">
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
    <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: 400 }}>GET IT ON</span>
    <span style={{ fontSize: '18px', fontWeight: 700, marginTop: '-2px' }}>Google Play</span>
  </div>
</a>
        </div>
      </div>
    </div>
  );
}
