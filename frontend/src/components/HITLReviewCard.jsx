import React, { useState } from 'react';
import { UserCheck, ThumbsUp, RotateCcw, AlertCircle, MessageSquare, Sparkles, Check } from 'lucide-react';
import FormattedItinerary from './FormattedItinerary.jsx';

export default function HITLReviewCard({ 
  draftItinerary, 
  isInterrupted, 
  isPlanning, 
  onResume, 
  isFromCache = false, 
  cacheMessage = '' 
}) {
  const [feedback, setFeedback] = useState('');
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);

  if (!isInterrupted) return null;

  const handleApprove = () => {
    onResume(true, '');
  };

  const handleRequestRevision = (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      alert('Please provide instructions for the adjustments you would like.');
      return;
    }
    onResume(false, feedback.trim());
    setFeedback('');
    setShowFeedbackBox(false);
  };

  return (
    <div className="bg-gradient-to-b from-brand-50/70 to-white rounded-2xl shadow-lg border-2 border-brand-300 p-5 md:p-6 mb-6 no-print">
      {/* Alert Header */}
      <div className="flex items-start justify-between gap-4 border-b border-brand-100 pb-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900">
                Review & Confirm Your Draft Itinerary
              </h3>
              {isFromCache ? (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                  <span>⚡ Instant Travel Match</span>
                </span>
              ) : (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800">
                  Ready for Your Review
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isFromCache 
                ? (cacheMessage || 'Found a verified travel plan for this destination. Review below, approve to finalize, or request changes!')
                : 'Review your customized travel proposal below. Approve it to finalize your schedule, or request any changes.'}
            </p>
          </div>
        </div>
      </div>

      {/* Draft Itinerary Preview — Clean formatted rendering with zero # or * marks */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4 shadow-inner max-h-[480px] overflow-y-auto">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-3 border-b border-slate-100 pb-2">
          <span className="flex items-center space-x-1.5">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" />
            <span>Proposed Trip Schedule</span>
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Pending Traveler Review</span>
        </div>
        
        {draftItinerary ? (
          <FormattedItinerary rawText={draftItinerary} />
        ) : (
          <div className="py-6 text-center text-xs text-slate-500">
            Preparing your travel schedule...
          </div>
        )}
      </div>

      {/* Decision Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-500 font-medium">
          Approving will confirm this plan and generate your master booking vouchers.
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Request Revision Toggle Button */}
          <button
            type="button"
            onClick={() => setShowFeedbackBox(!showFeedbackBox)}
            disabled={isPlanning}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 border border-slate-300 hover:bg-slate-200 transition disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 text-slate-600" />
            <span>Request Changes</span>
          </button>

          {/* Approve Button */}
          <button
            type="button"
            onClick={handleApprove}
            disabled={isPlanning}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
          >
            <ThumbsUp className="h-4 w-4" />
            <span>Looks Great, Finalize Trip!</span>
          </button>
        </div>
      </div>

      {/* Feedback Form */}
      {showFeedbackBox && (
        <form onSubmit={handleRequestRevision} className="mt-4 pt-4 border-t border-brand-200">
          <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center space-x-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-brand-600" />
            <span>What adjustments would you like to make?</span>
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={isPlanning}
            rows={2}
            placeholder="e.g., 'Switch hotel to beachfront with sea view', or 'Add more free time on Day 2 for shopping'..."
            className="w-full text-xs rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-sans"
          />
          <div className="mt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowFeedbackBox(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!feedback.trim() || isPlanning}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Update Itinerary</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
