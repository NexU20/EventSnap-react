import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Check, ArrowRight, ArrowLeft, RefreshCw, Award, Plus, Sparkles, Download, Mail, CheckCircle2, ChevronRight, Play, X, Send } from 'lucide-react';
import { ParticipantData, CertificatePreset, WizardStep, ProjectItem } from '../types';
import { CERTIFICATE_PRESETS, MOCK_PARTICIPANTS } from '../data';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useCertificate } from '../context/CertificateContext';
import { jsPDF } from 'jspdf';

const originalTemplates = [
  {
    id: 'preset-kementerian',
    name: 'Sertifikat Pelatihan Kementerian',
    primaryColor: '#1e3a8a',
    secondaryColor: '#f59e0b',
    borderColor: '#cbd5e1',
    bgType: 'elegant' as const,
    fontFamily: 'serif',
    description: 'Desain super formal dan prestisius dengan ornamen khas kenegaraan. Sangat pas untuk program kementerian, diklat ASN, dan pelatihan nasional resmi.',
    theme: 'Formal, Navy & Emas',
    badge: 'Kementerian',
    style: 'navy-gold',
    image: 'navy-gold'
  },
  {
    id: 'preset-bimtek',
    name: 'Bimtek & Workshop Instansi',
    primaryColor: '#065f46',
    secondaryColor: '#10b981',
    borderColor: '#e2e8f0',
    bgType: 'classic' as const,
    fontFamily: 'sans-serif',
    description: 'Tampilan bersih bernuansa korporat dengan aksen hijau botol yang elegan. Cocok untuk bimbingan teknis, workshop instansi swasta, dan sertifikasi keahlian.',
    theme: 'Profesional, Putih & Hijau Tua',
    badge: 'Instansi',
    style: 'white-green',
    image: 'white-green'
  },
  {
    id: 'preset-seminar',
    name: 'Seminar Nasional IT',
    primaryColor: '#2563eb',
    secondaryColor: '#3b82f6',
    borderColor: '#94a3b8',
    bgType: 'minimal' as const,
    fontFamily: 'sans-serif',
    description: 'Desain minimalis berestetika modern dengan sentuhan siber futuristik. Sempurna untuk seminar nasional teknologi, simposium sains, dan webinar tech.',
    theme: 'Modern, Biru & Putih',
    badge: 'Tech & IT',
    style: 'blue-white',
    image: 'blue-white'
  },
  {
    id: 'preset-bem',
    name: 'Piagam Kepanitiaan BEM',
    primaryColor: '#7f1d1d',
    secondaryColor: '#b91c1c',
    borderColor: '#cbd5e1',
    bgType: 'classic' as const,
    fontFamily: 'serif',
    description: 'Desain sertifikat akademik berwibawa dengan paduan garis tegas berwarna merah maroon. Sesuai untuk piagam apresiasi panitia BEM, Himpunan, dan organisasi kampus.',
    theme: 'Akademik, Merah Maroon',
    badge: 'Akademik',
    style: 'maroon-stone',
    image: 'maroon-stone'
  },
  {
    id: 'preset-bootcamp',
    name: 'Tech Bootcamp Graduation',
    primaryColor: '#f59e0b',
    secondaryColor: '#10b981',
    borderColor: '#cbd5e1',
    bgType: 'elegant' as const,
    fontFamily: 'sans-serif',
    description: 'Gaya ultra-modern premium berbasis latar belakang gelap berkilau emas. Sangat menonjol untuk kelulusan bootcamp intensif pemrograman atau data science.',
    theme: 'Dark Mode, Hitam & Emas',
    badge: 'Bootcamp',
    style: 'black-gold',
    image: 'black-gold'
  },
  {
    id: 'preset-relawan',
    name: 'Penghargaan Relawan Terbaik',
    primaryColor: '#78350f',
    secondaryColor: '#92400e',
    borderColor: '#cbd5e1',
    bgType: 'minimal' as const,
    fontFamily: 'serif',
    description: 'Sentuhan warna hangat yang bersahabat namun berkelas. Ideal untuk penghargaan aksi sosial, piagam kerelawanan komunitas, dan apresiasi kemanusiaan.',
    theme: 'Elegan, Krem & Coklat',
    badge: 'Komunitas',
    style: 'cream-brown',
    image: 'cream-brown'
  }
];

interface WizardCertificateProps {
  onCancel: () => void;
  onSaveProject: (project: ProjectItem) => void;
  initialProject?: ProjectItem | null;
}

