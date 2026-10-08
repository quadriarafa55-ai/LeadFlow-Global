import React from 'react';
import { 
  LayoutDashboard, 
  Send, 
  Users, 
  ShieldCheck, 
  CreditCard, 
  Globe2, 
  Sparkles,
  Zap,
  LogOut
} from 'lucide-react';
import { NavigationTab, User } from '../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  user: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isMobileOpen,
  setIsMobileOpen,
  user,
  onLogout
}) => {
  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'campaigns' as NavigationTab, label: 'Campaign Creator & Targeting', icon: Send },
    { id: 'leads' as NavigationTab, label: 'Global Leads Directory', icon: Users },
    { id: 'integrations' as NavigationTab, label: 'Integrations & Anti-Ban', icon: ShieldCheck },
    { id: 'pricing' as NavigationTab, label: 'Subscription & Pricing', icon: CreditCard },
  ];

  const usagePercent = Math.min(100, Math.round((user.leadsUsed / user.leadsLimit) * 100));

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800/80 
        flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Globe2 className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                LeadFlow <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20">GLOBAL</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">B2B Outreach & Scans</p>
            </div>
          </div>
        </div>

        {/* Subscription Quota Tracking Meter */}
        <div className="mx-4 mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> Usage Quota
            </span>
            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-mono border border-cyan-500/20">
              {user.planName}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Leads Used</span>
              <span className={user.leadsUsed >= user.leadsLimit ? 'text-red-400 font-bold' : 'text-white'}>
                {user.leadsUsed} / {user.leadsLimit}
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div 
                className={`h-full transition-all duration-500 ${
                  usagePercent >= 100 
                    ? 'bg-red-500' 
                    : usagePercent > 80 
                    ? 'bg-amber-500' 
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
          {user.leadsUsed >= user.leadsLimit && (
            <p className="text-[10px] text-red-400 font-medium text-center">
              ⚠️ Monthly quota reached! Campaigns paused.
            </p>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Platform Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-4 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Pro Banner / Engine Status Box */}
        <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/20 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-2 text-cyan-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Autonomous Engine</span>
          </div>
          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
            Multi-channel outreach engine operating with anti-ban safety across 154 global regions.
          </p>
          <button 
            onClick={() => onSelectTab('campaigns')}
            className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-cyan-500/25 transition-all flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            New Campaign
          </button>
        </div>

        {/* Footer profile */}
        <div className="p-4 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-sm">
              {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.planName}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
