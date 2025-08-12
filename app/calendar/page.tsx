'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users, DollarSign, Clock, Plus, ExternalLink, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Trip {
  _id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: string;
  interests: string[];
  itinerary: any[];
  createdAt: string;
  status: 'draft' | 'confirmed' | 'completed';
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  destination: string;
  budget: string;
  travelers: number;
  status: string;
  color: string;
  trip: Trip;
}

export default function ImprovedCalendar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<'month' | 'week'>('month');
  const [selectedTrip, setSelectedTrip] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
    fetchTrips();
  }, []);

  useEffect(() => {
    // Convert trips to calendar events when trips change
    const events: CalendarEvent[] = trips.map((trip: Trip) => ({
      id: trip._id,
      title: trip.title,
      start: new Date(trip.startDate),
      end: new Date(trip.endDate),
      destination: trip.destination,
      budget: trip.budget,
      travelers: trip.travelers,
      status: trip.status,
      color: getDestinationColor(trip.destination),
      trip: trip
    }));
    
    setCalendarEvents(events);
  }, [trips]);

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
    
    if (!token || !userData) {
      // Handle auth - redirect to login or show login state
      return;
    }
    
    setUser(JSON.parse(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsProfileDropdownOpen(false);
    router.push('/');
  };

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/trips', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const fetchedTrips = await response.json();
        setTrips(fetchedTrips);
      } else {
        console.error('Failed to fetch trips:', response.status);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDestinationColor = (destination: string) => {
    // Create a hash from the destination to consistently assign colors
    const hash = destination.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Enhanced array of vibrant colors for different destinations
    const colors = [
      '#F97316', // Orange - 1st city
      '#10B981', // Green - 2nd city
      '#3B82F6', // Blue - 3rd city
      '#8B5CF6', // Purple - 4th city
      '#EF4444', // Red - 5th city
      '#06B6D4', // Cyan - 6th city
      '#F59E0B', // Amber - 7th city
      '#EC4899', // Pink - 8th city
      '#84CC16', // Lime - 9th city
      '#6366F1', // Indigo - 10th city
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(23, 59, 59, 999);
      return date >= eventStart && date <= eventEnd;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const openTripModal = (event: CalendarEvent) => {
    setSelectedTrip(event);
    setIsModalOpen(true);
  };

  // Refresh trips when user creates a new trip
  const refreshTrips = () => {
    fetchTrips();
  };

  const handlePlanNewTrip = () => {
    router.push('/plan-trip');
  };

  const connectToGoogleCalendar = async () => {
    try {
      const response = await fetch('/api/calendar/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authUrl) {
          window.location.href = data.authUrl;
        }
      } else {
        alert('Failed to connect to Google Calendar');
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      alert('Error connecting to Google Calendar');
    }
  };

  const syncToGoogleCalendar = async () => {
    try {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ trips })
      });

      if (response.ok) {
        alert('Trips synced to Google Calendar successfully!');
      } else {
        alert('Failed to sync trips to Google Calendar');
      }
    } catch (error) {
      console.error('Error syncing to Google Calendar:', error);
      alert('Error syncing to Google Calendar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your travel calendar...</p>
        </div>
      </div>
    );
  }

  const monthDays = getDaysInMonth(currentDate);

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
                className="text-blue-600 font-medium"
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

      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Travel Calendar
                </h1>
              </div>
              <p className="text-gray-600">View and manage your planned adventures</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/profile" className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <User className="w-4 h-4 mr-2" />
                My Profile
              </Link>
                              <button 
                  onClick={handlePlanNewTrip}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Plan New Trip
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Calendar Controls */}
          <div className="flex justify-between items-center p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-3 hover:bg-white/60 rounded-xl transition-all duration-200 group"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900">{formatDate(currentDate)}</h2>
              <button
                onClick={() => navigateMonth('next')}
                className="p-3 hover:bg-white/60 rounded-xl transition-all duration-200 group"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((day, index) => {
                if (!day) {
                  return <div key={index} className="p-2 h-32 rounded-lg"></div>;
                }
                
                const dayEvents = getEventsForDate(day);
                const isToday = day.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={index}
                    className={`p-3 h-32 border-2 rounded-xl bg-white hover:bg-gray-50 transition-all duration-200 relative overflow-hidden ${
                      isToday ? 'border-blue-300 bg-blue-50 shadow-md' : 'border-gray-100'
                    }`}
                  >
                    <div className={`text-sm font-semibold mb-2 ${
                      isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          onClick={() => openTripModal(event)}
                          className="text-xs p-2 rounded-lg text-white cursor-pointer hover:opacity-90 transition-all duration-200 font-medium shadow-sm"
                          style={{ backgroundColor: event.color }}
                        >
                          <div className="truncate font-semibold">{event.title}</div>
                          <div className="flex items-center mt-1 opacity-90">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="truncate">{event.destination.split(',')[0]}</span>
                          </div>
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500 bg-gray-100 p-1 rounded text-center font-medium">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trip Statistics */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Trip Statistics</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Trips:</span>
                <span className="font-bold text-xl text-gray-900">{trips.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Confirmed:</span>
                <span className="font-bold text-xl text-green-600">
                  {trips.filter(t => t.status === 'confirmed').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Draft:</span>
                <span className="font-bold text-xl text-yellow-600">
                  {trips.filter(t => t.status === 'draft').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed:</span>
                <span className="font-bold text-xl text-gray-600">
                  {trips.filter(t => t.status === 'completed').length}
                </span>
              </div>
            </div>
          </div>

          {/* Upcoming Trips */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Upcoming Trips</h3>
            </div>
            <div className="space-y-4">
              {calendarEvents
                .filter(event => event.start >= new Date())
                .slice(0, 3)
                .map(event => (
                  <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                       onClick={() => openTripModal(event)}>
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: event.color }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 truncate">{event.title}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {event.destination} • {event.start.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              {calendarEvents.filter(event => event.start >= new Date()).length === 0 && (
                <div className="text-center py-4">
                  <div className="text-gray-400 mb-2">📅</div>
                  <p className="text-gray-500 text-sm">No upcoming trips</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Legend */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3">
                <div className="w-5 h-5 bg-white rounded-full"></div>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Status Legend</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-gray-700">Confirmed</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-medium text-gray-700">Draft</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                <span className="text-sm font-medium text-gray-700">Completed</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium text-gray-700">Other</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Details Modal */}
      {isModalOpen && selectedTrip && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div 
              className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative"
              style={{ background: `linear-gradient(135deg, ${selectedTrip.color}22, ${selectedTrip.color}44)` }}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all"
              >
                ×
              </button>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">{selectedTrip.title}</h3>
                <p className="text-white/80 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {selectedTrip.destination}
                </p>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Dates:</span>
                  <span className="font-medium">
                    {selectedTrip.start.toLocaleDateString()} - {selectedTrip.end.toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Travelers:
                  </span>
                  <span className="font-medium">{selectedTrip.travelers}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Budget:
                  </span>
                  <span className="font-medium">{selectedTrip.budget}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: selectedTrip.color }}
                  >
                    {selectedTrip.status.charAt(0).toUpperCase() + selectedTrip.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all">
                  View Details
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all">
                  Edit Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}