import Searchbar from "./Searchbar";
import "./SearchOverlayModal.css";

export default function SearchOverlayModal({ onClose }) {
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('search-overlay-root')) {
      onClose();
    }
  };

  return (
    <div className="search-overlay-root" onClick={handleOverlayClick}>
      <div className="modal-content-container">
        <Searchbar isModal={true} onClose={onClose} />
      </div>
    </div>
  );
}