import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Mock data - In a real application, this would come from a database
const mockTripsData = {
  planned: [
    {
      id: '1',
      destination: 'Tokyo, Japan',
      startDate: '2025-09-15',
      endDate: '2025-09-22',
      status: 'planned',
      image: '🏯',
      budget: 3500,
      participants: 2,
      description: 'Exploring the vibrant culture of Tokyo with visits to temples, modern districts, and authentic cuisine.',
      activities: ['Temple visits', 'Sushi making class', 'Mount Fuji day trip', 'Shopping in Shibuya']
    },
    {
      id: '2',
      destination: 'Paris, France',
      startDate: '2025-12-10',
      endDate: '2025-12-17',
      status: 'planned',
      image: '🗼',
      budget: 2800,
      participants: 1,
      description: 'A romantic winter getaway exploring the City of Light during the holiday season.',
      activities: ['Eiffel Tower visit', 'Louvre Museum', 'Seine River cruise', 'Christmas markets']
    }
  ],
  previous: [
    {
      id: '3',
      destination: 'Bali, Indonesia',
      startDate: '2025-06-01',
      endDate: '2025-06-10',
      status: 'completed',
      image: '🏝️',
      rating: 5,
      budget: 2200,
      participants: 3,
      description: 'Amazing tropical adventure with beautiful beaches, temples, and rice terraces.',
      activities: ['Beach relaxation', 'Temple hopping', 'Rice terrace tour', 'Balinese cooking class']
    },
    {
      id: '4',
      destination: 'New York, USA',
      startDate: '2025-03-20',
      endDate: '2025-03-25',
      status: 'completed',
      image: '🗽',
      rating: 4,
      budget: 1800,
      participants: 1,
      description: 'Urban exploration of the Big Apple with Broadway shows and iconic landmarks.',
      activities: ['Broadway show', 'Central Park', 'Statue of Liberty', 'Metropolitan Museum']
    },
    {
      id: '5',
      destination: 'Iceland',
      startDate: '2025-01-15',
      endDate: '2025-01-22',
      status: 'completed',
      image: '🏔️',
      rating: 5,
      budget: 3200,
      participants: 2,
      description: 'Winter wonderland adventure with Northern Lights and stunning landscapes.',
      activities: ['Northern Lights viewing', 'Blue Lagoon', 'Glacier hiking', 'Ice caves exploration']
    }
  ]
};

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'planned' or 'previous'
    
    await connectToDatabase();
    
    // In a real application, you would fetch trips from the database
    // const trips = await Trip.find({ userId: decoded.userId, status: type });
    
    // For now, return mock data
    if (type === 'planned') {
      return NextResponse.json({ trips: mockTripsData.planned });
    } else if (type === 'previous') {
      return NextResponse.json({ trips: mockTripsData.previous });
    } else {
      return NextResponse.json({ 
        plannedTrips: mockTripsData.planned,
        previousTrips: mockTripsData.previous 
      });
    }
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const body = await request.json();
    
    await connectToDatabase();
    
    // In a real application, you would create a new trip in the database
    // const newTrip = new Trip({
    //   ...body,
    //   userId: decoded.userId,
    //   createdAt: new Date()
    // });
    // await newTrip.save();
    
    return NextResponse.json({ 
      message: 'Trip created successfully',
      trip: { ...body, id: Date.now().toString() }
    });
  } catch (error) {
    console.error('Error creating trip:', error);
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
    const { tripId, ...updateData } = body;
    
    await connectToDatabase();
    
    // In a real application, you would update the trip in the database
    // const trip = await Trip.findOneAndUpdate(
    //   { _id: tripId, userId: decoded.userId },
    //   { $set: updateData },
    //   { new: true }
    // );
    
    return NextResponse.json({ 
      message: 'Trip updated successfully',
      trip: { ...updateData, id: tripId }
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId');
    
    if (!tripId) {
      return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
    }
    
    await connectToDatabase();
    
    // In a real application, you would delete the trip from the database
    // await Trip.findOneAndDelete({ _id: tripId, userId: decoded.userId });
    
    return NextResponse.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
