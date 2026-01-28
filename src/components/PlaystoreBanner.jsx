import "./PlaystoreBanner.css";

export default function PlaystoreBanner() {
  const handleClick = () => {
    window.open(
      "https://play.google.com/store/apps/details?id=com.gogeneric.user",
      "_blank"
    );
  };

  return (
    <div className="playstore-banner-wrapper">
      <div className="playstore-banner" onClick={handleClick}>
        <img
          src="/banner/Banner01webp.webp"
          alt="Download App from Play Store"
          loading="lazy"
        />
      </div>
    </div>
  );
}
