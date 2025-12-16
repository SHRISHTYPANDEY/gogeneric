import { useEffect, useState, useRef } from "react";
import { MdLocationOn } from "react-icons/md";
import { IoMdArrowDropdown } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import "./TopHeader.css";
import LocationModal from "../Location/LocationModal";
import LoginModal from "../auth/LoginModal";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function TopHeader() {
  const [language, setLanguage] = useState("English");
  const [open, setOpen] = useState(false);
  const [openLocationModal, setOpenLocationModal] = useState(false);
  const [location, setLocation] = useState("");
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const langRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div className="topheader w-full">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-sm">

        {/* 📍 LOCATION */}
        <div
          className="flex items-center gap-1 cursor-pointer px-3 py-1 rounded-md hover:bg-green-50 transition"
          onClick={() => setOpenLocationModal(true)}
        >
          <MdLocationOn size={22} className="text-blue-600" />
          <span className="font-medium text-gray-800">
            {location || "Select Location"}
          </span>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-6">

           {/* 📲 DOWNLOAD APP */}
          <a
            href="https://play.google.com/store/apps/details?id=com.gogeneric.user"
            target="_blank"
            rel="noopener noreferrer"
            className="download-app-btn"
          >
            Download App
          </a>

          {/* 🌐 LANGUAGE */}
          <div className="relative" ref={langRef}>
            <div
              onClick={() => setOpen(!open)}
              className="lang-selected"
            >
              <img
                src={
                  language === "English"
                    ? "https://flagsapi.com/US/flat/24.png"
                    : "https://flagsapi.com/IN/flat/24.png"
                }
                alt="flag"
                className="flag-icon"
              />
              <span>{language}</span>
              <IoMdArrowDropdown className="arrow" />
            </div>

            {open && (
              <div className="lang-dropdown">
                <div
                  className="lang-option"
                  onClick={() => {
                    setLanguage("English");
                    setOpen(false);
                  }}
                >
                  <img src="https://flagsapi.com/US/flat/24.png" className="flag-icon" />
                  English
                </div>

                <div
                  className="lang-option"
                  onClick={() => {
                    setLanguage("हिन्दी");
                    setOpen(false);
                  }}
                >
                  <img src="https://flagsapi.com/IN/flat/24.png" className="flag-icon" />
                  हिन्दी
                </div>
              </div>
            )}
          </div>

         

          {/* 👤 PROFILE */}
          <div className="relative" ref={profileRef}>
            <div
              className="flex items-center gap-1 cursor-pointer px-3 py-1 rounded-md hover:bg-gray-100 transition"
              onClick={(e) => {
                e.stopPropagation();
                if (user) {
                  navigate("/profile");
                } else {
                  setProfileOpen(!profileOpen);
                }
              }}
            >
              <CgProfile size={22} className="text-gray-700" />
              <span className="font-medium">
                {user ? `Hello, ${user.name}` : "Profile"}
              </span>
            </div>

            {profileOpen && (
              <div className="profile-dropdown">
                {user ? (
                  <>
                    <p className="welcome-text">Hello, {user.name}</p>
                    <button
                      className="login-btn"
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                        navigate("/");
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <p className="welcome-text">Welcome</p>
                    <p className="sub-text">
                      To access your profile and orders
                    </p>
                    <button
                      className="login-btn"
                      onClick={() => {
                        setProfileOpen(false);
                        setOpenLoginModal(true);
                      }}
                    >
                      Login / Signup
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MODALS */}
      {openLocationModal && (
        <LocationModal
          onClose={() => setOpenLocationModal(false)}
          onPickLocation={(addr) => {
            setLocation(addr);
            setOpenLocationModal(false);
          }}
        />
      )}

      {openLoginModal && (
        <LoginModal onClose={() => setOpenLoginModal(false)} />
      )}
    </div>
  );
}
