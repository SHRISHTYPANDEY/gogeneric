import { createContext, useContext, useState, useEffect } from "react";

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem("user_location");
    return saved ? JSON.parse(saved) : null;
  });

  // 🔒 control flag
  const isLocationAllowed =
    localStorage.getItem("location_allowed") === "true";

  const enableLocation = () => {
    localStorage.setItem("location_allowed", "true");
  };

  const resetLocation = () => {
    setLocation(null);
    localStorage.removeItem("user_location");
    localStorage.setItem("location_allowed", "false");
  };

  // 🌍 AUTO FETCH (ONLY WHEN LOGGED IN + ALLOWED)
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;
    // if (!isLocationAllowed) return;
    if (location) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}`
          );
          const data = await res.json();

          const address =
            data.results?.[0]?.formatted_address || "Current Location";

          const payload = { lat, lng, address };

          setLocation(payload);
          localStorage.setItem("user_location", JSON.stringify(payload));
          localStorage.setItem("location_allowed", "true"); 
        } catch (e) {
          console.error(e);
        }
      },
      () => {}
    );
  }, [location, isLocationAllowed]);

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        resetLocation,
        enableLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
