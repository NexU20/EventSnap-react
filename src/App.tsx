import React, { useState } from 'react';
import { ActiveTab } from './types';
import Header from './components/Header';
import LandingAutomation from './components/LandingAutomation';
import PublicEvents from './components/PublicEvents';
import DashboardOrganizer from './components/DashboardOrganizer';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [session, setSession] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  React.useEffect(() => {
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setSession(parsed);
        // Refresh session from API asynchronously to catch latest quota resets
        fetch(`/api/auth/session?userId=${parsed.id}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.user) {
              setSession(data.user);
              localStorage.setItem('user_session', JSON.stringify(data.user));
            }
          })
          .catch(err => console.error('Session validation error:', err));
      } catch (e) {
        localStorage.removeItem('user_session');
      }
    }
  }, []);

  const handleLoginSuccess = (user: any) => {
    setSession(user);
    localStorage.setItem('user_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('user_session');
    setActiveTab('home');
  };

  // Helper to switch view directly to dashboard
  const handleOpenDashboard = () => {
    setActiveTab('dashboard');
  };

  const handleExploreEvents = () => {
    setActiveTab('events');
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-cream text-brand-charcoal selection:bg-brand-orange/20 selection:text-brand-orange">
      
      {/* If the current view is NOT the full-screen admin dashboard, render standard header */}
      {activeTab !== 'dashboard' && (
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          openDashboard={handleOpenDashboard} 
          session={session}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />
      )}

      {/* RENDER ACTIVE TAB CONTROLLER */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div className="animate-fade-in">
            <LandingAutomation 
              onStart={handleOpenDashboard} 
              onExploreEvents={handleExploreEvents} 
            />
          </div>
        )}

        {activeTab === 'events' && (
          <div className="animate-fade-in">
            <PublicEvents onOpenDashboard={handleOpenDashboard} />
          </div>
        )}

        {activeTab === 'certificate-info' && (
          <div className="animate-fade-in">
            {/* Quick visual anchor redirects for simple navigation links */}
            <LandingAutomation 
              onStart={handleOpenDashboard} 
              onExploreEvents={handleExploreEvents} 
            />
            {/* Autoscrolls or points to specific information */}
            <span className="hidden">Scroll target anchor</span>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="animate-fade-in">
            <LandingAutomation 
              onStart={handleOpenDashboard} 
              onExploreEvents={handleExploreEvents} 
            />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            <DashboardOrganizer 
              onBackToPublic={() => setActiveTab('home')} 
              session={session}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onLogout={handleLogout}
              onRefreshSession={async () => {
                if (session) {
                  try {
                    const res = await fetch(`/api/auth/session?userId=${session.id}`);
                    const data = await res.json();
                    if (data.success && data.user) {
                      setSession(data.user);
                      localStorage.setItem('user_session', JSON.stringify(data.user));
                    }
                  } catch (err) {
                    console.error('Failed refreshing session:', err);
                  }
                }
              }}
            />
          </div>
        )}
      </main>

      {/* Render standard footer ONLY on public landing and exploration paths */}
      {activeTab !== 'dashboard' && <Footer />}

      {/* Global Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={handleLoginSuccess} 
      />

    </div>
  );
}
