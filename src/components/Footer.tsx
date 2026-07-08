import React from 'react';
import { Send, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Terima kasih telah berlangganan newsletter EventSnap!');
  };

  return (
    <footer className="bg-brand-charcoal text-white border-t border-brand-border/20 pt-16 pb-12 font-sans" id="app-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Column 1: Info and logo */}
          <div className="md:col-span-5 space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo-eventsnap.png" 
                alt="EventSnap Logo" 
                className="w-10 h-10 object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
              <span className="text-lg font-bold font-serif tracking-tight">
                EventSnap
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-300/70 max-w-sm leading-relaxed font-light">
              EventSnap adalah platform modern untuk mencari berbagai agenda kegiatan dan mengotomatisasi pembuatan serta pendistribusian sertifikat digital secara instan dan cerdas bagi panitia penyelenggara.
            </p>

            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-white/60 hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="text-white/60 hover:text-white transition-colors"><Github className="w-4 h-4" /></a>
              <a href="#" className="text-white/60 hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="md:col-span-3 space-y-4 text-left">
            <h4 className="text-xs font-bold font-mono text-brand-orange uppercase tracking-wider">Tautan Cepat</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300/70 font-light">
              <li><a href="#hero-section" className="hover:text-white transition-colors">Cara Kerja</a></li>
              <li><a href="#fitur-section" className="hover:text-white transition-colors">Fitur Utama</a></li>
              <li><a href="#harga-section" className="hover:text-white transition-colors">Paket Harga</a></li>
              <li><a href="#events-hero-section" className="hover:text-white transition-colors">Cari Event</a></li>
            </ul>
          </div>

          {/* Column 3: Newsletter subscribing column */}
          <div className="md:col-span-4 space-y-4 text-left">
            <h4 className="text-xs font-bold font-mono text-brand-orange uppercase tracking-wider">Berlangganan Newsletter</h4>
            <p className="text-xs text-slate-300/70 font-light leading-relaxed">
              Dapatkan berita terbaru mengenai tips manajemen event dan promo diskon kuota cetak sertifikat bulanan.
            </p>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="Surel Anda..."
                className="bg-white/10 border border-white/10 p-3 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-brand-orange w-full"
              />
              <button
                type="submit"
                className="bg-brand-orange hover:bg-brand-orange-hover text-white p-3 rounded-xl transition-all shadow-md shadow-brand-orange/10 shrink-0"
                aria-label="Subscribe"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom copyright statement */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-8 text-[11px] text-slate-400/50 font-mono">
          <p>© 2026 EventSnap. Otomatisasi sertifikat dan dokumen kepanitiaan cerdas.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
