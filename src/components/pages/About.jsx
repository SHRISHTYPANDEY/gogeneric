import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import "./About.css";
import Footer from "../Footer";
import BackToTop from "../BackToTop";
export default function AboutUs() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutUs();
  }, []);

  const fetchAboutUs = async () => {
    try {
      const res = await api.get("/api/v1/about-us", {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
        },
      });

      // console.log("ABOUT US HTML 👉", res.data); 
      setContent(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load About Us");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Loading About Us..." />;

  return (
    <>
    <div className="about-page">
      <h1 className="about-title">About Us</h1>

      {content ? (
        <div
          className="about-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <p>No content available.</p>
      )}
   
    </div>
    <BackToTop />
    <Footer />
    </>
  );
}
