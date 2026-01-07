import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import "./Shipping.css"
import BackToTop from "../BackToTop";
export default function Shipping() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShippingPolicy();
  }, []);

  const fetchShippingPolicy = async () => {
    try {
      const res = await api.get("/api/v1/shipping-policy", {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
        },
      });

      // console.log("SHIPPING POLICY 👉", res.data);
      setContent(res.data || "");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Shipping Policy");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Loading Shipping Policy..." />;

  return (
    <>
    <div className="policy-page">
      <h1 className="policy-title">Shipping Policy</h1>

      {content ? (
        <div
          className="policy-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <p>No content available</p>
      )}
    </div>
    <BackToTop />
    </>
  );
}
