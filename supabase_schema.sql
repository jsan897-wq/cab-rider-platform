-- ============================================================
-- CAB RIDER (UBER/OLA CLONE) SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor (supabase.com -> SQL Editor)
-- ============================================================

-- 1. Create Users Table (Passengers and Drivers)
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('passenger', 'driver')),
  phone TEXT,
  vehicle_type TEXT,        -- 'bike', 'auto', 'car_sedan', 'car_suv'
  vehicle_number TEXT,      -- e.g. 'KA-01-AB-1234'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Rides Table
CREATE TABLE IF NOT EXISTS rides (
  id BIGSERIAL PRIMARY KEY,
  passenger_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  passenger_name TEXT NOT NULL,
  passenger_email TEXT NOT NULL,
  pickup_address TEXT NOT NULL,
  dropoff_address TEXT NOT NULL,
  distance_km NUMERIC(5,2) NOT NULL,
  fare_amount NUMERIC(8,2) NOT NULL,
  vehicle_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'ACCEPTED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED')),
  driver_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  driver_name TEXT,
  driver_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Driver Locations Table for Live GPS Tracking
CREATE TABLE IF NOT EXISTS driver_locations (
  driver_id TEXT,
  driver_name TEXT NOT NULL,
  driver_email TEXT PRIMARY KEY,
  vehicle_type TEXT NOT NULL,
  vehicle_number TEXT,
  lat NUMERIC(9,6) NOT NULL,
  lng NUMERIC(9,6) NOT NULL,
  is_online BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Realtime on rides and driver_locations for instant GPS updates
ALTER PUBLICATION supabase_realtime ADD TABLE rides;
ALTER PUBLICATION supabase_realtime ADD TABLE driver_locations;

-- 5. Enable Row Level Security (RLS) or public access for API
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write for demo" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write for demo" ON rides FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write for demo" ON driver_locations FOR ALL USING (true) WITH CHECK (true);
