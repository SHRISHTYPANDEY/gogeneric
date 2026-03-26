import { useNavigate, useParams } from "react-router-dom";
import "./DoctorsByCategory.css";
import Footer from "../Footer";
import { useState, useEffect } from "react";
import { SkeletonGrid } from "../skeleton/SkeletonGrid";
import { cleanImageUrl } from "../../utils";
import axios from "axios";

const BASE_URL = "https://www.gogenericpharma.com/api/v1";

export default function DoctorsByCategory() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [doctors, setDoctors] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchDoctorsByCategory = async () => {
            setLoading(true);
            setNotFound(false);

            try {
                const res = await axios.get(`${BASE_URL}/doctor/category/${slug}`);

                if (res.data.status) {
                    setDoctors(res.data.doctors || []);
                    setCategoryName(res.data.category || "");
                } else {
                    setNotFound(true);
                }
            } catch (err) {
                console.error("Failed to fetch doctors by category:", err);
                if (err.response?.status === 404) {
                    setNotFound(true);
                }
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchDoctorsByCategory();
    }, [slug]);

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
                    <button
                        onClick={() => navigate("/doctors")}
                        className="back-btn"
                        style={{
                            background: "none",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            padding: "6px 14px",
                            fontSize: "13px",
                            cursor: "pointer",
                            marginBottom: "16px",
                            color: "#64748b",
                        }}
                    >
                        ← All Categories
                    </button>

                    <h2 className="categories-title">
                        {categoryName ? `${categoryName} Doctors` : "Doctors"}
                    </h2>
                </div>

                <div className="doctors-wrapper">
                    {loading ? (
                        <SkeletonGrid count={8} />
                    ) : notFound ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                            <p>Category not found.</p>
                            <button
                                onClick={() => navigate("/doctors")}
                                style={{ marginTop: "12px", color: "#6366f1", cursor: "pointer", background: "none", border: "none", fontSize: "14px" }}
                            >
                                ← Go back to all doctors
                            </button>
                        </div>
                    ) : doctors.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                            <p>No doctors found in this category yet.</p>
                            <button
                                onClick={() => navigate("/doctors")}
                                style={{ marginTop: "12px", color: "#6366f1", cursor: "pointer", background: "none", border: "none", fontSize: "14px" }}
                            >
                                ← Go back to all doctors
                            </button>
                        </div>
                    ) : (
                        <div className="doctors-grid">
                            {doctors.map((doc) => (
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
