import os
import sys
import asyncio
from pathlib import Path
from dotenv import load_dotenv
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_groq import ChatGroq

current_dir = Path(__file__).resolve().parent
load_dotenv(current_dir / ".env", override=True)

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
AVIATION_STACK_API_KEY = os.getenv("AVIATIONSTACK_API_KEY")
OPENWEATHER_API_KEY = os.getenv("weather_api_key") or os.getenv("OPENWEATHER_API_KEY")

# Cross-platform python executable for aviationstack MCP (Windows, Linux/Cloud, or current interpreter)
aviation_python_win = current_dir / "aviationstack-mcp" / ".venv" / "Scripts" / "python.exe"
aviation_python_nix = current_dir / "aviationstack-mcp" / ".venv" / "bin" / "python"
if aviation_python_win.exists():
    aviation_python = str(aviation_python_win)
elif aviation_python_nix.exists():
    aviation_python = str(aviation_python_nix)
else:
    aviation_python = sys.executable

weather_server_script = str(current_dir / "custom_weather_mcp_server.py")


def get_client():
    return MultiServerMCPClient(
        {
            "tavily": {
                "transport": "streamable_http",
                "url": f"https://mcp.tavily.com/mcp/?tavilyApiKey={TAVILY_API_KEY}"
            },
            "aviationstack": {
                "transport": "stdio",
                "command": aviation_python,
                "args": [
                    "-m",
                    "aviationstack_mcp",
                ],
                "env": {
                    "AVIATION_STACK_API_KEY": AVIATION_STACK_API_KEY or ""
                }
            },
            "weather": {
                "transport": "stdio",
                "command": sys.executable,
                "args": [
                    weather_server_script
                ],
                "env": {
                    "weather_api_key": OPENWEATHER_API_KEY or ""
                }
            }
        }
    )


client = get_client()


async def tavily_mcp_search(query: str):
    """Search for hotels/places via Tavily MCP with fallback to direct Tavily SDK and LLM knowledge."""
    try:
        fresh_client = get_client()
        tools = await fresh_client.get_tools()
        search_tool = next((t for t in tools if "tavily" in t.name.lower() or "search" in t.name.lower()), None)
        if search_tool:
            result = await search_tool.ainvoke({"query": query})
            return result
    except Exception as e:
        print(f"Tavily MCP call failed ({e}). Falling back to direct Tavily SDK...")

    try:
        from tools.tavily_tool import tavily_search
        return tavily_search(query)
    except Exception as fallback_err:
        print(f"Tavily SDK also failed ({fallback_err}). Using LLM travel knowledge fallback...")
        try:
            from config import get_llm
            prompt = f"Recommend 3-4 top hotels, best neighborhoods to stay, and price ranges for this trip: {query}. Format concisely with hotel name, area, and estimated cost."
            res = get_llm().invoke(prompt)
            return f"*(Generated using travel knowledge - web search key not configured)*\n\n{res.content}"
        except Exception:
            return "Hotel recommendations currently unavailable."


async def aviation_mcp_call(tool_name: str, tool_args: dict = None):
    """Call AviationStack MCP tool with fallback to direct flight tool."""
    try:
        fresh_client = get_client()
        tools = await fresh_client.get_tools()
        tool = next((t for t in tools if t.name == tool_name), None)
        if tool:
            return await tool.ainvoke(tool_args or {})
    except Exception as e:
        print(f"Aviation MCP call for '{tool_name}' failed ({e}). Falling back to direct flight tool...")

    try:
        from tools.flight_tool import search_flights
        return search_flights(str(tool_args or ""))
    except Exception as fallback_err:
        return f"Flight information unavailable: {fallback_err}"


async def weather_mcp_search(city: str):
    """Call Weather MCP tool with fallback to direct module call."""
    try:
        fresh_client = get_client()
        tools = await fresh_client.get_tools()
        weather_tool = next((t for t in tools if t.name == "get_current_weather"), None)
        if weather_tool:
            return await weather_tool.ainvoke({"city": city})
    except Exception as e:
        print(f"Weather MCP failed ({e}). Falling back to direct function call...")

    try:
        from custom_weather_mcp_server import get_current_weather
        return get_current_weather(city)
    except Exception as fallback_err:
        return f"Weather unavailable for {city}: {fallback_err}"


async def forecast_mcp_search(city: str):
    """Call Forecast MCP tool with fallback to direct module call."""
    try:
        fresh_client = get_client()
        tools = await fresh_client.get_tools()
        forecast_tool = next((t for t in tools if t.name == "get_forecast"), None)
        if forecast_tool:
            return await forecast_tool.ainvoke({"city": city})
    except Exception as e:
        print(f"Forecast MCP failed ({e}). Falling back to direct function call...")

    try:
        from custom_weather_mcp_server import get_forecast
        return get_forecast(city)
    except Exception as fallback_err:
        return f"Forecast unavailable for {city}: {fallback_err}"


async def get_airports():
    return await aviation_mcp_call("list_airports")


async def get_airlines():
    return await aviation_mcp_call("list_airlines")


async def list_airports(search: str = "", limit: int = 10):
    return await aviation_mcp_call("list_airports", {"search": search, "limit": limit})


async def list_airlines(search: str = "", limit: int = 10):
    return await aviation_mcp_call("list_airlines", {"search": search, "limit": limit})


# Aliases for agents.py
current_weather = weather_mcp_search
forecast = forecast_mcp_search
tavily_search = tavily_mcp_search


# LLM
from config import get_llm
llm = get_llm()


def extract_destination(query: str):
    prompt = f"""
    Extract only the destination city or country.

    Query:
    {query}

    Return only destination name.
    """
    try:
        response = llm.invoke(prompt)
        return response.content.strip()
    except Exception:
        words = query.strip().split()
        return words[-1] if words else query
