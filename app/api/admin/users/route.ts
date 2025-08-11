import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Trip from '../../../../models/Trip';
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

export async function GET(request: NextRequest) {
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

    // Get all users with trip counts
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'trips',
          localField: '_id',
          foreignField: 'userId',
          as: 'trips'
        }
      },
      {
        $addFields: {
          tripCount: { $size: '$trips' },
          isActive: { $ifNull: ['$isActive', true] } // Default to true if not set
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          createdAt: 1,
          isActive: 1,
          tripCount: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    return NextResponse.json({ users });

  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
