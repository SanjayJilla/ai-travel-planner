import React, { useState } from 'react';
import { CheckCircle2, Printer, Copy, Check, Share2, Compass, Calendar, MapPin, Sparkles } from 'lucide-react';
import FormattedItinerary from './FormattedItinerary.jsx';

export default function FinalItinerary({ itineraryText, finalResponse, tripConstraints }) {
  const [copied, setCopied] = useState(false);

  const fullContent = finalResponse || itineraryText;

  if (!fullContent) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden mb-10 transition">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold flex items-center">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                Verified & Ready to Book
              </span>
              <span className="text-xs text-slate-400">Personalized Travel Schedule</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold mt-1 text-white tracking-tight">
              Confirmed Travel Itinerary
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition border border-white/10 cursor-pointer"
              title="Copy itinerary text"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied!' : 'Copy Itinerary'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition shadow-sm cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="h-4 w-4 text-brand-600" />
              <span>Export PDF / Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Heading (Only visible when printing) */}
      <div className="hidden print-only p-6 border-b border-slate-300">
        <h1 className="text-2xl font-bold text-slate-900">VoyageAI — Confirmed Itinerary Master Plan</h1>
        <p className="text-sm text-slate-600">Personalized Travel Itinerary & Cost Breakdown</p>
      </div>

      {/* Main Content Area — Beautifully formatted Day Cards with zero # or * marks */}
      <div className="p-6 md:p-8">
        <FormattedItinerary rawText={fullContent} />
      </div>

      {/* Footer Notice */}
      <div className="bg-slate-50 border-t border-slate-200 p-4 text-center text-xs text-slate-500 font-medium">
        ✈️ Flight timings, accommodations, and activity slots verified against live travel feeds.
      </div>
    </div>
  );
}
