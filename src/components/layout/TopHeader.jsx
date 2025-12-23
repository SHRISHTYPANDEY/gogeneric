import { useEffect, useState, useRef } from "react";
import { MdLocationOn } from "react-icons/md";
import { IoMdArrowDropdown } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import "./TopHeader.css";
import LocationModal from "../Location/LocationModal";
import LoginModal from "../auth/LoginModal";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

export default function TopHeader() {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [openLocationModal, setOpenLocationModal] = useState(false);
  const [location, setLocation] = useState("");
  const [openLoginModal, setOpenLoginModal] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const langRef = useRef(null);

  const languages = [
    { name: "English", code: "en", flag: "https://flagcdn.com/w20/us.png" },
    { name: "हिन्दी", code: "hi", flag: "https://flagcdn.com/w20/in.png" }
  ];

  // ✅ Default language from localStorage or English
  const [language, setLanguage] = useState(() => {
    const savedLang = localStorage.getItem("lang") || "en";
    return languages.find(l => l.code === savedLang) || languages[0];
  });

  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);
  useEffect(() => {
  const savedLocation = localStorage.getItem("userLocation");
  if (savedLocation) {
    setLocation(savedLocation);
  }
}, []);


  const handleProfileClick = () => {
    if (user) {
      navigate("/profile");
    } else {
      setOpenLoginModal(true);
    }
  };

  // ✅ Change language globally
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang.code);
    localStorage.setItem("lang", lang.code);
    setOpen(false);
  };

  return (
    <>
      <nav className="topheader-wrapper w-full">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

          {/* 📍 LOCATION */}
          <div
            className="location-trigger group"
            onClick={() => setOpenLocationModal(true)}
          >
            <MdLocationOn size={20} className="text-orange-500" />
            <div className="ml-2">
              <span className="text-xs text-gray-400">
                {t("location")}
              </span>
              <div className="text-sm font-semibold">
                {location || t("selectLocation")}
              </div>
            </div>
            <IoMdArrowDropdown />
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-8">

            {/* DOWNLOAD */}
            <a
              href="https://play.google.com/store/apps"
              target="_blank"
              rel="noreferrer"
              className="download-pill"
            >
              {t("downloadApp")}
            </a>

            {/* LANGUAGE */}
            <div className="relative" ref={langRef}>
              <div
                className="lang-selector-premium"
                onClick={() => setOpen(!open)}
              >
                <img
                  src={language.flag}
                  alt="flag"
                  className="w-5 h-3.5 object-cover rounded-sm"
                />
                <span className="text-sm font-medium">
                  {language.name}
                </span>
                <IoMdArrowDropdown
                  className={`transition-transform ${open ? "rotate-180" : ""}`}
                />
              </div>

              {open && (
                <div className="dropdown-animate shadow-premium absolute right-0 mt-3 bg-white border border-gray-100 rounded-xl overflow-hidden min-w-[140px] z-50">
                  {languages.map((lang) => (
                    <div
                      key={lang.code}
                      className="lang-item"
                      onClick={() => handleLanguageChange(lang)}
                    >
                      <img
                        src={lang.flag}
                        alt={lang.name}
                        className="w-5 h-3.5 object-cover rounded-sm"
                      />
                      <span>{lang.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 👤 PROFILE */}
            <div
              className="profile-trigger-premium cursor-pointer"
              onClick={handleProfileClick}
            >
              <CgProfile size={20} />
              <span className="font-semibold">
                {user ? user.name?.split(" ")[0] : t("login")}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* LOGIN MODAL */}
      {openLoginModal && (
        <LoginModal onClose={() => setOpenLoginModal(false)} />
      )}

      {/* LOCATION MODAL */}
     {openLocationModal && (
  <LocationModal
    onClose={() => setOpenLocationModal(false)}
    onPickLocation={(loc) => {

      // ✅ UI ke liye (header me dikhane ke liye)
      setLocation(loc.address);
      localStorage.setItem("userLocation", loc.address);

      // ✅ MOST IMPORTANT — distance calculation ke liye
      localStorage.setItem(
        "user_location",
        JSON.stringify({
          lat: loc.lat,
          lng: loc.lng,
        })
      );
    }}
/>

      )}
    </>
  );
}
