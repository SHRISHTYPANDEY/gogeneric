import { useNavigate, useLocation } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/") return null;

  return (
    <div className="back-button-container">
      <button onClick={() => navigate(-1)} className="back-btn-styled">
        <svg 
          width="20" height="20" 
          viewBox="0 0 24 24" fill="none" 
          stroke="currentColor" strokeWidth="2" 
          strokeLinecap="round" strokeLinejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Back</span>
      </button>
    </div>
  );
};
export default BackButton;