import "./Loader.css";
import LogoImg from "../assets/gogenlogo.png";

export default function Loader({
  text = "Preparing your wellness...",
  inline = false,
}) {
  return (
    <div className={`loader-container ${inline ? "inline-loader" : ""}`}>
      <div className="logo-wrapper">
        <div className="logo-glow"></div>
        <img src={LogoImg} alt="Logo" className="loader-logo" />
      </div>

      <div className="progress-container">
        <div className="progress-bar"></div>
      </div>

      <p className="loader-text">{text}</p>
    </div>
  );
}
