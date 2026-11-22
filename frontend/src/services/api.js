/**
 * API Service for interacting with FastAPI Agentic Travel Planner Backend
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchUsers() {
  try {
    const res = await fetch(`${BASE_URL}/api/users`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Could not fetch users:', err.message);
    return [
      { user_id: 'sanjay', display_name: 'Sanjay', trips_planned: 0 },
      { user_id: 'alice', display_name: 'Alice', trips_planned: 0 },
      { user_id: 'rahul', display_name: 'Rahul', trips_planned: 0 }
    ];
  }
}

export async function registerNewUser(userId, displayName) {
  try {
    const res = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, display_name: displayName })
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to register user:', err.message);
    return { user_id: userId, display_name: displayName };
  }
}

const FALLBACK_TOP_5_TRIPS = {
  status: 'fallback',
  total_platform_queries: 40,
  trips: [
    {
      id: 'goa',
      destination: 'Goa',
      title: '4-Day Goa Beach & Nightlife Escape',
      query: 'Plan a 4-day relaxing beach trip to Goa for 2 people with luxury beachfront hotel, water sports, and flight options, budget under ₹40,000.',
      duration: '4 Days / 3 Nights',
      budget: '₹35,000 - ₹40,000',
      searches: 12,
      category: 'Beach',
      last_user_id: 'Sanjay'
    },
    {
      id: 'paris',
      destination: 'Paris',
      title: '5-Day Paris Culture, Art & Historic Louvre Tour',
      query: 'Plan a 5-day cultural trip to Paris under $2,500 including boutique hotel near Louvre, museum passes, and scenic cafes.',
      duration: '5 Days / 4 Nights',
      budget: '$2,200 - $2,500',
      searches: 9,
      category: 'Cultural',
      last_user_id: 'Alice'
    },
    {
      id: 'manali',
      destination: 'Manali',
      title: '3-Day Solang Valley Trek & Cafe Trail',
      query: 'Plan a 3-day trekking and cafe hopping trip to Manali under ₹20,000 starting from Delhi.',
      duration: '3 Days / 2 Nights',
      budget: '₹15,000 - ₹20,000',
      searches: 8,
      category: 'Mountain',
      last_user_id: 'Rahul'
    },
    {
      id: 'tokyo',
      destination: 'Tokyo',
      title: '6-Day Tokyo Food, Temples & Tech Tour',
      query: 'Plan a 6-day trip to Tokyo under $2,800 focusing on ramen hotspots, Akihabara tech district, Shibuya, and Mount Fuji day trip.',
      duration: '6 Days / 5 Nights',
      budget: '$2,500 - $2,800',
      searches: 6,
      category: 'Cultural',
      last_user_id: 'Sanjay'
    },
    {
      id: 'switzerland',
      destination: 'Switzerland',
      title: '5-Day Swiss Alps Scenic Rail & Lake Tour',
      query: 'Plan a 5-day scenic tour of Switzerland covering Interlaken, Lucerne, panoramic trains, and mountain peaks under $3,200.',
      duration: '5 Days / 4 Nights',
      budget: '$2,800 - $3,200',
      searches: 5,
      category: 'Adventure',
      last_user_id: 'Alice'
    }
  ]
};

export async function fetchTrendingTrips() {
  try {
    const res = await fetch(`${BASE_URL}/api/trending-trips`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Could not fetch trending trips from backend, using default top 5:', err.message);
    return FALLBACK_TOP_5_TRIPS;
  }
}

export async function fetchSystemStatus() {
  try {
    const res = await fetch(`${BASE_URL}/api/status`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API backend not reachable yet:', err.message);
    return null;
  }
}

export async function planTrip(userQuery, threadId = null, userId = 'traveler_react') {
  const res = await fetch(`${BASE_URL}/api/plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_query: userQuery,
      thread_id: threadId,
      user_id: userId,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server returned ${res.status}`);
  }

  return await res.json();
}

export async function resumeTripApproval(threadId, approved, feedback = '', userId = 'sanjay') {
  const res = await fetch(`${BASE_URL}/api/resume`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      thread_id: threadId,
      approved,
      feedback,
      user_id: userId,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server returned ${res.status}`);
  }

  return await res.json();
}
