"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { defaultAvatars } from "@/lib/defaultAvatars";

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
    if (!user) return "Shrey Mehta";
    const first = user.firstName || "";
    const last = user.lastName || "";
    return (first || last) ? `${first} ${last}`.trim() : (user.username || "Traveler");
  }, [user]);

  const location = user?.city && user?.country ? `${user.city}, ${user.country}` : "Bharuch, India";
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
    <div className="relative min-h-screen bg-slate-50">
      {/* decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-teal-300/20 to-emerald-400/10 blur-3xl" />
                </div>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:py-10">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
              Back
          </Link>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Profile</h1>
              <p className="mt-1 text-sm text-slate-600">Manage your travel profile, trips and reviews</p>
        </div>
      </div>
          <div className="flex items-center gap-3">
            <Link href="#" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V6h2v5h5v2h-5v5h-2v-5H6v-2h5z"/></svg>
              New Trip
              </Link>
            <Link href="#" className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">Edit Profile</Link>
        </div>
      </div>

        {/* Grid layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-4 xl:col-span-3">
            <div className="sticky top-6 space-y-6">
              {/* Profile card */}
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-slate-900">{displayName}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>
                        {location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="4"/><path d="M18 20a6 6 0 00-12 0"/></svg>
                        Member since {memberSince}
                      </span>
                      {/* Verification Status */}
                      {user && (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          user.isVerified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isVerified ? (
                            <>
                              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                              Verified
                            </>
                          ) : (
                            <>
                              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                              </svg>
                              Not Verified
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{bio}</p>
          </div>
        </div>

                {/* Socials */}
                <div className="mt-4 flex items-center gap-3 text-slate-500">
                  {[
                    <svg key="tw" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.27 4.27 0 001.88-2.36 8.53 8.53 0 01-2.7 1.03 4.26 4.26 0 00-7.25 3.88A12.11 12.11 0 013 4.89a4.25 4.25 0 001.32 5.68 4.22 4.22 0 01-1.93-.53v.05a4.26 4.26 0 003.42 4.18 4.3 4.3 0 01-1.92.07 4.27 4.27 0 003.98 2.96A8.54 8.54 0 012 19.54a12.07 12.07 0 006.56 1.92c7.87 0 12.18-6.52 12.18-12.17 0-.19 0-.37-.01-.56A8.67 8.67 0 0022.46 6z"/></svg>,
                    <svg key="fb" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 10-11.5 9.9v-7h-2.2V12h2.2V9.8c0-2.1 1.25-3.3 3.17-3.3.92 0 1.88.16 1.88.16v2.07h-1.06c-1.04 0-1.36.65-1.36 1.32V12h2.32l-.37 2.9h-1.95v7A10 10 0 0022 12z"/></svg>,
                    <svg key="ig" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5.5A5.5 5.5 0 1112 18.5 5.5 5.5 0 0112 7.5z"/></svg>,
                    <svg key="li" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.6 4.12 5.5 3 5.5S1 4.6 1 3.5 1.88 1.5 3 1.5s1.98.9 1.98 2zM1.5 8h3V22h-3V8zM8.5 8h2.87v1.92h.04c.4-.76 1.39-1.56 2.86-1.56 3.06 0 3.63 2.02 3.63 4.65V22h-3v-6.74c0-1.61-.03-3.68-2.24-3.68-2.24 0-2.59 1.75-2.59 3.56V22h-3V8z"/></svg>,
                  ].map((icon, i) => (
                    <span key={i} className="cursor-pointer text-slate-400 hover:text-blue-600">{icon}</span>
                  ))}
                  </div>

                {/* Quick stats */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <StatMini label="Countries" value={15} />
                  <StatMini label="Trips" value={24} />
                  <StatMini label="Days" value={156} />
                  <StatMini label="Reviews" value={48} />
            </div>
          </div>

              {/* Navigation */}
              <nav className="rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-sm backdrop-blur">
                {[
                  { key: "overview", label: "Overview" },
                  { key: "trips", label: "Trips" },
                  { key: "reviews", label: "Reviews" },
                  { key: "settings", label: "Settings" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key as any)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      activeTab === item.key ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{item.label}</span>
                    {activeTab === item.key && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                  </button>
                ))}
              </nav>
                </div>
          </aside>

          {/* Main content */}
          <main className="col-span-12 lg:col-span-8 xl:col-span-9">
            {/* KPI cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard title="Countries Visited" value="15" accent="from-blue-500 to-indigo-500" icon={
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>
              }/>
              <KpiCard title="Total Trips" value="24" accent="from-emerald-500 to-teal-500" icon={
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/></svg>
              }/>
              <KpiCard title="Travel Days" value="156" accent="from-fuchsia-500 to-pink-500" icon={
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2z"/></svg>
              }/>
              <KpiCard title="Reviews" value="48" accent="from-amber-500 to-orange-500" icon={
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"/></svg>
              }/>
              </div>

            {/* Tabs content */}
            {activeTab === "overview" && (
              <div className="mt-8 space-y-8">
                {/* Preplanned */}
                <SectionHeader title="Preplanned Trips">
                  <Link href="#" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V6h2v5h5v2h-5v5h-2v-5H6v-2h5z"/></svg>
                    Plan New Trip
                  </Link>
                </SectionHeader>
                <CardGrid trips={preplannedTrips} />

                {/* Previous */}
                <SectionHeader title="Previous Trips">
                  <Link href="#" className="text-sm font-medium text-blue-600 hover:underline">View All</Link>
                </SectionHeader>
                <CardGrid trips={previousTrips} />

                {/* Activity */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
                  <ul className="mt-4 space-y-4">
                    {[
                      { title: "Reviewed Maldives Paradise", time: "2d ago" },
                      { title: "Added Tokyo Explorer trip", time: "5d ago" },
                      { title: "Reached 150 travel days milestone", time: "1w ago" },
                    ].map((a, idx) => (
                      <li key={idx} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <span>{a.title}</span>
                        <span className="text-slate-500">{a.time}</span>
                      </li>
                    ))}
                  </ul>
                              </div>
                            </div>
            )}

            {activeTab === "trips" && (
              <div className="mt-8 space-y-8">
                <SectionHeader title="All Trips" />
                <CardGrid trips={[...preplannedTrips, ...previousTrips]} />
                    </div>
                  )}

            {activeTab === "reviews" && (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Reviews</h3>
                <p className="mt-2 text-sm text-slate-600">You have 48 reviews. Review management coming soon.</p>
                </div>
              )}

            {activeTab === "settings" && (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Profile Settings</h3>
                <p className="mt-2 text-sm text-slate-600">Account preferences and privacy controls coming soon.</p>
                                </div>
                              )}
          </main>
                              </div>
                            </div>
                          </div>
  );
}

// UI helpers
function KpiCard({ title, value, icon, accent }: { title: string; value: string | number; icon: React.ReactNode; accent: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-2xl`} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 shadow-inner">
          {icon}
                          </div>
                        </div>
                      </div>
  );
}

function SectionHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {children}
    </div>
  );
}

function CardGrid({ trips }: { trips: Trip[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
                    </div>
  );
}

function TripCard({ trip }: { trip: Trip }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-44 w-full">
        <Image src={trip.image} alt={trip.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="max-w-[75%]">
            <p className="truncate text-sm font-semibold text-white drop-shadow">{trip.title}</p>
            <p className="mt-0.5 line-clamp-1 text-xs text-slate-200">{trip.location}</p>
                </div>
          <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-slate-700 backdrop-blur">{trip.dateRange.split(",")[0]}</span>
            </div>
          </div>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a3 3 0 00-3 3v12a3 3 0 003 3h14a3 3 0 003-3V7a3 3 0 00-3-3zm1 15a1 1 0 01-1 1H5a1 1 0 01-1-1V10h16v9z"/></svg>{trip.dateRange}</span>
          <span className="inline-flex items-center gap-1"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>{trip.location}</span>
        </div>
        <Link href="#" className="text-xs font-medium text-blue-600 hover:underline">View Details</Link>
      </div>
    </div>
  );
}

function StatMini({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center">
      <div className="text-lg font-semibold text-slate-900">{value}</div>
      <div className="text-xs text-slate-600">{label}</div>
    </div>
  );
}
