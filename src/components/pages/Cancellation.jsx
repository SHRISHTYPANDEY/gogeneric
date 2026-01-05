import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import "./Cancellation.css";
import Footer from "../Footer";

export default function Cancellation() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCancellation();
  }, []);

  const fetchCancellation = async () => {
    try {
      const res = await api.get("/api/v1/cancelation", {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
        },
      });

      // console.log("CANCELLATION HTML 👉", res.data);
      setContent(res.data); 
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Cancellation Policy");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Loading Cancellation Policy..." />;

  return (
    <>
    <div className="cancel-page">
      <h1 className="cancel-title">Cancellation Policy</h1>

      {content ? (
        <div
          className="cancel-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <p>No content available.</p>
      )}
    </div>
    <Footer />
    </>
  );
}
