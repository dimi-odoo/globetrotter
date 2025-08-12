import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Trip from '../../../../models/Trip';
import jwt from 'jsonwebtoken';

// Helper function to verify JWT token
function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
  } catch (error) {
    return null;
  }
}

// Helper function to get user ID from request
function getUserIdFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  return decoded ? (decoded as any).userId : null;
}

// GET - Fetch a specific trip
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const userId = getUserIdFromRequest(request);
    
    // Find the trip
    const trip = await Trip.findById(params.id);
    
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }
    
    // For now, only allow owners to view trips (can be expanded later for public trips)
    if (!userId || trip.userId !== userId) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }
    
    // Create a mock author object (can be enhanced to fetch real user data)
    const response = {
      ...trip.toObject(),
      title: trip.destination, // Use destination as title for now
      author: {
        _id: trip.userId,
        username: 'user' + trip.userId.slice(-4),
        firstName: 'User',
        lastName: 'Name',
        email: 'user@example.com'
      },
      likes: [],
      savedBy: [],
      isPublic: false
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json({ error: 'Failed to fetch trip' }, { status: 500 });
  }
}

// PUT - Update a trip
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Update the trip
    const trip = await Trip.findOneAndUpdate(
      { _id: params.id, userId },
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }
    
    return NextResponse.json(trip);
  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 });
  }
}

// DELETE - Delete a trip
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trip = await Trip.findOneAndDelete({ _id: params.id, userId });
    
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 });
  }
}
