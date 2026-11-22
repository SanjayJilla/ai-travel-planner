import React from 'react';
import { 
  Flame, 
  MapPin, 
  Clock, 
  DollarSign, 
  ArrowRight,
  Compass
} from 'lucide-react';

export default function TrendingTripsSidebar({ trips = [], onSelectTrip, isPlanning }) {
  // Strictly top 5
  const topTrips = trips.slice(0, 5);

  return (
    <aside className="w-full bg-white rounded-2xl shadow-sm border border-slate-200/90 p-4 md:p-5 flex flex-col h-full transition no-print">
      {/* Sidebar Header */}
      <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200/80">
            <Flame className="h-4 w-4" />
          </div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Top 5 Trips
          </h2>
        </div>
      </div>

      {/* Trips List */}
      {topTrips.length === 0 ? (
        <div className="py-10 px-4 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center">
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
            <Compass className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-slate-700">No Trips Yet</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Planned trips will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[640px] pr-1">
          {topTrips.map((trip, idx) => {
            const rank = idx + 1;

            return (
              <div
                key={trip.id || idx}
                className="group p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-brand-300 hover:shadow-md transition duration-150 flex flex-col justify-between"
              >
                <div>
                  {/* Rank Header */}
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-extrabold text-brand-700 bg-brand-50 border border-brand-200/80 px-2 py-0.5 rounded-md text-[11px] font-mono">
                      #{rank}
                    </span>
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">
                      {trip.destination}
                    </span>
                  </div>

                  {/* Trip Title */}
                  <h3 className="text-xs font-semibold text-slate-900 group-hover:text-brand-700 transition leading-snug">
                    {trip.title}
                  </h3>

                  {/* Days & Budget */}
                  <div className="grid grid-cols-2 gap-2 mt-2.5 py-2 px-2.5 rounded-lg bg-white border border-slate-200/80 text-[11px] text-slate-600 font-medium">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{trip.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
                      <DollarSign className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{trip.budget}</span>
                    </div>
                  </div>
                </div>

                {/* Plan Trip Button */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onSelectTrip(trip.query)}
                    disabled={isPlanning}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-600 hover:text-white transition group-hover:bg-brand-600 group-hover:text-white disabled:opacity-50 cursor-pointer"
                    title="Plan this itinerary"
                  >
                    <span>Plan Trip</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
