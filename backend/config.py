import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_groq import ChatGroq

# Always load .env from the backend directory regardless of where process was launched
ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(ENV_PATH, override=True)

# Also check parent directory if present
PARENT_ENV = Path(__file__).resolve().parent.parent / ".env"
if PARENT_ENV.exists():
    load_dotenv(PARENT_ENV, override=False)

GROQ_API_KEY = (os.getenv("GROQ_API_KEY") or "").strip()
if GROQ_API_KEY:
    os.environ["GROQ_API_KEY"] = GROQ_API_KEY

TAVILY_API_KEY = (os.getenv("TAVILY_API_KEY") or "").strip()
AVIATION_STACK_API_KEY = (os.getenv("AVIATION_STACK_API_KEY") or os.getenv("AVIATIONSTACK_API_KEY") or "").strip()
OPENWEATHER_API_KEY = (os.getenv("OPENWEATHER_API_KEY") or os.getenv("weather_api_key") or "").strip()
DATABASE_URL = os.getenv("DATABASE_URL")

# Verified active models for this Groq API Key
CANDIDATE_MODELS = [
    os.getenv("GROQ_MODEL", "openai/gpt-oss-20b"),
    "openai/gpt-oss-120b",
    "qwen/qwen3.8-27b",
]

def get_llm():
    """Returns the primary LLM armed with automatic failover fallbacks."""
    seen = set()
    models = [m for m in CANDIDATE_MODELS if m and not (m in seen or seen.add(m))]

    primary_model = models[0]
    primary_llm = ChatGroq(model=primary_model, api_key=GROQ_API_KEY, temperature=0.2)

    # Groq fallback models
    fallback_llms = [ChatGroq(model=m, api_key=GROQ_API_KEY, temperature=0.2) for m in models[1:]]

    # Optional cross-provider fallback to OpenAI if OPENAI_API_KEY exists
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        try:
            from langchain_openai import ChatOpenAI
            fallback_llms.append(ChatOpenAI(model="gpt-4o-mini", api_key=openai_key))
        except Exception:
            pass

    if fallback_llms:
        return primary_llm.with_fallbacks(fallback_llms)
    return primary_llm
