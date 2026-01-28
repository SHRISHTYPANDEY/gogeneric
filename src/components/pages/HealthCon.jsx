import { useEffect, useRef, useState, useCallback } from "react";
import "./HealthCon.css";
import api from "../../api/axiosInstance"
import { cleanImageUrl }from "../../utils"
import { useNavigate } from "react-router-dom";

export default function HealthCon() {
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const abortRef = useRef(null);
  const concernImages = {
  ANTIBIOTIC: "/concern_img/ANTIBIOTIC Care.png",
  Allergy: "/concern_img/Allergy.png",
  "Body Pain": "/concern_img/Body Pain Care.png",
  CARDIO : "/concern_img/CARDIO.png",
  CNS: "/concern_img/CNS.png",
  "Cold & Cough": "/concern_img/Cold & Cough.png",
  Diabetes : "/concern_img/Diabetes Care.png",
  Diarrhea: "/concern_img/Diarrhea.png",
  Fever: "/concern_img/Fever Care.png",
  "Gas / Bloating" : "/concern_img/Gas  Bloating.png",
  General: "/concern_img/General.png",
  Hedache: "/concern_img/Headache Care.png",
  "High Blood Pressure": "/concern_img/High Blood Pressure.png",
  Infection: "/concern_img/Infection.png",
  Itching: "/concern_img/Itching.png",
  KIDNEY: "/concern_img/KIDNEY Care.png",
  Migraine: "/concern_img/Migraine.png",
  "Muscle Pain": "/concern_img/Muscle Pain.png",
  "Running Nose": "/concern_img/Running Nose.png",
  "Skin Allergy / Rash": "/concern_img/Skin Allergy  Rash.png",
  "Stomach Ache": "/concern_img/Stomach Ache.png",
  "Supplements & Immunity Boosters": "/concern_img/Supplements & Immunity Boosters.png",
  Vomiting: "/concern_img/Vomiting.png",
};

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const fetchConcerns = useCallback(async () => {
    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setLoading(true);

      const res = await api.get("/api/v1/common-condition", {
        headers: {
          zoneId: JSON.stringify([3]),
          moduleId: 2,
        },
        signal: abortRef.current.signal,
      });

      let list = [];
      if (Array.isArray(res.data)) list = res.data;
      else if (Array.isArray(res.data.items)) list = res.data.items;
      else if (Array.isArray(res.data.data)) list = res.data.data;
      else if (Array.isArray(res.data.common_conditions))
        list = res.data.common_conditions;

      setConcerns(list);
    } catch (err) {
      if (err.name !== "CanceledError") {
        console.error("Concern fetch error:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConcerns();
  }, [fetchConcerns]);

  if (loading) return null;

  return (
    <div className="concern-page1 max-w-7xl mx-auto px-4">
      {/* HEADER ROW */}
      <div className="concern-header1">
        <div>
          <h2 className="concern-heading1">Shop by Health Concerns</h2>
        </div>
      </div>

      {/* CARDS */}
      <div className="concern-type-row1">
        {concerns.map((c) => (
          <div
            key={c.id}
            className="concern-type-card1"
            onClick={() =>
              navigate(`/health-concern/${c.id}`, {
                state: {  concernName: c.name,
        concernId: c.id,},
              })
            }
          >
            <div className="concern-type-image1">
             <img
  src={
    cleanImageUrl(c.image_full_url) ||
    concernImages[c.name] ||
    "/no-image.jpg"
  }
  alt={c.name}
/>
            </div>
            <p className="concern-type-name1">{c.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
