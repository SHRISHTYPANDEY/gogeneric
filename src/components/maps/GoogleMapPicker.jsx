import { GoogleMap, Marker } from "@react-google-maps/api";
import { useRef } from "react";

export default function GoogleMapPicker({ position, setPosition, onLocationFetch }) {
  const gpsControlAdded = useRef(false);
  const mapRef = useRef(null);

  const onLoad = (map) => {
    mapRef.current = map; 

    if (gpsControlAdded.current) return;
    gpsControlAdded.current = true;

    const gpsButton = document.createElement("div");
    gpsButton.title = "Use current location";
    gpsButton.style.background = "#fff";
    gpsButton.style.width = "40px";
    gpsButton.style.height = "40px";
    gpsButton.style.borderRadius = "2px";
    gpsButton.style.marginRight = "10px";
    gpsButton.style.marginBottom = "98px";
    gpsButton.style.display = "flex";
    gpsButton.style.alignItems = "center";
    gpsButton.style.justifyContent = "center";
    gpsButton.style.cursor = "pointer";
    gpsButton.style.boxShadow = "0 1px 4px rgba(0,0,0,0.3)";
    gpsButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#1f2937"><path d="M12 8a4 4 0 100 8 4 4 0 000-8zm9 3h-2.07A7.004 7.004 0 0013 5.07V3h-2v2.07A7.004 7.004 0 005.07 11H3v2h2.07A7.004 7.004 0 0011 18.93V21h2v-2.07A7.004 7.004 0 0018.93 13H21v-2zm-9 6a5 5 0 110-10 5 5 0 010 10z"/></svg>`;

    gpsButton.onclick = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          //  console.log("📍 GPS Current Location:", { lat, lng });
          setPosition({ lat, lng });
          onLocationFetch?.(lat, lng);
          map.panTo({ lat, lng });
          map.setZoom(16);
        },
        () => alert("Location permission denied")
      );
    };
    map.controls[window.google.maps.ControlPosition.RIGHT_BOTTOM].push(gpsButton);
  };

  return (
    <GoogleMap
      center={position}
      zoom={16}
      onLoad={onLoad}
      onIdle={() => {
        if (mapRef.current) {
          const center = mapRef.current.getCenter();
          const lat = center.lat();
          const lng = center.lng();
          if (lat !== position.lat || lng !== position.lng) {
            setPosition({ lat, lng });
            onLocationFetch?.(lat, lng);
          }
        }
      }}
      mapContainerClassName="map"
      onClick={(e) =>
        setPosition({
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
        })
      }
    >
      <Marker
        position={position}
        draggable
        onDragEnd={(e) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          setPosition({ lat, lng });
          onLocationFetch?.(lat, lng);
        }}
      />
    </GoogleMap>
  );
}