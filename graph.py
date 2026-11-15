from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
import psycopg
from langgraph.checkpoint.postgres import PostgresSaver

from state import TravelState
from config import DATABASE_URL
from agents import (
    supervisor_agent,
    flight_agent,
    hotel_agent,
    weather_agent,
    budget_agent,
    itinerary_agent,
    human_approval_agent,
    final_response_agent,
)


def route_after_supervisor(state: TravelState):
    """Guardrail router: if input was blocked, terminate immediately."""
    if not state.get("selected_agents"):
        return END
    return "flight_agent"


# Build the Graph
builder = StateGraph(TravelState)

# Register all agent nodes
builder.add_node("supervisor_agent", supervisor_agent)
builder.add_node("flight_agent", flight_agent)
builder.add_node("hotel_agent", hotel_agent)
builder.add_node("weather_agent", weather_agent)
builder.add_node("budget_agent", budget_agent)
builder.add_node("itinerary_agent", itinerary_agent)
builder.add_node("human_approval_agent", human_approval_agent)
builder.add_node("final_response_agent", final_response_agent)

# Workflow edges
builder.add_edge(START, "supervisor_agent")

# Conditional edge based on Guardrail decision
builder.add_conditional_edges(
    "supervisor_agent",
    route_after_supervisor,
    {
        END: END,
        "flight_agent": "flight_agent",
    },
)

builder.add_edge("flight_agent", "hotel_agent")
builder.add_edge("hotel_agent", "weather_agent")
builder.add_edge("weather_agent", "budget_agent")
builder.add_edge("budget_agent", "itinerary_agent")
builder.add_edge("itinerary_agent", "human_approval_agent")
builder.add_edge("human_approval_agent", "final_response_agent")
builder.add_edge("final_response_agent", END)

# Checkpointer (Mandatory for HITL interrupt to save state)
try:
    _conn = psycopg.connect(DATABASE_URL, connect_timeout=2)
    checkpointer = PostgresSaver(_conn)
    checkpointer.setup()
    print("Graph using PostgreSQL checkpointer.")
except Exception as e:
    print(f"Note: PostgreSQL offline ({e}). Using in-memory MemorySaver.")
    checkpointer = MemorySaver()

app = builder.compile(checkpointer=checkpointer)

