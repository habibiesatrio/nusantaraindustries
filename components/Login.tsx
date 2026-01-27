import React, { useState } from 'react';
import { Mail, Lock, LogIn, ShieldCheck, LayoutDashboard, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Firebase Imports
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, rtdb } from '../services/firebase'; 

interface LoginProps {
  onLogin: () => void;
  onGoToDashboard: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onGoToDashboard }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // IMPLEMENTASI FUNGSI LOGIN FIREBASE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (email && password) {
      setLoading(true);
      try {
        // 1. Auth Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Ambil Data Tambahan dari RTDB
        const userRef = ref(rtdb, 'users/' + user.uid);
        const snapshot = await get(userRef);

        let combinedUser = {};
        
        if (snapshot.exists()) {
          const userData = snapshot.val();
          combinedUser = { ...user, ...userData };
          console.log("Storing combined user data:", combinedUser);
        } else {
          combinedUser = user;
          console.log("No extra data in RTDB, using basic profile.");
        }

        // 3. Simpan di Session & Navigasi
        sessionStorage.setItem('user', JSON.stringify(combinedUser));
        sessionStorage.setItem('isLoggedIn', 'true');
        
        onLogin(); // Trigger callback ke App.tsx
        navigate('/dashboard');

      } catch (error: any) {
        console.error("Error signing in: ", error);
        setMessage('Email atau password salah, atau terjadi gangguan koneksi.');
      } finally {
        setLoading(false);
      }
    } else {
      setMessage('Harap isi email dan password.');
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left side: Hero (Visual Analysis) */}
      <div className="hidden lg:flex w-1/2 bg-blue-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 p-12 text-white">
          <div className="w-16 h-16 bg-white rounded-2xl mb-8 flex items-center justify-center shadow-2xl">
            <span className="text-blue-900 font-black text-3xl">NI</span>
          </div>
          <h1 className="text-5xl font-extrabold mb-6 leading-tight tracking-tighter">
            Pusat Data Hilirisasi <br /> <span className="text-blue-400">Industri Nasional</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-lg mb-12 font-medium">
            Akses data strategis ekspor-impor komoditas olahan dan analisis kebijakan industri dalam satu platform terpadu.
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">
              <p className="text-3xl font-black mb-1">US$ 33M+</p>
              <p className="text-xs font-bold text-blue-300 uppercase tracking-widest">Nilai Tambah Ekspor</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">
              <p className="text-3xl font-black mb-1">12+</p>
              <p className="text-xs font-bold text-blue-300 uppercase tracking-widest">Sektor Strategis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Form (Authentication) */}
      <div className="w-full lg:w-1/2 bg-slate-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="relative text-center mb-10">
            <button 
              onClick={onGoToDashboard} 
              className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center px-4 h-12 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-all shadow-sm group"
            >
              <LayoutDashboard className="text-slate-400 group-hover:text-blue-600 transition-colors" size={20} />
              <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Guest View</span>
            </button>
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Otentikasi Portal</h2>
            <p className="text-slate-500 font-medium">Sistem Monitoring Industri Terpadu</p>
          </div>

          {/* Alert Error Message */}
          {message && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle size={20} />
              <p className="text-xs font-black uppercase tracking-tight">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kredensial Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analis@nusantaraindustries.com"
                  className="w-full bg-white border border-slate-200 rounded-2xl px-12 py-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-sm font-bold shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Akses Kata Sandi</label>
                <a href="#" className="text-[10px] text-blue-600 hover:underline font-black uppercase tracking-widest">Reset Sandi?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-2xl px-12 py-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-sm font-bold shadow-inner"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white rounded-[1.5rem] py-5 font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-blue-800 transition-all shadow-2xl shadow-blue-900/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} /> Masuk Portal Keamanan
                </>
              )}
            </button>
          </form>

          <div className="mt-10 p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex gap-4">
            <ShieldCheck className="text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-black text-emerald-900 mb-1 uppercase tracking-widest">Protocol Keamanan Aktif</p>
              <p className="text-[10px] text-emerald-700 font-bold leading-relaxed uppercase opacity-70">
                Data industri ini bersifat strategis. Aktivitas Anda dilindungi enkripsi AES-256 dan login dipantau secara berkala.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;