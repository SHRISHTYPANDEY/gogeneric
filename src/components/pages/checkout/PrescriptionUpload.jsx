import "./PrescriptionUpload.css";

export default function PrescriptionUpload({ required, file, onChange }) {
  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className="checkout-card">
      <h4>
        Prescription Upload{" "}
        {required && <span className="required-star">*</span>}
      </h4>

      {!file ? (
        <div className="upload-wrapper">
          <input
            type="file"
            id="file-upload"
            accept="image/*,.pdf"
            onChange={(e) => onChange(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="file-preview-container">
          <div className="file-info">
            <span className="file-icon">📄</span>
            <p className="file-name">{file.name}</p>
          </div>
          <button 
            type="button" 
            className="delete-btn" 
            onClick={handleRemove}
          >
            ✕
          </button>
        </div>
      )}

      {required && !file && (
        <p className="error-text">
          Prescription is required for selected items
        </p>
      )}
    </div>
  );
}