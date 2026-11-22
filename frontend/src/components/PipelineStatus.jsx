import React from 'react';
import { ShieldCheck, Calendar, Plane, DollarSign, UserCheck, CheckCircle2, Clock } from 'lucide-react';

export default function PipelineStatus({ currentStep, isPlanning, isBlocked, isInterrupted }) {
  // Consumer-facing travel planning steps
  const steps = [
    { id: 1, name: 'Preferences', sub: 'Trip Details Check', icon: ShieldCheck },
    { id: 2, name: 'Route Architect', sub: 'Daily Schedule', icon: Calendar },
    { id: 3, name: 'Live Rates', sub: 'Flights & Stays', icon: Plane },
    { id: 4, name: 'Budget Optimizer', sub: 'Cost Calculation', icon: DollarSign },
    { id: 5, name: 'Traveler Review', sub: 'Your Approval', icon: UserCheck },
    { id: 6, name: 'Trip Confirmed', sub: 'Ready to Book', icon: CheckCircle2 },
  ];

  const getStepStatus = (stepId) => {
    if (isBlocked) {
      if (stepId === 1) return 'error';
      return 'idle';
    }
    if (stepId < currentStep) return 'complete';
    if (stepId === currentStep) {
      if (stepId === 5 && isInterrupted) return 'waiting';
      if (isPlanning) return 'active';
      return 'active';
    }
    return 'idle';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 mb-6 no-print">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
          <Clock className="h-4 w-4 text-brand-600" />
          <span>Itinerary Creation Progress</span>
        </h3>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {isBlocked
            ? 'Request Filtered'
            : isInterrupted
            ? 'Awaiting Your Review'
            : isPlanning
            ? 'Creating Your Plan...'
            : currentStep >= 6
            ? 'Itinerary Complete'
            : 'Ready to Plan'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {steps.map((s) => {
          const status = getStepStatus(s.id);
          const Icon = s.icon;

          let badgeStyles = 'border-slate-200 bg-slate-50 text-slate-400';
          let iconBg = 'bg-slate-200 text-slate-500';

          if (status === 'complete') {
            badgeStyles = 'border-emerald-200 bg-emerald-50/70 text-emerald-900';
            iconBg = 'bg-emerald-500 text-white';
          } else if (status === 'active') {
            badgeStyles = 'border-brand-400 bg-brand-50 text-brand-900 ring-2 ring-brand-400/30';
            iconBg = 'bg-brand-600 text-white animate-pulse';
          } else if (status === 'waiting') {
            badgeStyles = 'border-amber-400 bg-amber-50 text-amber-900 ring-2 ring-amber-400/50';
            iconBg = 'bg-amber-500 text-white animate-bounce';
          } else if (status === 'error') {
            badgeStyles = 'border-rose-300 bg-rose-50 text-rose-900';
            iconBg = 'bg-rose-500 text-white';
          }

          return (
            <div
              key={s.id}
              className={`p-3 rounded-xl border transition flex flex-col items-center text-center relative ${badgeStyles}`}
            >
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs mb-2 ${iconBg}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-xs font-bold leading-tight line-clamp-1">{s.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{s.sub}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
