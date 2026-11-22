"""
analytics_db.py — Persistent SQLite Analytics Engine
Tracks multi-user queries, increments query counts dynamically,
and serves the Top 5 most frequent trips.
"""

import os
import sqlite3
import re
from datetime import datetime
from typing import List, Dict, Any

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "travel_analytics.sqlite")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def detect_category(destination: str, query: str) -> str:
    dest_lower = (destination or '').lower()
    query_lower = (query or '').lower()
    
    if any(k in dest_lower or k in query_lower for k in ['goa', 'bali', 'maldives', 'beach', 'coastal', 'island']):
        return 'Beach'
    if any(k in dest_lower or k in query_lower for k in ['manali', 'shimla', 'ladakh', 'kashmir', 'mountain', 'trek', 'alps', 'himalaya']):
        return 'Mountain'
    if any(k in dest_lower or k in query_lower for k in ['paris', 'tokyo', 'rome', 'london', 'culture', 'museum', 'temple', 'heritage', 'kyoto']):
        return 'Cultural'
    return 'Adventure'

def init_analytics_db():
    """Initializes tables and seeds initial Top 5 most popular trips if empty."""
    with get_connection() as conn:
        cursor = conn.cursor()

        # 1. Destination frequency table (strictly Top 5)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS destination_queries (
                destination TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                last_query TEXT NOT NULL,
                duration TEXT DEFAULT 'Flexible',
                budget TEXT DEFAULT 'Custom',
                category TEXT DEFAULT 'Explore',
                query_count INTEGER DEFAULT 1,
                last_user_id TEXT DEFAULT 'traveler',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 2. User accounts table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_profiles (
                user_id TEXT PRIMARY KEY,
                display_name TEXT NOT NULL,
                trips_planned INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 3. Raw search audit log
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS query_audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                query TEXT NOT NULL,
                detected_destination TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.commit()

        # Seed starter demo users if empty
        cursor.execute("SELECT COUNT(*) as cnt FROM user_profiles;")
        if cursor.fetchone()["cnt"] == 0:
            cursor.executemany("""
                INSERT OR IGNORE INTO user_profiles (user_id, display_name, trips_planned)
                VALUES (?, ?, ?);
            """, [
                ("sanjay", "Sanjay", 2),
                ("alice", "Alice", 2),
                ("rahul", "Rahul", 1)
            ])
            conn.commit()

        # Seed Top 5 most requested getaways if empty
        cursor.execute("SELECT COUNT(*) as cnt FROM destination_queries;")
        if cursor.fetchone()["cnt"] == 0:
            cursor.executemany("""
                INSERT OR IGNORE INTO destination_queries 
                (destination, title, last_query, duration, budget, category, query_count, last_user_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """, [
                ("Goa", "4-Day Goa Beach & Nightlife Escape", "Plan a 4-day relaxing beach trip to Goa for 2 people with luxury beachfront hotel, water sports, and flight options, budget under ₹40,000.", "4 Days / 3 Nights", "₹35,000 - ₹40,000", "Beach", 12, "sanjay"),
                ("Paris", "5-Day Paris Culture, Art & Historic Louvre Tour", "Plan a 5-day cultural trip to Paris under $2,500 including boutique hotel near Louvre, museum passes, and scenic cafes.", "5 Days / 4 Nights", "$2,200 - $2,500", "Cultural", 9, "alice"),
                ("Manali", "3-Day Solang Valley Trek & Cafe Trail", "Plan a 3-day trekking and cafe hopping trip to Manali under ₹20,000 starting from Delhi.", "3 Days / 2 Nights", "₹15,000 - ₹20,000", "Mountain", 8, "rahul"),
                ("Tokyo", "6-Day Tokyo Food, Temples & Tech Tour", "Plan a 6-day trip to Tokyo under $2,800 focusing on ramen hotspots, Akihabara tech district, Shibuya, and Mount Fuji day trip.", "6 Days / 5 Nights", "$2,500 - $2,800", "Cultural", 6, "sanjay"),
                ("Switzerland", "5-Day Swiss Alps Scenic Rail & Lake Tour", "Plan a 5-day scenic tour of Switzerland covering Interlaken, Lucerne, panoramic trains, and mountain peaks under $3,200.", "5 Days / 4 Nights", "$2,800 - $3,200", "Adventure", 5, "alice")
            ])
            conn.commit()

def extract_destination(query: str) -> str:
    """Extracts likely destination keyword from freeform user prompt."""
    known_places = [
        "Goa", "Paris", "Manali", "Tokyo", "Dubai", "Kerala", "Rome", "London",
        "Bali", "Singapore", "Jaipur", "Ladakh", "Kashmir", "New York", "Barcelona",
        "Maldives", "Bangkok", "Switzerland", "Shimla", "Udaipur", "Vietnam", "Ooty"
    ]
    for place in known_places:
        if re.search(r'\b' + re.escape(place) + r'\b', query, re.IGNORECASE):
            return place.title()
    
    # Heuristic match: "trip to X" or "in X"
    match = re.search(r'\b(?:to|in|visit)\s+([A-Z][a-zA-Z\s]+?)(?:\s+(?:under|for|with|from|\d|$))', query)
    if match:
        candidate = match.group(1).strip()
        if len(candidate) > 2 and len(candidate.split()) <= 3:
            return candidate.title()
            
    # Fallback to first capitalized noun
    words = [w for w in query.split() if len(w) > 3 and w[0].isupper()]
    if words:
        return words[0].title()

    return "Custom Getaway"

def extract_budget(query: str) -> str:
    """Extracts budget mention if present."""
    match = re.search(r'(?:under|budget|max|approx)\s*([₹$€£\d,kK\s]+)', query, re.IGNORECASE)
    if match:
        return match.group(0).strip().title()
    return "Custom"

def extract_duration(query: str) -> str:
    """Extracts duration mention if present."""
    match = re.search(r'(\d+[\s-]*(?:days?|nights?|weekend))', query, re.IGNORECASE)
    if match:
        return match.group(1).strip().title()
    return "Flexible"

def record_search_analytics(query: str, user_id: str = "sanjay"):
    """
    Increments query count for destination, logs user activity,
    and updates per-user planned trips count.
    """
    if not query or not query.strip():
        return

    destination = extract_destination(query)
    duration = extract_duration(query)
    budget = extract_budget(query)
    category = detect_category(destination, query)
    title = f"{duration} {destination} Trip"

    with get_connection() as conn:
        cursor = conn.cursor()

        # 1. Log to raw audit table
        cursor.execute("""
            INSERT INTO query_audit_logs (user_id, query, detected_destination)
            VALUES (?, ?, ?);
        """, (user_id, query.strip(), destination))

        # 2. Upsert into destination_queries (Atomic Count + 1)
        cursor.execute("""
            INSERT INTO destination_queries 
                (destination, title, last_query, duration, budget, category, query_count, last_user_id, updated_at)
            VALUES 
                (?, ?, ?, ?, ?, ?, 1, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(destination) DO UPDATE SET
                query_count = query_count + 1,
                last_query = excluded.last_query,
                last_user_id = excluded.last_user_id,
                duration = CASE WHEN duration = 'Flexible' THEN excluded.duration ELSE duration END,
                budget = CASE WHEN budget = 'Custom' THEN excluded.budget ELSE budget END,
                category = CASE WHEN category = 'Explore' THEN excluded.category ELSE category END,
                updated_at = CURRENT_TIMESTAMP;
        """, (destination, title, query.strip(), duration, budget, category, user_id))

        # 3. Ensure user profile exists and increment their trip counter
        cursor.execute("""
            INSERT INTO user_profiles (user_id, display_name, trips_planned)
            VALUES (?, ?, 1)
            ON CONFLICT(user_id) DO UPDATE SET
                trips_planned = trips_planned + 1;
        """, (user_id, user_id.capitalize()))

        conn.commit()

def get_trending_trips_data() -> Dict[str, Any]:
    """
    Returns strictly the TOP 5 most frequently queried destinations across all users.
    Ordered strictly by query_count DESC.
    """
    with get_connection() as conn:
        cursor = conn.cursor()

        # Query top 5 destinations ordered strictly by query_count DESC
        cursor.execute("""
            SELECT 
                destination, 
                title, 
                last_query as query, 
                duration, 
                budget, 
                category, 
                query_count as searches, 
                last_user_id, 
                updated_at
            FROM destination_queries
            ORDER BY query_count DESC, updated_at DESC
            LIMIT 5;
        """)
        rows = cursor.fetchall()
        trips = []
        for r in rows:
            trips.append({
                "id": r["destination"].lower().replace(" ", "-"),
                "destination": r["destination"],
                "title": r["title"],
                "query": r["query"],
                "duration": r["duration"],
                "budget": r["budget"],
                "category": r["category"],
                "searches": r["searches"],
                "last_user_id": r["last_user_id"] or "traveler",
                "badge": f"🔥 {r['searches']} Planned",
                "icon": "compass"
            })

        # Total query count across the platform
        cursor.execute("SELECT COUNT(*) as total FROM query_audit_logs;")
        audit_row = cursor.fetchone()
        total_queries = audit_row["total"] if audit_row else len(trips)

        return {
            "status": "success",
            "total_platform_queries": max(total_queries, sum(t["searches"] for t in trips)),
            "trips": trips  # Strictly Top 5!
        }

def get_users_list() -> List[Dict[str, Any]]:
    """Returns list of traveler profiles for the profile switcher."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT user_id, display_name, trips_planned 
            FROM user_profiles 
            ORDER BY trips_planned DESC, display_name ASC;
        """)
        return [dict(r) for r in cursor.fetchall()]

def register_user(user_id: str, display_name: str) -> Dict[str, Any]:
    """Creates a new traveler profile."""
    clean_id = re.sub(r'[^a-zA-Z0-9_-]', '', user_id.lower()).strip()
    if not clean_id:
        clean_id = f"traveler_{int(datetime.now().timestamp()) % 1000}"

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR IGNORE INTO user_profiles (user_id, display_name, trips_planned)
            VALUES (?, ?, 0);
        """, (clean_id, display_name or clean_id.capitalize()))
        conn.commit()

    return {"user_id": clean_id, "display_name": display_name or clean_id.capitalize()}

# Initialize on module load
init_analytics_db()