export default function WizardCertificate({ onCancel, onSaveProject, initialProject }: WizardCertificateProps) {
  const { 
    currentStep, 
    setCurrentStep, 
    selectedFile: ctxFile, 
    setSelectedFile: ctxSetFile, 
    participants: ctxParticipants, 
    setParticipants: ctxSetParticipants,
    resetContext,
    mappingConfig
  } = useCertificate();

  const stepMap: Record<WizardStep, number> = {
    template: 1,
    data: 2,
    mapping: 3,
    preview: 4,
    generate: 5
  };
  const stepNames: WizardStep[] = ['template', 'data', 'mapping', 'preview', 'generate'];
  const step = stepNames[currentStep - 1] || 'template';

  const [projectTitle, setProjectTitle] = useState(initialProject?.title || 'Project Baru');
  const [projectType, setProjectType] = useState(initialProject?.type || 'Webinar Nasional');

  // Step 1: Selected Template & File States
  const [selectedFile, setSelectedFile] = useState<File | string | null>(() => {
    if (ctxFile) {
      return ctxFile;
    }
    return originalTemplates[0].image;
  });

  React.useEffect(() => {
    if (selectedFile !== ctxFile) {
      ctxSetFile(selectedFile);
    }
  }, [selectedFile, ctxFile, ctxSetFile]);

  const [imageUrl, setImageUrl] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedFile) {
      if (selectedFile instanceof File) {
        const url = URL.createObjectURL(selectedFile);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url);
      } else if (typeof selectedFile === 'string') {
        setImageUrl(selectedFile);
      }
    } else {
      setImageUrl(null);
    }
  }, [selectedFile]);

  const [selectedPreset, setSelectedPreset] = useState<any | null>(() => {
    if (initialProject) {
      return originalTemplates.find(p => p.id === initialProject.templateId) || CERTIFICATE_PRESETS.find(p => p.id === initialProject.templateId) || originalTemplates[0];
    }
    return originalTemplates[0];
  });
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const printRef = React.useRef<HTMLDivElement>(null);

  // Derived selectedTemplate so other components and steps don't break
  const selectedTemplate: CertificatePreset = selectedPreset || {
    id: 'uploaded-custom',
    name: (selectedFile instanceof File) ? selectedFile.name : 'Custom Uploaded',
    primaryColor: '#c2662c',
    secondaryColor: '#2d2722',
    borderColor: '#e6ded5',
    bgType: 'minimal',
    fontFamily: 'serif'
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'image/png' || file.type === 'image/jpeg') {
        setSelectedFile(file);
        setSelectedPreset(null);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setSelectedPreset(null);
    }
  };

  const handleSelectPreset = (preset: CertificatePreset) => {
    setSelectedPreset(preset);
    setSelectedFile(null);
  };

  const handleNextStep = () => {
    const formData = new FormData();
    formData.append('projectTitle', projectTitle);
    formData.append('projectType', projectType);
    if (selectedFile) {
      formData.append('templateFile', selectedFile);
      formData.append('sourceType', 'upload');
    } else if (selectedPreset) {
      formData.append('presetId', selectedPreset.id);
      formData.append('sourceType', 'preset');
    }
    console.log('FormData disiapkan untuk API:', {
      projectTitle,
      projectType,
      sourceType: selectedFile ? 'upload' : 'preset',
      template: selectedFile ? selectedFile.name : selectedPreset?.id,
    });
    goToStep('data');
  };
  
  // Step 2: Spreadsheet Data
  const [participants, setParticipants] = useState<ParticipantData[]>(() => {
    if (ctxParticipants && ctxParticipants.length > 0) {
      return ctxParticipants;
    }
    return initialProject?.spreadsheetData || MOCK_PARTICIPANTS;
  });

  React.useEffect(() => {
    ctxSetParticipants(participants);
  }, [participants, ctxSetParticipants]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [newParticipantInstansi, setNewParticipantInstansi] = useState('');

  const [spreadsheetFileName, setSpreadsheetFileName] = useState<string | null>(null);
  const [isSpreadsheetDragActive, setIsSpreadsheetDragActive] = useState(false);
  const [spreadsheetError, setSpreadsheetError] = useState<string | null>(null);
  const spreadsheetInputRef = React.useRef<HTMLInputElement>(null);

  const handleSpreadsheetDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsSpreadsheetDragActive(true);
  };

  const handleSpreadsheetDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsSpreadsheetDragActive(false);
  };

  const handleSpreadsheetFile = (file: File) => {
    setSpreadsheetError(null);
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      setSpreadsheetError('Berkas harus berupa format .xlsx, .xls, atau .csv');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        const parsedParticipants: ParticipantData[] = jsonData.map((row: any, idx: number) => {
          const nama = row["Nama Lengkap"] || row["Nama"] || row["Nama Lengkap peserta Gelar"] || row["Name"] || row["nama"] || Object.values(row)[0] || `Peserta ${idx + 1}`;
          const email = row["Email"] || row["email"] || row["E-mail"] || row["Mail"] || Object.values(row)[1] || `peserta${idx + 1}@example.com`;
          const instansi = row["Asal Instansi"] || row["Instansi"] || row["Asal Sekolah/Universitas"] || row["Organization"] || row["instansi"] || Object.values(row)[2] || 'Umum';
          const nomor = row["Nomor Sertifikat"] || row["Nomor"] || row["No. Sertifikat"] || `REG-2026-00${idx + 1}`;
          const tanggal = row["Tanggal Kegiatan"] || row["Tanggal"] || '29 Juni 2026';

          return {
            id: `p-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
            nama: String(nama),
            email: String(email),
            nomorSertifikat: String(nomor),
            asalInstansi: String(instansi),
            tanggalKegiatan: String(tanggal)
          };
        });

        if (parsedParticipants.length > 0) {
          setParticipants(parsedParticipants);
          setSpreadsheetFileName(file.name);
        } else {
          setSpreadsheetError('Berkas kosong atau format kolom tidak dikenali.');
        }
      } catch (err) {
        console.error("Gagal membaca file spreadsheet:", err);
        setSpreadsheetError('Gagal membaca file spreadsheet. Pastikan file tidak rusak.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSpreadsheetDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsSpreadsheetDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSpreadsheetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSpreadsheetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSpreadsheetFile(e.target.files[0]);
    }
  };

  // Step 3: Mapping Dropdowns
  const [mapping, setMapping] = useState(
    initialProject?.mapping || {
      nama: 'Nama Lengkap peserta Gelar',
      email: 'Email',
      nomorSertifikat: 'Nomor Sertifikat',
      asalInstansi: 'Asal Instansi',
      tanggalKegiatan: 'Tanggal Kegiatan'
    }
  );

  // Step 4: Preview Pagination
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPrintingSingle, setIsPrintingSingle] = useState(false);
  const [isPrintingAll, setIsPrintingAll] = useState(false);
  const [printAllProgress, setPrintAllProgress] = useState(0);
  const [printAllCurrentIndex, setPrintAllCurrentIndex] = useState(0);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setScale(width / 1123);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    const timer = setTimeout(updateScale, 100);
    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(timer);
    };
  }, [step]);

  // Step 5: Generating Animation state
  const [generateProgress, setGenerateProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerateDone, setIsGenerateDone] = useState(false);
  const [queueStatus, setQueueStatus] = useState<{ id: string; nama: string; email: string; nomorSertifikat: string; status: 'Pending' | 'Success' }[]>([]);

  React.useEffect(() => {
    setQueueStatus(
      participants.map((p, idx) => ({
        id: p.id,
        nama: p.nama,
        email: p.email,
        nomorSertifikat: p.nomorSertifikat || `REG-2026-00${idx + 1}`,
        status: 'Pending'
      }))
    );
  }, [participants]);

  // Email Massal Modal States
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState(`Sertifikat Partisipasi - ${projectTitle}`);
  const [emailMessage, setEmailMessage] = useState(
    `Halo {{Nama}},\n\nTerima kasih atas partisipasi aktif Anda dalam program "${projectTitle}".\n\nBerikut terlampir e-sertifikat resmi Anda dengan nomor kredensial {{NomorSertifikat}}.\n\nSalam hangat,\nEventSnap Panitia`
  );
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleSendBulkEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      alert("Subjek dan isi pesan wajib diisi.");
      return;
    }
    
    setIsSendingEmail(true);
    try {
      const response = await fetch('/api/emails/send-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          participants: participants,
          subject: emailSubject,
          message: emailMessage,
          projectId: initialProject?.id || ''
        })
      });

      const result = await response.json();
      if (result.success) {
        alert(result.message || "Sukses mengirimkan email massal.");
        setIsEmailModalOpen(false);
      } else {
        alert(`Gagal: ${result.message || 'Terjadi kesalahan'}`);
      }
    } catch (error) {
      console.error("Gagal mengirim email massal:", error);
      alert("Terjadi kesalahan koneksi saat mengirim email.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Add a quick manual participant
  const handleAddParticipant = () => {
    if (!newParticipantName || !newParticipantEmail) return;
    const newP: ParticipantData = {
      id: `p-${Date.now()}`,
      nama: newParticipantName,
      email: newParticipantEmail,
      nomorSertifikat: `REG-2026-00${participants.length + 1}`,
      asalInstansi: newParticipantInstansi || 'Umum',
      tanggalKegiatan: '29 Juni 2026'
    };
    setParticipants([...participants, newP]);
    setNewParticipantName('');
    setNewParticipantEmail('');
    setNewParticipantInstansi('');
  };

  const handleDeleteParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
    if (previewIndex >= participants.length - 1 && previewIndex > 0) {
      setPreviewIndex(previewIndex - 1);
    }
  };

  const handleNextDataStep = async () => {
    console.log('JSON data peserta siap dikirim ke backend:', participants);
    try {
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          participants: participants.map(p => ({
            name: p.nama,
            email: p.email,
            institution: p.asalInstansi,
            certificateNumber: p.nomorSertifikat
          })),
          projectId: initialProject?.id || ''
        })
      });
      const result = await response.json();
      if (result.success) {
        console.log('Berhasil menyimpan data peserta ke database Prisma:', result);
      } else {
        console.error('Gagal menyimpan data peserta:', result.message);
      }
    } catch (error) {
      console.error('Error saat mengirimkan data peserta ke backend:', error);
    }
    goToStep('mapping');
  };

  // Steps Navigation
  const goToStep = (targetStep: WizardStep) => {
    setCurrentStep(stepMap[targetStep] || 1);
  };

  // Run the generation progress bar
  const startGeneratingProcess = () => {
    setIsGenerating(true);
    setGenerateProgress(0);
    const interval = setInterval(() => {
      setGenerateProgress((old) => {
        if (old >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setIsGenerateDone(true);
          return 100;
        }
        return old + 8;
      });
    }, 150);
  };

  const handleCetakTunggal = async () => {
    if (participants.length === 0) return;
    setIsPrintingSingle(true);
    const element = document.getElementById('wizard-certificate-canvas-render');

    if (!element) {
      console.error("Elemen sertifikat tidak ditemukan!");
      setIsPrintingSingle(false);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        scale: 2, // High resolution crisp image
        backgroundColor: null,
        logging: false
      });

      const currentParticipant = participants[previewIndex];
      const participantName = currentParticipant ? currentParticipant.nama.replace(/[^a-zA-Z0-9_\- ]/g, "") : `Peserta_${previewIndex + 1}`;
      
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `Sertifikat - ${participantName}.png`);
        }
        setIsPrintingSingle(false);
      }, 'image/png');
    } catch (error) {
      console.error("Gagal mencetak sertifikat tunggal:", error);
      setIsPrintingSingle(false);
    }
  };

  const handleCetakSemua = () => {
    // HANYA bertugas memindahkan tampilan ke Langkah 5 (Generate)
    setIsGenerating(false);
    setIsGenerateDone(true);
    setCurrentStep(5);
  };

  const handleDownloadZip = async () => {
    if (participants.length === 0) return;
    setIsPrintingAll(true);
    setPrintAllProgress(0);
    setPrintAllCurrentIndex(0);

    // Reset queue status to Pending
    setQueueStatus(
      participants.map((p, idx) => ({
        id: p.id,
        nama: p.nama,
        email: p.email,
        nomorSertifikat: p.nomorSertifikat || `REG-2026-00${idx + 1}`,
        status: 'Pending'
      }))
    );

    const zip = new JSZip();
    const element = printRef.current || document.getElementById('step5-offscreen-certificate-render');

    if (!element) {
      console.error("Elemen sertifikat tidak ditemukan!");
      setIsPrintingAll(false);
      return;
    }

    try {
      for (let i = 0; i < participants.length; i++) {
        setPrintAllCurrentIndex(i + 1);
        setPrintAllProgress(Math.round((i / participants.length) * 100));

        const participant = participants[i];

        // Access elements directly in off-screen DOM to avoid React re-render lag
        const nameEl = document.getElementById('print-participant-name');
        const instansiEl = document.getElementById('print-participant-instansi');
        const credentialEl = document.getElementById('print-participant-credential');

        if (nameEl) {
          nameEl.innerText = participant.nama;
        }
        if (instansiEl) {
          instansiEl.innerText = participant.asalInstansi || '';
        }
        if (credentialEl) {
          credentialEl.innerText = participant.nomorSertifikat || `REG-2026-00${i + 1}`;
        }

        // Render delay sleep for high-fidelity paint
        await new Promise((resolve) => setTimeout(resolve, 500));

        const canvas = await html2canvas(element, {
          useCORS: true,
          allowTaint: true,
          scale: 2, // High resolution crisp image/pdf
          backgroundColor: null,
          logging: false
        });

        const participantName = participant.nama.replace(/[^a-zA-Z0-9_\- ]/g, "");

        // Generate PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        const pdfBlob = pdf.output('blob');
        const filename = `Sertifikat - ${participantName || `Peserta_${i + 1}`}.pdf`;
        zip.file(filename, pdfBlob);

        // Update real-time queue status
        setQueueStatus(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'Success' } : item));

        // Update progress bar
        setPrintAllProgress(Math.round(((i + 1) / participants.length) * 100));
      }

      setPrintAllProgress(100);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'Sertifikat.zip');
    } catch (error) {
      console.error("Error saat cetak:", error);
    } finally {
      setIsPrintingAll(false);
    }
  };

  const [isSavingProject, setIsSavingProject] = useState(false);

  const handleFinishWizard = async () => {
    setIsSavingProject(true);
    try {
      const template_url = selectedPreset ? selectedPreset.id : (selectedFile ? selectedFile.name : 'preset-elegant');
      
      const savedUserStr = localStorage.getItem('user_session');
      let userId: string | null = null;
      if (savedUserStr) {
        try {
          const parsed = JSON.parse(savedUserStr);
          userId = parsed.id;
        } catch (e) {}
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: initialProject?.id || null,
          nama_project: projectTitle,
          template_url: template_url,
          total_peserta: participants.length,
          userId: userId
        })
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        alert(json.message || "Gagal menyimpan project. Kuota harian tidak cukup.");
        setIsSavingProject(false);
        return;
      }

      console.log("Project sukses disimpan ke database:", json.data);
    } catch (err) {
      console.error("Gagal melakukan post ke /api/projects:", err);
    } finally {
      setIsSavingProject(false);
      
      const finalProj: ProjectItem = {
        id: initialProject?.id || `p-${Date.now()}`,
        title: projectTitle,
        type: projectType,
        status: 'Generated',
        documentCount: participants.length,
        dateString: 'Hari ini',
        templateId: selectedTemplate.id,
        spreadsheetData: participants,
        mapping: mapping
      };
      onSaveProject(finalProj);
      resetContext();
    }
  };

  const activeStyle = (selectedFile instanceof File) ? 'custom' : (selectedPreset?.style || 'navy-gold');

  const getTemplateStyle = (styleName: string) => {
    switch (styleName) {
      case 'navy-gold':
        return {
          bgColor: '#0f172a',
          textColor: '#ffffff',
          primaryColor: '#f59e0b',
          secondaryColor: '#cbd5e1',
          mutedColor: '#94a3b8',
          fontFamily: "'Playfair Display', Georgia, Cambria, serif",
          title: 'SERTIFIKAT PELATIHAN',
          subtitle: 'Diberikan Kepada',
          description: `Atas partisipasi aktif sebagai peserta program pelatihan nasional resmi dalam agenda kepanitiaan "${projectTitle}" (${projectType}) yang diselenggarakan secara sukses.`,
          signLeft: 'Kementerian RI',
          signRight: 'Direktur Utama',
          sealBg: 'rgba(245, 158, 11, 0.1)',
          sealBorder: 'rgba(245, 158, 11, 0.4)'
        };
      case 'white-green':
        return {
          bgColor: '#fafaf9',
          textColor: '#1c1917',
          primaryColor: '#065f46',
          secondaryColor: '#57534e',
          mutedColor: '#78716c',
          fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
          title: 'PIAGAM BIMTEK & WORKSHOP',
          subtitle: 'Atas kelulusan dan partisipasi terhadap',
          description: `Telah menyelesaikan bimbingan teknis kompetensi profesional instansi dalam agenda kepanitiaan "${projectTitle}" (${projectType}) yang diselenggarakan secara sukses.`,
          signLeft: 'Kepala Balai',
          signRight: 'Penyelenggara',
          sealBg: 'rgba(6, 95, 70, 0.05)',
          sealBorder: 'rgba(6, 95, 70, 0.3)'
        };
      case 'blue-white':
        return {
          bgColor: '#ffffff',
          textColor: '#1e293b',
          primaryColor: '#2563eb',
          secondaryColor: '#64748b',
          mutedColor: '#94a3b8',
          fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
          title: 'SEMINAR TEKNOLOGI NASIONAL',
          subtitle: 'This certificate is presented to',
          description: `In recognition of active participation in the annual national IT summit during the event of "${projectTitle}" (${projectType}).`,
          signLeft: 'Narasumber IT',
          signRight: 'Ketua Pelaksana',
          sealBg: 'rgba(37, 99, 235, 0.05)',
          sealBorder: 'rgba(37, 99, 235, 0.2)'
        };
      case 'maroon-stone':
        return {
          bgColor: '#fafaf9',
          textColor: '#1c1917',
          primaryColor: '#7f1d1d',
          secondaryColor: '#44403c',
          mutedColor: '#78716c',
          fontFamily: "'Playfair Display', Georgia, Cambria, serif",
          title: 'PIAGAM KEPANITIAAN BEM',
          subtitle: 'Diberikan dengan hormat kepada',
          description: `Atas pengabdian luar biasa dalam kepanitiaan organisasi mahasiswa pada agenda "${projectTitle}" (${projectType}) yang diselenggarakan secara sukses.`,
          signLeft: 'Gubernur BEM',
          signRight: 'Ketua Pelaksana',
          sealBg: 'rgba(127, 29, 29, 0.05)',
          sealBorder: 'rgba(127, 29, 29, 0.25)'
        };
      case 'black-gold':
        return {
          bgColor: '#09090b',
          textColor: '#f4f4f5',
          primaryColor: '#fbbf24',
          secondaryColor: '#a1a1aa',
          mutedColor: '#71717a',
          fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
          title: 'BOOTCAMP GRADUATION DIPLOMA',
          subtitle: 'This is proudly declared that',
          description: `Successfully completed intensive fullstack software engineering program for "${projectTitle}" (${projectType}) and demonstrated outstanding performance.`,
          signLeft: 'Lead Instructor',
          signRight: 'CTO Penyelenggara',
          sealBg: 'rgba(245, 158, 11, 0.1)',
          sealBorder: 'rgba(245, 158, 11, 0.3)'
        };
      case 'cream-brown':
        return {
          bgColor: '#FAF6EE',
          textColor: '#451a03',
          primaryColor: '#78350f',
          secondaryColor: '#92400e',
          mutedColor: '#b45309',
          fontFamily: "'Playfair Display', Georgia, Cambria, serif",
          title: 'PIAGAM PENGHARGAAN RELAWAN',
          subtitle: 'Apresiasi dan penghormatan kepada',
          description: `Atas dedikasi mulia dan kontribusi kemanusiaan yang luar biasa dalam agenda kegiatan "${projectTitle}" (${projectType}) yang diselenggarakan secara sukses.`,
          signLeft: 'Ketua Yayasan',
          signRight: 'Koor Relawan',
          sealBg: 'rgba(120, 53, 15, 0.05)',
          sealBorder: 'rgba(120, 53, 15, 0.25)'
        };
      default:
        return {
          bgColor: '#ffffff',
          textColor: '#1e293b',
          primaryColor: '#1e3a8a',
          secondaryColor: '#1e293b',
          mutedColor: '#64748b',
          fontFamily: selectedTemplate.fontFamily === 'serif' ? "'Playfair Display', Georgia, Cambria, serif" : "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
          title: 'Sertifikat Partisipasi Resmi',
          subtitle: 'Sertifikat ini diberikan secara terhormat kepada:',
          description: `Atas kontribusi aktif sebagai peserta dalam agenda kepanitiaan "${projectTitle}" (${projectType}) yang diselenggarakan secara sukses.`,
          signLeft: 'Delegasi Resmi',
          signRight: 'Tanda Tangan Panitia',
          sealBg: 'rgba(249, 115, 22, 0.05)',
          sealBorder: '#cbd5e1'
        };
    }
  };

  const tStyle = getTemplateStyle(activeStyle);

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-10" id="wizard-container">
      
      {/* HEADER WIZARD INFO (Breadcrumb and Details) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border/60 pb-6">
        {step === 'generate' && isGenerateDone ? (
          <div>
            <span className="text-[10px] font-mono font-bold text-brand-orange uppercase block tracking-widest">
              GENERATE & EXPORT
            </span>
            <h1 className="text-3xl font-serif font-bold text-brand-charcoal mt-1 flex items-center gap-2">
              Sertifikat berhasil digenerate! <span className="inline-block animate-bounce">🥳</span>
            </h1>
            <p className="text-xs text-brand-charcoal/50 mt-1.5 font-light">
              Semua sertifikat telah digenerate. Anda dapat mendownload file ZIP atau kembali ke dashboard.
            </p>
          </div>
        ) : (
          <div>
            <span className="text-xs font-mono font-bold text-brand-orange uppercase block tracking-widest">
              PROJECT BARU
            </span>
            <div className="flex items-center space-x-3 mt-1">
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="text-2xl font-serif font-bold text-brand-charcoal bg-transparent border-b border-dashed border-brand-orange/40 focus:outline-none focus:border-brand-orange pb-0.5 max-w-sm"
                placeholder="Beri Nama Project..."
              />
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="text-xs font-mono bg-brand-orange/10 border border-brand-orange/20 text-brand-orange font-bold px-3 py-1.5 rounded-full focus:outline-none cursor-pointer"
              >
                <option value="Webinar Nasional">Webinar Nasional</option>
                <option value="Kaderisasi">Kaderisasi</option>
                <option value="Pelatihan">Pelatihan</option>
                <option value="Workshop Desain">Workshop Desain</option>
              </select>
            </div>
          </div>
        )}
        <button
          onClick={onCancel}
          className="text-xs font-bold text-brand-charcoal/60 hover:text-brand-charcoal border border-brand-border px-4 py-2.5 rounded-xl bg-white hover:bg-brand-cream transition-all"
        >
          Batal
        </button>
      </div>

      {/* STEP INDICATOR CONTAINER (Image 7, 8, 9 reference) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5" id="wizard-step-indicators">
        {[
          { key: 'template', num: 1, label: 'Template' },
          { key: 'data', num: 2, label: 'Data' },
          { key: 'mapping', num: 3, label: 'Pemetaan' },
          { key: 'preview', num: 4, label: 'Preview' },
          { key: 'generate', num: 5, label: 'Generate' }
        ].map((s) => {
          const isCompleted = ['template', 'data', 'mapping', 'preview', 'generate'].indexOf(step) > ['template', 'data', 'mapping', 'preview', 'generate'].indexOf(s.key);
          const isActive = step === s.key;
          return (
            <button
              key={s.key}
              disabled={isGenerating}
              onClick={() => goToStep(s.key as WizardStep)}
              className={`py-3 px-4 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                isActive
                  ? 'bg-brand-cream/40 border-brand-orange text-brand-orange font-bold shadow-sm'
                  : isCompleted
                  ? 'bg-brand-orange text-white border-brand-orange font-semibold'
                  : 'bg-white border-brand-border text-brand-charcoal/50 hover:bg-brand-cream/50'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono shrink-0 ${
                isActive
                  ? 'bg-brand-orange/10 text-brand-orange border border-brand-orange/30'
                  : isCompleted
                  ? 'bg-white text-brand-orange font-bold'
                  : 'bg-brand-cream text-brand-charcoal/40'
              }`}>
                {s.num}
              </div>
              <div className="text-xs truncate font-sans block">{s.label}</div>
            </button>
          );
        })}
      </div>

      {/* STEP 1: SELECT OR UPLOAD CERTIFICATE TEMPLATE */}
      {step === 'template' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-brand-orange uppercase block">TEMPAT KERJA</span>
              <h3 className="text-xl font-serif font-bold text-brand-charcoal">Unggah Template Desain</h3>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed font-light">
                Pilih salah satu dari template preset profesional kami, atau seret berkas desain mentah buatan Anda sendiri dari Canva/Figma.
              </p>
            </div>

            {/* Selected feedback */}
            <div className="bg-brand-card border border-brand-border/60 p-4 rounded-xl space-y-2">
              <span className="text-[9px] font-mono font-bold text-brand-charcoal/40 uppercase block">Selected Style</span>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedTemplate.primaryColor }}></div>
                <span className="text-xs font-bold text-brand-charcoal">
                  {selectedFile instanceof File ? `Berkas Kustom: ${selectedFile.name}` : selectedTemplate.name}
                </span>
              </div>
            </div>

            <button
              onClick={handleNextStep}
              className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md shadow-brand-orange/10 uppercase tracking-wider font-mono"
            >
              <span>Lanjut Ke Unggah Data</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="lg:col-span-8 space-y-6">
            {/* Custom drag zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`bg-white border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer bg-cover bg-center ${
                isDragActive 
                  ? 'border-brand-orange bg-brand-orange/5 shadow-inner scale-[0.99]' 
                  : (selectedFile instanceof File) 
                  ? 'border-brand-orange/40 bg-brand-cream/10' 
                  : 'border-brand-border hover:border-brand-orange/60'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg"
                className="hidden"
              />
              <div className="max-w-xs mx-auto space-y-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto shadow-sm ${
                  (selectedFile instanceof File) ? 'bg-brand-orange/10 text-brand-orange' : 'bg-brand-cream text-brand-orange'
                }`}>
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-brand-charcoal">
                    {(selectedFile instanceof File) ? selectedFile.name : 'Unggah Template Sertifikat'}
                  </h4>
                  <p className="text-xs text-brand-charcoal/50">
                    {(selectedFile instanceof File) 
                      ? `${(selectedFile.size / 1024).toFixed(1)} KB - Klik atau seret untuk mengganti berkas` 
                      : 'Tarik dan lepas desain sertifikat ke area ini, atau klik untuk menelusuri.'}
                  </p>
                </div>
                <div className="flex justify-center gap-1.5">
                  <span className="text-[9px] font-mono bg-brand-cream border border-brand-border/60 text-brand-charcoal/60 px-2 py-0.5 rounded uppercase font-semibold">PNG</span>
                  <span className="text-[9px] font-mono bg-brand-cream border border-brand-border/60 text-brand-charcoal/60 px-2 py-0.5 rounded uppercase font-semibold">JPEG</span>
                </div>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-4">
              <span className="text-[10px] font-mono font-bold text-brand-charcoal/40 uppercase block">Koleksi Original EventSnap:</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {originalTemplates.map((template) => {
                  const isSelected = selectedPreset?.id === template.id && !(selectedFile instanceof File);
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => {
                        setSelectedPreset(template);
                        setSelectedFile(template.image);
                      }}
                      className={`relative p-3.5 rounded-xl border-2 transition-all duration-300 text-left flex flex-col hover:scale-105 hover:shadow-xl ${
                        isSelected
                          ? 'border-brand-orange bg-brand-orange/5 ring-4 ring-brand-orange/20 scale-[1.02] shadow-md'
                          : 'border-brand-charcoal bg-white'
                      }`}
                    >
                      {/* Badge / Pita kecil di sudut card */}
                      {template.badge && (
                        <div className="absolute top-2 right-2 bg-brand-orange text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow-sm z-10 uppercase tracking-wider">
                          {template.badge}
                        </div>
                      )}

                      {/* Thumbnail Image / Pure HTML/CSS Certificate */}
                      <div className="relative aspect-[1.414/1] w-full rounded-xl overflow-hidden border border-brand-charcoal/10 bg-brand-cream/30">
                        {template.style === 'navy-gold' && (
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

                        {template.style === 'white-green' && (
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

                        {template.style === 'blue-white' && (
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

                        {template.style === 'maroon-stone' && (
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

                        {template.style === 'black-gold' && (
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

                        {template.style === 'cream-brown' && (
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

                        {/* Selected overlay indicator */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-brand-orange/15 flex items-center justify-center z-25">
                            <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center shadow-lg animate-scale-up">
                              <Check className="w-5 h-5 stroke-[3px]" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div className="mt-3 space-y-1">
                        <h4 className="font-serif font-bold text-sm text-brand-charcoal">
                          {template.name}
                        </h4>
                        <p className="text-[10px] text-brand-charcoal/60 leading-relaxed font-light">
                          {template.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: PARTICIPANTS SPREADSHEET DATA */}
      {step === 'data' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-brand-orange uppercase block">SUMBER DATA</span>
              <h3 className="text-xl font-serif font-bold text-brand-charcoal">Hubungkan Data Peserta</h3>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed font-light">
                Unggah dokumen spreadsheet (Excel atau CSV) berisi daftar nama penerima sertifikat. Anda juga dapat mengedit dan menambah data secara manual dalam tabel di samping.
              </p>
            </div>

            {/* Total count badge */}
            <div className="bg-brand-card border border-brand-border/60 p-4 rounded-xl flex justify-between items-center">
              <span className="text-xs font-bold text-brand-charcoal/70">Total Peserta Terdeteksi:</span>
              <span className="text-xl font-serif font-bold text-brand-orange">{participants.length} Orang</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => goToStep('template')}
                className="flex-1 bg-white border border-brand-border text-brand-charcoal hover:bg-brand-cream/50 font-bold text-xs py-3.5 rounded-xl transition-all text-center block uppercase tracking-wider font-mono"
              >
                Kembali
              </button>
              <button
                onClick={handleNextDataStep}
                className="flex-1 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md uppercase tracking-wider font-mono"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            {/* Custom drag zone */}
            <div
              onDragOver={handleSpreadsheetDragOver}
              onDragLeave={handleSpreadsheetDragLeave}
              onDrop={handleSpreadsheetDrop}
              onClick={() => spreadsheetInputRef.current?.click()}
              className={`bg-white border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                isSpreadsheetDragActive 
                  ? 'border-brand-orange bg-brand-orange/5 shadow-inner scale-[0.99]' 
                  : spreadsheetFileName 
                  ? 'border-green-500 bg-green-50/10' 
                  : spreadsheetError
                  ? 'border-red-500 bg-red-50/10'
                  : 'border-brand-border hover:border-brand-orange/60'
              }`}
            >
              <input
                type="file"
                ref={spreadsheetInputRef}
                onChange={handleSpreadsheetChange}
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />
              <div className="max-w-xs mx-auto space-y-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto shadow-sm ${
                  spreadsheetFileName 
                    ? 'bg-green-100 text-green-700' 
                    : spreadsheetError 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-green-50 text-green-600'
                }`}>
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-charcoal">
                    {spreadsheetFileName ? spreadsheetFileName : 'Unggah Berkas Spreadsheet'}
                  </h4>
                  <p className="text-xs text-brand-charcoal/50">
                    {spreadsheetError 
                      ? spreadsheetError 
                      : spreadsheetFileName 
                      ? 'Berkas berhasil dimuat! Tarik atau klik untuk mengganti berkas.' 
                      : 'Tarik dan lepas lembar Excel atau CSV ke sini, atau klik untuk menelusuri.'}
                  </p>
                </div>
                <div className="flex justify-center gap-1.5">
                  <span className="text-[9px] font-mono bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded uppercase font-semibold">XLSX</span>
                  <span className="text-[9px] font-mono bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded uppercase font-semibold">CSV</span>
                </div>
              </div>
            </div>

            {/* Interactive Data Table Editor */}
            <div className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-brand-border/60 bg-brand-cream/40 flex justify-between items-center">
                <h4 className="text-xs font-bold text-brand-charcoal uppercase tracking-wider font-mono">Input & Sunting Data Manual</h4>
                <span className="text-[10px] text-brand-charcoal/40">Kolom bersifat dinamis</span>
              </div>

              {/* Input Form Fields for quick addition */}
              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-brand-border/40 bg-brand-cream/10">
                <input
                  type="text"
                  placeholder="Nama Peserta (Dengan Gelar)"
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                  className="p-2.5 bg-white border border-brand-border rounded-xl text-xs focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email Peserta"
                  value={newParticipantEmail}
                  onChange={(e) => setNewParticipantEmail(e.target.value)}
                  className="p-2.5 bg-white border border-brand-border rounded-xl text-xs focus:outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Instansi (Opsional)"
                    value={newParticipantInstansi}
                    onChange={(e) => setNewParticipantInstansi(e.target.value)}
                    className="p-2.5 bg-white border border-brand-border rounded-xl text-xs focus:outline-none flex-1"
                  />
                  <button
                    onClick={handleAddParticipant}
                    className="bg-brand-orange hover:bg-brand-orange-hover text-white p-2.5 rounded-xl transition-all shadow-sm shrink-0"
                    title="Tambah Baris Peserta"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Table rendering */}
              <div className="overflow-x-auto max-h-60">
                <table className="w-full text-left text-xs text-brand-charcoal/80">
                  <thead className="bg-brand-cream/30 text-brand-charcoal/60 font-bold uppercase text-[9px] tracking-wider border-b border-brand-border/40">
                    <tr>
                      <th className="px-4 py-3">Nama Lengkap peserta Gelar</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Asal Instansi</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/30">
                    {participants.map((item) => (
                      <tr key={item.id} className="hover:bg-brand-cream/10 transition-colors">
                        <td className="px-4 py-3.5 font-semibold text-brand-charcoal">{item.nama}</td>
                        <td className="px-4 py-3.5 font-mono text-[11px] text-brand-charcoal/70">{item.email}</td>
                        <td className="px-4 py-3.5 text-brand-charcoal/60">{item.asalInstansi}</td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => handleDeleteParticipant(item.id)}
                            className="text-red-500 hover:text-red-700 font-semibold text-[10px] transition-colors"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: DATA MAPPING (Image 8 reference) */}
      {step === 'mapping' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-brand-orange uppercase block">SINKRONISASI</span>
              <h3 className="text-xl font-serif font-bold text-brand-charcoal">Pemetaan Kolom</h3>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed font-light">
                Cocokkan variabel teks dinamis yang terbaca dari template sertifikat dengan kolom tabel data peserta yang baru saja diunggah.
              </p>
            </div>

            {/* Mapping success badge */}
            <div className="bg-brand-card border border-brand-border/60 p-4 rounded-xl flex items-center justify-between">
              <span className="text-xs text-brand-charcoal/60 font-bold uppercase tracking-wider font-mono">Status:</span>
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 5 Kolom Terdeteksi
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => goToStep('data')}
                className="flex-1 bg-white border border-brand-border text-brand-charcoal hover:bg-brand-cream/50 font-bold text-xs py-3.5 rounded-xl transition-all text-center block uppercase tracking-wider font-mono"
              >
                Kembali
              </button>
              <button
                onClick={() => goToStep('preview')}
                className="flex-1 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md uppercase tracking-wider font-mono"
              >
                <span>Lanjut Ke Preview</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mapping Grid Columns (Image 8 design style) */}
          <div className="lg:col-span-8 bg-white border border-brand-border rounded-2xl p-6 space-y-6 shadow-sm">
            
            <div className="grid grid-cols-2 gap-6 pb-2 border-b border-brand-border/60">
              <span className="text-[10px] font-mono font-bold text-brand-charcoal/50 uppercase block">Required Fields (Variabel Template)</span>
              <span className="text-[10px] font-mono font-bold text-brand-charcoal/50 uppercase block">Source Columns (Kolom Excel)</span>
            </div>

            {/* Variable Mapping List */}
            <div className="space-y-4">
              
              {/* Field 1: Nama */}
              <div className="grid grid-cols-2 gap-6 items-center">
                <div className="p-3 bg-brand-cream border border-brand-border/80 rounded-xl flex items-center justify-between shadow-sm">
                  <div>
                    <span className="font-bold text-xs block text-brand-charcoal">Nama Peserta</span>
                    <span className="text-[9px] text-brand-charcoal/40 font-mono block">Text wajib &bull; wajib</span>
                  </div>
                  <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><Check className="w-3.5 h-3.5" /></div>
                </div>

                <div>
                  <select
                    value={mapping.nama}
                    onChange={(e) => setMapping({ ...mapping, nama: e.target.value })}
                    className="w-full p-3.5 bg-brand-cream/30 border border-brand-orange/40 rounded-xl text-xs font-semibold text-brand-orange focus:outline-none"
                  >
                    <option value="Nama Lengkap peserta Gelar">Nama Lengkap peserta Gelar</option>
                    <option value="Email">Email</option>
                    <option value="Nomor Sertifikat">Nomor Sertifikat</option>
                    <option value="Asal Instansi">Asal Instansi</option>
                  </select>
                </div>
              </div>

              {/* Field 2: Nomor */}
              <div className="grid grid-cols-2 gap-6 items-center">
                <div className="p-3 bg-brand-cream border border-brand-border/80 rounded-xl flex items-center justify-between shadow-sm">
                  <div>
                    <span className="font-bold text-xs block text-brand-charcoal">Nomor Sertifikat</span>
                    <span className="text-[9px] text-brand-charcoal/40 font-mono block">Alphanumeric wajib &bull; wajib</span>
                  </div>
                  <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><Check className="w-3.5 h-3.5" /></div>
                </div>

                <div>
                  <select
                    value={mapping.nomorSertifikat}
                    onChange={(e) => setMapping({ ...mapping, nomorSertifikat: e.target.value })}
                    className="w-full p-3.5 bg-brand-cream/30 border border-brand-border rounded-xl text-xs text-brand-charcoal/80 focus:outline-none"
                  >
                    <option value="Nomor Sertifikat">Nomor Sertifikat</option>
                    <option value="Nama Lengkap peserta Gelar">Nama Lengkap peserta Gelar</option>
                    <option value="Email">Email</option>
                    <option value="Asal Instansi">Asal Instansi</option>
                  </select>
                </div>
              </div>

              {/* Field 3: Instansi */}
              <div className="grid grid-cols-2 gap-6 items-center">
                <div className="p-3 bg-brand-cream border border-brand-border/80 rounded-xl flex items-center justify-between shadow-sm">
                  <div>
                    <span className="font-bold text-xs block text-brand-charcoal">Asal Instansi</span>
                    <span className="text-[9px] text-brand-charcoal/40 font-mono block">Text opsional &bull; opsional</span>
                  </div>
                  <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><Check className="w-3.5 h-3.5" /></div>
                </div>

                <div>
                  <select
                    value={mapping.asalInstansi}
                    onChange={(e) => setMapping({ ...mapping, asalInstansi: e.target.value })}
                    className="w-full p-3.5 bg-brand-cream/30 border border-brand-border rounded-xl text-xs text-brand-charcoal/80 focus:outline-none"
                  >
                    <option value="Asal Instansi">Asal Instansi</option>
                    <option value="Pilih kolom...">Pilih kolom...</option>
                    <option value="Nama Lengkap peserta Gelar">Nama Lengkap peserta Gelar</option>
                    <option value="Email">Email</option>
                  </select>
                </div>
              </div>

              {/* Field 4: Tanggal */}
              <div className="grid grid-cols-2 gap-6 items-center">
                <div className="p-3 bg-brand-cream border border-brand-border/80 rounded-xl flex items-center justify-between shadow-sm">
                  <div>
                    <span className="font-bold text-xs block text-brand-charcoal">Tanggal Kegiatan</span>
                    <span className="text-[9px] text-brand-charcoal/40 font-mono block">Date opsional &bull; opsional</span>
                  </div>
                  <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><Check className="w-3.5 h-3.5" /></div>
                </div>

                <div>
                  <select
                    value={mapping.tanggalKegiatan}
                    onChange={(e) => setMapping({ ...mapping, tanggalKegiatan: e.target.value })}
                    className="w-full p-3.5 bg-brand-cream/30 border border-brand-border rounded-xl text-xs text-brand-charcoal/80 focus:outline-none"
                  >
                    <option value="Tanggal Kegiatan">Tanggal Kegiatan</option>
                    <option value="Pilih kolom...">Pilih kolom...</option>
                    <option value="Nama Lengkap peserta Gelar">Nama Lengkap peserta Gelar</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Dynamic visual preview info block (Image 8 lower section) */}
            <div className="bg-brand-cream/40 border border-brand-border/80 p-4 rounded-xl">
              <span className="text-[10px] font-mono font-bold text-brand-charcoal/40 block mb-1">DATA PREVIEW (ROW 1)</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
                <div>
                  <span className="text-brand-charcoal/50 text-[9px] block">NAMA</span>
                  <span className="font-bold text-brand-charcoal">{participants[0]?.nama || 'Nama Kosong'}</span>
                </div>
                <div>
                  <span className="text-brand-charcoal/50 text-[9px] block">NOMOR</span>
                  <span className="font-bold text-brand-charcoal">{participants[0]?.nomorSertifikat || 'REG-XXX'}</span>
                </div>
                <div>
                  <span className="text-brand-charcoal/50 text-[9px] block">INSTANSI</span>
                  <span className="font-bold text-brand-charcoal truncate block">{participants[0]?.asalInstansi || 'Instansi Kosong'}</span>
                </div>
                <div>
                  <span className="text-brand-charcoal/50 text-[9px] block">TANGGAL</span>
                  <span className="font-bold text-brand-charcoal">{participants[0]?.tanggalKegiatan || '29 Juni 2026'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* STEP 4: PREVIEW SINGLE CERTIFICATES (Image 9 reference) */}
      {step === 'preview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-brand-orange uppercase block">VERIFIKASI VISUAL</span>
              <h3 className="text-xl font-serif font-bold text-brand-charcoal">Periksa Hasil Sebelum Generate</h3>
              <p className="text-xs text-brand-charcoal/70 leading-relaxed font-light">
                Navigasi antar peserta untuk memvalidasi format nama, nomor, dan instansi pada template sertifikat yang terpilih sebelum proses penulisan massal dimulai.
              </p>
            </div>

            {/* Selected stats info */}
            <div className="bg-brand-card border border-brand-border/60 p-4 rounded-xl space-y-2">
              <span className="text-[10px] font-mono font-bold text-brand-charcoal/40 uppercase block">Selected Template Style</span>
              <span className="text-xs font-bold text-brand-orange block">{selectedTemplate.name}</span>
              <span className="text-[10px] text-brand-charcoal/50 block">Font Keluarga: <span className="font-mono">{selectedTemplate.fontFamily === 'serif' ? 'Playfair Display (Serif)' : 'Plus Jakarta Sans (Sans)'}</span></span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => goToStep('mapping')}
                  disabled={isPrintingSingle || isPrintingAll}
                  className="flex-1 bg-white border border-brand-border text-brand-charcoal hover:bg-brand-cream/50 font-bold text-xs py-3.5 rounded-xl transition-all text-center block uppercase tracking-wider font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Kembali
                </button>
                <button
                  onClick={handleCetakTunggal}
                  disabled={isPrintingSingle || isPrintingAll}
                  className="flex-1 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md shadow-brand-orange/15 uppercase tracking-wider font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPrintingSingle ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Mulai Cetak</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              <button
                onClick={handleCetakSemua}
                disabled={isPrintingSingle || isPrintingAll}
                className={`w-full font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm uppercase tracking-wider font-mono ${
                  isPrintingAll 
                    ? 'bg-brand-orange/10 border border-brand-orange text-brand-orange cursor-not-allowed'
                    : 'bg-white border-2 border-brand-orange text-brand-orange hover:bg-brand-orange/5 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {isPrintingAll ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mencetak ({printAllCurrentIndex}/{participants.length} - {printAllProgress}%)</span>
                  </>
                ) : (
                  <>
                    <span>Cetak Semua Nama</span>
                    <Play className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Column: Certificate Interactive Canvas Render */}
            <div className="md:col-span-8 flex flex-col items-center space-y-4">
              <div 
                ref={containerRef}
                className="relative aspect-[1.414/1] w-full max-w-3xl mx-auto overflow-hidden shadow-lg border border-brand-border rounded-xl select-none"
                id="wizard-certificate-canvas-render"
              >
                <div 
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    width: '1123px',
                    height: '794px',
                    backgroundColor: tStyle.bgColor,
                    color: tStyle.textColor,
                    fontFamily: tStyle.fontFamily,
                    padding: '72px 96px',
                    boxSizing: 'border-box',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'center',
                    pointerEvents: 'none'
                  }}
                >
                  {/* Background Image if Custom Template Uploaded */}
                  {activeStyle === 'custom' && imageUrl && (
                    <img 
                      src={imageUrl} 
                      alt="Template Sertifikat" 
                      referrerPolicy="no-referrer"
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0, 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        pointerEvents: 'none', 
                        zIndex: 0 
                      }}
                    />
                  )}

                  {/* Dynamic Template Ornaments / Borders */}
                  {activeStyle === 'navy-gold' && (
                    <>
                      <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', bottom: '16px', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', bottom: '24px', border: '3px solid rgba(245, 158, 11, 0.6)', borderRadius: '8px', pointerEvents: 'none' }} />
                    </>
                  )}

                  {activeStyle === 'white-green' && (
                    <>
                      <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', bottom: '16px', border: '1px solid rgba(6, 95, 70, 0.2)', borderRadius: '12px', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', bottom: '24px', border: '3px solid rgba(6, 95, 70, 0.4)', borderRadius: '8px', pointerEvents: 'none' }} />
                    </>
                  )}

                  {activeStyle === 'blue-white' && (
                    <>
                      <div style={{ position: 'absolute', top: '16px', left: '16px', width: '36px', height: '36px', borderTop: '3px solid #2563eb', borderLeft: '3px solid #2563eb', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', bottom: '16px', left: '16px', width: '36px', height: '36px', borderBottom: '3px solid #2563eb', borderLeft: '3px solid #2563eb', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', top: '16px', right: '16px', width: '36px', height: '36px', borderTop: '3px solid #2563eb', borderRight: '3px solid #2563eb', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '36px', height: '36px', borderBottom: '3px solid #2563eb', borderRight: '3px solid #2563eb', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', bottom: '24px', border: '1px solid rgba(37, 99, 235, 0.1)', borderRadius: '4px', pointerEvents: 'none' }} />
                    </>
                  )}

                  {activeStyle === 'maroon-stone' && (
                    <>
                      <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', bottom: '16px', border: '1px solid rgba(127, 29, 29, 0.1)', borderRadius: '12px', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', bottom: '24px', border: '3px solid rgba(127, 29, 29, 0.35)', borderRadius: '8px', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', top: '32px', left: '32px', right: '32px', bottom: '32px', border: '1px solid rgba(127, 29, 29, 0.15)', pointerEvents: 'none' }} />
                    </>
                  )}

                  {activeStyle === 'black-gold' && (
                    <>
                      <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', bottom: '16px', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: '12px', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', bottom: '24px', border: '3px solid rgba(245, 158, 11, 0.4)', borderRadius: '8px', pointerEvents: 'none' }} />
                    </>
                  )}

                  {activeStyle === 'cream-brown' && (
                    <>
                      <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', bottom: '16px', border: '1px solid rgba(120, 53, 15, 0.1)', borderRadius: '12px', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', bottom: '24px', border: '3px solid rgba(120, 53, 15, 0.25)', borderRadius: '8px', pointerEvents: 'none' }} />
                    </>
                  )}

                  {activeStyle === 'custom' && !imageUrl && (
                    <>
                      <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', bottom: '16px', border: `2px solid ${selectedTemplate.borderColor || '#f97316'}`, borderRadius: '8px', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', bottom: '24px', border: `1px solid ${(selectedTemplate.borderColor || '#f97316')}40`, borderRadius: '4px', pointerEvents: 'none' }} />
                    </>
                  )}

                  {/* Header Section */}
                  <div className="z-10 relative" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                    <span 
                      className="block font-mono font-bold uppercase tracking-widest text-center animate-fade-in" 
                      style={{ fontSize: '13px', color: tStyle.primaryColor, letterSpacing: '4px' }}
                    >
                      EventSnap Automation
                    </span>
                    <h4 
                      className="block uppercase tracking-wider text-center animate-fade-in"
                      style={{ 
                        fontSize: '18px', 
                        color: tStyle.secondaryColor, 
                        letterSpacing: '2px',
                        margin: 0,
                        fontWeight: 600,
                        fontFamily: tStyle.fontFamily
                      }}
                    >
                      {tStyle.title}
                    </h4>
                  </div>

                  {/* Body Section */}
                  <div className="z-10 relative" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', width: '100%' }}>
                    <span className="block italic text-center" style={{ fontSize: '15px', color: tStyle.mutedColor }}>
                      {tStyle.subtitle}
                    </span>
                    
                    <h2 
                      className="font-bold tracking-wide text-center"
                      style={{ 
                        fontSize: '48px',
                        color: activeStyle === 'custom' && imageUrl ? '#1e3a8a' : tStyle.textColor,
                        fontFamily: tStyle.fontFamily,
                        margin: '12px 0',
                        lineHeight: '1.2'
                      }}
                    >
                      {participants[previewIndex]?.nama || 'Dr. Budi Santoso, M.Kom'}
                    </h2>
                    
                    <div className="mx-auto" style={{ width: '200px', height: '2px', backgroundColor: tStyle.primaryColor, opacity: 0.6 }} />
                    
                    <p className="max-w-3xl mx-auto leading-relaxed text-center" style={{ fontSize: '16px', color: tStyle.textColor, opacity: 0.85, margin: 0 }}>
                      {tStyle.description}
                    </p>

                    <p className="font-mono text-center" style={{ fontSize: '14px', color: tStyle.mutedColor, margin: '8px 0 0 0' }}>
                      Delegasi resmi: <strong style={{ color: tStyle.textColor }}>{participants[previewIndex]?.asalInstansi || 'UIN Syarif Hidayatullah Jakarta'}</strong>
                    </p>
                  </div>

                  {/* Foot Signatures */}
                  <div className="z-10 relative animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', width: '100%', padding: '0 48px', marginBottom: '16px' }}>
                    {/* Left signature */}
                    <div style={{ textAlign: 'left', width: '220px' }}>
                      <div style={{ height: '50px' }} /> {/* Space for signature */}
                      <div style={{ width: '100%', height: '1px', backgroundColor: tStyle.mutedColor, opacity: 0.3, marginBottom: '6px' }} />
                      <span className="block font-bold text-left" style={{ fontSize: '11px', color: tStyle.mutedColor, letterSpacing: '1px', textTransform: 'uppercase' }}>Instansi / Penandatangan</span>
                      <span style={{ fontSize: '13px', color: tStyle.textColor, fontWeight: 600 }}>{tStyle.signLeft}</span>
                    </div>
                    
                    {/* Center seal */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div 
                        style={{ 
                          width: '64px', 
                          height: '64px', 
                          borderRadius: '50%', 
                          border: `2px solid ${tStyle.sealBorder}`, 
                          backgroundColor: tStyle.sealBg, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div 
                          style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '50%', 
                            border: `1.5px dashed ${tStyle.sealBorder}`,
                            opacity: 0.8
                          }} 
                        />
                      </div>
                      <span className="block text-center" style={{ fontSize: '10px', color: tStyle.mutedColor, marginTop: '8px', fontStyle: 'italic' }}>EventSnap Seal</span>
                    </div>
                    
                    {/* Right signature / credential info */}
                    <div style={{ textAlign: 'right', width: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'end' }}>
                      <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                        <span className="block font-bold text-right" style={{ fontSize: '9px', color: tStyle.mutedColor, letterSpacing: '1px' }}>ID KREDENSIAL</span>
                        <span style={{ fontSize: '12px', color: tStyle.primaryColor, fontWeight: 700, fontFamily: 'monospace' }}>
                          {participants[previewIndex]?.nomorSertifikat || 'REG-2026-001'}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '1px', backgroundColor: tStyle.mutedColor, opacity: 0.3, marginBottom: '6px' }} />
                      <span className="block font-bold text-right" style={{ fontSize: '11px', color: tStyle.mutedColor, letterSpacing: '1px', textTransform: 'uppercase' }}>Otoritas Resmi</span>
                      <span style={{ fontSize: '13px', color: tStyle.textColor, fontWeight: 600 }}>{tStyle.signRight}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pagination controls below certificate */}
              <div className="flex items-center space-x-4 text-xs font-mono">
                <button
                  disabled={previewIndex === 0}
                  onClick={() => setPreviewIndex(prev => prev - 1)}
                  className="px-3 py-1.5 border border-brand-border rounded bg-white text-brand-charcoal/70 hover:text-brand-charcoal disabled:opacity-40"
                >
                  &larr; Sebelumnya
                </button>
                <span className="font-bold text-brand-orange">
                  {previewIndex + 1} / {participants.length}
                </span>
                <button
                  disabled={previewIndex === participants.length - 1}
                  onClick={() => setPreviewIndex(prev => prev + 1)}
                  className="px-3 py-1.5 border border-brand-border rounded bg-white text-brand-charcoal/70 hover:text-brand-charcoal disabled:opacity-40"
                >
                  Berikutnya &rarr;
                </button>
              </div>
            </div>

            {/* Right Column: Participant Sidebar List selector (Image 9 style) */}
            <div className="md:col-span-4 bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden flex flex-col h-full max-h-[380px]">
              <div className="p-3.5 border-b border-brand-border/60 bg-brand-cream/40">
                <span className="text-[9px] font-mono font-bold text-brand-orange uppercase block">DAFTAR PESERTA ({participants.length})</span>
                <span className="text-[10px] text-brand-charcoal/50">Klik nama untuk melihat preview</span>
              </div>
              
              <div className="overflow-y-auto flex-1 divide-y divide-brand-border/30">
                {participants.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => setPreviewIndex(idx)}
                    className={`w-full text-left p-3 text-xs transition-colors block ${
                      previewIndex === idx
                        ? 'bg-brand-orange/10 border-l-4 border-brand-orange font-semibold'
                        : 'hover:bg-brand-cream/30'
                    }`}
                  >
                    <span className="font-bold text-brand-charcoal block truncate">{p.nama}</span>
                    <span className="text-[10px] text-brand-charcoal/50 font-mono block truncate mt-0.5">{p.email}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* STEP 5: MOCK COMPILING & GENERATING PROGRESS BAR */}
      {step === 'generate' && (
        <div className="w-full">
          {/* Progress Animation */}
          {isGenerating && (
            <div className="bg-white border border-brand-border rounded-2xl p-12 text-center max-w-2xl mx-auto space-y-8 shadow-sm">
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center mx-auto animate-spin">
                  <RefreshCw className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-serif font-bold text-brand-charcoal">Sedang Menulis Sertifikat...</h3>
                  <p className="text-xs text-brand-charcoal/50 max-w-md mx-auto">
                    Sistem kami sedang memetakan {participants.length} data peserta dan merender file PDF individual beresolusi tinggi tanpa degradasi kualitas.
                  </p>
                </div>

                {/* Progress bar */}
                <div className="max-w-md mx-auto">
                  <div className="w-full bg-brand-cream border border-brand-border h-4 rounded-full overflow-hidden p-0.5 relative">
                    <div 
                      className="bg-brand-orange h-full rounded-full transition-all duration-150"
                      style={{ width: `${generateProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-mono font-bold text-brand-orange block mt-2">{generateProgress}% Selesai</span>
                </div>
              </div>
            </div>
          )}

          {/* Success screen once done */}
          {isGenerateDone && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4 animate-fade-in" id="step5-generate-success-layout">
              {/* Left Column: Ringkasan Batch (4/12 or md:col-span-4) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm space-y-6">
                  <h3 className="text-xl font-serif font-bold text-brand-charcoal border-b border-brand-border/40 pb-3">Ringkasan Batch</h3>
                  
                  {/* Batch Details Rows */}
                  <div className="divide-y divide-brand-border/40 text-xs py-1 text-left">
                    <div className="flex justify-between py-3.5">
                      <span className="text-brand-charcoal/60">Project</span>
                      <span className="font-bold text-brand-charcoal text-right truncate max-w-[150px]" title={projectTitle}>{projectTitle || 'Annual Summit 2026'}</span>
                    </div>
                    <div className="flex justify-between py-3.5">
                      <span className="text-brand-charcoal/60">Template</span>
                      <span className="font-bold text-brand-charcoal text-right truncate max-w-[150px]" title={selectedFile ? selectedFile.name : selectedTemplate?.name}>
                        {selectedFile ? selectedFile.name : selectedTemplate?.name || 'certificate-summit.png'}
                      </span>
                    </div>
                    <div className="flex justify-between py-3.5">
                      <span className="text-brand-charcoal/60">Jumlah dokumen</span>
                      <span className="font-bold text-brand-charcoal text-right">{participants.length} sertifikat</span>
                    </div>
                    <div className="flex justify-between py-3.5">
                      <span className="text-brand-charcoal/60">Format output</span>
                      <span className="font-bold text-brand-charcoal text-right">PDF individual + ZIP</span>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-2 pt-2 border-t border-brand-border/40 text-left">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-brand-charcoal">
                        {isPrintingAll 
                          ? `Memproses (${printAllCurrentIndex}/${participants.length})...` 
                          : printAllProgress === 100 
                          ? 'Selesai!' 
                          : 'Siap untuk diunduh'}
                      </span>
                      <span className="font-mono font-bold text-brand-orange">
                        {printAllProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-brand-cream border border-brand-border h-4 rounded-full overflow-hidden p-0.5 relative">
                      <div 
                        className="bg-brand-orange h-full rounded-full transition-all duration-300"
                        style={{ width: `${printAllProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Button Action */}
                  <div className="space-y-3 pt-2">
                    <button
                      disabled={isPrintingAll}
                      onClick={handleDownloadZip}
                      className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs py-4 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 uppercase tracking-wider font-mono disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{isPrintingAll ? `Mengunduh... (${printAllCurrentIndex}/${participants.length})` : 'Download ZIP'}</span>
                    </button>

                    <button
                      disabled={isPrintingAll}
                      onClick={() => setIsEmailModalOpen(true)}
                      className="w-full bg-white hover:bg-brand-cream border border-brand-border text-brand-charcoal font-bold text-xs py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 uppercase tracking-wider font-mono shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Mail className="w-4 h-4 text-brand-orange" />
                      <span>Kirim Email</span>
                    </button>

                    <button
                      disabled={isPrintingAll || isSavingProject}
                      onClick={handleFinishWizard}
                      className="w-full bg-brand-charcoal hover:bg-brand-charcoal/90 text-white font-bold text-xs py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 uppercase tracking-wider font-mono shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {isSavingProject ? (
                        <>
                          <div className="w-4 h-4 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-brand-orange" />
                          <span>Selesai & Simpan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Export Queue (8/12 or md:col-span-8) */}
              <div className="lg:col-span-8">
                <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm flex flex-col h-full text-left">
                  <h3 className="text-xl font-serif font-bold text-brand-charcoal pb-3">Export Queue</h3>
                  
                  <div className="border border-brand-border rounded-xl overflow-hidden shadow-sm bg-white mt-2">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-brand-cream/40 border-b border-brand-border/50">
                          <th className="px-4 py-3 text-[10px] font-mono font-bold text-brand-charcoal/50 uppercase tracking-wider w-1/2">PESERTA</th>
                          <th className="px-4 py-3 text-[10px] font-mono font-bold text-brand-charcoal/50 uppercase tracking-wider w-1/4">NOMOR</th>
                          <th className="px-4 py-3 text-[10px] font-mono font-bold text-brand-charcoal/50 uppercase tracking-wider w-1/4 text-center">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/30">
                        {queueStatus.map((item, idx) => {
                          const isSuccess = item.status === 'Success';
                          let statusText = item.status;
                          let statusStyle = isSuccess 
                            ? 'bg-green-50 text-green-700 border border-green-200/60' 
                            : 'bg-gray-100 text-gray-500 border border-gray-200/60';
                          
                          if (isPrintingAll && idx === printAllCurrentIndex - 1) {
                            statusText = 'Processing';
                            statusStyle = 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20 animate-pulse';
                          }

                          return (
                            <tr key={item.id} className="hover:bg-brand-cream/10 transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-bold text-brand-charcoal text-xs">{item.nama}</div>
                                <div className="text-[10px] text-brand-charcoal/50 font-mono mt-0.5">{item.email}</div>
                              </td>
                              <td className="px-4 py-3 text-xs font-mono text-brand-charcoal/80">
                                {item.nomorSertifikat}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-block px-3.5 py-0.5 rounded-full text-[10px] font-sans font-bold tracking-wide ${statusStyle}`}>
                                  {statusText}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Email Massal Modal */}
              {isEmailModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/60 backdrop-blur-sm animate-fade-in" id="email-massal-modal">
                  <div className="bg-white rounded-2xl border border-brand-border shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                    {/* Modal Header */}
                    <div className="p-5 border-b border-brand-border/60 bg-brand-cream/30 flex justify-between items-center">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 bg-brand-orange/10 text-brand-orange rounded-xl">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-brand-charcoal text-base">Kirim Email Massal</h3>
                          <p className="text-[10px] font-mono text-brand-charcoal/50">Kirim sertifikat ke {participants.length} penerima</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsEmailModalOpen(false)}
                        className="p-1.5 text-brand-charcoal/40 hover:text-brand-charcoal hover:bg-brand-cream/60 rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Form */}
                    <div className="p-6 space-y-4 overflow-y-auto text-left">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono font-bold text-brand-charcoal/70 uppercase">Subjek Email</label>
                        <input 
                          type="text" 
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder="Masukkan subjek email..."
                          className="w-full bg-brand-cream/40 border border-brand-border rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all text-brand-charcoal font-sans"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono font-bold text-brand-charcoal/70 uppercase">Isi Pesan Email</label>
                        <textarea 
                          value={emailMessage}
                          onChange={(e) => setEmailMessage(e.target.value)}
                          rows={8}
                          placeholder="Tulis pesan email Anda di sini..."
                          className="w-full bg-brand-cream/40 border border-brand-border rounded-xl p-4 text-xs focus:ring-1 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all font-sans text-brand-charcoal resize-none leading-relaxed"
                        />
                        <p className="text-[10px] text-brand-charcoal/50 italic">
                          Gunakan <span className="font-mono font-bold text-brand-orange">{"{{Nama}}"}</span> untuk memanggil nama peserta secara dinamis.
                        </p>
                        <div className="bg-brand-cream/30 border border-brand-border/50 rounded-lg p-3 text-[10px] text-brand-charcoal/60 leading-relaxed space-y-1 mt-2">
                          <p className="font-semibold text-brand-orange">Variabel Lainnya:</p>
                          <p>• <span className="font-mono font-bold text-brand-orange">{"{{NomorSertifikat}}"}</span> untuk ID kredensial.</p>
                          <p>• <span className="font-mono font-bold text-brand-orange">{"{{Instansi}}"}</span> untuk instansi asal peserta.</p>
                        </div>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="p-5 border-t border-brand-border/60 bg-brand-cream/20 flex justify-end items-center space-x-3">
                      <button
                        type="button"
                        disabled={isSendingEmail}
                        onClick={() => setIsEmailModalOpen(false)}
                        className="px-5 py-2.5 rounded-xl border border-brand-border text-brand-charcoal/80 hover:bg-brand-cream hover:text-brand-charcoal text-xs font-mono font-bold transition-all disabled:opacity-50 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        disabled={isSendingEmail}
                        onClick={handleSendBulkEmail}
                        className="px-6 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-mono font-bold shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isSendingEmail ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Mengirim...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Kirim Sekarang</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fallback trigger to start generation */}
          {!isGenerating && !isGenerateDone && (
            <div className="py-12 text-center max-w-2xl mx-auto bg-white border border-brand-border rounded-2xl p-12 space-y-6 shadow-sm">
              <Award className="w-16 h-16 text-brand-orange mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-brand-charcoal">Siap Menghasilkan Dokumen?</h3>
                <p className="text-xs text-brand-charcoal/50 max-w-sm mx-auto">
                  Sistem siap memproses sebanyak {participants.length} sertifikat peserta secara massal.
                </p>
              </div>
              <button
                onClick={startGeneratingProcess}
                className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs px-8 py-3.5 rounded-xl transition-all shadow-md inline-flex items-center space-x-2 uppercase tracking-wider font-mono cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Mulai Sekarang</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* Hidden / Off-screen element specifically for Step 5 PDF generation */}
      <div className="fixed left-[-9999px] top-[-9999px] pointer-events-none" aria-hidden="true">
        <div 
          ref={printRef}
          className="relative flex flex-col justify-between"
          id="step5-offscreen-certificate-render"
          style={{
            width: '1123px',
            height: '794px',
            backgroundColor: tStyle.bgColor,
            color: tStyle.textColor,
            fontFamily: tStyle.fontFamily,
            padding: '72px 96px',
            boxSizing: 'border-box',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          {/* Background Image if Custom Template Uploaded */}
          {activeStyle === 'custom' && imageUrl && (
            <img 
              src={imageUrl} 
              alt="Template Sertifikat" 
              referrerPolicy="no-referrer"
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                pointerEvents: 'none', 
                zIndex: 0 
              }}
            />
          )}

          {/* Dynamic Template Ornaments / Borders */}
          {activeStyle === 'navy-gold' && (
            <>
              <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', bottom: '16px', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', bottom: '24px', border: '3px solid rgba(245, 158, 11, 0.6)', borderRadius: '8px', pointerEvents: 'none' }} />
            </>
          )}

          {activeStyle === 'white-green' && (
            <>
              <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', bottom: '16px', border: '1px solid rgba(6, 95, 70, 0.2)', borderRadius: '12px', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', bottom: '24px', border: '3px solid rgba(6, 95, 70, 0.4)', borderRadius: '8px', pointerEvents: 'none' }} />
            </>
          )}

          {activeStyle === 'blue-white' && (
            <>
              <div style={{ position: 'absolute', top: '16px', left: '16px', width: '36px', height: '36px', borderTop: '3px solid #2563eb', borderLeft: '3px solid #2563eb', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', width: '36px', height: '36px', borderBottom: '3px solid #2563eb', borderLeft: '3px solid #2563eb', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '16px', right: '16px', width: '36px', height: '36px', borderTop: '3px solid #2563eb', borderRight: '3px solid #2563eb', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '36px', height: '36px', borderBottom: '3px solid #2563eb', borderRight: '3px solid #2563eb', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', bottom: '24px', border: '1px solid rgba(37, 99, 235, 0.1)', borderRadius: '4px', pointerEvents: 'none' }} />
            </>
          )}

          {activeStyle === 'maroon-stone' && (
            <>
              <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', bottom: '16px', border: '1px solid rgba(127, 29, 29, 0.1)', borderRadius: '12px', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', bottom: '24px', border: '3px solid rgba(127, 29, 29, 0.35)', borderRadius: '8px', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '32px', left: '32px', right: '32px', bottom: '32px', border: '1px solid rgba(127, 29, 29, 0.15)', pointerEvents: 'none' }} />
            </>
          )}

          {activeStyle === 'black-gold' && (
            <>
              <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', bottom: '16px', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: '12px', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', bottom: '24px', border: '3px solid rgba(245, 158, 11, 0.4)', borderRadius: '8px', pointerEvents: 'none' }} />
            </>
          )}

          {activeStyle === 'cream-brown' && (
            <>
              <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', bottom: '16px', border: '1px solid rgba(120, 53, 15, 0.1)', borderRadius: '12px', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', bottom: '24px', border: '3px solid rgba(120, 53, 15, 0.25)', borderRadius: '8px', pointerEvents: 'none' }} />
            </>
          )}

          {activeStyle === 'custom' && !imageUrl && (
            <>
              <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', bottom: '16px', border: `2px solid ${selectedTemplate.borderColor || '#f97316'}`, borderRadius: '8px', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', bottom: '24px', border: `1px solid ${(selectedTemplate.borderColor || '#f97316')}40`, borderRadius: '4px', pointerEvents: 'none' }} />
            </>
          )}

          {/* Header Section */}
          <div className="z-10 relative" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
            <span 
              className="block font-mono font-bold uppercase tracking-widest" 
              style={{ fontSize: '13px', color: tStyle.primaryColor, letterSpacing: '4px' }}
            >
              EventSnap Automation
            </span>
            <h4 
              className="block uppercase tracking-wider"
              style={{ 
                fontSize: '18px', 
                color: tStyle.secondaryColor, 
                letterSpacing: '2px',
                margin: 0,
                fontWeight: 600,
                fontFamily: tStyle.fontFamily
              }}
            >
              {tStyle.title}
            </h4>
          </div>

          {/* Core Dynamic Content */}
          <div className="z-10 relative" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', width: '100%' }}>
            <span className="block italic" style={{ fontSize: '15px', color: tStyle.mutedColor }}>
              {tStyle.subtitle}
            </span>
            
            <h2 
              id="print-participant-name"
              className="font-bold tracking-wide"
              style={{ 
                fontSize: '48px',
                color: activeStyle === 'custom' && imageUrl ? '#1e3a8a' : tStyle.textColor,
                fontFamily: tStyle.fontFamily,
                margin: '12px 0',
                lineHeight: '1.2'
              }}
            >
              {participants[previewIndex]?.nama || 'Dr. Budi Santoso, M.Kom'}
            </h2>
            
            <div className="mx-auto" style={{ width: '200px', height: '2px', backgroundColor: tStyle.primaryColor, opacity: 0.6 }} />
            
            <p className="max-w-3xl mx-auto leading-relaxed" style={{ fontSize: '16px', color: tStyle.textColor, opacity: 0.85, margin: 0 }}>
              {tStyle.description}
            </p>

            <p className="font-mono" style={{ fontSize: '14px', color: tStyle.mutedColor, margin: '8px 0 0 0' }}>
              Delegasi resmi: <strong id="print-participant-instansi" style={{ color: tStyle.textColor }}>{participants[previewIndex]?.asalInstansi || 'UIN Syarif Hidayatullah Jakarta'}</strong>
            </p>
          </div>

          {/* Foot Signatures */}
          <div className="z-10 relative" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', width: '100%', padding: '0 48px', marginBottom: '16px' }}>
            {/* Left signature */}
            <div style={{ textAlign: 'left', width: '220px' }}>
              <div style={{ height: '50px' }} /> {/* Space for signature */}
              <div style={{ width: '100%', height: '1px', backgroundColor: tStyle.mutedColor, opacity: 0.3, marginBottom: '6px' }} />
              <span className="block font-bold" style={{ fontSize: '11px', color: tStyle.mutedColor, letterSpacing: '1px', textTransform: 'uppercase' }}>Instansi / Penandatangan</span>
              <span style={{ fontSize: '13px', color: tStyle.textColor, fontWeight: 600 }}>{tStyle.signLeft}</span>
            </div>
            
            {/* Center seal */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div 
                style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  border: `2px solid ${tStyle.sealBorder}`, 
                  backgroundColor: tStyle.sealBg, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxSizing: 'border-box'
                }}
              >
                <div 
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    border: `1.5px dashed ${tStyle.sealBorder}`,
                    opacity: 0.8
                  }} 
                />
              </div>
              <span className="block" style={{ fontSize: '10px', color: tStyle.mutedColor, marginTop: '8px', fontStyle: 'italic' }}>EventSnap Seal</span>
            </div>
            
            {/* Right signature / credential info */}
            <div style={{ textAlign: 'right', width: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'end' }}>
              <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                <span className="block font-bold" style={{ fontSize: '9px', color: tStyle.mutedColor, letterSpacing: '1px' }}>ID KREDENSIAL</span>
                <span id="print-participant-credential" style={{ fontSize: '12px', color: tStyle.primaryColor, fontWeight: 700, fontFamily: 'monospace' }}>
                  {participants[previewIndex]?.nomorSertifikat || 'REG-2026-001'}
                </span>
              </div>
              <div style={{ width: '100%', height: '1px', backgroundColor: tStyle.mutedColor, opacity: 0.3, marginBottom: '6px' }} />
              <span className="block font-bold" style={{ fontSize: '11px', color: tStyle.mutedColor, letterSpacing: '1px', textTransform: 'uppercase' }}>Otoritas Resmi</span>
              <span style={{ fontSize: '13px', color: tStyle.textColor, fontWeight: 600 }}>{tStyle.signRight}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
