import React, { useState } from 'react';
import { Plane, Hotel, CloudSun, Calculator, CheckCircle, Sparkles } from 'lucide-react';
import FormattedItinerary from './FormattedItinerary.jsx';

export default function SpecialistCards({ flightData, hotelData, weatherData, budgetData }) {
  const [activeTab, setActiveTab] = useState('all');

  const specialists = [
    {
      id: 'flight',
      title: 'Flight Options',
      sub: 'Airlines & Live Routes',
      icon: Plane,
      badge: 'border-sky-200 bg-sky-50 text-sky-800',
      data: flightData,
      emptyText: 'Scanning airline routes, schedules & estimated fares...',
    },
    {
      id: 'hotel',
      title: 'Accommodations',
      sub: 'Handpicked Hotels & Resorts',
      icon: Hotel,
      badge: 'border-indigo-200 bg-indigo-50 text-indigo-800',
      data: hotelData,
      emptyText: 'Searching stays with top ratings, amenities & best rates...',
    },
    {
      id: 'weather',
      title: 'Weather & Forecast',
      sub: 'Climate & Best Times to Visit',
      icon: CloudSun,
      badge: 'border-amber-200 bg-amber-50 text-amber-800',
      data: weatherData,
      emptyText: 'Fetching local temperature, rain probabilities & conditions...',
    },
    {
      id: 'budget',
      title: 'Budget Breakdown',
      sub: 'Itemized Costs & Expenses',
      icon: Calculator,
      badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      data: budgetData,
      emptyText: 'Calculating itemized costs against your budget ceiling...',
    },
  ];

  const hasAnyData = flightData || hotelData || weatherData || budgetData;

  if (!hasAnyData) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 mb-6 no-print">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <span>Specialist Travel Research</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Live Feeds
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Real-time verified details scanned for flights, stays, weather, and costs.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All (4)
          </button>
          {specialists.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveTab(s.id)}
              className={`px-2 py-1 text-xs font-medium rounded-lg transition cursor-pointer ${
                activeTab === s.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Filtered View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {specialists
          .filter((s) => activeTab === 'all' || activeTab === s.id)
          .map((s) => {
            const Icon = s.icon;
            const hasData = Boolean(s.data && s.data.trim());

            return (
              <div
                key={s.id}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1.5 rounded-lg ${s.badge}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{s.title}</h4>
                        <span className="text-[10px] text-slate-500 font-sans">{s.sub}</span>
                      </div>
                    </div>
                    {hasData && (
                      <span className="flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle className="h-3 w-3 mr-1" /> Live Verified
                      </span>
                    )}
                  </div>

                  <div className="mt-3 bg-white rounded-lg p-3.5 border border-slate-200/80 text-xs text-slate-700 max-h-60 overflow-y-auto leading-relaxed">
                    {hasData ? (
                      <FormattedItinerary rawText={s.data} />
                    ) : (
                      <span className="text-slate-400 italic">{s.emptyText}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
