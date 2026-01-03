  import { useNavigate } from "react-router-dom";
  import { doctors } from "../../data/Doctor";
  import "./Doctors.css"; 

  export default function Doctors() {
    const navigate = useNavigate();

    return (
      <div className="doctors-container">
        <div className="doctors-wrapper">
          <h1 className="doctors-title">Our Certified Doctors</h1>

          <div className="doctors-grid">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                onClick={() => navigate(`/doctors/${doc.id}`)}
                className="doctor-card"
              >
                <div className="doctor-image-wrapper">
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className="doctor-image"
                  />
                </div>
                <div className="doctor-info">
                  <h3 className="doctor-name">{doc.name}</h3>
                  <p className="doctor-specialty">{doc.specialization}</p>
                  <p className="doctor-exp">{doc.experience} Experience</p>
                  <div className="view-profile-btn">View Profile</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }