import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Sparkles, 
  Globe, 
  Plus,
  Inbox
} from 'lucide-react';
import { NavigationTab, Lead } from '../types';

interface NavbarProps {
  onToggleMobile: () => void;
  onSelectTab: (tab: NavigationTab) => void;
  leads: Lead[];
  onOpenLeadModal: (lead: Lead) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobile,
  onSelectTab,
  leads,
  onOpenLeadModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const filteredLeads = searchQuery.trim() 
    ? leads.filter(l => 
        l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.intentKeyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.contactName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Zero fake notifications by default; clean state
  const notifications: any[] = [];

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleMobile}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-64 md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="Search leads, countries, intent keywords..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
          />

          {/* Search dropdown results */}
          {showSearchResults && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Matching Leads</span>
                <span className="text-cyan-400">{filteredLeads.length} results</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map(lead => (
                    <div 
                      key={lead.id}
                      onClick={() => {
                        onOpenLeadModal(lead);
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                      className="p-3 hover:bg-slate-800/60 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{lead.company} <span className="text-slate-400 font-normal">({lead.country})</span></p>
                        <p className="text-[11px] text-cyan-400">{lead.intentKeyword}</p>
                      </div>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded">Score: {lead.score}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">No matching leads found. Try another keyword.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Launch Campaign Button */}
        <button 
          onClick={() => onSelectTab('campaigns')}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          New Campaign
        </button>

        {/* Clean Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                <span className="text-[10px] text-slate-500">Inbox</span>
              </div>
              
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {/* notification items */}
                </div>
              ) : (
                <div className="py-8 text-center space-y-2">
                  <Inbox className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">No new notifications</p>
                  <p className="text-[11px] text-slate-500">You're all caught up! Outreach alerts will appear here.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global mode badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>Global Mesh (154 Countries)</span>
        </div>
      </div>
    </header>
  );
};
