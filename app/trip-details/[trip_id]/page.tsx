'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users, DollarSign, Clock, User, Star, ArrowLeft, Edit3, Share2, Download, Heart, MessageCircle, ChevronDown } from 'lucide-react';

interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto?: string;
}

interface ActivityItem {
  name: string;
  type: string;
  timeSlot: string;
  duration: string;
  cost: string;
  notes: string;
}

interface ItineraryDay {
  day: number;
  activities: ActivityItem[];
}

interface Trip {
  _id: string;
  userId: string;
  destination: string;
  state: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: string;
  interests: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
  image: string;
  duration: number;
  totalCost: string;
  highlights: string[];
  itinerary: ItineraryDay[];
  notes: string;
  aiGeneratedPlan: string;
  createdAt: string;
  updatedAt: string;
}

export default function TripDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.trip_id as string;
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [destinationImage, setDestinationImage] = useState<string>('');
  const [activityImages, setActivityImages] = useState<{[key: string]: string}>({});
  const [loadingImages, setLoadingImages] = useState<{[key: string]: boolean}>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
    if (tripId) {
      fetchTripDetails();
    }
  }, [tripId]);

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

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsProfileDropdownOpen(false);
    router.push('/');
  };

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/trips/${tripId}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });

      if (response.ok) {
        const tripData = await response.json();
        setTrip(tripData);
        
        // Fetch destination image from Google Places API
        await fetchDestinationImage(tripData.destination, tripData.state);
      } else if (response.status === 404) {
        setError('Trip not found');
      } else {
        setError('Failed to load trip details');
      }
    } catch (error) {
      console.error('Error fetching trip details:', error);
      setError('Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch destination image from Google Places API
  const fetchDestinationImage = async (destination: string, state: string) => {
    try {
      const searchQuery = `${destination} ${state} tourism India`;
      const response = await fetch(`/api/places-image?place=${encodeURIComponent(searchQuery)}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          setDestinationImage(data.imageUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching destination image:', error);
    }
  };

  // Function to fetch activity image from Google Places API
  const fetchActivityImage = async (activityName: string, destination: string): Promise<string> => {
    try {
      const searchQuery = `${activityName} ${destination}`;
      const response = await fetch(`/api/places-image?place=${encodeURIComponent(searchQuery)}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          return data.imageUrl;
        }
      }
    } catch (error) {
      console.error('Error fetching activity image:', error);
    }
    
    // Return fallback image for activities
    return "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateDuration = () => {
    if (!trip) return 0;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const shareTrip = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `Trip to ${trip?.destination}`,
        text: `Check out this amazing trip to ${trip?.destination}!`,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const toggleDayExpansion = async (dayNumber: number) => {
    const newExpandedDay = expandedDay === dayNumber ? null : dayNumber;
    setExpandedDay(newExpandedDay);
    
    // Load activity images when expanding a day
    if (newExpandedDay !== null && trip) {
      const dayData = trip.itinerary.find(day => day.day === dayNumber);
      if (dayData) {
        for (const activity of dayData.activities) {
          const imageKey = `${dayNumber}-${activity.name}`;
          if (!activityImages[imageKey] && !loadingImages[imageKey]) {
            setLoadingImages(prev => ({ ...prev, [imageKey]: true }));
            try {
              const imageUrl = await fetchActivityImage(activity.name, trip.destination);
              setActivityImages(prev => ({
                ...prev,
                [imageKey]: imageUrl
              }));
            } catch (error) {
              console.error('Error loading activity image:', error);
            } finally {
              setLoadingImages(prev => ({ ...prev, [imageKey]: false }));
            }
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trip Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The trip you\'re looking for doesn\'t exist.'}</p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                Globe<span className="text-blue-600">trotter</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/plan-trip"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Plan Trip
              </Link>
              <Link
                href="/community"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Community
              </Link>
              <Link
                href="/calendar"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Calendar
              </Link>
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">Welcome, {user.firstName}!</span>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium"
                    >
                      {user.profilePhoto ? (
                        <img
                          src={user.profilePhoto}
                          alt="Profile"
                          className="w-6 h-6 rounded-full mr-2 object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-white text-blue-600 rounded-full mr-2 flex items-center justify-center text-sm font-bold">
                          {user.firstName?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      Profile
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          View Profile
                        </Link>
                        <Link
                          href="/my-trips"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          My Trips
                        </Link>
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30 z-10"></div>
        {!destinationImage && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center z-5">
            <div className="text-center text-blue-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm">Loading destination image...</p>
            </div>
          </div>
        )}
        <Image
          src={destinationImage || trip.image || `/destinations/${trip.destination.toLowerCase()}.jpg`}
          alt={`${trip.destination}, ${trip.state}`}
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
          }}
        />
        <div className="relative z-30 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex items-center mb-6">
              <button
                onClick={() => router.back()}
                className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all mr-4"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                  {trip.destination}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="text-lg">{trip.destination}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>{formatShortDate(trip.startDate)} - {formatShortDate(trip.endDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>{calculateDuration()} days</span>
                  </div>
                  {destinationImage && (
                    <div className="flex items-center text-xs bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                      <span>📸 Google Places</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trip Info Cards */}
      <section className="py-8 -mt-16 relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Travelers</p>
                <p className="text-xl font-bold text-gray-900">{trip.travelers}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Budget</p>
                <p className="text-xl font-bold text-gray-900">{trip.budget}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-xl font-bold text-gray-900 capitalize">{trip.status}</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-xl font-bold text-gray-900">{calculateDuration()} days</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center">
              <button
                onClick={shareTrip}
                className="flex items-center px-6 py-3 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium transition-colors"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </button>
              {user && user._id === trip.userId && (
                <Link
                  href={`/edit-trip/${trip._id}`}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors ml-4"
                >
                  <Edit3 className="w-5 h-5 mr-2" />
                  Edit Trip
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Trip Notes */}
              {trip.notes && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip Notes</h2>
                  <p className="text-gray-700 leading-relaxed">{trip.notes}</p>
                </div>
              )}

              {/* Interests/Tags */}
              {trip.interests && trip.interests.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Interests</h2>
                  <div className="flex flex-wrap gap-2">
                    {trip.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Day-wise Itinerary */}
              {trip.itinerary && trip.itinerary.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Day-wise Itinerary</h2>
                  <div className="space-y-4">
                    {trip.itinerary.map((dayItem, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleDayExpansion(dayItem.day)}
                          className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                              Day {dayItem.day}
                            </div>
                            <span className="font-medium text-gray-900">
                              {dayItem.activities.length} activities planned
                            </span>
                          </div>
                          <ChevronDown 
                            className={`w-5 h-5 text-gray-500 transition-transform ${
                              expandedDay === dayItem.day ? 'transform rotate-180' : ''
                            }`} 
                          />
                        </button>
                        
                        {expandedDay === dayItem.day && (
                          <div className="px-6 py-4 space-y-4">
                            {dayItem.activities.map((activity, actIndex) => {
                              const imageKey = `${dayItem.day}-${activity.name}`;
                              const activityImage = activityImages[imageKey];
                              const isLoadingImage = loadingImages[imageKey];
                              
                              return (
                                <div key={actIndex} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                  <div className="flex gap-4">
                                    {/* Activity Image */}
                                    <div className="flex-shrink-0">
                                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                                        {isLoadingImage ? (
                                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                          </div>
                                        ) : activityImage ? (
                                          <Image
                                            src={activityImage}
                                            alt={activity.name}
                                            width={80}
                                            height={80}
                                            className="object-cover w-full h-full"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80";
                                            }}
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                            <MapPin className="w-6 h-6 text-blue-600" />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Activity Details */}
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between mb-2">
                                        <div>
                                          <h5 className="font-semibold text-gray-900">{activity.name}</h5>
                                          <p className="text-sm text-gray-600">{activity.timeSlot}</p>
                                        </div>
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                                          {activity.type}
                                        </span>
                                      </div>
                                      {activity.notes && (
                                        <p className="text-gray-700 text-sm mb-2">{activity.notes}</p>
                                      )}
                                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                        <span className="flex items-center">
                                          <Clock className="w-4 h-4 mr-1" />
                                          {activity.duration}
                                        </span>
                                        <span className="flex items-center">
                                          <DollarSign className="w-4 h-4 mr-1" />
                                          {activity.cost}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trip Statistics */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{calculateDuration()} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date</span>
                    <span className="font-medium">{formatShortDate(trip.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">End Date</span>
                    <span className="font-medium">{formatShortDate(trip.endDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Group Size</span>
                    <span className="font-medium">{trip.travelers} travelers</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget</span>
                    <span className="font-medium capitalize">{trip.budget}</span>
                  </div>
                  {trip.totalCost && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Cost</span>
                      <span className="font-medium">{trip.totalCost}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-medium capitalize px-2 py-1 rounded-full text-xs ${
                      trip.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      trip.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {trip.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trip Highlights */}
              {trip.highlights && trip.highlights.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Highlights</h3>
                  <ul className="space-y-2">
                    {trip.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Additional Trip Info */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="font-medium">{formatShortDate(trip.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium">{formatShortDate(trip.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Activities</span>
                    <span className="font-medium">
                      {trip.itinerary?.reduce((total, day) => total + day.activities.length, 0) || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Trip</h3>
            <p className="text-gray-600 mb-4">Share this trip with friends and family</p>
            <div className="flex space-x-3">
              <button
                onClick={shareTrip}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Share
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
