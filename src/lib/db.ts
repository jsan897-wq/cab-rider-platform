import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'passenger' | 'driver';
  phone?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  createdAt: string;
}

export interface Ride {
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

export interface DriverLocation {
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

interface LocalDatabase {
  users: User[];
  rides: Ride[];
  driverLocations?: DriverLocation[];
}

const dataDir = path.join(process.cwd(), 'data');
const dbFilePath = path.join(dataDir, 'database.json');

function ensureLocalDb(): LocalDatabase {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dbFilePath)) {
    const initialData: LocalDatabase = {
      users: [],
      rides: [],
    };
    fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    const fallback: LocalDatabase = { users: [], rides: [] };
    fs.writeFileSync(dbFilePath, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
}

function saveLocalDb(data: LocalDatabase) {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

// -------------------------------------------------------------
// USER OPERATIONS
// -------------------------------------------------------------

export async function getUserByEmail(email: string): Promise<User | null> {
  const normalizedEmail = email.toLowerCase().trim();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (!error && data) {
      return {
        id: String(data.id),
        name: data.name,
        email: data.email,
        passwordHash: data.password_hash,
        role: data.role,
        phone: data.phone,
        vehicleType: data.vehicle_type,
        vehicleNumber: data.vehicle_number,
        createdAt: data.created_at,
      };
    }
    return null;
  }

  const local = ensureLocalDb();
  const found = local.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  return found || null;
}

export async function createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const normalizedEmail = userData.email.toLowerCase().trim();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name: userData.name,
          email: normalizedEmail,
          password_hash: userData.passwordHash,
          role: userData.role,
          phone: userData.phone || null,
          vehicle_type: userData.vehicleType || null,
          vehicle_number: userData.vehicleNumber || null,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: String(data.id),
      name: data.name,
      email: data.email,
      passwordHash: data.password_hash,
      role: data.role,
      phone: data.phone,
      vehicleType: data.vehicle_type,
      vehicleNumber: data.vehicle_number,
      createdAt: data.created_at,
    };
  }

  const local = ensureLocalDb();
  const existing = local.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    throw new Error('A user with this email address already exists');
  }

  const newUser: User = {
    ...userData,
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: normalizedEmail,
    createdAt: new Date().toISOString(),
  };

  local.users.push(newUser);
  saveLocalDb(local);
  return newUser;
}

// -------------------------------------------------------------
// RIDE OPERATIONS
// -------------------------------------------------------------

