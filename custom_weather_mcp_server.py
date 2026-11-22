from mcp.server.fastmcp import FastMCP
import requests
import os
import urllib3
from pathlib import Path
from dotenv import load_dotenv

# Suppress SSL warnings on campus/corporate proxies
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

dotenv_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path)

mcp = FastMCP("Weather Server")

def _get_api_key():
    return os.getenv("weather_api_key")

@mcp.tool()
def get_current_weather(city: str):
    """Get current weather conditions for a city."""
    api_key = _get_api_key()
    try:
        response = requests.get(
            "https://api.openweathermap.org/data/2.5/weather",
            params={
                "q": city,
                "appid": api_key,
                "units": "metric"
            },
            verify=False,
            timeout=8
        )
        data = response.json()
        
        if response.status_code != 200:
            return data
        return {
            "city": data.get("name", city),
            "temperature": data.get("main", {}).get("temp"),
            "feels_like": data.get("main", {}).get("feels_like"),
            "humidity": data.get("main", {}).get("humidity"),
            "condition": data.get("weather", [{}])[0].get("description", "clear"),
            "wind_speed": data.get("wind", {}).get("speed")
        }
    except Exception as e:
        return {"error": str(e), "city": city}

@mcp.tool()
def get_forecast(city: str):
    """Get 5-day weather forecast for a city."""
    api_key = _get_api_key()
    try:
        response = requests.get(
            "https://api.openweathermap.org/data/2.5/forecast",
            params={
                "q": city,
                "appid": api_key,
                "units": "metric"
            },
            verify=False,
            timeout=8
        )
        data = response.json()

        if response.status_code != 200:
            return data

        forecast_list = []
        for item in data.get("list", []):
            forecast_list.append({
                "datetime": item.get("dt_txt"),
                "temperature": item.get("main", {}).get("temp"),
                "weather": item.get("weather", [{}])[0].get("description", ""),
            })
        return {
            "city": city,
            "forecast": forecast_list
        }
    except Exception as e:
        return {"error": str(e), "city": city}


if __name__ == "__main__":
    mcp.run()
