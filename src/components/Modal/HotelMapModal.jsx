import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

/* Automatically fit map bounds to all hotel markers */
const FitBounds = ({ markers }) => {
  const map = useMap();

  useEffect(() => {
    if (!markers || markers.length === 0) return;

    const bounds = L.latLngBounds(
      markers.map((h) => [Number(h.latitude), Number(h.longitude)])
    );

    map.fitBounds(bounds, { padding: [60, 60] });
  }, [markers, map]);

  return null;
};

const HotelMapModal = ({ isOpen, onClose, hotels = [] }) => {
  if (!isOpen) return null;

  // Filter hotels having valid coordinates
  const markers = hotels.filter(
    (h) => h?.latitude && h?.longitude
  );

  // Default fallback (Delhi)
  const defaultCenter = [28.61, 77.2];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999999]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-xl w-[80%] h-[65vh] shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Hotels on Map</h2>
          <button
            onClick={onClose}
            className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm"
          >
            Close
          </button>
        </div>

        {/* Map */}
        <MapContainer
          center={defaultCenter}
          zoom={12}
          scrollWheelZoom={true}
          style={{ width: "100%", height: "100%" }}
        >
          {/* Base Map Layer */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />

          {/* Auto-fit map to all hotels */}
          <FitBounds markers={markers} />

          {/* Hotel Dynamic Markers */}
          {markers.map((hotel, idx) => {
            const lat = Number(hotel.latitude);
            const lng = Number(hotel.longitude);
            const name = hotel.name || hotel.hotelName || "Unnamed Hotel";
            const rating = hotel.rt || hotel.rating || "N/A";
            const price = hotel.price ? `₹${hotel.price.toLocaleString()}` : "—";

            return (
              <Marker key={`${hotel.id || idx}`} position={[lat, lng]} icon={markerIcon}>
                {/* Tooltip on hover */}
                <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                  {name}
                </Tooltip>

                {/* Popup on click */}
                <Popup>
                  <div className="font-semibold text-sm mb-1">{name}</div>
                  <div className="text-xs text-gray-600 mb-1">
                    Rating: <span className="font-medium">{rating}</span> ★
                  </div>
                  <div className="text-xs text-gray-600">
                    Price: <span className="font-semibold">{price}</span>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default HotelMapModal;
