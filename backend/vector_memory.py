"""
vector_memory.py — ChromaDB Local Semantic Vector Memory & Cache
Provides instant semantic itinerary matching across users and persistent traveler memory.
100% Local, zero cloud API keys, zero external subscriptions.
"""

import os
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List

CHROMA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chroma_db")

_client = None
_collection = None

def get_chroma_collection():
    """Initializes and returns the shared ChromaDB collection."""
    global _client, _collection
    if _collection is not None:
        return _collection

    try:
        import chromadb
        from chromadb.config import Settings

        # Initialize persistent disk client in backend/chroma_db
        _client = chromadb.PersistentClient(
            path=CHROMA_DIR,
            settings=Settings(anonymized_telemetry=False)
        )
        
        # Get or create the vector collection for trips
        _collection = _client.get_or_create_collection(
            name="traveler_itineraries",
            metadata={"hnsw:space": "cosine"}
        )
        return _collection
    except Exception as e:
        print(f"Warning: ChromaDB initialization error ({e}). Running in mock vector mode.")
        return None

def store_trip_memory(user_id: str, destination: str, query: str, itinerary: str) -> bool:
    """
    Saves an approved itinerary into ChromaDB with metadata.
    Indexed by semantic embedding so any future traveler asking a similar trip can benefit.
    """
    collection = get_chroma_collection()
    if not collection:
        return False

    try:
        doc_id = f"trip_{user_id}_{uuid.uuid4().hex[:8]}"
        doc_text = f"Destination: {destination}. Request: {query}. Itinerary Master Plan: {itinerary}"
        
        collection.add(
            documents=[doc_text],
            metadatas=[{
                "user_id": user_id,
                "destination": destination,
                "query": query,
                "created_at": datetime.now().isoformat()
            }],
            ids=[doc_id]
        )
        print(f"Stored itinerary in ChromaDB: {destination} for user '{user_id}'.")
        return True
    except Exception as e:
        print(f"Failed to store in ChromaDB: {e}")
        return False

def search_similar_itinerary(query: str, threshold: float = 0.65) -> Optional[Dict[str, Any]]:
    """
    Searches ChromaDB for semantic matches to the user's travel query.
    If a past verified itinerary matches with similarity >= threshold,
    returns it immediately for instant HITL review!
    """
    collection = get_chroma_collection()
    if not collection:
        return None

    try:
        count = collection.count()
        if count == 0:
            return None

        # Query top 1 closest semantic match
        results = collection.query(
            query_texts=[query],
            n_results=1
        )

        if not results or not results["documents"] or len(results["documents"][0]) == 0:
            return None

        distance = results["distances"][0][0]
        # In cosine space, similarity = 1 - distance
        similarity = max(0.0, 1.0 - distance)

        if similarity >= threshold:
            metadata = results["metadatas"][0][0]
            full_doc = results["documents"][0][0]
            
            # Extract just the itinerary text after the prefix
            itinerary_text = full_doc
            if "Itinerary Master Plan:" in full_doc:
                itinerary_text = full_doc.split("Itinerary Master Plan:", 1)[1].strip()

            return {
                "destination": metadata.get("destination", "Verified Trip"),
                "original_user": metadata.get("user_id", "fellow_traveler"),
                "user_id": metadata.get("user_id", "fellow_traveler"),
                "similarity_score": round(similarity * 100, 1),
                "itinerary": itinerary_text,
                "created_at": metadata.get("created_at", "")
            }

        return None
    except Exception as e:
        print(f"Error querying ChromaDB: {e}")
        return None

def get_user_trip_count(user_id: str = None) -> int:
    """Returns number of verified trips saved (optionally filtered by user_id)."""
    collection = get_chroma_collection()
    if not collection:
        return 0
    try:
        if user_id:
            results = collection.get(where={"user_id": user_id})
        else:
            results = collection.get()
        return len(results["ids"]) if results and "ids" in results else 0
    except Exception:
        return 0
