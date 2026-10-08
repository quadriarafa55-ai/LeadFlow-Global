import React, { useState } from 'react';
import { 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CreditCard,
  Zap,
  Loader2,
  X,
  QrCode,
  Lock,
  Globe
} from 'lucide-react';
import { User } from '../types';
import { subscriptionPlans } from '../data/mockData';

interface OnboardingWizardProps {
  user: User;
  onCompleteOnboarding: (updatedUser: Partial<User>) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  user,
  onCompleteOnboarding
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [connectedGmail, setConnectedGmail] = useState(user.connectedGmail);
  const [connectedWhatsApp, setConnectedWhatsApp] = useState(user.connectedWhatsApp);
  const [surveySource, setSurveySource] = useState('Social Media');
  const [selectedPlanId, setSelectedPlanId] = useState('starter');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Modal states for realistic connections
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [waConnectingState, setWaConnectingState] = useState<'scanning' | 'paired'>('scanning');

  const [showGmailModal, setShowGmailModal] = useState(false);

  const handleStartWhatsAppConnect = () => {
    setWaConnectingState('scanning');
    setShowWhatsAppModal(true);
    // Simulate 3 seconds pairing
    setTimeout(() => {
      setWaConnectingState('paired');
      setTimeout(() => {
        setConnectedWhatsApp(true);
        setShowWhatsAppModal(false);
      }, 1000);
    }, 3000);
  };

  const handleAllowGmailOAuth = () => {
    setConnectedGmail(true);
    setShowGmailModal(false);
  };

  const handleFinish = (skipBilling = false) => {
    const plan = subscriptionPlans.find(p => p.id === selectedPlanId) || subscriptionPlans[0];
    onCompleteOnboarding({
      isOnboarded: true,
      connectedGmail,
      connectedWhatsApp,
      surveySource,
      planName: plan.name,
      leadsLimit: plan.id === 'growth' ? 3000 : plan.id === 'empire' ? 15000 : 500,
      isTrialActive: !skipBilling,
      trialDaysLeft: 14,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 space-y-6">
        {/* Progress Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Mandatory Setup Wizard ({step} of 3)
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {step === 1 && 'Step 1: Connect Your Outreach Channels'}
            {step === 2 && 'Step 2: Tell Us About Yourself'}
            {step === 3 && 'Step 3: Activate 14-Day Free Trial'}
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            {step === 1 && 'Establish secure protocol links before launching your first campaign.'}
            {step === 2 && 'Help us tailor your global lead generation experience.'}
            {step === 3 && 'Start your risk-free trial with instant access to 150+ countries.'}
          </p>
        </div>

        {/* Step Cards */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          
          {/* STEP 1: Integration Hub */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gmail Card */}
                <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  connectedGmail 
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white' 
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                        <Mail className="w-5 h-5" />
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        connectedGmail ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}>
                        {connectedGmail ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1">Gmail SMTP / OAuth</h3>
                    <p className="text-xs text-slate-400">Connect your professional inbox for automated outbound emails.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (connectedGmail) {
                        setConnectedGmail(false);
                      } else {
                        setShowGmailModal(true);
                      }
                    }}
                    className={`mt-4 w-full py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      connectedGmail 
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white shadow-md'
                    }`}
                  >
                    {connectedGmail ? 'Disconnect Gmail' : 'Connect Gmail'}
                  </button>
                </div>

                {/* WhatsApp Card */}
                <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  connectedWhatsApp 
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white' 
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        connectedWhatsApp ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}>
                        {connectedWhatsApp ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1">WhatsApp Business API</h3>
                    <p className="text-xs text-slate-400">Connect Meta Cloud API for automated messaging campaigns.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (connectedWhatsApp) {
                        setConnectedWhatsApp(false);
                      } else {
                        handleStartWhatsAppConnect();
                      }
                    }}
                    className={`mt-4 w-full py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      connectedWhatsApp 
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white shadow-md'
                    }`}
                  >
                    {connectedWhatsApp ? 'Disconnect WhatsApp' : 'Connect WhatsApp'}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>You can also connect or configure your integrations anytime later from the Integrations tab.</span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                >
                  <span>Continue to Survey</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Survey Question */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-white">
                  Where did you hear about LeadFlow Global?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Social Media (Twitter/X, LinkedIn)',
                    'Search Engine (Google / Bing)',
                    'Friend / Colleague Referral',
                    'YouTube Video / Tutorial',
                    'Other'
                  ].map((option) => (
                    <div
                      key={option}
                      onClick={() => setSurveySource(option)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        surveySource === option 
                          ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-md shadow-cyan-500/10' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-medium">{option}</span>
                      {surveySource === option && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                >
                  <span>Continue to Subscription</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Subscription & 14-Day Trial Plan Selector */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subscriptionPlans.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-gradient-to-b from-cyan-500/20 to-slate-900 border-cyan-500 text-white shadow-xl shadow-cyan-500/15' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-white text-xs">{plan.name}</h4>
                          {isSelected && <span className="text-[10px] bg-cyan-500 text-slate-950 font-bold px-2 py-0.5 rounded">Selected</span>}
                        </div>
                        <p className="text-lg font-extrabold text-white mb-3">${plan.monthlyPrice}<span className="text-xs font-normal text-slate-400">/mo</span></p>
                        <p className="text-[11px] text-slate-300">{plan.leadsPerMonth} • {plan.countriesLimit}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Card Details for 14-day trial upfront terms */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  <span>14-Day Free Trial (Card Required Upfront)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Your card will not be charged today. You will have full access for 14 days. Automatic monthly billing begins on day 15 unless cancelled before trial expiry.
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Card Number</label>
                    <input 
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 •••• •••• 4242"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Expiry Date</label>
                      <input 
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">CVC / CVV</label>
                      <input 
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="123"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleFinish(true)}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Skip for now / Decide Later
                </button>

                <button
                  type="button"
                  onClick={() => handleFinish(false)}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Start 14-Day Free Trial & Enter Dashboard
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Realistic WhatsApp QR Code Scanner Simulation Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Link WhatsApp Business</h3>
              <button onClick={() => setShowWhatsAppModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {waConnectingState === 'scanning' ? (
              <div className="space-y-4">
                <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-3 relative flex items-center justify-center shadow-inner">
                  <div className="absolute inset-0 border-2 border-emerald-500 rounded-2xl animate-pulse pointer-events-none" />
                  <QrCode className="w-36 h-36 text-slate-900" />
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-500 animate-bounce" />
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Waiting for phone pairing...
                </div>
                <p className="text-[11px] text-slate-400">Open WhatsApp on your phone {'>'} Linked Devices {'>'} Link a Device</p>
              </div>
            ) : (
              <div className="py-8 space-y-3 animate-in fade-in">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-white text-base">WhatsApp Paired Successfully!</h4>
                <p className="text-xs text-slate-400">Official Meta Cloud API connected.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Realistic Google OAuth Permission Modal */}
      {showGmailModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">G</div>
                <span className="font-bold text-white text-sm">Sign in with Google</span>
              </div>
              <button onClick={() => setShowGmailModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <p className="font-medium text-white">LeadFlow Global wants access to your Google Account</p>
              
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Read, compose, send, and permanently delete all your email from Gmail</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Make sure you trust LeadFlow Global. By selecting Allow, you give this app permission to use your information in accordance with their terms.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowGmailModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAllowGmailOAuth}
                className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md"
              >
                Allow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
