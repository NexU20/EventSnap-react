import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ParticipantData } from '../types';

// Interface untuk data peserta dari Langkah 2
export interface Participant {
  id: string;
  nama: string;
  email: string;
  asalInstansi: string;
  nomorSertifikat?: string;
  tanggalKegiatan?: string;
}

// Interface untuk konfigurasi koordinat dan styling teks Langkah 3
export interface MappingConfig {
  field: string; // nama, email, asalInstansi, nomorSertifikat, dll
  x: number;
  y: number;
  fontSize: number;
  fontColor: string;
  fontFamily: string;
}

// Interface utama untuk Certificate Context State
interface CertificateContextType {
  currentStep: number;
  selectedFile: File | string | null;
  participants: ParticipantData[];
  mappingConfig: MappingConfig[];
  
  // Setters
  setCurrentStep: (step: number) => void;
  setSelectedFile: (file: File | string | null) => void;
  setParticipants: (participants: ParticipantData[]) => void;
  setMappingConfig: (config: MappingConfig[]) => void;
  
  // Helper functions
  resetContext: () => void;
}

// Inisialisasi default Context
const CertificateContext = createContext<CertificateContextType | undefined>(undefined);

// Provider Component
export function CertificateProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedFile, setSelectedFile] = useState<File | string | null>(null);
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [mappingConfig, setMappingConfig] = useState<MappingConfig[]>([
    { field: 'nama', x: 400, y: 300, fontSize: 32, fontColor: '#c2662c', fontFamily: 'serif' },
    { field: 'email', x: 400, y: 380, fontSize: 16, fontColor: '#2d2722', fontFamily: 'sans-serif' },
    { field: 'nomorSertifikat', x: 400, y: 150, fontSize: 12, fontColor: '#888888', fontFamily: 'mono' }
  ]);

  const resetContext = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setParticipants([]);
    setMappingConfig([
      { field: 'nama', x: 400, y: 300, fontSize: 32, fontColor: '#c2662c', fontFamily: 'serif' },
      { field: 'email', x: 400, y: 380, fontSize: 16, fontColor: '#2d2722', fontFamily: 'sans-serif' },
      { field: 'nomorSertifikat', x: 400, y: 150, fontSize: 12, fontColor: '#888888', fontFamily: 'mono' }
    ]);
  };

  return (
    <CertificateContext.Provider
      value={{
        currentStep,
        selectedFile,
        participants,
        mappingConfig,
        setCurrentStep,
        setSelectedFile,
        setParticipants,
        setMappingConfig,
        resetContext,
      }}
    >
      {children}
    </CertificateContext.Provider>
  );
}

// Custom hook untuk mempermudah akses Context di komponen anak
export function useCertificate() {
  const context = useContext(CertificateContext);
  if (context === undefined) {
    throw new Error('useCertificate harus digunakan di dalam CertificateProvider');
  }
  return context;
}
