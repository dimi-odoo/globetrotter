'use client';

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Wand2, RefreshCw, GripVertical, ChevronUp, ChevronDown, Check, X } from 'lucide-react';

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
  weeklyOff: string;
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

interface DayItinerary {
  day: number;
  date: string;
  activities: TravelPlanItem[];
  totalCost: string;
  highlights: string[];
}

interface GeneratedItinerary {
  days: DayItinerary[];
  totalTrip: {
    totalCost: string;
    highlights: string[];
    summary: string;
  };
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
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY || '');

export default function PlanTrip() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [savingTrip, setSavingTrip] = useState(false);
  
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
  
  // New states for itinerary generation
  const [generatedItinerary, setGeneratedItinerary] = useState<GeneratedItinerary | null>(null);
  const [showItineraryReview, setShowItineraryReview] = useState(false);
  const [generatingItinerary, setGeneratingItinerary] = useState(false);
  const [itineraryApproved, setItineraryApproved] = useState(false);
  const [draggedItem, setDraggedItem] = useState<TravelPlanItem | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Check if user is logged in and verified
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Check if user is verified
      if (!parsedUser.isVerified) {
        router.push(`/verify-otp?email=${encodeURIComponent(parsedUser.email)}`);
        return;
      }
    } else {
      router.push('/login');
    }
  }, [router]);

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

  // Function to fetch place image from Google Places API
  const fetchPlaceImage = async (placeName: string): Promise<string | null> => {
    try {
      const response = await fetch(`/api/places-image?place=${encodeURIComponent(placeName)}`);
      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      }
    } catch (error) {
      console.error('Error fetching place image:', error);
    }
    return null;
  };

  const generateSuggestionsWithGemini = async () => {
    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const destinationInfo = indianDestinations.find(d => d.id === tripPlan.destination);
      const tripDuration = calculateDays();
      
             const prompt = `Generate a detailed travel guide for ${destinationInfo?.name}, ${destinationInfo?.state}, India for a ${tripDuration}-day trip with ${tripPlan.travelers} travelers on a ${tripPlan.budget} budget. 
       
       Interests: ${tripPlan.interests.join(', ')}
       
       Please provide exactly 8-10 recommendations (mix of places to visit and activities to do) in the following JSON format:
       
       [
         {
           "name": "Place/Activity Name",
           "type": "place" or "activity",
           "description": "Brief description (2-3 sentences)",
           "duration": "Time needed (e.g., 2-3 hours)",
           "cost": "Cost in INR (e.g., ₹500-1000 or Free)",
           "rating": 4.5,
           "category": "Historical/Adventure/Cultural/Spiritual/Food & Culture/Nature",
           "bestTime": "Best time to visit (e.g., Morning, Evening, Anytime)",
           "weeklyOff": "Day closed (e.g., Monday, None)",
           "entranceFee": "Entrance fee details (e.g., ₹30 (Indians), ₹500 (Foreigners) or Free)"
         }
       ]
       
       Important: Ensure ALL fields are included for each recommendation. Use "None" for weeklyOff if no specific day is closed. Use "Free" for cost/entranceFee if no charge applies.
       
       Focus on popular, authentic, and highly-rated places and activities. Include a good mix of must-see attractions and unique experiences. Consider the budget and interests provided.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestionsData = JSON.parse(jsonMatch[0]);
        
        // Add IDs and fetch real images for suggestions
        const formattedSuggestions = await Promise.all(
          suggestionsData.map(async (item: any, index: number) => {
            const imageUrl = await fetchPlaceImage(item.name);
            return {
              ...item,
              id: index + 1,
              image: imageUrl || getDefaultImage(item.category || 'general'),
              weeklyOff: item.weeklyOff || 'None',
              entranceFee: item.entranceFee || 'Not specified'
            };
          })
        );
        
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      } else {
        // Fallback to mock data if parsing fails
        await generateMockSuggestions();
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      // Fallback to mock data
      await generateMockSuggestions();
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

  const generateMockSuggestions = async () => {
    // Fallback mock data with real images
    const mockData: Omit<Suggestion, 'image'>[] = [
      {
        id: 1,
        name: 'Red Fort',
        type: 'place',
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
        description: 'Explore authentic Delhi street food with local guide',
        duration: '3-4 hours',
        cost: '₹1,500 - ₹2,500',
        rating: 4.7,
        category: 'Food & Culture',
        bestTime: 'Evening (5-9 PM)',
        weeklyOff: 'None',
        entranceFee: 'Included in tour price'
      },
      {
        id: 3,
        name: 'Qutub Minar',
        type: 'place',
        description: 'Tallest brick minaret in the world, UNESCO World Heritage Site',
        duration: '1-2 hours',
        cost: '₹30 - ₹500',
        rating: 4.5,
        category: 'Historical',
        bestTime: 'Morning (9-11 AM)',
        weeklyOff: 'None',
        entranceFee: '₹30 (Indians), ₹500 (Foreigners)'
      },
      {
        id: 4,
        name: 'Humayun\'s Tomb',
        type: 'place',
        description: 'Magnificent Mughal architecture and beautiful gardens',
        duration: '2-3 hours',
        cost: '₹30 - ₹500',
        rating: 4.4,
        category: 'Historical',
        bestTime: 'Morning (8-11 AM)',
        weeklyOff: 'None',
        entranceFee: '₹30 (Indians), ₹500 (Foreigners)'
      },
      {
        id: 5,
        name: 'Lotus Temple',
        type: 'place',
        description: 'Stunning Bahá\'í House of Worship with peaceful atmosphere',
        duration: '1-2 hours',
        cost: 'Free',
        rating: 4.6,
        category: 'Spiritual',
        bestTime: 'Morning or Evening',
        weeklyOff: 'Monday',
        entranceFee: 'Free'
      },
      {
        id: 6,
        name: 'India Gate',
        type: 'place',
        description: 'Iconic war memorial and popular evening hangout spot',
        duration: '1-2 hours',
        cost: 'Free',
        rating: 4.2,
        category: 'Historical',
        bestTime: 'Evening (5-8 PM)',
        weeklyOff: 'None',
        entranceFee: 'Free'
      }
    ];

    // Fetch real images for mock data
    const mockSuggestions: Suggestion[] = await Promise.all(
      mockData.map(async (item) => {
        const imageUrl = await fetchPlaceImage(item.name);
        return {
          ...item,
          image: imageUrl || getDefaultImage(item.category || 'general')
        };
      })
    );

    setSuggestions(mockSuggestions);
    setShowSuggestions(true);
  };

  const handlePlanTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripPlan.startDate || !tripPlan.endDate || !tripPlan.destination) {
      showNotification('Please fill in all required fields', 'error');
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

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({
      show: true,
      message,
      type
    });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
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
    
    // Show success notification
    showNotification(`${suggestion.name} added to your travel plan!`, 'success');
  };

  const removeFromTravelPlan = (itemId: number) => {
    setTravelPlan(prev => prev.filter(item => item.id !== itemId));
  };

  // Generate day-wise itinerary using Gemini AI
  const generateDayWiseItinerary = async () => {
    if (travelPlan.length === 0) {
      showNotification('Please add some activities to your travel plan first!', 'error');
      return;
    }

    setGeneratingItinerary(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const destinationInfo = indianDestinations.find(d => d.id === tripPlan.destination);
      const tripDuration = calculateDays();
      
      // Create activity list for the prompt
      const activityList = travelPlan.map(item => ({
        name: item.name,
        type: item.type,
        duration: item.duration,
        cost: item.cost,
        bestTime: item.timeSlot,
        notes: item.notes
      }));

      const prompt = `Create a detailed ${tripDuration}-day itinerary for ${destinationInfo?.name}, ${destinationInfo?.state}, India.

Trip Details:
- Travelers: ${tripPlan.travelers} people
- Budget: ${tripPlan.budget}
- Interests: ${tripPlan.interests.join(', ')}
- Start Date: ${tripPlan.startDate}
- Activities to include: ${JSON.stringify(activityList, null, 2)}

Please organize these activities optimally across ${tripDuration} days considering:
1. Logical geographical flow and proximity
2. Time management and realistic scheduling
3. Energy levels throughout the day
4. Best times to visit each place
5. Budget distribution across days
6. Travel time between locations
7. Meal breaks and rest periods

Return a JSON response in this exact format:
{
  "days": [
    {
      "day": 1,
      "date": "Day 1 - [Date]",
      "activities": [
        {
          "id": "unique_id",
          "name": "Activity Name",
          "type": "place/activity",
          "timeSlot": "09:00 AM - 11:00 AM",
          "duration": "2 hours",
          "cost": "₹500-1000",
          "notes": "Detailed description and tips"
        }
      ],
      "totalCost": "₹2000-3000",
      "highlights": ["Key highlight 1", "Key highlight 2"]
    }
  ],
  "totalTrip": {
    "totalCost": "₹${tripDuration * 2500}-${tripDuration * 4000}",
    "highlights": ["Overall trip highlight 1", "Overall trip highlight 2", "Overall trip highlight 3"],
    "summary": "Brief summary of the entire trip experience"
  }
}

Ensure all provided activities are included and well-distributed across the days. Add specific time slots, and include practical tips for each activity.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const itineraryData = JSON.parse(jsonMatch[0]);
        
        // Convert the data to our format and add proper IDs
        const formattedItinerary: GeneratedItinerary = {
          days: itineraryData.days.map((day: any, dayIndex: number) => ({
            ...day,
            activities: day.activities.map((activity: any, actIndex: number) => ({
              ...activity,
              id: Date.now() + dayIndex * 1000 + actIndex,
              day: day.day
            }))
          })),
          totalTrip: itineraryData.totalTrip
        };
        
        setGeneratedItinerary(formattedItinerary);
        setShowItineraryReview(true);
      } else {
        // Fallback: Create a simple day-wise distribution
        createFallbackItinerary();
      }
    } catch (error) {
      console.error('Error generating itinerary:', error);
      createFallbackItinerary();
    } finally {
      setGeneratingItinerary(false);
    }
  };

  // Fallback itinerary creation
  const createFallbackItinerary = () => {
    const tripDuration = calculateDays();
    const activitiesPerDay = Math.ceil(travelPlan.length / tripDuration);
    const days: DayItinerary[] = [];

    for (let dayNum = 1; dayNum <= tripDuration; dayNum++) {
      const startIndex = (dayNum - 1) * activitiesPerDay;
      const endIndex = Math.min(startIndex + activitiesPerDay, travelPlan.length);
      const dayActivities = travelPlan.slice(startIndex, endIndex);
      
      const currentDate = new Date(tripPlan.startDate);
      currentDate.setDate(currentDate.getDate() + dayNum - 1);

      days.push({
        day: dayNum,
        date: `Day ${dayNum} - ${currentDate.toDateString()}`,
        activities: dayActivities.map(activity => ({
          ...activity,
          day: dayNum
        })),
        totalCost: `₹${dayActivities.length * 1000}-${dayActivities.length * 2000}`,
        highlights: dayActivities.slice(0, 2).map(a => a.name)
      });
    }

    const fallbackItinerary: GeneratedItinerary = {
      days,
      totalTrip: {
        totalCost: `₹${travelPlan.length * 800}-${travelPlan.length * 1500}`,
        highlights: travelPlan.slice(0, 3).map(a => a.name),
        summary: `Amazing ${tripDuration}-day trip to ${indianDestinations.find(d => d.id === tripPlan.destination)?.name} with ${travelPlan.length} exciting activities!`
      }
    };

    setGeneratedItinerary(fallbackItinerary);
    setShowItineraryReview(true);
  };

  // Handle drag and drop for rearranging activities
  const handleDragStart = (activity: TravelPlanItem) => {
    setDraggedItem(activity);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetDay: number, targetIndex?: number) => {
    e.preventDefault();
    if (!draggedItem || !generatedItinerary) return;

    const updatedItinerary = { ...generatedItinerary };
    
    // Remove item from its current position
    updatedItinerary.days.forEach(day => {
      day.activities = day.activities.filter(activity => activity.id !== draggedItem.id);
    });

    // Add item to new position
    const targetDayIndex = updatedItinerary.days.findIndex(day => day.day === targetDay);
    if (targetDayIndex !== -1) {
      const updatedActivity = { ...draggedItem, day: targetDay };
      if (targetIndex !== undefined) {
        updatedItinerary.days[targetDayIndex].activities.splice(targetIndex, 0, updatedActivity);
      } else {
        updatedItinerary.days[targetDayIndex].activities.push(updatedActivity);
      }
    }

    setGeneratedItinerary(updatedItinerary);
    setDraggedItem(null);
  };

  const moveActivity = (activityId: number, direction: 'up' | 'down', dayNumber: number) => {
    if (!generatedItinerary) return;

    const updatedItinerary = { ...generatedItinerary };
    const dayIndex = updatedItinerary.days.findIndex(day => day.day === dayNumber);
    
    if (dayIndex === -1) return;

    const activities = updatedItinerary.days[dayIndex].activities;
    const activityIndex = activities.findIndex(activity => activity.id === activityId);
    
    if (activityIndex === -1) return;

    if (direction === 'up' && activityIndex > 0) {
      [activities[activityIndex], activities[activityIndex - 1]] = [activities[activityIndex - 1], activities[activityIndex]];
    } else if (direction === 'down' && activityIndex < activities.length - 1) {
      [activities[activityIndex], activities[activityIndex + 1]] = [activities[activityIndex + 1], activities[activityIndex]];
    }

    setGeneratedItinerary(updatedItinerary);
  };

  const approveItinerary = () => {
    setItineraryApproved(true);
    showNotification('Great! Your itinerary looks perfect. You can now save your trip.', 'success');
  };

  const rejectItinerary = () => {
    setShowItineraryReview(false);
    setGeneratedItinerary(null);
    showNotification('No problem! You can modify your activities and generate a new itinerary.', 'info');
  };

  const saveTrip = async () => {
    // Check for token first (more reliable than user state)
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Please log in to save your trip', 'error');
      router.push('/login');
      return;
    }

    if (!tripPlan.destination || !tripPlan.startDate || !tripPlan.endDate) {
      showNotification('Please fill in all required trip details', 'error');
      return;
    }

    if (!itineraryApproved && !generatedItinerary) {
      showNotification('Please generate and approve your itinerary first!', 'error');
      return;
    }

    setSavingTrip(true);
    try {
      // Get destination details
      const destinationInfo = indianDestinations.find(d => d.id === tripPlan.destination);
      
      // Use generated itinerary if approved, otherwise use the simple travel plan
      let itinerary;
      let highlights;
      let totalCost;
      let notes;

      if (generatedItinerary && itineraryApproved) {
        // Format the generated itinerary for database storage
        itinerary = generatedItinerary.days.map(day => ({
          day: day.day,
          activities: day.activities.map(activity => ({
            name: activity.name,
            type: activity.type,
            timeSlot: activity.timeSlot,
            duration: activity.duration,
            cost: activity.cost,
            notes: activity.notes || ''
          }))
        }));
        
        highlights = generatedItinerary.totalTrip.highlights;
        totalCost = generatedItinerary.totalTrip.totalCost;
        notes = `${generatedItinerary.totalTrip.summary} - Trip planned for ${tripPlan.travelers} travelers with interests in: ${tripPlan.interests.join(', ')}`;
      } else {
        // Fallback to simple format
        itinerary = travelPlan.reduce((acc: any[], item) => {
          const existingDay = acc.find(d => d.day === item.day);
          const cleanActivity = {
            name: item.name || '',
            type: item.type || '',
            timeSlot: item.timeSlot || '',
            duration: item.duration || '',
            cost: item.cost || '',
            notes: (item.notes || '').replace(/\n/g, ' ').replace(/\r/g, ' ').trim()
          };
          
          if (existingDay) {
            existingDay.activities.push(cleanActivity);
          } else {
            acc.push({
              day: item.day,
              activities: [cleanActivity]
            });
          }
          return acc;
        }, []);

        highlights = suggestions.slice(0, 3).map(s => s.name);
        notes = `Trip planned for ${tripPlan.travelers} travelers with interests in: ${tripPlan.interests.join(', ')}`;
      }

      const tripData = {
        destination: destinationInfo?.name || tripPlan.destination,
        state: destinationInfo?.state || '',
        startDate: tripPlan.startDate,
        endDate: tripPlan.endDate,
        travelers: tripPlan.travelers,
        budget: tripPlan.budget,
        interests: tripPlan.interests,
        image: getDefaultImage('general'),
        highlights: highlights,
        itinerary: itinerary,
        notes: notes,
        totalCost: totalCost,
        aiGeneratedPlan: JSON.stringify(suggestions) // Store AI suggestions for reference
      };

      console.log('Trip data being sent:', JSON.stringify(tripData, null, 2));

      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tripData)
      });

      if (!response.ok) {
        throw new Error('Failed to save trip');
      }

      const savedTrip = await response.json();
      showNotification('Trip saved successfully! Redirecting to your trips...', 'success');
      router.push('/calendar');
    } catch (error) {
      console.error('Error saving trip:', error);
      showNotification('Failed to save trip. Please try again.', 'error');
    } finally {
      setSavingTrip(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(suggestions.map(s => s.category)))];
  const filteredSuggestions = selectedCategory === 'All' 
    ? suggestions 
    : suggestions.filter(s => s.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-[9999] max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 p-4 transform transition-all duration-300 ${
          notification.type === 'success' ? 'border-green-500' : 
          notification.type === 'error' ? 'border-red-500' : 
          'border-blue-500'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {notification.type === 'success' && (
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {notification.type === 'error' && (
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {notification.type === 'info' && (
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className={`text-sm font-medium ${
                notification.type === 'success' ? 'text-green-800' : 
                notification.type === 'error' ? 'text-red-800' : 
                'text-blue-800'
              }`}>
                {notification.message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  notification.type === 'success' ? 'text-green-400 hover:text-green-500 focus:ring-green-500' : 
                  notification.type === 'error' ? 'text-red-400 hover:text-red-500 focus:ring-red-500' : 
                  'text-blue-400 hover:text-blue-500 focus:ring-blue-500'
                }`}
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                Globe<span className="text-blue-600">trotter</span>
                {/* <span className="text-sm text-orange-500 ml-2">India</span> */}
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/community"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Community
              </Link>
              <Link
                href="/calendar"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Calendar
              </Link>
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
      <section className="relative py-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/plan_trip.jpg"
            alt="Plan Trip Background"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
                  className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
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
                    className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
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
                    className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
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
                    className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
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
                    className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
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
                                         'Generate Trip Plan'
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
                <div key={suggestion.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
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
                                             {suggestion.type === 'place' ? 'Place' : 'Activity'}
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {suggestion.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
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
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Weekly Off:</span>
                        <span className="font-medium text-gray-900">{suggestion.weeklyOff || 'None'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Entrance Fee:</span>
                        <span className="font-medium text-gray-900">{suggestion.entranceFee || 'Not specified'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Category:</span>
                        <span className="font-medium text-gray-900">{suggestion.category}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => addToTravelPlan(suggestion)}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium mt-auto"
                    >
                                             Add to Travel Plan
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
                             {item.type === 'place' ? 'Place' : 'Activity'} • {item.duration} • {item.cost}
                           </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromTravelPlan(item.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                      title="Remove from plan"
                    >
                                             ✕
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={generateDayWiseItinerary}
                  disabled={generatingItinerary}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {generatingItinerary ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Generating Itinerary...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                                             <span>Generate Day-wise Itinerary</span>
                    </>
                  )}
                </button>
                
                {itineraryApproved && (
                  <button 
                    onClick={saveTrip}
                    disabled={savingTrip}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
                  >
                                         {savingTrip ? 'Saving Trip...' : 'Save Trip to My Trips'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Itinerary Review Section */}
      {showItineraryReview && generatedItinerary && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                 Your Generated Itinerary
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Review your day-wise plan and make adjustments if needed
              </p>
              
              {!itineraryApproved && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <button
                    onClick={approveItinerary}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <Check className="w-5 h-5" />
                                         <span>Looks Great! Approve Itinerary</span>
                  </button>
                  <button
                    onClick={rejectItinerary}
                    className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <X className="w-5 h-5" />
                                         <span>Not Good, Let me modify</span>
                  </button>
                </div>
              )}

              {itineraryApproved && (
                <div className="bg-green-100 border border-green-400 rounded-lg p-4 mb-8 flex items-center justify-center space-x-2">
                  <Check className="w-5 h-5 text-green-600" />
                                     <span className="text-green-800 font-medium">Itinerary Approved! Ready to save.</span>
                </div>
              )}
            </div>

            {/* Day-wise Itinerary */}
            <div className="space-y-8">
              {generatedItinerary.days.map((day) => (
                <div key={day.day} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                     <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{day.date}</h3>
                    <div className="flex flex-wrap gap-4 text-blue-100">
                                             <span>Est. Cost: {day.totalCost}</span>
                       <span>{day.activities.length} Activities</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {/* Day Highlights */}
                    {day.highlights && day.highlights.length > 0 && (
                      <div className="mb-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                                                 <h4 className="font-semibold text-gray-900 mb-2">Day Highlights</h4>
                        <div className="flex flex-wrap gap-2">
                          {day.highlights.map((highlight, index) => (
                            <span key={index} className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm">
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Activities List */}
                    <div className="space-y-4">
                      {day.activities.map((activity, index) => (
                        <div
                          key={activity.id}
                          draggable={!itineraryApproved}
                          onDragStart={() => handleDragStart(activity)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, day.day, index)}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                            itineraryApproved 
                              ? 'bg-gray-50 border-gray-200' 
                              : 'bg-blue-50 border-blue-200 hover:border-blue-400 cursor-move'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-start space-x-4">
                              {!itineraryApproved && (
                                <GripVertical className="w-5 h-5 text-gray-400 mt-1" />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-semibold text-gray-900">{activity.name}</h5>
                                  <span className="text-sm font-medium text-blue-600">{activity.timeSlot}</span>
                                </div>
                                <p className="text-gray-600 text-sm mb-2">{activity.notes}</p>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                                     <span className="flex items-center">
                                     {activity.duration}
                                   </span>
                                   <span className="flex items-center">
                                     {activity.cost}
                                   </span>
                                   <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                                     {activity.type === 'place' ? 'Place' : 'Activity'}
                                   </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {!itineraryApproved && (
                            <div className="flex flex-col space-y-1 ml-4">
                              <button
                                onClick={() => moveActivity(activity.id, 'up', day.day)}
                                disabled={index === 0}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                title="Move up"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => moveActivity(activity.id, 'down', day.day)}
                                disabled={index === day.activities.length - 1}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                title="Move down"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Drop Zone for moving activities between days */}
                    {!itineraryApproved && (
                      <div
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, day.day)}
                        className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                      >
                        Drop activities here to add to this day
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Trip Summary */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
                             <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Trip Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                                     <h4 className="font-semibold text-gray-900 mb-4">Total Estimated Cost</h4>
                  <p className="text-3xl font-bold text-green-600">{generatedItinerary.totalTrip.totalCost}</p>
                </div>
                
                <div>
                                     <h4 className="font-semibold text-gray-900 mb-4">Trip Highlights</h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedItinerary.totalTrip.highlights.map((highlight, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                                 <h4 className="font-semibold text-gray-900 mb-4">Trip Overview</h4>
                <p className="text-gray-700 leading-relaxed">{generatedItinerary.totalTrip.summary}</p>
              </div>

              {itineraryApproved && (
                <div className="mt-8 text-center">
                  <button 
                    onClick={saveTrip}
                    disabled={savingTrip}
                    className="bg-green-600 text-white px-12 py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg disabled:opacity-50"
                  >
                                         {savingTrip ? 'Saving Trip...' : 'Save Complete Trip'}
                  </button>
                </div>
              )}
            </div>

            {!itineraryApproved && (
              <div className="mt-8 text-center">
                <p className="text-gray-600 text-lg">
                  <strong>Tip:</strong> You can drag and drop activities between days or use the arrow buttons to reorder them within a day.
                </p>
              </div>
            )}
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
                {/* <span className="text-orange-400 text-sm ml-2">India</span> */}
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
