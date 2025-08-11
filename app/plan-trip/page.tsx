'use client';

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { GoogleGenerativeAI } from '@google/generative-ai';

interface TripPlan {
  startDate: string;
  endDate: string;
  destination: string;
  travelers: number;
  budget: string;
  interests: string[];
}

interface Suggestion {
  id: number;
  name: string;
  type: 'place' | 'activity';
  image: string;
  description: string;
  duration: string;
  cost: string;
  rating: number;
  category: string;
  bestTime: string;
  weeklyOff?: string;
  entranceFee?: string;
}

interface TravelPlanItem {
  id: number;
  name: string;
  type: 'place' | 'activity';
  day: number;
  timeSlot: string;
  duration: string;
  cost: string;
  notes?: string;
}

const indianDestinations = [
  { id: 'delhi', name: 'Delhi', state: 'Delhi' },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra' },
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan' },
  { id: 'goa', name: 'Goa', state: 'Goa' },
  { id: 'kerala', name: 'Kerala', state: 'Kerala' },
  { id: 'bangalore', name: 'Bangalore', state: 'Karnataka' },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal' },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu' },
  { id: 'udaipur', name: 'Udaipur', state: 'Rajasthan' },
  { id: 'manali', name: 'Manali', state: 'Himachal Pradesh' },
  { id: 'rishikesh', name: 'Rishikesh', state: 'Uttarakhand' },
  { id: 'agra', name: 'Agra', state: 'Uttar Pradesh' }
];

const interestOptions = [
  'Historical Sites', 'Adventure Sports', 'Beaches', 'Mountains', 
  'Wildlife', 'Spiritual', 'Food & Culture', 'Photography', 
  'Shopping', 'Nightlife', 'Art & Museums', 'Nature'
];

const budgetOptions = [
  { value: 'budget', label: 'Budget (₹5,000 - ₹15,000)' },
  { value: 'mid-range', label: 'Mid-range (₹15,000 - ₹35,000)' },
  { value: 'luxury', label: 'Luxury (₹35,000+)' }
];

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyCYdvcHpwgN4COgqwUKwvZO_gdobr3NRZs');

