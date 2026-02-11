import { useParams, useNavigate } from "react-router-dom";
import { doctors } from "../../data/Doctor";
import "./Doctors.css";
import Footer from "../Footer";

export default function CategoryDoctors() {
  const { specialization } = useParams();
  const navigate = useNavigate();

const filteredDoctors = doctors.filter(
  (doc) =>
    doc.category?.toLowerCase() === specialization.toLowerCase()
);

  return (
    <>
      <div className="doctors-container">

        <h2 className="doctors-title">
          {specialization} Specialists
        </h2>

        <div className="doctors-grid" style={{ marginLeft: "9%" }}>
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doc) => (
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
                  <p className="doctor-specialty">
                    {doc.specialization}
                  </p>
                  <p className="doctor-exp">
                    {doc.experience} Experience
                  </p>
                  <div className="view-profile-btn">
                    View Profile
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No doctors available in this category.
                come back later.
            </p>
            
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
