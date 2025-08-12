"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { defaultAvatars } from "@/lib/defaultAvatars";
import { ChevronLeft, Plus, MapPin, Calendar, Star, Users, Globe, Clock, Edit3, ExternalLink } from "lucide-react";

// Types
interface Trip {
  id: string;
  title: string;
  dateRange: string;
  location: string;
  image: string;
}

export default function ProfileDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "trips" | "reviews" | "settings">("overview");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const avatarUrl = useMemo(() => {
    return (
      user?.profilePhoto ||
      user?.avatar ||
      defaultAvatars?.[0]?.url ||
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop"
    );
  }, [user]);

  const displayName = useMemo(() => {
    if (!user) return "JAY ARIWALA";
    const first = user.firstName || "";
    const last = user.lastName || "";
    return (first || last) ? `${first} ${last}`.toUpperCase() : (user.username || "TRAVELER").toUpperCase();
  }, [user]);

  const location = user?.city && user?.country ? `${user.city}, ${user.country}` : "surat, India";
  const memberSince = user?.createdAt ? new Date(user.createdAt).getFullYear() : 2025;
  const bio = user?.description || "Good Man";

  const preplannedTrips: Trip[] = [
    {
      id: "paris-adventure",
      title: "Paris Adventure",
      dateRange: "Mar 15 - Mar 22, 2024",
      location: "Paris, France",
      image: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=1400&auto=format&fit=crop",
    },
    {
      id: "tokyo-explorer",
      title: "Tokyo Explorer",
      dateRange: "Apr 5 - Apr 15, 2024",
      location: "Tokyo, Japan",
      image: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?q=80&w=1400&auto=format&fit=crop",
    },
    {
      id: "greek-islands",
      title: "Greek Islands",
      dateRange: "May 20 - May 30, 2024",
      location: "Santorini, Greece",
      image: "https://images.unsplash.com/photo-1506846547053-0ba0e554624e?q=80&w=1400&auto=format&fit=crop",
    },
  ];

  const previousTrips: Trip[] = [
    {
      id: "bali-retreat",
      title: "Bali Retreat",
      dateRange: "Dec 10 - Dec 20, 2023",
      location: "Bali, Indonesia",
      image: "https://images.unsplash.com/photo-1518544889286-bc53ef7cf0d2?q=80&w=1400&auto=format&fit=crop",
    },
    {
      id: "swiss-alps",
      title: "Swiss Alps",
      dateRange: "Nov 5 - Nov 15, 2023",
      location: "Switzerland",
      image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1400&auto=format&fit=crop",
    },
    {
      id: "maldives-paradise",
      title: "Maldives Paradise",
      dateRange: "Oct 1 - Oct 10, 2023",
      location: "Maldives",
      image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1400&auto=format&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <p className="text-sm text-gray-600">Manage your travel profile, trips and reviews</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href="/plan-trip" 
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Trip
              </Link>
              <Link 
                href="/edit-profile" 
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-blue-100">
                    <img 
                      src={avatarUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{displayName}</h2>
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>{location}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-3">
                    <Users className="h-4 w-4" />
                    <span>Member since {memberSince}</span>
                  </div>
                  <p className="text-sm text-gray-700">{bio}</p>
                </div>

                {/* Social Links */}
                <div className="flex justify-center gap-4 mb-6">
                  <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.27 4.27 0 001.88-2.36 8.53 8.53 0 01-2.7 1.03 4.26 4.26 0 00-7.25 3.88A12.11 12.11 0 013 4.89a4.25 4.25 0 001.32 5.68 4.22 4.22 0 01-1.93-.53v.05a4.26 4.26 0 003.42 4.18 4.3 4.3 0 01-1.92.07 4.27 4.27 0 003.98 2.96A8.54 8.54 0 012 19.54a12.07 12.07 0 006.56 1.92c7.87 0 12.18-6.52 12.18-12.17 0-.19 0-.37-.01-.56A8.67 8.67 0 0022.46 6z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12a10 10 0 10-11.5 9.9v-7h-2.2V12h2.2V9.8c0-2.1 1.25-3.3 3.17-3.3.92 0 1.88.16 1.88.16v2.07h-1.06c-1.04 0-1.36.65-1.36 1.32V12h2.32l-.37 2.9h-1.95v7A10 10 0 0022 12z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.98 3.5C4.98 4.6 4.12 5.5 3 5.5S1 4.6 1 3.5 1.88 1.5 3 1.5s1.98.9 1.98 2zM1.5 8h3V22h-3V8zM8.5 8h2.87v1.92h.04c.4-.76 1.39-1.56 2.86-1.56 3.06 0 3.63 2.02 3.63 4.65V22h-3v-6.74c0-1.61-.03-3.68-2.24-3.68-2.24 0-2.59 1.75-2.59 3.56V22h-3V8z"/>
                    </svg>
                  </a>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-gray-900">15</div>
                    <div className="text-xs text-gray-600">Countries</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-gray-900">24</div>
                    <div className="text-xs text-gray-600">Trips</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-gray-900">156</div>
                    <div className="text-xs text-gray-600">Days</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-gray-900">48</div>
                    <div className="text-xs text-gray-600">Reviews</div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                <nav className="p-2">
                  {[
                    { key: "overview", label: "Overview", icon: <div className="w-2 h-2 bg-blue-600 rounded-full"></div> },
                    { key: "trips", label: "Trips", icon: null },
                    { key: "reviews", label: "Reviews", icon: null },
                    { key: "settings", label: "Settings", icon: null },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key as any)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        activeTab === item.key 
                          ? "bg-blue-50 text-blue-700" 
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>{item.label}</span>
                      {activeTab === item.key && item.icon}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {/* Main Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <div>
                      <div className="text-sm text-gray-600">COUNTRIES VISITED</div>
                      <div className="text-xl font-bold text-gray-900">15</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <div>
                      <div className="text-sm text-gray-600">TOTAL TRIPS</div>
                      <div className="text-xl font-bold text-gray-900">24</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <div>
                      <div className="text-sm text-gray-600">TRAVEL DAYS</div>
                      <div className="text-xl font-bold text-gray-900">156</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <div>
                      <div className="text-sm text-gray-600">REVIEWS</div>
                      <div className="text-xl font-bold text-gray-900">48</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preplanned Trips */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Preplanned Trips</h3>
                  <Link 
                    href="/plan-trip" 
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    + Plan New Trip
                  </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {preplannedTrips.map((trip) => (
                    <div key={trip.id} className="min-w-[280px] bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                      <div className="h-32 relative">
                        <img 
                          src={trip.image} 
                          alt={trip.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-1">{trip.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{trip.location}</p>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{trip.dateRange}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{trip.location}</span>
                          </div>
                        </div>
                        <Link 
                          href={`/trips/${trip.id}`}
                          className="inline-block mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Previous Trips */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Previous Trips</h3>
                  <Link 
                    href="/my-trips" 
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    View All
                  </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {previousTrips.map((trip) => (
                    <div key={trip.id} className="min-w-[280px] bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                      <div className="h-32 relative">
                        <img 
                          src={trip.image} 
                          alt={trip.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-1">{trip.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{trip.location}</p>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{trip.dateRange}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{trip.location}</span>
                          </div>
                        </div>
                        <Link 
                          href={`/trips/${trip.id}`}
                          className="inline-block mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <button className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
