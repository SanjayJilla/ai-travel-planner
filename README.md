# ✈️ AI Multi-Agent Travel Planning System

An autonomous, multi-agent travel planning assistant powered by **LangGraph**, **Groq (Llama 3 / Mixtral)**, and the **Model Context Protocol (MCP)**. 

Instead of searching ten different travel websites yourself, this system coordinates specialized AI agents (Flights, Hotels, Sightseeing, Weather, and Budget) to research, plan, and verify a complete personalized itinerary through a clean web interface.

---

## 💡 Quick Note: Why Don't I See Travel Output in the Terminal?

If you run the app and wonder why the terminal isn't printing the trip plan, **that is completely normal and intentional**:

1. **This is a web app, not a CLI script**: When you run `streamlit run frontend.py`, the terminal only serves as the background web server engine. 
2. **The output lives in your browser**: All agent planning, live thoughts, interactive approval buttons, and final itineraries are displayed in real-time on the **Streamlit web page (`http://localhost:8501`)**.
3. **The terminal is only for system logs**: It only shows server status, API connection events, or errors so your terminal stays clean and readable.

---

## 🚀 How to Run This Project Locally (Step-by-Step)

Anyone can run this project on their own machine in under 5 minutes without needing any cloud deployment.

### Prerequisites
- **Python 3.10, 3.11, or 3.12** installed on your system.
- A free **Groq API Key** (for fast LLM inference): [console.groq.com](https://console.groq.com)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

---

### Step 2: Create and Activate a Virtual Environment

**On Windows (PowerShell / Command Prompt):**
```powershell
python -m venv .venv
.\.venv\Scripts\activate
```

**On macOS / Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

### Step 3: Install Required Packages
```bash
pip install -r requirements.txt
```

---

### Step 4: Configure Your Environment Variables (`.env`)

Create a file named `.env` in the root folder (or copy from `.env.example` if available):

```ini
# Core LLM (Required - Get for free at https://console.groq.com)
GROQ_API_KEY=your_groq_api_key_here

# Model Selection 
GROQ_MODEL=openai/gpt-oss-20b

# Live Tools & APIs (Optional - system uses built-in smart fallbacks if omitted)
TAVILY_API_KEY=your_tavily_api_key_here
AVIATIONSTACK_API_KEY=your_aviationstack_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Memory / Database (Optional - defaults to memory/local storage)
DATABASE_URL=postgresql://postgres:postgres@localhost:port_no/database_name
```

> **Tip:** You only need `GROQ_API_KEY` to start testing immediately! If you don't have Tavily, AviationStack, or OpenWeather keys yet, the agents automatically fall back to intelligent built-in travel knowledge and tool fallbacks without crashing.

---

### Step 5: Launch the Web App!
Run this single command in your terminal:
```bash
streamlit run frontend.py
```

Your browser will automatically open to:
👉 **`http://localhost:8501`**

---

## 🎯 How to Use It

1. Type a trip request naturally in the chat input, for example:
   - *"Plan a 5-day holiday to Goa for 2 people with a budget of ₹50,000 in December."*
   - *"I want a 7-day scenic trip to Switzerland for a couple starting from Zurich."*
   - *"Plan a budget-friendly 4-day solo trip to London focused on museums and street food."*
2. The **Planner Supervisor** identifies your destination, dates, travelers, and budget.
3. Independent worker agents research:
   - ✈️ **Flight Agent**: Finds airlines, schedules, and estimates.
   - 🏨 **Hotel Agent**: Recommends hotels, areas, and nightly rates.
   - 📍 **Activity Agent**: Curates a realistic day-by-day sightseeing plan.
   - 🌦️ **Weather Agent**: Checks climate and rain forecasts for your travel dates.
   - 💰 **Budget Agent**: Verifies that your total estimated expenses stay within budget.
4. Review the consolidated itinerary in the browser, request any adjustments, or click **"Download Plan (.md)"** to save your itinerary locally whenever you want.


