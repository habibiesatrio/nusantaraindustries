import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Database, Plus, Trash2, Link as LinkIcon } from 'lucide-react';

const DataModal = ({ isOpen, onClose, onSave, initialData = {}, mode, allData = [] }) => {
    const [formData, setFormData] = useState({});
    const [error, setError] = useState("");
    const [newParentId, setNewParentId] = useState(""); // State untuk input manual parent

    // Inisialisasi Form
    useEffect(() => {
        if (isOpen) {
            setError("");
            setNewParentId("");
            if (mode === 'edit') {
                setFormData({
                    ...initialData,
                    Parents: initialData.Parents || []
                });
            } else { 
                setFormData({
                    Product_Name: "",
                    HS_Code: "",
                    Harmony_ID: "",
                    Tier: "Pilih Kategori Tier", 
                    Parents: [],
                    Process_Name: "",
                    Export_Value: 0,
                    Import_Value: 0,
                    Market_Value_Technology: 0,
                    Desc: ""
                });
            }
        }
    }, [isOpen, initialData, mode]);

    // LOGIKA AUTO-GENERATE HARMONY ID (Hanya mode ADD)
    useEffect(() => {
        if (mode === 'add' && isOpen) {
            const hs = formData.HS_Code ? formData.HS_Code.trim() : "";
            const nameSlug = formData.Product_Name 
                ? formData.Product_Name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') 
                : "";
            
            if (hs && nameSlug) {
                setFormData(prev => ({ ...prev, Harmony_ID: `${hs}_${nameSlug}` }));
            }
        }
    }, [formData.HS_Code, formData.Product_Name, mode, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const isNumber = ['Export_Value', 'Import_Value', 'Market_Value_Technology'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
        setError(""); 
    };

    // FUNGSI MANAJEMEN PARENT
    const handleAddParentManual = () => {
        if (!newParentId) return;
        
        // Cek apakah ID parent valid (ada di DB)
        const parentExists = allData.some(item => item.Harmony_ID === newParentId);
        if (!parentExists) {
            setError(`Maaf, Parent dengan ID "${newParentId}" tidak ditemukan di database.`);
            return;
        }

        // Cek agar tidak duplikat di list internal
        if (formData.Parents.some(p => p.Harmony_ID === newParentId)) {
            setError("Produk ini sudah menjadi parent.");
            return;
        }

        setFormData(prev => ({
            ...prev,
            Parents: [...prev.Parents, { Harmony_ID: newParentId, Process_Name: "Manual Connection" }]
        }));
        setNewParentId("");
        setError("");
    };

    const handleRemoveParent = (idToRemove) => {
        setFormData(prev => ({
            ...prev,
            Parents: prev.Parents.filter(p => p.Harmony_ID !== idToRemove)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (mode === 'add') {
            const isDuplicate = allData.some(item => item.Harmony_ID === formData.Harmony_ID);
            if (isDuplicate) {
                setError(`ID "${formData.Harmony_ID}" sudah terdaftar!`);
                return;
            }
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[200] backdrop-blur-sm font-sans px-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-4xl animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[95vh] border border-slate-100 overflow-hidden">
                
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">
                            {mode === 'edit' ? 'Update Data Produk' : 'Tambah Produk Baru'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-50 rounded-full transition-colors group">
                        <X size={24} className="text-slate-300 group-hover:text-red-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8 overflow-hidden">
                    
                    {/* KOLOM KIRI: INFORMASI PRODUK */}
                    <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        <h3 className="text-[10px] font-black text-sky-600 uppercase tracking-[0.2em] mb-4">Informasi Produk</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">HS Code</label>
                                <input type="text" name="HS_Code" value={formData.HS_Code || ''} onChange={handleChange} className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-4 focus:ring-sky-500/10 outline-none" required />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Product Name</label>
                                <input type="text" name="Product_Name" value={formData.Product_Name || ''} onChange={handleChange} className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-sky-500/10 outline-none" required />
                            </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[10px]">
                            <p className="font-black text-slate-400 uppercase tracking-widest">Harmony ID (Auto)</p>
                            <p className="font-mono font-bold text-slate-700 mt-1">{formData.Harmony_ID || '...'}</p>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deskripsi</label>
                            <textarea name="Desc" value={formData.Desc || ''} onChange={handleChange} className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs" rows="2" />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kategori Tier</label>
                            <select name="Tier" value={formData.Tier || ''} onChange={handleChange} className="w-full mt-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold">
                                <option value="Tier 1 (Bijih - Peleburan/ Pemrosesan/ Pemurnian)">Tier 1 (Raw)</option>
                                <option value="Tier 2 (Peleburan/ Pemrosesan/ Pemurnian)">Tier 2 (Basic)</option>
                                <option value="Tier 3 (Peleburan/ Pemrosesan/ Pemurnian - Pembentukan)">Tier 3 (Intermediate)</option>
                                <option value="Tier 4 (Pembentukan)">Tier 4 (Semi-Finished)</option>
                                <option value="Tier 5 (Pembentukan - Barang Jadi)">Tier 5 (Final)</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-3 text-[9px] font-black text-slate-400 uppercase text-center py-1">Nilai Ekonomi (USD/TON)</div>
                            <input type="number" step="any" name="Market_Value_Technology" value={formData.Market_Value_Technology || 0} onChange={handleChange} className="p-2 border rounded-lg text-xs" placeholder="MVT" title="Market Value Tech" />
                            <input type="number" step="any" name="Export_Value" value={formData.Export_Value || 0} onChange={handleChange} className="p-2 border border-emerald-200 rounded-lg text-xs text-emerald-600 font-bold" placeholder="Eks" />
                            <input type="number" step="any" name="Import_Value" value={formData.Import_Value || 0} onChange={handleChange} className="p-2 border border-red-200 rounded-lg text-xs text-red-600 font-bold" placeholder="Imp" />
                        </div>
                    </div>

                    {/* KOLOM KANAN: MANAJEMEN RELASI */}
                    <div className="w-full md:w-80 flex flex-col">
                        <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Manajemen Parent (Hulu)</h3>
                        
                        {/* Input Parent Baru */}
                        <div className="flex gap-2 mb-4">
                            <input 
                                type="text" 
                                placeholder="Masukkan Harmony ID Parent..." 
                                className="flex-1 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[10px] font-mono outline-none"
                                value={newParentId}
                                onChange={(e) => setNewParentId(e.target.value)}
                            />
                            <button 
                                type="button" 
                                onClick={handleAddParentManual}
                                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md"
                            >
                                <Plus size={16} strokeWidth={3} />
                            </button>
                        </div>

                        {error && <p className="text-[9px] font-bold text-red-500 mb-4 px-1 leading-tight"><AlertCircle size={10} className="inline mr-1"/>{error}</p>}

                        {/* List Parent Saat Ini */}
                        <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 p-4 overflow-y-auto">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                                <LinkIcon size={10} /> Daftar Bapak (Parents)
                            </p>
                            <div className="space-y-2">
                                {formData.Parents && formData.Parents.length > 0 ? (
                                    formData.Parents.map((parent, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm group">
                                            <div className="overflow-hidden">
                                                <p className="text-[9px] font-black text-slate-700 truncate">{parent.Harmony_ID}</p>
                                                <p className="text-[8px] text-slate-400 italic">via {parent.Process_Name}</p>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveParent(parent.Harmony_ID)}
                                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center text-slate-300 italic text-[9px]">Tidak ada parent (Root)</div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6">
                            <button 
                                type="submit" 
                                className="w-full bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase flex items-center justify-center gap-3 shadow-xl hover:bg-sky-600 transition-all tracking-widest"
                            >
                                <Save size={18} strokeWidth={3} /> Simpan Produk
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DataModal;