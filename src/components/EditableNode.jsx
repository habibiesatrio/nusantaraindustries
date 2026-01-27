import React, { memo, useState, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { Save, Layers, Calculator, Trash2, CheckCircle2, Clock, Zap, Target } from 'lucide-react';

const EditableNode = ({ id, data }) => {
  const stopKey = (e) => e.stopPropagation();
  const isSaved = data.status === 'saved';
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const filteredRegistry = useMemo(() => {
    const search = (data.Parent_ID || "").toLowerCase();
    if (!search || search === 'root' || !data.registry) return [];
    return data.registry.filter(item => item.Harmony_ID?.toLowerCase().includes(search) || item.Product_Name?.toLowerCase().includes(search)).slice(0, 5);
  }, [data.Parent_ID, data.registry]);

  // UX HELPER: Jika user klik input yang nilainya 0, kosongkan agar bersih
  const handleFocus = (e) => {
    if (e.target.value === "0") {
        e.target.value = "";
    }
  };

  return (
    <div className={`bg-white border-2 p-10 w-[600px] shadow-2xl rounded-[2.5rem] nowheel transition-all duration-500 ${isSaved ? 'border-emerald-400' : 'border-dashed border-sky-400'}`}>
      <Handle type="target" position={Position.Left} className="w-4 h-4 bg-sky-400 border-4 border-white shadow-md" />
      
      <div className="flex justify-between mb-8 border-b border-sky-50 pb-6 cursor-grab">
        <div className="flex items-center gap-3 text-sky-600">
          <div className={`p-2 rounded-xl shadow-sm ${isSaved ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50'}`}><Layers size={22} /></div>
          <h3 className="text-sm font-black uppercase tracking-widest">Industrial Node Registry</h3>
        </div>
        <div className="flex items-center gap-2">
            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 shadow-sm ${isSaved ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'}`}>
                {isSaved ? <CheckCircle2 size={12}/> : <Clock size={12}/>} {isSaved ? 'Synchronized' : 'Draft'}
            </span>
            <button onClick={data.onDelete} className="nodrag p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-2 space-y-4">
            <div className="relative">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1 flex items-center gap-2"><Target size={12} className="text-sky-500" /> Parent Harmony ID</label>
              <input type="text" className="nodrag w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-sky-50 transition-all shadow-inner" 
                placeholder="Search HS Code..." value={data.Parent_ID || ''} onKeyDown={stopKey} onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onChange={(e) => data.onInputChange(id, 'Parent_ID', e.target.value)} />
              
              {showSuggestions && filteredRegistry.length > 0 && (
                <div className="absolute z-[200] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {filteredRegistry.map((item) => (
                        <button key={item.Harmony_ID} onClick={() => data.onInputChange(id, 'Parent_ID', item.Harmony_ID)} className="w-full p-4 text-left hover:bg-sky-50 flex items-center justify-between border-b border-slate-50 last:border-0 transition-colors">
                            <div><p className="text-[10px] font-black text-slate-800 uppercase">{item.Product_Name}</p><p className="text-[8px] font-bold text-sky-600 font-mono">{item.Harmony_ID}</p></div>
                            <span className="text-[8px] font-black bg-slate-100 px-2 py-1 rounded text-slate-400">MULTIPLIER: {Number(item.Origin_Score_Value || 0).toFixed(2)}x</span>
                        </button>
                    ))}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1">Product Name</label>
                  <input type="text" className="nodrag w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold" value={data.Product_Name || ''} onKeyDown={stopKey} onChange={(e) => data.onInputChange(id, 'Product_Name', e.target.value)} /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1">Harmony ID (Unique)</label>
                  <input type="text" className="nodrag w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold" value={data.Harmony_ID || ''} onKeyDown={stopKey} onChange={(e) => data.onInputChange(id, 'Harmony_ID', e.target.value)} /></div>
            </div>
        </div>

        <div className="col-span-2 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 text-slate-600 font-black text-[10px] uppercase tracking-widest"><Calculator size={16} /> Value-Added Score</div>
                <div className="bg-sky-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg shadow-sky-100">
                    <Zap size={10} fill="white" /><span className="text-[10px] font-black tracking-tighter">LOCAL STEP: {Number(data.Step_Score_Value || 0).toFixed(6)}</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {/* INPUT NUMERIK DENGAN UX PEMBERSIHAN NOL */}
                {['Upstream_Export', 'Upstream_Import', 'Downstream_Export', 'Downstream_Import', 'Step_Score_Coefficient', 'Origin_Score_Value'].map(f => (
                    <div key={f}><label className="text-[8px] font-black text-slate-400 uppercase mb-1 block">{f.replace(/_/g, ' ')}</label>
                        <input 
                            type="number" 
                            step="0.00001" 
                            className="nodrag w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm" 
                            value={data[f] ?? 0} 
                            onKeyDown={stopKey} 
                            onFocus={handleFocus} // FIX UX: Kosongkan jika 0 saat diklik
                            onChange={(e) => data.onInputChange(id, f, e.target.value)} 
                        />
                    </div>
                ))}
            </div>
        </div>
      </div>

      <button onClick={data.onSave} className={`nodrag w-full mt-10 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl ${isSaved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-sky-600'}`}>
        <Save size={18} /> {isSaved ? 'Synchronize All Tiers' : 'Finalize Production Node'}
      </button>
      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-sky-400 border-4 border-white shadow-md" />
    </div>
  );
};

export default memo(EditableNode);