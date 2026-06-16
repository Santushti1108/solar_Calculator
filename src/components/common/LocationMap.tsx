import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMap } from "react-leaflet";
import { useMapEvents } from "react-leaflet";
import { useEffect } from "react";


function MapUpdater({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

 useEffect(() => {
    map.flyTo(
      [latitude, longitude],
      13,
      {
        duration: 1.5,
      }
    );
  }, [latitude, longitude, map]);
  return null;
}

interface LocationMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (
    lat: number,
    lon: number
  ) => void;
}

function MapClickHandler({
  onLocationChange,
}: {
  onLocationChange: (
    lat: number,
    lon: number
  ) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationChange(
        e.latlng.lat,
        e.latlng.lng
      );
    },
  });

  return null;
}
// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export function LocationMap({
  latitude,
  longitude,
  onLocationChange,
}: LocationMapProps) {
  return (
    <div
      style={{
        height: "500px",
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        style={{
          height: "100%",
          width: "100%",
          
        }}
      >
        <MapUpdater
          latitude={latitude}
          longitude={longitude}
        />
        <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationChange={onLocationChange} />
       
            <Marker 
                draggable={true}
                position={[latitude, longitude]}
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target;
                    const pos = marker.getLatLng();

                    onLocationChange(
                      pos.lat,
                      pos.lng
                    );
                  },
                }}
              >
              <Popup>
                Selected Site <br />
                Lat: {latitude}
                <br />
                Lon: {longitude}
              </Popup>
          </Marker>
        </MapContainer>
      </div>
  );
}