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
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Search India
            </h1>
            <p className="text-xl text-blue-100">
              Discover amazing places and attractions across India
            </p>
          </div>


          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search Input */}
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cities, places, attractions..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {getCategories().map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="rating">Highest Rated</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {loading ? 'Searching...' : '🔍 Search'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

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
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
                    className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <svg className="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Filters */}
                {searchType === 'activities' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
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
          )}

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

            {searchType === 'cities' ? (
              <div className="space-y-10">
                {(searchResults as CityData[]).map((city) => (
                  <CitySection key={city.city} city={city} />
                ))}
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {searchResults.map((result) => (
                  <SearchResultCard 
                    key={result.id} 
                    result={result} 
                    onClick={() => handleResultClick(result)}
                  />
                ))}
              </div>
            )}
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

function CitySection({ city }: { city: CityData }) {
  const slug = city.city.toLowerCase().replace(/\s+/g, '-');
  const [placeImages, setPlaceImages] = useState<Record<number, string>>({});

  useEffect(() => {
    let cancelled = false;
    const fallback = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&h=400&fit=crop';
    const loadImages = async () => {
      try {
        const entries = await Promise.all(
          city.places.map(async (place, idx) => {
            try {
              const res = await fetch(`/api/places-image?place=${encodeURIComponent(`${place.place_name} ${city.city}`)}`);
              const data = await res.json();
              return [idx, data.imageUrl || fallback] as const;
            } catch {
              return [idx, fallback] as const;
            }
          })
        );
        if (!cancelled) {
          setPlaceImages(Object.fromEntries(entries));
        }
      } catch {
        // ignore
      }
    };
    loadImages();
    return () => { cancelled = true; };
  }, [city]);
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">{city.city}</h3>
          <p className="text-gray-600">{city.district}</p>
        </div>
        <Link href={`/city/${slug}`} className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          See all attractions
        </Link>
              </div>

      <h4 className="text-sm font-semibold text-gray-700 mb-3">Famous locations in {city.city}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {city.places.map((place, idx) => (
          <div key={idx} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="relative h-14 w-20 overflow-hidden rounded-md bg-gray-200 flex-shrink-0">
              <Image src={placeImages[idx] || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&h=400&fit=crop'} alt={place.place_name} fill className="object-cover" />
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>
              <span className="text-gray-800">{place.place_name}</span>
          </div>
        </div>
        ))}
    </div>
    </section>
  );
}
