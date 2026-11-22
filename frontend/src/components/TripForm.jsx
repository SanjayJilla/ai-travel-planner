import React, { useState } from 'react';
import { Sparkles, ShieldAlert } from 'lucide-react';

export default function TripForm({ onSubmit, isPlanning, isBlocked, guardrailReason, externalQuery }) {
  const [query, setQuery] = useState('');

  // Sync with external selection from Trending Trips sidebar
  React.useEffect(() => {
    if (externalQuery) {
      setQuery(externalQuery);
    }
  }, [externalQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || isPlanning) return;
    onSubmit(query.trim());
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 md:p-6 transition">
      <div className="flex items-center space-x-2 mb-3">
        <Sparkles className="h-5 w-5 text-brand-600" />
        <h2 className="text-base font-semibold text-slate-800">
          Where would you like to travel?
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isPlanning}
            rows={3}
            placeholder="Describe your destination, trip duration, traveler count, preferences, and estimated budget... (e.g., '5-day trip to Tokyo under $3,000 focusing on ramen & temples')"
            className="w-full rounded-xl border border-slate-300 p-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:bg-slate-50 disabled:text-slate-500 transition shadow-inner font-sans resize-none"
          />

          <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs text-slate-500 font-medium">
              💡 Tip: Include your destination & maximum budget for accurate flight and hotel matching.
            </span>
            <button
              type="submit"
              disabled={!query.trim() || isPlanning}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 active:scale-[0.98] transition shadow-md shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPlanning ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Curating Your Itinerary...</span>
                </>
              ) : (
                <>
                  <span>Generate My Itinerary</span>
                  <Sparkles className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Guardrail Block Alert if blocked */}
      {isBlocked && (
        <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start space-x-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-800">
            <p className="font-semibold text-sm text-amber-900 mb-0.5">Trip Request Could Not Be Processed</p>
            <p className="leading-relaxed">{guardrailReason || 'Your query must be related to travel planning and follow platform guidelines.'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
