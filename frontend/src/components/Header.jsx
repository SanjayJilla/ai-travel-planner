import React, { useState } from 'react';
import { Compass, RefreshCw, User, Plus, Check, ChevronDown } from 'lucide-react';

export default function Header({ 
  onReset, 
  isPlanning, 
  currentUser = 'sanjay', 
  userList = [], 
  onSelectUser, 
  onAddUser 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');

  const currentProfile = userList.find(u => u.user_id === currentUser) || {
    user_id: currentUser,
    display_name: currentUser.charAt(0).toUpperCase() + currentUser.slice(1),
    trips_planned: 0
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    const cleanId = newUserName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    onAddUser(cleanId, newUserName.trim());
    setNewUserName('');
    setShowAddModal(false);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">TripGenie</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                AI Travel Planner
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Flights, Hotels & Daily Itineraries</p>
          </div>
        </div>

        {/* User Switcher & Actions */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* User Profile Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-xs font-semibold text-slate-800 transition shadow-sm cursor-pointer"
              title="Switch active traveler profile"
            >
              <div className="h-6 w-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-[11px] font-bold">
                {currentProfile.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <span className="block leading-none">{currentProfile.display_name}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {currentProfile.trips_planned || 0} planned
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Traveler
                </div>
                <div className="max-h-48 overflow-y-auto py-1">
                  {userList.map((user) => (
                    <button
                      key={user.user_id}
                      onClick={() => {
                        onSelectUser(user.user_id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                        currentUser === user.user_id ? 'font-bold text-brand-700 bg-brand-50/50' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="h-5 w-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                          {user.display_name.charAt(0)}
                        </div>
                        <span>{user.display_name}</span>
                      </div>
                      {currentUser === user.user_id && <Check className="h-3.5 w-3.5 text-brand-600" />}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setShowAddModal(true);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-brand-600 font-bold hover:bg-brand-50 flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add New Traveler</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Online Status Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Online</span>
          </div>

          {/* New Trip / Reset Button */}
          <button
            onClick={onReset}
            disabled={isPlanning}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition disabled:opacity-50 cursor-pointer border border-slate-200"
            title="Start planning a new trip"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isPlanning ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">New Trip</span>
          </button>
        </div>
      </div>

      {/* Add User Modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 w-full max-w-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Create Traveler Profile</h3>
            <p className="text-xs text-slate-500 mb-3">
              Enter your name to track your custom queries and vector memories.
            </p>
            <form onSubmit={handleCreateUser}>
              <input
                type="text"
                autoFocus
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="e.g. Priya, John, Rahul"
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newUserName.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 cursor-pointer"
                >
                  Save & Switch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
