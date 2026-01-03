import { createContext, useContext, useState } from "react";
import { useEffect } from "react";
const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
   useEffect(() => {
  const saved = localStorage.getItem("user_location");
  if (saved) {
    setLocation(JSON.parse(saved));
  }
}, []);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
