'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import PageTransition from '../../components/PageTransition';
import SmoothLink from '../../components/SmoothLink';

interface Trip {
  id: string;
  destination: string;
  state: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  image: string;
  duration: number;
  travelers: number;
  budget: string;
  rating?: number;
  totalCost?: string;
  highlights?: string[];
  nextActivity?: string;
  progress?: number;
  createdAt: string;
}

const mockTrips: Trip[] = [
  {
    id: '1',
    destination: 'Goa',
    state: 'Goa',
    startDate: '2025-02-15',
    endDate: '2025-02-22',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    duration: 7,
    travelers: 2,
    budget: 'mid-range',
    createdAt: '2025-01-10',
    highlights: ['Beach Relaxation', 'Water Sports', 'Local Cuisine']
  },
  {
    id: '2',
    destination: 'Manali',
    state: 'Himachal Pradesh',
    startDate: '2025-01-20',
    endDate: '2025-01-25',
    status: 'ongoing',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    duration: 5,
    travelers: 4,
    budget: 'budget',
    progress: 60,
    nextActivity: 'Rohtang Pass Visit',
    createdAt: '2025-01-05',
    highlights: ['Mountain Trekking', 'Snow Activities', 'Adventure Sports']
  },
  {
    id: '3',
    destination: 'Kerala',
    state: 'Kerala',
    startDate: '2024-12-10',
    endDate: '2024-12-17',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    duration: 7,
    travelers: 2,
    budget: 'luxury',
    rating: 5,
    totalCost: '₹45,000',
    createdAt: '2024-11-15',
    highlights: ['Backwater Cruise', 'Ayurvedic Spa', 'Tea Plantation']
  },
  {
    id: '4',
    destination: 'Rajasthan',
    state: 'Rajasthan',
    startDate: '2024-11-05',
    endDate: '2024-11-12',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1599661046827-dacde6976549?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    duration: 7,
    travelers: 3,
    budget: 'mid-range',
    rating: 4,
    totalCost: '₹32,000',
    createdAt: '2024-10-01',
    highlights: ['Palace Tours', 'Desert Safari', 'Cultural Shows']
  },
  {
    id: '5',
    destination: 'Rishikesh',
    state: 'Uttarakhand',
    startDate: '2025-03-10',
    endDate: '2025-03-14',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    duration: 4,
    travelers: 1,
    budget: 'budget',
    createdAt: '2025-01-15',
    highlights: ['Yoga Retreat', 'River Rafting', 'Spiritual Journey']
  },
  {
    id: '6',
    destination: 'Mumbai',
    state: 'Maharashtra',
    startDate: '2024-10-15',
    endDate: '2024-10-18',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    duration: 3,
    travelers: 2,
    budget: 'mid-range',
    rating: 4,
    totalCost: '₹18,000',
    createdAt: '2024-09-20',
    highlights: ['City Exploration', 'Street Food', 'Bollywood Tour']
  }
];

