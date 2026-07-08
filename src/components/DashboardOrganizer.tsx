import React, { useState } from 'react';
import { LayoutDashboard, Award, Settings, HelpCircle, User, LogOut, Search, Plus, Calendar, FileText, CheckCircle2, AlertCircle, BarChart3, TrendingUp, Layers, ChevronRight, Sparkles } from 'lucide-react';
import { ProjectItem, DashboardTab, ActiveTab } from '../types';
import { INITIAL_PROJECTS } from '../data';
import WizardCertificate from './WizardCertificate';
import { useCertificate } from '../context/CertificateContext';

// Mocking useRouter to satisfy direct next/navigation instruction in Vite SPA
const useRouter = () => {
  return {
    push: (path: string) => {
      console.log(`Navigating to ${path}`);
    }
  };
};

interface DashboardOrganizerProps {
  onBackToPublic: () => void;
  session?: any;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  onRefreshSession?: () => void;
}

export default function DashboardOrganizer({ onBackToPublic, session, onOpenAuth, onLogout, onRefreshSession }: DashboardOrganizerProps) {
  const { setSelectedFile, setCurrentStep } = useCertificate();
  const router = useRouter();

  if (!session) {
    return (
      <div className="bg-brand-cream min-h-screen flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-white border border-brand-border/60 p-10 rounded-2xl max-w-md w-full shadow-lg">
          <img 
            src="/logo-eventsnap.png" 
            alt="EventSnap Logo" 
            className="w-14 h-14 object-contain mx-auto mb-4 animate-bounce rounded-2xl"
            referrerPolicy="no-referrer"
          />
          <h2 className="text-2xl font-bold text-brand-charcoal tracking-tight mb-2">Workspace Panitia</h2>
          <p className="text-sm text-brand-charcoal/60 leading-relaxed mb-8">
            Silakan masuk atau daftarkan akun baru Anda terlebih dahulu untuk mulai mengelola project sertifikat, mengunggah data peserta, dan mengklaim kuota harian gratis Anda.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => onOpenAuth && onOpenAuth()}
              className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-brand-orange/15"
            >
              Masuk / Daftar Akun
            </button>
            <button
              onClick={onBackToPublic}
              className="w-full bg-white border border-brand-border text-brand-charcoal hover:bg-brand-cream/35 text-xs font-semibold py-3 rounded-xl transition-all"
            >
              Kembali ke Landing Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [activeSubTab, setActiveSubTab] = useState<DashboardTab>('overview');
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  
  // Wizard state integration
  const [isWizardActive, setIsWizardActive] = useState(false);
  const [wizardProject, setWizardProject] = useState<ProjectItem | null>(null);

  // Dashboard API Stats State
  const [dashboardStats, setDashboardStats] = useState<{ totalProjectAktif: number; totalParticipants: number } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Analytics API State
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Create Project Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newWorkspaceId, setNewWorkspaceId] = useState('hima-ti');
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);
  const [createProjectError, setCreateProjectError] = useState('');
  const [createProjectSuccess, setCreateProjectSuccess] = useState('');

  // Search filter
  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Totals calculations (Fallback local values if DB fetch isn't populated)
  const totalActiveProjects = projects.length;
  const totalDocuments = projects.reduce((acc, curr) => acc + curr.documentCount, 0);

  // Fetch Projects from GET /api/projects
  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const url = session ? `/api/projects?userId=${session.id}` : '/api/projects';
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProjects(json.data);
      }
    } catch (e) {
      console.error('Gagal mengambil daftar project dari API:', e);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Fetch Dashboard Stats from GET /api/dashboard
  const fetchDashboardStats = async () => {
    setIsLoadingStats(true);
    try {
      const url = session ? `/api/dashboard?userId=${session.id}` : '/api/dashboard';
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setDashboardStats({
          totalProjectAktif: json.data.totalProjectAktif,
          totalParticipants: json.data.totalParticipants,
        });
      }
    } catch (e) {
      console.error('Gagal mengambil statistik dashboard dari API:', e);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch Analytics Stats from GET /api/analytics
  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const url = session ? `/api/analytics?userId=${session.id}` : '/api/analytics';
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setAnalyticsData(json.data);
      }
    } catch (e) {
      console.error('Gagal mengambil data analitik dari API:', e);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  React.useEffect(() => {
    fetchDashboardStats();
    fetchProjects();
    fetchAnalytics();
  }, [session]);

  // Handle saving new or edited projects from the wizard
  const handleSaveProject = (savedProject: ProjectItem) => {
    // Refresh both data list and stats aggregates from the backend
    fetchProjects();
    fetchDashboardStats();
    fetchAnalytics();
    if (onRefreshSession) {
      onRefreshSession();
    }
    setIsWizardActive(false);
    setWizardProject(null);
  };

  const handleOpenCreateModal = () => {
    setNewProjectName('');
    setNewWorkspaceId('hima-ti');
    setCreateProjectError('');
    setCreateProjectSuccess('');
    setIsCreateModalOpen(true);
  };

  const handleUseTemplate = (tplTitle: string, styleName: string) => {
    // a. setSelectedFile ke dalam Context
    setSelectedFile(styleName);
    
    // b. setCurrentStep ke 2 (Langkah Data Peserta)
    setCurrentStep(2);
    
    // c. router.push (sesuai instruksi router Next.js)
    router.push('/path-ke-halaman-generator');

    // Agar integrasi SPA fungsional di preview, aktifkan wizard dengan model project draft baru
    const customProject: ProjectItem = {
      id: `p-${Date.now()}`,
      title: tplTitle,
      type: 'Sertifikat Digital',
      status: 'Draft',
      documentCount: 0,
      dateString: 'Baru dibuat',
      templateId: styleName,
      spreadsheetData: [],
      mapping: {
        nama: 'Pilih kolom...',
        email: 'Pilih kolom...',
        nomorSertifikat: 'Pilih kolom...',
        asalInstansi: 'Pilih kolom...',
        tanggalKegiatan: 'Pilih kolom...',
      },
    };
    
    setWizardProject(customProject);
    setIsWizardActive(true);
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      setCreateProjectError('Nama project tidak boleh kosong');
      return;
    }
    if (!newWorkspaceId.trim()) {
      setCreateProjectError('Workspace ID wajib diisi');
      return;
    }

    setIsSubmittingProject(true);
    setCreateProjectError('');
    setCreateProjectSuccess('');

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: newProjectName,
          workspaceId: newWorkspaceId,
          userId: session?.id || null,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setCreateProjectSuccess('Suksess! Project baru berhasil disimpan ke database Prisma.');
        
        // Refetch everything from DB to ensure single source of truth
        fetchProjects();
        fetchDashboardStats();
        fetchAnalytics();

        // Close modal and edit newly created project
        const newProjectItem: ProjectItem = {
          id: json.data.id || `p-${Date.now()}`,
          title: json.data.projectName,
          type: 'Sertifikat Digital',
          status: 'Draft',
          documentCount: 0,
          dateString: 'Baru dibuat',
          templateId: 'preset-elegant',
          spreadsheetData: [],
          mapping: {
            nama: 'Pilih kolom...',
            email: 'Pilih kolom...',
            nomorSertifikat: 'Pilih kolom...',
            asalInstansi: 'Pilih kolom...',
            tanggalKegiatan: 'Pilih kolom...',
          },
        };

        setTimeout(() => {
          setIsCreateModalOpen(false);
          handleEditProject(newProjectItem);
        }, 1200);
      } else {
        setCreateProjectError(json.message || 'Gagal menyimpan project.');
      }
    } catch (err) {
      console.error('Error creating project:', err);
      setCreateProjectError('Gagal menghubungi server.');
    } finally {
      setIsSubmittingProject(false);
    }
  };

  const handleCreateNewProject = () => {
    setWizardProject(null); // Fresh project
    setIsWizardActive(true);
  };

  const handleEditProject = (project: ProjectItem) => {
    setWizardProject(project);
    setIsWizardActive(true);
  };

  return (
    <div className="bg-brand-cream min-h-screen flex font-sans text-brand-charcoal">
      
      {/* 1. SIDEBAR (Image 5 & 6 exact visual style) */}
      <aside className="w-64 bg-brand-card border-r border-brand-border shrink-0 flex flex-col justify-between p-6 hidden md:flex text-left">
        <div className="space-y-8">
          
          {/* Sidebar Logo */}
          <div onClick={onBackToPublic} className="flex items-center gap-2 cursor-pointer group" id="sidebar-logo">
            <img 
              src="/logo-eventsnap.png" 
              alt="EventSnap Logo" 
              className="w-8 h-8 object-contain rounded-lg transition-transform group-hover:scale-105" 
              referrerPolicy="no-referrer"
            />
            <span className="text-lg font-bold text-brand-charcoal tracking-tight leading-tight">
              EventSnap
            </span>
          </div>

          {/* New Certificate CTA Button */}
          <button
            onClick={handleOpenCreateModal}
            className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold text-sm py-3.5 px-4 rounded-xl transition-all shadow-md shadow-brand-orange/15 flex items-center justify-center space-x-2 active:scale-98"
            id="sidebar-new-cert-btn"
          >
            <Plus className="w-4 h-4" />
            <span>New Certificate</span>
          </button>

          {/* Nav list */}
          <nav className="space-y-2 text-sm font-medium text-brand-charcoal/70" id="sidebar-menu">
            {[
              { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'projects', label: 'Projects', icon: Layers },
              { id: 'templates', label: 'Templates', icon: Award },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((menu) => {
              const Icon = menu.icon;
              const isActive = activeSubTab === menu.id;
              return (
                <button
                  key={menu.id}
                  disabled={isWizardActive}
                  onClick={() => setActiveSubTab(menu.id as DashboardTab)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive && !isWizardActive
                      ? 'bg-brand-orange/10 text-brand-orange font-bold border-l-4 border-brand-orange'
                      : 'hover:bg-brand-cream/50 disabled:opacity-40'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive && !isWizardActive ? 'text-brand-orange' : 'text-brand-charcoal/60'}`} />
                  <span>{menu.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Details (Active Package state matching mockup) */}
        <div className="space-y-4 pt-6 border-t border-brand-border/60" id="sidebar-active-plan">
          <div className="bg-brand-cream/50 p-4 rounded-xl border border-brand-border/40">
            <span className="text-[9px] font-mono font-bold text-brand-charcoal/40 uppercase block">PAKET AKTIF</span>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs font-bold text-brand-charcoal">Freemium</span>
              <span className="text-[10px] font-mono font-bold text-brand-orange">{session?.dailyQuota ?? 50}/50 dokumen</span>
            </div>
            {/* simple micro progress bar */}
            <div className="w-full bg-brand-border h-1.5 rounded-full overflow-hidden mt-2 p-0.5">
              <div className="bg-brand-orange h-full rounded-full" style={{ width: `${((session?.dailyQuota ?? 50) / 50) * 100}%` }}></div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-brand-charcoal/50">
            <button onClick={onBackToPublic} className="flex items-center space-x-2 hover:text-brand-charcoal">
              <LogOut className="w-4 h-4" />
              <span>Landing Page</span>
            </button>
            <span className="text-[10px] font-mono">v1.2</span>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTENT */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8">
        
        {/* If the Wizard is actively compiling or writing, bypass other tabs */}
        {isWizardActive ? (
          <WizardCertificate
            initialProject={wizardProject}
            onCancel={() => {
              setIsWizardActive(false);
              setWizardProject(null);
            }}
            onSaveProject={handleSaveProject}
          />
        ) : (
          <div className="space-y-8 text-left">
            
            {/* WORKSPACE HEADER (Image 5 & 6 upper section) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border pb-6">
              <div>
                <span className="text-xs font-mono font-bold text-brand-charcoal/40 uppercase tracking-widest block">
                  WORKSPACE ORGANISASI
                </span>
                <h2 className="text-xl font-bold text-brand-charcoal leading-tight mt-1">
                  HIMA Teknik Informatika
                </h2>
              </div>

              {/* Header Search Bar and Quick Actions */}
              <div className="flex items-center gap-3">
                <div className="relative bg-white border border-brand-border rounded-xl px-3 py-2 flex items-center space-x-2 w-64 shadow-sm focus-within:border-brand-orange/50 transition-colors">
                  <Search className="w-4 h-4 text-brand-charcoal/40" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none text-xs text-brand-charcoal placeholder-brand-charcoal/40 focus:outline-none w-full"
                  />
                </div>
                <button
                  onClick={handleCreateNewProject}
                  className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md shadow-brand-orange/15"
                >
                  Generate
                </button>
              </div>
            </div>

            {/* A. OVERVIEW SUB-TAB (Image 5 Reference) */}
            {activeSubTab === 'overview' && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Intro Card Hero (Image 5 left) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Dashboard Banner */}
                  <div className="lg:col-span-8 bg-gradient-to-r from-blue-700 to-indigo-800 text-white border-none rounded-2xl p-8 flex flex-col justify-between space-y-6 shadow-sm relative overflow-hidden">
                    {/* Watermark Logo */}
                    <img 
                      src="/logo-eventsnap.png" 
                      alt="Watermark Logo" 
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-48 opacity-20 pointer-events-none object-contain" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-3 relative z-10 text-left">
                      <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider block">DASHBOARD</span>
                      <h1 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight">
                        Kelola sertifikat dari satu workspace.
                      </h1>
                      <p className="text-sm text-blue-50 leading-relaxed font-light max-w-xl">
                        Pantau project, status data mapping, dan jumlah dokumen yang siap dibuat tanpa keluar dari workflow panitia.
                      </p>
                    </div>

                    <div className="flex gap-4 relative z-10">
                      <button
                        onClick={handleOpenCreateModal}
                        className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-6 py-3.5 rounded-xl transition-all shadow-sm"
                      >
                        + Buat Project Baru
                      </button>
                      <button
                        onClick={() => setActiveSubTab('projects')}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold px-6 py-3.5 rounded-xl transition-all"
                      >
                        Lihat Semua Project
                      </button>
                    </div>
                  </div>

                  {/* Right Stats Stack (Image 5 right) */}
                  <div className="lg:col-span-4 grid grid-cols-1 gap-4">
                    
                    <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm text-left">
                      <span className="text-[10px] font-mono font-bold text-brand-charcoal/40 uppercase block">PROJECT AKTIF</span>
                      <span className="text-4xl font-serif font-bold text-brand-orange mt-2 block">
                        {isLoadingStats ? '...' : (dashboardStats !== null ? dashboardStats.totalProjectAktif : totalActiveProjects)}
                      </span>
                      <span className="text-[11px] text-brand-charcoal/50 mt-1 block">Acara terdaftar aktif</span>
                    </div>

                    <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm text-left">
                      <span className="text-[10px] font-mono font-bold text-brand-charcoal/40 uppercase block">DOKUMEN TERSIMPAN</span>
                      <span className="text-4xl font-serif font-bold text-brand-orange mt-2 block">
                        {isLoadingStats ? '...' : (dashboardStats !== null ? dashboardStats.totalParticipants : totalDocuments)}
                      </span>
                      <span className="text-[11px] text-brand-charcoal/50 mt-1 block">Sertifikat berhasil digenerate</span>
                    </div>

                    <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm text-left">
                      <span className="text-[10px] font-mono font-bold text-brand-charcoal/40 uppercase block">KUOTA FREEMIUM</span>
                      <span className="text-4xl font-serif font-bold text-brand-orange mt-2 block">
                        {session?.dailyQuota ?? 50}/50
                      </span>
                      <span className="text-[11px] text-brand-charcoal/50 mt-1 block">Sertifikat harian tersisa hari ini</span>
                    </div>

                  </div>
                </div>

                {/* Recent Projects Table (Image 5 lower section) */}
                <div className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-6 py-5 border-b border-brand-border bg-brand-cream/40 flex justify-between items-center">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wider font-mono">Recent Projects</h3>
                      <p className="text-xs text-brand-charcoal/50 font-sans">Pilih project untuk lanjut mapping atau generate dokumen.</p>
                    </div>
                    
                    <button 
                      onClick={handleOpenCreateModal}
                      className="text-xs font-bold text-brand-orange hover:underline inline-flex items-center gap-1 border border-brand-border bg-white px-3 py-2 rounded-lg hover:bg-brand-cream/20"
                    >
                      <span>Buat Project</span>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-brand-cream/50 border-b border-brand-border text-brand-charcoal/60 font-bold uppercase text-[9px] tracking-wider">
                        <tr>
                          <th className="px-6 py-4">PROJECT</th>
                          <th className="px-6 py-4">JENIS ACARA</th>
                          <th className="px-6 py-4">STATUS</th>
                          <th className="px-6 py-4">JUMLAH DOKUMEN</th>
                          <th className="px-6 py-4 text-right">AKSI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/60">
                        {isLoadingProjects ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-brand-charcoal/50 font-mono">
                              Memuat data project...
                            </td>
                          </tr>
                        ) : filteredProjects.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-brand-charcoal/50 font-mono">
                              Belum ada project yang dibuat
                            </td>
                          </tr>
                        ) : (
                          filteredProjects.slice(0, 3).map((proj) => (
                            <tr key={proj.id} className="hover:bg-brand-cream/10 transition-colors">
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src="/logo-eventsnap.png" 
                                    alt="Project Logo" 
                                    className="w-10 h-10 object-contain bg-white rounded-md p-1 border border-brand-border/40 shrink-0" 
                                    referrerPolicy="no-referrer"
                                  />
                                  <div>
                                    <span className="font-bold text-brand-charcoal text-sm block">{proj.title}</span>
                                    <span className="text-[10px] text-brand-charcoal/40 font-mono mt-0.5 block">{proj.dateString}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-brand-charcoal/70 font-medium">
                                {proj.type}
                              </td>
                              <td className="px-6 py-5">
                                {proj.status === 'Ready' && (
                                  <span className="bg-brand-orange/15 border border-brand-orange/30 text-brand-orange text-[9px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                                    {proj.status}
                                  </span>
                                )}
                                {proj.status === 'Draft' && (
                                  <span className="bg-amber-100 border border-amber-200 text-amber-700 text-[9px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                                    {proj.status}
                                  </span>
                                )}
                                {proj.status === 'Generated' && (
                                  <span className="bg-green-100 border border-green-200 text-green-700 text-[9px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                                    {proj.status}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-5 text-brand-charcoal/80 font-mono font-semibold">
                                {proj.documentCount} dokumen
                              </td>
                              <td className="px-6 py-5 text-right">
                                <button
                                  onClick={() => handleEditProject(proj)}
                                  className="bg-brand-orange/10 text-brand-orange hover:bg-brand-orange hover:text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                                >
                                  Buka
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* B. ALL PROJECTS SUB-TAB (Image 6 Reference) */}
            {activeSubTab === 'projects' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <span className="text-[10px] font-mono font-bold text-brand-charcoal/40 uppercase tracking-widest block">SEMUA PROJECT</span>
                  <h1 className="text-3xl font-serif font-bold text-brand-charcoal mt-1">Project Sertifikat</h1>
                  <p className="text-xs text-brand-charcoal/60 mt-1">Kelola semua project sertifikat dan dokumen kepanitiaan.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="projects-grid-layout">
                  {isLoadingProjects ? (
                    <div className="col-span-full bg-white border border-brand-border p-10 rounded-2xl text-center">
                      <span className="text-brand-charcoal/50 font-mono text-sm">Memuat data project...</span>
                    </div>
                  ) : filteredProjects.length === 0 ? (
                    <div className="col-span-full bg-white border border-brand-border border-dashed p-10 rounded-2xl text-center space-y-2">
                      <h4 className="text-sm font-bold text-brand-charcoal">Belum ada project yang dibuat</h4>
                      <p className="text-xs text-brand-charcoal/50">Mulai buat sertifikat digital dengan menekan tombol "+ Buat Project Baru".</p>
                    </div>
                  ) : (
                    filteredProjects.map((proj) => (
                      <div 
                        key={proj.id} 
                        className="bg-white border border-brand-border p-6 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all text-left"
                      >
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <img 
                              src="/logo-eventsnap.png" 
                              alt="Project Logo" 
                              className="w-10 h-10 object-contain bg-white rounded-md p-1 border border-brand-border/40 shrink-0" 
                              referrerPolicy="no-referrer"
                            />
                            
                            {proj.status === 'Ready' && (
                              <span className="bg-brand-orange/15 border border-brand-orange/20 text-brand-orange text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                                {proj.status}
                              </span>
                            )}
                            {proj.status === 'Draft' && (
                              <span className="bg-amber-100 border border-amber-200 text-amber-700 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                                {proj.status}
                              </span>
                            )}
                            {proj.status === 'Generated' && (
                              <span className="bg-green-100 border border-green-200 text-green-700 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                                {proj.status}
                              </span>
                            )}
                          </div>

                          <div>
                            <h3 className="font-serif font-bold text-base text-brand-charcoal">{proj.title}</h3>
                            <span className="text-xs text-brand-charcoal/50 mt-1 block">{proj.type}</span>
                          </div>
                        </div>

                        <div className="border-t border-brand-border/60 mt-6 pt-4 flex justify-between items-center text-xs font-mono">
                          <div>
                            <span className="block text-brand-charcoal/40 text-[9px] uppercase">DOKUMEN</span>
                            <span className="font-bold text-brand-charcoal">{proj.documentCount}</span>
                          </div>
                          <button
                            onClick={() => handleEditProject(proj)}
                            className="text-brand-orange font-bold flex items-center gap-1 hover:underline"
                          >
                            <span>Buka Project</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Dotted empty card "+ Buat Project Baru" (Image 6 reference) */}
                  <button
                    onClick={handleOpenCreateModal}
                    className="border-2 border-dashed border-brand-border hover:border-brand-orange/60 rounded-2xl p-8 flex flex-col items-center justify-center space-y-3 transition-colors bg-brand-cream/40 hover:bg-white text-center min-h-[180px] cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-cream text-brand-orange flex items-center justify-center shadow-sm">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-brand-charcoal">Buat Project Baru</h4>
                      <p className="text-[11px] text-brand-charcoal/50 mt-0.5 leading-relaxed">Mulai wizard data-mapping sertifikat baru</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* C. TEMPLATES SUB-TAB */}
            {activeSubTab === 'templates' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <span className="text-[10px] font-mono font-bold text-brand-charcoal/40 uppercase block tracking-widest">LIBRARY DESAIN</span>
                  <h1 className="text-3xl font-serif font-bold text-brand-charcoal mt-1">Template Sertifikat</h1>
                  <p className="text-xs text-brand-charcoal/60 mt-1">Pilih atau kustomisasi template sertifikat resmi organisasi Anda dengan visual realistis cetak.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Sertifikat Pelatihan Kementerian",
                      theme: "Formal, Navy & Emas",
                      desc: "Desain super formal dan prestisius dengan ornamen khas kenegaraan. Sangat pas untuk program kementerian, diklat ASN, dan pelatihan nasional resmi.",
                      presetId: "preset-elegant",
                      badge: "Kementerian",
                      style: "navy-gold"
                    },
                    {
                      title: "Bimtek & Workshop Instansi",
                      theme: "Profesional, Putih & Hijau Tua",
                      desc: "Tampilan bersih bernuansa korporat dengan aksen hijau botol yang elegan. Cocok untuk bimbingan teknis, workshop instansi swasta, dan sertifikasi keahlian.",
                      presetId: "preset-classic",
                      badge: "Instansi",
                      style: "white-green"
                    },
                    {
                      title: "Seminar Nasional IT",
                      theme: "Modern, Biru & Putih",
                      desc: "Desain minimalis berestetika modern dengan sentuhan siber futuristik. Sempurna untuk seminar nasional teknologi, simposium sains, dan webinar tech.",
                      presetId: "preset-minimal",
                      badge: "Tech & IT",
                      style: "blue-white"
                    },
                    {
                      title: "Piagam Kepanitiaan BEM",
                      theme: "Akademik, Merah Maroon",
                      desc: "Desain sertifikat akademik berwibawa dengan paduan garis tegas berwarna merah maroon. Sesuai untuk piagam apresiasi panitia BEM, Himpunan, dan organisasi kampus.",
                      presetId: "preset-classic",
                      badge: "Akademik",
                      style: "maroon-stone"
                    },
                    {
                      title: "Tech Bootcamp Graduation",
                      theme: "Dark Mode, Hitam & Emas",
                      desc: "Gaya ultra-modern premium berbasis latar belakang gelap berkilau emas. Sangat menonjol untuk kelulusan bootcamp intensif pemrograman atau data science.",
                      presetId: "preset-elegant",
                      badge: "Bootcamp",
                      style: "black-gold"
                    },
                    {
                      title: "Penghargaan Relawan Terbaik",
                      theme: "Elegan, Krem & Coklat",
                      desc: "Sentuhan warna hangat yang bersahabat namun berkelas. Ideal untuk penghargaan aksi sosial, piagam kerelawanan komunitas, dan apresiasi kemanusiaan.",
                      presetId: "preset-minimal",
                      badge: "Komunitas",
                      style: "cream-brown"
                    }
                  ].map((tpl, i) => (
                    <div 
                      key={i} 
                      className="bg-white border border-brand-border rounded-2xl p-5 flex flex-col justify-between hover:scale-[1.03] hover:shadow-xl hover:border-brand-orange/40 transition-all duration-300 text-left group"
                    >
                      <div className="space-y-4">
                        {/* Certificate Realistis Thumbnail (Pure HTML/CSS) */}
                        <div className="relative aspect-[1.414/1] w-full rounded-xl overflow-hidden border border-brand-charcoal/10 bg-brand-cream/30">
                          {tpl.style === 'navy-gold' && (
                            <div className="relative w-full h-full bg-slate-900 text-white flex flex-col items-center justify-center text-center p-2.5 select-none">
                              {/* Borders */}
                              <div className="absolute inset-1 border border-amber-500/30 rounded-md pointer-events-none"></div>
                              <div className="absolute inset-1.5 border-2 border-amber-500/60 rounded-sm pointer-events-none"></div>
                              {/* Content wrapper with simple flex columns */}
                              <div className="relative z-10 flex flex-col items-center justify-center space-y-0.5 w-full h-full">
                                <div className="text-[5px] uppercase tracking-wider font-semibold text-amber-400">SERTIFIKAT PELATIHAN</div>
                                <div className="w-8 h-[0.5px] bg-amber-500/50 my-0.5"></div>
                                <div className="text-[3px] text-slate-300 uppercase tracking-widest">Diberikan Kepada</div>
                                <div className="text-[8px] font-serif font-bold italic text-white my-0.5 leading-none">Ahmad Fauzi, S.Kom.</div>
                                <div className="text-[3px] text-slate-400 max-w-[90%] leading-tight">Atas partisipasi aktif sebagai peserta program pelatihan nasional resmi</div>
                                <div className="w-12 h-[0.5px] bg-slate-700 my-0.5"></div>
                                <div className="flex items-center justify-between w-full px-4 text-[3px] text-slate-400 mt-1">
                                  <span>Kementerian RI</span>
                                  <div className="w-3.5 h-3.5 rounded-full border border-amber-500/40 bg-amber-500/10 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full border border-dashed border-amber-500/50"></div>
                                  </div>
                                  <span>Direktur Utama</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {tpl.style === 'white-green' && (
                            <div className="relative w-full h-full bg-stone-50 text-stone-800 flex flex-col items-center justify-center text-center p-2.5 select-none">
                              {/* Borders */}
                              <div className="absolute inset-1 border border-emerald-800/20 rounded-md pointer-events-none"></div>
                              <div className="absolute inset-1.5 border-2 border-emerald-800/40 rounded-sm pointer-events-none"></div>
                              {/* Content wrapper */}
                              <div className="relative z-10 flex flex-col items-center justify-center space-y-0.5 w-full h-full">
                                <div className="text-[5px] uppercase tracking-wider font-extrabold text-emerald-800">PIAGAM BIMTEK & WORKSHOP</div>
                                <div className="w-8 h-[0.5px] bg-emerald-800/30 my-0.5"></div>
                                <div className="text-[3px] text-stone-500 uppercase tracking-widest">Atas kelulusan dan partisipasi terhadap</div>
                                <div className="text-[8px] font-serif font-bold text-stone-950 my-0.5 leading-none">Dr. Rian Hermawan</div>
                                <div className="text-[3px] text-stone-600 max-w-[90%] leading-tight">Telah menyelesaikan bimbingan teknis kompetensi profesional instansi</div>
                                <div className="w-12 h-[0.5px] bg-stone-300 my-0.5"></div>
                                <div className="flex items-center justify-between w-full px-4 text-[3px] text-stone-500 mt-1">
                                  <span>Kepala Balai</span>
                                  <div className="w-3.5 h-3.5 rounded-full border border-emerald-800/30 bg-emerald-800/5 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full border border-dashed border-emerald-800/40"></div>
                                  </div>
                                  <span>Penyelenggara</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {tpl.style === 'blue-white' && (
                            <div className="relative w-full h-full bg-white text-slate-800 flex flex-col items-center justify-center text-center p-2.5 select-none">
                              {/* Borders & Tech Corners */}
                              <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t border-l border-blue-600 pointer-events-none"></div>
                              <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b border-l border-blue-600 pointer-events-none"></div>
                              <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r border-blue-600 pointer-events-none"></div>
                              <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b border-r border-blue-600 pointer-events-none"></div>
                              <div className="absolute inset-1 border border-blue-600/10 rounded pointer-events-none"></div>
                              {/* Content wrapper */}
                              <div className="relative z-10 flex flex-col items-center justify-center space-y-0.5 w-full h-full">
                                <div className="text-[5px] uppercase tracking-widest font-black text-blue-600">SEMINAR TEKNOLOGI NASIONAL</div>
                                <div className="w-8 h-[0.5px] bg-blue-600/20 my-0.5"></div>
                                <div className="text-[3px] text-slate-400 uppercase tracking-wider">This certificate is presented to</div>
                                <div className="text-[8px] font-sans font-black text-slate-900 my-0.5 leading-none">Naufal Abyan, B.Sc.</div>
                                <div className="text-[3px] text-slate-500 max-w-[90%] leading-tight">In recognition of active participation in the annual national IT summit</div>
                                <div className="w-12 h-[0.5px] bg-slate-100 my-0.5"></div>
                                <div className="flex items-center justify-between w-full px-4 text-[3px] text-slate-400 mt-1">
                                  <span>Narasumber IT</span>
                                  <div className="w-3.5 h-3.5 rounded-full border border-blue-600/20 bg-blue-600/5 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600/20"></div>
                                  </div>
                                  <span>Ketua Pelaksana</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {tpl.style === 'maroon-stone' && (
                            <div className="relative w-full h-full bg-stone-50 text-red-950 flex flex-col items-center justify-center text-center p-2.5 select-none">
                              {/* Borders */}
                              <div className="absolute inset-1 border border-red-900/10 rounded-md pointer-events-none"></div>
                              <div className="absolute inset-1.5 border-2 border-red-900/35 rounded-sm pointer-events-none"></div>
                              <div className="absolute inset-2 border border-red-900/15 pointer-events-none"></div>
                              {/* Content wrapper */}
                              <div className="relative z-10 flex flex-col items-center justify-center space-y-0.5 w-full h-full">
                                <div className="text-[5px] uppercase tracking-wider font-extrabold text-red-900">PIAGAM KEPANITIAAN BEM</div>
                                <div className="w-8 h-[0.5px] bg-red-900/30 my-0.5"></div>
                                <div className="text-[3px] text-stone-500 uppercase tracking-wider">Diberikan dengan hormat kepada</div>
                                <div className="text-[8px] font-serif font-bold italic text-stone-900 my-0.5 leading-none">Sarah Angelica, S.Kom.</div>
                                <div className="text-[3px] text-stone-600 max-w-[90%] leading-tight">Atas pengabdian luar biasa dalam kepanitiaan organisasi mahasiswa</div>
                                <div className="w-12 h-[0.5px] bg-stone-300 my-0.5"></div>
                                <div className="flex items-center justify-between w-full px-4 text-[3px] text-stone-500 mt-1">
                                  <span>Gubernur BEM</span>
                                  <div className="w-3.5 h-3.5 rounded-full border border-red-900/25 bg-red-900/5 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full border border-dashed border-red-900/30"></div>
                                  </div>
                                  <span>Ketua Pelaksana</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {tpl.style === 'black-gold' && (
                            <div className="relative w-full h-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center text-center p-2.5 select-none">
                              {/* Borders */}
                              <div className="absolute inset-1 border border-amber-500/15 rounded-md pointer-events-none"></div>
                              <div className="absolute inset-1.5 border-2 border-amber-500/40 rounded-sm pointer-events-none"></div>
                              {/* Content wrapper */}
                              <div className="relative z-10 flex flex-col items-center justify-center space-y-0.5 w-full h-full">
                                <div className="text-[5px] uppercase tracking-widest font-bold text-amber-500">BOOTCAMP GRADUATION DIPLOMA</div>
                                <div className="w-8 h-[0.5px] bg-amber-500/30 my-0.5"></div>
                                <div className="text-[3px] text-zinc-400 uppercase tracking-widest">This is proudly declared that</div>
                                <div className="text-[8px] font-mono font-bold tracking-wider text-white my-0.5 leading-none">REZA ADITYA, M.T.</div>
                                <div className="text-[3px] text-zinc-400 max-w-[90%] leading-tight">Successfully completed intensive fullstack software engineering program</div>
                                <div className="w-12 h-[0.5px] bg-zinc-850 my-0.5"></div>
                                <div className="flex items-center justify-between w-full px-4 text-[3px] text-zinc-400 mt-1">
                                  <span>Lead Instructor</span>
                                  <div className="w-3.5 h-3.5 rounded-full border border-amber-500/30 bg-amber-500/10 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full border border-dashed border-amber-500/40"></div>
                                  </div>
                                  <span>CTO Penyelenggara</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {tpl.style === 'cream-brown' && (
                            <div className="relative w-full h-full bg-[#FAF6EE] text-amber-950 flex flex-col items-center justify-center text-center p-2.5 select-none">
                              {/* Borders */}
                              <div className="absolute inset-1 border border-amber-900/10 rounded-md pointer-events-none"></div>
                              <div className="absolute inset-1.5 border-2 border-amber-900/25 rounded-sm pointer-events-none"></div>
                              {/* Content wrapper */}
                              <div className="relative z-10 flex flex-col items-center justify-center space-y-0.5 w-full h-full">
                                <div className="text-[5px] uppercase tracking-wider font-extrabold text-amber-900">PIAGAM PENGHARGAAN RELAWAN</div>
                                <div className="w-8 h-[0.5px] bg-amber-900/15 my-0.5"></div>
                                <div className="text-[3px] text-amber-900/60 uppercase tracking-widest">Apresiasi dan penghormatan kepada</div>
                                <div className="text-[8px] font-serif font-bold text-amber-950 my-0.5 leading-none">Riana Amanda, S.P.</div>
                                <div className="text-[3px] text-amber-900/70 max-w-[90%] leading-tight font-light">Atas dedikasi mulia dan kontribusi kemanusiaan yang luar biasa</div>
                                <div className="w-12 h-[0.5px] bg-amber-900/10 my-0.5"></div>
                                <div className="flex items-center justify-between w-full px-4 text-[3px] text-amber-900/70 mt-1 font-mono">
                                  <span>Ketua Yayasan</span>
                                  <div className="w-3.5 h-3.5 rounded-full border border-amber-900/25 bg-amber-900/5 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full border border-dashed border-amber-900/30"></div>
                                  </div>
                                  <span>Koor Relawan</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Float Badge */}
                          <span className="absolute top-2.5 right-2.5 bg-brand-orange text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow-sm z-10 uppercase tracking-wider">
                            {tpl.badge}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="font-serif font-bold text-base text-brand-charcoal leading-snug group-hover:text-brand-orange transition-colors">{tpl.title}</h3>
                          </div>
                          <p className="text-[10px] font-mono text-brand-orange font-bold mt-1 uppercase">{tpl.theme}</p>
                          <p className="text-xs text-brand-charcoal/60 mt-1.5 leading-relaxed font-light">{tpl.desc}</p>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-brand-border/60 flex justify-end">
                        <button
                          onClick={() => handleUseTemplate(tpl.title, tpl.style)}
                          className="bg-brand-orange/10 hover:bg-brand-orange text-brand-orange hover:text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Gunakan Template</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* D. ANALYTICS SUB-TAB */}
            {activeSubTab === 'analytics' && (() => {
              // 1. Check if we have analytics data, else fallback or use demo data
              const demoMonths = [
                { month: "Jan", count: 120 },
                { month: "Feb", count: 140 },
                { month: "Mar", count: 90 },
                { month: "Apr", count: 250 },
                { month: "Mei", count: 310 },
                { month: "Jun", count: 350 },
                { month: "Jul", count: 400 },
                { month: "Agu", count: 0 },
                { month: "Sep", count: 0 },
                { month: "Okt", count: 0 },
                { month: "Nov", count: 0 },
                { month: "Des", count: 0 }
              ];

              const demoDelivery = {
                delivered: { count: 450, percentage: 90 },
                pending: { count: 40, percentage: 8 },
                bounced: { count: 10, percentage: 2 },
                total: 500,
                successRate: 98
              };

              const hasRealData = analyticsData && analyticsData.hasData;
              const monthsToShow = hasRealData ? analyticsData.monthlyVolume : demoMonths;
              const deliveryStats = hasRealData ? analyticsData.deliveryStats : demoDelivery;

              // Filter out months that have 0 count at the end, but keep at least Jan-Jul for nice look
              const activeMonths = hasRealData 
                ? monthsToShow.slice(0, Math.max(7, monthsToShow.findIndex((m: any) => m.count > 0) + 1))
                : monthsToShow.slice(0, 7);

              const maxCount = Math.max(...activeMonths.map((m: any) => m.count), 10);

              // SVG Coordinates calculation
              const points = activeMonths.map((m: any, i: number) => {
                const x = 40 + i * (340 / Math.max(1, activeMonths.length - 1));
                const y = 180 - (m.count / maxCount) * 160;
                return { x, y, month: m.month, count: m.count };
              });

              const linePath = points.map((p: any, i: number) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
              const areaPath = points.length > 0 
                ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} 180 L ${points[0].x.toFixed(1)} 180 Z`
                : '';

              // Donut chart calculations
              const pctDelivered = deliveryStats.delivered.percentage;
              const pctPending = deliveryStats.pending.percentage;
              const pctBounced = deliveryStats.bounced.percentage;

              return (
                <div className="space-y-8 animate-fade-in text-left">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-brand-charcoal/40 uppercase block tracking-widest">METRIK KEPANITIAAN</span>
                      <h1 className="text-3xl font-serif font-bold text-brand-charcoal mt-1">Analytics Dashboard</h1>
                      <p className="text-xs text-brand-charcoal/60 mt-1">Analisis statistik cetak sertifikat dan rasio pengiriman surel massal.</p>
                    </div>

                    {!hasRealData && (
                      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        <span><strong>Mode Demo:</strong> Belum ada data cetak. Menampilkan data simulasi.</span>
                      </div>
                    )}
                    {hasRealData && (
                      <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span><strong>Real-time:</strong> Data terhubung langsung dengan Prisma DB.</span>
                      </div>
                    )}
                  </div>

                  {/* Grid analytics charts (Custom stunning SVG graphs) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Chart 1: Generation Volume Over Time */}
                    <div className="bg-white border border-brand-border rounded-2xl p-6 space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-brand-border/40">
                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-brand-charcoal">Volume Cetak Bulanan (2026)</h3>
                          <p className="text-xs text-brand-charcoal/50">Total sertifikat yang berhasil digenerate</p>
                        </div>
                        <span className="bg-green-100 text-green-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> {hasRealData ? 'Live Data' : '+14% m/m'}
                        </span>
                      </div>

                       {/* Custom stunning programmatic SVG Line Graph */}
                      <div className="relative pt-4">
                        <svg viewBox="0 0 400 200" className="w-full h-48 overflow-visible">
                          {/* Grid lines */}
                          <line x1="40" y1="20" x2="380" y2="20" stroke="#f1ebd9" strokeDasharray="3,3" />
                          <line x1="40" y1="60" x2="380" y2="60" stroke="#f1ebd9" strokeDasharray="3,3" />
                          <line x1="40" y1="100" x2="380" y2="100" stroke="#f1ebd9" strokeDasharray="3,3" />
                          <line x1="40" y1="140" x2="380" y2="140" stroke="#f1ebd9" strokeDasharray="3,3" />
                          <line x1="40" y1="180" x2="380" y2="180" stroke="#e6ded5" strokeWidth="1.5" />

                          {points.length > 0 && (
                            <>
                              {/* Line Path */}
                              <path
                                d={linePath}
                                fill="none"
                                stroke="#c2662c"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />

                              {/* Dynamic glow area */}
                              <path
                                d={areaPath}
                                fill="url(#orange-gradient-analitik)"
                                opacity="0.12"
                              />

                              {/* Nodes */}
                              {points.map((p: any, idx: number) => (
                                <g key={idx} className="group/node">
                                  <circle 
                                    cx={p.x} 
                                    cy={p.y} 
                                    r="5" 
                                    fill="#c2662c" 
                                    stroke="#fff" 
                                    strokeWidth="2" 
                                    className="transition-all hover:r-7 cursor-pointer"
                                  />
                                  <text
                                    x={p.x}
                                    y={p.y - 10}
                                    fill="#2d2722"
                                    fontSize="8"
                                    textAnchor="middle"
                                    fontWeight="bold"
                                    className="opacity-0 group-hover/node:opacity-100 bg-white px-1 transition-opacity pointer-events-none"
                                  >
                                    {p.count}
                                  </text>
                                </g>
                              ))}
                            </>
                          )}

                          {/* Y-Axis Label Text */}
                          <text x="15" y="25" fill="#2d272280" fontSize="9" textAnchor="middle" className="font-mono">{maxCount}</text>
                          <text x="15" y="105" fill="#2d272280" fontSize="9" textAnchor="middle" className="font-mono">{Math.round(maxCount / 2)}</text>
                          <text x="15" y="185" fill="#2d272280" fontSize="9" textAnchor="middle" className="font-mono">0</text>

                          {/* X-Axis Month names */}
                          {points.map((p: any, idx: number) => (
                            <text 
                              key={idx} 
                              x={p.x} 
                              y="196" 
                              fill={idx === points.length - 1 ? "#2d272280" : "#2d272260"} 
                              fontSize="9" 
                              textAnchor="middle"
                              fontWeight={idx === points.length - 1 ? "bold" : "normal"}
                            >
                              {p.month}
                            </text>
                          ))}

                          {/* Definition for fill gradient */}
                          <defs>
                            <linearGradient id="orange-gradient-analitik" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#c2662c" />
                              <stop offset="100%" stopColor="#c2662c" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>

                    {/* Chart 2: Email Delivery Distribution */}
                    <div className="bg-white border border-brand-border rounded-2xl p-6 space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-brand-border/40">
                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-brand-charcoal">Status Pengiriman Surel</h3>
                          <p className="text-xs text-brand-charcoal/50">Statistik email blast sertifikat yang dikirim</p>
                        </div>
                        <span className="bg-brand-cream border border-brand-border text-brand-orange text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                          Rasio Sukses: {deliveryStats.successRate}%
                        </span>
                      </div>

                      {/* Highly aesthetic donut chart styled programmatically */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center pt-2">
                        <div className="flex justify-center">
                          <svg width="140" height="140" viewBox="0 0 42 42" className="transform -rotate-90">
                            {/* Track */}
                            <circle cx="21" cy="21" r="15.915" fill="none" stroke="#f1ebd9" strokeWidth="5"></circle>
                            
                            {/* Delivered slice */}
                            {pctDelivered > 0 && (
                              <circle 
                                cx="21" 
                                cy="21" 
                                r="15.915" 
                                fill="none" 
                                stroke="#c2662c" 
                                strokeWidth="5" 
                                strokeDasharray={`${pctDelivered} ${100 - pctDelivered}`} 
                                strokeDashoffset="0"
                              ></circle>
                            )}
                            
                            {/* Pending slice */}
                            {pctPending > 0 && (
                              <circle 
                                cx="21" 
                                cy="21" 
                                r="15.915" 
                                fill="none" 
                                stroke="#dfb76c" 
                                strokeWidth="5" 
                                strokeDasharray={`${pctPending} ${100 - pctPending}`} 
                                strokeDashoffset={`-${pctDelivered}`}
                              ></circle>
                            )}

                            {/* Bounced slice */}
                            {pctBounced > 0 && (
                              <circle 
                                cx="21" 
                                cy="21" 
                                r="15.915" 
                                fill="none" 
                                stroke="#2d2722" 
                                strokeWidth="5" 
                                strokeDasharray={`${pctBounced} ${100 - pctBounced}`} 
                                strokeDashoffset={`-${pctDelivered + pctPending}`}
                              ></circle>
                            )}
                          </svg>
                        </div>

                        <div className="space-y-3.5 text-xs text-left">
                          <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded bg-brand-orange shrink-0"></span>
                            <div>
                              <span className="block font-bold text-brand-charcoal">Delivered ({pctDelivered}%)</span>
                              <span className="text-[10px] text-brand-charcoal/50">Surel diterima dengan sukses ({deliveryStats.delivered.count} dokumen)</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded bg-[#dfb76c] shrink-0"></span>
                            <div>
                              <span className="block font-bold text-brand-charcoal">Pending ({pctPending}%)</span>
                              <span className="text-[10px] text-brand-charcoal/50">Dalam antrean pengiriman ({deliveryStats.pending.count} dokumen)</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded bg-brand-charcoal shrink-0"></span>
                            <div>
                              <span className="block font-bold text-brand-charcoal">Bounced ({pctBounced}%)</span>
                              <span className="text-[10px] text-brand-charcoal/50">Alamat surel gagal/batal ({deliveryStats.bounced.count} dokumen)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })()}

          </div>
        )}

      </main>

      {/* 3. CREATE PROJECT MODAL (Prisma Integration Form) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-card border border-brand-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-6 relative animate-scale-up text-left">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold text-brand-orange uppercase tracking-wider block">PRISMA DATABASE FLOW</span>
                <h3 className="text-lg font-serif font-bold text-brand-charcoal mt-1">Buat Project Baru</h3>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-brand-charcoal/40 hover:text-brand-charcoal hover:bg-brand-cream p-1.5 rounded-lg transition-colors font-mono font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-brand-charcoal/60 leading-relaxed">
              Formulir ini akan membuat baris baru di tabel <code className="font-mono bg-brand-cream px-1 py-0.5 rounded text-brand-orange">Project</code> pada database Postgres menggunakan Prisma ORM.
            </p>

            <form onSubmit={handleSubmitProject} className="space-y-4">
              {/* Project Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-charcoal/70 uppercase tracking-wider">Nama Project / Acara</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Webinar Cyber Security 2026"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange transition-colors shadow-sm"
                />
              </div>

              {/* Workspace Selection Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-charcoal/70 uppercase tracking-wider">Workspace ID (Organisasi)</label>
                <select
                  value={newWorkspaceId}
                  onChange={(e) => setNewWorkspaceId(e.target.value)}
                  className="w-full bg-white border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-orange transition-colors shadow-sm cursor-pointer"
                >
                  <option value="hima-ti">hima-ti (HIMA Teknik Informatika)</option>
                  <option value="eventsnap-academy">eventsnap-academy (EventSnap Academy)</option>
                  <option value="harmoni-prod">harmoni-prod (Harmoni Production)</option>
                  <option value="custom-workspace">Buat Baru / Custom Workspace</option>
                </select>
              </div>

              {/* Error or Success Alert */}
              {createProjectError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-start gap-2">
                  <span className="font-bold">Error:</span>
                  <span>{createProjectError}</span>
                </div>
              )}

              {createProjectSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl text-xs flex items-start gap-2">
                  <span className="font-bold">✓</span>
                  <span>{createProjectSuccess}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 bg-white border border-brand-border text-brand-charcoal hover:bg-brand-cream/50 text-xs font-bold py-3.5 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProject}
                  className="flex-1 bg-brand-orange hover:bg-brand-orange-hover disabled:bg-brand-orange/55 text-white text-xs font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-brand-orange/15"
                >
                  {isSubmittingProject ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Project</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
