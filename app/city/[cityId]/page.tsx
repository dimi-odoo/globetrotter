'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useParams } from 'next/navigation';

interface Place {
  id: number;
  name: string;
  image: string;
  rating: number;
  timeNeeded: string;
  entranceFee: string;
  weeklyOff: string;
  bestTimeToVisit: string;
  description: string;
  category: string;
}

interface CityData {
  id: string;
  city: string;
  state: string;
  image: string;
  description: string;
  bestTimeToVisit: string;
  places: Place[];
}

const cityData: Record<string, CityData> = {
  'delhi': {
    id: 'delhi',
    city: 'Delhi',
    state: 'Delhi',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'India\'s capital city, a blend of ancient history and modern development.',
    bestTimeToVisit: 'October to March',
    places: [
      {
        id: 1,
        name: 'Red Fort',
        image: 'https://images.unsplash.com/photo-1597149960419-0d900ac2e3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.3,
        timeNeeded: '2-3 hrs',
        entranceFee: '₹35 (Indians), ₹500 (Foreigners)',
        weeklyOff: 'Monday',
        bestTimeToVisit: 'October to March',
        description: 'Historic fortified palace of the Mughal emperors',
        category: 'Historical'
      },
      {
        id: 2,
        name: 'India Gate',
        image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.5,
        timeNeeded: '1-2 hrs',
        entranceFee: 'Free',
        weeklyOff: 'None',
        bestTimeToVisit: 'Evening (5-8 PM)',
        description: 'War memorial dedicated to Indian soldiers',
        category: 'Monument'
      },
      {
        id: 3,
        name: 'Qutub Minar',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.2,
        timeNeeded: '1-2 hrs',
        entranceFee: '₹30 (Indians), ₹500 (Foreigners)',
        weeklyOff: 'None',
        bestTimeToVisit: 'October to March',
        description: 'UNESCO World Heritage Site, tallest brick minaret',
        category: 'Historical'
      },
      {
        id: 4,
        name: 'Lotus Temple',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.4,
        timeNeeded: '1-2 hrs',
        entranceFee: 'Free',
        weeklyOff: 'Monday',
        bestTimeToVisit: 'October to March',
        description: 'Bahá\'í House of Worship known for its lotus-like shape',
        category: 'Religious'
      },
      {
        id: 5,
        name: 'Humayun\'s Tomb',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.3,
        timeNeeded: '1-2 hrs',
        entranceFee: '₹30 (Indians), ₹500 (Foreigners)',
        weeklyOff: 'None',
        bestTimeToVisit: 'October to March',
        description: 'UNESCO World Heritage Site, Mughal architecture',
        category: 'Historical'
      }
    ]
  },
  'mumbai': {
    id: 'mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'The financial capital of India, known as the City of Dreams.',
    bestTimeToVisit: 'November to February',
    places: [
      {
        id: 1,
        name: 'Gateway of India',
        image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.2,
        timeNeeded: '1-2 hrs',
        entranceFee: 'Free',
        weeklyOff: 'None',
        bestTimeToVisit: 'Evening (5-8 PM)',
        description: 'Iconic arch monument overlooking the Arabian Sea',
        category: 'Monument'
      },
      {
        id: 2,
        name: 'Marine Drive',
        image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.4,
        timeNeeded: '2-3 hrs',
        entranceFee: 'Free',
        weeklyOff: 'None',
        bestTimeToVisit: 'Evening (6-9 PM)',
        description: 'Beautiful promenade along the coast, Queen\'s Necklace',
        category: 'Scenic'
      },
      {
        id: 3,
        name: 'Elephanta Caves',
        image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.1,
        timeNeeded: '4-5 hrs',
        entranceFee: '₹40 (Indians), ₹600 (Foreigners)',
        weeklyOff: 'Monday',
        bestTimeToVisit: 'November to February',
        description: 'UNESCO World Heritage Site with ancient cave temples',
        category: 'Historical'
      },
      {
        id: 4,
        name: 'Chhatrapati Shivaji Terminus',
        image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.3,
        timeNeeded: '1 hr',
        entranceFee: 'Free',
        weeklyOff: 'None',
        bestTimeToVisit: 'Anytime',
        description: 'UNESCO World Heritage railway station, Victorian architecture',
        category: 'Architecture'
      },
      {
        id: 5,
        name: 'Juhu Beach',
        image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 3.9,
        timeNeeded: '2-3 hrs',
        entranceFee: 'Free',
        weeklyOff: 'None',
        bestTimeToVisit: 'Evening (5-8 PM)',
        description: 'Popular beach known for street food and sunset views',
        category: 'Beach'
      }
    ]
  },
  'jaipur': {
    id: 'jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    image: 'https://images.unsplash.com/photo-1599661046827-dacde6976549?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'The Pink City, known for its royal palaces and vibrant culture.',
    bestTimeToVisit: 'October to March',
    places: [
      {
        id: 1,
        name: 'Hawa Mahal',
        image: 'https://images.unsplash.com/photo-1599661046827-dacde6976549?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.2,
        timeNeeded: '1-2 hrs',
        entranceFee: '₹50 (Indians), ₹200 (Foreigners)',
        weeklyOff: 'None',
        bestTimeToVisit: 'Morning (8-11 AM)',
        description: 'Palace of Winds with intricate lattice work',
        category: 'Palace'
      },
      {
        id: 2,
        name: 'Amber Fort',
        image: 'https://images.unsplash.com/photo-1599661046827-dacde6976549?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.5,
        timeNeeded: '3-4 hrs',
        entranceFee: '₹100 (Indians), ₹500 (Foreigners)',
        weeklyOff: 'None',
        bestTimeToVisit: 'Morning (8-12 PM)',
        description: 'Magnificent fort with stunning architecture and views',
        category: 'Fort'
      },
      {
        id: 3,
        name: 'City Palace',
        image: 'https://images.unsplash.com/photo-1599661046827-dacde6976549?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.3,
        timeNeeded: '2-3 hrs',
        entranceFee: '₹300 (Indians), ₹500 (Foreigners)',
        weeklyOff: 'None',
        bestTimeToVisit: 'Morning (9-12 PM)',
        description: 'Royal residence with museums and courtyards',
        category: 'Palace'
      },
      {
        id: 4,
        name: 'Jantar Mantar',
        image: 'https://images.unsplash.com/photo-1599661046827-dacde6976549?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.1,
        timeNeeded: '1-2 hrs',
        entranceFee: '₹50 (Indians), ₹200 (Foreigners)',
        weeklyOff: 'None',
        bestTimeToVisit: 'Morning (9-11 AM)',
        description: 'UNESCO World Heritage astronomical observatory',
        category: 'Historical'
      },
      {
        id: 5,
        name: 'Nahargarh Fort',
        image: 'https://images.unsplash.com/photo-1599661046827-dacde6976549?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: 4.2,
        timeNeeded: '2-3 hrs',
        entranceFee: '₹30 (Indians), ₹80 (Foreigners)',
        weeklyOff: 'None',
        bestTimeToVisit: 'Evening (4-7 PM)',
        description: 'Hill fort offering panoramic views of Jaipur',
        category: 'Fort'
      }
    ]
  }
};

