'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MP_LOCATIONS, LocationItem, calculateTripDistance } from '@/data/mpLocations';
import type { ActiveDriver } from '@/components/InteractiveMap';
import BandhavgarhHotels from '@/components/BandhavgarhHotels';

// Dynamically import square map with SSR disabled for clean client-side rendering
const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-square max-w-[540px] rounded-3xl bg-slate-900 border-2 border-slate-700 flex flex-col items-center justify-center text-slate-400 shadow-2xl mx-auto min-h-[380px]">
      <span className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></span>
      <p className="text-sm font-bold text-slate-200">Loading Regional GPS Square Map...</p>
      <p className="text-xs text-slate-500 mt-1">Shahdol • Umaria • Anuppur • Live Drivers</p>
    </div>
  ),
});

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'passenger' | 'driver';
  phone?: string;
  vehicleType?: string;
  vehicleNumber?: string;
}

interface Ride {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerEmail: string;
  pickupAddress: string;
  dropoffAddress: string;
  distanceKm: number;
  fareAmount: number;
  vehicleType: string;
  status: 'REQUESTED' | 'ACCEPTED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  driverId?: string;
  driverName?: string;
  driverEmail?: string;
  createdAt: string;
  updatedAt: string;
}

const VEHICLE_OPTIONS = [
  { id: 'bike', name: 'Moto Bike', icon: '🏍️', baseRate: 20, perKm: 8 },
  { id: 'auto', name: 'Auto Rickshaw', icon: '🛺', baseRate: 35, perKm: 13 },
  { id: 'car_sedan', name: 'Prime Sedan', icon: '🚗', baseRate: 60, perKm: 18 },
  { id: 'car_suv', name: 'Prime SUV', icon: '🚙', baseRate: 100, perKm: 24 },
];

