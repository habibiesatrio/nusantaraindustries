import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Save, Trash2, Database, Share2, Plus, Link, ChevronRight, ChevronLeft, ArrowUpRight, ArrowDownLeft, Info, Layers } from 'lucide-react';

const EditableNode = ({ data, id }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [manualID, setManualID] = useState("");

    const onChange = (e) => data.onInputChange(id, e.target.name, e.target.value);
    const parents = data.Parents || [];
    
    const handleRemove = (hid) => data.onUpdateParents(parents.filter(p => p.Harmony_ID !== hid));
    const handleAdd = () => { 
        if (manualID) {
            data.onUpdateParents([...parents, { Harmony_ID: manualID, Process_Name: "" }]); 
            setManualID(""); 
        }
    };

    return (
        <div className="relative flex items-start">
            <div className={`w-80 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-2 ${data.status === 'saved' ? 'border-green-500' : 'border-amber-400'} overflow-hidden z-10`}>
                <Handle type="target" position={Position.Left} className="!w-5 !h-5 !bg-sky-500 !border-4 !border-white" />

                {/* HEADER */}
                <div className="bg-slate-50/50 p-5 flex flex-col gap-4 border-b border-slate-100">
                    <div className="flex justify-between items-center">
                        <span className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-full text-white ${data.status === 'saved' ? 'bg-green-500' : 'bg-amber-500'}`}>
                            {data.status === 'saved' ? 'Synced' : 'Draft Mode'}
                        </span>
                        <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 text-[9px] font-black text-sky-600 uppercase hover:bg-white px-4 py-2 rounded-2xl border border-transparent hover:border-sky-100 shadow-sm bg-white transition-all">
                            <Share2 size={12} /> Relations ({parents.length})
                            {isExpanded ? <ChevronLeft size={12}/> : <ChevronRight size={12}/>}
                        </button>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                        <Layers size={14} className="text-sky-500" />
                        <select name="Tier" value={data.Tier} onChange={onChange} className="w-full text-[10px] font-bold text-slate-600 outline-none">
                            <option value="Tier 0 (SDA)">Tier 0 (Sumber Daya Alam)</option>
                            <option value="Tier 1 (Peleburan)">Tier 1 (Bijih - Peleburan)</option>
                            <option value="Tier 2 (Pemurnian)">Tier 2 (Pemurnian)</option>
                            <option value="Tier 3 (Intermediate)">Tier 3 (Intermediate)</option>
                            <option value="Tier 4 (Pembentukan)">Tier 4 (Pembentukan)</option>
                            <option value="Tier 5 (Barang Jadi)">Tier 5 (Barang Jadi)</option>
                        </select>
                    </div>
                </div>

                {/* FORM CONTENT */}
                <div className="p-6 space-y-4">
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase mb-1 block">HS Code</label>
                            <input name="HS_Code" value={data.HS_Code} onChange={onChange} className="w-full text-xs font-bold p-3 bg-slate-50 rounded-xl outline-none" />
                        </div>
                        <div className="flex-[2]">
                            <label className="text-[8px] font-black text-slate-400 uppercase mb-1 block">Product Name</label>
                            <input name="Product_Name" value={data.Product_Name} onChange={onChange} className="w-full text-xs font-bold p-3 bg-slate-50 rounded-xl outline-none" />
                        </div>
                    </div>

                    <div className="bg-slate-100/50 p-2 rounded-xl flex items-center gap-2 border border-slate-100">
                        <Database size={12} className="text-slate-400" />
                        <span className="text-[9px] font-mono text-slate-500 truncate">{data.Harmony_ID || "ID..."}</span>
                    </div>

                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                        <label className="text-[8px] font-black text-emerald-600 uppercase block mb-1">Market Value Tech</label>
                        <input type="number" step="0.01" name="Market_Value_Technology" value={data.Market_Value_Technology} onChange={onChange} className="w-full bg-transparent font-black text-emerald-800 outline-none text-2xl text-center" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100">
                            <label className="text-[8px] font-black text-blue-600 uppercase block mb-1">Export</label>
                            <input type="number" name="Export_Value" value={data.Export_Value} onChange={onChange} className="w-full bg-transparent text-xs font-bold text-blue-800 outline-none" />
                        </div>
                        <div className="bg-orange-50/50 p-3 rounded-2xl border border-orange-100">
                            <label className="text-[8px] font-black text-orange-600 uppercase block mb-1">Import</label>
                            <input type="number" name="Import_Value" value={data.Import_Value} onChange={onChange} className="w-full bg-transparent text-xs font-bold text-orange-800 outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Deskripsi</label>
                        <textarea name="Desc" value={data.Desc} onChange={onChange} rows="2" className="w-full text-[11px] p-3 bg-slate-50 rounded-xl outline-none resize-none" placeholder="Isi deskripsi..."></textarea>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="p-5 border-t bg-white flex gap-3">
                    <button onClick={data.onDelete} className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={22}/></button>
                    <button onClick={data.onSave} className="flex-1 bg-sky-600 text-white rounded-2xl text-[10px] font-black py-5 uppercase tracking-widest hover:bg-sky-700 shadow-lg shadow-sky-100 active:scale-95">
                        <Save size={18} className="inline mr-2"/> Sync DB
                    </button>
                </div>

                <Handle type="source" position={Position.Right} className="!w-5 !h-5 !bg-sky-500 !border-4 !border-white" />
            </div>

            {/* SIDEBAR RELATION (Samping Kanan) */}
            {isExpanded && (
                <div className="ml-3 w-72 bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-slate-200 p-7 animate-in slide-in-from-left-5 duration-300 self-stretch flex flex-col z-0">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Parents Network</h4>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {parents.map((p, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <span className="truncate w-40 font-mono text-[9px] font-bold text-slate-500">{p.Harmony_ID}</span>
                                {/* TOMBOL HAPUS RELASI (UNLINK) */}
                                <button 
                                    onClick={() => handleRemove(p.Harmony_ID)} 
                                    className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-full transition-all"
                                >
                                    <Link size={14} className="rotate-45" />
                                </button>
                            </div>
                        ))}
                        {parents.length === 0 && <p className="text-[10px] text-slate-300 italic py-10 text-center">Root Node</p>}
                    </div>
                    <div className="mt-5 flex gap-2 pt-5 border-t">
                        <input value={manualID} onChange={(e) => setManualID(e.target.value)} placeholder="Parent ID..." className="flex-1 text-[10px] p-3 rounded-xl border bg-white outline-none ring-sky-500/20 focus:ring-2" />
                        <button onClick={handleAdd} className="bg-sky-600 text-white p-3 rounded-xl hover:bg-sky-700 transition-all shadow-lg shadow-sky-100"><Plus size={18}/></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(EditableNode);