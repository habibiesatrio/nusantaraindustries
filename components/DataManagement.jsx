import React, { useState, useEffect } from 'react';
import { db, rtdb } from '../services/firebase';
import { ref, onValue, get } from 'firebase/database';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, GitMerge, FileJson, Database, 
    Upload, Download, FileCode, CheckCircle2, 
    AlertCircle, Info, Layers, ChevronRight,
    Search, Trash2, Edit3, Loader2
} from 'lucide-react';
// import PatentManagement from './PatentManagement';
// import PublicationManagement from './PublicationManagement';
// const getConnection = require('./Database');

const DataManagement = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [file, setFile] = useState(null);
  const [sqlFile, setSqlFile] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('pohonIndustri');
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- LOGIC PRESERVED: SOSIALISASI USER & DATA ---
  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        const fetchedData = await fetchData();
        if (fetchedData) {
            setData(fetchedData);
        }
        setIsLoading(false);
    };

    const userData = sessionStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadData();
    }
  }, []);

  // --- LOGIC PRESERVED: FETCH DATA RTDB ---
  const fetchData = async () => {
      try {
          const dbRef = ref(rtdb, '/produk/');
          const snapshot = await get(dbRef);

          if (snapshot.exists()) {
              const data = snapshot.val();
              const dataList = Object.entries(data).map(([key, value]) => ({
                  id: key,
                  ...value
              }));
              console.log('Formatted dataList:', dataList);
              return dataList;
          } else {
              return [];
          }
      } catch (error) {
          console.error("Error fetching data:", error.message);
          setNotification({ 
              message: `RTDB Fetch Error: ${error.message}`, 
              type: 'error' 
          });
          return [];
      }
  };

  // --- LOGIC PRESERVED: FILE HANDLING ---
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        setFile(selectedFile);
        setNotification({ message: 'File selected. Reading file...', type: 'info' });
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            const jsonText = event.target.result;
            try {
                const parsedJson = JSON.parse(jsonText);
                setPreviewData(Array.isArray(parsedJson) ? parsedJson : [parsedJson]);
                setNotification({ message: 'Preview ready. Please confirm to import.', type: 'info' });
            } catch (error) {
                setNotification({ message: `Error parsing JSON file: ${error.message}`, type: 'error' });
                setPreviewData([]);
            }
        };
        reader.readAsText(selectedFile);
    }
  };

  const handleSqlFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        setSqlFile(selectedFile);
        setNotification({ message: 'SQL file selected. Ready to import.', type: 'info' });
    }
  };

  // --- LOGIC PRESERVED: IMPORT/EXPORT ---
  const handleImport = async () => {
      if (previewData.length === 0) {
          setNotification({ message: 'No data to import.', type: 'warning' });
          return;
      }
  
      setIsLoading(true);
      const batch = writeBatch(db);
      previewData.forEach((row) => {
          if (!row.cmdCode) return;
  
          const code = row.cmdCode.toString();
          let parentId = "ROOT";
  
          if (code.startsWith("7219") || code.startsWith("7220")) {
            parentId = "7218";
          } else if (code.startsWith("7304") || code.startsWith("7306")) {
            parentId = "7219";
          } else if (code.startsWith("7214") || code.startsWith("7216")) {
            parentId = "7206";
          } else if (code === "7206" || code === "7218") {
            parentId = "7201";
          }
  
          const cleanAndParse = (value) => {
              if (typeof value !== 'string') return value;
              const cleaned = value.replace(/\./g, '').replace(',', '.');
              const number = parseFloat(cleaned);
              return isNaN(number) ? 0 : number;
          };
  
          const name = row['Product Name'] || row['Product\nName'];
          const fobValue = row['fobvalue (US$)'] || row['fobvalue\n(US$)'];
          const unitValue = row['Unit Value (US$/ton)'] || row['Unit\nValue (US$/ton)'];
  
          const docRef = doc(db, "pohon_industri", code);
          batch.set(docRef, {
              ...row,
              name: name,
              fobValue: cleanAndParse(fobValue),
              unitValue: cleanAndParse(unitValue),
              parentId: parentId,
              cmdCode: code
          });
      });
  
      try {
          await batch.commit();
          setNotification({ message: 'Database Berhasil Diperbarui!', type: 'success' });
          setFile(null);
          setPreviewData([]);
          const refreshed = await fetchData();
          setData(refreshed);
      } catch (error) {
          setNotification({ message: `Error updating database: ${error.message}`, type: 'error' });
      } finally {
          setIsLoading(false);
      }
  };

  const handleSqlImport = () => {
    if (!sqlFile) {
        setNotification({ message: 'No SQL file selected.', type: 'warning' });
        return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
        const sql = event.target.result;
        const connection = getConnection();
        connection.connect((err) => {
            if (err) {
                setNotification({ message: `Error connecting to database: ${err.message}`, type: 'error' });
                return;
            }
            connection.query(sql, (error) => {
                if (error) {
                    setNotification({ message: `Error importing SQL: ${error.message}`, type: 'error' });
                    connection.end();
                    return;
                }
                setNotification({ message: 'SQL database imported successfully!', type: 'success' });
                connection.end();
            });
        });
    };
    reader.readAsText(sqlFile);
  };

  const exportToJSON = () => {
    if (data.length === 0) {
        setNotification({ message: 'No data to export.', type: 'warning' });
        return;
    }
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pohon_industri_export_${new Date().getTime()}.json`;
    link.click();
    setNotification({ message: 'Data exported successfully!', type: 'success' });
  };

  // --- NEW UI: REDESIGNED TABLE (ANTI-REDUNDANCY) ---
  const renderTable = (tableData, title) => {
    const filtered = tableData.filter(item => 
        item.Product_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Harmony_ID?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mt-8 transition-all">
            <div className="px-10 py-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-sky-600">
                        <Database size={20} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">{title}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{filtered.length} Validated Entries</p>
                    </div>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                        type="text"
                        placeholder="Search Registry..."
                        className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-sky-50 w-full md:w-80 transition-all border-dashed hover:border-sky-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                {filtered.length > 0 ? (
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">HS Harmony ID</th>
                                <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Entity</th>
                                <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tier</th>
                                <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent ID</th>
                                <th className="px-10 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 bg-white">
                            {filtered.slice(0, 50).map((row, index) => (
                                <tr key={index} className="hover:bg-sky-50/20 transition-colors group">
                                    <td className="px-10 py-5">
                                        <span className="font-mono text-[10px] font-black text-sky-600 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100">
                                            {row.Harmony_ID?.split('_')[0] || row.cmdCode}
                                        </span>
                                    </td>
                                    <td className="px-10 py-5">
                                        <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">{row.Product_Name || row.name}</p>
                                    </td>
                                    <td className="px-10 py-5">
                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase ${
                                            row.Tier?.includes('Tier 1') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'
                                        }`}>
                                            {row.Tier?.split(' (')[0] || 'Unclassified'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-5">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase italic">{row.Parent_ID || row.parentId || 'ROOT'}</p>
                                    </td>
                                    <td className="px-10 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2.5 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-sky-600 transition-all border border-transparent hover:border-slate-100">
                                                <Edit3 size={16} />
                                            </button>
                                            <button className="p-2.5 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-rose-600 transition-all border border-transparent hover:border-slate-100">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="py-24 flex flex-col items-center justify-center text-slate-300">
                        <AlertCircle size={48} strokeWidth={1} className="mb-4 opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Dataset matches zero records</p>
                    </div>
                )}
            </div>
        </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 text-center max-w-md">
            <AlertCircle size={64} className="text-rose-500 mx-auto mb-6" />
            <h1 className="text-2xl font-black text-slate-900 uppercase mb-4 tracking-tighter">Access Denied</h1>
            <p className="text-slate-500 font-medium mb-8">You must be authorized to access the Data Management Center. Please verify your credentials.</p>
            <button onClick={() => navigate('/login')} className="w-full py-4 bg-sky-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-100">Return to Security Hub</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-10 font-sans selection:bg-sky-100 selection:text-sky-900">
        {/* Header Area */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-14 gap-8">
            <div className="text-center md:text-left">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-3">
                    Admin <span className="text-sky-600 underline decoration-sky-100 underline-offset-8">Console</span>
                </h1>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] ml-1">Portal Manajemen Data Industri BRIN</p>
            </div>
            <Link to="/dashboard" className="flex items-center gap-3 bg-white border border-slate-200 hover:border-sky-300 text-slate-600 hover:text-sky-600 font-black text-[10px] uppercase tracking-widest py-4 px-10 rounded-[2rem] shadow-sm transition-all hover:shadow-sky-100 active:scale-95">
                <ArrowLeft size={16} /> Hub Dashboard
            </Link>
        </div>

        {/* Action Center Grid */}
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
                {/* JSON Control Card */}
                <div className="lg:col-span-3 bg-white p-10 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-center gap-10 shadow-sm relative overflow-hidden group">
                    <div className="w-20 h-20 bg-sky-50 rounded-[2rem] flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform duration-500">
                        <Upload size={32} />
                    </div>
                    <div className="flex-1 text-center md:text-left z-10">
                        <h3 className="text-lg font-black uppercase text-slate-800 mb-2 tracking-tight">Sync Master Database</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider leading-relaxed">Update massal dataset pohon industri menggunakan file JSON terstruktur.</p>
                    </div>
                    <div className="flex items-center gap-4 z-10">
                        <label className="cursor-pointer bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-100">
                            Select File
                            <input type="file" accept=".json" className="hidden" onChange={handleFileChange} />
                        </label>
                        <button 
                            onClick={handleImport}
                            disabled={!previewData.length || isLoading}
                            className="bg-sky-600 disabled:bg-slate-100 disabled:text-slate-400 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-sky-100 transition-all active:scale-95 flex items-center gap-2"
                        >
                            {isLoading ? <Loader2 size={14} className="animate-spin"/> : 'Commit Sync'}
                        </button>
                    </div>
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-slate-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
                </div>
                
                {/* SQL & Visual Architect Card */}
                <div className="flex flex-col gap-4">
                    <button 
                        onClick={() => navigate('/input-node')}
                        className="flex-1 bg-slate-900 p-6 rounded-[2rem] flex items-center gap-4 group transition-all hover:bg-sky-600 shadow-xl"
                    >
                        <GitMerge size={24} className="text-sky-400 group-hover:text-white transition-all" />
                        <span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Visual Input</span>
                    </button>
                    <div className="flex-1 bg-orange-500 p-6 rounded-[2rem] flex flex-col justify-center relative overflow-hidden group">
                        <label className="cursor-pointer flex items-center gap-4">
                            <FileCode size={24} className="text-white group-hover:rotate-12 transition-transform" />
                            <span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">SQL Import</span>
                            <input type="file" accept=".sql" className="hidden" onChange={handleSqlFileChange} />
                        </label>
                        {sqlFile && (
                            <button onClick={handleSqlImport} className="mt-2 text-[8px] font-black text-white underline uppercase">Run Migration</button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tab Navigation Pills */}
            <div className="mb-10 flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                {[
                    { id: 'pohonIndustri', label: 'Hierarchy Nodes', icon: <Layers size={14}/> },
                    { id: 'paten', label: 'Patent Registry', icon: <FileJson size={14}/> },
                    { id: 'publication', label: 'Research Publication', icon: <FileCode size={14}/> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'bg-sky-600 text-white shadow-2xl shadow-sky-200' 
                            : 'bg-white text-slate-400 border border-slate-100 hover:border-sky-200 hover:text-sky-600 shadow-sm'
                        }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
                
                <button 
                    onClick={exportToJSON}
                    className="ml-auto flex items-center gap-2 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-white border border-emerald-100 text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm"
                >
                    <Download size={14} /> Backup Master
                </button>
            </div>

            {/* Content Area */}
            <div className="pb-20">
                {activeTab === 'pohonIndustri' && (
                    <div className="animate-in fade-in zoom-in-95 duration-700">
                        {notification.message && (
                            <div className={`mb-8 p-6 rounded-[2rem] flex items-center gap-4 border animate-in slide-in-from-top duration-500 ${
                                notification.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                notification.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                                'bg-sky-50 border-sky-100 text-sky-700'
                            }`}>
                                {notification.type === 'success' ? <CheckCircle2 size={24}/> : <AlertCircle size={24}/>}
                                <p className="text-xs font-black uppercase tracking-widest">{notification.message}</p>
                            </div>
                        )}

                        {previewData.length > 0 && renderTable(previewData, "Import Buffer Preview")}
                        {renderTable(data, "Live Production Dataset")}
                    </div>
                )}

                {activeTab === 'paten' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <PatentManagement />
                    </div>
                )}
                
                {activeTab === 'publication' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <PublicationManagement />
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default DataManagement;