export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  category: 'Teknologi' | 'Musik' | 'Workshop' | 'Seni' | 'Bisnis';
  image: string;
  status: 'upcoming' | 'ongoing' | 'finished';
  price: string;
  capacity: number;
  registeredCount: number;
  certificateTemplateId: string;
}

export interface ParticipantData {
  id: string;
  nama: string;
  email: string;
  nomorSertifikat: string;
  asalInstansi: string;
  tanggalKegiatan: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  type: string;
  status: 'Ready' | 'Draft' | 'Generated';
  documentCount: number;
  dateString: string;
  templateId: string;
  spreadsheetData: ParticipantData[];
  mapping: {
    nama: string;
    email: string;
    nomorSertifikat: string;
    asalInstansi: string;
    tanggalKegiatan: string;
  };
}

export interface CertificatePreset {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  borderColor: string;
  bgType: 'minimal' | 'elegant' | 'classic' | 'modern';
  fontFamily: string;
}

export type ActiveTab = 'home' | 'events' | 'certificate-info' | 'pricing' | 'about' | 'dashboard';
export type DashboardTab = 'overview' | 'projects' | 'templates' | 'analytics';
export type WizardStep = 'template' | 'data' | 'mapping' | 'preview' | 'generate';
