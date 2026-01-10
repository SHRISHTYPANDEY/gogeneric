import "./Loader.css";
import LogoImg from "../assets/gogenlogo.png";
export default function Loader({ text = "Preparing your wellness..." }) {
  return (
    <div className="loader-container">
      <div className="logo-wrapper">
        <img src={LogoImg} alt="Logo" className="loader-logo" />
        <div className="pulse-ring"></div>
        <div className="orbit-ring"></div>
      </div>
      <p className="loader-text">{text}</p>
    </div>
  );
}