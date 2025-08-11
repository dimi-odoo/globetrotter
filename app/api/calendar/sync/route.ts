import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';

// Initialize Google Calendar API with API key (for public calendar access)
const calendar = google.calendar({ version: 'v3', auth: process.env.GOOGLE_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { trips } = await request.json();
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      await dbConnect();
      
      // For this demo, we'll create a simple calendar view without OAuth
      // In a production app, you would use OAuth tokens to create actual Google Calendar events
      
      const calendarEvents = trips.map((trip: any) => ({
        summary: `${trip.title} - ${trip.destination}`,
        description: `Travel to ${trip.destination}\nBudget: ${trip.budget}\nTravelers: ${trip.travelers}\nStatus: ${trip.status}`,
        start: {
          date: new Date(trip.startDate).toISOString().split('T')[0],
          timeZone: 'UTC'
        },
        end: {
          date: new Date(trip.endDate).toISOString().split('T')[0],
          timeZone: 'UTC'
        },
        location: trip.destination,
        colorId: getColorId(trip.status)
      }));

      // Log the events that would be created (for demo purposes)
      console.log('Calendar events that would be synced:', calendarEvents);

      return NextResponse.json({ 
        success: true, 
        message: `${calendarEvents.length} trips ready to sync to Google Calendar`,
        events: calendarEvents
      });

    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

  } catch (error) {
    console.error('Error syncing to Google Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to sync to Google Calendar' },
      { status: 500 }
    );
  }
}

function getColorId(status: string): string {
  switch (status) {
    case 'confirmed': return '10'; // Green
    case 'completed': return '8';  // Gray
    case 'draft': return '5';      // Yellow
    default: return '1';           // Blue
  }
}
