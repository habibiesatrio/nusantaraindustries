import React, { memo, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { 
    Plus, Minus, Zap, Layers, Info, 
    Edit, Trash2, ArrowUp, ArrowDown, 
    ChevronLeft, ChevronRight, X as XIcon,
    ExternalLink 
} from 'lucide-react';

const IndustrialNode = ({ data }) => {
  // 1. Logika Penentuan Gaya Visual berdasarkan Tier
  const isFinal = data.Tier?.includes('Tier 5');
  const isRaw = data.Tier?.includes('Tier 1');
  
  const headerColor = isRaw ? 'bg-emerald-600' : (isFinal ? 'bg-orange-500' : 'bg-sky-700');
  const hoverRing = isRaw ? 'hover:ring-emerald-500/20' : (isFinal ? 'hover:ring-orange-500/20' : 'hover:ring-sky-500/20');

  // 2. Kalkulasi Multiplier Score (Full Chain) menggunakan Engine Kalkulator
  const valueAdded = useMemo(() => {
    if (!data.calculateValueAdded) return { score: "1.00", parentName: "-" };
    return data.calculateValueAdded(data);
  }, [data]);

  // 3. Fungsi Pengaman (Safe Call) agar tidak error jika fungsi belum ter-load
  const safeCall = (fn, arg) => {
    if (typeof fn === 'function') fn(arg);
  };

  return (
    <div className="relative font-sans h-auto overflow-visible">
      
      {/* --- HANDLE KIRI (HULU / PARENT) --- */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-4 h-4 bg-slate-500 border-2 border-white -ml-2 hover:scale-125 transition-transform z-50 cursor-crosshair" 
      />

      {/* --- KARTU UTAMA --- */}
      <div className={`
        bg-white border-2 border-slate-200 
        shadow-[0_15px_50px_rgb(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden
        transition-all duration-300 ease-in-out
        hover:border-red-500 hover:ring-8 ${hoverRing}
        ${data.isExpanded ? 'w-[420px]' : 'w-[320px]'}
      `}>

        {/* HEADER KATEGORI */}
        <div className={`${headerColor} px-6 py-3 flex items-center justify-between`}>
            <div className="flex items-center gap-2 text-white">
                <Layers size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                    {isRaw ? "RAW MATERIAL" : isFinal ? "FINAL PRODUCT" : "INTERMEDIATE"}
                </span>
            </div>
            {/* Tombol Expand/Collapse Accordion */}
            <button 
                onClick={(e) => { e.stopPropagation(); safeCall(data.onToggleExpand, data.Harmony_ID); }}
                className="text-white/80 hover:text-white transition-colors"
            >
                {data.isExpanded ? <Minus size={18} strokeWidth={3}/> : <Plus size={18} strokeWidth={3}/>}
            </button>
        </div>

        {/* BODY UTAMA (LAYOUT 3 KOLOM) */}
        <div className="flex flex-row items-stretch bg-white">
            
            {/* KOLOM KIRI (KONTROL HULU / PARENT) */}
            <div className="flex flex-col justify-center gap-3 p-3 bg-slate-50/50 border-r border-slate-100">
                <button 
                    onClick={(e) => { e.stopPropagation(); safeCall(data.onExpandParent, data.Harmony_ID); }}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                    title="Muat Parent"
                >
                    <ChevronLeft size={20} strokeWidth={4} />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); safeCall(data.onHideParent, data.Harmony_ID); }}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-100 transition-all shadow-sm active:scale-90"
                    title="Sembunyikan Parent"
                >
                    <XIcon size={18} strokeWidth={4} />
                </button>
            </div>

            {/* KOLOM TENGAH (INFO UTAMA) */}
            <div 
                className="flex-1 p-6 flex flex-col justify-center cursor-pointer hover:bg-slate-50/30 transition-colors text-center" 
                onClick={() => safeCall(data.onToggleExpand, data.Harmony_ID)}
            >
                <p className="text-[10px] font-black text-slate-400 font-mono mb-1 tracking-widest uppercase">HS {data.HS_Code}</p>
                <h4 className="text-xl font-black text-slate-900 uppercase leading-none tracking-tighter mb-5">
                    {data.Product_Name}
                </h4>
                
                {/* Kotak Multiplier & Tombol Pop-up Detail */}
                <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 p-4 rounded-[1.5rem] shadow-inner text-left">
                    <div>
                        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Multiplier Score</p>
                        <p className="text-3xl font-black text-indigo-700 leading-none mt-1">
                            {valueAdded.score}<span className="text-sm ml-0.5 uppercase opacity-60 font-bold">x</span>
                        </p>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); safeCall(data.onShowDetail, data); }}
                        className="bg-white p-3 rounded-2xl border border-indigo-100 text-indigo-600 shadow-sm hover:shadow-indigo-200 transition-all active:scale-95"
                        title="Lihat Detail Rantai Nilai"
                    >
                        <ExternalLink size={22} strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* KOLOM KANAN (KONTROL HILIR / CHILDREN) */}
            <div className="flex flex-col justify-center gap-3 p-3 bg-slate-50/50 border-l border-slate-100">
                <button 
                    onClick={(e) => { e.stopPropagation(); safeCall(data.onExpandChildren, data.Harmony_ID); }}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-90"
                    title="Muat Child"
                >
                    <ChevronRight size={20} strokeWidth={4} />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); safeCall(data.onHideChildren, data.Harmony_ID); }}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-100 transition-all shadow-sm active:scale-90"
                    title="Sembunyikan Child"
                >
                    <XIcon size={18} strokeWidth={4} />
                </button>
            </div>
        </div>

        {/* --- AREA DETAIL AKORDEON (MUNCUL SAAT EXPAND) --- */}
        <div className={`bg-slate-50 overflow-hidden transition-all duration-500 ease-in-out ${data.isExpanded ? 'max-h-[800px] opacity-100 border-t border-slate-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-8 space-y-6">
                
                {/* Statistik Grid */}
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
                        <div className="flex items-center justify-center gap-2 mb-1.5 text-emerald-600 font-black text-[9px] uppercase tracking-widest">
                            <ArrowUp size={14} strokeWidth={3}/> Ekspor
                        </div>
                        <p className="text-base font-black text-slate-800 tracking-tight">
                            ${Number(data.Export_Value || 0).toLocaleString()} <span className="text-[9px] text-slate-400 font-bold uppercase">USD/TON</span>
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm text-center">
                        <div className="flex items-center justify-center gap-2 mb-1.5 text-red-600 font-black text-[9px] uppercase tracking-widest">
                            <ArrowDown size={14} strokeWidth={3}/> Impor
                        </div>
                        <p className="text-base font-black text-slate-800 tracking-tight">
                            ${Number(data.Import_Value || 0).toLocaleString()} <span className="text-[9px] text-slate-400 font-bold uppercase">USD/TON</span>
                        </p>
                    </div>
                </div>

                {/* Deskripsi Produk */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-inner">
                    <div className="flex items-center gap-2 mb-2 text-slate-400">
                        <Info size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Deskripsi</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                        "{data.Desc || 'Tidak ada deskripsi tersedia.'}"
                    </p>
                </div>

                {/* Tombol Aksi CRUD */}
                <div className="flex gap-4 pt-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); safeCall(data.onEdit, data); }}
                        className="flex-1 py-4 rounded-2xl bg-amber-500 text-white text-xs font-black uppercase hover:bg-amber-600 shadow-lg shadow-amber-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Edit size={16} /> Edit Data
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); safeCall(data.onDelete, data); }}
                        className="flex-1 py-4 rounded-2xl bg-red-600 text-white text-xs font-black uppercase hover:bg-red-700 shadow-lg shadow-red-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Trash2 size={16} /> Hapus Node
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* --- HANDLE KANAN (HILIR) --- */}
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-4 h-4 bg-emerald-500 border-2 border-white -mr-2 hover:scale-125 transition-transform z-50 cursor-crosshair" 
      />
    </div>
  );
};

export default memo(IndustrialNode);