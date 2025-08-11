'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from 'next/navigation';

// Types matching our API structure
interface Place {
  place_name: string;
  type: string;
  rating: number;
  significance: string;
  weekly_off: string;
  entrance_fee: number;
  dslr_allowed: string;
}

interface CityData {
  city: string;
  city_average_rating: number;
  best_time_to_visit: string;
  places: Place[];
  image?: string;
  id?: string;
  state?: string;
  description?: string;
  attractions?: string[];
  popular?: boolean;
  visitors?: string;
}

export default function CityPage() {
  const params = useParams();
  const router = useRouter();
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [user, setUser] = useState<any>(null);

  // Get city image from Google Places API
  const getCityImage = async (cityName: string): Promise<string> => {
    try {
      const response = await fetch(`/api/places-image?place=${encodeURIComponent(cityName)}`);
      const data = await response.json();
      
      if (data.imageUrl) {
        return data.imageUrl;
      }
      
      return `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80`;
    } catch (error) {
      return `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80`;
    }
  };

  // Get place image from Google Places API
  const getPlaceImage = async (placeName: string, cityName: string): Promise<string> => {
    try {
      const response = await fetch(`/api/places-image?place=${encodeURIComponent(placeName)}`);
      const data = await response.json();
      
      if (data.imageUrl) {
        return data.imageUrl;
      }
      
      return `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`;
    } catch (error) {
      return `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`;
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const fetchCityData = async () => {
      if (!params.cityId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch cities data from our API
        const response = await fetch('/api/cities');
        if (!response.ok) {
          throw new Error('Failed to fetch cities data');
        }

        const cities: CityData[] = await response.json();
        
        // Find the city by matching the cityId parameter
        const cityId = params.cityId as string;
        const foundCity = cities.find(city => 
          city.city.toLowerCase().replace(/\s+/g, '-') === cityId ||
          city.city.toLowerCase() === cityId.replace(/-/g, ' ')
        );

        if (!foundCity) {
          setError('City not found');
          setLoading(false);
          return;
        }

        // Get image for the city
        const image = await getCityImage(foundCity.city);

        // Enhance city data
        const enhancedCity: CityData = {
          ...foundCity,
          image,
          id: foundCity.city.toLowerCase().replace(/\s+/g, '-'),
          state: 'India',
          description: `Discover the beautiful city of ${foundCity.city} with its ${foundCity.places.length} amazing attractions. Known for its rich culture and ${foundCity.city_average_rating}-star rated experiences.`,
          attractions: foundCity.places.slice(0, 5).map(place => place.place_name),
          popular: foundCity.city_average_rating >= 4.5,
          visitors: `${Math.round(foundCity.city_average_rating * 5)}M+`
        };

        setCityData(enhancedCity);
      } catch (err) {
        console.error('Error fetching city data:', err);
        setError('Failed to load city information');
      } finally {
        setLoading(false);
      }
    };

    fetchCityData();
  }, [params.cityId]);

  const getUniqueCategories = () => {
    if (!cityData) return ['All'];
    const categories = ['All', ...new Set(cityData.places.map(place => place.type))];
    return categories;
  };

  const getFilteredPlaces = () => {
    if (!cityData) return [];
    if (selectedCategory === 'All') return cityData.places;
    return cityData.places.filter(place => place.type === selectedCategory);
  };

  const formatEntranceFee = (fee: number) => {
    if (fee === 0) return 'Free';
    return `₹${fee}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading city information...</p>
        </div>
      </div>
    );
  }

  if (error || !cityData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">City Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested city could not be found.'}</p>
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
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Globe<span className="text-blue-600">trotter</span>
              </h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Home
              </Link>
              <Link
                href="/search"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Search
              </Link>
              {user ? (
                <Link
                  href="/profile"
                  className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium"
                >
                  Profile
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-96 bg-gray-900">
        <Image
          src={cityData.image!}
          alt={cityData.city}
          fill
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-white">
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-medium">
                  ⭐ {cityData.city_average_rating}/5
                </span>
                {cityData.popular && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Popular Destination
                  </span>
                )}
              </div>
              <h1 className="text-5xl font-bold mb-4">{cityData.city}</h1>
              <p className="text-xl mb-2">{cityData.state}</p>
              <p className="text-lg opacity-90 max-w-2xl">{cityData.description}</p>
              <div className="mt-6 flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span>Best time: {cityData.best_time_to_visit}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>{cityData.places.length} Attractions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  <span>{cityData.visitors} visitors annually</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Attractions in {cityData.city}
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Filter by category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {getUniqueCategories().map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Attractions Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getFilteredPlaces().map((place, index) => (
              <PlaceCard 
                key={index} 
                place={place} 
                cityName={cityData.city}
                getPlaceImage={getPlaceImage}
              />
            ))}
          </div>
          
          {getFilteredPlaces().length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No attractions found for the selected category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Quick Info Section */}
      <section className="bg-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Best Time to Visit</h3>
              <p className="text-gray-600">{cityData.best_time_to_visit}</p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Top Rated</h3>
              <p className="text-gray-600">{cityData.city_average_rating}/5 Average Rating</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Total Attractions</h3>
              <p className="text-gray-600">{cityData.places.length} Places to Visit</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              Globe<span className="text-blue-400">trotter</span>
            </h2>
            <p className="text-gray-400 mb-6">Discover the beauty of India, one city at a time.</p>
            <div className="flex justify-center space-x-6">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/search" className="text-gray-400 hover:text-white transition-colors">
                Search
              </Link>
              <Link href="/profile" className="text-gray-400 hover:text-white transition-colors">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Place Card Component
interface PlaceCardProps {
  place: Place;
  cityName: string;
  getPlaceImage: (placeName: string, cityName: string) => Promise<string>;
}

function PlaceCard({ place, cityName, getPlaceImage }: PlaceCardProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const url = await getPlaceImage(place.place_name, cityName);
        setImageUrl(url);
      } catch (error) {
        setImageUrl('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
      } finally {
        setImageLoading(false);
      }
    };

    fetchImage();
  }, [place.place_name, cityName, getPlaceImage]);

  const formatEntranceFee = (fee: number) => {
    if (fee === 0) return 'Free';
    return `₹${fee}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48">
        {imageLoading ? (
          <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading...</div>
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={place.place_name}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute top-4 right-4">
          <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-sm font-medium">
            ⭐ {place.rating}
          </span>
        </div>
        <div className="absolute top-4 left-4">
          <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            {place.type}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{place.place_name}</h3>
        <p className="text-gray-600 text-sm mb-4 capitalize">{place.significance}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Entrance Fee:</span>
            <span className="font-medium">{formatEntranceFee(place.entrance_fee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Weekly Off:</span>
            <span className="font-medium">{place.weekly_off}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Photography:</span>
            <span className="font-medium">
              {place.dslr_allowed === 'Yes' ? 
                <span className="text-green-600">✓ Allowed</span> : 
                <span className="text-red-600">✗ Not Allowed</span>
              }
            </span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Significance</span>
            <span className="text-sm font-medium capitalize bg-gray-100 px-2 py-1 rounded">
              {place.significance}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}