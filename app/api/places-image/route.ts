import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_API_KEY = "AIzaSyDDtCfRgYYkOHk1IPqmh5Ao0Ojw-2-7eqI";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const placeName = searchParams.get('place');

  if (!placeName) {
    return NextResponse.json({ error: 'Place name is required' }, { status: 400 });
  }

  try {
    // Step 1: Search for the place
    const searchUrl = "https://maps.googleapis.com/maps/api/place/textsearch/json";
    const searchParamsStr = new URLSearchParams({
      query: `${placeName} tourism`,
      key: GOOGLE_API_KEY
    });
    
    const searchResponse = await fetch(`${searchUrl}?${searchParamsStr.toString()}`);
    const searchData = await searchResponse.json();
    
    if (searchData.results && searchData.results.length > 0 && searchData.results[0].photos) {
      const photoRef = searchData.results[0].photos[0].photo_reference;
      
      // Step 2: Get the photo URL
      const photoUrl = "https://maps.googleapis.com/maps/api/place/photo";
      const photoParams = new URLSearchParams({
        maxwidth: "800",
        photoreference: photoRef,
        key: GOOGLE_API_KEY
      });
      
      const imageUrl = `${photoUrl}?${photoParams.toString()}`;
      return NextResponse.json({ imageUrl });
    }
    
    // Return fallback image if no photos found
    return NextResponse.json({ 
      imageUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop" 
    });
    
  } catch (error) {
    console.error('Error fetching image from Google Places:', error);
    return NextResponse.json({ 
      imageUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop" 
    });
  }
}