export default function CityDetails() {
  const params = useParams();
  const cityId = params.cityId as string;
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const city = cityData[cityId];
  
  if (!city) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">City Not Found</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const categories = ['All', ...Array.from(new Set(city.places.map(place => place.category)))];
  const filteredPlaces = selectedCategory === 'All' 
    ? city.places 
    : city.places.filter(place => place.category === selectedCategory);

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

      {/* City Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30 z-10"></div>
        <Image
          src={city.image}
          alt={city.city}
          fill
          className="object-cover"
        />
        <div className="relative z-20 h-full flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              {city.city}
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-2">
              {city.state}, India
            </p>
            <p className="text-lg opacity-80 mb-4">
              {city.description}
            </p>
            <div className="bg-blue-600 text-white px-4 py-2 rounded-full inline-block">
              Best Time to Visit: {city.bestTimeToVisit}
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Places Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Places to Visit in {city.city}
            </h2>
            <p className="text-xl text-gray-600">
              Discover the best attractions and experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlaces.map((place) => (
              <div key={place.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48 overflow-hidden rounded-t-2xl">
                  <Image
                    src={place.image}
                    alt={place.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    ⭐ {place.rating}
                  </div>
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                    {place.category}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {place.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {place.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Time Needed:</span>
                      <span className="font-medium text-gray-900">{place.timeNeeded}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Entrance Fee:</span>
                      <span className="font-medium text-gray-900">{place.entranceFee}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Weekly Off:</span>
                      <span className="font-medium text-gray-900">{place.weeklyOff}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Best Time:</span>
                      <span className="font-medium text-gray-900">{place.bestTimeToVisit}</span>
                    </div>
                  </div>
                  
                  <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Get Directions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                Globe<span className="text-blue-400">trotter</span>
              </h3>
              <p className="text-gray-400">
                Your personalized travel planning companion for incredible India.
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
    </div>
  );
}