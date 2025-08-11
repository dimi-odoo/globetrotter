'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Types
interface Place {
  place_name: string;
  type: string;
  significance: string;
  entrance_fee: number;
  weekly_off: string;
}

interface CityData {
  city: string;
  state: string;
  district: string;
  famous_foods: string[];
  places: Place[];
  best_time_to_visit: string;
  city_average_rating: number;
}

interface SearchResult extends CityData {
  id: string;
  image: string;
  matchType: 'city' | 'place';
  matchedPlace?: Place;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [allCities, setAllCities] = useState<CityData[]>([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [searchType, setSearchType] = useState('cities'); // 'cities' or 'activities'
  const [priceRange, setPriceRange] = useState(''); // For activities

  // Function to get image from Google Places API via our API route
  const getImage = async (placeName: string): Promise<string> => {
    try {
      const response = await fetch(`/api/places-image?place=${encodeURIComponent(placeName)}`);
      const data = await response.json();
      
      if (data.imageUrl) {
        return data.imageUrl;
      }
      
      // Fallback image
      return `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop`;
    } catch (error) {
      console.error('Error fetching image from Google Places:', error);
      return `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop`;
    }
  };

  // Function to fetch all cities
  const fetchCities = async (): Promise<CityData[]> => {
    try {
      const response = await fetch('/api/cities');
      if (!response.ok) {
        throw new Error('Failed to fetch cities');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching cities:', error);
      return [];
    }
  };

  // Function to perform search
  const performSearch = async (query: string, category: string = '', sort: string = 'relevance') => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const cities = allCities.length > 0 ? allCities : await fetchCities();
      
      if (allCities.length === 0) {
        setAllCities(cities);
      }

      const results: SearchResult[] = [];
      const queryLower = query.toLowerCase();

      // Search through cities and places
      for (const city of cities) {
        // Check if city name matches
        if (city.city.toLowerCase().includes(queryLower)) {
          const image = await getImage(city.city);
          results.push({
            ...city,
            image,
            id: city.city.toLowerCase().replace(/\s+/g, '-'),
            matchType: 'city'
          });
        }

        // Check if any place names match
        for (const place of city.places) {
          if (place.place_name.toLowerCase().includes(queryLower) || 
              place.type.toLowerCase().includes(queryLower) ||
              place.significance.toLowerCase().includes(queryLower)) {
            
            const existingResult = results.find(r => r.city === city.city);
            if (!existingResult) {
              const image = await getImage(place.place_name);
              results.push({
                ...city,
                image,
                id: `${city.city.toLowerCase().replace(/\s+/g, '-')}-${place.place_name.toLowerCase().replace(/\s+/g, '-')}`,
                matchType: 'place',
                matchedPlace: place
              });
            }
          }
        }
      }

      // Apply category filter
      let filteredResults = results;
      if (category && category !== '') {
        filteredResults = results.filter(result => {
          if (result.matchType === 'place' && result.matchedPlace) {
            return result.matchedPlace.type.toLowerCase().includes(category.toLowerCase());
          }
          return result.places.some(place => place.type.toLowerCase().includes(category.toLowerCase()));
        });
      }

      // Apply sorting
      switch (sort) {
        case 'rating':
          filteredResults.sort((a, b) => b.city_average_rating - a.city_average_rating);
          break;
        case 'popular':
          filteredResults.sort((a, b) => b.places.length - a.places.length);
          break;
        default: // relevance
          break;
      }

      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Initialize search from URL params
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'relevance';

    setSearchQuery(query);
    setFilterCategory(category);
    setSortBy(sort);

    if (query) {
      performSearch(query, category, sort);
    }
  }, [searchParams]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (filterCategory) params.append('category', filterCategory);
    if (sortBy) params.append('sort', sortBy);
    
    router.push(`/search?${params.toString()}`);
    performSearch(searchQuery, filterCategory, sortBy);
  };

  // Get unique categories from all places
  const getCategories = () => {
    const categories = new Set<string>();
    allCities.forEach(city => {
      city.places.forEach(place => {
        categories.add(place.type);
      });
    });
    return Array.from(categories);
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.matchType === 'city') {
      router.push(`/city/${result.id}`);
    } else {
      // For place matches, go to the city page
      const cityId = result.city.toLowerCase().replace(/\s+/g, '-');
      router.push(`/city/${cityId}`);
    }
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
                href="/"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Header */}
      <div className="relative bg-cover bg-center bg-no-repeat text-white min-h-[60vh] flex items-center" style={{ backgroundImage: 'url("/search_loc.png")' }}>
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3">Discover Amazing Destinations & Activities</h1>
            <p className="text-lg text-blue-100">Find your perfect travel experience</p>
          </div>
        </div>
      </div>

