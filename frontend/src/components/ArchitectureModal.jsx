import React from 'react';
import { X, Network, Shield, Cpu, Share2, Database, Layers, ArrowRight } from 'lucide-react';

export default function ArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">System Flowchart & Agent Architecture</h3>
              <p className="text-xs text-slate-400">Enterprise LangGraph Multi-Agent Architecture with MCP Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {/* Architecture Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 text-sky-950">
              <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wider text-sky-700 mb-1">
                <Cpu className="h-4 w-4" />
                <span>Parallel Fan-Out</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700">
                Supervisor dispatches Flight, Hotel, and Weather MCP specialists concurrently instead of sequential blocking, reducing latency by ~60%.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950">
              <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wider text-emerald-700 mb-1">
                <Database className="h-4 w-4" />
                <span>Cyclic HITL Loop</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700">
                Pauses state via LangGraph <code className="bg-white px-1 py-0.5 rounded text-[11px]">interrupt()</code> for human review. If rejected, cycles back to draft revision before finalization.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-950">
              <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wider text-indigo-700 mb-1">
                <Shield className="h-4 w-4" />
                <span>3-Tier Guardrails</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700">
                Tier 1 regex security filter (0ms), Tier 2 domain classifier, and Tier 3 mathematical budget sanity audit.
              </p>
            </div>
          </div>

          {/* System Flow Diagram */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                LangGraph StateGraph Execution Topology
              </h4>
              <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                PostgresSaver Checkpointed
              </span>
            </div>

            {/* Visual ASCII / SVG Pipeline Diagram */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 space-y-3 leading-relaxed">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded bg-slate-100 font-bold text-slate-700">User Query</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <span className="px-2.5 py-1 rounded bg-rose-50 text-rose-800 border border-rose-200 font-bold">
                  Tier 1 & 2 Security Guardrail
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <span className="px-2.5 py-1 rounded bg-brand-50 text-brand-800 border border-brand-200 font-bold">
                  Supervisor Planner
                </span>
              </div>

              <div className="pl-6 border-l-2 border-brand-300 my-2 space-y-1.5 py-1">
                <div className="text-[11px] font-semibold text-brand-700">⚡ Parallel Fan-Out (Async Concurrent):</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="bg-sky-50 p-2 rounded border border-sky-200 text-sky-900 font-sans">
                    ✈️ <strong>Flight Agent</strong><br/>
                    <span className="text-slate-500 font-mono text-[10px]">AviationStack MCP</span>
                  </div>
                  <div className="bg-indigo-50 p-2 rounded border border-indigo-200 text-indigo-900 font-sans">
                    🏨 <strong>Hotel Agent</strong><br/>
                    <span className="text-slate-500 font-mono text-[10px]">Tavily Web Search MCP</span>
                  </div>
                  <div className="bg-amber-50 p-2 rounded border border-amber-200 text-amber-900 font-sans">
                    🌤️ <strong>Weather Agent</strong><br/>
                    <span className="text-slate-500 font-mono text-[10px]">OpenWeather FastMCP</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  Fan-In: Budget Auditor
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <span className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold">
                  Itinerary Compiler
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                  Human Approval (interrupt)
                </span>
              </div>

              <div className="text-[11px] text-amber-800 bg-amber-50/50 p-2 rounded border border-amber-200 font-sans">
                <strong>Cyclic Loop:</strong> If user rejects with revisions ➔ Graph loops back to <code>itinerary_agent</code> with feedback. If approved ➔ proceeds to <code>finalize_itinerary</code>.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition shadow-sm"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
