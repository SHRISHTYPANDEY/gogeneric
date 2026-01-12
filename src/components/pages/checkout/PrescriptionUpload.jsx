import "./PrescriptionUpload.css";
export default function PrescriptionUpload({ required, file, onChange }) {
  return (
    <div className="checkout-card">
      <h4>
        Prescription Upload{" "}
        {required && <span style={{ color: "red" }}>*</span>}
      </h4>

      <input
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => onChange(e.target.files[0])}
      />

      {file && (
        <p className="file-name">
          {file.name}
        </p>
      )}

      {required && !file && (
        <p className="error-text">
          Prescription is required for selected items
        </p>
      )}
    </div>
  );
}
