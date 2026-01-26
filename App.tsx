
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import InfoCenter from '@/components/InfoCenter';
import AIConsultant from '@/components/AIConsultant';
import Login from '@/components/Login';
import LandingPage from '@/components/LandingPage';
import PohonIndustri from '@/components/PohonIndustri';
import { Page } from '@/types';
import { Bell, Search, User, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Landing);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentPage(Page.Dashboard);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage(Page.Landing);
  };

  const goToLogin = () => {
    setCurrentPage(Page.Login);
  };

  const startTracking = () => {
    if (isLoggedIn) {
      setCurrentPage(Page.Dashboard);
    } else {
      setCurrentPage(Page.Login);
    }
  };

  if (currentPage === Page.Landing) {
    return <LandingPage onStartTracking={startTracking} onLogin={goToLogin} />;
  }

  if (currentPage === Page.Login) {
    return <Login onLogin={handleLoginSuccess} onGoToDashboard={() => setCurrentPage(Page.Dashboard)} />;
  }

  const renderContent = () => {
    switch (currentPage) {
      case Page.Dashboard:
        return <Dashboard setPage={setCurrentPage} />;
      case Page.PohonIndustri:
        return <PohonIndustri setPage={setCurrentPage} />;
      case Page.ExportImport:
        return (
          <div className="space-y-8">
             <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Database Komoditas</h1>
                <p className="text-slate-500 font-medium">Pelacakan mendalam per rantai pasok industri.</p>
              </div>
            </div>
            <div className="p-20 bg-white rounded-[40px] text-center border-2 border-dashed border-slate-200 shadow-sm">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Globe size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Integrasi API BPS Sedang Berlangsung</h2>
              <p className="text-slate-500 max-w-lg mx-auto font-medium leading-relaxed">
                Kami sedang mensinkronisasi database Nusantara Industries dengan server real-time BPS & Pusdatin ESDM untuk menyediakan visualisasi yang akurat.
              </p>
              <button
                onClick={() => setCurrentPage(Page.AIConsultant)}
                className="mt-10 bg-blue-900 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/10"
              >
                Tanya AI Konsultan
              </button>
            </div>
          </div>
        );
      case Page.InfoCenter:
        return <InfoCenter />;
      case Page.AIConsultant:
        return <AIConsultant />;
      default:
        return <Dashboard setPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        currentPage={currentPage}
        setPage={setCurrentPage}
        onLogout={handleLogout}
      />

      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40 px-10 flex items-center justify-between">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cari regulasi, proyek, atau komoditas..."
              className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-2.5 pl-12 pr-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-8">
            <button className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell size={22} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-10 w-px bg-slate-200"></div>
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 leading-none group-hover:text-blue-600 transition-colors">Budi Santoso</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Analis Utama</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20 border-2 border-white overflow-hidden">
                <User size={24} />
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-[1600px] w-full mx-auto flex-1">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