export default function CabPlatform() {
  // Authentication State
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authRole, setAuthRole] = useState<'passenger' | 'driver'>('passenger');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Form Inputs for Auth
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [driverVehicle, setDriverVehicle] = useState('car_sedan');
  const [driverPlate, setDriverPlate] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Map and Location Selection
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [pickupLoc, setPickupLoc] = useState<LocationItem>(MP_LOCATIONS[0]); // Shahdol Station
  const [dropoffLoc, setDropoffLoc] = useState<LocationItem>(MP_LOCATIONS[14]); // Bandhavgarh Tala Gate
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLE_OPTIONS[2]);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Live GPS & Registered Drivers state
  const [userCurrentLocation, setUserCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [onlineDrivers, setOnlineDrivers] = useState<ActiveDriver[]>([]);
  const [driverIsOnline, setDriverIsOnline] = useState(true);
  const [driverLocationMsg, setDriverLocationMsg] = useState('');

  // Rides & DB State
  const [rides, setRides] = useState<Ride[]>([]);
  const [dbSource, setDbSource] = useState('Checking...');
  const [refreshing, setRefreshing] = useState(false);

  // Active Tab: Passenger vs Driver vs Tourism (Bandhavgarh Hotels & tour@sdl)
  const [activeTab, setActiveTab] = useState<'passenger' | 'driver' | 'tourism'>('passenger');
  const [tourismSubTab, setTourismSubTab] = useState<'hotels' | 'tour'>('hotels');

  // Load session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cab_app_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        setActiveTab(parsed.role);
      } catch {
        // ignore
      }
    }
  }, []);

  // Fetch all rides
  const fetchRides = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/rides');
      const data = await res.json();
      if (data.rides) {
        setRides(data.rides);
      }
      if (data.databaseSource) {
        setDbSource(data.databaseSource);
      }
    } catch (err) {
      console.error('Failed to load rides:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch online drivers
  const fetchDrivers = async () => {
    try {
      const res = await fetch('/api/drivers/location');
      const data = await res.json();
      if (data.drivers) {
        setOnlineDrivers(data.drivers);
      }
    } catch (err) {
      console.error('Failed to fetch online drivers:', err);
    }
  };

  useEffect(() => {
    fetchRides();
    fetchDrivers();
    const interval = setInterval(() => {
      fetchRides();
      fetchDrivers();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Access Passenger's Current GPS Location
  const handleRequestCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserCurrentLocation({ lat, lng });

        const gpsLoc: LocationItem = {
          id: 'my_gps_location',
          name: '📍 My Current Location (GPS)',
          hindiName: 'मेरी वर्तमान लोकेशन',
          district: 'Shahdol',
          category: 'transit',
          lat,
          lng,
          description: `Device Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        };

        setPickupLoc(gpsLoc);
        setLocationLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        // Fallback to Gandhi Chowk Shahdol if user denies or in testing
        const fallback = MP_LOCATIONS[2];
        setUserCurrentLocation({ lat: fallback.lat, lng: fallback.lng });
        setPickupLoc(fallback);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Broadcast Driver's Location to Server
  const handleBroadcastDriverLocation = async (coords: { lat: number; lng: number }, online: boolean = true) => {
    if (!user || user.role !== 'driver') return;

    try {
      setDriverLocationMsg('Broadcasting live location...');
      const res = await fetch('/api/drivers/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: user.id,
          driverName: user.name,
          driverEmail: user.email,
          vehicleType: user.vehicleType || 'car_sedan',
          vehicleNumber: user.vehicleNumber || 'MP-18',
          lat: coords.lat,
          lng: coords.lng,
          isOnline: online,
        }),
      });
      if (res.ok) {
        setDriverIsOnline(online);
        setDriverLocationMsg(`Location synced: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
        await fetchDrivers();
      }
    } catch {
      setDriverLocationMsg('Failed to update driver location');
    }
  };

  // Calculate Real Road Distance between locations
  const distanceKm = useMemo(() => {
    return calculateTripDistance(pickupLoc, dropoffLoc);
  }, [pickupLoc, dropoffLoc]);

  // Calculate Fare based on distance and vehicle
  const calculatedFare = useMemo(() => {
    return Math.round(selectedVehicle.baseRate + distanceKm * selectedVehicle.perKm);
  }, [selectedVehicle, distanceKm]);

  // Direct Cab Booking from Bandhavgarh Hotel Showcase
  const handleBookToHotel = (hotel: { name: string; address: string; lat: number; lng: number }) => {
    const hotelLoc: LocationItem = {
      id: `hotel_${hotel.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      name: hotel.name,
      hindiName: 'बांधवगढ़ ताला रिसॉर्ट',
      district: 'Umaria',
      category: 'tourist',
      lat: hotel.lat,
      lng: hotel.lng,
      description: hotel.address,
    };

    setDropoffLoc(hotelLoc);
    setActiveTab('passenger');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth Submit
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            password,
            role: authRole,
            phone,
            vehicleType: authRole === 'driver' ? driverVehicle : undefined,
            vehicleNumber: authRole === 'driver' ? driverPlate : undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to register');
        setUser(data.user);
        setActiveTab(data.user.role);
        localStorage.setItem('cab_app_user', JSON.stringify(data.user));
        setShowAuthModal(false);

        // If registered as driver, broadcast initial location automatically
        if (data.user.role === 'driver') {
          handleBroadcastDriverLocation({ lat: 23.2847, lng: 81.3542 }, true);
        }
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to login');
        setUser(data.user);
        setActiveTab(data.user.role);
        localStorage.setItem('cab_app_user', JSON.stringify(data.user));
        setShowAuthModal(false);

        if (data.user.role === 'driver') {
          handleBroadcastDriverLocation({ lat: 23.2847, lng: 81.3542 }, true);
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cab_app_user');
  };

  // Passenger: Book Ride
  const handleBookRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setBookingLoading(true);
    try {
      const res = await fetch('/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passengerId: user.id,
          passengerName: user.name,
          passengerEmail: user.email,
          pickupAddress: `${pickupLoc.name} (${pickupLoc.district})`,
          dropoffAddress: `${dropoffLoc.name} (${dropoffLoc.district})`,
          distanceKm,
          fareAmount: calculatedFare,
          vehicleType: `${selectedVehicle.icon} ${selectedVehicle.name}`,
        }),
      });
      if (res.ok) {
        await fetchRides();
      }
    } catch (err) {
      console.error('Ride booking failed:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  // Driver: Update Ride Status
  const handleStatusUpdate = async (rideId: string, nextStatus: Ride['status']) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      await fetch(`/api/rides/${rideId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          driver: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        }),
      });
      await fetchRides();
    } catch (err) {
      console.error('Failed to update ride:', err);
    }
  };

  // Filter rides for Passenger
  const myPassengerRides = rides.filter(
    (r) => user && r.passengerEmail.toLowerCase() === user.email.toLowerCase()
  );

  // Available rides for Drivers
  const availableRides = rides.filter((r) => r.status === 'REQUESTED');
  // Rides accepted by current driver
  const myDriverRides = rides.filter(
    (r) => user && r.driverEmail?.toLowerCase() === user.email.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-amber-500/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white">
                  SHAHDOL<span className="text-amber-400">CAB</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Live GPS & Drivers
                </span>
              </div>
              <p className="text-xs text-slate-400">Shahdol • Umaria • Anuppur • Live Driver Dispatch</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/deployment_and_launch_guide.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition"
              title="Open Server, Domain & Deployment Guide"
            >
              <span>📖</span> Launch Guide
            </a>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>DB: <strong className="text-emerald-400">{dbSource}</strong></span>
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-white flex items-center gap-1.5 justify-end">
                    {user.name}
                    <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-bold ${
                      user.role === 'driver' ? 'bg-purple-900/80 text-purple-300 border border-purple-700' : 'bg-blue-900/80 text-blue-300 border border-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">{user.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 transition shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
        {/* District & Role Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          {/* Passenger / Driver Tabs */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('passenger')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'passenger'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>👤</span> Passenger View
            </button>
            <button
              onClick={() => setActiveTab('driver')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'driver'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🚖</span> Driver / Rider View
              {availableRides.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] bg-red-500 text-white rounded-full font-black animate-bounce">
                  {availableRides.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('tourism')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'tourism'
                  ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🐅🌿</span> Bandhavgarh & tour@sdl
            </button>
          </div>

          {/* District Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-semibold">
            <span className="text-[11px] text-slate-400 px-2">District:</span>
            {['All', 'Shahdol', 'Umaria', 'Anuppur', 'Nearby Cities'].map((dist) => (
              <button
                key={dist}
                onClick={() => setSelectedDistrict(dist)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  selectedDistrict === dist
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {dist}
              </button>
            ))}
          </div>
        </div>

        {/* PASSENGER VIEW */}
        {activeTab === 'passenger' && (
          <div className="space-y-6">
            {/* Square Map & Route Booking Side-by-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: SQUARE MAP */}
              <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-3 px-1">
                  <div>
                    <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                      <span>🗺️</span> Regional GPS Square Map
                    </h2>
                    <p className="text-xs text-slate-400">Click landmarks or click &quot;My Location&quot; to locate yourself</p>
                  </div>
                  <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    {onlineDrivers.length} Online Driver{onlineDrivers.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* THE SQUARE MAP */}
                <InteractiveMap
                  pickupLocation={pickupLoc}
                  dropoffLocation={dropoffLoc}
                  onSelectPickup={setPickupLoc}
                  onSelectDropoff={setDropoffLoc}
                  selectedDistrict={selectedDistrict}
                  userCurrentLocation={userCurrentLocation}
                  onlineDrivers={onlineDrivers}
                  onRequestCurrentLocation={handleRequestCurrentLocation}
                  locationLoading={locationLoading}
                />

                {/* Popular Route Shortcuts */}
                <div className="w-full mt-4 pt-3 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block mb-2">⚡ Popular Quick Routes (Click to Sync Map):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '🐅 Shahdol ➔ Bandhavgarh', pickId: 'sdl_rly', dropId: 'umr_bandhavgarh_tala' },
                      { label: '🕉️ Shahdol ➔ Amarkantak', pickId: 'sdl_rly', dropId: 'apr_amarkantak_temple' },
                      { label: '🚆 Umaria ➔ Katni Jn', pickId: 'umr_rly', dropId: 'city_katni' },
                      { label: '🛕 Shahdol ➔ Maihar Temple', pickId: 'sdl_bus', dropId: 'city_maihar' },
                      { label: '⚡ Pali ➔ Anuppur Jn', pickId: 'umr_pali', dropId: 'apr_rly' },
                    ].map((route) => (
                      <button
                        key={route.label}
                        type="button"
                        onClick={() => {
                          const p = MP_LOCATIONS.find((l) => l.id === route.pickId);
                          const d = MP_LOCATIONS.find((l) => l.id === route.dropId);
                          if (p && d) {
                            setPickupLoc(p);
                            setDropoffLoc(d);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-amber-400 transition font-medium cursor-pointer"
                      >
                        {route.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Route Selection & Fare Calculator */}
              <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-white">Select Route & Book</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Directly synced with the map and registered driver radar
                    </p>
                  </div>

                  {/* Geolocation Trigger Button */}
                  <button
                    type="button"
                    onClick={handleRequestCurrentLocation}
                    disabled={locationLoading}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>{locationLoading ? '⏳' : '🎯'}</span>
                    <span>{locationLoading ? 'Locating...' : 'Use My GPS'}</span>
                  </button>
                </div>

                {!user && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center justify-between">
                    <span>Please sign in or register to book your ride.</span>
                    <button
                      onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                      className="underline font-bold text-amber-400 cursor-pointer ml-2"
                    >
                      Login
                    </button>
                  </div>
                )}

                <form onSubmit={handleBookRide} className="space-y-4">
                  {/* Pickup Dropdown */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Pickup Location (प्रारंभ)
                      </span>
                      {pickupLoc.id === 'my_gps_location' && (
                        <span className="text-[10px] text-blue-400 font-bold bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                          🎯 Device GPS Active
                        </span>
                      )}
                    </div>
                    <select
                      value={pickupLoc.id}
                      onChange={(e) => {
                        if (e.target.value === 'my_gps_location' && userCurrentLocation) {
                          setPickupLoc({
                            id: 'my_gps_location',
                            name: '📍 My Current Location (GPS)',
                            hindiName: 'मेरी वर्तमान लोकेशन',
                            district: 'Shahdol',
                            category: 'transit',
                            lat: userCurrentLocation.lat,
                            lng: userCurrentLocation.lng,
                            description: 'Device GPS Coordinates',
                          });
                        } else {
                          const found = MP_LOCATIONS.find((l) => l.id === e.target.value);
                          if (found) setPickupLoc(found);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-amber-400 text-xs sm:text-sm text-white"
                    >
                      {userCurrentLocation && (
                        <option value="my_gps_location">
                          📍 [GPS] My Current Location ({userCurrentLocation.lat.toFixed(4)}, {userCurrentLocation.lng.toFixed(4)})
                        </option>
                      )}
                      {MP_LOCATIONS.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          [{loc.district}] {loc.name} {loc.hindiName ? `(${loc.hindiName})` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 mt-1">{pickupLoc.description}</p>
                  </div>

                  {/* Swap Button */}
                  <div className="flex justify-center -my-2 relative z-10">
                    <button
                      type="button"
                      onClick={() => {
                        const temp = pickupLoc;
                        setPickupLoc(dropoffLoc);
                        setDropoffLoc(temp);
                      }}
                      className="p-1 px-3 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-full border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                      title="Swap Pickup and Drop-off"
                    >
                      ⇅ Swap Locations
                    </button>
                  </div>

                  {/* Drop-off Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> Destination / Drop-off (गंतव्य)
                      </span>
                      <span className="text-[10px] text-red-400 font-mono">Synced on Map</span>
                    </label>
                    <select
                      value={dropoffLoc.id}
                      onChange={(e) => {
                        const found = MP_LOCATIONS.find((l) => l.id === e.target.value);
                        if (found) setDropoffLoc(found);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-amber-400 text-xs sm:text-sm text-white"
                    >
                      {MP_LOCATIONS.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          [{loc.district}] {loc.name} {loc.hindiName ? `(${loc.hindiName})` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 mt-1">{dropoffLoc.description}</p>
                  </div>

                  {/* Calculated Route Info */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Calculated Road Distance</span>
                      <span className="text-base font-black text-amber-400 font-mono">{distanceKm} km</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Travel Time</span>
                      <span className="text-slate-200 font-medium">~{Math.round(distanceKm * 2.2)} mins</span>
                    </div>
                  </div>

                  {/* Registered Drivers Online Info */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        Active Drivers Online in Region ({onlineDrivers.length})
                      </span>
                      <span className="text-[10px] text-slate-400">Auto-updating</span>
                    </div>

                    {onlineDrivers.length === 0 ? (
                      <p className="text-slate-500 text-[11px]">
                        No drivers currently online. Drivers can switch to Driver View and toggle &quot;Broadcast Location&quot; to appear here.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {onlineDrivers.map((d) => (
                          <div
                            key={d.driverEmail}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-slate-300 flex items-center gap-1.5"
                          >
                            <span>🚖</span>
                            <span className="font-semibold text-white">{d.driverName}</span>
                            <span className="text-amber-400 font-mono text-[10px]">({d.vehicleNumber || d.vehicleType})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Vehicle Choice */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Select Vehicle Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {VEHICLE_OPTIONS.map((v) => {
                        const isSelected = selectedVehicle.id === v.id;
                        const fare = Math.round(v.baseRate + distanceKm * v.perKm);
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setSelectedVehicle(v)}
                            className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-2xl">{v.icon}</span>
                              <span className="text-xs font-bold text-amber-400">₹{fare}</span>
                            </div>
                            <div className="mt-2 text-xs font-bold">{v.name}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Total & Submit */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Calculated Trip Fare</div>
                      <div className="text-2xl font-black text-amber-400 font-mono">₹{calculatedFare}</div>
                    </div>
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                    >
                      {bookingLoading ? 'Requesting...' : 'Request Cab Now →'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Bottom Row: Live Bookings & Ride Status */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-white">Your Rides & Bookings</h3>
                  <p className="text-xs text-slate-400 mt-1">Live status of your requested and past journeys</p>
                </div>
                <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                  Total: {user ? myPassengerRides.length : rides.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[450px] pr-1">
                {(user ? myPassengerRides : rides).length === 0 ? (
                  <div className="h-40 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 text-sm p-6 text-center">
                    <span className="text-3xl mb-1">🚖</span>
                    <p className="font-semibold text-slate-400">No active or past rides</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Choose your pickup and destination on the map or dropdown above to book!
                    </p>
                  </div>
                ) : (
                  (user ? myPassengerRides : rides).map((ride) => (
                    <div
                      key={ride.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{ride.vehicleType.split(' ')[0]}</span>
                          <span className="font-bold text-sm text-white">{ride.vehicleType}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-extrabold text-amber-400">₹{ride.fareAmount}</span>
                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                            ride.status === 'REQUESTED' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' :
                            ride.status === 'ACCEPTED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            ride.status === 'IN_TRANSIT' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                            ride.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {ride.status === 'REQUESTED' ? '⏳ Searching for Driver' :
                             ride.status === 'ACCEPTED' ? '🚗 Driver Confirmed' :
                             ride.status === 'IN_TRANSIT' ? '🛣️ In Transit' :
                             ride.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded bg-slate-900/60 border border-slate-800/60">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Pickup</span>
                          <span className="text-slate-200 font-medium">{ride.pickupAddress}</span>
                        </div>
                        <div className="p-2 rounded bg-slate-900/60 border border-slate-800/60">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Drop-off</span>
                          <span className="text-slate-200 font-medium">{ride.dropoffAddress}</span>
                        </div>
                      </div>

                      {ride.driverName && (
                        <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between text-xs text-emerald-300">
                          <div>
                            <strong>Driver:</strong> {ride.driverName} ({ride.driverEmail})
                          </div>
                          <span className="text-[10px] bg-emerald-900 px-2 py-0.5 rounded font-mono">Assigned</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* DRIVER / RIDER VIEW */}
        {activeTab === 'driver' && (
          <div className="space-y-6">
            {/* Driver Live Location Broadcasting Control Panel */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border-2 border-amber-500/30 shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                    Driver Live GPS Location & Radar Broadcast
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Broadcast your live location so nearby passengers in Shahdol, Umaria & Anuppur can see your cab on their map.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!navigator.geolocation) {
                        alert('Geolocation not supported');
                        return;
                      }
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          handleBroadcastDriverLocation(
                            { lat: pos.coords.latitude, lng: pos.coords.longitude },
                            true
                          );
                        },
                        () => {
                          // Fallback to Shahdol Station
                          handleBroadcastDriverLocation({ lat: 23.2847, lng: 81.3542 }, true);
                          alert('Device GPS unavailable. Broadcating from Shahdol Station.');
                        }
                      );
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🛰️</span> Broadcast My Live Device GPS
                  </button>

                  <button
                    onClick={() => {
                      if (user) {
                        handleBroadcastDriverLocation({ lat: 23.2847, lng: 81.3542 }, !driverIsOnline);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      driverIsOnline
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-red-500/20 text-red-400 border-red-500/40'
                    }`}
                  >
                    {driverIsOnline ? '● On Duty (Online)' : '○ Off Duty (Offline)'}
                  </button>
                </div>
              </div>

              {/* Quick Simulator Buttons for Driver Location */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400">Quick Set Station / Stand:</span>
                {[
                  { name: 'Shahdol Station', lat: 23.2847, lng: 81.3542 },
                  { name: 'Umaria Station', lat: 23.5246, lng: 80.8354 },
                  { name: 'Anuppur Junction', lat: 23.1039, lng: 81.6917 },
                  { name: 'Bandhavgarh Tala', lat: 23.7011, lng: 81.0267 },
                  { name: 'Pali Birhasini', lat: 23.3644, lng: 81.0422 },
                  { name: 'Amarkantak Temple', lat: 22.6738, lng: 81.7589 },
                ].map((spot) => (
                  <button
                    key={spot.name}
                    type="button"
                    onClick={() => handleBroadcastDriverLocation({ lat: spot.lat, lng: spot.lng }, true)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 hover:text-amber-400 transition"
                  >
                    📍 {spot.name}
                  </button>
                ))}
              </div>

              {driverLocationMsg && (
                <div className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800/40">
                  {driverLocationMsg}
                </div>
              )}
            </div>

            {/* Driver Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase font-bold text-slate-400">Available In Region</div>
                  <div className="text-3xl font-black text-amber-400 mt-1">{availableRides.length}</div>
                </div>
                <div className="text-3xl">📡</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase font-bold text-slate-400">My Accepted Rides</div>
                  <div className="text-3xl font-black text-blue-400 mt-1">
                    {myDriverRides.filter((r) => r.status === 'ACCEPTED' || r.status === 'IN_TRANSIT').length}
                  </div>
                </div>
                <div className="text-3xl">🚖</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase font-bold text-slate-400">Completed Earnings</div>
                  <div className="text-3xl font-black text-emerald-400 mt-1 font-mono">
                    ₹{myDriverRides.filter((r) => r.status === 'COMPLETED').reduce((acc, r) => acc + r.fareAmount, 0)}
                  </div>
                </div>
                <div className="text-3xl">💰</div>
              </div>
            </div>

            {/* Driver Ride Feeds */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Nearby Rides */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                    Regional Passenger Radar
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Rides waiting for pickup across the region</p>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {availableRides.length === 0 ? (
                    <div className="h-44 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 text-xs">
                      No passenger requests waiting at this moment.
                    </div>
                  ) : (
                    availableRides.map((ride) => (
                      <div
                        key={ride.id}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm text-white">{ride.passengerName}</span>
                            <span className="text-[11px] text-slate-400 block">{ride.vehicleType}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-amber-400 font-mono">₹{ride.fareAmount}</span>
                            <span className="text-[10px] text-slate-500 block font-mono">{ride.distanceKm} km</span>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs">
                          <div className="text-slate-300">
                            <strong className="text-emerald-400">Pickup:</strong> {ride.pickupAddress}
                          </div>
                          <div className="text-slate-300">
                            <strong className="text-red-400">Dropoff:</strong> {ride.dropoffAddress}
                          </div>
                        </div>

                        <button
                          onClick={() => handleStatusUpdate(ride.id, 'ACCEPTED')}
                          className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          ✓ Accept This Ride (₹{ride.fareAmount})
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* My Active Driver Trips */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Your In-Progress Trips</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Trips assigned to you</p>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {myDriverRides.filter((r) => r.status === 'ACCEPTED' || r.status === 'IN_TRANSIT').length === 0 ? (
                    <div className="h-44 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 text-xs">
                      No active trips assigned. Accept a ride from the radar on the left!
                    </div>
                  ) : (
                    myDriverRides
                      .filter((r) => r.status === 'ACCEPTED' || r.status === 'IN_TRANSIT')
                      .map((ride) => (
                        <div
                          key={ride.id}
                          className="p-4 rounded-xl bg-slate-950 border border-blue-900/50 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-white text-sm">{ride.passengerName}</span>
                              <span className="text-[11px] text-slate-400 block">{ride.passengerEmail}</span>
                            </div>
                            <span className="text-xs font-bold text-blue-400 bg-blue-950/80 px-2 py-1 rounded border border-blue-800">
                              {ride.status}
                            </span>
                          </div>

                          <div className="text-xs space-y-1 text-slate-300">
                            <div><strong>From:</strong> {ride.pickupAddress}</div>
                            <div><strong>To:</strong> {ride.dropoffAddress}</div>
                            <div><strong>Fare:</strong> <span className="text-amber-400 font-mono font-bold">₹{ride.fareAmount}</span></div>
                          </div>

                          <div className="flex gap-2">
                            {ride.status === 'ACCEPTED' && (
                              <button
                                onClick={() => handleStatusUpdate(ride.id, 'IN_TRANSIT')}
                                className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer"
                              >
                                🚗 Start Trip (Picked Up)
                              </button>
                            )}
                            {ride.status === 'IN_TRANSIT' && (
                              <button
                                onClick={() => handleStatusUpdate(ride.id, 'COMPLETED')}
                                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
                              >
                                ✓ Complete Trip (Collect ₹{ride.fareAmount})
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOURISM & RESORTS TAB (Bandhavgarh Hotels + tour@sdl Wix Site) */}
        {activeTab === 'tourism' && (
          <div className="space-y-6">
            {/* Sub-navigation Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button
                  onClick={() => setTourismSubTab('hotels')}
                  className={`px-5 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                    tourismSubTab === 'hotels'
                      ? 'bg-[#d4722a] text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🐅</span> Bandhavgarh Tala Hotels (8 Luxury Resorts)
                </button>
                <button
                  onClick={() => setTourismSubTab('tour')}
                  className={`px-5 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                    tourismSubTab === 'tour'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🌿</span> tour@sdl (Wix Tour Guide)
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 pr-2">
                {tourismSubTab === 'hotels' ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#d4722a] animate-pulse"></span>
                    Viewing Bandhavgarh Jungle Lodges with 1-click cab booking
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Viewing Offline Extracted tour@sdl Wix Experience
                  </span>
                )}
              </div>
            </div>

            {/* Sub-view 1: Bandhavgarh Hotels */}
            {tourismSubTab === 'hotels' && (
              <BandhavgarhHotels onBookCabToHotel={handleBookToHotel} />
            )}

            {/* Sub-view 2: tour@sdl Wix Site */}
            {tourismSubTab === 'tour' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-slate-900 border border-emerald-800/50 shadow-xl">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🌿</span>
                      <h2 className="text-lg font-bold text-white tracking-tight">
                        tour@sdl — Explore the Natural Wonders
                      </h2>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Extracted from Wix
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Recreated offline HTML from <code className="text-amber-300 font-mono">https://sjay467.wixsite.com/tour</code> with all sections, blog posts & services.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const tala = MP_LOCATIONS.find((l) => l.name.includes('Bandhavgarh')) || MP_LOCATIONS[0];
                        handleBookToHotel({
                          name: 'Bandhavgarh National Park (tour@sdl base)',
                          address: 'Tala Gate, Bandhavgarh, Umaria, MP',
                          lat: tala.lat,
                          lng: tala.lng,
                        });
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>🚖</span> Book Cab for This Tour
                    </button>
                    <a
                      href="/tour_at_sdl.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition flex items-center gap-1.5"
                    >
                      <span>↗</span> Open Fullscreen
                    </a>
                  </div>
                </div>

                <div className="w-full bg-white rounded-2xl overflow-hidden border border-slate-800 shadow-2xl h-[82vh]">
                  <iframe
                    src="/tour_at_sdl.html"
                    title="tour@sdl - Explore the Natural Wonders"
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-5">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            <div>
              <h3 className="text-xl font-black text-white">
                {authMode === 'register' ? 'Create Account' : 'Welcome Back'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {authMode === 'register'
                  ? 'Register as a passenger or driver with secure password encryption'
                  : 'Enter your email and password to log in'}
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-lg text-xs">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Account Role</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAuthRole('passenger')}
                        className={`py-2 rounded-lg text-xs font-bold transition border ${
                          authRole === 'passenger'
                            ? 'bg-amber-500 border-amber-500 text-slate-950'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        👤 Passenger
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthRole('driver')}
                        className={`py-2 rounded-lg text-xs font-bold transition border ${
                          authRole === 'driver'
                            ? 'bg-amber-500 border-amber-500 text-slate-950'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        🚖 Driver / Rider
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ankit Tiwari"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-amber-400 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-amber-400 text-sm text-white"
                    />
                  </div>

                  {authRole === 'driver' && (
                    <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Vehicle Type</label>
                        <select
                          value={driverVehicle}
                          onChange={(e) => setDriverVehicle(e.target.value)}
                          className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                        >
                          <option value="bike">Moto Bike</option>
                          <option value="auto">Auto</option>
                          <option value="car_sedan">Sedan</option>
                          <option value="car_suv">SUV</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Plate Number</label>
                        <input
                          type="text"
                          placeholder="MP-18-AB-1234"
                          value={driverPlate}
                          onChange={(e) => setDriverPlate(e.target.value)}
                          className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-white uppercase"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-amber-400 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-amber-400 text-sm text-white"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              >
                {authLoading
                  ? 'Processing...'
                  : authMode === 'register'
                  ? 'Complete Registration'
                  : 'Sign In to Account'}
              </button>
            </form>

            <div className="text-center text-xs text-slate-400">
              {authMode === 'register' ? (
                <>
                  Already registered?{' '}
                  <button
                    onClick={() => { setAuthMode('login'); setAuthError(''); }}
                    className="text-amber-400 underline font-bold"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => { setAuthMode('register'); setAuthError(''); }}
                    className="text-amber-400 underline font-bold"
                  >
                    Register here
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        Dedicated Cab Dispatch System for Shahdol, Umaria & Anuppur Districts and Nearby Cities (Madhya Pradesh).
      </footer>
    </div>
  );
}
