'use client';

import { useState } from 'react';
import Link from "next/link";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [travelStyle, setTravelStyle] = useState('');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just redirect to register page
    // In a real app, this would search destinations
    window.location.href = '/register';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Globe<span className="text-blue-600">trotter</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
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
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Your Next Adventure
              <span className="block text-blue-600">Starts Here</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Discover personalized travel experiences, connect with fellow adventurers, 
              and create unforgettable memories with our AI-powered trip planning platform.
            </p>

            {/* Quick Search */}
            <form onSubmit={handleQuickSearch} className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white rounded-2xl shadow-xl">
                <input
                  type="text"
                  placeholder="Where do you want to go?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-6 py-4 text-gray-700 text-lg border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="px-6 py-4 text-gray-700 text-lg border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
                >
                  <option value="">Travel Style</option>
                  <option value="adventure">Adventure</option>
                  <option value="relaxation">Relaxation</option>
                  <option value="cultural">Cultural</option>
                  <option value="business">Business</option>
                  <option value="family">Family</option>
                </select>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg"
                >
                  Explore
                </button>
              </div>
            </form>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">500+</div>
                <div className="text-gray-600">Destinations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">10K+</div>
                <div className="text-gray-600">Happy Travelers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">24/7</div>
                <div className="text-gray-600">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Globetrotter?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI with human expertise to create 
              the perfect travel experience tailored just for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* AI-Powered Planning */}
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">AI-Powered Planning</h3>
              <p className="text-gray-600 leading-relaxed">
                Our intelligent algorithms analyze your preferences, budget, and travel history 
                to create personalized itineraries that match your unique style.
              </p>
            </div>

            {/* Real-time Collaboration */}
            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Collaborative Planning</h3>
              <p className="text-gray-600 leading-relaxed">
                Plan together with friends and family in real-time. Share ideas, vote on activities, 
                and ensure everyone's voice is heard in your travel decisions.
              </p>
            </div>

            {/* Smart Budgeting */}
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Smart Budgeting</h3>
              <p className="text-gray-600 leading-relaxed">
                Track expenses in real-time, get cost predictions, and receive smart 
                recommendations to maximize your travel budget without compromising experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Popular Destinations
            </h2>
            <p className="text-xl text-gray-600">
              Discover the most loved destinations by our travel community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Tokyo, Japan', image: '🏯', travelers: '2.3K' },
              { name: 'Paris, France', image: '🗼', travelers: '1.8K' },
              { name: 'Bali, Indonesia', image: '🏝️', travelers: '1.5K' },
              { name: 'New York, USA', image: '🗽', travelers: '2.1K' }
            ].map((destination) => (
              <div key={destination.name} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow group cursor-pointer">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                  {destination.image}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {destination.name}
                </h3>
                <p className="text-gray-600">
                  {destination.travelers} travelers this month
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Planning Steps */}
      <section className="py-20 bg-white">
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
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
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
    </div>
  );
}