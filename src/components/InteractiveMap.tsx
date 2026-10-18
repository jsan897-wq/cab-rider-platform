'use client';

import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, Marker, Polyline, Circle } from 'leaflet';
import { LocationItem, MP_LOCATIONS } from '@/data/mpLocations';

export interface ActiveDriver {
  driverId: string;
  driverName: string;
  driverEmail: string;
  vehicleType: string;
  vehicleNumber?: string;
  lat: number;
  lng: number;
  isOnline: boolean;
  updatedAt: string;
}

interface InteractiveMapProps {
  pickupLocation: LocationItem;
  dropoffLocation: LocationItem;
  onSelectPickup: (loc: LocationItem) => void;
  onSelectDropoff: (loc: LocationItem) => void;
  selectedDistrict: string;
  userCurrentLocation?: { lat: number; lng: number } | null;
  onlineDrivers?: ActiveDriver[];
  onRequestCurrentLocation?: () => void;
  locationLoading?: boolean;
}

export default function InteractiveMap({
  pickupLocation,
  dropoffLocation,
  onSelectPickup,
  onSelectDropoff,
  selectedDistrict,
  userCurrentLocation,
  onlineDrivers = [],
  onRequestCurrentLocation,
  locationLoading = false,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const driverMarkersRef = useRef<Marker[]>([]);
  const userMarkerRef = useRef<{ marker: Marker; circle: Circle } | null>(null);
  const routeLineRef = useRef<Polyline | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize Map
  useEffect(() => {
    let isCancelled = false;

    async function initLeaflet() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;
      if (isCancelled) return;

      // Fix default Leaflet asset URLs
      // @ts-expect-error Leaflet internal icon configuration
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Initialize map centered on Shahdol, Umaria & Anuppur region
      const map = L.map(mapContainerRef.current, {
        center: [23.35, 81.25],
        zoom: 9,
        zoomControl: true,
      });

      // 100% Free OpenStreetMap raster tiles - Zero API Key required
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      setIsReady(true);

      setTimeout(() => map.invalidateSize(), 100);
      setTimeout(() => map.invalidateSize(), 300);
      setTimeout(() => map.invalidateSize(), 600);
    }

    initLeaflet();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Markers, User Current Location, Online Drivers & Route Line
  useEffect(() => {
    if (!isReady || !mapInstanceRef.current) return;

    let isCancelled = false;

    async function renderSync() {
      const L = (await import('leaflet')).default;
      if (isCancelled || !mapInstanceRef.current) return;
      const map = mapInstanceRef.current;

      map.invalidateSize();

      // Clear existing city markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Clear driver markers
      driverMarkersRef.current.forEach((m) => m.remove());
      driverMarkersRef.current = [];

      // Clear user GPS marker
      if (userMarkerRef.current) {
        userMarkerRef.current.marker.remove();
        userMarkerRef.current.circle.remove();
        userMarkerRef.current = null;
      }

      if (routeLineRef.current) {
        routeLineRef.current.remove();
        routeLineRef.current = null;
      }

      // 1. Render Pre-downloaded City Markers
      const filtered = selectedDistrict === 'All'
        ? MP_LOCATIONS
        : MP_LOCATIONS.filter((l) => l.district === selectedDistrict);

      filtered.forEach((loc) => {
        const isPickup = pickupLocation.id === loc.id;
        const isDropoff = dropoffLocation.id === loc.id;

        let iconEmoji = '📍';
        if (loc.category === 'city') iconEmoji = '🏙️';
        else if (loc.category === 'transit') iconEmoji = '🚆';
        else if (loc.category === 'tourist') iconEmoji = '🐅';
        else if (loc.category === 'hospital') iconEmoji = '🏥';
        else if (loc.category === 'commercial') iconEmoji = '🏬';

        let badgeColor = 'bg-slate-900 border-slate-700 text-slate-100';
        let zIndexOffset = 100;
        let pulseHtml = '';

        if (isPickup) {
          badgeColor = 'bg-emerald-500 border-white text-slate-950 font-black shadow-lg shadow-emerald-500/50 scale-125';
          zIndexOffset = 1000;
          pulseHtml = '<span class="absolute -inset-1 rounded-full bg-emerald-400 opacity-75 animate-ping"></span>';
        } else if (isDropoff) {
          badgeColor = 'bg-red-500 border-white text-white font-black shadow-lg shadow-red-500/50 scale-125';
          zIndexOffset = 1000;
          pulseHtml = '<span class="absolute -inset-1 rounded-full bg-red-400 opacity-75 animate-ping"></span>';
        } else if (loc.district === 'Shahdol') {
          badgeColor = 'bg-amber-500 border-amber-300 text-slate-950 font-bold';
        } else if (loc.district === 'Umaria') {
          badgeColor = 'bg-cyan-500 border-cyan-200 text-slate-950 font-bold';
        } else if (loc.district === 'Anuppur') {
          badgeColor = 'bg-purple-600 border-purple-300 text-white font-bold';
        } else if (loc.district === 'Nearby Cities') {
          badgeColor = 'bg-blue-600 border-blue-200 text-white font-bold';
        }

        const icon = L.divIcon({
          className: '',
          html: `
            <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
              ${pulseHtml}
              <div class="rounded-full border-2 flex items-center justify-center text-sm shadow-md transition-transform duration-150 hover:scale-125 ${badgeColor}" style="width: 34px; height: 34px; line-height: 1;">
                ${iconEmoji}
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -18],
        });

        const marker = L.marker([loc.lat, loc.lng], { icon, zIndexOffset }).addTo(map);

        marker.bindTooltip(`<b>${loc.name}</b>`, {
          direction: 'top',
          offset: [0, -14],
          className: 'text-xs font-semibold',
        });

        // Popup Content
        const popupDiv = document.createElement('div');
        popupDiv.style.minWidth = '220px';
        popupDiv.style.color = '#0f172a';
        popupDiv.innerHTML = `
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 2px;">
            ${loc.district}
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #020617; line-height: 1.2;">
            ${loc.name}
          </div>
          ${loc.hindiName ? `<div style="font-size: 12px; font-weight: 600; color: #d97706; margin-top: 2px;">${loc.hindiName}</div>` : ''}
          <div style="font-size: 11px; color: #475569; margin: 6px 0 10px 0; line-height: 1.3;">
            ${loc.description}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0;">
            <button id="pop-pick-${loc.id}" style="padding: 6px 8px; background-color: #059669; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
              ✓ Set Pickup
            </button>
            <button id="pop-drop-${loc.id}" style="padding: 6px 8px; background-color: #dc2626; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
              ✓ Set Drop-off
            </button>
          </div>
        `;

        marker.bindPopup(popupDiv);

        marker.on('popupopen', () => {
          const btnP = document.getElementById(`pop-pick-${loc.id}`);
          const btnD = document.getElementById(`pop-drop-${loc.id}`);
          if (btnP) {
            btnP.onclick = () => {
              onSelectPickup(loc);
              marker.closePopup();
            };
          }
          if (btnD) {
            btnD.onclick = () => {
              onSelectDropoff(loc);
              marker.closePopup();
            };
          }
        });

        markersRef.current.push(marker);
      });

      // 2. Render User's Live GPS Location
      if (userCurrentLocation) {
        const userIcon = L.divIcon({
          className: '',
          html: `
            <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
              <span class="absolute -inset-2 rounded-full bg-blue-500 opacity-60 animate-ping"></span>
              <div class="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-black">
                ●
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        });

        const userMarker = L.marker([userCurrentLocation.lat, userCurrentLocation.lng], {
          icon: userIcon,
          zIndexOffset: 1200,
        }).addTo(map);

        const accuracyCircle = L.circle([userCurrentLocation.lat, userCurrentLocation.lng], {
          radius: 350,
          color: '#3b82f6',
          fillColor: '#60a5fa',
          fillOpacity: 0.15,
          weight: 1.5,
        }).addTo(map);

        userMarker.bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; min-width: 180px;">
            <div style="font-size: 11px; font-weight: 800; color: #2563eb;">📍 YOUR CURRENT LOCATION</div>
            <div style="font-size: 12px; color: #475569; margin: 4px 0 8px 0;">Lat: ${userCurrentLocation.lat.toFixed(4)}, Lng: ${userCurrentLocation.lng.toFixed(4)}</div>
            <button id="btn-use-my-loc" style="width: 100%; padding: 6px; background-color: #2563eb; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
              Set as My Pickup
            </button>
          </div>
        `);

        userMarker.on('popupopen', () => {
          const btn = document.getElementById('btn-use-my-loc');
          if (btn) {
            btn.onclick = () => {
              onSelectPickup({
                id: 'my_gps_location',
                name: 'My Current Location (GPS)',
                hindiName: 'मेरी वर्तमान लोकेशन',
                district: 'Shahdol',
                category: 'transit',
                lat: userCurrentLocation.lat,
                lng: userCurrentLocation.lng,
                description: `Live GPS: ${userCurrentLocation.lat.toFixed(4)}, ${userCurrentLocation.lng.toFixed(4)}`,
              });
              userMarker.closePopup();
            };
          }
        });

        userMarkerRef.current = { marker: userMarker, circle: accuracyCircle };
      }

      // 3. Render Online Registered Drivers
      onlineDrivers.forEach((driver) => {
        let vehicleIcon = '🚗';
        if (driver.vehicleType === 'bike') vehicleIcon = '🏍️';
        else if (driver.vehicleType === 'auto') vehicleIcon = '🛺';
        else if (driver.vehicleType === 'car_suv') vehicleIcon = '🚙';

        const driverIcon = L.divIcon({
          className: '',
          html: `
            <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
              <span class="absolute -inset-1 rounded-full bg-amber-400 opacity-60 animate-pulse"></span>
              <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 border-2 border-slate-950 text-slate-950 shadow-xl flex items-center justify-center text-sm font-black transform hover:scale-125 transition">
                ${vehicleIcon}
              </div>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
          popupAnchor: [0, -19],
        });

        const dMarker = L.marker([driver.lat, driver.lng], {
          icon: driverIcon,
          zIndexOffset: 1100,
        }).addTo(map);

        dMarker.bindTooltip(`<b>${driver.driverName} (${driver.vehicleNumber || 'Driver'})</b>`, {
          direction: 'top',
          offset: [0, -16],
          className: 'text-xs font-semibold',
        });

        dMarker.bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; min-width: 190px;">
            <div style="font-size: 10px; font-weight: 800; color: #16a34a; text-transform: uppercase;">● ACTIVE REGISTERED DRIVER</div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">${driver.driverName}</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">Vehicle: ${driver.vehicleType.toUpperCase()} • ${driver.vehicleNumber || 'Registered'}</div>
            <div style="font-size: 11px; color: #0284c7; margin-bottom: 6px;">Email: ${driver.driverEmail}</div>
            <div style="font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 4px;">Updated: ${new Date(driver.updatedAt).toLocaleTimeString()}</div>
          </div>
        `);

        driverMarkersRef.current.push(dMarker);
      });

      // 4. Synchronize Route Polyline
      if (pickupLocation && dropoffLocation) {
        if (pickupLocation.id !== dropoffLocation.id) {
          const latlngs: [number, number][] = [
            [pickupLocation.lat, pickupLocation.lng],
            [dropoffLocation.lat, dropoffLocation.lng],
          ];

          const line = L.polyline(latlngs, {
            color: '#f59e0b',
            weight: 5,
            opacity: 0.9,
            dashArray: '10, 8',
          }).addTo(map);

          routeLineRef.current = line;

          map.fitBounds(line.getBounds(), {
            padding: [50, 50],
            maxZoom: 12,
            animate: true,
          });
        } else {
          map.flyTo([pickupLocation.lat, pickupLocation.lng], 12, { animate: true });
        }
      }
    }

    renderSync();

    return () => {
      isCancelled = true;
    };
  }, [isReady, selectedDistrict, pickupLocation, dropoffLocation, userCurrentLocation, onlineDrivers]);

  const handleRecenter = async () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.invalidateSize();
    if (pickupLocation && dropoffLocation && pickupLocation.id !== dropoffLocation.id) {
      const L = (await import('leaflet')).default;
      const bounds = L.latLngBounds([
        [pickupLocation.lat, pickupLocation.lng],
        [dropoffLocation.lat, dropoffLocation.lng],
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], animate: true });
    } else {
      mapInstanceRef.current.setView([23.35, 81.25], 9, { animate: true });
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Strict Square Container */}
      <div
        className="relative w-full aspect-square max-w-[540px] rounded-3xl overflow-hidden border-2 border-slate-700 bg-slate-900 shadow-2xl"
        style={{ minHeight: '380px' }}
      >
        {/* Leaflet Mount Element */}
        <div
          ref={mapContainerRef}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}
        />

        {/* Sync & Online Drivers Status (Top-Left) */}
        <div
          className="bg-slate-950/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-xs"
          style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 1000 }}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-white">Live Synced Map</span>
          {onlineDrivers.length > 0 && (
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 font-black">
              🚖 {onlineDrivers.length} Online Driver{onlineDrivers.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Top-Right Action Controls (GPS & Recenter) */}
        <div
          className="flex items-center gap-2"
          style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 1000 }}
        >
          {onRequestCurrentLocation && (
            <button
              onClick={onRequestCurrentLocation}
              disabled={locationLoading}
              className="bg-blue-600 hover:bg-blue-500 text-white border border-blue-400 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              title="Access My Current GPS Location"
            >
              <span>{locationLoading ? '⏳' : '🎯'}</span>
              <span>{locationLoading ? 'Locating...' : 'My Location'}</span>
            </button>
          )}

          <button
            onClick={handleRecenter}
            className="bg-slate-950/90 hover:bg-slate-900 text-white border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-lg transition cursor-pointer flex items-center gap-1"
            title="Recenter Map View"
          >
            <span>⌖</span> Center
          </button>
        </div>

        {/* Bottom Legend */}
        <div
          className="bg-slate-950/95 backdrop-blur border border-slate-800/90 p-2.5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300"
          style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', zIndex: 1000 }}
        >
          <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
            <span className="flex items-center gap-1 font-semibold text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Shahdol
            </span>
            <span className="flex items-center gap-1 font-semibold text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Umaria
            </span>
            <span className="flex items-center gap-1 font-semibold text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Anuppur
            </span>
            <span className="flex items-center gap-1 font-semibold text-amber-300">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> 🚖 Registered Drivers
            </span>
            {userCurrentLocation && (
              <span className="flex items-center gap-1 font-semibold text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> 🔵 You
              </span>
            )}
          </div>

          <div className="font-mono text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {pickupLocation.name.split(' ')[0]} ➔ {dropoffLocation.name.split(' ')[0]}
          </div>
        </div>
      </div>
    </div>
  );
}
