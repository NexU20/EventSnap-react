import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Terjadi kesalahan. Silakan coba lagi.');
      }

      if (isLogin) {
        setSuccess('Login berhasil! Mengalihkan...');
        setTimeout(() => {
          onSuccess(data.data);
          onClose();
        }, 1000);
      } else {
        setSuccess('Pendaftaran berhasil! Silakan masuk.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Koneksi ke server gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-fade-in" id="auth-modal-overlay">
      <div 
        className="relative bg-brand-cream border border-brand-border/60 rounded-2xl w-full max-w-md p-8 shadow-2xl animate-scale-up"
        id="auth-modal-container"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-charcoal/50 hover:text-brand-charcoal p-1.5 rounded-lg hover:bg-brand-border/20 transition-colors"
          id="auth-modal-close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <img 
            src="/logo-eventsnap.png" 
            alt="EventSnap Logo" 
            className="w-12 h-12 object-contain mx-auto mb-3 rounded-xl"
            referrerPolicy="no-referrer"
          />
          <h3 className="text-xl font-bold text-brand-charcoal tracking-tight font-sans">
            {isLogin ? 'Masuk ke EventSnap' : 'Daftar Akun EventSnap'}
          </h3>
          <p className="text-xs text-brand-charcoal/60 mt-1">
            {isLogin ? 'Kelola sertifikat dan klaim kuota harian gratis Anda.' : 'Buat akun gratis dan dapatkan kuota 50 dokumen/hari.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/70 border border-brand-border/40 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              isLogin 
                ? 'bg-brand-orange text-white shadow-sm' 
                : 'text-brand-charcoal/60 hover:text-brand-charcoal'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              !isLogin 
                ? 'bg-brand-orange text-white shadow-sm' 
                : 'text-brand-charcoal/60 hover:text-brand-charcoal'
            }`}
          >
            Daftar
          </button>
        </div>

        {/* Error / Success feedback */}
        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3.5 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-brand-charcoal/80" htmlFor="auth-name">Nama Lengkap</label>
              <div className="relative bg-white border border-brand-border rounded-xl px-3 py-2.5 flex items-center gap-2.5 focus-within:border-brand-orange/50 transition-colors">
                <User className="w-4 h-4 text-brand-charcoal/40" />
                <input
                  id="auth-name"
                  type="text"
                  placeholder="Nama Lengkap Anda"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent border-none text-xs text-brand-charcoal placeholder-brand-charcoal/40 focus:outline-none w-full"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-brand-charcoal/80" htmlFor="auth-email">Alamat Email</label>
            <div className="relative bg-white border border-brand-border rounded-xl px-3 py-2.5 flex items-center gap-2.5 focus-within:border-brand-orange/50 transition-colors">
              <Mail className="w-4 h-4 text-brand-charcoal/40" />
              <input
                id="auth-email"
                type="email"
                placeholder="contoh@domain.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none text-xs text-brand-charcoal placeholder-brand-charcoal/40 focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-brand-charcoal/80" htmlFor="auth-password">Kata Sandi</label>
            <div className="relative bg-white border border-brand-border rounded-xl px-3 py-2.5 flex items-center gap-2.5 focus-within:border-brand-orange/50 transition-colors">
              <Lock className="w-4 h-4 text-brand-charcoal/40" />
              <input
                id="auth-password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-none text-xs text-brand-charcoal placeholder-brand-charcoal/40 focus:outline-none w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold text-sm py-3 rounded-xl transition-all shadow-md shadow-brand-orange/15 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Memproses...' : isLogin ? 'Masuk Sekarang' : 'Daftar Akun'}
          </button>
        </form>
      </div>
    </div>
  );
}
