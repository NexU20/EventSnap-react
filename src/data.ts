import { EventItem, ProjectItem, CertificatePreset, ParticipantData } from './types';

export const CERTIFICATE_PRESETS: CertificatePreset[] = [
  {
    id: 'preset-elegant',
    name: 'Elegant Gold (Classic)',
    primaryColor: '#c2662c', // terracotta orange
    secondaryColor: '#2d2722', // charcoal
    borderColor: '#dfb76c', // gold
    bgType: 'elegant',
    fontFamily: 'serif',
  },
  {
    id: 'preset-modern',
    name: 'Modern Tech Slate',
    primaryColor: '#0f766e', // teal
    secondaryColor: '#0f172a', // slate
    borderColor: '#38bdf8', // sky
    bgType: 'modern',
    fontFamily: 'sans',
  },
  {
    id: 'preset-minimal',
    name: 'Minimalist Clean',
    primaryColor: '#1e293b', // charcoal
    secondaryColor: '#475569', // slate gray
    borderColor: '#cbd5e1', // light gray
    bgType: 'minimal',
    fontFamily: 'sans',
  },
  {
    id: 'preset-classic',
    name: 'Classic Vintage Certificate',
    primaryColor: '#7c2d12', // deep rust
    secondaryColor: '#1c1917', // stone
    borderColor: '#854d0e', // dark gold
    bgType: 'classic',
    fontFamily: 'serif',
  }
];

export const MOCK_PARTICIPANTS: ParticipantData[] = [
  {
    id: 'p-1',
    nama: 'Dr. Budi Santoso, M.Kom',
    email: 'budi.santoso@example.ac.id',
    nomorSertifikat: 'REG-2026-001',
    asalInstansi: 'UIN Syarif Hidayatullah Jakarta',
    tanggalKegiatan: '29 Juni 2026',
  },
  {
    id: 'p-2',
    nama: 'Aisyah Nur Rahma',
    email: 'aisyah.rahma@example.ac.id',
    nomorSertifikat: 'REG-2026-002',
    asalInstansi: 'Universitas Indonesia',
    tanggalKegiatan: '29 Juni 2026',
  },
  {
    id: 'p-3',
    nama: 'Rizky Maulana',
    email: 'rizky.maulana@example.ac.id',
    nomorSertifikat: 'REG-2026-003',
    asalInstansi: 'HIMA Teknik Informatika',
    tanggalKegiatan: '29 Juni 2026',
  },
  {
    id: 'p-4',
    nama: 'Siti Nurhaliza, S.Pd',
    email: 'siti.nurhaliza@example.ac.id',
    nomorSertifikat: 'REG-2026-004',
    asalInstansi: 'Institut Teknologi Bandung',
    tanggalKegiatan: '29 Juni 2026',
  },
  {
    id: 'p-5',
    nama: 'Ahmad Fauzan',
    email: 'ahmad.fauzan@example.ac.id',
    nomorSertifikat: 'REG-2026-005',
    asalInstansi: 'Universitas Negeri Jakarta',
    tanggalKegiatan: '29 Juni 2026',
  }
];

