import { X } from "lucide-react";
import "./RepublicDayPopup.css";
import flagImage from "../assets/flag.jpg";

export default function RepublicDayPopup({ onLater }) {
  return (
    <div className="rd-overlay">
      <div className="rd-confetti-wrapper">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="rd-confetti-piece"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              backgroundColor: i % 3 === 0 ? '#FF9933' : i % 3 === 1 ? '#138808' : '#000080',
              width: `${Math.random() * 8 + 6}px`,
              height: `${Math.random() * 15 + 5}px`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>

      <div className="rd-popup">
        <button className="rd-close" onClick={onLater}>
          <X size={20} />
        </button>

        <div className="rd-flag-container">
          <div className="rd-flag-image">
            <img src={flagImage} alt="Indian Flag" className="rd-flag-img" />
            <div className="rd-flag-overlay"></div>
          </div>
        </div>

        <div className="rd-content">
          <h2>
            <span className="rd-title-text">
              <span className="rd-title-saffron">Happy </span>
              <span className="rd-title-navy">Republic </span>
              <span className="rd-title-green">Day</span>
            </span>
          </h2>

          <div className="rd-divider">
            <div className="rd-divider-line"></div>
            <div className="rd-divider-dots">
              <span className="dot orange" />
              <span className="dot navy" />
              <span className="dot green-dot" />
            </div>
            <div className="rd-divider-line"></div>
          </div>

          <p className="rd-message">
            Celebrating the spirit of freedom, unity, and the Constitution of India.
            <span className="rd-quote">"Satyameva Jayate"</span>
          </p>

          <p className="rd-medical-quote">
            “Because your health deserves honesty, care, and commitment.”
          </p>

          <div className="rd-tri-color-border">
            <div className="rd-tri-color saffron-bg"></div>
            <div className="rd-tri-color white-bg"></div>
            <div className="rd-tri-color green-bg"></div>
          </div>
        </div>

        <button className="rd-later-btn" onClick={onLater}>
          <span className="rd-btn-text">Jai Hind</span>
        </button>
      </div>
    </div>
  );
}