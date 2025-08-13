'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

function MyTripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [tripImages, setTripImages] = useState({});
  const [loadingImages, setLoadingImages] = useState({});
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Fetch trips
    fetchTrips();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsProfileDropdownOpen(false);
    router.push('/');
  };

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view your trips');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/trips', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }

      const trips = await response.json();
      console.log('Fetched trips:', trips);
      setTrips(trips || []);
      
      // Fetch images for each trip
      fetchTripImages(trips || []);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch destination images for all trips
  const fetchTripImages = async (tripsData) => {
    for (const trip of tripsData) {
      const imageKey = trip._id;
      if (!tripImages[imageKey] && !loadingImages[imageKey]) {
        setLoadingImages(prev => ({ ...prev, [imageKey]: true }));
        try {
          const imageUrl = await fetchDestinationImage(trip.destination, trip.state);
          setTripImages(prev => ({
            ...prev,
            [imageKey]: imageUrl
          }));
        } catch (error) {
          console.error('Error loading trip image:', error);
        } finally {
          setLoadingImages(prev => ({ ...prev, [imageKey]: false }));
        }
      }
    }
  };

  // Function to fetch destination image from Google Places API
  const fetchDestinationImage = async (destination, state) => {
    try {
      const searchQuery = `${destination} ${state} tourism India`;
      const response = await fetch(`/api/places-image?place=${encodeURIComponent(searchQuery)}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          return data.imageUrl;
        }
      }
    } catch (error) {
      console.error('Error fetching destination image:', error);
    }
    
    // Return fallback image
    return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
  };

  // Function to retry loading an image for a specific trip
  const retryImageLoad = async (tripId, destination, state) => {
    setLoadingImages(prev => ({ ...prev, [tripId]: true }));
    try {
      const imageUrl = await fetchDestinationImage(destination, state);
      setTripImages(prev => ({
        ...prev,
        [tripId]: imageUrl
      }));
    } catch (error) {
      console.error('Error retrying image load:', error);
    } finally {
      setLoadingImages(prev => ({ ...prev, [tripId]: false }));
    }
  };

  const deleteTrip = async (tripId) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setTrips(trips.filter(trip => trip._id !== tripId));
        alert('Trip deleted successfully!');
      }
    } catch (err) {
      console.error('Error deleting trip:', err);
      alert('Failed to delete trip');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">Welcome, {user.firstName}!</span>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium"
                    >
                      <img
                        src={user.profilePhoto}
                        alt="Profile"
                        className="w-6 h-6 rounded-full mr-2"
                      />
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
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 bg-blue-50"
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your trips...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-800 mb-2">Access Denied</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Link 
                href="/login"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">My Trips</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {trips.length === 0 
                  ? 'Ready to explore the world? Start planning your next adventure!' 
                  : `You have ${trips.length} amazing trip${trips.length !== 1 ? 's' : ''} planned`
                }
              </p>
            </div>

            {trips.length === 0 ? (
              /* Empty State */
              <div className="text-center py-20">
                <div className="bg-white rounded-2xl shadow-lg p-12 max-w-lg mx-auto">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">No trips yet!</h3>
                  <p className="text-gray-600 mb-8">
                    Start planning your next adventure and create your first trip. Discover amazing destinations and create unforgettable memories.
                  </p>
                  <Link
                    href="/plan-trip"
                    className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold shadow-lg"
                  >
                    Plan Your First Trip
                  </Link>
                </div>
              </div>
            ) : (
              /* Trips Grid */
              <>
                {/* Trip Summary Header */}
                <div className="mb-8 p-6 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Travel Adventures</h2>
                      <p className="text-gray-600">
                        {trips.length} {trips.length === 1 ? 'trip' : 'trips'} planned
                        {Object.keys(loadingImages).filter(key => loadingImages[key]).length > 0 && (
                          <span className="ml-2 text-sm text-blue-600">
                            • Loading {Object.keys(loadingImages).filter(key => loadingImages[key]).length} destination {Object.keys(loadingImages).filter(key => loadingImages[key]).length === 1 ? 'image' : 'images'}...
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Powered by</div>
                      <div className="flex items-center text-blue-600 text-sm font-medium">
                        📸 Google Places API
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {trips.map((trip) => {
                    const tripImage = tripImages[trip._id];
                    const isLoadingImage = loadingImages[trip._id];
                    
                    return (
                      <div
                        key={trip._id}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        {/* Destination Image */}
                        <div className="relative h-48 overflow-hidden">
                          {isLoadingImage ? (
                            <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                              <div className="text-center text-gray-500">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-sm">Loading {trip.destination} image...</p>
                              </div>
                            </div>
                          ) : tripImage ? (
                            <Image
                              src={tripImage}
                              alt={`${trip.destination}, ${trip.state}`}
                              fill
                              className="object-cover hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              onError={(e) => {
                                const target = e.target;
                                target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center group cursor-pointer"
                                 onClick={() => retryImageLoad(trip._id, trip.destination, trip.state)}>
                              <div className="text-center text-white">
                                <svg className="w-12 h-12 mx-auto mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <p className="text-sm font-medium">{trip.destination}</p>
                                <p className="text-xs opacity-75 mt-1">Click to load image</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Overlay with basic trip info */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                            <div className="p-4 text-white w-full">
                              <div className="flex justify-between items-end">
                                <div>
                                  <h3 className="text-xl font-bold truncate">{trip.destination}</h3>
                                  {trip.state && (
                                    <p className="text-sm text-gray-200">{trip.state}, India</p>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  {/* Trip Status Badge */}
                                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    trip.status === 'upcoming' ? 'bg-blue-500 text-white' :
                                    trip.status === 'ongoing' ? 'bg-green-500 text-white' :
                                    'bg-gray-500 text-white'
                                  }`}>
                                    {trip.status || 'upcoming'}
                                  </div>
                                  {/* Duration Badge */}
                                  <div className="flex items-center text-gray-700 bg-white bg-opacity-20 rounded-full px-3 py-1 backdrop-blur-sm">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-xs font-medium">{trip.duration} days</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Google Places badge */}
                          {tripImage && (
                            <div className="absolute top-3 right-3 bg-white bg-opacity-80 backdrop-blur-sm text-xs px-2 py-1 rounded-full text-gray-700">
                              📸 Google Places
                            </div>
                          )}
                        </div>

                      {/* Trip Details */}
                      <div className="p-6">
                        <div className="space-y-4 mb-6">
                          <div className="flex items-center text-gray-600">
                            <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium">Travel Dates</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-gray-600">
                            <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium">Travelers</p>
                              <p className="text-sm text-gray-500">
                                {trip.travelers} {trip.travelers === 1 ? 'person' : 'people'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Highlights */}
                        {trip.highlights && trip.highlights.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                              <svg className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Trip Highlights
                            </h4>
                            <div className="space-y-2">
                              {trip.highlights.slice(0, 3).map((highlight, idx) => (
                                <div key={idx} className="flex items-start">
                                  <span className="text-blue-500 mr-2 mt-1">•</span>
                                  <span className="text-sm text-gray-600">{highlight}</span>
                                </div>
                              ))}
                              {trip.highlights.length > 3 && (
                                <div className="text-xs text-gray-500 ml-4">
                                  +{trip.highlights.length - 3} more highlights
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Link
                            href={`/trip-details/${trip._id}`}
                            className="flex-1 bg-blue-50 text-blue-600 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors text-center text-sm font-medium flex items-center justify-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                          </Link>
                          <button
                            onClick={() => deleteTrip(trip._id)}
                            className="bg-red-50 text-red-600 px-4 py-3 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>

                {/* Add New Trip Section */}
                <div className="text-center mt-16 pt-12 border-t border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready for your next adventure?</h3>
                  <p className="text-gray-600 mb-6">Discover new destinations and create more unforgettable memories.</p>
                  <Link
                    href="/plan-trip"
                    className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold shadow-lg"
                  >
                    Plan Another Trip
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MyTripsPage;
