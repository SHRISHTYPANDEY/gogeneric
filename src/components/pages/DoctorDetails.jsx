import { useParams, useNavigate } from "react-router-dom";
import { doctors } from "../../data/Doctor";
import "./DoctorDetails.css";
import Footer from "../Footer";

export default function DoctorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const doctor = doctors.find((d) => d.id === id);
  if (!doctor) return <div className="error-msg">Doctor not found</div>;

  return (
    <>
      <div className="details-page">
        <div className="details-container">
          <div className="profile-sidebar">
            <div className="img-container">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="profile-img"
              />
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
            {/* ABOUT */}
            {doctor.about && (
              <section className="info-section">
                <h3 className="section-title">About the Doctor</h3>
                <p className="section-text">{doctor.about}</p>
              </section>
            )}

            {/* EXPERIENCE */}
            {(doctor.experience || doctor.experienceDetail) && (
              <section className="info-section">
                <h3 className="section-title">Experience</h3>
                {doctor.experience && (
                  <p className="section-text">
                    <strong>{doctor.experience}</strong>
                  </p>
                )}
                {doctor.experienceDetail && (
                  <p className="section-text">{doctor.experienceDetail}</p>
                )}
              </section>
            )}

            {/* QUALIFICATION */}
            {(doctor.qualification || doctor.university) && (
              <section className="info-section">
                <h3 className="section-title">Qualification</h3>
                <p className="section-text">{doctor.qualification}</p>
                {doctor.university && (
                  <p className="section-text">{doctor.university}</p>
                )}
                {doctor.yearOfPassing && (
                  <p className="section-text">
                    Year of Passing: {doctor.yearOfPassing}
                  </p>
                )}
              </section>
            )}

            {/* MEDICAL REGISTRATION */}
            {doctor.registration && (
              <section className="info-section">
                <h3 className="section-title">Medical Registration</h3>
                <p className="section-text">
                  <strong>Council:</strong> {doctor.registration.council}
                </p>
                <p className="section-text">
                  <strong>Registration No:</strong> {doctor.registration.number}
                </p>
                <p className="section-text">
                  <strong>Date:</strong> {doctor.registration.date}
                </p>
                <p className="section-text">
                  <strong>Status:</strong> {doctor.registration.status}
                </p>
              </section>
            )}

            {/* SPECIALISATION / AREAS OF EXPERTISE */}
            {doctor.specialisation?.length > 0 && (
              <section className="info-section">
                <h3 className="section-title">Areas of Expertise</h3>
                <ul className="approach-list">
                  {doctor.specialisation.map((item, i) => (
                    <li key={i} className="approach-item">
                      <span className="check-icon">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* PROFESSIONAL APPROACH */}
            {doctor.approach?.length > 0 && (
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
            )}

            {/* CONSULTATION DETAILS */}
            {doctor.consultation && (
              <section className="info-section">
                <h3 className="section-title">Consultation Details</h3>
                <p className="section-text">
                  <strong>Type:</strong> {doctor.consultation.type}
                </p>
                <p className="section-text">
                  <strong>Mode:</strong> {doctor.consultation.mode.join(", ")}
                </p>
                <p className="section-text">
                  <strong>Prescription:</strong>{" "}
                  {doctor.consultation.prescription}
                </p>
              </section>
            )}

            {/* LANGUAGES */}
            {doctor.languages?.length > 0 && (
              <section className="info-section">
                <h3 className="section-title">Languages Known</h3>
                <p className="section-text">{doctor.languages.join(", ")}</p>
              </section>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
