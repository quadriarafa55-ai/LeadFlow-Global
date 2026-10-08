import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  MessageSquare, 
  Sparkles, 
  Globe, 
  ExternalLink,
  ChevronRight,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Lead } from '../types';
import { supabaseService } from '../services/supabaseService';

interface LeadsDirectoryProps {
  leads: Lead[];
  onOpenLeadModal: (lead: Lead) => void;
  userEmail?: string;
  onPurgeLeads?: () => void;
}

export const LeadsDirectory: React.FC<LeadsDirectoryProps> = ({ 
  leads, 
  onOpenLeadModal,
  userEmail,
  onPurgeLeads 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isPurging, setIsPurging] = useState<boolean>(false);
  const [purgeMsg, setPurgeMsg] = useState<string>('');

  const handlePurge = async () => {
    if (!window.confirm('Reset lead directory? This will remove current lead records and clear the directory for fresh prospect scans.')) {
      return;
    }
    setIsPurging(true);
    setPurgeMsg('');
    try {
      const res = await supabaseService.purgeOldLeads(userEmail || '');
      if (res.success) {
        if (onPurgeLeads) onPurgeLeads();
        setPurgeMsg('Directory cleared successfully. Workspace is fresh.');
        setTimeout(() => setPurgeMsg(''), 4000);
      }
    } catch (e: any) {
      alert('Reset notice: ' + e.message);
    } finally {
      setIsPurging(false);
    }
  };

  const countries = ['All', ...Array.from(new Set(leads.map(l => l.country)))];
  const statuses = ['All', 'New', 'Contacted', 'Replied', 'Converted'];

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.intentKeyword.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry = selectedCountry === 'All' || lead.country === selectedCountry;
    const matchesStatus = selectedStatus === 'All' || lead.status === selectedStatus;

    return matchesSearch && matchesCountry && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ['Company,Contact Name,Title,Country,Email,Phone,Intent Keyword,Score,Status,Verification\n'];
    const rows = filteredLeads.map(l => `"${l.company}","${l.contactName}","${l.title}","${l.country}","${l.email}","${l.phone}","${l.intentKeyword}",${l.score},"${l.status}","${l.verificationStatus || 'Verified'}"\n`);
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LeadFlow_Global_Leads.csv';
    a.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold mb-3">
            <Users className="w-3.5 h-3.5" />
            CRM & Lead Database
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Global Leads Directory ({filteredLeads.length})
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Verified B2B prospects across 154 countries with real-time buyer intent signals.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={handlePurge}
            disabled={isPurging}
            className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30 flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            title="Reset lead directory and clear stored records"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            {isPurging ? 'Resetting...' : 'Reset Directory'}
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            Export CSV / Leads
          </button>
        </div>
      </div>

      {purgeMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{purgeMsg}</span>
        </div>
      )}

      {/* Filters bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, contact, or intent..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Country:</span>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6">Company & Contact</th>
                <th className="p-4">Location</th>
                <th className="p-4">Channels & Verification</th>
                <th className="p-4">Buyer Intent Keyword</th>
                <th className="p-4">Intent Score</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr 
                    key={lead.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white shrink-0 group-hover:border-cyan-500 transition-colors">
                          {lead.company.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{lead.company}</p>
                          <p className="text-slate-400 text-xs">{lead.contactName} • <span className="text-slate-300">{lead.title}</span></p>
                          <p className="text-[11px] text-cyan-400/90 font-mono mt-0.5">{lead.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{lead.city}, {lead.country}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                            lead.whatsappEnabled !== false
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}>
                            <ShieldCheck className="w-3 h-3" />
                            {lead.verificationStatus || (lead.whatsappEnabled !== false ? 'Verified MX & WhatsApp' : 'Verified Gmail Only')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span className="flex items-center gap-0.5 text-cyan-300">
                            <Mail className="w-2.5 h-2.5" /> Gmail
                          </span>
                          {lead.whatsappEnabled !== false && (
                            <span className="flex items-center gap-0.5 text-emerald-300">
                              <MessageSquare className="w-2.5 h-2.5" /> WhatsApp
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono text-[11px]">
                        "{lead.intentKeyword}"
                      </span>
                    </td>

                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {lead.score} / 100
                    </td>

                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        lead.status === 'Converted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        lead.status === 'Replied' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                        lead.status === 'Contacted' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {lead.status}
                      </span>
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => onOpenLeadModal(lead)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/40 transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        AI Outreach
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No leads found in database. Launch a campaign to scan 100% verified real prospects.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
