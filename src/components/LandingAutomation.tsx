import React from 'react';
import { Check, ArrowRight, Play, Sparkles, Zap, Award, ShieldCheck, Users } from 'lucide-react';

interface LandingAutomationProps {
  onStart: () => void;
  onExploreEvents: () => void;
}

export default function LandingAutomation({ onStart, onExploreEvents }: LandingAutomationProps) {
  return (
    <div className="bg-brand-cream min-h-screen font-sans pb-16 relative overflow-hidden">
      {/* Decorative Geometric Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]">
        <div className="absolute -left-20 -top-20 w-96 h-96 border-[40px] border-brand-orange rounded-full"></div>
        <div className="absolute -right-20 top-1/4 w-80 h-80 border-[30px] border-brand-orange rounded-full"></div>
        <div className="absolute left-1/3 bottom-20 w-72 h-72 border-[24px] border-brand-orange rounded-full"></div>
      </div>
      
      {/* 1. HERO SECTION (Image 1 reference) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 md:pt-16 md:pb-28" id="hero-section">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div>
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold text-brand-orange bg-brand-orange/10 border border-brand-orange/20 tracking-wider uppercase font-mono shadow-sm">
                TRUSTED BY 200+ EVENT ORGANIZERS
              </span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-serif font-semibold text-brand-charcoal leading-tight tracking-tight">
              EventSnap
            </h1>
            
            <p className="text-lg md:text-xl text-brand-charcoal/80 font-sans leading-relaxed font-light">
              Buat ratusan sertifikat personal dari satu template dan satu spreadsheet. 
              Tanpa copy-paste, tanpa software desain. Yang butuh berhari-hari, sekarang 
              selesai dalam hitungan menit.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={onStart}
                className="bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold text-base px-8 py-4 rounded-xl transition-all shadow-lg shadow-brand-orange/20 flex items-center justify-center space-x-2 active:scale-98"
                id="hero-start-btn"
              >
                <span>Mulai Gratis</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={onExploreEvents}
                className="bg-white hover:bg-brand-cream text-brand-charcoal border border-brand-border font-semibold text-base px-8 py-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm"
                id="hero-demo-btn"
              >
                <span>Cari Acara</span>
                <Play className="w-4 h-4 fill-brand-charcoal" />
              </button>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-brand-border/80">
              <div className="bg-brand-card border border-brand-border/40 p-4 rounded-xl shadow-sm text-left">
                <span className="block text-2xl sm:text-3xl font-bold text-brand-orange font-serif">12.400+</span>
                <span className="block text-[11px] sm:text-xs text-brand-charcoal/70 mt-1 font-sans leading-tight">sertifikat digenerate bulan ini</span>
              </div>
              <div className="bg-brand-card border border-brand-border/40 p-4 rounded-xl shadow-sm text-left">
                <span className="block text-2xl sm:text-3xl font-bold text-brand-orange font-serif">&lt; 3 detik</span>
                <span className="block text-[11px] sm:text-xs text-brand-charcoal/70 mt-1 font-sans leading-tight">rata-rata waktu per dokumen</span>
              </div>
              <div className="bg-brand-card border border-brand-border/40 p-4 rounded-xl shadow-sm text-left">
                <span className="block text-2xl sm:text-3xl font-bold text-brand-orange font-serif">50</span>
                <span className="block text-[11px] sm:text-xs text-brand-charcoal/70 mt-1 font-sans leading-tight">dokumen gratis setiap acara</span>
              </div>
            </div>
          </div>
          
          {/* Right Hero Column: Visual Product Mockup (Matches exact style of Product Preview in Image 1) */}
          <div className="lg:col-span-7">
            <div className="relative bg-[#fbf9f6] border border-brand-border rounded-2xl shadow-xl overflow-hidden p-6 max-w-full lg:max-w-xl xl:max-w-2xl mx-auto">
              
              {/* Product Preview Header (Image 1 style) */}
              <div className="flex justify-between items-center pb-4 border-b border-brand-border/60 mb-4">
                <div>
                  <span className="text-[10px] font-bold text-brand-orange/80 uppercase tracking-widest block font-mono">PRODUCT PREVIEW</span>
                  <span className="text-lg font-serif font-bold text-brand-charcoal">Data Mapping Certificate</span>
                </div>
                <button 
                  onClick={onStart}
                  className="bg-brand-orange text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-brand-orange-hover transition-colors shadow-sm"
                >
                  Generate
                </button>
              </div>

              {/* Mock Dashboard Wizard View inside Mockup */}
              <div className="grid grid-cols-12 gap-4 text-xs font-sans">
                {/* Mock Sidebar */}
                <div className="col-span-3 border-r border-brand-border/60 pr-3 hidden sm:block text-[11px]">
                  <div className="flex items-center gap-1.5 font-bold text-brand-charcoal mb-3">
                    <img 
                      src="/logo-eventsnap.png" 
                      alt="Logo" 
                      className="w-5 h-5 object-contain rounded-md" 
                      referrerPolicy="no-referrer"
                    />
                    <span>EventSnap</span>
                  </div>
                  <div className="space-y-2 text-brand-charcoal/60">
                    <div className="flex items-center space-x-1.5 p-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-charcoal/30"></span><span>Dashboard</span></div>
                    <div className="flex items-center space-x-1.5 p-1 bg-brand-orange/10 text-brand-orange font-semibold rounded-md"><span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span><span>Projects</span></div>
                    <div className="flex items-center space-x-1.5 p-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-charcoal/30"></span><span>Templates</span></div>
                    <div className="flex items-center space-x-1.5 p-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-charcoal/30"></span><span>Analytics</span></div>
                  </div>
                </div>

                {/* Mock Main content */}
                <div className="col-span-12 sm:col-span-9 pl-0 sm:pl-2 space-y-3">
                  <div className="flex justify-between items-center text-[10px] text-brand-charcoal/50 font-mono">
                    <span>Projects &rsaquo; Annual Summit '26 &rsaquo; Data Mapping</span>
                    <span className="text-brand-orange font-bold">4 Columns Detected</span>
                  </div>
                  
                  <div className="bg-brand-cream border border-brand-border/80 p-3 rounded-lg space-y-2">
                    <div className="font-serif font-bold text-brand-charcoal text-sm">Data Mapping</div>
                    <div className="text-[10px] text-brand-charcoal/60 leading-tight">
                      Match the required fields from your certificate template with the columns found in your uploaded data source.
                    </div>
                  </div>

                  {/* Left Required Fields & Right Mapping Dropdowns */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono font-bold text-brand-charcoal/50 uppercase block">Required Fields</span>
                      <div className="p-2 bg-white border border-brand-border/80 rounded-lg flex items-center justify-between shadow-sm">
                        <div>
                          <span className="font-semibold block text-[10px]">Nama Peserta</span>
                          <span className="text-[8px] text-brand-charcoal/40 font-mono block">Text &bull; Required</span>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-green-500 block"></span>
                      </div>
                      <div className="p-2 bg-white border border-brand-border/80 rounded-lg flex items-center justify-between shadow-sm">
                        <div>
                          <span className="font-semibold block text-[10px]">Nomor Sertifikat</span>
                          <span className="text-[8px] text-brand-charcoal/40 font-mono block">Alphanumeric &bull; Required</span>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-green-500 block"></span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] font-mono font-bold text-brand-charcoal/50 uppercase block">Source Columns</span>
                      <div className="p-2 bg-white border border-brand-orange/40 rounded-lg shadow-sm text-left">
                        <span className="font-medium text-[9px] block text-brand-orange">Nama Lengkap beserta Gelar</span>
                      </div>
                      <div className="p-2 bg-white border border-brand-border/80 rounded-lg shadow-sm text-left">
                        <span className="font-medium text-[9px] block text-brand-charcoal/60">Select column to map...</span>
                      </div>
                    </div>
                  </div>

                  {/* Preview box */}
                  <div className="bg-brand-cream border border-brand-border/60 p-2.5 rounded-lg">
                    <span className="text-[9px] font-bold font-mono text-brand-charcoal/40 block mb-1 uppercase">DATA PREVIEW (ROW 1)</span>
                    <div className="flex justify-between items-center text-[9px]">
                      <div>
                        <span className="text-brand-charcoal/40 block">Timestamp</span>
                        <span className="font-medium">2026-06-29 08:30:00</span>
                      </div>
                      <div className="text-right">
                        <span className="text-brand-orange block font-bold">Nama Lengkap peserta Gelar</span>
                        <span className="font-bold text-brand-charcoal text-[10px]">Dr. Budi Santoso, M.Kom</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button className="px-3 py-1.5 border border-brand-border text-brand-charcoal/60 hover:text-brand-charcoal rounded text-[10px]">Cancel</button>
                    <button onClick={onStart} className="px-3 py-1.5 bg-brand-orange text-white rounded text-[10px] font-semibold flex items-center space-x-1 hover:bg-brand-orange-hover">
                      <span>Save & Continue</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CARA KERJA SECTION (Image 2 reference) */}
      <section className="bg-white border-t border-b border-brand-border/80 py-20 md:py-28" id="cara-kerja-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-brand-orange uppercase tracking-widest font-mono block mb-3">
            CARA KERJA
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-charcoal leading-tight max-w-2xl mx-auto">
            3 langkah. Ratusan sertifikat. Tanpa ribet.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left">
            
            {/* Step 1 */}
            <div className="bg-brand-cream/40 border border-brand-border/60 p-8 rounded-2xl hover:shadow-lg transition-all space-y-6">
              <div className="w-10 h-10 rounded-xl bg-brand-orange flex items-center justify-center text-white font-bold font-serif text-base">
                1
              </div>
              <h3 className="text-xl font-bold text-brand-charcoal font-sans">
                Upload desain
              </h3>
              <p className="text-sm md:text-base text-brand-charcoal/70 leading-relaxed font-light">
                Drag & drop template sertifikat dari Canva, Figma, atau software desain favoritmu. Kami support PNG dan JPEG.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-brand-cream/40 border border-brand-border/60 p-8 rounded-2xl hover:shadow-lg transition-all space-y-6">
              <div className="w-10 h-10 rounded-xl bg-brand-orange flex items-center justify-center text-white font-bold font-serif text-base">
                2
              </div>
              <h3 className="text-xl font-bold text-brand-charcoal font-sans">
                Hubungkan data peserta
              </h3>
              <p className="text-sm md:text-base text-brand-charcoal/70 leading-relaxed font-light">
                Import file Excel atau CSV. EventSnap otomatis mendeteksi kolom dan memetakan ke field sertifikat.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-brand-cream/40 border border-brand-border/60 p-8 rounded-2xl hover:shadow-lg transition-all space-y-6">
              <div className="w-10 h-10 rounded-xl bg-brand-orange flex items-center justify-center text-white font-bold font-serif text-base">
                3
              </div>
              <h3 className="text-xl font-bold text-brand-charcoal font-sans">
                Generate & kirim
              </h3>
              <p className="text-sm md:text-base text-brand-charcoal/70 leading-relaxed font-light">
                Satu klik untuk generate ratusan sertifikat personal. Download sebagai ZIP atau kirim langsung via email.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FITUR SECTION (Image 3 reference) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28" id="fitur-section">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-4 space-y-6 text-left">
            <span className="text-xs font-bold text-brand-orange uppercase tracking-widest font-mono block">
              KENAPA EVENTSNAP
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-charcoal leading-tight">
              Berhenti kerja manual. Mulai otomatisasi.
            </h2>
            <p className="text-sm md:text-base text-brand-charcoal/70 leading-relaxed font-light">
              EventSnap menggantikan proses manual yang melelahkan &mdash; upload template, hubungkan data, generate. Sesimpel itu.
            </p>
            <div className="pt-2">
              <button 
                onClick={onStart}
                className="bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-md shadow-brand-orange/10 flex items-center space-x-2"
              >
                <span>Coba Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            
            {/* Feature 1 */}
            <div className="bg-white border border-brand-border/60 p-8 rounded-2xl hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="p-3 bg-brand-cream rounded-xl text-brand-orange w-fit">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="space-y-2 text-left">
                  <span className="text-xs font-bold text-brand-orange uppercase tracking-wider font-mono block">OTOMASI</span>
                  <h3 className="text-lg font-bold text-brand-charcoal font-sans">Ratusan dokumen, satu klik</h3>
                  <p className="text-sm text-brand-charcoal/70 leading-relaxed">
                    Tidak perlu lagi copy-paste nama peserta ke Canva satu per satu. Import data, klik generate, selesai.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-brand-border/60 p-8 rounded-2xl hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="p-3 bg-brand-cream rounded-xl text-brand-orange w-fit">
                  <Award className="w-6 h-6" />
                </div>
                <div className="space-y-2 text-left">
                  <span className="text-xs font-bold text-brand-orange uppercase tracking-wider font-mono block">AKURASI</span>
                  <h3 className="text-lg font-bold text-brand-charcoal font-sans">Preview sebelum kirim</h3>
                  <p className="text-sm text-brand-charcoal/70 leading-relaxed">
                    Cek hasil sertifikat per peserta sebelum generate massal. Typo dan salah data tertangkap sebelum terlanjur.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-brand-border/60 p-8 rounded-2xl hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="p-3 bg-brand-cream rounded-xl text-brand-orange w-fit">
                  <Users className="w-6 h-6" />
                </div>
                <div className="space-y-2 text-left">
                  <span className="text-xs font-bold text-brand-orange uppercase tracking-wider font-mono block">KOLABORASI</span>
                  <h3 className="text-lg font-bold text-brand-charcoal font-sans">Satu workspace untuk tim</h3>
                  <p className="text-sm text-brand-charcoal/70 leading-relaxed">
                    Kelola semua acara organisasi dari satu dashboard. Riwayat template dan data tersimpan rapi lintas kegiatan.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. PRICING SECTION (Image 4 reference) */}
      <section className="bg-white border-t border-brand-border/80 py-20 md:py-28" id="harga-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-brand-orange uppercase tracking-widest font-mono block mb-3">
            PRICING
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-charcoal leading-tight max-w-xl mx-auto">
            Mulai gratis. Upgrade kapan aja.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto text-left">
            
            {/* Free Plan */}
            <div className="bg-[#fbf9f6] border border-brand-border p-8 rounded-2xl flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono font-bold text-brand-orange uppercase block tracking-wider">Free</span>
                  <h3 className="text-4xl font-serif font-bold text-brand-charcoal mt-2">Rp0</h3>
                  <p className="text-xs text-brand-charcoal/60 mt-2">
                    Mulai generate sertifikat tanpa biaya. Cocok untuk acara kecil atau trial.
                  </p>
                </div>
                
                <ul className="space-y-3.5 pt-4 border-t border-brand-border text-xs text-brand-charcoal/80">
                  <li className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-brand-orange text-white flex items-center justify-center text-[8px] font-bold"><Check className="w-2.5 h-2.5" /></div>
                    <span>50 sertifikat per acara</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-brand-orange text-white flex items-center justify-center text-[8px] font-bold"><Check className="w-2.5 h-2.5" /></div>
                    <span>Watermark EventSnap</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-brand-orange text-white flex items-center justify-center text-[8px] font-bold"><Check className="w-2.5 h-2.5" /></div>
                    <span>1 template aktif</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button 
                  onClick={onStart}
                  className="w-full bg-brand-cream hover:bg-brand-border/40 text-brand-charcoal font-semibold text-sm py-3 rounded-xl transition-all border border-brand-border active:scale-98"
                >
                  Gunakan Sekarang
                </button>
              </div>
            </div>

            {/* Pro Plan (Highlighted Terracotta Border - Exact matching Image 4) */}
            <div className="bg-[#fbf9f6] border-2 border-brand-orange p-8 rounded-2xl flex flex-col justify-between relative shadow-lg shadow-brand-orange/5">
              <div className="absolute -top-3.5 right-6 bg-brand-orange text-white text-[9px] font-mono uppercase tracking-widest font-bold px-3 py-1 rounded-full">
                POPULER
              </div>
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono font-bold text-brand-orange uppercase block tracking-wider">Pro</span>
                  <h3 className="text-4xl font-serif font-bold text-brand-charcoal mt-2">Rp25.000</h3>
                  <p className="text-xs text-brand-charcoal/60 mt-2">
                    Untuk acara besar yang butuh hasil profesional tanpa batas.
                  </p>
                </div>
                
                <ul className="space-y-3.5 pt-4 border-t border-brand-border text-xs text-brand-charcoal/80">
                  <li className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-brand-orange text-white flex items-center justify-center text-[8px] font-bold"><Check className="w-2.5 h-2.5" /></div>
                    <span>Unlimited sertifikat</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-brand-orange text-white flex items-center justify-center text-[8px] font-bold"><Check className="w-2.5 h-2.5" /></div>
                    <span>Tanpa watermark</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-brand-orange text-white flex items-center justify-center text-[8px] font-bold"><Check className="w-2.5 h-2.5" /></div>
                    <span>Export PDF + ZIP</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-brand-orange text-white flex items-center justify-center text-[8px] font-bold"><Check className="w-2.5 h-2.5" /></div>
                    <span>Email delivery</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button 
                  onClick={onStart}
                  className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold text-sm py-3 rounded-xl transition-all shadow-md shadow-brand-orange/10 active:scale-98"
                >
                  Upgrade Ke Pro
                </button>
              </div>
            </div>

            {/* Organization Plan */}
            <div className="bg-[#fbf9f6] border border-brand-border p-8 rounded-2xl flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono font-bold text-brand-orange uppercase block tracking-wider">Organization</span>
                  <h3 className="text-4xl font-serif font-bold text-brand-charcoal mt-2">Rp99.000</h3>
                  <p className="text-xs text-brand-charcoal/60 mt-2">
                    Untuk organisasi yang rutin menyelenggarakan banyak kegiatan.
                  </p>
                </div>
                
                <ul className="space-y-3.5 pt-4 border-t border-brand-border text-xs text-brand-charcoal/80">
                  <li className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-brand-orange text-white flex items-center justify-center text-[8px] font-bold"><Check className="w-2.5 h-2.5" /></div>
                    <span>Semua fitur Pro</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-brand-orange text-white flex items-center justify-center text-[8px] font-bold"><Check className="w-2.5 h-2.5" /></div>
                    <span>Unlimited acara</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-brand-orange text-white flex items-center justify-center text-[8px] font-bold"><Check className="w-2.5 h-2.5" /></div>
                    <span>Template library</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-brand-orange text-white flex items-center justify-center text-[8px] font-bold"><Check className="w-2.5 h-2.5" /></div>
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button 
                  onClick={onStart}
                  className="w-full bg-brand-cream hover:bg-brand-border/40 text-brand-charcoal font-semibold text-sm py-3 rounded-xl transition-all border border-brand-border active:scale-98"
                >
                  Hubungi Penjualan
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
