import React from "react";
import "./Prescription.css";

export default function Prescription({
  prescriptionFile,
  setPrescriptionFile,
  prescriptionRequired,
  error,
  setError,
}) {
  return (
    <div className="prescription-section">
      <h3 className="prescription-title">Upload Prescription</h3>

      <div className="prescription-upload-box">
        <input
          type="file"
          accept="image/*,.pdf"
          id="prescriptionUpload"
          onChange={(e) => {
            const file = e.target.files[0];
            setPrescriptionFile(file);
            setError("");
          }}
        />

        <label htmlFor="prescriptionUpload" className="upload-btn">
          {prescriptionFile ? "Change File" : "Choose File"}
        </label>

        {prescriptionFile && (
          <p className="file-name">{prescriptionFile.name}</p>
        )}
      </div>

      {/* INFO MESSAGE */}
      {prescriptionRequired && (
        <p className="prescription-hint">
          Prescription is required for some medicines in your cart
        </p>
      )}

      {/* ERROR */}
      {error && <p className="prescription-error">{error}</p>}
    </div>
  );
}
