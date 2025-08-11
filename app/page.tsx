'use client';

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';

// Types for API responses
interface Place {
  place_name: string;
  type: string;
  rating: number;
  significance: string;
  weekly_off: string;
  entrance_fee: number;
  dslr_allowed: string;
}

interface City {
  city: string;
  city_average_rating: number;
  best_time_to_visit: string;
  places: Place[];
}

interface CityWithImage extends City {
  image: string;
  id: string;
  state?: string;
  description?: string;
  attractions?: string[];
  popular?: boolean;
  visitors?: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [topCities, setTopCities] = useState<CityWithImage[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const citiesScrollRef = useRef<HTMLDivElement>(null);
  const tripsScrollRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Function to get city image from Google Places API
  const getCityImage = async (cityName: string): Promise<string> => {
    try {
      const response = await fetch(`/api/places-image?place=${encodeURIComponent(cityName)}`);
      const data = await response.json();
      
      if (data.imageUrl) {
        return data.imageUrl;
      }
      
      // Fallback to a default India image if no image found
      return `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`;
    } catch (error) {
      console.error('Error fetching image for', cityName, ':', error);
      return `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`;
    }
  };

  // Function to get place image from Google Places API
  const getPlaceImage = async (placeName: string, cityName?: string): Promise<string> => {
    try {
      const response = await fetch(`/api/places-image?place=${encodeURIComponent(placeName)}`);
      const data = await response.json();
      
      if (data.imageUrl) {
        return data.imageUrl;
      }
      
      // Fallback image for places
      return `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`;
    } catch (error) {
      console.error('Error fetching image for', placeName, ':', error);
      return `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`;
    }
  };

  // Function to fetch cities from Indian Tourism API via our API route
  const fetchTopCities = async () => {
    try {
      setIsLoadingCities(true);
      console.log('Fetching cities from API...');
      
      // Use our internal API route to avoid CORS issues
      const response = await fetch('/api/cities', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Raw API response:', data);
      
      // Extract cities array from response
      const cities: City[] = Array.isArray(data) ? data : (data.cities || data);
      console.log('Extracted cities:', cities.length, 'cities');
      
      if (!Array.isArray(cities) || cities.length === 0) {
        throw new Error('No cities data received');
      }
      
      // Sort cities by rating and take top 10
      const topRatedCities = cities
        .filter(city => city.city_average_rating && city.places && Array.isArray(city.places) && city.places.length > 0)
        .sort((a, b) => b.city_average_rating - a.city_average_rating)
        .slice(0, 10);
      
      console.log('Top rated cities after filtering:', topRatedCities.length);
      
      // Fetch images for each city with enhanced search
      const citiesWithImages: CityWithImage[] = await Promise.all(
        topRatedCities.map(async (city, index) => {
          try {
            const image = await getCityImage(city.city);
            
            // Ensure places is an array of proper objects
            let places = city.places;
            if (places.length > 0 && typeof places[0] === 'string') {
              // If places are strings, try to parse them or create simple objects
              places = city.places.map((placeStr: any, idx: number) => ({
                place_name: `Attraction ${idx + 1}`,
                type: 'Tourist Spot',
                rating: city.city_average_rating,
                significance: 'Tourist',
                weekly_off: 'Not Available',
                entrance_fee: 0,
                dslr_allowed: 'Yes'
              }));
            }
            
            return {
              ...city,
              places,
              image,
              id: city.city.toLowerCase().replace(/\s+/g, '-'),
              // Add computed properties for backward compatibility
              state: 'India', // Default since API doesn't provide state
              description: `Explore the beautiful city of ${city.city} with its amazing attractions and rich culture.`,
              attractions: places.slice(0, 3).map(place => place.place_name),
              popular: city.city_average_rating >= 4.5,
              visitors: `${Math.round(city.city_average_rating * 5)}M+`
            };
          } catch (error) {
            console.error(`Error processing city ${city.city}:`, error);
            // Return city with fallback image if image fetch fails
            return {
              ...city,
              image: `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
              id: city.city.toLowerCase().replace(/\s+/g, '-'),
              state: 'India',
              description: `Explore the beautiful city of ${city.city} with its amazing attractions and rich culture.`,
              attractions: city.places.slice(0, 3).map(place => typeof place === 'string' ? place : place.place_name),
              popular: city.city_average_rating >= 4.5,
              visitors: `${Math.round(city.city_average_rating * 5)}M+`
            };
          }
        })
      );
      
      console.log('Cities with images:', citiesWithImages.length);
      setTopCities(citiesWithImages);
    } catch (error) {
      console.error('Error fetching cities:', error);
      
      // Create fallback mock data based on API structure with real images
      const fallbackCities: CityWithImage[] = [
        {
          city: 'Agra',
          city_average_rating: 4.8,
          best_time_to_visit: 'October to March',
          places: [
            { place_name: 'Taj Mahal', type: 'Monument', rating: 4.9, significance: 'Historical', weekly_off: 'Friday', entrance_fee: 50, dslr_allowed: 'Yes' },
            { place_name: 'Agra Fort', type: 'Fort', rating: 4.6, significance: 'Historical', weekly_off: 'None', entrance_fee: 30, dslr_allowed: 'Yes' },
            { place_name: 'Mehtab Bagh', type: 'Garden', rating: 4.4, significance: 'Historical', weekly_off: 'None', entrance_fee: 25, dslr_allowed: 'Yes' }
          ],
          image: await getCityImage('Agra'),
          id: 'agra',
          state: 'Uttar Pradesh',
          description: 'Home to the magnificent Taj Mahal and rich Mughal heritage.',
          attractions: ['Taj Mahal', 'Agra Fort', 'Mehtab Bagh'],
          popular: true,
          visitors: '24M+'
        },
        {
          city: 'Jaipur',
          city_average_rating: 4.6,
          best_time_to_visit: 'October to March',
          places: [
            { place_name: 'Hawa Mahal', type: 'Palace', rating: 4.5, significance: 'Historical', weekly_off: 'None', entrance_fee: 50, dslr_allowed: 'Yes' },
            { place_name: 'Amber Fort', type: 'Fort', rating: 4.7, significance: 'Historical', weekly_off: 'None', entrance_fee: 100, dslr_allowed: 'Yes' },
            { place_name: 'City Palace', type: 'Palace', rating: 4.6, significance: 'Historical', weekly_off: 'None', entrance_fee: 75, dslr_allowed: 'Yes' }
          ],
          image: await getCityImage('Jaipur'),
          id: 'jaipur',
          state: 'Rajasthan',
          description: 'The Pink City known for its royal palaces and vibrant culture.',
          attractions: ['Hawa Mahal', 'Amber Fort', 'City Palace'],
          popular: true,
          visitors: '23M+'
        },
        {
          city: 'Goa',
          city_average_rating: 4.5,
          best_time_to_visit: 'November to February',
          places: [
            { place_name: 'Baga Beach', type: 'Beach', rating: 4.3, significance: 'Tourist', weekly_off: 'None', entrance_fee: 0, dslr_allowed: 'Yes' },
            { place_name: 'Basilica of Bom Jesus', type: 'Church', rating: 4.5, significance: 'Religious', weekly_off: 'None', entrance_fee: 0, dslr_allowed: 'Yes' },
            { place_name: 'Fort Aguada', type: 'Fort', rating: 4.2, significance: 'Historical', weekly_off: 'None', entrance_fee: 25, dslr_allowed: 'Yes' }
          ],
          image: await getCityImage('Goa'),
          id: 'goa',
          state: 'Goa',
          description: 'Beautiful beaches, Portuguese heritage, and vibrant nightlife.',
          attractions: ['Baga Beach', 'Basilica of Bom Jesus', 'Fort Aguada'],
          popular: true,
          visitors: '23M+'
        },
        {
          city: 'Mumbai',
          city_average_rating: 4.4,
          best_time_to_visit: 'November to February',
          places: [
            { place_name: 'Gateway of India', type: 'Monument', rating: 4.3, significance: 'Historical', weekly_off: 'None', entrance_fee: 0, dslr_allowed: 'Yes' },
            { place_name: 'Marine Drive', type: 'Promenade', rating: 4.4, significance: 'Tourist', weekly_off: 'None', entrance_fee: 0, dslr_allowed: 'Yes' },
            { place_name: 'Elephanta Caves', type: 'Caves', rating: 4.2, significance: 'Historical', weekly_off: 'Monday', entrance_fee: 40, dslr_allowed: 'Yes' }
          ],
          image: await getCityImage('Mumbai'),
          id: 'mumbai',
          state: 'Maharashtra',
          description: 'The financial capital of India, known as the City of Dreams.',
          attractions: ['Gateway of India', 'Marine Drive', 'Elephanta Caves'],
          popular: true,
          visitors: '22M+'
        },
        {
          city: 'Delhi',
          city_average_rating: 4.3,
          best_time_to_visit: 'October to March',
          places: [
            { place_name: 'Red Fort', type: 'Fort', rating: 4.4, significance: 'Historical', weekly_off: 'Monday', entrance_fee: 35, dslr_allowed: 'Yes' },
            { place_name: 'India Gate', type: 'Monument', rating: 4.3, significance: 'Historical', weekly_off: 'None', entrance_fee: 0, dslr_allowed: 'Yes' },
            { place_name: 'Qutub Minar', type: 'Monument', rating: 4.2, significance: 'Historical', weekly_off: 'None', entrance_fee: 30, dslr_allowed: 'Yes' }
          ],
          image: await getCityImage('Delhi'),
          id: 'delhi',
          state: 'Delhi',
          description: 'The capital city with rich history and modern attractions.',
          attractions: ['Red Fort', 'India Gate', 'Qutub Minar'],
          popular: true,
          visitors: '21M+'
        }
      ];
      
      setTopCities(fallbackCities);
    } finally {
      setIsLoadingCities(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Fetch top cities from API
    fetchTopCities();
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

  // Auto-scroll functionality
  useEffect(() => {
    const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, speed: number = 1) => {
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

    const citiesInterval = citiesScrollRef.current ? scrollContainer(citiesScrollRef, 1) : null;
    const tripsInterval = user && tripsScrollRef.current ? scrollContainer(tripsScrollRef, 0.8) : null;

    return () => {
      if (citiesInterval) clearInterval(citiesInterval);
      if (tripsInterval) clearInterval(tripsInterval);
    };
  }, [user, topCities.length]); // Use topCities.length instead of the full array

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to search page with query parameters
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (filterCategory) params.append('category', filterCategory);
    if (sortBy) params.append('sort', sortBy);
    
    router.push(`/search?${params.toString()}`);
  };

  const handleCityClick = (cityId: string) => {
    router.push(`/city/${cityId}`);
  };

  // Mock data for previous trips (Indian destinations)
  const previousTrips = [
    {
      id: 1,
      destination: 'Goa',
      date: 'March 2024',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      rating: 5,
      duration: '7 days'
    },
    {
      id: 2,
      destination: 'Kerala Backwaters',
      date: 'January 2024',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      rating: 4,
      duration: '5 days'
    },
    {
      id: 3,
      destination: 'Manali, Himachal Pradesh',
      date: 'November 2023',
      image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      rating: 5,
      duration: '6 days'
    },
    {
      id: 4,
      destination: 'Udaipur, Rajasthan',
      date: 'September 2023',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      rating: 4,
      duration: '4 days'
    },
    {
      id: 5,
      destination: 'Rishikesh, Uttarakhand',
      date: 'July 2023',
      image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      rating: 5,
      duration: '3 days'
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
                {/* <span className="text-sm text-orange-500 ml-2">India</span> */}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/plan-trip"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Plan Trip
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

      {/* Banner Image */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-black/20 z-10"></div>
        <Image
          src="/landing_page.jpg"
          alt="Discover India"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-20 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              Discover Incredible Places
            </h1>
            <p className="text-xl md:text-2xl opacity-90 drop-shadow-md">
              Explore the diverse beauty and rich heritage of India
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
                  Where do you want to go in India?
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cities, states, destinations..."
                  className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
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
                  className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="heritage">Heritage</option>
                  <option value="adventure">Adventure</option>
                  <option value="spiritual">Spiritual</option>
                  <option value="beach">Beach</option>
                  <option value="hill-station">Hill Station</option>
                  <option value="wildlife">Wildlife</option>
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
                  className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Relevance</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                  <option value="budget">Budget Friendly</option>
                  <option value="distance">Nearest</option>
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div className="mt-6 text-center">
              <button
                type="submit"
                className="bg-blue-600 text-white px-12 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
              >
                🔍 Explore India
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
              Top Cities in India
            </h2>
            <p className="text-xl text-gray-600">
              Discover India's most popular travel destinations
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
            {isLoadingCities ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
              </div>
            ) : topCities.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">Unable to load cities. Please try again later.</p>
              </div>
            ) : (
              <div className="flex gap-6 w-max">
                {[...topCities, ...topCities].map((city, index) => (
                  <div 
                    key={`${city.id}-${index}`} 
                    className="w-80 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer flex-shrink-0"
                    onClick={() => handleCityClick(city.id)}
                  >
                    <div className="relative h-48 overflow-hidden rounded-t-2xl">
                      {city.city_average_rating >= 4.5 && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full z-10 font-medium">
                          Top Rated
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full z-10 font-medium">
                        ⭐ {city.city_average_rating}
                      </div>
                      <Image
                        src={city.image}
                        alt={city.city}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="text-sm font-medium">Best time: {city.best_time_to_visit}</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {city.city}
                      </h3>
                      <p className="text-gray-500 text-sm mb-3">
                        {city.places.length} attractions
                      </p>
                      <p className="text-gray-600 mb-3 text-sm">
                        Explore the beautiful city of {city.city} with its amazing attractions and rich culture.
                      </p>
                      <p className="text-gray-500 text-xs mb-4">
                        {city.places.slice(0, 3).map(place => place.place_name).join(' • ')}
                        {city.places.length > 3 && ` + ${city.places.length - 3} more`}
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
            )}
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
                Relive your amazing adventures across India
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
              Plan your perfect Indian adventure in just 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Choose Your Destination</h3>
              <p className="text-gray-600 leading-relaxed">
                Select from India's diverse destinations - from the Himalayas to beaches, 
                from heritage sites to modern cities.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Get Detailed Information</h3>
              <p className="text-gray-600 leading-relaxed">
                Access comprehensive details about places including timings, fees, 
                best visiting times, and local insights.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Plan & Explore</h3>
              <p className="text-gray-600 leading-relaxed">
                Create your itinerary with our recommendations and embark on 
                an unforgettable journey across incredible India.
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      {/* <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Explore India?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join thousands of travelers discovering the beauty of India
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link
              href="/register"
              className="bg-white text-orange-600 px-8 py-4 rounded-full hover:bg-gray-50 transition-colors font-semibold text-lg"
            >
              Start Planning Free
            </Link>
            <Link
              href="/login"
              className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-orange-600 transition-colors font-semibold text-lg"
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
                {/* <span className="text-orange-400 text-sm ml-2">India</span> */}
              </h3>
              <p className="text-gray-400">
                Your personalized travel planning companion for incredible India.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Destinations</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">North India</a></li>
                <li><a href="#" className="hover:text-white">South India</a></li>
                <li><a href="#" className="hover:text-white">East India</a></li>
                <li><a href="#" className="hover:text-white">West India</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Travel Guide</a></li>
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
            <p>&copy; 2025 Globetrotter India. All rights reserved.</p>
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