export const SAMPLE_EVENTS: EventItem[] = [
  {
    id: 'e-1',
    title: 'Annual Summit 2026: Indonesia Tech Forward',
    description: 'Seminar nasional terbesar yang membahas transformasi kecerdasan buatan, web modern, dan komputasi awan di Indonesia.',
    date: '2026-06-29',
    time: '08:30 - 15:30 WIB',
    location: 'Syarif Hidayatullah Convention Hall, Jakarta',
    organizer: 'HIMA Teknik Informatika',
    category: 'Teknologi',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=60',
    status: 'finished',
    price: 'Gratis',
    capacity: 500,
    registeredCount: 284,
    certificateTemplateId: 'preset-elegant'
  },
  {
    id: 'e-2',
    title: 'Workshop UI/UX: Merancang Antarmuka Presisi',
    description: 'Pelajari praktik terbaik desain berbasis grid, pemilihan palet warna estetik, dan perataan elemen presisi tinggi.',
    date: '2026-07-03',
    time: '13:00 - 17:00 WIB',
    location: 'Online via Zoom',
    organizer: 'EventSnap Academy',
    category: 'Workshop',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=60',
    status: 'finished',
    price: 'Rp50.000',
    capacity: 150,
    registeredCount: 112,
    certificateTemplateId: 'preset-modern'
  },
  {
    id: 'e-3',
    title: 'Festival Musik Harmoni Nusantara 2026',
    description: 'Konser musik kolaboratif yang menggabungkan instrumen tradisional nusantara dengan ketukan orkestra modern.',
    date: '2026-07-20',
    time: '18:00 - 22:30 WIB',
    location: 'Candi Prambanan, Yogyakarta',
    organizer: 'Harmoni Production',
    category: 'Musik',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=60',
    status: 'upcoming',
    price: 'Rp150.000',
    capacity: 2000,
    registeredCount: 1240,
    certificateTemplateId: 'preset-classic'
  },
  {
    id: 'e-4',
    title: 'Pameran Seni Kontemporer "Meta-Ruang"',
    description: 'Ekshibisi seni digital interaktif yang menggabungkan Virtual Reality dengan lukisan fisik bertema masa depan ekologi.',
    date: '2026-07-15',
    time: '10:00 - 21:00 WIB',
    location: 'Galeri Nasional Indonesia, Jakarta',
    organizer: 'Ruang Kreatif Seni',
    category: 'Seni',
    image: 'https://images.unsplash.com/photo-1531058020387-3be344559be6?w=600&auto=format&fit=crop&q=60',
    status: 'upcoming',
    price: 'Rp25.000',
    capacity: 300,
    registeredCount: 184,
    certificateTemplateId: 'preset-minimal'
  },
  {
    id: 'e-5',
    title: 'LDKS HIMTI 2026: Leaders of Tomorrow',
    description: 'Latihan dasar kepemimpinan mahasiswa Teknik Informatika untuk mengasah jiwa organisasi, kepemimpinan, dan etika kerja.',
    date: '2026-07-04',
    time: '08:00 - 17:00 WIB',
    location: 'Villa Orchid, Puncak',
    organizer: 'HIMA Teknik Informatika',
    category: 'Workshop',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=60',
    status: 'finished',
    price: 'Gratis',
    capacity: 100,
    registeredCount: 78,
    certificateTemplateId: 'preset-classic'
  }
];

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'p-annual-summit',
    title: 'Annual Summit 2026',
    type: 'Webinar Nasional',
    status: 'Ready',
    documentCount: 284,
    dateString: 'Hari ini',
    templateId: 'preset-elegant',
    spreadsheetData: MOCK_PARTICIPANTS,
    mapping: {
      nama: 'Nama Lengkap peserta Gelar',
      email: 'Email',
      nomorSertifikat: 'Nomor Sertifikat',
      asalInstansi: 'Asal Instansi',
      tanggalKegiatan: 'Tanggal Kegiatan'
    }
  },
  {
    id: 'p-ldks',
    title: 'LDKS HIMTI',
    type: 'Kaderisasi',
    status: 'Draft',
    documentCount: 78,
    dateString: 'Kemarin',
    templateId: 'preset-classic',
    spreadsheetData: MOCK_PARTICIPANTS.slice(1, 4),
    mapping: {
      nama: 'Nama Lengkap peserta Gelar',
      email: 'Email',
      nomorSertifikat: 'Nomor Sertifikat',
      asalInstansi: 'Pilih kolom...',
      tanggalKegiatan: 'Tanggal Kegiatan'
    }
  },
  {
    id: 'p-workshop',
    title: 'Workshop UI/UX',
    type: 'Pelatihan',
    status: 'Generated',
    documentCount: 412,
    dateString: '2 hari lalu',
    templateId: 'preset-modern',
    spreadsheetData: MOCK_PARTICIPANTS,
    mapping: {
      nama: 'Nama Lengkap peserta Gelar',
      email: 'Email',
      nomorSertifikat: 'Nomor Sertifikat',
      asalInstansi: 'Asal Instansi',
      tanggalKegiatan: 'Tanggal Kegiatan'
    }
  }
];
