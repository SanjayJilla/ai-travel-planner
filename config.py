import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
AVIATION_STACK_API_KEY = os.getenv("AVIATION_STACK_API_KEY") or os.getenv("AVIATIONSTACK_API_KEY")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY") or os.getenv("weather_api_key")
DATABASE_URL = os.getenv("DATABASE_URL")

# Multi-model fallback chain for high reliability
CANDIDATE_MODELS = [
    os.getenv("GROQ_MODEL", "openai/gpt-oss-20b"),
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
]

def get_llm():
    """Returns the primary LLM armed with automatic failover fallbacks."""
    seen = set()
    models = [m for m in CANDIDATE_MODELS if m and not (m in seen or seen.add(m))]

    primary_model = models[0]
    primary_llm = ChatGroq(model=primary_model, temperature=0.2)

    # Groq fallback models (triggered automatically on 404, 429 rate limit, 503 outage)
    fallback_llms = [ChatGroq(model=m, temperature=0.2) for m in models[1:]]

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