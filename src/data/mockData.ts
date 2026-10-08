import { Lead, Campaign, AntiBanSettings, SubscriptionPlan } from '../types';

export const initialLeads: Lead[] = [];

export const initialCampaigns: Campaign[] = [];

export const defaultAntiBanSettings: AntiBanSettings = {
  minDelay: 45,
  maxDelay: 90,
  dailyLimitGmail: 250,
  dailyLimitWhatsapp: 180,
  humanTypingSpeed: true,
  proxyRotation: true,
  warmupMode: true,
  sandboxMode: true,
};

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter Plan',
    monthlyPrice: 19,
    annualPrice: 150,
    description: 'Ideal for solo founders and boutique agencies starting global outreach.',
    features: [
      '1 Country Target Mode',
      '500 Verified Leads / month',
      '1 Connected Gmail / WhatsApp',
      'Basic AI Outreach Generator',
      'Standard Anti-Ban Protection',
      'Email Support'
    ],
    leadsPerMonth: '500 Leads',
    countriesLimit: '1 Country',
    accountsLimit: '1 Account',
  },
  {
    id: 'growth',
    name: 'Growth Agency Plan',
    monthlyPrice: 49,
    annualPrice: 390,
    popular: true,
    description: 'Designed for scaling sales teams and fast-growing B2B agencies.',
    features: [
      'Up to 3 Country Targets',
      '3,000 Verified Leads / month',
      '3 Connected Accounts (Gmail + WhatsApp)',
      'Advanced AI Personalization Engine',
      'Dynamic Proxy Rotation & Safety Sliders',
      'CRM & Webhook Integrations',
      'Priority Support'
    ],
    leadsPerMonth: '3,000 Leads',
    countriesLimit: '3 Countries',
    accountsLimit: '3 Accounts',
  },
  {
    id: 'empire',
    name: 'Global Empire Plan',
    monthlyPrice: 99,
    annualPrice: 790,
    description: 'Unlimited global power for enterprise teams and massive outbound operations.',
    features: [
      'Unlimited Global Targeting (150+ Countries)',
      '15,000 Verified Leads / month',
      'Unlimited Account Rotation',
      'Custom Gemini AI Multi-Model Prompts',
      'Dedicated IP & Residential Proxies',
      'Automated Follow-up Sequences',
      'Dedicated Account Manager'
    ],
    leadsPerMonth: '15,000 Leads',
    countriesLimit: 'Unlimited Global',
    accountsLimit: 'Unlimited Accounts',
  }
];
