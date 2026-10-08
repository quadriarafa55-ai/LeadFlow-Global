import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { CampaignCreator } from './components/CampaignCreator';
import { LeadsDirectory } from './components/LeadsDirectory';
import { IntegrationSettings } from './components/IntegrationSettings';
import { PricingPage } from './components/PricingPage';
import { OutreachModal } from './components/OutreachModal';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingWizard } from './components/OnboardingWizard';
import { NavigationTab, Lead, Campaign, AntiBanSettings, User } from './types';
import { initialLeads, initialCampaigns, defaultAntiBanSettings } from './data/mockData';
import { supabase } from './supabaseClient';
import { supabaseService } from './services/supabaseService';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [antiBanSettings, setAntiBanSettings] = useState<AntiBanSettings>(defaultAntiBanSettings);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    if (user?.email) {
      supabaseService.getCampaigns(user.email).then((camps) => {
        if (camps && camps.length > 0) {
          setCampaigns(camps);
        }
      });
      supabaseService.getCampaignLeads(user.email).then((savedLeads) => {
        if (savedLeads && savedLeads.length > 0) {
          setLeads(savedLeads);
        } else {
          setLeads([]);
        }
      });
    }
  }, [user?.email]);

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && event.reason.message && event.reason.message.includes('WebSocket')) {
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          const email = session.user.email || 'user@leadflow.global';
          const fullName = session.user.user_metadata?.full_name || email.split('@')[0];
          setUser({
            name: fullName,
            email: email,
            planName: 'Starter Plan',
            leadsUsed: 42,
            leadsLimit: 500,
            isOnboarded: true,
            isTrialActive: true,
            trialDaysLeft: 14,
            paymentFailed: false,
            connectedGmail: false,     // Starts disconnected so you can test authentic connection
            connectedWhatsApp: false,  // Starts disconnected so you can test authentic connection
          });
        }
      })
      .catch((err) => {
        console.warn('Supabase session warning suppressed:', err);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
      }
    });

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    setUser(null);
  };

  if (!user) {
    return <AuthScreen onLogin={(loggedInUser) => setUser(loggedInUser)} />;
  }

  if (!user.isOnboarded) {
    return (
      <OnboardingWizard 
        user={user}
        onCompleteOnboarding={(updatedProps) => setUser({ ...user, ...updatedProps })}
      />
    );
  }

  const handleAddCampaign = (newCamp: Campaign) => {
    setCampaigns([newCamp, ...campaigns]);
  };

  const handleAddLeads = (newLeads: Lead[]) => {
    setLeads(prev => [...newLeads, ...prev]);
  };

  const handleUpdateUserUsage = (addedCount: number) => {
    setUser(prev => prev ? { ...prev, leadsUsed: prev.leadsUsed + addedCount } : prev);
  };

  const handleUpdateUser = (updatedProps: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updatedProps } : prev);
  };

  const handlePurgeLeads = () => {
    setLeads([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-cyan-500 selection:text-white">
      <Sidebar 
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        user={user}
        onLogout={handleLogout}
      />
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        <Navbar 
          onToggleMobile={() => setIsMobileOpen(true)}
          onSelectTab={setCurrentTab}
          leads={leads}
          onOpenLeadModal={setSelectedLead}
        />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <div className={currentTab === 'dashboard' ? 'block' : 'hidden'}>
            <DashboardOverview 
              leads={leads}
              campaigns={campaigns}
              onSelectTab={setCurrentTab}
              onOpenLeadModal={setSelectedLead}
              user={user}
              onPurgeLeads={handlePurgeLeads}
            />
          </div>
          <div className={currentTab === 'campaigns' ? 'block' : 'hidden'}>
            <CampaignCreator 
              onAddCampaign={handleAddCampaign}
              onAddLeads={handleAddLeads}
              user={user}
              onUpdateUserUsage={handleUpdateUserUsage}
              onNavigateToPricing={() => setCurrentTab('pricing')}
              onClearLeads={handlePurgeLeads}
            />
          </div>
          <div className={currentTab === 'leads' ? 'block' : 'hidden'}>
            <LeadsDirectory 
              leads={leads}
              onOpenLeadModal={setSelectedLead}
              userEmail={user.email}
              onPurgeLeads={handlePurgeLeads}
            />
          </div>
          <div className={currentTab === 'integrations' ? 'block' : 'hidden'}>
            <IntegrationSettings 
              settings={antiBanSettings}
              onUpdateSettings={setAntiBanSettings}
              user={user}
              onUpdateUser={handleUpdateUser}
            />
          </div>
          <div className={currentTab === 'pricing' ? 'block' : 'hidden'}>
            <PricingPage />
          </div>
        </main>
      </div>

      {selectedLead && (
        <OutreachModal 
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}