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

    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalTrips = await Trip.countDocuments();

    // Get popular cities
    const popularCities = await Trip.aggregate([
      { $group: { _id: '$destination', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { city: '$_id', count: 1, _id: 0 } }
    ]);

    // Get popular activities (from interests)
    const popularActivities = await Trip.aggregate([
      { $unwind: '$interests' },
      { $group: { _id: '$interests', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { activity: '$_id', count: 1, _id: 0 } }
    ]);

    // Get recent users
    const recentUsers = await User.find()
      .select('firstName lastName email createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyUserTrends = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          users: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthlyTripTrends = await Trip.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          trips: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Combine monthly trends
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrends = [];
    
    // Create a map for easy lookup
    const userTrendsMap = new Map();
    const tripTrendsMap = new Map();
    
    monthlyUserTrends.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      userTrendsMap.set(key, item.users);
    });
    
    monthlyTripTrends.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      tripTrendsMap.set(key, item.trips);
    });

    // Generate last 6 months data
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const month = monthNames[date.getMonth()];
      
      monthlyTrends.push({
        month,
        users: userTrendsMap.get(key) || 0,
        trips: tripTrendsMap.get(key) || 0
      });
    }

    return NextResponse.json({
      totalUsers,
      totalTrips,
      popularCities,
      popularActivities,
      recentUsers,
      monthlyTrends
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
