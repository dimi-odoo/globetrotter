'use client';

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [user, setUser] = useState<any>(null);
  const citiesScrollRef = useRef<HTMLDivElement>(null);
  const tripsScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    const scrollContainer = (ref: React.RefObject<HTMLDivElement>, speed: number = 1) => {
      if (!ref.current) return;
      
      const container = ref.current;
      let scrollAmount = 0;
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      const scroll = () => {
        if (scrollAmount >= maxScroll) {
          scrollAmount = 0;
        } else {
          scrollAmount += speed;
        }
        container.scrollLeft = scrollAmount;
      };
      
      const interval = setInterval(scroll, 50);
      return interval;
    };

    const citiesInterval = scrollContainer(citiesScrollRef, 1);
    const tripsInterval = user ? scrollContainer(tripsScrollRef, 0.8) : null;

    return () => {
      if (citiesInterval) clearInterval(citiesInterval);
      if (tripsInterval) clearInterval(tripsInterval);
    };
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality
    console.log('Search:', { searchQuery, filterCategory, sortBy });
  };

  // Mock data for previous trips
  const previousTrips = [
    {
      id: 1,
      destination: 'Paris, France',
      date: 'March 2024',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      rating: 5,
      duration: '7 days'
    },
    {
      id: 2,
      destination: 'Tokyo, Japan',
      date: 'January 2024',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      rating: 4,
      duration: '10 days'
    },
    {
      id: 3,
      destination: 'Bali, Indonesia',
      date: 'November 2023',
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      rating: 5,
      duration: '5 days'
    },
    {
      id: 4,
      destination: 'New York, USA',
      date: 'September 2023',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      rating: 4,
      duration: '6 days'
    },
    {
      id: 5,
      destination: 'Rome, Italy',
      date: 'July 2023',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      rating: 5,
      duration: '8 days'
    }
  ];

  // Mock data for top cities
  const topCities = [
    {
      id: 1,
      city: 'Paris',
      country: 'France',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      popular: true,
      description: 'City of Light with iconic landmarks',
      attractions: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame'],
      rating: 4.8,
      visitors: '15M+'
    },
    {
      id: 2,
      city: 'Tokyo',
      country: 'Japan',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      popular: true,
      description: 'Modern metropolis meets ancient tradition',
      attractions: ['Shibuya Crossing', 'Tokyo Tower', 'Senso-ji Temple'],
      rating: 4.7,
      visitors: '12M+'
    },
    {
      id: 3,
      city: 'New York',
      country: 'USA',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      popular: true,
      description: 'The city that never sleeps',
      attractions: ['Times Square', 'Central Park', 'Statue of Liberty'],
      rating: 4.6,
      visitors: '13M+'
    },
    {
      id: 4,
      city: 'London',
      country: 'United Kingdom',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      popular: false,
      description: 'Historic charm with royal heritage',
      attractions: ['Big Ben', 'Tower Bridge', 'British Museum'],
      rating: 4.5,
      visitors: '11M+'
    },
    {
      id: 5,
      city: 'Barcelona',
      country: 'Spain',
      image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      popular: false,
      description: 'Architectural wonders and vibrant culture',
      attractions: ['Sagrada Familia', 'Park Güell', 'Las Ramblas'],
      rating: 4.7,
      visitors: '9M+'
    },
    {
      id: 6,
      city: 'Dubai',
      country: 'UAE',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      popular: false,
      description: 'Luxury and innovation in the desert',
      attractions: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah'],
      rating: 4.4,
      visitors: '8M+'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Globe<span className="text-blue-600">trotter</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">Welcome, {user.firstName}!</span>
                  <Link
                    href="/dashboard"
                    className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
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

      {/* Banner Image */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80')`
          }}
        ></div>
        <div className="relative z-20 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Discover Your Next Adventure
            </h1>
            <p className="text-xl md:text-2xl opacity-90">
              Explore the world with personalized travel experiences
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white shadow-lg -mt-16 relative z-30 mx-4 sm:mx-8 lg:mx-16 rounded-2xl">
        <div className="p-8">
          <form onSubmit={handleSearch} className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Search Input */}
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Where do you want to go?
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search destinations, cities, countries..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>

              {/* Filter */}
              <div>
                <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by
                </label>
                <select
                  id="filter"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="adventure">Adventure</option>
                  <option value="relaxation">Relaxation</option>
                  <option value="cultural">Cultural</option>
                  <option value="business">Business</option>
                  <option value="family">Family</option>
                  <option value="romantic">Romantic</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
                  Sort by
                </label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div className="mt-6 text-center">
              <button
                type="submit"
                className="bg-blue-600 text-white px-12 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
              >
                🔍 Search Destinations
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Top Cities */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Top Cities
            </h2>
            <p className="text-xl text-gray-600">
              Discover the world's most popular travel destinations
            </p>
          </div>

          {/* Auto-scrolling Container */}
          <div 
            ref={citiesScrollRef}
            className="overflow-x-auto scrollbar-hide pb-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <div className="flex gap-6 w-max">
              {[...topCities, ...topCities].map((city, index) => (
                <div key={`${city.id}-${index}`} className="w-80 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer flex-shrink-0">
                  <div className="relative h-48 overflow-hidden rounded-t-2xl">
                    {city.popular && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full z-10 font-medium">
                        Popular
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full z-10 font-medium">
                      ⭐ {city.rating}
                    </div>
                    <Image
                      src={city.image}
                      alt={`${city.city}, ${city.country}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-sm font-medium">{city.visitors} visitors/year</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {city.city}
                    </h3>
                    <p className="text-gray-500 text-sm mb-3">
                      {city.country}
                    </p>
                    <p className="text-gray-600 mb-3 text-sm">
                      {city.description}
                    </p>
                    <p className="text-gray-500 text-xs mb-4">
                      {city.attractions.join(' • ')}
                    </p>
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                      Explore City 
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Previous Trips */}
      {user && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Your Previous Trips
              </h2>
              <p className="text-xl text-gray-600">
                Relive your amazing adventures and plan your next journey
              </p>
            </div>

            {/* Auto-scrolling Container */}
            <div 
              ref={tripsScrollRef}
              className="overflow-x-auto scrollbar-hide pb-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <div className="flex gap-6 w-max">
                {[...previousTrips, ...previousTrips].map((trip, index) => (
                  <div key={`${trip.id}-${index}`} className="w-72 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100 flex-shrink-0">
                    <div className="relative h-48 overflow-hidden rounded-t-2xl">
                      <Image
                        src={trip.image}
                        alt={trip.destination}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="text-sm font-medium">{trip.duration}</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {trip.destination}
                      </h3>
                      <p className="text-gray-600 mb-4 text-sm">
                        {trip.date}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < trip.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                          View Details
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Travel Planning Steps */}
      {/* <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Start planning your perfect trip in just 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Tell Us Your Preferences</h3>
              <p className="text-gray-600 leading-relaxed">
                Share your travel style, budget, interests, and any special requirements. 
                Our AI learns what makes your perfect trip.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Get Personalized Recommendations</h3>
              <p className="text-gray-600 leading-relaxed">
                Receive curated destinations, activities, and itineraries tailored specifically 
                to your preferences and travel goals.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Book & Enjoy</h3>
              <p className="text-gray-600 leading-relaxed">
                Book your accommodations, activities, and transportation all in one place. 
                Then enjoy your perfectly planned adventure!
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      {/* <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of travelers who trust Globetrotter for their adventures
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link
              href="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-full hover:bg-gray-50 transition-colors font-semibold text-lg"
            >
              Start Planning Free
            </Link>
            <Link
              href="/login"
              className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-blue-600 transition-colors font-semibold text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                Globe<span className="text-blue-400">trotter</span>
              </h3>
              <p className="text-gray-400">
                Your personalized travel planning companion for unforgettable adventures.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">How it works</a></li>
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Globetrotter. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}