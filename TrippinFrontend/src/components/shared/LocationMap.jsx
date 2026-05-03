import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon (Leaflet + bundler issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom terra-colored marker
const customIcon = new L.DivIcon({
  className: 'custom-map-marker',
  html: `<div style="
    width: 32px; height: 32px;
    background: linear-gradient(135deg, #C45C3C, #D6A05A);
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(196,92,60,0.4);
  "><div style="
    width: 10px; height: 10px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
  "></div></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function FlyToLocation({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 12, { duration: 1.5 });
    }
  }, [lat, lng, map]);
  return null;
}

export default function LocationMap({ latitude, longitude, name, city, country }) {
  if (!latitude || !longitude) return null;

  return (
    <div className="location-map-container">
      <MapContainer
        center={[latitude, longitude]}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &bull; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <Marker position={[latitude, longitude]} icon={customIcon}>
          <Popup>
            <div style={{ fontFamily: 'var(--font-body)', textAlign: 'center' }}>
              <strong style={{ fontSize: '14px' }}>{name}</strong>
              <br />
              <span style={{ fontSize: '12px', color: '#666' }}>{city}, {country}</span>
            </div>
          </Popup>
        </Marker>
        <FlyToLocation lat={latitude} lng={longitude} />
      </MapContainer>
    </div>
  );
}
