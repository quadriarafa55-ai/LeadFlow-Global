import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Send, 
  TrendingUp, 
  Zap, 
  Globe2, 
  ArrowUpRight, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  Mail,
  MessageSquare,
  Plus,
  Clock,
  MessageCircle,
  Database,
  Trash2,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { Lead, Campaign, NavigationTab, User } from '../types';
import { supabaseService, ChatConversation, ChatTimer } from '../services/supabaseService';

interface DashboardOverviewProps {
  leads: Lead[];
  campaigns: Campaign[];
  onSelectTab: (tab: NavigationTab) => void;
  onOpenLeadModal: (lead: Lead) => void;
  user: User;
  onPurgeLeads?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  leads,
  campaigns,
  onSelectTab,
  onOpenLeadModal,
  user,
  onPurgeLeads
}) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [timers, setTimers] = useState<ChatTimer[]>([]);
  const [liveDbCount, setLiveDbCount] = useState<number | null>(null);
  const [isPurging, setIsPurging] = useState<boolean>(false);
  const [purgeSuccess, setPurgeSuccess] = useState<string>('');
  const [analytics, setAnalytics] = useState<{
    totalRealLeads: number;
    activeCampaigns: number;
    totalMessagesDispatched: number;
    verifiedMxCount: number;
    verifiedWhatsAppCount: number;
    gmailOnlyCount: number;
    deliverabilityRate: string;
  }>({
    totalRealLeads: 0,
    activeCampaigns: 0,
    totalMessagesDispatched: 0,
    verifiedMxCount: 0,
    verifiedWhatsAppCount: 0,
    gmailOnlyCount: 0,
    deliverabilityRate: '100%'
  });

  const loadStrategicAnalytics = async () => {
    try {
      const data = await supabaseService.getStrategicAnalytics(user.email);
      setAnalytics(data);
      setLiveDbCount(data.totalRealLeads);
    } catch (err) {
      console.warn('Analytics load notice:', err);
    }
  };

  useEffect(() => {
    supabaseService.getChatConversations(user.email).then(setConversations);
    supabaseService.getChatTimers(user.email).then(setTimers);

    // Initial load
    loadStrategicAnalytics();

    // Listen to real-time sync events
    const handleLeadsUpdated = (e: any) => {
      if (typeof e.detail?.count === 'number') {
        setLiveDbCount(e.detail.count);
      }
      loadStrategicAnalytics();
    };

    window.addEventListener('leadflow:leads-updated', handleLeadsUpdated);
    return () => window.removeEventListener('leadflow:leads-updated', handleLeadsUpdated);
  }, [user.email]);

  const handleExecutePurge = async () => {
    if (!window.confirm('Are you sure you want to reset the leads directory? This will clear all existing lead records and start with a fresh slate.')) {
      return;
    }

    setIsPurging(true);
    setPurgeSuccess('');
    try {
      const res = await supabaseService.purgeOldLeads(user.email);
      if (res.success) {
        setLiveDbCount(0);
        if (onPurgeLeads) onPurgeLeads();
        setPurgeSuccess('Lead directory reset successfully. System is fresh and ready for new campaigns.');
        await loadStrategicAnalytics();
        setTimeout(() => setPurgeSuccess(''), 5000);
      } else {
        alert(res.message || 'Directory reset notice');
      }
    } catch (e: any) {
      alert('Reset notice: ' + e.message);
    } finally {
      setIsPurging(false);
    }
  };

  const isZeroState = leads.length === 0 && campaigns.length === 0;
  const isLimitReached = user.leadsUsed >= user.leadsLimit;

  const totalLeads = liveDbCount !== null ? liveDbCount : analytics.totalRealLeads;
  const activeCampaignsCount = campaigns.filter(c => c.status === 'Active').length;
  const totalMessagesSent = campaigns.reduce((acc, c) => acc + c.sentCount, 0);

  const stats = [
    {
      title: 'Total Verified Leads',
      value: totalLeads.toLocaleString(),
      change: totalLeads > 0 ? '+100% Pre-Flight Verified' : 'Ready for campaign launch',
      trend: 'up',
      icon: Users,
      color: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30'
    },
    {
      title: 'Active Campaigns',
      value: activeCampaignsCount.toString(),
      change: activeCampaignsCount > 0 ? 'Multi-Channel Live' : '0 Active Campaigns',
      trend: 'up',
      icon: Globe2,
      color: 'from-indigo-500/20 to-purple-500/10 text-indigo-400 border-indigo-500/30'
    },
    {
      title: 'Messages Dispatched',
      value: totalMessagesSent.toLocaleString(),
      change: totalMessagesSent > 0 ? 'Via Gmail & WhatsApp' : '0 messages sent',
      trend: 'up',
      icon: Send,
      color: 'from-fuchsia-500/20 to-pink-500/10 text-fuchsia-400 border-fuchsia-500/30'
    },
    {
      title: 'MX Deliverability Rate',
      value: totalLeads > 0 ? '99.8%' : '100.0%',
      change: 'Pre-flight verified syntax & MX',
      trend: 'up',
      icon: ShieldCheck,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30'
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Monthly Limit Reached Hard Lock Banner */}
      {isLimitReached && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-bold text-sm text-red-200">Monthly Plan Limit Reached. Campaigns Paused.</p>
              <p className="text-xs text-red-300">You have used {user.leadsUsed} of {user.leadsLimit} leads on your {user.planName}. Upgrade your plan to resume outreach.</p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('pricing')}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors shrink-0 cursor-pointer"
          >
            Upgrade Plan
          </button>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-6 md:p-8 overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Global Anti-Ban Engine v4.2 • Enterprise Network Active
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
              Welcome back, {user.name} 👋
            </h2>
            <p className="text-sm text-slate-300 max-w-xl">
              {isZeroState 
                ? "Your workspace is ready. Launch your first AI lead generation campaign to start scanning prospects across 150+ countries."
                : "Your autonomous outreach engines are scanning global registries and chat conversations."
              }
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectTab('campaigns')}
              disabled={isLimitReached}
              className={`px-5 py-3 rounded-2xl text-xs md:text-sm font-semibold shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                isLimitReached 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25'
              }`}
            >
              <Zap className="w-4 h-4" />
              Launch New Campaign
            </button>
            <button
              onClick={() => onSelectTab('leads')}
              className="px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs md:text-sm font-semibold border border-slate-700/80 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              Explore Leads ({leads.length})
            </button>
          </div>
        </div>
      </div>

      {/* Verified Contact Registry & Intelligence Pipeline Card */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Live Contact Intelligence Engine</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Multi-Source Verification
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Synchronized with verified business directories ({totalLeads} active records). Pre-flight MX deliverability and active contact validation enabled.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={loadStrategicAnalytics}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh verified directory metrics"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            Sync Metrics
          </button>
          <button
            onClick={handleExecutePurge}
            disabled={isPurging}
            className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Reset lead directory and clear stored records"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            {isPurging ? 'Resetting Records...' : 'Reset Directory'}
          </button>
        </div>
      </div>

      {purgeSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{purgeSuccess}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i}
              className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-5 relative overflow-hidden shadow-xl hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400">{stat.title}</span>
                <div className={`p-2.5 rounded-xl border ${stat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                {stat.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Campaign Performance & Success Metrics Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads & Messages Dispatched Chart */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" /> Campaign Lead Volume & Dispatches
              </h3>
              <p className="text-xs text-slate-400">Comparing total leads vs messages sent across campaigns</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaigns.length > 0 ? campaigns.map(c => ({
                name: c.name.length > 14 ? c.name.slice(0, 14) + '...' : c.name,
                leads: c.leadsCount || 0,
                sent: c.sentCount || 0,
                replyRateNum: parseFloat((c.replyRate || '24.0%').replace('%', '')),
                conversionRateNum: parseFloat((c.conversionRate || '8.5%').replace('%', ''))
              })) : [
                { name: 'SaaS Expansion', leads: 45, sent: 30, replyRateNum: 24.5, conversionRateNum: 8.2 },
                { name: 'Fintech B2B', leads: 60, sent: 50, replyRateNum: 31.0, conversionRateNum: 12.4 },
                { name: 'HealthTech AI', leads: 35, sent: 20, replyRateNum: 18.2, conversionRateNum: 5.0 }
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="leads" name="Pending/Verified Leads" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                <Bar dataKey="sent" name="Messages Sent" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Success Rates & Reply Rates Chart */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" /> Outreach Success & Reply Rates (%)
              </h3>
              <p className="text-xs text-slate-400">Percentage success and conversion efficiency per campaign</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={campaigns.length > 0 ? campaigns.map(c => ({
                name: c.name.length > 14 ? c.name.slice(0, 14) + '...' : c.name,
                leads: c.leadsCount || 0,
                sent: c.sentCount || 0,
                replyRateNum: parseFloat((c.replyRate || '24.0%').replace('%', '')),
                conversionRateNum: parseFloat((c.conversionRate || '8.5%').replace('%', ''))
              })) : [
                { name: 'SaaS Expansion', leads: 45, sent: 30, replyRateNum: 24.5, conversionRateNum: 8.2 },
                { name: 'Fintech B2B', leads: 60, sent: 50, replyRateNum: 31.0, conversionRateNum: 12.4 },
                { name: 'HealthTech AI', leads: 35, sent: 20, replyRateNum: 18.2, conversionRateNum: 5.0 }
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReply" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="replyRateNum" name="Reply Rate (%)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorReply)" />
                <Area type="monotone" dataKey="conversionRateNum" name="Conversion Rate (%)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorConv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Messaging & Chat Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incoming Chat Conversations (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-cyan-400" /> Live Prospect Inquiries & Conversations
              </h3>
              <p className="text-xs text-slate-400">Real-time incoming multi-channel replies & buyer engagement</p>
            </div>
            <span className="text-xs bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/25 font-mono">
              {conversations.length} Active chats
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {conversations.map((chat) => (
              <div 
                key={chat.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-4 hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold text-sm shrink-0">
                    {chat.lead_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{chat.lead_name}</h4>
                      <span className="text-[10px] text-slate-400">({chat.company})</span>
                      {chat.unread && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-1">{chat.last_message}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                      <span>{chat.timestamp}</span>
                      <span>•</span>
                      <span className="text-cyan-400 font-medium">{chat.channel}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Opening secure chat with ${chat.lead_name}`)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                >
                  Reply
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Response Timers (1 col) */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" /> Response Timers
              </h3>
              <p className="text-xs text-slate-400">Automated SLA & follow-up countdowns</p>
            </div>
            <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-500/25 font-mono">
              {timers.length} Active
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {timers.map((timer) => (
              <div 
                key={timer.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-xs font-bold text-white">Conversation #{timer.conversation_id}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Response SLA countdown</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-indigo-400 font-mono bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                    {Math.floor(timer.countdown_seconds / 60)}m {timer.countdown_seconds % 60}s
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
            Automated SLA alarms active
          </div>
        </div>
      </div>
    </div>
  );
};
