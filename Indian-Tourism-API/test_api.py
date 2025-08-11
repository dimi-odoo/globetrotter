import requests

def test_get_all_cities():
    response = requests.get("http://127.0.0.1:8000/city")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert "city" in data[0]
    assert "city_average_rating" in data[0]
    assert "best_time_to_visit" in data[0]
    assert "places" in data[0]
    print("✓ /city endpoint test passed.")
    print(f"  Found {len(data)} cities")

def test_get_city_details(city_name):
    response = requests.get(f"http://127.0.0.1:8000/city/{city_name}")
    assert response.status_code == 200
    data = response.json()
    assert data["city"].lower() == city_name.lower()
    assert "city_average_rating" in data
    assert "best_time_to_visit" in data
    assert "places" in data
    print(f"✓ /city/{city_name} endpoint test passed.")
    print(f"  City rating: {data['city_average_rating']}")
    print(f"  Best time to visit: {data['best_time_to_visit']}")
    print(f"  Number of places: {len(data['places'])}")

def test_get_city_recommendations(city_name):
    response = requests.get(f"http://127.0.0.1:8000/city/{city_name}/recommend")
    assert response.status_code == 200
    data = response.json()
    assert data["city"].lower() == city_name.lower()
    assert "city_average_rating" in data
    assert "best_time_to_visit" in data
    assert "top_5_places" in data
    assert len(data["top_5_places"]) <= 5
    print(f"✓ /city/{city_name}/recommend endpoint test passed.")
    print(f"  Top {len(data['top_5_places'])} recommended places:")
    for i, place in enumerate(data["top_5_places"], 1):
        print(f"    {i}. {place['place_name']} (Rating: {place['rating']})")

if __name__ == "__main__":
    print("Testing Tourism Recommendation API...")
    print("=" * 50)
    
    # Test all endpoints
    test_get_all_cities()
    print()
    
    # Test with Agartala (from your data structure)
    test_get_city_details("Agartala")
    print()
    
    test_get_city_recommendations("Agartala")
    print()
    
    # Test with Agra (from your data structure)
    test_get_city_details("Agra")
    print()
    
    test_get_city_recommendations("Agra")
    print()
    
    print("=" * 50)
    print("All tests passed! 🎉")
