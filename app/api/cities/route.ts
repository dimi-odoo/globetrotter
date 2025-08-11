import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Fetching cities from Indian Tourism API...');
    
    const response = await fetch('https://indian-tourism-api.onrender.com/city/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Globetrotter-App/1.0',
      },
      // Add cache control for better performance
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Successfully fetched cities data');

    // Return the data with proper CORS headers
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error fetching cities from external API:', error);
    
    // Return fallback data if external API fails
    const fallbackData = [
      {
        city: "Agra",
        city_average_rating: 4.8,
        best_time_to_visit: "October to March",
        places: [
          {
            place_name: "Taj Mahal",
            type: "Monument",
            rating: 4.9,
            significance: "Historical",
            weekly_off: "Friday",
            entrance_fee: 50,
            dslr_allowed: "Yes"
          },
          {
            place_name: "Agra Fort",
            type: "Fort",
            rating: 4.6,
            significance: "Historical",
            weekly_off: "None",
            entrance_fee: 30,
            dslr_allowed: "Yes"
          }
        ]
      },
      {
        city: "Jaipur",
        city_average_rating: 4.6,
        best_time_to_visit: "October to March",
        places: [
          {
            place_name: "Hawa Mahal",
            type: "Palace",
            rating: 4.5,
            significance: "Historical",
            weekly_off: "None",
            entrance_fee: 50,
            dslr_allowed: "Yes"
          },
          {
            place_name: "Amber Fort",
            type: "Fort",
            rating: 4.7,
            significance: "Historical",
            weekly_off: "None",
            entrance_fee: 100,
            dslr_allowed: "Yes"
          }
        ]
      },
      {
        city: "Varanasi",
        city_average_rating: 4.7,
        best_time_to_visit: "All",
        places: [
          {
            place_name: "Kashi Vishwanath Temple",
            type: "Temple",
            rating: 4.7,
            significance: "Religious",
            weekly_off: "Not Available",
            entrance_fee: 0,
            dslr_allowed: "No"
          }
        ]
      },
      {
        city: "Mumbai",
        city_average_rating: 4.48,
        best_time_to_visit: "All",
        places: [
          {
            place_name: "Marine Drive",
            type: "Promenade",
            rating: 4.5,
            significance: "Scenic",
            weekly_off: "Not Available",
            entrance_fee: 0,
            dslr_allowed: "Yes"
          },
          {
            place_name: "Gateway of India",
            type: "Monument",
            rating: 4.6,
            significance: "Historical",
            weekly_off: "Not Available",
            entrance_fee: 0,
            dslr_allowed: "Yes"
          }
        ]
      },
      {
        city: "Rann of Kutch",
        city_average_rating: 4.9,
        best_time_to_visit: "Evening",
        places: [
          {
            place_name: "Rann Utsav",
            type: "Cultural",
            rating: 4.9,
            significance: "Cultural",
            weekly_off: "Not Available",
            entrance_fee: 7500,
            dslr_allowed: "Yes"
          }
        ]
      },
      {
        city: "Vrindavan",
        city_average_rating: 4.8,
        best_time_to_visit: "All",
        places: [
          {
            place_name: "Banke Bihari Temple",
            type: "Temple",
            rating: 4.8,
            significance: "Religious",
            weekly_off: "Not Available",
            entrance_fee: 0,
            dslr_allowed: "No"
          }
        ]
      },
      {
        city: "Spiti Valley",
        city_average_rating: 4.8,
        best_time_to_visit: "Morning",
        places: [
          {
            place_name: "Key Monastery",
            type: "Monastery",
            rating: 4.8,
            significance: "Religious",
            weekly_off: "Not Available",
            entrance_fee: 0,
            dslr_allowed: "Yes"
          }
        ]
      },
      {
        city: "Orchha",
        city_average_rating: 4.8,
        best_time_to_visit: "Afternoon",
        places: [
          {
            place_name: "Orchha Fort",
            type: "Fort",
            rating: 4.8,
            significance: "Historical",
            weekly_off: "Not Available",
            entrance_fee: 10,
            dslr_allowed: "Yes"
          }
        ]
      },
      {
        city: "Shimla",
        city_average_rating: 4.7,
        best_time_to_visit: "Morning",
        places: [
          {
            place_name: "The Ridge",
            type: "Scenic Point",
            rating: 4.7,
            significance: "Recreational",
            weekly_off: "Not Available",
            entrance_fee: 0,
            dslr_allowed: "Yes"
          }
        ]
      },
      {
        city: "Udaipur",
        city_average_rating: 4.5,
        best_time_to_visit: "All",
        places: [
          {
            place_name: "City Palace",
            type: "Palace",
            rating: 4.4,
            significance: "Historical",
            weekly_off: "Not Available",
            entrance_fee: 300,
            dslr_allowed: "Yes"
          },
          {
            place_name: "Lake Pichola",
            type: "Lake",
            rating: 4.6,
            significance: "Nature",
            weekly_off: "Not Available",
            entrance_fee: 0,
            dslr_allowed: "Yes"
          }
        ]
      }
    ];

    return NextResponse.json(fallbackData, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
