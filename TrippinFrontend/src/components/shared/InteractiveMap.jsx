import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function InteractiveMap({ 
  lat = 48.8566, 
  lng = 2.3522, 
  zoom = 13, 
  markers = [], 
  height = '400px',
  className = '' 
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Create map with dark theme
    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Dark themed tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Custom marker icon
    const customIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `<div class="map-pin"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#ff5a1f" stroke="#fff" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -30],
    });

    // Add main marker
    if (lat && lng) {
      L.marker([lat, lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`<div class="map-popup-content"><strong>📍 Location</strong></div>`);
    }

    // Add additional markers
    markers.forEach((m) => {
      if (m.lat && m.lng) {
        L.marker([m.lat, m.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`<div class="map-popup-content"><strong>${m.name || '📍'}</strong>${m.description ? `<br/><span>${m.description}</span>` : ''}</div>`);
      }
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [lat, lng, zoom, markers]);

  return (
    <div 
      ref={mapRef} 
      className={`interactive-map ${className}`}
      style={{ height, width: '100%', borderRadius: '16px', overflow: 'hidden' }} 
    />
  );
}
