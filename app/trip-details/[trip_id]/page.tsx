'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users, DollarSign, Clock, User, Star, ArrowLeft, Edit3, Share2, Download, Heart, MessageCircle } from 'lucide-react';

interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto?: string;
}

interface ItineraryItem {
  _id: string;
  day: number;
  time: string;
  activity: string;
  location: string;
  description?: string;
  cost?: number;
  duration?: string;
  notes?: string;
}

interface Trip {
  _id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: string;
  interests: string[];
  itinerary: ItineraryItem[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'confirmed' | 'completed';
  author: User;
  description?: string;
  totalCost?: number;
  accommodations?: string[];
  transportation?: string[];
  notes?: string;
  photos?: string[];
  rating?: number;
  reviews?: any[];
  isPublic: boolean;
  likes: string[];
  savedBy: string[];
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
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
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
        
        // Check if user has liked or saved this trip
        if (user) {
          setIsLiked(tripData.likes?.includes(user._id) || false);
          setIsSaved(tripData.savedBy?.includes(user._id) || false);
        }
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

  const toggleLike = async () => {
    if (!user || !trip) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/trips/${trip._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.isLiked);
        setTrip(prev => prev ? {
          ...prev,
          likes: data.isLiked 
            ? [...(prev.likes || []), user._id]
            : (prev.likes || []).filter(id => id !== user._id)
        } : null);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleSave = async () => {
    if (!user || !trip) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/trips/${trip._id}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.isSaved);
        setTrip(prev => prev ? {
          ...prev,
          savedBy: data.isSaved 
            ? [...(prev.savedBy || []), user._id]
            : (prev.savedBy || []).filter(id => id !== user._id)
        } : null);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
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
        title: trip?.title,
        text: `Check out this amazing trip to ${trip?.destination}!`,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
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
        <Image
          src={trip.photos?.[0] || `/destinations/${trip.destination.toLowerCase()}.jpg`}
          alt={trip.destination}
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
                  {trip.title}
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
                <Heart className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Likes</p>
                <p className="text-xl font-bold text-gray-900">{trip.likes?.length || 0}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              {user && (
                <>
                  <button
                    onClick={toggleLike}
                    className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                      isLiked 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                    {isLiked ? 'Liked' : 'Like'}
                  </button>
                  <button
                    onClick={toggleSave}
                    className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                      isSaved 
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Download className={`w-5 h-5 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                </>
              )}
              <button
                onClick={shareTrip}
                className="flex items-center px-6 py-3 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium transition-colors"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </button>
              {user && user._id === trip.author._id && (
                <Link
                  href={`/edit-trip/${trip._id}`}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors"
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
              {/* Trip Description */}
              {trip.description && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Trip</h2>
                  <p className="text-gray-700 leading-relaxed">{trip.description}</p>
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
                        #{interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Itinerary */}
              {trip.itinerary && trip.itinerary.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Itinerary</h2>
                  <div className="space-y-6">
                    {trip.itinerary.map((item, index) => (
                      <div key={item._id || index} className="border-l-4 border-blue-500 pl-6 relative">
                        <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-2 top-1"></div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">Day {item.day}</h3>
                            {item.time && (
                              <span className="text-sm text-gray-500">{item.time}</span>
                            )}
                          </div>
                          <h4 className="font-medium text-blue-600 mb-1">{item.activity}</h4>
                          <div className="flex items-center text-gray-600 text-sm mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{item.location}</span>
                          </div>
                          {item.description && (
                            <p className="text-gray-700 text-sm mb-2">{item.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {item.duration && (
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>{item.duration}</span>
                              </div>
                            )}
                            {item.cost && (
                              <div className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-1" />
                                <span>{item.cost}</span>
                              </div>
                            )}
                          </div>
                          {item.notes && (
                            <div className="mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-200">
                              <p className="text-sm text-gray-700"><strong>Note:</strong> {item.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trip Creator */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Creator</h3>
                <div className="flex items-center space-x-3">
                  {trip.author.profilePhoto ? (
                    <img
                      src={trip.author.profilePhoto}
                      alt={trip.author.firstName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {trip.author.firstName?.charAt(0).toUpperCase() || trip.author.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {trip.author.firstName} {trip.author.lastName}
                    </p>
                    <p className="text-sm text-gray-500">@{trip.author.username}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Created: {formatDate(trip.createdAt)}
                  </p>
                  {trip.updatedAt !== trip.createdAt && (
                    <p className="text-sm text-gray-600">
                      Last updated: {formatDate(trip.updatedAt)}
                    </p>
                  )}
                </div>
              </div>

              {/* Trip Stats */}
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
                    <span className="font-medium">{trip.budget}</span>
                  </div>
                  {trip.totalCost && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Cost</span>
                      <span className="font-medium">${trip.totalCost}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              {(trip.accommodations || trip.transportation || trip.notes) && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                  
                  {trip.accommodations && trip.accommodations.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Accommodations</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {trip.accommodations.map((accommodation, index) => (
                          <li key={index}>{accommodation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {trip.transportation && trip.transportation.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Transportation</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {trip.transportation.map((transport, index) => (
                          <li key={index}>{transport}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {trip.notes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                      <p className="text-sm text-gray-600">{trip.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
