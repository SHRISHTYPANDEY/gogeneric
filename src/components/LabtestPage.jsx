import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosInstance";
import { cleanImageUrl } from "../utils";
import "./LabtestPage.css";
import Loader from "./Loader";

export default function LabTestsPage() {
  const { slug } = useParams();
  const [tests, setTests] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/lab-test/category/${slug}/tests`, {
        headers: { zoneId: JSON.stringify([3]), moduleId: 2 },
      });

      if (res.data?.success) {
        const category = res.data.data?.category || {};
        const testsList = res.data.data?.tests || [];

        setCategoryName(category.name || "");
        setTests(testsList);
      }
    } catch (err) {
      console.error("Failed to fetch tests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [slug]);

  return (
    <section className="lab-tests-section max-w-7xl mx-auto px-4 py-6">
      <h2 className="lab-tests-title">
        {categoryName || slug.replaceAll("-", " ")}
      </h2>

      {loading ? (
        <div className="lab-loader-wrapper">
          <Loader text="Loading tests..." />
        </div>
      ) : tests.length === 0 ? (
        <div className="lab-empty">No tests found for this category.</div>
      ) : (
        <div className="lab-tests-grid">
          {tests.map((test) => (
            <div key={test.id} className="lab-test-card">
              <div className="lab-test-image-box">
                <img
                  src={cleanImageUrl(test.icon) || "/no-image.jpg"}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/no-image.jpg";
                  }}
                  alt={test.name}
                />
              </div>

              <div className="lab-test-info-box">
                <p className="lab-test-name">{test.name}</p>
                {Number(test.price) > 0 && (
                  <p className="lab-test-price">₹{test.price}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