export async function getRides(filter?: { status?: string; driverEmail?: string; passengerEmail?: string }): Promise<Ride[]> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('rides').select('*').order('created_at', { ascending: false });

    if (filter?.status) {
      query = query.eq('status', filter.status);
    }
    if (filter?.passengerEmail) {
      query = query.eq('passenger_email', filter.passengerEmail);
    }
    if (filter?.driverEmail) {
      query = query.eq('driver_email', filter.driverEmail);
    }

    const { data, error } = await query;
    if (!error && data) {
      return data.map((r) => ({
        id: String(r.id),
        passengerId: String(r.passenger_id || ''),
        passengerName: r.passenger_name,
        passengerEmail: r.passenger_email,
        pickupAddress: r.pickup_address,
        dropoffAddress: r.dropoff_address,
        distanceKm: Number(r.distance_km),
        fareAmount: Number(r.fare_amount),
        vehicleType: r.vehicle_type,
        status: r.status,
        driverId: r.driver_id ? String(r.driver_id) : undefined,
        driverName: r.driver_name,
        driverEmail: r.driver_email,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    }
    return [];
  }

  const local = ensureLocalDb();
  let rides = [...local.rides].reverse();

  if (filter?.status) {
    rides = rides.filter((r) => r.status === filter.status);
  }
  if (filter?.passengerEmail) {
    rides = rides.filter((r) => r.passengerEmail === filter.passengerEmail);
  }
  if (filter?.driverEmail) {
    rides = rides.filter((r) => r.driverEmail === filter.driverEmail);
  }

  return rides;
}

export async function createRide(rideData: Omit<Ride, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Ride> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('rides')
      .insert([
        {
          passenger_name: rideData.passengerName,
          passenger_email: rideData.passengerEmail,
          pickup_address: rideData.pickupAddress,
          dropoff_address: rideData.dropoffAddress,
          distance_km: rideData.distanceKm,
          fare_amount: rideData.fareAmount,
          vehicle_type: rideData.vehicleType,
          status: 'REQUESTED',
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: String(data.id),
      passengerId: String(data.passenger_id || ''),
      passengerName: data.passenger_name,
      passengerEmail: data.passenger_email,
      pickupAddress: data.pickup_address,
      dropoffAddress: data.dropoff_address,
      distanceKm: Number(data.distance_km),
      fareAmount: Number(data.fare_amount),
      vehicleType: data.vehicle_type,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  const local = ensureLocalDb();
  const newRide: Ride = {
    ...rideData,
    id: `ride_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    status: 'REQUESTED',
    createdAt: now,
    updatedAt: now,
  };

  local.rides.push(newRide);
  saveLocalDb(local);
  return newRide;
}

export async function updateRideStatus(
  rideId: string,
  status: Ride['status'],
  driver?: { id?: string; name: string; email: string }
): Promise<Ride> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    const updatePayload: Record<string, unknown> = {
      status,
      updated_at: now,
    };

    if (driver) {
      updatePayload.driver_name = driver.name;
      updatePayload.driver_email = driver.email;
    }

    const { data, error } = await supabase
      .from('rides')
      .update(updatePayload)
      .eq('id', rideId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: String(data.id),
      passengerId: String(data.passenger_id || ''),
      passengerName: data.passenger_name,
      passengerEmail: data.passenger_email,
      pickupAddress: data.pickup_address,
      dropoffAddress: data.dropoff_address,
      distanceKm: Number(data.distance_km),
      fareAmount: Number(data.fare_amount),
      vehicleType: data.vehicle_type,
      status: data.status,
      driverName: data.driver_name,
      driverEmail: data.driver_email,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  const local = ensureLocalDb();
  const rideIndex = local.rides.findIndex((r) => r.id === rideId);
  if (rideIndex === -1) {
    throw new Error('Ride not found');
  }

  const ride = local.rides[rideIndex];
  ride.status = status;
  ride.updatedAt = now;

  if (driver) {
    ride.driverName = driver.name;
    ride.driverEmail = driver.email;
    ride.driverId = driver.id;
  }

  local.rides[rideIndex] = ride;
  saveLocalDb(local);
  return ride;
}

export async function updateDriverLocation(
  data: Omit<DriverLocation, 'updatedAt'>
): Promise<DriverLocation> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    const { data: result, error } = await supabase
      .from('driver_locations')
      .upsert(
        {
          driver_id: data.driverId,
          driver_name: data.driverName,
          driver_email: data.driverEmail,
          vehicle_type: data.vehicleType,
          vehicle_number: data.vehicleNumber,
          lat: data.lat,
          lng: data.lng,
          is_online: data.isOnline,
          updated_at: now,
        },
        { onConflict: 'driver_email' }
      )
      .select()
      .single();

    if (error) {
      console.warn('Supabase driver location upsert failed:', error.message);
    } else if (result) {
      return {
        driverId: result.driver_id,
        driverName: result.driver_name,
        driverEmail: result.driver_email,
        vehicleType: result.vehicle_type,
        vehicleNumber: result.vehicle_number,
        lat: Number(result.lat),
        lng: Number(result.lng),
        isOnline: Boolean(result.is_online),
        updatedAt: result.updated_at,
      };
    }
  }

  const local = ensureLocalDb();
  if (!local.driverLocations) {
    local.driverLocations = [];
  }

  const existingIdx = local.driverLocations.findIndex(
    (d) => d.driverEmail.toLowerCase() === data.driverEmail.toLowerCase()
  );

  const updated: DriverLocation = {
    ...data,
    updatedAt: now,
  };

  if (existingIdx !== -1) {
    local.driverLocations[existingIdx] = updated;
  } else {
    local.driverLocations.push(updated);
  }

  saveLocalDb(local);
  return updated;
}

export async function getOnlineDrivers(): Promise<DriverLocation[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('driver_locations')
      .select('*')
      .eq('is_online', true);

    if (!error && data) {
      return data.map((d) => ({
        driverId: String(d.driver_id),
        driverName: d.driver_name,
        driverEmail: d.driver_email,
        vehicleType: d.vehicle_type,
        vehicleNumber: d.vehicle_number,
        lat: Number(d.lat),
        lng: Number(d.lng),
        isOnline: Boolean(d.is_online),
        updatedAt: d.updated_at,
      }));
    }
  }

  const local = ensureLocalDb();
  return (local.driverLocations || []).filter((d) => d.isOnline);
}

export function isUsingCloudDatabase() {
  return isSupabaseConfigured;
}

