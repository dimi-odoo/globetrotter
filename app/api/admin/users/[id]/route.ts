import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import Trip from '../../../../../models/Trip';
import jwt from 'jsonwebtoken';

// Helper function to verify admin JWT token
function verifyAdminToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    return decoded.role === 'admin' ? decoded : null;
  } catch (error) {
    return null;
  }
}

// GET single user details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyAdminToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const userId = params.id;

    // Get user with trip details
    const user = await User.findById(userId).select('-password').lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's trips
    const trips = await Trip.find({ userId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      user: {
        ...user,
        tripCount: trips.length
      },
      trips
    });

  } catch (error) {
    console.error('Get user details error:', error);
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyAdminToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const userId = params.id;

    // Delete user's trips first
    await Trip.deleteMany({ userId });

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'User and associated trips deleted successfully' 
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
