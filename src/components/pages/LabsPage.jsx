import {LABS_DATA} from "../../data/labsData"
import "./LabsPage.css";

export default function LabsPage() {
  return (
    <div className="labs-wrapper">
      <h2 className="labs-heading">Available Labs</h2>

      <div className="labs-list">
        {LABS_DATA.map((lab) => (
          <div className="lab-card" key={lab.id}>
            {/* BANNER */}
            <img
              src={lab.banner}
              alt={lab.name}
              className="lab-banner"
            />

            {/* CONTENT */}
            <div className="lab-content">
              <h3>{lab.name}</h3>

              <div className="lab-rating">
                {"★".repeat(Math.floor(lab.rating))}
                <span className="review-count">
                  ({lab.reviews})
                </span>
              </div>

              <p className="lab-desc">{lab.description}</p>

              <div className="lab-footer">
                <button className="visit-btn">
                  Visit Website
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
