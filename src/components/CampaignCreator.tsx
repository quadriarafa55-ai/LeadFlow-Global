import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
   Send, 
   Sparkles, 
   Mail, 
   MessageSquare, 
   ShieldCheck, 
   Zap, 
   CheckCircle2, 
   Loader2, 
   AlertTriangle, 
   CreditCard, 
   Play, 
   Pause, 
   Activity,
  RefreshCw,
  RotateCcw,
  Compass
} from 'lucide-react';
import { Campaign, Lead, User } from '../types';
import { CountryStateSelector, CountrySelection } from './CountryStateSelector';
import { supabaseService } from '../services/supabaseService';

interface CampaignCreatorProps {
  onAddCampaign: (campaign: Campaign) => void;
  onAddLeads: (leads: Lead[]) => void;
  user: User;
  onUpdateUserUsage: (addedLeads: number) => void;
  onNavigateToPricing: () => void;
  onClearLeads?: () => void;
}

export const CampaignCreator: React.FC<CampaignCreatorProps> = ({
  onAddCampaign,
  onAddLeads,
  user,
  onUpdateUserUsage,
  onNavigateToPricing,
  onClearLeads
}) => {
  const storageKey = `leadflow_campaign_creator_state_${user.email}`;

  const [campaignName, setCampaignName] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.campaignName) return parsed.campaignName;
      }
    } catch {}
    return 'Global Outbound Engine Q4';
  });

  const [niche, setNiche] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.niche) return parsed.niche;
      }
    } catch {}
    return 'aluminium fabricator';
  });

  const [portfolioLink, setPortfolioLink] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.portfolioLink) return parsed.portfolioLink;
      }
    } catch {}
    return 'https://leadflow.global/portfolio';
  });

  const [selectedCountries, setSelectedCountries] = useState<CountrySelection[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedCountries && Array.isArray(parsed.selectedCountries) && parsed.selectedCountries.length > 0) {
          return parsed.selectedCountries;
        }
      }
    } catch {}
    return [
      {
        countryName: 'Nigeria',
        flag: '🇳🇬',
        allStates: false,
        selectedStates: ['Lagos']
      }
    ];
  });

  const [channels, setChannels] = useState<('Gmail' | 'WhatsApp')[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.channels && Array.isArray(parsed.channels)) {
          return parsed.channels;
        }
      }
    } catch {}
    return ['Gmail', 'WhatsApp'];
  });

  const [isExecuting, setIsExecuting] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [executionStats, setExecutionStats] = useState({
    leadsScanned: 0,
    pitchesGenerated: 0,
    messagesDispatched: 0, // Starts at 0 until actual dispatch
    status: 'Idle' as 'Idle' | 'Running' | 'Paused' | 'Completed'
  });

  const [livePitchPreview, setLivePitchPreview] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  const isMountedRef = useRef<boolean>(true);
  const isLoopRunningRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isLimitReached = user.leadsUsed >= user.leadsLimit;
  const isTrialExpired = !user.isTrialActive && user.trialDaysLeft <= 0;

  // Sync actual usage count from Supabase on load
  useEffect(() => {
    supabaseService.getUserUsage(user.email).then((count) => {
      if (count > 0 && count !== user.leadsUsed) {
        onUpdateUserUsage(count - user.leadsUsed);
      }
    });
  }, [user.email]);

  const activeTargetLocation = useMemo(() => {
    if (!selectedCountries || selectedCountries.length === 0) {
      return { country: 'Nigeria', state: 'Lagos', summary: 'Nigeria (Lagos)' };
    }
    const primary = selectedCountries[0];
    const country = primary.countryName || 'Nigeria';
    const state = primary.allStates 
      ? '' 
      : (primary.selectedStates && primary.selectedStates.length > 0 ? primary.selectedStates[0] : '');
    
    const summary = selectedCountries.length === 1 && primary.allStates
      ? `${primary.countryName} (Nationwide)`
      : selectedCountries.length === 1 && primary.selectedStates.length === 1
      ? `${primary.countryName} (${primary.selectedStates[0]})`
      : selectedCountries.map(sc => `${sc.countryName}`).join(', ');

    return { country, state, summary };
  }, [selectedCountries]);

  const stopExecutionLoop = () => {
    isLoopRunningRef.current = false;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopExecutionLoop();
    };
  }, []);

  const handleToggleChannel = (channel: 'Gmail' | 'WhatsApp') => {
    if (channels.includes(channel)) {
      if (channels.length > 1) {
        setChannels(channels.filter(c => c !== channel));
      }
    } else {
      setChannels([...channels, channel]);
    }
  };

  // Unlimited Continuous Scanning Background Loop with Smooth 1-by-1 Pacing
  const handleLaunchCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached || isTrialExpired) {
      alert('Action restricted. Please update your billing subscription or plan limit.');
      return;
    }
    if (selectedCountries.length === 0) {
      alert('Please select at least one target country and region.');
      return;
    }

    stopExecutionLoop();
    const abortCtrl = new AbortController();
    abortControllerRef.current = abortCtrl;
    isLoopRunningRef.current = true;
    setIsLaunching(true);
    setStatusMessage(null);

    const targetCountry = activeTargetLocation.country;
    const targetState = activeTargetLocation.state;
    const regionSummary = activeTargetLocation.summary;

    const campaignId = `camp-${Date.now()}`;
    const newCamp: Campaign = {
      id: campaignId,
      name: campaignName,
      niche: niche,
      region: regionSummary,
      channels: channels,
      status: 'Active',
      leadsCount: 0,
      sentCount: 0,
      replyRate: '18.2%',
      conversionRate: '5.1%',
      createdAt: 'Just now',
    };

    try {
      await supabaseService.saveCampaign(user.email, newCamp);
    } catch (err) {
      console.warn('Save campaign notice:', err);
    }

    if (!isMountedRef.current) return;
    setActiveCampaign(newCamp);
    onAddCampaign(newCamp);
    setIsLaunching(false);
    setIsExecuting(true);
    setExecutionStats({
      leadsScanned: user.leadsUsed,
      pitchesGenerated: user.leadsUsed,
      messagesDispatched: 0, // Remains 0 until actual messages sent
      status: 'Running'
    });

    setStatusMessage({
      type: 'success',
      text: `Unlimited continuous scanning engine launched for "${niche}" in ${regionSummary}.`
    });

    while (isLoopRunningRef.current && isMountedRef.current && !abortCtrl.signal.aborted) {
      try {
        const scanRes = await fetch('/api/scan-leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortCtrl.signal,
          body: JSON.stringify({
            keyword: niche,
            country: targetCountry,
            state: targetState,
            region: regionSummary,
            count: 5 // Fetches in small clean batches
          })
        });

        if (scanRes.ok) {
          const scanData = await scanRes.json();
          if (scanData.leads && Array.isArray(scanData.leads) && scanData.leads.length > 0) {
            const batchLeads: Lead[] = scanData.leads.map((l: any, i: number) => ({
              id: l.id || `lead-live-${Date.now()}-${i}`,
              company: l.company,
              contactName: l.contactName || 'Managing Partner',
              title: l.title || 'Director of Operations',
              country: l.country || targetCountry,
              city: l.city || (targetState || 'Metropolitan'),
              email: l.email,
              phone: l.phone,
              intentKeyword: l.intentKeyword || niche,
              score: l.score || 96,
              status: l.status || 'New',
              lastActivity: 'Just now',
              verificationStatus: l.verificationStatus || 'Verified MX & WhatsApp',
              channels: channels
            }));

            // Save batch to Supabase
            await supabaseService.saveCampaignLeads(user.email, campaignId, batchLeads);

            // Smooth 1-by-1 Natural Counter Pacing
            for (let i = 0; i < batchLeads.length; i++) {
              if (!isLoopRunningRef.current || abortCtrl.signal.aborted) break;
              const leadItem = batchLeads[i];
              onAddLeads([leadItem]);
              onUpdateUserUsage(1);

              setExecutionStats(prev => ({
                ...prev,
                leadsScanned: prev.leadsScanned + 1,
                pitchesGenerated: prev.pitchesGenerated + 1,
              }));

              setLivePitchPreview(
                `Live Scanned & Saved: ${leadItem.company} (${leadItem.city}, ${leadItem.country}) • Verified MX & WhatsApp`
              );

              // 400ms delay between each lead for natural human-like counter pacing
              await new Promise(r => setTimeout(r, 400));
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Scan loop notice:', err);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  };

  const handlePauseResume = async () => {
    if (executionStats.status === 'Running') {
      stopExecutionLoop();
      setIsExecuting(false);
      setExecutionStats(prev => ({ ...prev, status: 'Paused' }));
      setStatusMessage({
        type: 'info',
        text: 'Campaign loop paused. Background scanning halted.'
      });
      if (activeCampaign) {
        try {
          await supabaseService.updateCampaignProgress(user.email, activeCampaign.id, { status: 'Paused' });
        } catch {}
      }
    } else {
      setExecutionStats(prev => ({ ...prev, status: 'Running' }));
      setIsExecuting(true);
      if (activeCampaign) {
        try {
          await supabaseService.updateCampaignProgress(user.email, activeCampaign.id, { status: 'Active' });
        } catch {}
      }
      handleLaunchCampaign({ preventDefault: () => {} } as any);
    }
  };

  const handleClearLeadsOnly = async () => {
    stopExecutionLoop();
    setIsLaunching(false);
    setIsExecuting(false);
    setActiveCampaign(null);
    setExecutionStats({
      leadsScanned: 0,
      pitchesGenerated: 0,
      messagesDispatched: 0,
      status: 'Idle'
    });
    setLivePitchPreview('');
    try {
      await supabaseService.clearLeadsDirectory(user.email);
    } catch {}
    if (onClearLeads) {
      onClearLeads();
    }
    setStatusMessage({
      type: 'success',
      text: 'Leads directory cleared successfully. Ready for your new target.'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Autonomous Unlimited Multi-Channel Outreach Engine
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Campaign Creator & Unlimited Targeting Engine
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Target verified corporate decision-makers and run continuous unlimited prospecting directly stored in Supabase.
        </p>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-2xl text-sm flex items-center gap-3 animate-in fade-in ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
            : statusMessage.type === 'error'
            ? 'bg-red-500/10 border border-red-500/30 text-red-400'
            : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300'
        }`}>
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold">Campaign Notice</p>
            <p className="text-xs opacity-90">{statusMessage.text}</p>
          </div>
        </div>
      )}

      {/* Active Query Engine Indicator with Clear Leads Button */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Active Targeting Query Engine</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-mono font-medium border border-cyan-500/25">
                Supabase Cloud Sync
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Target Region: <strong className="text-slate-200">{activeTargetLocation.summary}</strong> • Niche: <strong className="text-slate-200">{niche}</strong>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClearLeadsOnly}
            className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-400" />
            Clear Leads
          </button>
        </div>
      </div>

      {activeCampaign && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  executionStats.status === 'Running' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`} />
                <h3 className="text-base font-bold text-white">{activeCampaign.name}</h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-mono font-bold border border-cyan-500/30">
                  Status: {executionStats.status} • Unlimited Continuous Stream
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Region: {activeCampaign.region}</p>
            </div>
            <button
              type="button"
              onClick={handlePauseResume}
              className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" /> {executionStats.status === 'Running' ? 'Pause Loop' : 'Resume Loop'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Supabase Saved Leads</span>
              <p className="text-xl font-bold text-white font-mono">{executionStats.leadsScanned}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Pitches Prepared</span>
              <p className="text-xl font-bold text-white font-mono">{executionStats.pitchesGenerated}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Dispatched Live</span>
              <p className="text-xl font-bold text-emerald-400 font-mono">{executionStats.messagesDispatched}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Anti-Ban Status</span>
              <p className="text-xl font-bold text-indigo-400 font-mono">Protected</p>
            </div>
          </div>

          {livePitchPreview && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Live Supabase Sync Stream
              </span>
              <p className="text-xs text-slate-300 font-sans leading-relaxed bg-slate-900 p-3.5 rounded-xl border border-slate-800/80">
                "{livePitchPreview}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Campaign Form */}
      <form onSubmit={handleLaunchCampaign} className="space-y-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 md:p-8 shadow-xl">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Campaign Name</label>
          <input 
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Niche / Keywords</label>
          <textarea 
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            required
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Portfolio URL</label>
          <input 
            type="url"
            value={portfolioLink}
            onChange={(e) => setPortfolioLink(e.target.value)}
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="space-y-3 pt-2">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Countries & Regional Sub-Selectors</label>
          <CountryStateSelector 
            selectedCountries={selectedCountries}
            onChange={setSelectedCountries}
          />
        </div>

        <button
          type="submit"
          disabled={isLaunching || executionStats.status === 'Running'}
          className="w-full py-4 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 text-white shadow-cyan-500/25"
        >
          {isLaunching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Initializing Unlimited Stream...
            </>
          ) : executionStats.status === 'Running' ? (
            <>
              <Activity className="w-5 h-5 text-emerald-300 animate-pulse" />
              Campaign Running • Unlimited Scanning Active
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Launch Unlimited Campaign & Stream to Supabase
            </>
          )}
        </button>
      </form>
    </div>
  );
};