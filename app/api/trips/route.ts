import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Trip from '../../../models/Trip';
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

// GET - Fetch all trips for a user
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trips = await Trip.find({ userId }).sort({ createdAt: -1 });
    
    return NextResponse.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
  }
}

// POST - Create a new trip
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      destination,
      state,
      startDate,
      endDate,
      travelers,
      budget,
      interests,
      image,
      highlights,
      itinerary,
      notes,
      aiGeneratedPlan
    } = body;

    // Calculate duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // Create new trip
    const trip = new Trip({
      userId,
      destination,
      state,
      startDate: start,
      endDate: end,
      travelers,
      budget,
      interests: interests || [],
      image: image || '',
      duration,
      highlights: highlights || [],
      itinerary: itinerary || [],
      notes: notes || '',
      aiGeneratedPlan: aiGeneratedPlan || ''
    });

    const savedTrip = await trip.save();
    
    return NextResponse.json(savedTrip, { status: 201 });
  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
  }
}
