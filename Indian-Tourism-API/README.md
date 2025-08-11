# Indian Tourism Recommendation API

A FastAPI-based REST API that provides information about popular Indian cities and tourist places with ratings and recommendations.

## Features

- Get all cities with their places and ratings
- Get specific city details
- Get top 5 recommended places for any city
- Interactive API documentation

## Endpoints

- `GET /city` - Get all cities with places
- `GET /city/{city_name}` - Get specific city details  
- `GET /city/{city_name}/recommend` - Get top 5 recommended places
- `GET /docs` - Interactive API documentation

## Local Development

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

3. Open http://127.0.0.1:8000/docs in your browser

## Deployment

This API is deployed on Render. Visit the live API documentation at your deployed URL.
