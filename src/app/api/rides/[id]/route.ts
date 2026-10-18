import { NextResponse } from 'next/server';
import { updateRideStatus, Ride } from '@/lib/db';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, driver } = body;

    const allowedStatuses: Ride['status'][] = ['REQUESTED', 'ACCEPTED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid ride status' }, { status: 400 });
    }

    const updated = await updateRideStatus(id, status, driver);
    return NextResponse.json({
      message: `Ride status updated to ${status}`,
      ride: updated,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Failed to update ride' }, { status: 500 });
  }
}
