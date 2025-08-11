import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    await connectToDatabase();
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const body = await request.json();
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    const { password, _id, createdAt, username, email, ...updateData } = body;
    
    // Filter out undefined and null values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined && value !== null)
    );
    
    await connectToDatabase();
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: cleanUpdateData },
      { new: true, runValidators: false } // Turn off validators for partial updates
    ).select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user 
    });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error.message 
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
