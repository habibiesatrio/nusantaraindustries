import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, Activity } from 'lucide-react';

const EditNodeModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        Product_Name: '',
        Export_Value: 0,
        Import_Value: 0,
        Market_Value_Technology: 0,
        Desc: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                Product_Name: initialData.Identity?.Product_Name || '',
                Export_Value: initialData.Market_Metrics?.Export_Value || 0,
                Import_Value: initialData.Market_Metrics?.Import_Value || 0,
                Market_Value_Technology: initialData.Market_Metrics?.Market_Value_Technology || 0,
                Desc: initialData.Identity?.Desc || ''
            });
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Merge data baru dengan struktur lama untuk menjaga integritas ID/Hierarchy
        const updatedNode = {
            ...initialData,
            Identity: { ...initialData.Identity, Product_Name: formData.Product_Name, Desc: formData.Desc },
            Market_Metrics: {
                ...initialData.Market_Metrics,
                Export_Value: Number(formData.Export_Value),
                Import_Value: Number(formData.Import_Value),
                Market_Value_Technology: Number(formData.Market_Value_Technology)
            }
        };
        onSave(updatedNode);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Edit Market Data</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Product Name</label>
                        <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            value={formData.Product_Name} onChange={e => setFormData({...formData, Product_Name: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-emerald-600 uppercase mb-1">Export Value ($)</label>
                            <div className="relative">
                                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                                <input type="number" className="w-full pl-8 pr-4 py-2 bg-emerald-50/50 border border-emerald-100 rounded-xl font-mono font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                                    value={formData.Export_Value} onChange={e => setFormData({...formData, Export_Value: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-rose-600 uppercase mb-1">Import Value ($)</label>
                            <div className="relative">
                                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500" />
                                <input type="number" className="w-full pl-8 pr-4 py-2 bg-rose-50/50 border border-rose-100 rounded-xl font-mono font-bold text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500" 
                                    value={formData.Import_Value} onChange={e => setFormData({...formData, Import_Value: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-indigo-600 uppercase mb-1 flex items-center gap-1"><Activity size={12}/> Tech / Domestic Value ($)</label>
                        <input type="number" className="w-full px-4 py-2 bg-indigo-50/50 border border-indigo-100 rounded-xl font-mono font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                            value={formData.Market_Value_Technology} onChange={e => setFormData({...formData, Market_Value_Technology: e.target.value})} />
                        <p className="text-[9px] text-slate-400 mt-1 italic">Nilai tambah teknologi atau penjualan domestik yang tidak tercatat di ekspor.</p>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                        <textarea className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3}
                            value={formData.Desc} onChange={e => setFormData({...formData, Desc: e.target.value})}></textarea>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wide shadow-lg shadow-blue-200 flex items-center gap-2 transition-all active:scale-95">
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditNodeModal;