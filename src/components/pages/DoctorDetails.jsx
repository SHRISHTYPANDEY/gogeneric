import { useParams, useNavigate } from "react-router-dom";
import { doctors } from "../../data/Doctor";
import "./DoctorDetails.css";

export default function DoctorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const doctor = doctors.find((d) => d.id === id);
  if (!doctor) return <div className="error-msg">Doctor not found</div>;

  return (
    <div className="details-page">
      <div className="details-container">
 
        <div className="profile-sidebar">
          <div className="img-container">
            <img src={doctor.image} alt={doctor.name} className="profile-img" />
          </div>
          <h2 className="profile-name">{doctor.name}</h2>
          <span className="profile-badge">{doctor.specialization}</span>
          
        
          <button
            onClick={() => navigate(`/doctors/${id}/plans`)}
            className="cta-button"
          >
            View Plans & Pricing
          </button>
        </div>

        <div className="content-area">
          <section className="info-section">
            <h3 className="section-title">About the Doctor</h3>
            <p className="section-text">{doctor.about}</p>
          </section>

          <section className="info-section">
            <h3 className="section-title">Experience</h3>
            <p className="section-text">
              <strong>{doctor.experience}</strong>
            </p>
            <p className="section-text">{doctor.experienceDetail}</p>
          </section>

          <section className="info-section">
            <h3 className="section-title">Professional Approach</h3>
            <ul className="approach-list">
              {doctor.approach.map((item, i) => (
                <li key={i} className="approach-item">
                  <span className="check-icon">✓</span> {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}