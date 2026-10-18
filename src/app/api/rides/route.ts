import { NextResponse } from 'next/server';
import { getRides, createRide, isUsingCloudDatabase } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const passengerEmail = searchParams.get('passengerEmail') || undefined;
    const driverEmail = searchParams.get('driverEmail') || undefined;

    const rides = await getRides({ status, passengerEmail, driverEmail });
    return NextResponse.json({
      rides,
      databaseSource: isUsingCloudDatabase() ? 'Supabase PostgreSQL' : 'Local Persistent Storage',
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Failed to fetch rides' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      passengerId,
      passengerName,
      passengerEmail,
      pickupAddress,
      dropoffAddress,
      distanceKm,
      fareAmount,
      vehicleType,
    } = body;

    if (!passengerName || !passengerEmail || !pickupAddress || !dropoffAddress || !distanceKm || !fareAmount) {
      return NextResponse.json({ error: 'Missing required ride booking details' }, { status: 400 });
    }

    const ride = await createRide({
      passengerId: passengerId || 'anon',
      passengerName,
      passengerEmail,
      pickupAddress,
      dropoffAddress,
      distanceKm: Number(distanceKm),
      fareAmount: Number(fareAmount),
      vehicleType: vehicleType || 'Cab Sedan',
    });

    return NextResponse.json(
      {
        message: 'Ride requested successfully',
        ride,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Failed to request ride' }, { status: 500 });
  }
}
