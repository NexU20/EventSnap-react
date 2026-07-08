import React from 'react';
import { Award, Menu, X, LayoutDashboard, Calendar, FileSpreadsheet, Layers } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openDashboard: () => void;
  session?: any;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export default function Header({ activeTab, setActiveTab, openDashboard, session, onOpenAuth, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'events', label: 'Explore Acara' },
    { id: 'cara-kerja', label: 'Cara Kerja' },
    { id: 'fitur', label: 'Fitur' },
    { id: 'harga', label: 'Harga' },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    if (id === 'home') {
      setActiveTab('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (id === 'events') {
      setActiveTab('events');
    } else if (id === 'cara-kerja') {
      setActiveTab('home');
      setTimeout(() => {
        const el = document.getElementById('cara-kerja-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    } else if (id === 'fitur') {
      setActiveTab('home');
      setTimeout(() => {
        const el = document.getElementById('fitur-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    } else if (id === 'harga') {
      setActiveTab('home');
      setTimeout(() => {
        const el = document.getElementById('harga-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  };

  const isTabActive = (id: string) => {
    if (id === 'home' && activeTab === 'home') return true;
    if (id === 'events' && activeTab === 'events') return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-cream/90 backdrop-blur-md border-b border-brand-border/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <div 
            onClick={() => handleNavClick('home')} 
            className="flex items-center gap-2.5 cursor-pointer group"
            id="nav-logo-container"
          >
            <img 
              src="/logo-eventsnap.png" 
              alt="EventSnap Logo" 
              className="w-10 h-10 object-contain rounded-xl transition-transform group-hover:scale-105" 
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-xl font-bold text-brand-charcoal font-sans tracking-tight block leading-tight">
                EventSnap
              </span>
              <span className="text-[10px] text-brand-charcoal/60 font-mono tracking-wider block">
                Smart Certificate Automation
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8" id="desktop-navigation">
            {navItems.map((item) => {
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-1.5 px-1 py-2 text-sm font-medium border-b-2 transition-all ${
                    isTabActive(item.id)
                      ? 'border-brand-orange text-brand-orange'
                      : 'border-transparent text-brand-charcoal/70 hover:text-brand-charcoal hover:border-brand-border'
                  }`}
                  id={`nav-item-${item.id}`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={openDashboard}
              className={`flex items-center space-x-1.5 px-1 py-2 text-sm font-medium border-b-2 transition-all ${
                activeTab === 'dashboard'
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-brand-charcoal/70 hover:text-brand-charcoal'
              }`}
              id="nav-item-dashboard"
            >
              <LayoutDashboard className="w-4 h-4 text-brand-orange/70" />
              <span>Dashboard</span>
            </button>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4" id="header-cta-desktop">
            {session ? (
              <>
                <div className="text-right">
                  <span className="text-[10px] text-brand-charcoal/50 block font-mono">Halo,</span>
                  <span className="text-xs font-bold text-brand-charcoal block">{session.name || session.email}</span>
                </div>
                <button
                  onClick={openDashboard}
                  className="bg-brand-orange text-white hover:bg-brand-orange-hover font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-brand-orange/10 hover:shadow-brand-orange/20 active:scale-98"
                  id="cta-buka-app"
                >
                  Dashboard
                </button>
                <button
                  onClick={onLogout}
                  className="text-xs text-brand-charcoal/50 hover:text-brand-orange transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-brand-orange text-white hover:bg-brand-orange-hover font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md shadow-brand-orange/10 hover:shadow-brand-orange/20 active:scale-98"
                id="cta-buka-app"
              >
                Login / Daftar
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-brand-charcoal/80 p-2 rounded-xl hover:bg-brand-border/40 transition-colors focus:outline-none"
              id="mobile-menu-toggle"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-cream border-b border-brand-border px-4 pt-2 pb-6 space-y-2 animate-fade-in" id="mobile-navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all ${
                isTabActive(item.id)
                  ? 'bg-brand-orange/10 text-brand-orange'
                  : 'text-brand-charcoal/80 hover:bg-brand-border/30'
              }`}
              id={`mobile-nav-item-${item.id}`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-2 w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-brand-orange/10 text-brand-orange'
                : 'text-brand-charcoal/80 hover:bg-brand-border/30'
            }`}
            id="mobile-nav-item-dashboard"
          >
            <LayoutDashboard className="w-5 h-5 text-brand-orange" />
            <span>Dashboard Panitia</span>
          </button>
          <div className="pt-4 px-4 border-t border-brand-border/30 mt-4 space-y-2">
            {session ? (
              <>
                <div className="text-left px-4 mb-2">
                  <span className="text-[10px] text-brand-charcoal/50 block font-mono">Halo,</span>
                  <span className="text-sm font-bold text-brand-charcoal block">{session.name || session.email}</span>
                </div>
                <button
                  onClick={() => {
                    openDashboard();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-brand-orange text-white text-center font-semibold text-base py-3 rounded-xl transition-all shadow-md shadow-brand-orange/10 block hover:bg-brand-orange-hover"
                  id="mobile-cta-buka-app"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    if (onLogout) onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center text-xs text-brand-charcoal/50 py-2 block hover:text-brand-orange transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  if (onOpenAuth) onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-brand-orange text-white text-center font-semibold text-base py-3 rounded-xl transition-all shadow-md shadow-brand-orange/10 block hover:bg-brand-orange-hover"
                id="mobile-cta-buka-app"
              >
                Login / Daftar
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
