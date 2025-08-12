import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { token } = await request.json();

    console.log('Verifying token:', token); // Debug log

    if (!token) {
      console.log('No token provided'); // Debug log
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Check if token exists and is not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    console.log('User found:', user ? 'Yes' : 'No'); // Debug log
    if (user) {
      console.log('User email:', user.email); // Debug log
      console.log('Token expiry:', user.resetPasswordExpires); // Debug log
      console.log('Current time:', new Date()); // Debug log
    }

    if (!user) {
      console.log('Token validation failed - no user found or token expired'); // Debug log
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    console.log('Token validation successful'); // Debug log
    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}