# ✈️ VoyageAI — Autonomous Multi-Agent Travel Planner

A production-grade, enterprise travel planning application powered by **LangGraph**, **FastAPI**, **React 18 + Vite**, and the **Model Context Protocol (MCP)**.

---

## 🏗️ Decoupled Full-Stack Architecture

```
ITINERARY AGENT/
├── backend/                       # Python LangGraph & FastAPI REST API
│   ├── server.py                  # FastAPI REST endpoints (/api/plan, /api/resume, /api/status)
│   ├── graph.py                   # LangGraph StateGraph (Parallel Fan-Out + Cyclic HITL)
│   ├── agents.py                  # Specialized agents (Flight, Hotel, Weather, Budget, Itinerary)
│   ├── state.py                   # TypedDict state schema with reducer channels
│   ├── config.py                  # Environment settings, LLMs, PostgreSQL checkpointer
│   ├── mcp_client.py              # MultiServerMCPClient with fallback cascade
│   ├── custom_weather_mcp_server.py # FastMCP OpenWeatherMap microservice
│   ├── requirements.txt           # Python dependencies
│   ├── .env                       # API keys & configuration
│   └── diagrams/                  # System flowcharts & architecture blueprints
│
├── frontend/                      # Modern React + Vite Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx         # Telemetry badges, system status, architecture trigger
│   │   │   ├── TripForm.jsx       # Query input + suggestion chips (incl. security attack chip)
│   │   │   ├── PipelineStatus.jsx # 6-stage live orchestration stepper
│   │   │   ├── SpecialistCards.jsx# Parallel specialist results (Flights, Hotels, Weather, Budget)
│   │   │   ├── HITLReviewCard.jsx # Human-in-the-Loop review card with feedback revision loop
│   │   │   ├── FinalItinerary.jsx # Final verified plan, PDF/Print exporter, Markdown copy
│   │   │   └── ArchitectureModal.jsx # Interactive in-app system flowchart & DFD modal
│   │   ├── services/
│   │   │   └── api.js             # REST API client connecting to FastAPI backend
│   │   ├── App.jsx                # State orchestration
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── run_backend.bat                # 1-click backend launcher (Port 8000)
├── run_frontend.bat               # 1-click frontend launcher (Port 5173)
├── start_all.bat                  # 1-click master launcher for both services
└── README.md
```

---

## ⚡ Quick Start

### 1. Master 1-Click Launch (Recommended)
Simply double-click:
```bash
start_all.bat
```
This automatically boots:
- The **FastAPI Backend** on `http://localhost:8000`
- The **React Frontend** on `http://localhost:5173`
- Opens your default web browser to the application interface.

---

### 2. Manual Terminal Launch

#### Step 1: Start Backend
```bash
cd backend
python server.py
```
*Backend Swagger API docs will be live at `http://localhost:8000/docs`.*

#### Step 2: Start Frontend
```bash
cd frontend
npm run dev
```
*React app will be live at `http://localhost:5173`.*

---

## 🌟 Key Product Capabilities

1. **True Parallel Fan-Out Execution**:
   - Supervisor dispatches Flight, Hotel, and Weather MCP agents concurrently via async gathering, accelerating execution by ~60%.

2. **Human-in-the-Loop (HITL) Checkpointing & Cyclic Loop**:
   - Pauses graph execution using LangGraph `interrupt()`.
   - If user requests changes with natural language feedback, the graph loops back to `itinerary_agent` to synthesize revisions without re-running flight/hotel MCP tools from scratch.

3. **3-Tier Enterprise Guardrails**:
   - **Tier 1 (Regex Security)**: Filters prompt injection attacks (`0ms` latency).
   - **Tier 2 (Domain Relevance)**: LLM classifier restricts scope strictly to travel requests.
   - **Tier 3 (Budget Math Sanity)**: Validates that expenses do not exceed user-specified budget ceilings.

4. **Multi-Server MCP Cascade**:
   - Connects to AviationStack MCP, OpenWeather FastMCP, and Tavily Search MCP with graceful parametric fallback.
