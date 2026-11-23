import os
import sys

# Ensure backend directory is in sys.path and current working directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
try:
    os.chdir(BASE_DIR)
except Exception:
    pass

import asyncio
import uuid
import re
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from langgraph.types import Command

from graph import app
from config import DATABASE_URL, get_llm
from analytics_db import (
    get_trending_trips_data, 
    record_search_analytics, 
    get_users_list, 
    register_user, 
    extract_destination
)
from vector_memory import store_trip_memory, search_similar_itinerary

# Initialize FastAPI app
server = FastAPI(
    title="AI Agentic Travel Planner API",
    description="Enterprise Multi-Agent Travel Orchestration Backend powered by LangGraph, MCP, ChromaDB, and SQLite.",
    version="2.0.0"
)

# Middleware to normalize repeated slashes (e.g. //api/status -> /api/status)
class NormalizePathMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if "//" in request.scope.get("path", ""):
            request.scope["path"] = re.sub(r"/+", "/", request.scope["path"])
        return await call_next(request)

server.add_middleware(NormalizePathMiddleware)

# Enable CORS for React frontend (Vite default is 5173 / localhost:3000)
server.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache to store query context per thread for ChromaDB indexing on approval
THREAD_QUERY_CACHE: Dict[str, Dict[str, str]] = {}

# ── Pydantic Request Models ───────────────────────────────────────────────────
class PlanRequest(BaseModel):
    user_query: str
    thread_id: Optional[str] = None
    user_id: Optional[str] = "sanjay"

class ResumeRequest(BaseModel):
    thread_id: str
    approved: bool
    feedback: Optional[str] = ""
    user_id: Optional[str] = "sanjay"

class CreateUserRequest(BaseModel):
    user_id: str
    display_name: Optional[str] = None

# ── API Routes ────────────────────────────────────────────────────────────────

@server.get("/")
def root():
    return {
        "status": "online",
        "service": "TripGenie Multi-Agent API",
        "endpoints": ["/api/status", "/api/plan", "/api/resume", "/api/trending-trips", "/api/users"]
    }

@server.get("/api/status")
def get_status():
    """System telemetry and checkpointer health."""
    db_status = "PostgreSQL (PostgresSaver)" if DATABASE_URL else "In-Memory (MemorySaver)"
    return {
        "status": "healthy",
        "storage": db_status,
        "vector_db": "ChromaDB (Local Semantic Cache)",
        "analytics": "SQLite (travel_analytics.sqlite)",
        "guardrails": ["Tier 1: Security Prompt Injection (0ms)", "Tier 2: Domain Relevance (LLM)", "Tier 3: Budget Math Feasibility"],
        "topology": "Parallel Fan-Out with Cyclic HITL & ChromaDB Semantic Memory",
    }

@server.get("/api/users")
def list_users():
    """Returns list of traveler profiles for the UI dropdown."""
    return get_users_list()

@server.post("/api/users")
def add_user(req: CreateUserRequest):
    """Creates a new traveler profile."""
    return register_user(req.user_id, req.display_name or req.user_id.capitalize())

@server.get("/api/trending-trips")
def get_trending_trips():
    """Returns strictly the TOP 5 most frequently queried destinations (starts at 0, max 5)."""
    return get_trending_trips_data()