export default function PlanTrip() {
  const [tripPlan, setTripPlan] = useState<TripPlan>({
    startDate: '',
    endDate: '',
    destination: '',
    travelers: 1,
    budget: '',
    interests: []
  });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [travelPlan, setTravelPlan] = useState<TravelPlanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleInputChange = (field: keyof TripPlan, value: any) => {
    setTripPlan(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setTripPlan(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const generateSuggestionsWithGemini = async () => {
    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      const destinationInfo = indianDestinations.find(d => d.id === tripPlan.destination);
      const tripDuration = calculateDays();
      
      const prompt = `Generate a detailed travel guide for ${destinationInfo?.name}, ${destinationInfo?.state}, India for a ${tripDuration}-day trip with ${tripPlan.travelers} travelers on a ${tripPlan.budget} budget. 
      
      Interests: ${tripPlan.interests.join(', ')}
      
      Please provide exactly 8-10 recommendations (mix of places to visit and activities to do) in the following JSON format:
      
      [
        {
          "name": "Place/Activity Name",
          "type": "place" or "activity",
          "description": "Brief description",
          "duration": "Time needed (e.g., 2-3 hours)",
          "cost": "Cost in INR (e.g., ₹500-1000 or Free)",
          "rating": 4.5,
          "category": "Historical/Adventure/Cultural/etc",
          "bestTime": "Best time to visit",
          "weeklyOff": "Day closed (if applicable)",
          "entranceFee": "Entrance fee details (if applicable)"
        }
      ]
      
      Focus on popular, authentic, and highly-rated places and activities. Include a good mix of must-see attractions and unique experiences. Consider the budget and interests provided.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestionsData = JSON.parse(jsonMatch[0]);
        
        // Add IDs and default images to suggestions
        const formattedSuggestions = suggestionsData.map((item: any, index: number) => ({
          ...item,
          id: index + 1,
          image: getDefaultImage(item.category || 'general')
        }));
        
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      } else {
        // Fallback to mock data if parsing fails
        generateMockSuggestions();
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      // Fallback to mock data
      generateMockSuggestions();
    } finally {
      setLoading(false);
    }
  };

  const getDefaultImage = (category: string): string => {
    const imageMap: { [key: string]: string } = {
      'Historical': 'https://images.unsplash.com/photo-1597149960419-0d900ac2e3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'Cultural': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'Adventure': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'Spiritual': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'Food': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'Nature': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'general': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    };
    
    return imageMap[category] || imageMap['general'];
  };

  const generateMockSuggestions = () => {
    // Fallback mock data
    const mockSuggestions: Suggestion[] = [
      {
        id: 1,
        name: 'Red Fort',
        type: 'place',
        image: 'https://images.unsplash.com/photo-1597149960419-0d900ac2e3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Historic Mughal fortress and UNESCO World Heritage Site',
        duration: '2-3 hours',
        cost: '₹35 - ₹500',
        rating: 4.3,
        category: 'Historical',
        bestTime: 'Morning (9-12 PM)',
        weeklyOff: 'Monday',
        entranceFee: '₹35 (Indians), ₹500 (Foreigners)'
      },
      {
        id: 2,
        name: 'Street Food Tour',
        type: 'activity',
        image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Explore authentic Delhi street food with local guide',
        duration: '3-4 hours',
        cost: '₹1,500 - ₹2,500',
        rating: 4.7,
        category: 'Food & Culture',
        bestTime: 'Evening (5-9 PM)'
      }
    ];

    setSuggestions(mockSuggestions);
    setShowSuggestions(true);
  };

  const handlePlanTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripPlan.startDate || !tripPlan.endDate || !tripPlan.destination) {
      alert('Please fill in all required fields');
      return;
    }
    generateSuggestionsWithGemini();
  };

  const calculateDays = () => {
    if (tripPlan.startDate && tripPlan.endDate) {
      const start = new Date(tripPlan.startDate);
      const end = new Date(tripPlan.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const addToTravelPlan = (suggestion: Suggestion) => {
    const newItem: TravelPlanItem = {
      id: Date.now(),
      name: suggestion.name,
      type: suggestion.type,
      day: 1, // Default to day 1, user can modify later
      timeSlot: suggestion.bestTime || 'Morning',
      duration: suggestion.duration,
      cost: suggestion.cost,
      notes: suggestion.description
    };

    setTravelPlan(prev => [...prev, newItem]);
    
    // Show success message
    alert(`${suggestion.name} added to your travel plan!`);
  };

  const removeFromTravelPlan = (itemId: number) => {
    setTravelPlan(prev => prev.filter(item => item.id !== itemId));
  };

  const categories = ['All', ...Array.from(new Set(suggestions.map(s => s.category)))];
  const filteredSuggestions = selectedCategory === 'All' 
    ? suggestions 
    : suggestions.filter(s => s.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                Globe<span className="text-blue-600">trotter</span>
                <span className="text-sm text-orange-500 ml-2">India</span>
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

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Plan Your Perfect Trip
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Create a personalized itinerary for your Indian adventure with AI-powered recommendations
          </p>
        </div>
      </section>

      {/* Trip Planning Form */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Plan a New Trip
            </h2>
            
            <form onSubmit={handlePlanTrip} className="space-y-6">
              {/* Destination Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Destination *
                </label>
                <select
                  value={tripPlan.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  required
                >
                  <option value="">Choose your destination</option>
                  {indianDestinations.map((dest) => (
                    <option key={dest.id} value={dest.id}>
                      {dest.name}, {dest.state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={tripPlan.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={tripPlan.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    min={tripPlan.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    required
                  />
                </div>
              </div>

              {/* Trip Duration Display */}
              {calculateDays() > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 font-medium">
                    Trip Duration: {calculateDays()} {calculateDays() === 1 ? 'day' : 'days'}
                  </p>
                </div>
              )}

              {/* Travelers and Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Travelers
                  </label>
                  <select
                    value={tripPlan.travelers}
                    onChange={(e) => handleInputChange('travelers', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Person' : 'People'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range
                  </label>
                  <select
                    value={tripPlan.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  >
                    <option value="">Select budget range</option>
                    {budgetOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interests Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  What are you interested in? (Select multiple)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {interestOptions.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        tripPlan.interests.includes(interest)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-12 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Suggestions...
                    </>
                  ) : (
                    '🎯 Generate Trip Plan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Suggestions Section */}
      {showSuggestions && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                AI-Powered Suggestions
              </h2>
              <p className="text-xl text-gray-600">
                Personalized recommendations for your {calculateDays()}-day trip to{' '}
                {indianDestinations.find(d => d.id === tripPlan.destination)?.name}
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex justify-center mb-8">
              <div className="flex flex-wrap gap-2">
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

            {/* Suggestions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="relative h-48 overflow-hidden rounded-t-2xl">
                    <Image
                      src={suggestion.image}
                      alt={suggestion.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      ⭐ {suggestion.rating}
                    </div>
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                      {suggestion.type === 'place' ? '📍 Place' : '🎯 Activity'}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {suggestion.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {suggestion.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Duration:</span>
                        <span className="font-medium text-gray-900">{suggestion.duration}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Cost:</span>
                        <span className="font-medium text-gray-900">{suggestion.cost}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Best Time:</span>
                        <span className="font-medium text-gray-900">{suggestion.bestTime}</span>
                      </div>
                      
                      {suggestion.weeklyOff && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Weekly Off:</span>
                          <span className="font-medium text-gray-900">{suggestion.weeklyOff}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Category:</span>
                        <span className="font-medium text-gray-900">{suggestion.category}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => addToTravelPlan(suggestion)}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      ➕ Add to Travel Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Travel Plan Section */}
      {travelPlan.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Your Travel Plan
              </h2>
              <p className="text-xl text-gray-600">
                {travelPlan.length} items added to your itinerary
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="space-y-4">
                {travelPlan.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            {item.type === 'place' ? '📍' : '🎯'} {item.duration} • {item.cost}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromTravelPlan(item.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                      title="Remove from plan"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                  📋 Generate Complete Itinerary
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

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
              <h4 className="text-lg font-semibold mb-4">Trip Planning</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Plan New Trip</a></li>
                <li><a href="#" className="hover:text-white">My Itineraries</a></li>
                <li><a href="#" className="hover:text-white">Travel Tips</a></li>
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
    </div>
  );
}
