
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
from typing import List, Optional

# Load the tourism data from the pickle file
with open("tourism_city_model_with_stats.pkl", "rb") as f:
    tourism_data = pickle.load(f)

app = FastAPI(title="Tourism Recommendation API", version="1.0.0")

class PlaceDetail(BaseModel):
    place_name: str
    type: str
    rating: float
    significance: str
    weekly_off: str
    entrance_fee: int
    dslr_allowed: str

class CityDetail(BaseModel):
    city: str
    city_average_rating: float
    best_time_to_visit: str
    places: List[PlaceDetail]

class RecommendedCityResponse(BaseModel):
    city: str
    city_average_rating: float
    best_time_to_visit: str
    top_5_places: List[PlaceDetail]

@app.get("/city", response_model=List[CityDetail])
def get_all_cities():
    """Get all cities with their details and places"""
    result = []
    for city_name, city_data in tourism_data.items():
        places = []
        for place in city_data["places"]:
            places.append(PlaceDetail(
                place_name=place["Place Name"],
                type=place["Type"],
                rating=place["Rating"],
                significance=place["Significance"],
                weekly_off=place["Weekly Off"],
                entrance_fee=place["Entrance Fee"],
                dslr_allowed=place["DSLR Allowed"]
            ))
        
        result.append(CityDetail(
            city=city_name,
            city_average_rating=city_data["city_average_rating"],
            best_time_to_visit=city_data["best_time_to_visit"],
            places=places
        ))
    return result

@app.get("/city/{city_name}", response_model=CityDetail)
def get_city_details(city_name: str):
    """Get details for a specific city"""
    # Case-insensitive search
    city_data = None
    actual_city_name = None
    
    for city, data in tourism_data.items():
        if city.lower() == city_name.lower():
            city_data = data
            actual_city_name = city
            break
    
    if not city_data:
        raise HTTPException(status_code=404, detail=f"City '{city_name}' not found")
    
    places = []
    for place in city_data["places"]:
        places.append(PlaceDetail(
            place_name=place["Place Name"],
            type=place["Type"],
            rating=place["Rating"],
            significance=place["Significance"],
            weekly_off=place["Weekly Off"],
            entrance_fee=place["Entrance Fee"],
            dslr_allowed=place["DSLR Allowed"]
        ))
    
    return CityDetail(
        city=actual_city_name,
        city_average_rating=city_data["city_average_rating"],
        best_time_to_visit=city_data["best_time_to_visit"],
        places=places
    )

@app.get("/city/{city_name}/recommend", response_model=RecommendedCityResponse)
def get_city_recommendations(city_name: str, limit: Optional[int] = 5):
    """Get top 5 recommended places for a specific city based on ratings"""
    # Case-insensitive search
    city_data = None
    actual_city_name = None
    
    for city, data in tourism_data.items():
        if city.lower() == city_name.lower():
            city_data = data
            actual_city_name = city
            break
    
    if not city_data:
        raise HTTPException(status_code=404, detail=f"City '{city_name}' not found")
    
    # Sort places by rating in descending order and take top 5
    sorted_places = sorted(city_data["places"], key=lambda x: x["Rating"], reverse=True)
    top_places = sorted_places[:limit]
    
    recommended_places = []
    for place in top_places:
        recommended_places.append(PlaceDetail(
            place_name=place["Place Name"],
            type=place["Type"],
            rating=place["Rating"],
            significance=place["Significance"],
            weekly_off=place["Weekly Off"],
            entrance_fee=place["Entrance Fee"],
            dslr_allowed=place["DSLR Allowed"]
        ))
    
    return RecommendedCityResponse(
        city=actual_city_name,
        city_average_rating=city_data["city_average_rating"],
        best_time_to_visit=city_data["best_time_to_visit"],
        top_5_places=recommended_places
    )