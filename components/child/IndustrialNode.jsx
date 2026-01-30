import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { 
    Plus, Minus, Zap, Layers, ArrowUpRight, ArrowDownLeft, 
    Database, Globe, Edit3, Trash2 
} from 'lucide-react';

const IndustrialNode = ({ data }) => {
  // 1. DESTRUCTURING DATA
  const { 
      dbKey, Identity = {}, Market_Metrics = {}, Live_Metrics = {}, 
      Hierarchy = {}, viewMode = 'readonly',
      calculatedMultiplier // Dikirim dari parent hasil perhitungan real-time
  } = data;
  
  const nodeId = dbKey || Identity.Harmony_ID;
  const isRaw = Identity.Tier?.includes('Tier 1');
  const headerColor = isRaw ? 'bg-emerald-600' : (Identity.Tier?.includes('Tier 5') ? 'bg-orange-600' : 'bg-blue-600');
  const rawMaterial = Hierarchy.Parents?.[0]?.Harmony_ID?.split('_')[1] || "Origin";

  // 2. DATA COMPARISON LOGIC
  const dbExport = Market_Metrics.Downstream_Export || Market_Metrics.Export_Value || 0;
  const dbImport = Market_Metrics.Downstream_Import || Market_Metrics.Import_Value || 0;
  
  const liveExport = Live_Metrics.totalExport || 0;
  const liveImport = Live_Metrics.totalImport || 0;
  const hasLiveData = Live_Metrics.fetched === true;

  return (
    <div className={`relative group font-sans ${viewMode === 'edit' ? 'hover:ring-4 hover:ring-yellow-400/50' : ''}`}>
      
      {/* --- CONTROLS KIRI (HULU) --- */}
      <div className="absolute left-[-25px] top-1/2 -translate-y-1/2 flex flex-col gap-2 z-[100]">
          <button onClick={(e) => { e.stopPropagation(); data.onExpandParent(nodeId); }} className="bg-white border-2 border-red-500 shadow-xl rounded-full p-1.5 hover:bg-red-500 hover:text-white transition-all active:scale-90"><Plus size={14} strokeWidth={4} /></button>
          <button onClick={(e) => { e.stopPropagation(); data.onHideParent(nodeId); }} className="bg-white border-2 border-slate-300 shadow-xl rounded-full p-1.5 hover:bg-slate-500 hover:text-white transition-all active:scale-90"><Minus size={14} strokeWidth={4} /></button>
      </div>

      {/* --- MAIN CARD --- */}
      <div 
        onClick={(e) => { e.stopPropagation(); data.onToggleExpand(nodeId); }}
        className={`bg-white border-2 ${hasLiveData ? 'border-blue-400' : 'border-slate-100'} shadow-xl rounded-2xl overflow-hidden transition-all duration-500 w-[300px] hover:shadow-2xl cursor-pointer`}
      >
        <Handle type="target" position={Position.Left} className="opacity-0" />
        
        {/* HEADER */}
        <div className={`px-4 py-2 flex justify-between items-center text-white ${headerColor}`}>
            <span className="text-[9px] font-black uppercase tracking-widest">{Identity.Tier ? Identity.Tier.split('(')[0] : 'TIER X'}</span>
            <div className="flex gap-2">
                {viewMode === 'edit' && <Edit3 size={12} className="text-white/80" />}
                <Layers size={12} />
            </div>
        </div>
        
        <div className="p-4">
            {/* IDENTITY */}
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-[9px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">HS {Identity.HS_Code}</span>
                    <h4 className="text-[13px] font-black text-slate-800 leading-tight mt-1 line-clamp-2">{Identity.Product_Name}</h4>
                </div>
                {/* Calculated Multiplier Badge */}
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                        <Zap size={10} className="text-indigo-600 fill-indigo-600" />
                        <span className="text-[10px] font-black text-indigo-700">{calculatedMultiplier?.score || "1.0"}x</span>
                    </div>
                    <span className="text-[7px] text-slate-400 mt-0.5">Calculated</span>
                </div>
            </div>

            {/* DUAL METRICS DISPLAY */}
            <div className={`grid ${hasLiveData ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mt-3`}>
                {/* Kolom 1: Database Metrics */}
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-1 mb-1 border-b border-slate-200 pb-1">
                        <Database size={10} className="text-slate-400" />
                        <span className="text-[8px] font-bold text-slate-500 uppercase">Internal DB</span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-[9px]"><span className="text-emerald-600">Exp:</span> <span className="font-bold">${Number(dbExport).toLocaleString()}</span></div>
                        <div className="flex justify-between text-[9px]"><span className="text-rose-600">Imp:</span> <span className="font-bold">${Number(dbImport).toLocaleString()}</span></div>
                    </div>
                </div>

                {/* Kolom 2: Live API Metrics (Hanya muncul jika expanded/fetched) */}
                {hasLiveData && (
                    <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-1 mb-1 border-b border-blue-200 pb-1">
                            <Globe size={10} className="text-blue-500" />
                            <span className="text-[8px] font-bold text-blue-600 uppercase">Comtrade API</span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[9px]"><span className="text-emerald-600">Exp:</span> <span className="font-bold">${Number(liveExport).toLocaleString()}</span></div>
                            <div className="flex justify-between text-[9px]"><span className="text-rose-600">Imp:</span> <span className="font-bold">${Number(liveImport).toLocaleString()}</span></div>
                        </div>
                    </div>
                )}
            </div>
            {/* EDIT MODE CONTROLS */}
            {(viewMode === 'edit') && (
                <div className="flex justify-end gap-2 pt-3 mt-2 border-t border-dashed border-slate-200">
                    <button 
                        onClick={(e) => { e.stopPropagation(); data.onEdit(data); }} 
                        className="px-2 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 border border-amber-200 flex items-center gap-1 transition-all"
                        title="Edit Values"
                    >
                        <Edit3 size={10} strokeWidth={2.5}/> <span className="text-[9px] font-bold uppercase">Edit</span>
                    </button>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); data.onDelete(data); }} 
                        className="px-2 py-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 border border-rose-200 flex items-center gap-1 transition-all"
                        title="Delete Node"
                    >
                        <Trash2 size={10} strokeWidth={2.5}/> <span className="text-[9px] font-bold uppercase">Del</span>
                    </button>
                </div>
            )}
        </div>

        <Handle type="source" position={Position.Right} className="opacity-0" />
      </div>

      {/* --- TOMBOL KANAN: NAVIGASI HILIR (CHILDREN) --- */}
      <div className="absolute right-[-25px] top-1/2 -translate-y-1/2 flex flex-col gap-2 z-[100]">
          <button onClick={(e) => { e.stopPropagation(); data.onExpandChildren(nodeId); }} className="bg-white border-2 border-emerald-500 shadow-xl rounded-full p-1.5 hover:bg-emerald-500 hover:text-white transition-all active:scale-90"><Plus size={14} strokeWidth={4} /></button>
          <button onClick={(e) => { e.stopPropagation(); data.onHideChildren(nodeId); }} className="bg-white border-2 border-slate-300 shadow-xl rounded-full p-1.5 hover:bg-slate-500 hover:text-white transition-all active:scale-90"><Minus size={14} strokeWidth={4} /></button>
      </div>

    </div>
  );
};

export default memo(IndustrialNode);