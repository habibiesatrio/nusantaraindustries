import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth'; // SSoT
import { auth } from './services/firebase';

import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import InfoCenter from '@/components/InfoCenter';
import AIConsultant from '@/components/AIConsultant';
import Login from '@/components/Login';
import LandingPage from '@/components/LandingPage';
import PohonIndustri from '@/components/PohonIndustri';
import InputNodePage from '@/components/InputNodePage'; 
import DataManagement from '@/components/DataManagement';
import { Search, User, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. GUNAKAN REACT STATE (Bukan variabel statis)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // 2. FIREBASE AUTH OBSERVER (Enterprise Standard)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        sessionStorage.setItem('isLoggedIn', 'true');
      } else {
        setIsLoggedIn(false);
        sessionStorage.clear();
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    sessionStorage.clear();
    navigate('/');
  };

  const isAuthPage = location.pathname === '/' || location.pathname === '/login';

  // Loading state agar tidak ada "flicker" saat cek status login
  if (checkingAuth) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-900 animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Verifying Credentials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {!isAuthPage && <Sidebar onLogout={handleLogout} />}
      
      <main className={`flex-1 flex flex-col ${!isAuthPage ? 'ml-64' : ''}`}>
        {!isAuthPage && (
          <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40 px-10 flex items-center justify-between">
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="text" placeholder="Cari data industri..." className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-2.5 px-12 text-sm font-bold" />
            </div>
            <div className="flex items-center gap-4 group cursor-pointer">
               <div className="text-right">
                  <p className="text-sm font-black text-slate-900 leading-none">Analis Nusantara</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Authorized Access</p>
               </div>
               <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg border-2 border-white overflow-hidden">
                  <User size={24} />
               </div>
            </div>
          </header>
        )}

        <div className={`flex-1 ${!isAuthPage ? 'p-10' : ''} ${location.pathname === '/pohon-industri' ? '!p-0' : ''}`}>
          <Routes>
            <Route path="/" element={
              <LandingPage 
                onStartTracking={() => navigate(isLoggedIn ? '/dashboard' : '/login')} 
                onLogin={() => navigate('/login')} 
              />
            } />
            
            <Route path="/login" element={
              <Login 
                onLogin={() => setIsLoggedIn(true)} 
                onGoToDashboard={() => navigate('/dashboard')} 
              />
            } />

            {/* STRICT PROTECTED ROUTES */}
            <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" replace />} />
            <Route path="/pohon-industri" element={isLoggedIn ? <PohonIndustri /> : <Navigate to="/login" replace />} />
            <Route path="/input-node" element={isLoggedIn ? <InputNodePage /> : <Navigate to="/login" replace />} />
            <Route path="/ai-consultant" element={isLoggedIn ? <AIConsultant /> : <Navigate to="/login" replace />} />
            <Route path="/info-center" element={isLoggedIn ? <InfoCenter /> : <Navigate to="/login" replace />} />
            <Route path="/data-management" element={isLoggedIn ? <DataManagement /> : <Navigate to="/login" replace />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;