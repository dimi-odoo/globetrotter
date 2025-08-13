'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Users, Calendar, Star, Award, Globe, Heart, Lightbulb } from 'lucide-react';

export default function AboutPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const features = [
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "AI-Powered Planning",
      description: "Our advanced AI creates personalized itineraries tailored to your preferences, budget, and travel style."
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Comprehensive Destinations",
      description: "Explore thousands of destinations across India with detailed information, photos, and local insights."
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Smart Calendar",
      description: "Visualize your trips, track your travel history, and plan future adventures with our intuitive calendar."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Travel Community",
      description: "Connect with fellow travelers, share experiences, and get inspired by authentic travel stories."
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Authentic Reviews",
      description: "Real reviews and ratings from verified travelers to help you make informed decisions."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Local Insights",
      description: "Discover hidden gems and local favorites with insights from people who know the destinations best."
    }
  ];

  const team = [
    {
      name: "Infinite Loopers",
      role: "Founder & CEO",
    //   image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      description: "Passionate traveler and tech enthusiast with a vision to make travel planning effortless for everyone."
    },
    {
      name: "AI Team",
      role: "Technology Partners",
    //   image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      description: "Powered by Google Gemini AI and advanced machine learning algorithms for intelligent travel recommendations."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Destinations" },
    { number: "50,000+", label: "Happy Travelers" },
    { number: "100,000+", label: "Trips Planned" },
    { number: "4.8", label: "Average Rating" }
  ];

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
              <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">
                Home
              </Link>
              <Link href="/plan-trip" className="text-gray-600 hover:text-gray-900 font-medium">
                Plan Trip
              </Link>
              <Link href="/community" className="text-gray-600 hover:text-gray-900 font-medium">
                Community
              </Link>
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">Welcome, {user.firstName}!</span>
                  <Link href="/profile" className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium">
                    Profile
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                    Sign In
                  </Link>
                  <Link href="/register" className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            About Globetrotter
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Revolutionizing travel planning with AI-powered technology and a passion for incredible experiences across India
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                At Globetrotter, we believe that every journey should be extraordinary. Our mission is to democratize travel planning by leveraging cutting-edge AI technology to create personalized, memorable experiences for every traveler.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We're passionate about showcasing the incredible diversity of India - from the snow-capped Himalayas to pristine beaches, from ancient heritage sites to bustling modern cities. Our platform connects travelers with authentic local experiences and hidden gems.
              </p>
              <div className="flex items-center space-x-4">
                <Heart className="w-6 h-6 text-red-500" />
                <span className="text-gray-700 font-medium">Made with love for travelers, by travelers</span>
              </div>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Beautiful India landscape"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
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
              We combine the latest technology with deep local knowledge to create unparalleled travel experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-shadow">
                <div className="text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600">
              The passionate minds behind Globetrotter
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg text-center">
                {/* <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div> */}
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium mb-4">
                  {member.role}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Our Vision for the Future
          </h2>
          <p className="text-xl text-purple-100 max-w-4xl mx-auto mb-8 leading-relaxed">
            We envision a world where travel planning is effortless, personalized, and accessible to everyone. 
            Our goal is to become the most trusted companion for travelers, helping them discover the beauty 
            and diversity of India while creating memories that last a lifetime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/plan-trip"
              className="bg-white text-purple-600 px-8 py-4 rounded-full hover:bg-gray-50 transition-colors font-semibold text-lg"
            >
              Start Planning Your Trip
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-purple-600 transition-colors font-semibold text-lg"
            >
              Get in Touch
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
                Your personalized travel planning companion for incredible India.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
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
