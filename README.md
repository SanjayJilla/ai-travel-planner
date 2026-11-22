# ✈️ TripGenie — AI Travel Planner

**TripGenie** is a smart, personal travel planner that turns any trip idea into a complete, day-by-day itinerary with flights, hotels, weather, and budget breakdown in seconds.

---

## 🌟 What TripGenie Does

- **🗓️ Day-by-Day Itineraries**: Generates clean, organized schedules with morning, afternoon, and evening plans.
- **⚡ Instant Memory Match**: Uses local AI memory (ChromaDB) to recall verified itineraries for popular destinations in ~0.2 seconds.
- **👤 Traveler Profiles**: Switch between traveler profiles (Sanjay, Alice, Rahul) or add your own name with zero friction.
- **🔥 Top 5 Trips**: Automatically tracks and displays the 5 most requested getaways.
- **✍️ You're in Control (Review & Edit)**: Always shows you a draft first. Approve it to finalize, or tell TripGenie what to adjust and it will regenerate the plan for you.
- **💰 Budget & Flight Tracking**: Keeps recommendations realistic and within your target budget.

---

## 🚀 How to Run TripGenie Locally

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**

---

### Step 1: Start the Backend (API Server)

Open your terminal:
```bash
cd backend
pip install -r requirements.txt
python server.py
```
*Your backend will be live at `http://localhost:8000`.*

---

### Step 2: Start the Frontend (User Interface)

Open a second terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Your frontend will open at `http://localhost:5173`.*

---

## 🔑 Configuration (`.env`)

Inside the `backend/` folder, create a `.env` file with your free API keys:

```ini
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

*(Optional keys for real-time flights and weather)*:
```ini
OPENWEATHER_API_KEY=your_openweather_key
AVIATIONSTACK_API_KEY=your_aviationstack_key
```

---

## 📁 Project Structure

```
ITINERARY AGENT/
├── backend/                  # Python API & Travel Intelligence
│   ├── server.py             # REST API server (FastAPI)
│   ├── vector_memory.py      # Local AI memory store (ChromaDB)
│   ├── analytics_db.py       # Traveler accounts & Top 5 counter (SQLite)
│   ├── agents.py             # Specialist travel planning agents
│   ├── graph.py              # Agent workflow coordinator
│   └── requirements.txt      # Lightweight production dependencies
│
└── frontend/                 # Modern React Web Application
    ├── src/
    │   ├── components/       # Clean travel UI cards, header, and sidebar
    │   ├── services/api.js   # Fast API connector
    │   └── App.jsx           # Main planner application
    ├── package.json          # Frontend packages
    └── vercel.json           # Vercel deployment configuration
```

---

## ☁️ Deployment

- **Frontend**: One-click deployment on **Vercel** (points to the `frontend/` folder).
- **Backend**: One-click deployment on **Render** or **Fly.io** (points to the `backend/` folder).
