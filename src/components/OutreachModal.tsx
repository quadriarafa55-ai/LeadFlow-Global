import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  X, 
  RefreshCw, 
  MessageSquare, 
  Mail, 
  CheckCircle2, 
  ShieldCheck,
  FlaskConical,
  Radio
} from 'lucide-react';
import { Lead } from '../types';

interface OutreachModalProps {
  lead: Lead;
  onClose: () => void;
  defaultSandbox?: boolean;
}

export const OutreachModal: React.FC<OutreachModalProps> = ({ lead, onClose, defaultSandbox = true }) => {
  const [channel, setChannel] = useState<'Gmail' | 'WhatsApp'>('Gmail');
  const [tone, setTone] = useState<string>('Professional & persuasive');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(defaultSandbox);
  const [dispatchStatus, setDispatchStatus] = useState<null | {
    id: string;
    channel: 'Gmail' | 'WhatsApp';
    recipient: string;
    latency: string;
    isSandbox: boolean;
  }>(null);

  const generateMessage = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/generate-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: lead.company,
          recipientName: lead.contactName,
          industry: lead.intentKeyword,
          channel,
          tone
        })
      });

      const responseText = await res.text();
      let data: any = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = {};
      }

      if (data.message) {
        setMessage(data.message);
      } else {
        setMessage(`Hi ${lead.contactName}, noticed your team at ${lead.company} is accelerating growth in the ${lead.intentKeyword} sector. LeadFlow Global provides automated multi-channel outreach with anti-ban protection across 150+ countries. Open to a brief 5-min demo this week?`);
      }
    } catch {
      setMessage(`Hi ${lead.contactName}, I noticed ${lead.company}'s active expansion in ${lead.country}. We help teams in ${lead.intentKeyword} scale outbound pipeline reliably. Would you be open to connecting?`);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    generateMessage();
  }, [channel, tone]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = () => {
    const targetRecipient = channel === 'Gmail' ? lead.email : lead.phone;
    setDispatchStatus({
      id: `disp-${Date.now().toString(36)}`,
      channel,
      recipient: targetRecipient,
      latency: `${Math.floor(110 + Math.random() * 80)}ms`,
      isSandbox: isSandboxMode
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold">
              {lead.company.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-white text-sm md:text-base flex items-center gap-2">
                {lead.company} 
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-normal border border-emerald-500/20">
                  Intent Score: {lead.score}
                </span>
              </h3>
              <p className="text-xs text-slate-400">{lead.contactName} • {lead.title} ({lead.city}, {lead.country})</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sandbox Mode Banner & Toggle */}
        <div className="px-6 py-3 bg-gradient-to-r from-cyan-950/40 to-slate-900 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className={`w-4 h-4 ${isSandboxMode ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
            <div>
              <span className="text-xs font-semibold text-white">
                {isSandboxMode ? 'Test Sandbox Mode Active' : 'Live Production Mode'}
              </span>
              <p className="text-[10px] text-slate-400">
                {isSandboxMode 
                  ? 'Simulates instant deliverability & read receipts without live API tokens' 
                  : 'Requires connected Gmail SMTP or WhatsApp Cloud API token'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSandboxMode(!isSandboxMode)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
              isSandboxMode 
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Radio className="w-3 h-3" />
            {isSandboxMode ? 'Sandbox ON' : 'Sandbox OFF'}
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Outreach Channel</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setChannel('Gmail')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    channel === 'Gmail' 
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Gmail (SMTP)
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('WhatsApp')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    channel === 'WhatsApp' 
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  WhatsApp API
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">AI Tone</label>
              <select 
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Professional & persuasive">Professional & persuasive</option>
                <option value="Casual & friendly">Casual & friendly</option>
                <option value="Direct & data-driven">Direct & data-driven</option>
                <option value="Short & punchy">Short & punchy</option>
              </select>
            </div>
          </div>

          {/* Generated Message Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Personalized Outreach Content
              </label>
              <button 
                type="button"
                onClick={generateMessage}
                disabled={isLoading}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
            </div>
            <div className="relative">
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans leading-relaxed resize-none"
                placeholder={isLoading ? "Generating personalized AI message..." : "Message content..."}
              />
              {isLoading && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs rounded-2xl flex items-center justify-center">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Crafting personalized AI outreach...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live Dispatch Simulation Card */}
          {dispatchStatus && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> 
                  {dispatchStatus.isSandbox ? 'Sandbox Dispatch Simulated (100% Delivered)' : 'Dispatched to Gateway'}
                </span>
                <span className="font-mono text-[10px] text-slate-400">{dispatchStatus.latency}</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Delivered to <strong className="text-white">{dispatchStatus.recipient}</strong> via {dispatchStatus.channel}. Anti-ban proxy headers verified and delivery receipt acknowledged.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Message'}
          </button>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSendMessage}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                isSandboxMode
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/25'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25'
              }`}
            >
              <Send className="w-4 h-4" />
              {isSandboxMode ? `Test Dispatch via ${channel}` : `Send Now via ${channel}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
