import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, phone, vehicleType, vehicleNumber } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role (passenger or driver) are required' },
        { status: 400 }
      );
    }

    if (role !== 'passenger' && role !== 'driver') {
      return NextResponse.json(
        { error: 'Role must be either "passenger" or "driver"' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists' },
        { status: 409 }
      );
    }

    // Hash the password securely
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role,
      phone: phone ? phone.trim() : undefined,
      vehicleType: role === 'driver' ? vehicleType || 'car_sedan' : undefined,
      vehicleNumber: role === 'driver' ? vehicleNumber || 'UNASSIGNED' : undefined,
    });

    // Return user without password hash
    return NextResponse.json(
      {
        message: 'Account registered successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          vehicleType: user.vehicleType,
          vehicleNumber: user.vehicleNumber,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Failed to register user' }, { status: 500 });
  }
}
