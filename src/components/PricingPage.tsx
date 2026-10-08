import React, { useState } from 'react';
import { Check, Sparkles, Zap, ShieldCheck, Globe2 } from 'lucide-react';
import { subscriptionPlans } from '../data/mockData';

export const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [upgradedPlan, setUpgradedPlan] = useState<string | null>(null);

  const handleUpgrade = (planName: string) => {
    setUpgradedPlan(planName);
    setTimeout(() => setUpgradedPlan(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Flexible Global Plans
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Scale Your Global Pipeline With Zero Risk
        </h2>
        <p className="text-sm md:text-base text-slate-400">
          Choose the plan that fits your growth goals. Upgrade or switch between billing cycles anytime.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-900 border border-slate-800 mt-6">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              billingCycle === 'annual'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {upgradedPlan && (
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center text-sm animate-in fade-in">
          🎉 Successfully upgraded to <span className="font-bold">{upgradedPlan}</span>! Your account has been instantly unlocked.
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {subscriptionPlans.map((plan) => {
          const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
          const isCurrent = plan.id === 'growth'; // Mock current plan

          return (
            <div 
              key={plan.id}
              className={`rounded-3xl bg-slate-900/90 border flex flex-col justify-between p-8 relative shadow-xl transition-all hover:border-cyan-500/50 ${
                plan.popular 
                  ? 'border-cyan-500/60 shadow-cyan-500/10 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40 scale-105 md:-translate-y-2' 
                  : 'border-slate-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-cyan-500/30">
                  Most Popular Choice
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  {isCurrent && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                      Current Plan
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-6 min-h-[36px]">{plan.description}</p>

                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-800">
                  <span className="text-4xl md:text-5xl font-extrabold text-white">${price}</span>
                  <span className="text-slate-400 text-xs font-medium">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                </div>

                <div className="space-y-3 mb-8">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Plan Highlights:</p>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <div className="p-1 rounded-full bg-cyan-500/10 text-cyan-400 mt-0.5 shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleUpgrade(plan.name)}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                  plan.popular
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                <Zap className="w-4 h-4" />
                {isCurrent ? 'Manage Subscription' : 'Upgrade Plan'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Enterprise / Custom Global Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
            <Globe2 className="w-3.5 h-3.5" />
            Enterprise Dedicated Instances
          </div>
          <h3 className="text-xl font-bold text-white">Need Custom Proxy Meshes or Dedicated IP Pools?</h3>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl">
            We provide custom dedicated server infrastructure for high-volume agencies sending over 100,000 messages daily.
          </p>
        </div>
        <button 
          onClick={() => alert('Our enterprise sales team will contact you within 2 hours.')}
          className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold border border-slate-700 transition-all shrink-0"
        >
          Contact Enterprise Sales
        </button>
      </div>
    </div>
  );
};
