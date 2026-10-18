import { NextResponse } from 'next/server';
import { getOnlineDrivers, updateDriverLocation } from '@/lib/db';

export async function GET() {
  try {
    const drivers = await getOnlineDrivers();
    return NextResponse.json({ drivers });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Failed to fetch driver locations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { driverId, driverName, driverEmail, vehicleType, vehicleNumber, lat, lng, isOnline } = body;

    if (!driverEmail || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: 'Driver email, lat, and lng are required' }, { status: 400 });
    }

    const updated = await updateDriverLocation({
      driverId: driverId || 'driver_anon',
      driverName: driverName || 'Driver',
      driverEmail,
      vehicleType: vehicleType || 'car_sedan',
      vehicleNumber: vehicleNumber || 'MP-18',
      lat: Number(lat),
      lng: Number(lng),
      isOnline: isOnline !== undefined ? Boolean(isOnline) : true,
    });

    return NextResponse.json({
      message: 'Driver location updated successfully',
      driverLocation: updated,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Failed to update location' }, { status: 500 });
  }
}
