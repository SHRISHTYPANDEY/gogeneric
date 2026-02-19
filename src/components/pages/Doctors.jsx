import { useNavigate } from "react-router-dom";
import { doctors } from "../../data/Doctor";
import { doctorCategories } from "../../data/Doctor";
import "./Doctors.css";
import Footer from "../Footer";

export default function Doctors() {
  const navigate = useNavigate();

  return (
    <>
      <div className="doctors-banner">
        <img
          src="/doctor_img/Doctorbanner.webp"
          alt="Doctors Banner"
          className="doctors-banner-img"
        />
      </div>

      <div className="doctors-container">
        {/* Categories Section */}
        <div className="categories-wrapper">
          <h2 className="categories-title">Doctor Categories</h2>
          <div className="categories-grid">
            {doctorCategories.map((cat) => (
              <div
                key={cat.id}
                className="category-card1"
                onClick={() =>
                  navigate(`/doctors/category/${cat.specialization}`)
                }
              >
                <h3 className="category-name1">{cat.name}</h3>
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="category-image"
                />
                <p className="category-specialty">{cat.specialization}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Doctors Section */}
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
      <Footer />
    </>
  );
}
