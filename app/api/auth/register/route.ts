import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      city,
      country,
      description,
      profilePhoto
    } = body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      city,
      country,
      description,
      profilePhoto
    });

    await user.save();

    // Remove password from response
    const { password: _, ...userResponse } = user.toObject();

    return NextResponse.json(
      { message: 'User registered successfully', user: userResponse },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 400 }
      );
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: errors.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
