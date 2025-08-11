'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AnalyticsData {
  userGrowth: Array<{
    month: string;
    users: number;
    trips: number;
  }>;
  cityTrends: Array<{
    city: string;
    count: number;
    percentage: number;
  }>;
  activityTrends: Array<{
    activity: string;
    count: number;
    percentage: number;
  }>;
  budgetDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  topDestinations: Array<{
    destination: string;
    state: string;
    count: number;
    avgDuration: number;
  }>;
  userEngagement: {
    avgTripsPerUser: number;
    activeUsers: number;
    totalSessions: number;
    avgSessionDuration: number;
  };
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (analytics) {
      fetchAnalytics();
    }
  }, [timeRange]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch('/api/admin/auth', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        router.push('/admin/login');
        return;
      }

      fetchAnalytics();
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/admin/login');
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">Analytics & Trends</h1>
              <Link href="/admin" className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Trends</h1>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
              <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-medium">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Avg Trips/User</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics?.userEngagement?.avgTripsPerUser?.toFixed(1) || '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics?.userEngagement?.activeUsers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Sessions</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics?.userEngagement?.totalSessions || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Avg Duration</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics?.userEngagement?.avgSessionDuration || 0}m
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">User & Trip Growth</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics?.userGrowth?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.month}</span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-900">{item.users} users</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-900">{item.trips} trips</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Destinations */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Top Destinations</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics?.topDestinations?.slice(0, 5).map((dest, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{dest.destination}</div>
                      <div className="text-xs text-gray-500">{dest.state}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{dest.count} trips</div>
                      <div className="text-xs text-gray-500">{dest.avgDuration} days avg</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* City Trends */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Popular Cities</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {analytics?.cityTrends?.slice(0, 8).map((city, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">{city.city}</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${city.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{city.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Trends */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Popular Activities</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {analytics?.activityTrends?.slice(0, 8).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">{activity.activity}</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${activity.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{activity.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Budget Distribution */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Budget Distribution</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {analytics?.budgetDistribution?.map((budget, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">{budget.range}</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${budget.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{budget.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