      {/* Search Box positioned below hero so it doesn't cover the image */}
      <div className="relative z-30 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-xl shadow-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {/* Search Type Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSearchType('cities')}
                className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-colors ${
                  searchType === 'cities'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cities
              </button>
              <button
                onClick={() => setSearchType('activities')}
                className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-colors ${
                  searchType === 'activities'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Activities
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder={`Search for ${searchType}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <svg className="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {searchType === 'activities' && (
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                className="px-4 py-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              className="px-4 py-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-base"
          >
            Search
          </button>
        </div>
      </div>

      {/* End Search Header */}

      {/* Search Results */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Search Results
                </h2>
                <p className="text-xl text-gray-600">
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {searchResults.map((result) => (
                  <SearchResultCard 
                    key={result.id} 
                    result={result} 
                    onClick={() => handleResultClick(result)}
                  />
                ))}
              </div>
            </>
          ) : searchQuery ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                No results found
              </h2>
              <p className="text-gray-600 mb-8">
                We couldn't find any places matching "{searchQuery}". Try a different search term.
              </p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  router.push('/search');
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Search for Places in India
              </h2>
              <p className="text-gray-600">
                Enter a city name, place, or attraction to get started
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              Globe<span className="text-blue-400">trotter</span>
            </h2>
            <p className="text-gray-400 mb-6">Discover the beauty of India, one search at a time.</p>
            <div className="flex justify-center space-x-6">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/search" className="text-gray-400 hover:text-white transition-colors">
                Search
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Search Result Card Component
interface SearchResultCardProps {
  result: SearchResult;
  onClick: () => void;
}

function SearchResultCard({ result, onClick }: SearchResultCardProps) {
  const [imageLoading, setImageLoading] = useState(true);

  const formatEntranceFee = (fee: number) => {
    if (fee === 0) return 'Free';
    return `₹${fee}`;
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-48">
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading image...</div>
          </div>
        )}
        <Image
          src={result.image}
          alt={result.matchType === 'city' ? result.city : result.matchedPlace?.place_name || result.city}
          fill
          className={`object-cover transition-opacity ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setImageLoading(false)}
        />
        <div className="absolute top-4 right-4">
          <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-sm font-medium">
            ⭐ {result.city_average_rating}
          </span>
        </div>
        <div className="absolute top-4 left-4">
          <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            {result.matchType === 'city' ? '🏙️ City' : '📍 Place'}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {result.matchType === 'city' ? result.city : result.matchedPlace?.place_name}
        </h3>
        
        {result.matchType === 'place' && result.matchedPlace && (
          <p className="text-sm text-blue-600 mb-2">
            📍 in {result.city}
          </p>
        )}
        
        <p className="text-gray-600 text-sm mb-4">
          {result.matchType === 'city' 
            ? `Explore ${result.city} with ${result.places.length} amazing attractions`
            : result.matchedPlace?.significance
          }
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Best Time:</span>
            <span className="font-medium">{result.best_time_to_visit}</span>
          </div>
          
          {result.matchType === 'place' && result.matchedPlace && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-500">Type:</span>
                <span className="font-medium">{result.matchedPlace.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Entrance Fee:</span>
                <span className="font-medium">{formatEntranceFee(result.matchedPlace.entrance_fee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Weekly Off:</span>
                <span className="font-medium">{result.matchedPlace.weekly_off}</span>
              </div>
            </>
          )}
          
          {result.matchType === 'city' && (
            <div className="flex justify-between">
              <span className="text-gray-500">Attractions:</span>
              <span className="font-medium">{result.places.length} places</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
            {result.matchType === 'city' ? 'Explore City' : 'View Details'}
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
