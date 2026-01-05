import { useEffect, useState } from "react";
import { LABS_DATA } from "../../data/labsData";
import Footer from "../Footer";
import "./LabsPage.css";
import Loader from "../Loader";

export default function LabsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600); // thoda delay for smooth UX

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="labs-loader">
        <Loader text="Loading labs..." />
      </div>
    );
  }

  return (
    <>
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

                {lab.rating && (
                  <div className="lab-rating">
                    {"★".repeat(Math.floor(lab.rating))}
                    {lab.reviews && (
                      <span className="review-count">
                        ({lab.reviews})
                      </span>
                    )}
                  </div>
                )}

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

      <Footer />
    </>
  );
}
