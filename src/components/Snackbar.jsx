import "./Snackbar.css";

export default function Snackbar({ message, actionText, onAction, onClose }) {
  return (
    <div className="snackbar">
      <span className="snackbar-text">{message}</span>

      {actionText && (
        <button
          className="snackbar-action"
          onClick={() => {
            onAction?.();
            onClose();
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
