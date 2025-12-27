import "./Loader.css";

export default function Loader({ text = "Preparing your wellness..." }) {
  return (
    <div className="loader-container">
      <div className="medical-spinner">
        <div className="inner-circle"></div>
        <div className="orbit-ring"></div>
      </div>
      <p className="loader-text">{text}</p>
    </div>
  );
}