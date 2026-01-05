import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import "./RefundPolicy.css";
import Footer from "../Footer";

export default function RefundPolicy() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRefundPolicy();
  }, []);

  const fetchRefundPolicy = async () => {
    try {
      const res = await api.get("/api/v1/refund-policy", {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
        },
      });
      setContent(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Refund Policy");
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

    const commonRefundTerms = [
      "Eligibility",
      "Process",
      "Timeline",
      "Exceptions",
      "Cancellation",
      "Contact Us"
    ];

    commonRefundTerms.forEach(term => {
      const regex = new RegExp(`<strong>${term}<\/strong>`, 'g');
      formatted = formatted.replace(regex, `<strong class="policy-sub-heading">${term}</strong>`);
    });

    return formatted;
  };

  if (loading) return <Loader text="Loading Refund Policy..." />;

  return (
    <>
      <div className="refund-page">
        <h1 className="refund-title">Refund Policy</h1>
        {content ? (
          <div
            className="refund-content"
            dangerouslySetInnerHTML={{ __html: formatPolicyHTML(content) }}
          />
        ) : (
          <p className="no-data-text">No refund policy available.</p>
        )}
      </div>
      <Footer />
    </>
  );
}