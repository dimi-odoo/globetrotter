'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface CityInfo {
  id: string;
  name: string;
  country: string;
  continent: string;
  description: string;
  image: string;
  population: string;
  area: string;
  timeZone: string;
  bestTimeToVisit: string;
  climate: string;
  currency: string;
  language: string[];
  safety: {
    rating: number;
    description: string;
  };
  attractions: {
    id: string;
    name: string;
    description: string;
    image: string;
    category: string;
    entryFee?: string;
    openingHours?: string;
    rating: number;
  }[];
  restaurants: {
    id: string;
    name: string;
    cuisine: string;
    priceRange: string;
    rating: number;
    description: string;
  }[];
  hotels: {
    id: string;
    name: string;
    type: string;
    priceRange: string;
    rating: number;
    amenities: string[];
  }[];
  transportation: {
    airport: string;
    publicTransport: string[];
    averageCosts: {
      taxi: string;
      metro: string;
      bus: string;
    };
  };
  weather: {
    current: {
      temperature: string;
      condition: string;
      humidity: string;
    };
    forecast: {
      day: string;
      high: string;
      low: string;
      condition: string;
    }[];
  };
  costs: {
    budget: {
      accommodation: string;
      food: string;
      transport: string;
      activities: string;
      total: string;
    };
    mid: {
      accommodation: string;
      food: string;
      transport: string;
      activities: string;
      total: string;
    };
    luxury: {
      accommodation: string;
      food: string;
      transport: string;
      activities: string;
      total: string;
    };
  };
  tips: string[];
  dosDonts: {
    dos: string[];
    donts: string[];
  };
}

