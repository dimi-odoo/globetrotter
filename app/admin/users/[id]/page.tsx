'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
  city: string;
  country: string;
  occupation?: string;
  description: string;
  profilePhoto: string;
  isActive: boolean;
  createdAt: string;
  tripCount: number;
}

interface Trip {
  _id: string;
  destination: string;
  state?: string;
  startDate: string;
  endDate: string;
  duration: number;
  travelers: number;
  budget: string;
  interests: string[];
  createdAt: string;
}

export default function UserDetail({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

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

      fetchUserDetails();
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/admin/login');
    }
  };

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      setUser(data.user);
      setTrips(data.trips);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${params.id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      if (response.ok) {
        setUser(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const deleteUser = async () => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('User deleted successfully');
        router.push('/admin/users');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
              <Link href="/admin/users" className="text-blue-600 hover:text-blue-800">
                ← Back to Users
              </Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading user details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
              <Link href="/admin/users" className="text-blue-600 hover:text-blue-800">
                ← Back to Users
              </Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600">{error || 'User not found'}</p>
            </div>
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
            <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
            <Link href="/admin/users" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Back to Users
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-white text-center">
                <img
                  src={user.profilePhoto}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white"
                />
                <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
                <p className="text-blue-100">@{user.username}</p>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full mt-2 ${
                  user.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Profile Details */}
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-sm text-gray-900">{user.phoneNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-sm text-gray-900">{user.city}, {user.country}</p>
                </div>
                {user.occupation && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Occupation</label>
                    <p className="text-sm text-gray-900">{user.occupation}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Joined</label>
                  <p className="text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Trips</label>
                  <p className="text-sm text-gray-900">{user.tripCount}</p>
                </div>
                {user.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-sm text-gray-900">{user.description}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t">
                <div className="flex space-x-3">
                  <button
                    onClick={toggleUserStatus}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md ${
                      user.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={deleteUser}
                    className="flex-1 bg-red-600 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-red-700"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* User's Trips */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Trip History ({trips.length})
                </h3>
              </div>
              
              {trips.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No trips yet</h3>
                  <p className="mt-1 text-sm text-gray-500">This user hasn't planned any trips.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {trips.map((trip) => (
                    <div key={trip._id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">
                            {trip.destination}
                            {trip.state && <span className="text-gray-500">, {trip.state}</span>}
                          </h4>
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                            <div>
                              <span className="font-medium">Duration:</span> {trip.duration} days
                            </div>
                            <div>
                              <span className="font-medium">Travelers:</span> {trip.travelers}
                            </div>
                            <div>
                              <span className="font-medium">Budget:</span> {trip.budget}
                            </div>
                            <div>
                              <span className="font-medium">Created:</span> {new Date(trip.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="font-medium text-sm text-gray-500">Dates:</span>
                            <span className="text-sm text-gray-600 ml-1">
                              {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          {trip.interests && trip.interests.length > 0 && (
                            <div className="mt-2">
                              <span className="font-medium text-sm text-gray-500">Interests:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {trip.interests.map((interest, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                                  >
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
