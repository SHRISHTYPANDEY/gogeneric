import { useNavigate } from "react-router-dom";
import "./Doctors.css";
import Footer from "../Footer";
import { useState, useEffect } from "react";
import { getDoctors, getApprovedDoctors } from "../../api/doctorApi";
import { SkeletonGrid } from "../skeleton/SkeletonGrid";
import { cleanImageUrl } from "../../utils";
import axios from "axios";

const BASE_URL = "https://www.gogenericpharma.com/api/v1";

export default function Doctors() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [approvedDoctors, setApprovedDoctors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const allDoctors = await getDoctors();
        setDoctors(allDoctors || []);

        const approvedList = await getApprovedDoctors();
        setApprovedDoctors(approvedList || []);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
        setDoctors([]);
        setApprovedDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/doctor/all-categories`);
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setCategories([]);
      } finally {
        setCatLoading(false);
      }
    };

    fetchDoctors();
    fetchCategories();
  }, []);

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

        <div className="categories-wrapper">
          <h2 className="categories-title">Doctor Categories</h2>

          {catLoading ? (
            <SkeletonGrid count={6} />
          ) : categories.length === 0 ? (
            <div>No categories available.</div>
          ) : (
            <div className="categories-grid">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="category-card1"
                  onClick={() => navigate(`/doctors/category/${cat.slug}`)}
                >
                  <h3 className="category-name1">{cat.name}</h3>
                  {cat.image && (
                    <img src={cat.image} alt={cat.name} className="category-image" />
                  )}
                  <p className="category-specialty">{cat.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="doctors-wrapper">
          <h1 className="doctors-title">All Doctors</h1>
          {loading ? (
            <SkeletonGrid count={8} />
          ) : doctors?.length === 0 ? (
            <div>No doctors available</div>
          ) : (
            <div className="doctors-grid">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => navigate(`/doctors/${doc.id}`)}
                  className="doctor-card"
                >
                  <div className="doctor-image-wrapper">
                    <img src={doc.image} alt={doc.name} className="doctor-image" />
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
          )}
        </div>

        <div className="doctors-wrapper">
          <h1 className="doctors-title"></h1>
          {loading ? (
            <SkeletonGrid count={8} />
          ) : approvedDoctors?.length === 0 ? (
            <div></div>
          ) : (
            <div className="doctors-grid">
              {approvedDoctors.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => navigate(`/doctors/${doc.id}`)}
                  className="doctor-card"
                >
                  <div className="doctor-image-wrapper">
                    <img
                      src={cleanImageUrl(doc.photo)}
                      alt={doc.name}
                      className="doctor-image"
                    />
                  </div>
                  <div className="doctor-info">
                    <h3 className="doctor-name">{doc.name}</h3>
                    <p className="doctor-specialty">{doc.specialization}</p>
                    <p className="doctor-exp">
                      {doc.years_of_practice} Years Experience
                    </p>
                    <div className="view-profile-btn">View Profile</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <Footer />
    </>
  );
}
