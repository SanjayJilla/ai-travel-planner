import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import TrendingTripsSidebar from './components/TrendingTripsSidebar.jsx';
import TripForm from './components/TripForm.jsx';
import PipelineStatus from './components/PipelineStatus.jsx';
import SpecialistCards from './components/SpecialistCards.jsx';
import HITLReviewCard from './components/HITLReviewCard.jsx';
import FinalItinerary from './components/FinalItinerary.jsx';
import { 
  fetchSystemStatus, 
  fetchTrendingTrips, 
  fetchUsers, 
  registerNewUser, 
  planTrip, 
  resumeTripApproval 
} from './services/api.js';

export default function App() {
  const [systemStatus, setSystemStatus] = useState(null);
  const [trendingTrips, setTrendingTrips] = useState([
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
  ]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [totalPlatformQueries, setTotalPlatformQueries] = useState(0);
  const [selectedPrompt, setSelectedPrompt] = useState('');

  // Traveler Login / Multi-User state
  const [currentUser, setCurrentUser] = useState('sanjay');
  const [userList, setUserList] = useState([
    { user_id: 'sanjay', display_name: 'Sanjay', trips_planned: 0 },
    { user_id: 'alice', display_name: 'Alice', trips_planned: 0 },
    { user_id: 'rahul', display_name: 'Rahul', trips_planned: 0 },
  ]);

  // ChromaDB Semantic Memory hit indicators
  const [isFromCache, setIsFromCache] = useState(false);
  const [cacheMessage, setCacheMessage] = useState('');
  
  const [threadId, setThreadId] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [guardrailReason, setGuardrailReason] = useState('');
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [draftItinerary, setDraftItinerary] = useState('');
  const [finalResponse, setFinalResponse] = useState('');
  const [flightData, setFlightData] = useState('');
  const [hotelData, setHotelData] = useState('');
  const [weatherData, setWeatherData] = useState('');
  const [budgetData, setBudgetData] = useState('');
  const [tripConstraints, setTripConstraints] = useState({});

  // Refresh dynamic data helper
  const reloadDynamicData = async () => {
    try {
      const [users, trending] = await Promise.all([
        fetchUsers(),
        fetchTrendingTrips()
      ]);
      if (users && Array.isArray(users)) {
        setUserList(users);
      }
      if (trending && trending.trips) {
        setTrendingTrips(trending.trips);
        if (trending.total_platform_queries) {
          setTotalPlatformQueries(trending.total_platform_queries);
        }
      }
    } catch (err) {
      console.warn('Error reloading dynamic data:', err);
    }
  };

  // Poll system health and trending trips on mount
  useEffect(() => {
    async function loadInitialData() {
      const status = await fetchSystemStatus();
      if (status) setSystemStatus(status);
      await reloadDynamicData();
      setIsLoadingTrending(false);
    }
    loadInitialData();
  }, []);

  const handleAddUser = async (userId, displayName) => {
    try {
      await registerNewUser(userId, displayName);
      await reloadDynamicData();
      setCurrentUser(userId);
    } catch (e) {
      console.error('Failed to create user:', e);
    }
  };

  const handleReset = () => {
    setThreadId(null);
    setCurrentStep(0);
    setIsPlanning(false);
    setIsBlocked(false);
    setGuardrailReason('');
    setIsInterrupted(false);
    setIsFromCache(false);
    setCacheMessage('');
    setDraftItinerary('');
    setFinalResponse('');
    setFlightData('');
    setHotelData('');
    setWeatherData('');
    setBudgetData('');
    setTripConstraints({});
    setSelectedPrompt('');
  };

  const handleSelectTrendingTrip = (tripQuery) => {
    setSelectedPrompt(tripQuery);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handlePlanTrip = async (query) => {
    setIsPlanning(true);
    setIsBlocked(false);
    setGuardrailReason('');
    setIsInterrupted(false);
    setIsFromCache(false);
    setCacheMessage('');
    setFinalResponse('');
    setCurrentStep(1); // Security screening

    try {
      // Step simulation for visual feedback
      setTimeout(() => setCurrentStep(2), 500); // Supervisor Decomposition
      setTimeout(() => setCurrentStep(3), 1000); // Parallel Specialist Fan-Out

      const res = await planTrip(query, threadId, currentUser);

      setThreadId(res.thread_id);
      setFlightData(res.flight_results || '');
      setHotelData(res.hotel_results || '');
      setWeatherData(res.weather_results || '');
      setBudgetData(res.budget_results || '');
      setTripConstraints(res.trip_constraints || {});

      if (res.is_from_cache) {
        setIsFromCache(true);
        setCacheMessage(res.cache_message || 'Retrieved from AI Travel Memory');
      }

      // Live refresh of trending trips (so Top 5 query counter increments)
      reloadDynamicData();

      if (res.blocked) {
        setIsBlocked(true);
        setGuardrailReason(res.guardrail_reason || 'Query filtered by guardrail system.');
        setCurrentStep(1);
      } else if (res.is_interrupted) {
        setIsInterrupted(true);
        setDraftItinerary(res.draft_itinerary || '');
        setCurrentStep(5); // Human in the loop review checkpoint
      } else {
        setFinalResponse(res.final_response || res.draft_itinerary || '');
        setCurrentStep(6); // Confirmed Plan
      }
    } catch (err) {
      alert(`Planning request failed: ${err.message}\nEnsure backend is running on http://localhost:8000`);
      setCurrentStep(0);
    } finally {
      setIsPlanning(false);
    }
  };

  const handleResumeHITL = async (approved, feedback) => {
    if (!threadId) return;

    setIsPlanning(true);
    try {
      const res = await resumeTripApproval(threadId, approved, feedback, currentUser);

      if (res.is_interrupted) {
        // Revision requested and cycled back through agents!
        setIsInterrupted(true);
        setIsFromCache(false); // revision is freshly synthesized
        setDraftItinerary(res.draft_itinerary || '');
        setFlightData(res.flight_results || flightData);
        setHotelData(res.hotel_results || hotelData);
        setWeatherData(res.weather_results || weatherData);
        setBudgetData(res.budget_results || budgetData);
        setCurrentStep(5);
      } else {
        // Approved and finalized!
        setIsInterrupted(false);
        setFinalResponse(res.final_response || res.draft_itinerary || '');
        setCurrentStep(6);
        // Refresh users & trending count on final approval
        reloadDynamicData();
      }
    } catch (err) {
      alert(`Approval submission failed: ${err.message}`);
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation with Traveler Switcher */}
      <Header
        onReset={handleReset}
        isPlanning={isPlanning}
        currentUser={currentUser}
        userList={userList}
        onSelectUser={setCurrentUser}
        onAddUser={handleAddUser}
      />

      {/* Main Container: 2-Column Product Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ── LEFT COLUMN: Top 5 Requested Trips (Sidebar) ── */}
          <div className="lg:col-span-4 xl:col-span-4">
            <TrendingTripsSidebar
              trips={trendingTrips}
              onSelectTrip={handleSelectTrendingTrip}
              isPlanning={isPlanning}
            />
          </div>

          {/* ── MIDDLE / MAIN COLUMN: Agent Planner & Results ── */}
          <div className="lg:col-span-8 xl:col-span-8 flex flex-col space-y-6">
            
            {/* Hero Banner */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm no-print">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    AI Travel Planner
                  </h1>
                  <p className="mt-1 text-xs text-slate-600">
                    Plan your complete trip with flights, hotels, weather, and day-by-day itineraries within your budget.
                  </p>
                </div>
                <div className="flex items-center space-x-1.5 self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Ready to Plan</span>
                </div>
              </div>
            </div>

            {/* Pipeline Stepper */}
            <PipelineStatus
              currentStep={currentStep}
              isPlanning={isPlanning}
              isBlocked={isBlocked}
              isInterrupted={isInterrupted}
            />

            {/* Input Form */}
            <TripForm
              onSubmit={handlePlanTrip}
              isPlanning={isPlanning}
              isBlocked={isBlocked}
              guardrailReason={guardrailReason}
              externalQuery={selectedPrompt}
            />

            {/* Human-in-the-Loop Review Card (When paused at checkpoint or loaded from memory) */}
            <HITLReviewCard
              draftItinerary={draftItinerary}
              isInterrupted={isInterrupted}
              isPlanning={isPlanning}
              onResume={handleResumeHITL}
              isFromCache={isFromCache}
              cacheMessage={cacheMessage}
            />

            {/* Specialist Cards */}
            <SpecialistCards
              flightData={flightData}
              hotelData={hotelData}
              weatherData={weatherData}
              budgetData={budgetData}
            />

            {/* Final Confirmed Itinerary (Master Plan) */}
            <FinalItinerary
              itineraryText={draftItinerary}
              finalResponse={finalResponse}
              tripConstraints={tripConstraints}
            />
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 no-print mt-auto">
        TripGenie • Your Personal AI Travel Planner
      </footer>
    </div>
  );
}
