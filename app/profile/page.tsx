'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  country: string;
  occupation: string;
  avatar: string;
  createdAt: string;
}

interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'completed' | 'cancelled';
  image: string;
  rating?: number;
  budget: number;
  participants: number;
  description: string;
  activities: string[];
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [plannedTrips, setPlannedTrips] = useState<Trip[]>([]);
  const [previousTrips, setPreviousTrips] = useState<Trip[]>([]);
  const [activeTab, setActiveTab] = useState<'planned' | 'previous'>('planned');
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Mock data for demonstration
  const mockPlannedTrips: Trip[] = [
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
  ];

  const mockPreviousTrips: Trip[] = [
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
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData(parsedUser);
      
      // Fetch trips from API
      fetchTrips();
    } else {
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await fetch('/api/user/trips');
      if (response.ok) {
        const data = await response.json();
        setPlannedTrips(data.plannedTrips || []);
        setPreviousTrips(data.previousTrips || []);
      } else {
        // Fallback to mock data if API fails
        setPlannedTrips(mockPlannedTrips);
        setPreviousTrips(mockPreviousTrips);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      // Fallback to mock data
      setPlannedTrips(mockPlannedTrips);
      setPreviousTrips(mockPreviousTrips);
    }
  };

  const handleEditClick = (field: string) => {
    setEditingField(field);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!user || !editingField) return;

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsEditing(false);
        setEditingField(null);
        setSaveMessage('Profile updated successfully!');
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        console.error('Failed to update profile');
        setSaveMessage('Failed to update profile. Please try again.');
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancelEdit = () => {
    setFormData(user || {});
    setIsEditing(false);
    setEditingField(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = async () => {
    // Generate a new random avatar
    const avatarOptions = [
      'avataaars', 'big-smile', 'bottts', 'fun-emoji', 'identicon', 
      'initials', 'lorelei', 'micah', 'miniavs', 'open-peeps'
    ];
    const randomStyle = avatarOptions[Math.floor(Math.random() * avatarOptions.length)];
    const randomSeed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${randomSeed}`;
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatar: newAvatar }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  };

  const handleTripAction = async (tripId: string, action: 'edit' | 'cancel' | 'view' | 'book-again') => {
    switch (action) {
      case 'edit':
        // Navigate to edit trip page
        router.push(`/plan-trip?edit=${tripId}`);
        break;
      case 'cancel':
        if (confirm('Are you sure you want to cancel this trip?')) {
          try {
            const response = await fetch(`/api/user/trips?tripId=${tripId}`, {
              method: 'DELETE',
            });
            if (response.ok) {
              await fetchTrips(); // Refresh trips
            }
          } catch (error) {
            console.error('Error cancelling trip:', error);
          }
        }
        break;
      case 'view':
        router.push(`/trips/${tripId}`);
        break;
      case 'book-again':
        router.push(`/plan-trip?template=${tripId}`);
        break;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsProfileDropdownOpen(false);
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderEditableField = (field: string, label: string, value: string, type: string = 'text') => {
    const isCurrentlyEditing = editingField === field && isEditing;

    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {isCurrentlyEditing ? (
              <div className="space-y-2">
                {type === 'select' && field === 'gender' ? (
                  <select
                    value={formData[field as keyof User] || value}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                ) : (
                  <input
                    type={type}
                    value={formData[field as keyof User] || value}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <p className="text-gray-900">{value || 'Not specified'}</p>
                <button
                  onClick={() => handleEditClick(field)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                Globe<span className="text-blue-600">trotter</span>
              </Link>
            </div>
            <nav className="flex items-center space-x-6">
              {/* <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link> */}
              <Link href="/plan-trip" className="text-gray-600 hover:text-gray-900">Plan Trip</Link>
              <Link href="/my-trips" className="text-gray-600 hover:text-gray-900">My Trips</Link>
              
              {user && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center text-blue-600 font-medium hover:text-blue-800"
                  >
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    Profile
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        📊 Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        👤 View Profile
                      </Link>
                      <Link
                        href="/my-trips"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        ✈️ My Trips
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {saveMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800">{saveMessage}</span>
            </div>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <img
                src={user.avatar}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-blue-100"
              />
              <button 
                onClick={handleAvatarChange}
                className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.fullName}</h1>
              <p className="text-gray-600 mb-4">{user.email}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span>📍 {user.city}, {user.country}</span>
                <span>💼 {user.occupation}</span>
                <span>📅 Member since {formatDate(user.createdAt)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleAvatarChange}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Change Avatar
              </button>
              <Link
                href="/plan-trip"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium"
              >
                Plan New Trip
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                {isEditing && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-orange-600">Editing...</span>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {renderEditableField('fullName', 'Full Name', user.fullName)}
                {renderEditableField('email', 'Email', user.email, 'email')}
                {renderEditableField('phone', 'Phone', user.phone, 'tel')}
                {renderEditableField('dateOfBirth', 'Date of Birth', user.dateOfBirth, 'date')}
                {renderEditableField('gender', 'Gender', user.gender, 'select')}
                {renderEditableField('address', 'Address', user.address)}
                {renderEditableField('city', 'City', user.city)}
                {renderEditableField('country', 'Country', user.country)}
                {renderEditableField('occupation', 'Occupation', user.occupation)}
              </div>
            </div>
          </div>

          {/* Trips Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Trips</h2>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('planned')}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      activeTab === 'planned'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Planned Trips ({plannedTrips.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('previous')}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      activeTab === 'previous'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Previous Trips ({previousTrips.length})
                  </button>
                </div>
              </div>

              {/* Planned Trips */}
              {activeTab === 'planned' && (
                <div className="space-y-4">
                  {plannedTrips.length > 0 ? (
                    plannedTrips.map((trip) => (
                      <div key={trip.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="text-4xl">{trip.image}</div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">{trip.destination}</h3>
                              <p className="text-gray-600 mb-3">{trip.description}</p>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                                <span>📅 {formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                                <span>💰 ${trip.budget}</span>
                                <span>👥 {trip.participants} participant{trip.participants > 1 ? 's' : ''}</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {trip.activities.map((activity, index) => (
                                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                    {activity}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleTripAction(trip.id, 'edit')}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                            >
                              Edit Trip
                            </button>
                            <button 
                              onClick={() => handleTripAction(trip.id, 'cancel')}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">✈️</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No planned trips yet</h3>
                      <p className="text-gray-600 mb-6">Start planning your next adventure!</p>
                      <Link
                        href="/plan-trip"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Plan Your First Trip
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Previous Trips */}
              {activeTab === 'previous' && (
                <div className="space-y-4">
                  {previousTrips.length > 0 ? (
                    previousTrips.map((trip) => (
                      <div key={trip.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="text-4xl">{trip.image}</div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">{trip.destination}</h3>
                              <p className="text-gray-600 mb-3">{trip.description}</p>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                                <span>📅 {formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                                <span>💰 ${trip.budget}</span>
                                <span>👥 {trip.participants} participant{trip.participants > 1 ? 's' : ''}</span>
                              </div>
                              {trip.rating && (
                                <div className="flex items-center mb-3">
                                  <span className="text-sm text-gray-600 mr-2">Your rating:</span>
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <svg
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < trip.rating! ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div className="flex flex-wrap gap-2">
                                {trip.activities.map((activity, index) => (
                                  <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                    {activity}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleTripAction(trip.id, 'view')}
                              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                            >
                              View Details
                            </button>
                            <button 
                              onClick={() => handleTripAction(trip.id, 'book-again')}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                            >
                              Book Again
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📚</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No previous trips</h3>
                      <p className="text-gray-600 mb-6">Your travel history will appear here after you complete trips.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