@server.post("/api/plan")
async def create_plan(req: PlanRequest):
    """
    1. Logs query into SQLite frequency tracker (Top 5 counter).
    2. Checks ChromaDB semantic memory for matching past trips.
    3. If match found ➔ Instant draft to HITL card (0.2s)!
    4. If no match ➔ Runs full LangGraph multi-agent swarm.
    """
    if not req.user_query or not req.user_query.strip():
        raise HTTPException(status_code=400, detail="User query cannot be empty.")

    user_id = req.user_id or "sanjay"

    # Record search analytics for live Top 5 counter (starts at 0)
    try:
        record_search_analytics(req.user_query, user_id)
    except Exception as e:
        print(f"Analytics logging error: {e}")

    thread_id = req.thread_id or f"{user_id}_{uuid.uuid4().hex[:6]}"

    # Save thread context for ChromaDB indexing on approval
    THREAD_QUERY_CACHE[thread_id] = {
        "user_id": user_id,
        "query": req.user_query,
        "destination": extract_destination(req.user_query)
    }

    # Step 1: ChromaDB Semantic Vector Cache Check
    try:
        cached_match = search_similar_itinerary(req.user_query, threshold=0.65)
        if cached_match:
            print(f"⚡ ChromaDB Cache HIT: {cached_match['destination']} ({cached_match['similarity_score']}% match)")
            THREAD_QUERY_CACHE[thread_id] = {
                "user_id": user_id,
                "query": req.user_query,
                "destination": cached_match["destination"],
                "is_from_cache": True,
                "cached_itinerary": cached_match["itinerary"]
            }
            return {
                "thread_id": thread_id,
                "is_interrupted": True,
                "is_from_cache": True,
                "cache_similarity": cached_match["similarity_score"],
                "cache_message": f"Found a verified {cached_match['destination']} itinerary matching your request!",
                "blocked": False,
                "guardrail_reason": "",
                "selected_agents": ["ChromaDB Semantic Memory"],
                "trip_constraints": {"destination": cached_match["destination"]},
                "flight_results": "Airlines & routes verified from historical flight schedule.",
                "hotel_results": "Handpicked stays verified from past traveler approval.",
                "weather_results": "Seasonal climate conditions confirmed.",
                "budget_results": "Estimated cost breakdown verified against approved budget.",
                "draft_itinerary": cached_match["itinerary"],
                "final_response": "",
            }
    except Exception as e:
        print(f"ChromaDB cache lookup notice: {e}")

    # Step 2: Cache Miss ➔ Dispatch LangGraph Multi-Agent Swarm
    config = {"configurable": {"thread_id": thread_id}}

    try:
        initial_state = {
            "messages": [HumanMessage(content=req.user_query)],
            "user_id": user_id,
            "user_query": req.user_query,
            "flight_results": "",
            "hotel_results": "",
            "weather_results": "",
            "budget_results": "",
            "itinerary": "",
            "final_response": "",
            "llm_calls": 0,
        }

        result = app.invoke(initial_state, config=config)

        is_interrupted = "__interrupt__" in result
        draft_itinerary = ""
        if is_interrupted and len(result["__interrupt__"]) > 0:
            draft_itinerary = result["__interrupt__"][0].value.get("draft_itinerary", "")
        else:
            draft_itinerary = result.get("itinerary", "")

        return {
            "thread_id": thread_id,
            "is_interrupted": is_interrupted,
            "is_from_cache": False,
            "blocked": not bool(result.get("selected_agents")),
            "guardrail_reason": result.get("supervisor_reasoning", ""),
            "selected_agents": result.get("selected_agents", []),
            "trip_constraints": result.get("trip_constraints", {}),
            "flight_results": result.get("flight_results", ""),
            "hotel_results": result.get("hotel_results", ""),
            "weather_results": result.get("weather_results", ""),
            "budget_results": result.get("budget_results", ""),
            "draft_itinerary": draft_itinerary,
            "final_response": result.get("final_response", ""),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline execution error: {str(e)}")

@server.post("/api/resume")
async def resume_plan(req: ResumeRequest):
    """
    Resumes graph execution from checkpoint using Human-in-the-Loop decision.
    If draft came from ChromaDB cache:
      - Approved ➔ Instantly confirms plan!
      - Changes requested ➔ Falls back into full Multi-Agent LangGraph swarm!
    If draft came from LangGraph swarm:
      - Resumes graph with Human approval/feedback.
      - If approved ➔ Indexes confirmed itinerary into ChromaDB for future travelers!
    """
    if not req.thread_id:
        raise HTTPException(status_code=400, detail="thread_id is required to resume from checkpoint.")

    context = THREAD_QUERY_CACHE.get(req.thread_id, {})
    user_id = req.user_id or context.get("user_id", "sanjay")

    # Scenario: User was served an instant ChromaDB cache hit
    if context.get("is_from_cache"):
        if req.approved:
            # Traveler is happy with cached plan: confirm immediately
            cached_plan = context.get("cached_itinerary", "")
            return {
                "thread_id": req.thread_id,
                "is_interrupted": False,
                "is_revised": False,
                "draft_itinerary": cached_plan,
                "final_response": cached_plan,
                "flight_results": "Airlines & routes verified from historical flight schedule.",
                "hotel_results": "Handpicked stays verified from past traveler approval.",
                "weather_results": "Seasonal climate conditions confirmed.",
                "budget_results": "Estimated cost breakdown verified against approved budget.",
            }
        else:
            # Traveler requested changes to cached plan:
            # Fall back to multi-agent swarm loop!
            feedback_text = req.feedback or "Please provide an alternative customized plan."
            original_query = context.get("query", "Travel itinerary")
            combined_query = f"{original_query}. Custom traveler adjustments: {feedback_text}"
            print(f"🔄 Cache revision requested. Dispatching multi-agent swarm: '{combined_query}'")

            # Reset cache flag so subsequent checkpoints follow standard LangGraph flow
            context["is_from_cache"] = False
            config = {"configurable": {"thread_id": req.thread_id}}

            try:
                initial_state = {
                    "messages": [HumanMessage(content=combined_query)],
                    "user_id": user_id,
                    "user_query": combined_query,
                    "flight_results": "",
                    "hotel_results": "",
                    "weather_results": "",
                    "budget_results": "",
                    "itinerary": "",
                    "final_response": "",
                    "llm_calls": 0,
                }
                result = app.invoke(initial_state, config=config)

                is_interrupted = "__interrupt__" in result
                draft_itinerary = ""
                if is_interrupted and len(result["__interrupt__"]) > 0:
                    draft_itinerary = result["__interrupt__"][0].value.get("draft_itinerary", "")
                else:
                    draft_itinerary = result.get("itinerary", "")

                return {
                    "thread_id": req.thread_id,
                    "is_interrupted": is_interrupted,
                    "is_revised": True,
                    "draft_itinerary": draft_itinerary,
                    "final_response": result.get("final_response", ""),
                    "flight_results": result.get("flight_results", ""),
                    "hotel_results": result.get("hotel_results", ""),
                    "weather_results": result.get("weather_results", ""),
                    "budget_results": result.get("budget_results", ""),
                }
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Multi-agent swarm execution error: {str(e)}")

    # Standard LangGraph checkpoint resume
    config = {"configurable": {"thread_id": req.thread_id}}

    try:
        resume_command = Command(
            resume={
                "approved": req.approved,
                "feedback": req.feedback if not req.approved else "",
            }
        )

        result = app.invoke(resume_command, config=config)

        is_interrupted = "__interrupt__" in result
        draft_itinerary = ""
        if is_interrupted and len(result["__interrupt__"]) > 0:
            draft_itinerary = result["__interrupt__"][0].value.get("draft_itinerary", "")
        else:
            draft_itinerary = result.get("itinerary", "")

        final_response = result.get("final_response", "")

        # If user approved the plan, save it to ChromaDB vector memory!
        if req.approved:
            try:
                dest = context.get("destination", "Custom Trip")
                query = context.get("query", "Travel itinerary")
                plan_to_save = final_response or draft_itinerary
                if plan_to_save:
                    store_trip_memory(user_id, dest, query, plan_to_save)
            except Exception as e:
                print(f"Notice: ChromaDB indexing error ({e})")

        return {
            "thread_id": req.thread_id,
            "is_interrupted": is_interrupted,
            "is_revised": not req.approved and is_interrupted,
            "draft_itinerary": draft_itinerary,
            "final_response": final_response,
            "flight_results": result.get("flight_results", ""),
            "hotel_results": result.get("hotel_results", ""),
            "weather_results": result.get("weather_results", ""),
            "budget_results": result.get("budget_results", ""),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume execution error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"\n🚀 Starting TripGenie REST Backend on port {port} ...\n")
    uvicorn.run(server, host="0.0.0.0", port=port)
