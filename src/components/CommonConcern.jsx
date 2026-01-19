import { useEffect, useRef, useState, useCallback } from "react";
import "./CommonConcern.css";
import api from "../api/axiosInstance";
import { cleanImageUrl } from "../utils";
import { useNavigate } from "react-router-dom";

export default function CommonConcern() {
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const abortRef = useRef(null);
  const concernImages = {
  ANTIBIOTIC: "/concern_img/antibiotic.jpg",
  Allergy: "/concern_img/allergy.jpg",
  "Body Pain": "/concern_img/bodypain.webp",
  CARDIO : "/concern_img/cardio.jpg",
  CNS: "/concern_img/cns.jpg",
  "Cold & Cough": "/concern_img/coldcough.jpg",
  Diabetes : "/concern_img/diabetes.jpg",
  Diarrhea: "/concern_img/diarrhea.jpg",
  Fever: "/concern_img/fever.jpg",
  "Gas / Bloating" : "/concern_img/gas.avif",
  General: "/concern_img/general.jpg",
  Hedache: "/concern_img/headache.jpg",
  "High Blood Pressure": "/concern_img/hbp.jpg",
  Infection: "/concern_img/infection.jpg",
  Itching: "/concern_img/itching.avif",
  KIDNEY: "/concern_img/kidney.avif",
  Migraine: "/concern_img/migrane.jpg",
  "Muscle Pain": "/concern_img/muscle.jpg",
  "Running Nose": "/concern_img/runningnose.jpg",
  "Skin Allergy / Rash": "/concern_img/rash.webp",
  "Stomach Ache": "/concern_img/stomachache.jpg",
  "Supplements & Immunity Boosters": "/concern_img/supplements.jpg",
  Vomiting: "/concern_img/vomiting.avif",
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
    <div className="concern-page">
      {/* HEADER ROW */}
      <div className="concern-header">
        <div>
          <h2 className="concern-heading">Shop by Health Concerns</h2>
          <p className="concern-sub">{concerns.length} concerns available</p>
        </div>

        <button
          className="see-all-btn"
          onClick={() => navigate("/health-concerns")}
        >
          See All
        </button>
      </div>

      {/* CARDS */}
      <div className="concern-type-row">
        {concerns.map((c) => (
          <div
            key={c.id}
            className="concern-type-card"
            onClick={() =>
              navigate(`/health-concern/${c.id}`, {
                state: {  concernName: c.name,
        concernId: c.id,},
              })
            }
          >
            <div className="concern-type-image">
             <img
  src={
    cleanImageUrl(c.image_full_url) ||
    concernImages[c.name] ||
    "/no-image.jpg"
  }
  alt={c.name}
/>
            </div>
            <p className="concern-type-name">{c.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