export default function MyTrips() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Redirect to login if not authenticated
      router.push('/login');
    }
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return '📅';
      case 'ongoing':
        return '✈️';
      case 'completed':
        return '✅';
      default:
        return '📍';
    }
  };

  const getBudgetLabel = (budget: string) => {
    switch (budget) {
      case 'budget':
        return 'Budget';
      case 'mid-range':
        return 'Mid-range';
      case 'luxury':
        return 'Luxury';
      default:
        return budget;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredTrips = activeTab === 'all' 
    ? trips 
    : trips.filter(trip => trip.status === activeTab);

  const tripCounts = {
    all: trips.length,
    upcoming: trips.filter(t => t.status === 'upcoming').length,
    ongoing: trips.filter(t => t.status === 'ongoing').length,
    completed: trips.filter(t => t.status === 'completed').length
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <SmoothLink href="/" className="text-2xl font-bold text-gray-900">
                  Globe<span className="text-blue-600">trotter</span>
                  <span className="text-sm text-orange-500 ml-2">India</span>
                </SmoothLink>
              </div>
              <div className="flex items-center space-x-4">
                <SmoothLink
                  href="/plan-trip"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Plan Trip
                </SmoothLink>
                <SmoothLink
                  href="/"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Home
                </SmoothLink>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Welcome, {user.firstName}!</span>
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {user.firstName?.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-white animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                My Trips
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Track your travel adventures across incredible India
              </p>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="py-8 bg-white -mt-8 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center transform transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-bold text-gray-900">{tripCounts.all}</div>
                <div className="text-gray-600">Total Trips</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center transform transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-bold text-blue-600">{tripCounts.upcoming}</div>
                <div className="text-gray-600">Upcoming</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center transform transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-bold text-green-600">{tripCounts.ongoing}</div>
                <div className="text-gray-600">Ongoing</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center transform transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-bold text-gray-600">{tripCounts.completed}</div>
                <div className="text-gray-600">Completed</div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center mb-8">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {[
                  { key: 'all', label: 'All Trips', count: tripCounts.all },
                  { key: 'upcoming', label: 'Upcoming', count: tripCounts.upcoming },
                  { key: 'ongoing', label: 'Ongoing', count: tripCounts.ongoing },
                  { key: 'completed', label: 'Completed', count: tripCounts.completed }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                      activeTab === tab.key
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activeTab === tab.key
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-center mb-8">
              <SmoothLink
                href="/plan-trip"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold transform hover:scale-105 hover:shadow-lg"
              >
                ➕ Plan New Trip
              </SmoothLink>
            </div>
          </div>
        </section>

        {/* Trips Grid */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredTrips.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🧳</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  No {activeTab === 'all' ? '' : activeTab} trips found
                </h3>
                <p className="text-gray-600 mb-8">
                  {activeTab === 'all' 
                    ? "You haven't planned any trips yet. Start your adventure!"
                    : `You don't have any ${activeTab} trips.`
                  }
                </p>
                <SmoothLink
                  href="/plan-trip"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold"
                >
                  Plan Your First Trip
                </SmoothLink>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTrips.map((trip, index) => (
                  <div 
                    key={trip.id} 
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative h-48 overflow-hidden rounded-t-2xl">
                      <Image
                        src={trip.image}
                        alt={trip.destination}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                          {getStatusIcon(trip.status)} {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                        {trip.duration} days
                      </div>
                      
                      {/* Progress bar for ongoing trips */}
                      {trip.status === 'ongoing' && trip.progress && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                          <div className="flex items-center justify-between text-white text-xs mb-1">
                            <span>Progress</span>
                            <span>{trip.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-300 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${trip.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {trip.destination}
                        </h3>
                        {trip.rating && (
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < trip.rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{trip.state}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Dates:</span>
                          <span className="font-medium text-gray-900">
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Travelers:</span>
                          <span className="font-medium text-gray-900">{trip.travelers} {trip.travelers === 1 ? 'person' : 'people'}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Budget:</span>
                          <span className="font-medium text-gray-900">{getBudgetLabel(trip.budget)}</span>
                        </div>
                        
                        {trip.totalCost && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Total Cost:</span>
                            <span className="font-medium text-green-600">{trip.totalCost}</span>
                          </div>
                        )}
                        
                        {trip.status === 'upcoming' && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Starts in:</span>
                            <span className="font-medium text-blue-600">
                              {getDaysUntil(trip.startDate)} days
                            </span>
                          </div>
                        )}
                        
                        {trip.nextActivity && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Next:</span>
                            <span className="font-medium text-green-600">{trip.nextActivity}</span>
                          </div>
                        )}
                      </div>
                      
                      {trip.highlights && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {trip.highlights.slice(0, 3).map((highlight, idx) => (
                              <span 
                                key={idx}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                              >
                                {highlight}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                          View Details
                        </button>
                        {trip.status === 'upcoming' && (
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                            Edit
                          </button>
                        )}
                        {trip.status === 'completed' && !trip.rating && (
                          <button className="px-4 py-2 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors text-sm">
                            Rate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">
                  Globe<span className="text-blue-400">trotter</span>
                  <span className="text-orange-400 text-sm ml-2">India</span>
                </h3>
                <p className="text-gray-400">
                  Your personalized travel planning companion for incredible India.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">My Account</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors duration-200">My Trips</a></li>
                  <li><a href="#" className="hover:text-white transition-colors duration-200">My Itineraries</a></li>
                  <li><a href="#" className="hover:text-white transition-colors duration-200">Travel Preferences</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors duration-200">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors duration-200">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors duration-200">Travel Guide</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors duration-200">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors duration-200">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors duration-200">Careers</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Globetrotter India. All rights reserved.</p>
            </div>
          </div>
        </footer>

        <style jsx global>{`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out;
          }
        `}</style>
      </div>
    </PageTransition>
  );
}