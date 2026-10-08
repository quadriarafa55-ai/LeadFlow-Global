export type NavigationTab = 'dashboard' | 'campaigns' | 'leads' | 'integrations' | 'pricing';

export interface User {
  name: string;
  email: string;
  planName: string;
  leadsUsed: number;
  leadsLimit: number;
  isOnboarded: boolean;
  isTrialActive: boolean;
  trialDaysLeft: number;
  paymentFailed: boolean;
  connectedGmail: boolean;
  connectedWhatsApp: boolean;
  surveySource?: string;
}

export interface Lead {
  id: string;
  company: string;
  contactName: string;
  title: string;
  country: string;
  city: string;
  email: string;
  phone: string;
  intentKeyword: string;
  score: number;
  status: 'New' | 'Contacted' | 'Replied' | 'Converted' | 'Bounced';
  lastActivity?: string;
  avatar?: string;
  emailDeliverable?: boolean;
  whatsappEnabled?: boolean;
  channels?: ('Gmail' | 'WhatsApp')[];
  verificationStatus?: string;
  website?: string;
  source?: string;
}

export interface Campaign {
  id: string;
  name: string;
  niche: string;
  region: string;
  channels: ('Gmail' | 'WhatsApp')[];
  status: 'Active' | 'Paused' | 'Completed' | 'Draft';
  leadsCount: number;
  sentCount: number;
  replyRate: string;
  conversionRate: string;
  createdAt: string;
}

export interface AntiBanSettings {
  minDelay: number;
  maxDelay: number;
  dailyLimitGmail: number;
  dailyLimitWhatsapp: number;
  humanTypingSpeed: boolean;
  proxyRotation: boolean;
  warmupMode: boolean;
  sandboxMode?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  leadsPerMonth: string;
  countriesLimit: string;
  accountsLimit: string;
  popular?: boolean;
}
