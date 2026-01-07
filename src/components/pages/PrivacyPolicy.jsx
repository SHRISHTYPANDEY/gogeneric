import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import "./PrivacyPolicy.css";
import Footer from "../Footer";
import BackToTop from "../BackToTop";
export default function PrivacyPolicy() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrivacyPolicy();
  }, []);

  const fetchPrivacyPolicy = async () => {
    try {
      const res = await api.get("/api/v1/privacy-policy", {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
        },
      });
      setContent(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Privacy Policy");
    } finally {
      setLoading(false);
    }
  };

  const formatPolicyHTML = (html) => {
    if (!html) return "";
    let formatted = html;

    formatted = formatted.replace(
      /<strong>(\d+\..*?)<\/strong>/g,
      '<strong class="policy-main-heading">$1</strong>'
    );

    const subHeadings = [
      "Cookies", 
      "Data", 
      "Data Protection Laws", 
      "Partners", 
      "Service Providers", 
      "Singhania Med Pvt Ltd", 
      "User or you"
    ];

    subHeadings.forEach(heading => {
      const regex = new RegExp(`<strong>${heading}<\/strong>`, 'g');
      formatted = formatted.replace(regex, `<strong class="policy-sub-heading">${heading}</strong>`);
    });

    return formatted;
  };

  if (loading) return <Loader text="Loading Privacy Policy..." />;

  return (
    <>
      <div className="privacy-page">
        <h1 className="privacy-title">Privacy Policy</h1>
        {content ? (
          <div
            className="privacy-content"
            dangerouslySetInnerHTML={{ __html: formatPolicyHTML(content) }}
          />
        ) : (
          <p className="no-data-text">No privacy policy available.</p>
        )}
      </div>
      <BackToTop />
      <Footer />
    </>
  );
}