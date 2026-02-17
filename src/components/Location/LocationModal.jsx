import { useEffect, useState, useRef } from "react";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";
import GoogleMapPicker from "../maps/GoogleMapPicker";
import "./LocationModal.css";

const libraries = ["places"];

export default function LocationModal({
  onClose,
  onPickLocation,
  initialPosition,
})
{
  const handleLocationFromMap = async (lat, lng) => {
    const address = await fetchAddress(lat, lng);
    setQuery(address);
  };

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries,
  });

  const [position, setPosition] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (initialPosition?.lat && initialPosition?.lng) {
      setPosition({
        lat: initialPosition.lat,
        lng: initialPosition.lng,
      });
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          setPosition({ lat: 28.6139, lng: 77.209 });
        },
      );
    }
  }, [initialPosition]);

  if (!isLoaded || !position) {
    return <div className="loc-modal">Loading map...</div>;
  }

  /*  Reverse Geocoding */
  const fetchAddress = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}`,
      );
      const data = await res.json();
      return data.results?.[0]?.formatted_address || "";
    } catch {
      return "";
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    const address = await fetchAddress(position.lat, position.lng);
    setLoading(false);

    onPickLocation({
      lat: position.lat,
      lng: position.lng,
      address,
    });
    onClose();
  };

  const handlePlaceChanged = async () => {
    const place = autocompleteRef.current.getPlace();
    if (!place.geometry) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setPosition({ lat, lng });

    const address =
      place.formatted_address || place.name || (await fetchAddress(lat, lng));

    setQuery(address);
  };

  return (
    <div className="loc-overlay">
      <div className="loc-modal">
        <div className="loc-header">
          <p className="title">Search or pick your location</p>
          <span className="close-btn" onClick={onClose}>
            ✕
          </span>
        </div>

        <div className="search-container">
          <Autocomplete
            onLoad={(ref) => (autocompleteRef.current = ref)}
            onPlaceChanged={handlePlaceChanged}
            options={{
              componentRestrictions: { country: "in" },
              fields: ["geometry", "formatted_address", "name"],
            }}
          >
            <input
              className="search-input"
              placeholder="Search area, street, landmark..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Autocomplete>
        </div>
        <div className="map-box">
          <GoogleMapPicker
            position={position}
            setPosition={setPosition}
            onLocationFetch={handleLocationFromMap}
          />
        </div>
        <button className="pick-btn" onClick={handleConfirm} disabled={loading}>
          {loading ? "Fetching address..." : "Confirm Location"}
        </button>
      </div>
    </div>
  );
}
