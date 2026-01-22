
import React, { useState } from 'react';
import { Mail, Lock, LogIn, ShieldCheck, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1200);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side: Hero */}
      <div className="hidden lg:flex w-1/2 bg-blue-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
          {/* Decorative mesh/grid could go here */}
        </div>
        <div className="relative z-10 p-12 text-white">
          <div className="w-16 h-16 bg-white rounded-2xl mb-8 flex items-center justify-center">
            <span className="text-blue-900 font-bold text-3xl">NI</span>
          </div>
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Pusat Data Hilirisasi <br /> <span className="text-blue-400">Industri Nasional</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-lg mb-12">
            Akses data strategis ekspor-impor komoditas olahan dan analisis kebijakan industri dalam satu platform terpadu.
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <p className="text-3xl font-bold mb-1">US$ 33M+</p>
              <p className="text-sm text-blue-200">Nilai Tambah Ekspor</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <p className="text-3xl font-bold mb-1">12+</p>
              <p className="text-sm text-blue-200">Sektor Strategis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="w-full lg:w-1/2 bg-slate-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="relative text-center mb-10">
            <button 
              onClick={onBack} 
              className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 bg-slate-200/50 hover:bg-slate-200 rounded-full transition-colors"
            >
              <ArrowLeft className="text-slate-600" size={20} />
            </button>
            <div className="lg:hidden flex justify-center mb-6">
              <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center text-white">
                <span className="font-bold text-xl">NI</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Selamat Datang</h2>
            <p className="text-slate-500">Silakan masuk ke akun Nusantara Industries Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nusantaraindustries.com"
                  className="w-full bg-white border border-slate-200 rounded-xl px-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-semibold text-slate-700">Kata Sandi</label>
                <a href="#" className="text-xs text-blue-600 hover:underline font-medium">Lupa sandi?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-xl px-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <input type="checkbox" id="remember" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="remember" className="text-sm text-slate-600">Ingat perangkat ini</label>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  Masuk Sekarang
                </>
              )}
            </button>
          </form>

          <div className="mt-10 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-4">
            <ShieldCheck className="text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-900 mb-1">Akses Publik Terbatas</p>
              <p className="text-xs text-emerald-700/80 leading-relaxed">
                Platform ini dilindungi oleh standar keamanan nasional. Semua aktivitas pengguna dipantau untuk menjaga kerahasiaan data industri strategis.
              </p>
            </div>
          </div>

          <p className="text-center mt-8 text-slate-400 text-sm">
            Belum punya akun? <a href="#" className="text-blue-600 font-bold hover:underline">Hubungi Admin Hub</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
