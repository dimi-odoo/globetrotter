'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  fullName: string;
  email: string;
  profilePhoto: string;
}

interface Activity {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  duration: string;
  price: number;
  rating: number;
  reviews: number;
  location: string;
  highlights: string[];
  difficulty?: string;
  ageGroup?: string;
}

interface City {
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  population: string;
  bestTimeToVisit: string;
  climate: string;
  currency: string;
  language: string;
  rating: number;
  topAttractions: string[];
  activities: Activity[];
  averageCost: {
    budget: number;
    mid: number;
    luxury: number;
  };
}

export default function SearchPage() {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'cities' | 'activities'>('cities');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<(City | Activity)[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<City | Activity | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Mock data for demonstration
  const mockCities: City[] = [
    {
      id: '1',
      name: 'Tokyo',
      country: 'Japan',
      description: 'A vibrant metropolis blending traditional culture with cutting-edge technology. Experience ancient temples alongside futuristic skyscrapers.',
      image: '🏯',
      population: '37.4 million',
      bestTimeToVisit: 'March-May, September-November',
      climate: 'Humid subtropical',
      currency: 'Japanese Yen (¥)',
      language: 'Japanese',
      rating: 4.8,
      topAttractions: ['Senso-ji Temple', 'Tokyo Skytree', 'Shibuya Crossing', 'Imperial Palace', 'Tsukiji Fish Market'],
      activities: [
        {
          id: 'a1',
          name: 'Sushi Making Class',
          description: 'Learn to make authentic sushi from a master chef',
          image: '🍣',
          category: 'Culinary',
          duration: '3 hours',
          price: 85,
          rating: 4.9,
          reviews: 342,
          location: 'Ginza District',
          highlights: ['Professional chef instruction', 'Fresh ingredients', 'Take recipes home'],
          difficulty: 'Beginner',
          ageGroup: 'All ages'
        }
      ],
      averageCost: { budget: 50, mid: 120, luxury: 300 }
    },
    {
      id: '2',
      name: 'Paris',
      country: 'France',
      description: 'The City of Light, renowned for its art, fashion, gastronomy, and culture. Home to iconic landmarks and world-class museums.',
      image: '🗼',
      population: '2.2 million',
      bestTimeToVisit: 'April-June, October-early November',
      climate: 'Oceanic',
      currency: 'Euro (€)',
      language: 'French',
      rating: 4.7,
      topAttractions: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral', 'Arc de Triomphe', 'Champs-Élysées'],
      activities: [
        {
          id: 'a2',
          name: 'Seine River Cruise',
          description: 'Romantic evening cruise along the Seine with dinner',
          image: '🛥️',
          category: 'Sightseeing',
          duration: '2.5 hours',
          price: 95,
          rating: 4.6,
          reviews: 567,
          location: 'Seine River',
          highlights: ['Evening illuminations', 'Gourmet dinner', 'Live commentary'],
          difficulty: 'Easy',
          ageGroup: 'All ages'
        }
      ],
      averageCost: { budget: 70, mid: 150, luxury: 400 }
    },
    {
      id: '3',
      name: 'Bali',
      country: 'Indonesia',
      description: 'Tropical paradise known for its forested volcanic mountains, iconic rice paddies, beaches and coral reefs.',
      image: '🏝️',
      population: '4.3 million',
      bestTimeToVisit: 'April-October',
      climate: 'Tropical',
      currency: 'Indonesian Rupiah (IDR)',
      language: 'Indonesian, Balinese',
      rating: 4.9,
      topAttractions: ['Tanah Lot Temple', 'Ubud Rice Terraces', 'Mount Batur', 'Uluwatu Temple', 'Seminyak Beach'],
      activities: [
        {
          id: 'a3',
          name: 'Volcano Sunrise Hike',
          description: 'Early morning hike to Mount Batur for spectacular sunrise views',
          image: '🌋',
          category: 'Adventure',
          duration: '6 hours',
          price: 45,
          rating: 4.8,
          reviews: 789,
          location: 'Mount Batur',
          highlights: ['Sunrise views', 'Volcano crater', 'Hot springs', 'Breakfast on summit'],
          difficulty: 'Moderate',
          ageGroup: '12+'
        }
      ],
      averageCost: { budget: 25, mid: 60, luxury: 200 }
    }
  ];

  const mockActivities: Activity[] = [
    {
      id: 'a4',
      name: 'Skydiving Experience',
      description: 'Tandem skydiving with certified instructors and breathtaking aerial views',
      image: '🪂',
      category: 'Adventure',
      duration: '4 hours',
      price: 299,
      rating: 4.9,
      reviews: 1234,
      location: 'Various locations',
      highlights: ['15,000 ft jump', 'Certified instructors', 'Video recording', 'Certificate'],
      difficulty: 'Advanced',
      ageGroup: '18+'
    },
    {
      id: 'a5',
      name: 'Wine Tasting Tour',
      description: 'Guided tour through local vineyards with premium wine tastings',
      image: '🍷',
      category: 'Culinary',
      duration: '5 hours',
      price: 120,
      rating: 4.7,
      reviews: 456,
      location: 'Wine regions',
      highlights: ['5 vineyard visits', 'Expert sommelier', 'Lunch included', 'Transportation'],
      difficulty: 'Easy',
      ageGroup: '21+'
    },
    {
      id: 'a6',
      name: 'Cultural Walking Tour',
      description: 'Explore local history, culture, and hidden gems with a local guide',
      image: '🚶‍♂️',
      category: 'Cultural',
      duration: '3 hours',
      price: 35,
      rating: 4.5,
      reviews: 892,
      location: 'City centers',
      highlights: ['Local guide', 'Historical sites', 'Local stories', 'Small groups'],
      difficulty: 'Easy',
      ageGroup: 'All ages'
    }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsProfileDropdownOpen(false);
    router.push('/');
  };

  const handleSearch = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      let results: (City | Activity)[] = [];
      
      if (searchType === 'cities') {
        results = mockCities.filter(city => 
          city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else {
        results = mockActivities.filter(activity =>
          activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        if (filterCategory) {
          results = (results as Activity[]).filter(activity => 
            activity.category.toLowerCase() === filterCategory.toLowerCase()
          );
        }
        
        if (priceRange) {
          const [min, max] = priceRange.split('-').map(Number);
          results = (results as Activity[]).filter(activity => 
            activity.price >= min && activity.price <= max
          );
        }
      }
      
      // Apply sorting
      if (sortBy === 'price-low') {
        results.sort((a, b) => {
          const priceA = 'price' in a ? a.price : ('averageCost' in a ? a.averageCost.mid : 0);
          const priceB = 'price' in b ? b.price : ('averageCost' in b ? b.averageCost.mid : 0);
          return priceA - priceB;
        });
      } else if (sortBy === 'price-high') {
        results.sort((a, b) => {
          const priceA = 'price' in a ? a.price : ('averageCost' in a ? a.averageCost.mid : 0);
          const priceB = 'price' in b ? b.price : ('averageCost' in b ? b.averageCost.mid : 0);
          return priceB - priceA;
        });
      } else if (sortBy === 'rating') {
        results.sort((a, b) => b.rating - a.rating);
      }
      
      setSearchResults(results);
      setLoading(false);
    }, 1000);
  };

  const renderCityCard = (city: City) => (
    <div 
      key={city.id} 
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer"
      onClick={() => setSelectedItem(city)}
    >
      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-6xl">{city.image}</div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-900">{city.name}</h3>
          <div className="flex items-center">
            <span className="text-yellow-400 mr-1">⭐</span>
            <span className="text-sm text-gray-600">{city.rating}</span>
          </div>
        </div>
        <p className="text-gray-600 mb-2">{city.country}</p>
        <p className="text-gray-700 mb-4 line-clamp-2">{city.description}</p>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <span>From ${city.averageCost.budget}/day</span>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  const renderActivityCard = (activity: Activity) => (
    <div 
      key={activity.id} 
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer"
      onClick={() => setSelectedItem(activity)}
    >
      <div className="h-48 bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
        <div className="text-6xl">{activity.image}</div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-900">{activity.name}</h3>
          <div className="flex items-center">
            <span className="text-yellow-400 mr-1">⭐</span>
            <span className="text-sm text-gray-600">{activity.rating}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
            {activity.category}
          </span>
          <span className="text-gray-500 text-sm">{activity.duration}</span>
        </div>
        <p className="text-gray-700 mb-4 line-clamp-2">{activity.description}</p>
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold text-green-600">
            ${activity.price}
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );

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
              <Link href="/plan-trip" className="text-gray-600 hover:text-gray-900 font-medium">
                Plan Trip
              </Link>
              <Link href="/search" className="text-blue-600 font-medium">
                Search
              </Link>
              {user ? (
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
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        📊 Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                    Sign In
                  </Link>
                  <Link href="/register" className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Search Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Discover Amazing Destinations & Activities</h1>
            <p className="text-xl text-blue-100">Find your perfect travel experience</p>
          </div>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Search Type Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setSearchType('cities')}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                      searchType === 'cities'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    🏙️ Cities
                  </button>
                  <button
                    onClick={() => setSearchType('activities')}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                      searchType === 'activities'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    🎯 Activities
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder={`Search for ${searchType}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {searchType === 'activities' && (
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">All Categories</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Culinary">Culinary</option>
                    <option value="Sightseeing">Sightseeing</option>
                    <option value="Nature">Nature</option>
                  </select>
                )}

                {searchType === 'activities' && (
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Any Price</option>
                    <option value="0-50">Under $50</option>
                    <option value="50-100">$50 - $100</option>
                    <option value="100-200">$100 - $200</option>
                    <option value="200-1000">$200+</option>
                  </select>
                )}

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
              >
                🔍 Search {searchType}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching for {searchType}...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Search Results ({searchResults.length})
              </h2>
              <p className="text-gray-600">
                Found {searchResults.length} {searchType} for "{searchQuery}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {searchResults.map((item) => 
                'country' in item ? renderCityCard(item as City) : renderActivityCard(item as Activity)
              )}
            </div>
          </>
        ) : searchQuery ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Start your search</h3>
            <p className="text-gray-600">Enter a destination or activity to begin exploring</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center">
                  <div className="text-6xl mr-4">{selectedItem.image}</div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{selectedItem.name}</h2>
                    {'country' in selectedItem && (
                      <p className="text-xl text-gray-600">{selectedItem.country}</p>
                    )}
                    {'category' in selectedItem && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {selectedItem.category}
                        </span>
                        {'duration' in selectedItem && (
                          <span className="text-gray-500">{selectedItem.duration}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-700 mb-6">{selectedItem.description}</p>

                  {'country' in selectedItem ? (
                    // City details
                    <>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Travel Information</h3>
                      <div className="space-y-3">
                        <div><strong>Population:</strong> {selectedItem.population}</div>
                        <div><strong>Best Time to Visit:</strong> {selectedItem.bestTimeToVisit}</div>
                        <div><strong>Climate:</strong> {selectedItem.climate}</div>
                        <div><strong>Currency:</strong> {selectedItem.currency}</div>
                        <div><strong>Language:</strong> {selectedItem.language}</div>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Average Daily Costs</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">${selectedItem.averageCost.budget}</div>
                          <div className="text-sm text-gray-600">Budget</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">${selectedItem.averageCost.mid}</div>
                          <div className="text-sm text-gray-600">Mid-range</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">${selectedItem.averageCost.luxury}</div>
                          <div className="text-sm text-gray-600">Luxury</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    // Activity details
                    <>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Activity Details</h3>
                      <div className="space-y-3">
                        <div><strong>Location:</strong> {selectedItem.location}</div>
                        <div><strong>Duration:</strong> {selectedItem.duration}</div>
                        <div><strong>Difficulty:</strong> {selectedItem.difficulty}</div>
                        <div><strong>Age Group:</strong> {selectedItem.ageGroup}</div>
                        <div><strong>Price:</strong> <span className="text-green-600 font-semibold">${selectedItem.price}</span></div>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {'topAttractions' in selectedItem ? 'Top Attractions' : 'Highlights'}
                  </h3>
                  <ul className="space-y-2">
                    {('topAttractions' in selectedItem ? selectedItem.topAttractions : selectedItem.highlights).map((item, index) => (
                      <li key={index} className="flex items-center">
                        <span className="text-blue-600 mr-2">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-yellow-400 text-2xl mr-2">⭐</span>
                        <span className="text-2xl font-bold">{selectedItem.rating}</span>
                        <span className="text-gray-600 ml-2">
                          {'reviews' in selectedItem && `(${selectedItem.reviews} reviews)`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                        {'country' in selectedItem ? 'Plan Trip to ' + selectedItem.name : 'Book Activity'}
                      </button>
                      <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                        Save to Wishlist
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
