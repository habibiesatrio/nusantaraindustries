
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
  Info,
  X,
  Target,
  BarChart3
} from 'lucide-react';
import { COMMODITIES, PSN_PROJECTS } from '@/constants';
import { CommodityData } from '@/types';

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
      {/* Navbar */}
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
        <div className="flex items-center gap-4">
          <button 
            onClick={onLogin}
            className="text-sm font-bold text-blue-900 hover:text-blue-700 transition-colors"
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

      {/* Macro Stats */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-xl">
              <h2 className="text-blue-600 font-black text-xs uppercase tracking-[0.3em] mb-4">Macro Economic Overview</h2>
              <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">Tinjauan Makro Ekonomi Nasional</h3>
            </div>
            <div className="flex gap-4">
              <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">UPDATE MEI 2024</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-10 rounded-[32px] border border-slate-100 flex flex-col justify-between group hover:bg-white hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500">
              <div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 mb-6 shadow-sm">
                   <Globe size={24} />
                </div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">Total Surplus Perdagangan</p>
                <h4 className="text-4xl font-black text-slate-900 tracking-tighter">US$ 36.91B</h4>
              </div>
              <div className="mt-10 flex items-center gap-2 text-emerald-600 font-black text-sm">
                <ArrowUpRight size={20} />
                +12.4% TAHUNAN
              </div>
            </div>

            <div className="bg-slate-50 p-10 rounded-[32px] border border-slate-100 flex flex-col justify-between group hover:bg-white hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500">
              <div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 mb-6 shadow-sm">
                   <Target size={24} />
                </div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">Proyek Hilirisasi Aktif (PSN)</p>
                <h4 className="text-4xl font-black text-slate-900 tracking-tighter">214 UNIT</h4>
              </div>
              <div className="mt-10 flex items-center gap-2 text-blue-600 font-black text-sm">
                <Activity size={20} />
                88% SESUAI JADWAL
              </div>
            </div>

            <div className="bg-blue-900 p-10 rounded-[32px] shadow-2xl shadow-blue-900/30 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-800 rounded-2xl flex items-center justify-center text-blue-200 mb-6 shadow-sm">
                   <TrendingUp size={24} />
                </div>
                <p className="text-blue-300 text-sm font-bold uppercase tracking-widest mb-2">Pangsa Pasar Global</p>
                <h4 className="text-4xl font-black tracking-tighter">38.2%</h4>
                <p className="mt-2 text-blue-400 text-xs font-bold">KOMODITAS NIKEL OLAHAN</p>
              </div>
              <div className="mt-10 h-16 flex items-end gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                 {[30, 50, 40, 70, 60, 90, 85].map((h, i) => (
                   <div key={i} className="flex-1 bg-white rounded-t-md" style={{ height: `${h}%` }}></div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tracking Search Section */}
      <section id="tracking" className="py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Tracking Hilirisasi Komoditas</h2>
            <p className="text-slate-500 text-lg font-medium">Monitor data real-time ekspor, impor, dan perkembangan rantai pasok industri hilir Indonesia.</p>
          </div>

          <div className="relative max-w-4xl mx-auto mb-24">
            <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none">
              <Search className="text-slate-400" size={28} />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari komoditas (Nikel, Bauksit, Tembaga...)"
              className="block w-full bg-white border-2 border-slate-100 rounded-[32px] py-8 pl-20 pr-10 focus:outline-none focus:border-blue-500 transition-all text-xl font-medium shadow-2xl shadow-slate-200/40"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredCommodities.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedCommodity(item)}
                className="bg-white rounded-[32px] p-8 border border-slate-100 hover:border-blue-500 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              >
                <div className="w-14 h-14 bg-slate-50 text-blue-900 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-900 group-hover:text-white transition-colors duration-300">
                   <Factory size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{item.name}</h3>
                <p className="text-slate-500 text-sm mb-8 line-clamp-2 leading-relaxed font-medium">{item.description}</p>
                <div className="flex items-center justify-between font-bold text-blue-900 text-sm group-hover:translate-x-1 transition-transform">
                  DATA LENGKAP
                  <ChevronRight size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Hilirisasi / PSN */}
      <section id="tentang" className="py-32 bg-blue-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-900/30 skew-x-12 translate-x-32"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2">
            <div className="inline-block px-5 py-2 rounded-full bg-blue-800 text-blue-200 text-xs font-black mb-8 tracking-widest uppercase">
              Visi Indonesia 2045
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-10 leading-[1.1] tracking-tighter">Mengapa hilirisasi adalah kunci?</h2>
            <p className="text-blue-200/80 text-xl mb-12 leading-relaxed font-medium">
              Transformasi ekonomi nasional bergantung pada kemampuan kita mengubah kekayaan alam menjadi kekuatan industri bernilai tambah tinggi, demi kedaulatan ekonomi jangka panjang.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="space-y-4">
                 <div className="w-14 h-14 bg-blue-800 rounded-2xl flex items-center justify-center">
                    <TrendingUp size={28} className="text-blue-300" />
                 </div>
                 <h4 className="font-extrabold text-xl">Nilai Tambah Tinggi</h4>
                 <p className="text-blue-300/60 text-sm leading-relaxed">Ekspor produk olahan memiliki nilai jual hingga 20x lipat dibanding ore mentah.</p>
              </div>
              <div className="space-y-4">
                 <div className="w-14 h-14 bg-blue-800 rounded-2xl flex items-center justify-center">
                    <ShieldCheck size={28} className="text-blue-300" />
                 </div>
                 <h4 className="font-extrabold text-xl">Resiliensi Ekonomi</h4>
                 <p className="text-blue-300/60 text-sm leading-relaxed">Memperkuat cadangan devisa dan menyeimbangkan neraca perdagangan nasional.</p>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 w-full">
            <div className="bg-white/10 backdrop-blur-3xl border border-white/10 p-12 rounded-[48px] shadow-3xl">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="font-black text-2xl tracking-tight">Proyek Strategis Nasional</h3>
                 <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse">LIVE TRACKING</span>
              </div>
              <div className="space-y-8">
                {PSN_PROJECTS.map((psn, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between text-sm mb-3">
                      <div>
                         <p className="font-black group-hover:text-blue-300 transition-colors">{psn.name}</p>
                         <p className="text-xs text-blue-400/70 font-bold uppercase tracking-tighter">{psn.region} • {psn.status}</p>
                      </div>
                      <span className="font-black text-blue-200">{psn.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-blue-900/50 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.5)] transition-all duration-1000" 
                         style={{ width: `${psn.progress}%` }}
                       ></div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={onStartTracking}
                className="w-full mt-12 py-5 bg-white text-blue-900 rounded-[20px] font-black hover:bg-blue-50 transition-all flex items-center justify-center gap-2 tracking-tight group"
              >
                LIHAT SEMUA DATA PROYEK
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-20 px-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
           <div className="max-w-xs">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-xs">NI</span>
                </div>
                <span className="font-black text-white text-lg tracking-tighter">Nusantara Industries</span>
              </div>
              <p className="text-sm leading-relaxed font-medium">Pusat data hilirisasi nasional. Mengawal transformasi ekonomi Indonesia melalui intelijen industri.</p>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
              <div className="space-y-4">
                 <h5 className="text-white font-bold text-xs uppercase tracking-widest">Platform</h5>
                 <ul className="text-sm space-y-2">
                    <li><a href="#" className="hover:text-white transition-colors">Data Tracking</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">PSN Map</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Commodities</a></li>
                 </ul>
              </div>
              <div className="space-y-4">
                 <h5 className="text-white font-bold text-xs uppercase tracking-widest">Resources</h5>
                 <ul className="text-sm space-y-2">
                    <li><a href="#" className="hover:text-white transition-colors">Report BPS</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">ESDM Center</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                 </ul>
              </div>
              <div className="space-y-4">
                 <h5 className="text-white font-bold text-xs uppercase tracking-widest">Legal</h5>
                 <ul className="text-sm space-y-2">
                    <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                 </ul>
              </div>
           </div>
        </div>
        <div className="max-w-7xl mx-auto pt-10 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest">
           <p>© 2024 NUSANTARA INDUSTRIES. ALL RIGHTS RESERVED.</p>
           <div className="flex gap-8">
              <a href="#" className="hover:text-white">Twitter</a>
              <a href="#" className="hover:text-white">LinkedIn</a>
           </div>
        </div>
      </footer>

      {/* Commodity Detail Modal */}
      {selectedCommodity && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl rounded-[48px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500 border border-slate-100">
            <button 
              onClick={() => setSelectedCommodity(null)}
              className="absolute top-8 right-8 p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all z-10"
            >
              <X size={28} />
            </button>
            <div className="p-16 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-5 mb-10">
                <div className="p-5 bg-blue-50 text-blue-600 rounded-3xl shadow-sm border border-blue-100">
                  <Factory size={40} />
                </div>
                <div>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{selectedCommodity.name}</h2>
                  <p className="text-blue-600 font-extrabold text-xs uppercase tracking-widest mt-1">Industrial Intelligence Tracking</p>
                </div>
              </div>

              <p className="text-slate-600 text-lg mb-12 leading-relaxed font-medium">
                {selectedCommodity.description}
              </p>

              <div className="grid grid-cols-2 gap-8 mb-16">
                <div className="bg-blue-900 p-8 rounded-[32px] text-white shadow-xl shadow-blue-900/20">
                  <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-2">Total Ekspor Olahan</p>
                  <p className="text-4xl font-black tracking-tighter">US$ {selectedCommodity.exportValue}B</p>
                  <div className="mt-4 flex items-center gap-1 text-emerald-400 text-xs font-bold">
                    <ArrowUpRight size={14} /> +24% YOY
                  </div>
                </div>
                <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Impor Barang Turunan</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter">US$ {selectedCommodity.importValue}B</p>
                  <div className="mt-4 flex items-center gap-1 text-rose-500 text-xs font-bold">
                    <Activity size={14} /> DEFISIT TERUKUR
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                  <BarChart3 size={20} className="text-blue-600" />
                  RANTAI NILAI HILIRISASI (NILAI TAMBAH)
                </h4>
                <div className="space-y-4">
                  {selectedCommodity.derivatives.map((der, i) => (
                    <div key={i} className="flex items-center gap-6 group">
                       <div className="w-1.5 h-16 bg-blue-100 rounded-full group-hover:bg-blue-900 transition-colors"></div>
                       <div className="flex-1 flex justify-between items-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <div>
                             <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{der.level}</p>
                             <p className="text-lg font-black text-slate-900 tracking-tight">{der.product}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Impact</p>
                             <span className="inline-block px-4 py-1 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full uppercase tracking-tighter">
                               {der.valueAdded} KALI
                             </span>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={onLogin}
                className="w-full mt-16 py-6 bg-blue-900 text-white rounded-[24px] font-black hover:bg-blue-800 transition-all shadow-2xl shadow-blue-900/30 flex items-center justify-center gap-3 group tracking-tight"
              >
                MASUK PORTAL UNTUK ANALISIS MENDALAM
                <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
