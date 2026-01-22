
import React, { useState } from 'react';
import { 
  ArrowRight, 
  ChevronRight, 
  Search, 
  TrendingUp, 
  Factory, 
  Globe, 
  ShieldCheck, 
  Activity,
  ArrowUpRight,
  X,
  Target,
  BarChart3
} from 'lucide-react';
import { COMMODITIES, PSN_PROJECTS } from '../constants.tsx';
import { CommodityData } from '../types.ts';

interface LandingPageProps {
  onStartTracking: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartTracking, onLogin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityData | null>(null);

  const filteredCommodities = COMMODITIES.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar - Benar-benar hanya Portal Login */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-900 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
            <span className="text-white font-extrabold text-sm tracking-tighter">NI</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-blue-900">Nusantara Industries</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-slate-500">
          <a href="#beranda" className="hover:text-blue-600 transition-colors">Beranda</a>
          <a href="#tracking" className="hover:text-blue-600 transition-colors">Data Tracking</a>
          <a href="#tentang" className="hover:text-blue-600 transition-colors">Tentang Hilirisasi</a>
        </div>

        <div className="flex items-center">
          <button 
            onClick={onLogin}
            className="bg-blue-900 text-white px-8 py-2.5 rounded-full text-sm font-bold hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 active:scale-95 whitespace-nowrap"
          >
            Portal Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="beranda" className="relative pt-40 pb-24 px-6 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 opacity-40">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-200/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-blue-100 text-blue-700 text-[11px] font-extrabold mb-8 shadow-sm tracking-widest uppercase">
            <ShieldCheck size={14} className="animate-pulse" />
            MASA DEPAN INDUSTRI INDONESIA
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-slate-900 mb-8 tracking-tighter leading-[1.05] max-w-5xl">
            PUSAT DATA & PELACAKAN <br />
            <span className="text-gradient">HILIRISASI INDONESIA</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mb-12 leading-relaxed font-medium">
            Platform intelijen industri nasional untuk monitoring nilai tambah komoditas strategis secara transparan dan data-driven.
          </p>
          <div className="flex flex-col sm:flex-row gap-5">
            <button 
              onClick={() => document.getElementById('tracking')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-5 bg-blue-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-800 transition-all shadow-2xl shadow-blue-900/30 group"
            >
              Mulai Melacak Data
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => document.getElementById('tentang')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-5 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:border-blue-200 hover:text-blue-900 transition-all shadow-sm"
            >
              Pelajari Fungsi Hilirisasi
            </button>
          </div>
        </div>
      </section>

      {/* Stats, Tracking, etc. (Tetap sama seperti kode sebelumnya) */}
      <section id="tracking" className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          {/* ... sisa konten landing page ... */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Katalog Hilirisasi</h2>
            <p className="text-slate-500">Pilih komoditas untuk melihat data ekspor-impor.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredCommodities.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedCommodity(item)}
                className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-blue-500 hover:bg-white hover:shadow-2xl transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-white text-blue-900 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-blue-900 group-hover:text-white transition-colors">
                   <Factory size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.name}</h3>
                <p className="text-slate-500 text-xs mb-6 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between font-bold text-blue-900 text-xs">
                  LIHAT DATA
                  <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commodity Detail Modal */}
      {selectedCommodity && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl relative p-12">
            <button onClick={() => setSelectedCommodity(null)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full">
              <X size={24} />
            </button>
            <h2 className="text-3xl font-black mb-6">{selectedCommodity.name}</h2>
            <p className="text-slate-500 mb-8">{selectedCommodity.description}</p>
            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="bg-blue-50 p-6 rounded-3xl">
                  <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Ekspor Olahan</p>
                  <p className="text-2xl font-black">US$ {selectedCommodity.exportValue}B</p>
               </div>
               <div className="bg-slate-50 p-6 rounded-3xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Impor Turunan</p>
                  <p className="text-2xl font-black">US$ {selectedCommodity.importValue}B</p>
               </div>
            </div>
            <button onClick={onLogin} className="w-full py-4 bg-blue-900 text-white rounded-2xl font-bold">Akses Data Detail</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
