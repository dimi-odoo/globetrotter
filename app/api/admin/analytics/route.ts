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

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'month';

    // Calculate date range based on timeRange
    let startDate = new Date();
    switch (timeRange) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // User Growth Analysis
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
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

    const tripGrowth = await Trip.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
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

    // Combine growth data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const growthMap = new Map();
    
    userGrowth.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      growthMap.set(key, { ...growthMap.get(key), users: item.users });
    });
    
    tripGrowth.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      growthMap.set(key, { ...growthMap.get(key), trips: item.trips });
    });

    const userGrowthData = Array.from(growthMap.entries()).map(([key, data]) => {
      const [year, month] = key.split('-');
      return {
        month: monthNames[parseInt(month) - 1],
        users: data.users || 0,
        trips: data.trips || 0
      };
    });

    // City Trends
    const cityTrends = await Trip.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$destination', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    const totalCityTrips = cityTrends.reduce((sum, city) => sum + city.count, 0);
    const cityTrendsWithPercentage = cityTrends.map(city => ({
      city: city._id,
      count: city.count,
      percentage: totalCityTrips > 0 ? Math.round((city.count / totalCityTrips) * 100) : 0
    }));

    // Activity Trends (from interests)
    const activityTrends = await Trip.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$interests' },
      { $group: { _id: '$interests', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    const totalActivitySelections = activityTrends.reduce((sum, activity) => sum + activity.count, 0);
    const activityTrendsWithPercentage = activityTrends.map(activity => ({
      activity: activity._id,
      count: activity.count,
      percentage: totalActivitySelections > 0 ? Math.round((activity.count / totalActivitySelections) * 100) : 0
    }));

    // Budget Distribution
    const budgetDistribution = await Trip.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$budget', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const totalBudgetEntries = budgetDistribution.reduce((sum, budget) => sum + budget.count, 0);
    const budgetDistributionWithPercentage = budgetDistribution.map(budget => ({
      range: budget._id || 'Not specified',
      count: budget.count,
      percentage: totalBudgetEntries > 0 ? Math.round((budget.count / totalBudgetEntries) * 100) : 0
    }));

    // Top Destinations with details
    const topDestinations = await Trip.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { destination: '$destination', state: '$state' },
          count: { $sum: 1 },
          avgDuration: { $avg: '$duration' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          destination: '$_id.destination',
          state: '$_id.state',
          count: 1,
          avgDuration: { $round: ['$avgDuration', 1] },
          _id: 0
        }
      }
    ]);

    // User Engagement Metrics
    const totalUsers = await User.countDocuments();
    const totalTrips = await Trip.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: { $ne: false } });

    const userEngagement = {
      avgTripsPerUser: totalUsers > 0 ? Number((totalTrips / totalUsers).toFixed(1)) : 0,
      activeUsers,
      totalSessions: totalUsers * 3, // Mock data - would come from analytics service
      avgSessionDuration: 12 // Mock data - would come from analytics service
    };

    return NextResponse.json({
      userGrowth: userGrowthData,
      cityTrends: cityTrendsWithPercentage,
      activityTrends: activityTrendsWithPercentage,
      budgetDistribution: budgetDistributionWithPercentage,
      topDestinations,
      userEngagement
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
  }
}