export default function CityInfoPage() {
  const [cityInfo, setCityInfo] = useState<CityInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();
  const searchParams = useSearchParams();
  const cityName = searchParams.get('city') || 'Tokyo';

  // Mock data - In a real app, this would come from an API
  const mockCityData: CityInfo = {
    id: '1',
    name: 'Tokyo',
    country: 'Japan',
    continent: 'Asia',
    description: 'Tokyo, the bustling capital of Japan, is a vibrant metropolis where ancient traditions seamlessly blend with cutting-edge technology. From towering skyscrapers and neon-lit districts to serene temples and traditional gardens, Tokyo offers an unparalleled urban experience.',
    image: '🏯',
    population: '37.4 million (metropolitan area)',
    area: '2,194 km² (847 sq mi)',
    timeZone: 'JST (UTC+9)',
    bestTimeToVisit: 'March-May (Spring) and September-November (Autumn)',
    climate: 'Humid subtropical climate with hot, humid summers and mild winters',
    currency: 'Japanese Yen (¥)',
    language: ['Japanese', 'English (limited)'],
    safety: {
      rating: 9.2,
      description: 'Tokyo is one of the safest major cities in the world with very low crime rates.'
    },
    attractions: [
      {
        id: 'a1',
        name: 'Senso-ji Temple',
        description: 'Tokyo\'s oldest temple, founded in 645 AD, located in historic Asakusa district.',
        image: '⛩️',
        category: 'Cultural/Religious',
        entryFee: 'Free',
        openingHours: '6:00 AM - 5:00 PM',
        rating: 4.3
      },
      {
        id: 'a2',
        name: 'Tokyo Skytree',
        description: 'World\'s second-tallest structure offering panoramic views of Tokyo.',
        image: '🗼',
        category: 'Observation/Modern',
        entryFee: '¥2,100-3,400',
        openingHours: '8:00 AM - 10:00 PM',
        rating: 4.1
      },
      {
        id: 'a3',
        name: 'Shibuya Crossing',
        description: 'The world\'s busiest pedestrian crossing, iconic symbol of Tokyo.',
        image: '🚶‍♂️',
        category: 'Urban Experience',
        entryFee: 'Free',
        openingHours: '24/7',
        rating: 4.2
      },
      {
        id: 'a4',
        name: 'Imperial Palace',
        description: 'Primary residence of the Emperor of Japan with beautiful East Gardens.',
        image: '🏰',
        category: 'Historical',
        entryFee: 'Free (East Gardens)',
        openingHours: '9:00 AM - 4:30 PM',
        rating: 4.0
      }
    ],
    restaurants: [
      {
        id: 'r1',
        name: 'Sukiyabashi Jiro',
        cuisine: 'Sushi',
        priceRange: '¥40,000+',
        rating: 4.8,
        description: 'World-renowned sushi restaurant, 3 Michelin stars'
      },
      {
        id: 'r2',
        name: 'Ichiran Ramen',
        cuisine: 'Ramen',
        priceRange: '¥1,000-2,000',
        rating: 4.2,
        description: 'Famous tonkotsu ramen chain with individual booth seating'
      },
      {
        id: 'r3',
        name: 'Ginza Kyubey',
        cuisine: 'Sushi',
        priceRange: '¥20,000-30,000',
        rating: 4.6,
        description: 'Traditional sushi restaurant in upscale Ginza district'
      }
    ],
    hotels: [
      {
        id: 'h1',
        name: 'Park Hyatt Tokyo',
        type: 'Luxury Hotel',
        priceRange: '¥80,000-150,000/night',
        rating: 4.5,
        amenities: ['Spa', 'Fine Dining', 'City Views', 'Pool', 'Concierge']
      },
      {
        id: 'h2',
        name: 'Shibuya Excel Hotel Tokyu',
        type: 'Business Hotel',
        priceRange: '¥15,000-25,000/night',
        rating: 4.1,
        amenities: ['Central Location', 'Free WiFi', 'Restaurant', 'Fitness Center']
      },
      {
        id: 'h3',
        name: 'Khaosan Tokyo Kabuki Hostel',
        type: 'Hostel',
        priceRange: '¥3,000-6,000/night',
        rating: 4.0,
        amenities: ['Shared Kitchen', 'Common Area', 'Laundry', 'Free WiFi']
      }
    ],
    transportation: {
      airport: 'Narita (NRT) - 60km, Haneda (HND) - 20km',
      publicTransport: ['JR Lines', 'Tokyo Metro', 'Toei Subway', 'Private Railways'],
      averageCosts: {
        taxi: '¥400-700 per km',
        metro: '¥170-320 per ride',
        bus: '¥210 per ride'
      }
    },
    weather: {
      current: {
        temperature: '24°C',
        condition: 'Partly Cloudy',
        humidity: '65%'
      },
      forecast: [
        { day: 'Today', high: '26°C', low: '20°C', condition: 'Partly Cloudy' },
        { day: 'Tomorrow', high: '28°C', low: '22°C', condition: 'Sunny' },
        { day: 'Day 3', high: '25°C', low: '19°C', condition: 'Rainy' },
        { day: 'Day 4', high: '27°C', low: '21°C', condition: 'Cloudy' },
        { day: 'Day 5', high: '29°C', low: '23°C', condition: 'Sunny' }
      ]
    },
    costs: {
      budget: {
        accommodation: '¥3,000-8,000',
        food: '¥2,000-4,000',
        transport: '¥800-1,500',
        activities: '¥1,000-3,000',
        total: '¥6,800-16,500'
      },
      mid: {
        accommodation: '¥8,000-20,000',
        food: '¥4,000-8,000',
        transport: '¥1,500-3,000',
        activities: '¥3,000-6,000',
        total: '¥16,500-37,000'
      },
      luxury: {
        accommodation: '¥20,000+',
        food: '¥8,000+',
        transport: '¥3,000+',
        activities: '¥6,000+',
        total: '¥37,000+'
      }
    },
    tips: [
      'Learn basic Japanese phrases like "arigato gozaimasu" (thank you)',
      'Carry cash as many places don\'t accept credit cards',
      'Remove shoes when entering homes, some restaurants, and temples',
      'Bow slightly when greeting people',
      'Don\'t eat or drink while walking',
      'Queue politely and don\'t push in trains',
      'Tipping is not customary and can be considered rude'
    ],
    dosDonts: {
      dos: [
        'Bow when greeting or thanking someone',
        'Use both hands when giving/receiving business cards',
        'Take off your shoes in designated areas',
        'Keep your voice down in public transportation',
        'Carry a small towel for hand drying',
        'Learn basic chopstick etiquette'
      ],
      donts: [
        'Don\'t point with chopsticks or stick them upright in rice',
        'Don\'t blow your nose in public',
        'Don\'t tip at restaurants or services',
        'Don\'t wear shoes inside traditional accommodations',
        'Don\'t talk loudly on trains or buses',
        'Don\'t touch people without permission'
      ]
    }
  };

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setCityInfo(mockCityData);
      setLoading(false);
    }, 1000);
  }, [cityName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading city information...</p>
        </div>
      </div>
    );
  }

  if (!cityInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">City not found</h1>
          <Link href="/search" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Globe<span className="text-blue-600">trotter</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/search" className="text-gray-600 hover:text-gray-900">Back to Search</Link>
              <Link href="/plan-trip" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Plan Trip
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* City Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center mb-6">
            <div className="text-8xl mr-6">{cityInfo.image}</div>
            <div>
              <h1 className="text-5xl font-bold mb-2">{cityInfo.name}</h1>
              <p className="text-2xl text-blue-100">{cityInfo.country}, {cityInfo.continent}</p>
              <div className="flex items-center mt-4">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm mr-4">
                  Safety: {cityInfo.safety.rating}/10
                </span>
                <span className="text-blue-100">Population: {cityInfo.population}</span>
              </div>
            </div>
          </div>
          <p className="text-xl text-blue-100 max-w-4xl">{cityInfo.description}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📋' },
              { id: 'attractions', label: 'Attractions', icon: '🎯' },
              { id: 'food', label: 'Food & Dining', icon: '🍽️' },
              { id: 'accommodation', label: 'Hotels', icon: '🏨' },
              { id: 'transport', label: 'Transportation', icon: '🚊' },
              { id: 'weather', label: 'Weather', icon: '🌤️' },
              { id: 'costs', label: 'Costs', icon: '💰' },
              { id: 'tips', label: 'Travel Tips', icon: '💡' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Facts</h2>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Population:</span>
                    <span>{cityInfo.population}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Area:</span>
                    <span>{cityInfo.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Time Zone:</span>
                    <span>{cityInfo.timeZone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Currency:</span>
                    <span>{cityInfo.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Languages:</span>
                    <span>{cityInfo.language.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Best Time to Visit:</span>
                    <span className="text-right">{cityInfo.bestTimeToVisit}</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Climate & Weather</h2>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <p className="text-gray-700 mb-4">{cityInfo.climate}</p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Current Weather</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">{cityInfo.weather.current.temperature}</span>
                    <span className="text-blue-700">{cityInfo.weather.current.condition}</span>
                  </div>
                  <p className="text-blue-600 text-sm mt-2">Humidity: {cityInfo.weather.current.humidity}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attractions' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Top Attractions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cityInfo.attractions.map((attraction) => (
                <div key={attraction.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-4xl mr-4">{attraction.image}</span>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{attraction.name}</h3>
                        <span className="text-blue-600 text-sm">{attraction.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">⭐</span>
                      <span className="text-sm text-gray-600">{attraction.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{attraction.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Entry Fee:</span>
                      <p className="text-gray-600">{attraction.entryFee}</p>
                    </div>
                    <div>
                      <span className="font-medium">Hours:</span>
                      <p className="text-gray-600">{attraction.openingHours}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'food' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Food & Dining</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cityInfo.restaurants.map((restaurant) => (
                <div key={restaurant.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{restaurant.name}</h3>
                      <span className="text-blue-600 text-sm">{restaurant.cuisine}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">⭐</span>
                      <span className="text-sm text-gray-600">{restaurant.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{restaurant.description}</p>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <span className="font-medium text-green-800">Price Range:</span>
                    <p className="text-green-700">{restaurant.priceRange}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'accommodation' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Hotels & Accommodation</h2>
            <div className="space-y-6">
              {cityInfo.hotels.map((hotel) => (
                <div key={hotel.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{hotel.name}</h3>
                      <span className="text-blue-600 text-sm">{hotel.type}</span>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center mb-2">
                        <span className="text-yellow-400 mr-1">⭐</span>
                        <span className="text-sm text-gray-600">{hotel.rating}</span>
                      </div>
                      <span className="text-green-600 font-semibold">{hotel.priceRange}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Amenities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities.map((amenity, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'transport' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Transportation</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Airports</h3>
                <p className="text-gray-700">{cityInfo.transportation.airport}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Public Transport</h3>
                <ul className="space-y-2">
                  {cityInfo.transportation.publicTransport.map((transport, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-blue-600 mr-2">🚊</span>
                      {transport}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Average Transportation Costs</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl mb-2">🚕</div>
                    <div className="font-semibold">Taxi</div>
                    <div className="text-sm text-gray-600">{cityInfo.transportation.averageCosts.taxi}</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-2">🚇</div>
                    <div className="font-semibold">Metro</div>
                    <div className="text-sm text-gray-600">{cityInfo.transportation.averageCosts.metro}</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl mb-2">🚌</div>
                    <div className="font-semibold">Bus</div>
                    <div className="text-sm text-gray-600">{cityInfo.transportation.averageCosts.bus}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'weather' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Weather Forecast</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Current Weather</h3>
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{cityInfo.weather.current.temperature}</div>
                  <div className="text-blue-700 text-lg">{cityInfo.weather.current.condition}</div>
                  <div className="text-blue-600 text-sm mt-2">Humidity: {cityInfo.weather.current.humidity}</div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">5-Day Forecast</h3>
                <div className="space-y-3">
                  {cityInfo.weather.forecast.map((day, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{day.day}</span>
                      <span className="text-gray-600">{day.condition}</span>
                      <div className="text-right">
                        <span className="font-semibold">{day.high}</span>
                        <span className="text-gray-500 ml-1">/ {day.low}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'costs' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Daily Cost Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { type: 'budget', title: 'Budget Travel', color: 'green' },
                { type: 'mid', title: 'Mid-Range', color: 'blue' },
                { type: 'luxury', title: 'Luxury', color: 'purple' }
              ].map((category) => (
                <div key={category.type} className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className={`text-xl font-semibold text-${category.color}-600 mb-4`}>{category.title}</h3>
                  <div className="space-y-3">
                    {Object.entries(cityInfo.costs[category.type as keyof typeof cityInfo.costs]).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className={`mt-4 p-3 bg-${category.color}-50 rounded-lg`}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total per day:</span>
                      <span className={`text-xl font-bold text-${category.color}-600`}>
                        {cityInfo.costs[category.type as keyof typeof cityInfo.costs].total}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tips' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Travel Tips & Cultural Guide</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">💡 General Tips</h3>
                <ul className="space-y-3">
                  {cityInfo.tips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">•</span>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-green-600 mb-4">✅ Do's</h3>
                  <ul className="space-y-2">
                    {cityInfo.dosDonts.dos.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-red-600 mb-4">❌ Don'ts</h3>
                  <ul className="space-y-2">
                    {cityInfo.dosDonts.donts.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-600 mr-2">✗</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="bg-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to visit {cityInfo.name}?</h2>
          <p className="text-xl text-blue-100 mb-8">Start planning your perfect trip today</p>
          <div className="flex justify-center gap-4">
            <Link href={`/plan-trip?destination=${cityInfo.name}`} className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-50 font-semibold">
              Plan Your Trip
            </Link>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 font-semibold">
              Save to Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
