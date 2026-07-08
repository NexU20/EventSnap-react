import React, { useState } from 'react';
import { Search, MapPin, Calendar as CalendarIcon, Clock, Filter, Award, ChevronRight, CheckCircle2, Ticket, Sparkles, Download, X, Eye } from 'lucide-react';
import { EventItem, CertificatePreset } from '../types';
import { SAMPLE_EVENTS, CERTIFICATE_PRESETS } from '../data';

interface PublicEventsProps {
  onOpenDashboard: () => void;
}

export default function PublicEvents({ onOpenDashboard }: PublicEventsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [events, setEvents] = useState<EventItem[]>(SAMPLE_EVENTS);
  
  // Registration and Claim Modal states
  const [registeringEvent, setRegisteringEvent] = useState<EventItem | null>(null);
  const [claimEvent, setClaimEvent] = useState<EventItem | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [claimedName, setClaimedName] = useState('');
  const [claimedInstansi, setClaimedInstansi] = useState('');
  const [isCertificateShowing, setIsCertificateShowing] = useState(false);

  // Form inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regInstansi, setRegInstansi] = useState('');

  // Categories
  const categories = ['Semua', 'Teknologi', 'Musik', 'Workshop', 'Seni'];

  // Filter events
  const filteredEvents = events.filter(evt => {
    const matchesSearch = evt.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          evt.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          evt.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || evt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) return;
    
    // Increment registered count
    if (registeringEvent) {
      setEvents(prev => prev.map(evt => {
        if (evt.id === registeringEvent.id) {
          return { ...evt, registeredCount: evt.registeredCount + 1 };
        }
        return evt;
      }));
    }
    setRegisterSuccess(true);
  };

  const closeRegModal = () => {
    setRegisteringEvent(null);
    setRegisterSuccess(false);
    setRegName('');
    setRegEmail('');
    setRegInstansi('');
  };

  const getPreset = (id: string): CertificatePreset => {
    return CERTIFICATE_PRESETS.find(p => p.id === id) || CERTIFICATE_PRESETS[0];
  };

  return (
    <div className="bg-brand-cream min-h-screen pb-20 font-sans">
      
      {/* HERO SECTION FOR EVENTS */}
      <section className="relative overflow-hidden bg-brand-charcoal text-white py-16 sm:py-24" id="events-hero-section">
        {/* Decorative Geometric Elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -left-20 -top-20 w-80 h-80 border-[30px] border-brand-orange rounded-full"></div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 border-[24px] border-brand-orange rounded-full"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold text-white bg-brand-orange border border-brand-orange/30 uppercase tracking-widest font-mono">
            Eksplorasi Kegiatan
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight max-w-3xl mx-auto leading-tight">
            Temukan Acara Terbaik & Klaim Sertifikat Instan
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-[#e6ded5]/80 max-w-2xl mx-auto font-light leading-relaxed">
            Cari berbagai acara teknologi, seni, musik, dan workshop. Selesaikan kegiatan & dapatkan sertifikat terverifikasi langsung dari EventSnap.
          </p>

          {/* Search bar (Big and centered) */}
          <div className="max-w-xl mx-auto pt-4" id="events-search-container">
            <div className="flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15">
              <div className="flex-1 flex items-center px-3 gap-2 text-white">
                <Search className="w-5 h-5 text-white/50 shrink-0" />
                <input
                  type="text"
                  placeholder="Cari acara berdasarkan nama atau lokasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent border-none text-white placeholder-white/50 text-sm focus:outline-none focus:ring-0 py-2.5"
                />
              </div>
              <button 
                className="bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold text-xs px-6 py-3 rounded-xl transition-all shadow-md shrink-0 uppercase tracking-wider font-mono"
              >
                Cari
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER CATEGORY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12" id="filter-chips-section">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-brand-border/80 pb-6">
          {/* Category Chips */}
          <div className="flex flex-wrap gap-2.5" id="category-filter-chips">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-orange text-white shadow-sm'
                    : 'bg-white border border-brand-border text-brand-charcoal/80 hover:bg-brand-cream hover:text-brand-charcoal'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-xs text-brand-charcoal/60 font-mono">
            Menampilkan <span className="font-bold text-brand-orange">{filteredEvents.length}</span> Acara Tersedia
          </div>
        </div>
      </section>

      {/* EVENTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-white border border-brand-border rounded-2xl p-8 max-w-md mx-auto">
            <span className="text-3xl block mb-3">🔍</span>
            <h3 className="text-lg font-bold text-brand-charcoal font-serif">Tidak ada acara ditemukan</h3>
            <p className="text-xs text-brand-charcoal/60 mt-1 leading-relaxed">
              Coba gunakan kata kunci pencarian yang berbeda atau pilih kategori filter yang lain.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="events-grid-layout">
            {filteredEvents.map((evt) => (
              <div 
                key={evt.id} 
                className="bg-white border border-brand-border rounded-2xl overflow-hidden hover:shadow-xl transition-all group flex flex-col justify-between"
                id={`event-card-${evt.id}`}
              >
                {/* Event Image Banner with status tag */}
                <div className="relative h-48 sm:h-52 bg-neutral-200 overflow-hidden shrink-0">
                  <img
                    referrerPolicy="no-referrer"
                    src={evt.image}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 flex gap-1.5">
                    {evt.status === 'finished' ? (
                      <span className="bg-green-600 text-white text-[9px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-full uppercase shadow-sm flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> SELESAI
                      </span>
                    ) : (
                      <span className="bg-brand-orange text-white text-[9px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-full uppercase shadow-sm">
                        MENDATANG
                      </span>
                    )}
                  </div>
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-[10px] font-mono font-bold px-3 py-1 rounded-full shadow-sm">
                    {evt.category}
                  </div>
                </div>

                {/* Event Content Details */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-[11px] text-brand-charcoal/50 font-mono">
                      <span>{evt.organizer}</span>
                      <span>&bull;</span>
                      <span>{evt.price}</span>
                    </div>

                    <h3 className="text-lg font-bold font-serif text-brand-charcoal leading-snug group-hover:text-brand-orange transition-colors line-clamp-2">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-brand-charcoal/70 line-clamp-2 font-light leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  {/* Metadata & Actions */}
                  <div className="space-y-4 pt-4 border-t border-brand-border/60">
                    <div className="space-y-2 text-xs text-brand-charcoal/80">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-brand-orange/70 shrink-0" />
                        <span className="truncate">{new Date(evt.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-brand-orange/70 shrink-0" />
                        <span>{evt.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-brand-orange/70 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    </div>

                    {/* Button Action depending on event status */}
                    <div className="pt-2">
                      {evt.status === 'finished' ? (
                        <button
                          onClick={() => {
                            setClaimEvent(evt);
                            setClaimedName('');
                            setClaimedInstansi('');
                            setIsCertificateShowing(false);
                          }}
                          className="w-full bg-brand-card border border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm uppercase tracking-wider font-mono"
                          id={`action-claim-${evt.id}`}
                        >
                          <Award className="w-4 h-4" />
                          <span>Klaim Sertifikat</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setRegisteringEvent(evt);
                            setRegisterSuccess(false);
                          }}
                          className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md shadow-brand-orange/10 uppercase tracking-wider font-mono"
                          id={`action-register-${evt.id}`}
                        >
                          <Ticket className="w-4 h-4" />
                          <span>Daftar Acara</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* REGISTRATION MODAL */}
      {registeringEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-brand-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-cream border border-brand-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6 relative animate-fade-in text-left">
            <button 
              onClick={closeRegModal}
              className="absolute top-4 right-4 text-brand-charcoal/50 hover:text-brand-charcoal p-1.5 rounded-full hover:bg-brand-border/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!registerSuccess ? (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono font-bold text-brand-orange uppercase tracking-wider block">RESERVASI TIKET</span>
                  <h3 className="text-xl font-bold font-serif text-brand-charcoal mt-1">Daftar Acara</h3>
                  <p className="text-xs text-brand-charcoal/60 mt-1">{registeringEvent.title}</p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-charcoal/80">Nama Lengkap (untuk Sertifikat)</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Dr. Budi Santoso, M.Kom"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full p-3 bg-white border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange"
                    />
                    <span className="text-[10px] text-brand-orange/70 block font-mono">Pastikan ejaan benar, nama ini akan dicetak pada sertifikat otomatis!</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-charcoal/80">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="nama@email.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full p-3 bg-white border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-charcoal/80">Asal Instansi (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Sekolah / Universitas / Kantor"
                      value={regInstansi}
                      onChange={(e) => setRegInstansi(e.target.value)}
                      className="w-full p-3 bg-white border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm py-3.5 rounded-xl transition-all mt-4 flex items-center justify-center space-x-2 shadow-lg shadow-brand-orange/10 uppercase tracking-wider font-mono"
                  >
                    <span>Konfirmasi Pendaftaran</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-bold text-brand-charcoal">Pendaftaran Sukses!</h3>
                  <p className="text-xs text-brand-charcoal/70 max-w-sm mx-auto leading-relaxed">
                    Terima kasih <strong className="text-brand-charcoal">{regName}</strong>, Anda telah terdaftar pada <strong>{registeringEvent.title}</strong>. Tiket digital & instruksi akses dikirim ke <strong>{regEmail}</strong>.
                  </p>
                </div>

                {/* Admission Ticket Mock */}
                <div className="bg-white border-2 border-dashed border-brand-border rounded-xl p-5 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-8 h-8 bg-brand-cream rounded-bl-full border-b border-l border-brand-border"></div>
                  <div className="space-y-3">
                    <span className="text-[9px] font-mono font-bold text-brand-orange border border-brand-orange/30 px-2 py-0.5 rounded-full">ADMISSION TICKET</span>
                    <h4 className="font-serif font-bold text-sm text-brand-charcoal line-clamp-1">{registeringEvent.title}</h4>
                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-brand-border/60">
                      <div>
                        <span className="text-brand-charcoal/50 block">PESERTA</span>
                        <span className="font-bold truncate block">{regName}</span>
                      </div>
                      <div>
                        <span className="text-brand-charcoal/50 block">KODE TIKET</span>
                        <span className="font-mono font-bold text-brand-orange uppercase">SNAP-{(Math.random()*10000).toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      closeRegModal();
                      // Redirect to claim preview simulation for fun!
                      setClaimEvent(registeringEvent);
                      setClaimedName(regName);
                      setClaimedInstansi(regInstansi || 'UIN Syarif Hidayatullah Jakarta');
                      setIsCertificateShowing(true);
                    }}
                    className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
                  >
                    <Award className="w-4 h-4" />
                    <span>Lihat Preview Sertifikat Anda</span>
                  </button>
                  <button
                    onClick={closeRegModal}
                    className="w-full text-brand-charcoal/60 hover:text-brand-charcoal text-xs font-semibold py-2"
                  >
                    Selesai & Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CLAIM CERTIFICATE MODAL */}
      {claimEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-brand-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`bg-brand-cream border border-brand-border rounded-2xl shadow-2xl w-full overflow-hidden p-6 relative animate-fade-in text-left transition-all ${isCertificateShowing ? 'max-w-4xl' : 'max-w-md'}`}>
            <button 
              onClick={() => setClaimEvent(null)}
              className="absolute top-4 right-4 text-brand-charcoal/50 hover:text-brand-charcoal p-1.5 rounded-full hover:bg-brand-border/40 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {!isCertificateShowing ? (
              <div className="space-y-6">
                <div className="text-center">
                  <Award className="w-12 h-12 text-brand-orange mx-auto mb-3" />
                  <span className="text-[10px] font-mono font-bold text-brand-orange uppercase tracking-wider block">SERTIFIKAT DIGITAL</span>
                  <h3 className="text-xl font-bold font-serif text-brand-charcoal mt-1">Klaim Sertifikat Anda</h3>
                  <p className="text-xs text-brand-charcoal/60 mt-1 max-w-xs mx-auto">Masukkan nama Anda untuk mencari & menjumpai sertifikat otomatis Anda.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-charcoal/80">Nama Peserta (Sesuai Pendaftaran)</label>
                    <input
                      type="text"
                      placeholder="E.g. Dr. Budi Santoso, M.Kom"
                      value={claimedName}
                      onChange={(e) => setClaimedName(e.target.value)}
                      className="w-full p-3 bg-white border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange"
                    />
                    <span className="text-[10px] text-brand-charcoal/50 block">Ketik "Dr. Budi Santoso, M.Kom" untuk mencobanya dengan data demo yang cocok!</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-charcoal/80">Asal Instansi</label>
                    <input
                      type="text"
                      placeholder="E.g. UIN Syarif Hidayatullah Jakarta"
                      value={claimedInstansi}
                      onChange={(e) => setClaimedInstansi(e.target.value)}
                      className="w-full p-3 bg-white border border-brand-border rounded-xl text-sm focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (!claimedName) return;
                      setIsCertificateShowing(true);
                    }}
                    className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 uppercase tracking-wider font-mono shadow-md"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Periksa & Rancang Sertifikat</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4">
                
                {/* Certificate Live Render */}
                <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-4">
                  <div className="w-full aspect-[4/3] bg-white rounded-xl border border-brand-border overflow-hidden p-6 relative flex flex-col justify-between shadow-lg max-w-lg mx-auto select-none" id="certificate-canvas-view">
                    
                    {/* Certificate Borders & Background decoration */}
                    <div className="absolute inset-2 border-2 border-brand-orange/40 rounded-lg pointer-events-none"></div>
                    <div className="absolute inset-3 border border-brand-orange/20 rounded pointer-events-none"></div>
                    
                    {/* Corner Ornaments */}
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-brand-orange/60"></div>
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-brand-orange/60"></div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-brand-orange/60"></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-brand-orange/60"></div>

                    {/* Logo Watermark Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none">
                      <div className="w-56 h-56 rounded-full border-4 border-brand-orange flex items-center justify-center text-brand-orange font-bold text-6xl">
                        ES
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-center mt-6 space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-brand-orange font-bold block">{claimEvent.organizer}</span>
                      <h4 className="text-xs uppercase tracking-widest text-brand-charcoal/50 font-sans block">Sertifikat Penghargaan</h4>
                    </div>

                    <div className="text-center my-2 space-y-2">
                      <span className="text-[10px] italic text-brand-charcoal/60 block font-serif">Diberikan dengan hormat kepada:</span>
                      
                      {/* Name of certificate claimant */}
                      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-orange tracking-wide">
                        {claimedName}
                      </h2>
                      
                      <div className="w-1/3 h-[1px] bg-brand-border mx-auto my-2"></div>
                      
                      <p className="text-[10px] sm:text-xs text-brand-charcoal/80 max-w-sm mx-auto leading-relaxed">
                        Atas partisipasi aktif sebagai peserta dalam agenda nasional <span className="font-semibold text-brand-charcoal">"{claimEvent.title}"</span> yang diselenggarakan pada {new Date(claimEvent.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })} di {claimEvent.location}.
                      </p>

                      {claimedInstansi && (
                        <p className="text-[9px] text-brand-charcoal/50 font-mono">
                          Delegasi dari: {claimedInstansi}
                        </p>
                      )}
                    </div>

                    {/* Signatures & Verification */}
                    <div className="flex justify-between items-end text-[8px] font-mono px-4 mb-2">
                      <div className="text-left">
                        <span className="block text-brand-charcoal/40 text-[7px]">ID SERTIFIKAT</span>
                        <span className="font-bold text-brand-charcoal">SNAP-E1-{(Math.random()*10000).toFixed(0)}</span>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-12 h-6 border-b border-brand-border mx-auto flex items-center justify-center">
                          <span className="text-[6px] text-brand-orange/80 italic font-serif">EventSnap</span>
                        </div>
                        <span className="block mt-1">Direktur EventSnap</span>
                      </div>
                    </div>

                  </div>
                  
                  <p className="text-[10px] text-brand-charcoal/50 text-center flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3 text-brand-orange" />
                    Rancangan sertifikat digital terverifikasi dan dilindungi enkripsi kriptografis.
                  </p>
                </div>

                {/* Right control panel */}
                <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-brand-orange uppercase block">PREVIEW SELESAI</span>
                      <h3 className="text-xl font-serif font-bold text-brand-charcoal">Sertifikat Siap!</h3>
                      <p className="text-xs text-brand-charcoal/60 mt-1">Selamat! Akun Anda terverifikasi sebagai peserta resmi dari acara {claimEvent.title}.</p>
                    </div>

                    <div className="bg-brand-card border border-brand-border/60 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-brand-charcoal/60">Nama di Sertifikat</span>
                        <span className="font-bold text-brand-charcoal">{claimedName}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-brand-charcoal/60">Instansi</span>
                        <span className="font-bold text-brand-charcoal truncate max-w-[150px]">{claimedInstansi || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-brand-charcoal/60">Penyelenggara</span>
                        <span className="font-bold text-brand-orange">{claimEvent.organizer}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          alert(`Sertifikat berhasil diunduh sebagai PDF dengan nama berkas: Sertifikat_${claimedName.replace(/\s+/g, '_')}.pdf!`);
                        }}
                        className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md shadow-brand-orange/15"
                      >
                        <Download className="w-4 h-4" />
                        <span>Unduh File PDF</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsCertificateShowing(false);
                        }}
                        className="w-full bg-white border border-brand-border text-brand-charcoal/70 hover:text-brand-charcoal font-bold text-xs py-3 rounded-xl transition-all text-center block"
                      >
                        Ubah Informasi Nama
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-brand-border/60 text-xs">
                    <span className="block text-brand-charcoal/50">Butuh otomatisasi seperti ini untuk acara Anda?</span>
                    <button 
                      onClick={() => {
                        setClaimEvent(null);
                        onOpenDashboard();
                      }}
                      className="text-brand-orange font-bold mt-1 inline-flex items-center hover:underline"
                    >
                      Buka Dashboard Panitia &rsaquo;
                    </button>
                  </div>

                </div>

              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
