import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { 
    Background, 
    Controls, 
    useNodesState, 
    useEdgesState, 
    ReactFlowProvider, 
    useViewport,
    useReactFlow,
    addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';

// ENGINE: Menggunakan Realtime Database
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../services/firebase'; 

import { Link, useNavigate } from 'react-router-dom';
import { 
    GitMerge, LayoutDashboard, Search, X, 
    ArrowUp, ArrowDown, Database, LogOut, 
    Bell, Settings, Download, Loader2,
    Lock, Unlock, Globe
} from 'lucide-react';

import { getSumMarketValue, sanitizeHSCode, isValidHSCode } from '../services/comtradeService';
import { calculateValueAdded } from '../utils/valueAddedCalculator';
import IndustrialNode from '@/components/child/IndustrialNode';

// --- CONFIGURATION & HELPERS ---
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const marketCache = new Map();
const nodeTypes = { industrial: IndustrialNode };

// --- KOMPONEN UI: LOADING SPINNER ---
const LoadingSpinner = () => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] bg-white/90 backdrop-blur-sm p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-slate-100 animate-in zoom-in duration-300">
        <div className="relative">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <div className="absolute inset-0 bg-blue-400/20 blur-xl animate-pulse rounded-full"></div>
        </div>
        <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 leading-none mb-1">Synchronizing</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Fetching Global Trade Data...</span>
        </div>
    </div>
);

// --- KOMPONEN UI: ZOOM INDICATOR ---
const ZoomDisplay = () => {
    const { zoom } = useViewport();
    return (
        <div className="absolute bottom-8 right-24 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-slate-200 shadow-xl z-10 font-black text-slate-500 text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all hover:bg-white">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            Zoom: {Math.round(zoom * 100)}%
        </div>
    );
};

// --- LOGIC UTAMA HALAMAN ---
const PohonIndustriContent = () => {
    const { setCenter, getNodes } = useReactFlow();
    const navigate = useNavigate();
    
    // STATE
    const [allData, setAllData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedPopUp, setSelectedPopUp] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState('readonly'); // 'readonly' | 'edit'

    // 1. ENGINE: Sinkronisasi User & RTDB
    useEffect(() => {
        const userData = sessionStorage.getItem('user');
        if (!userData) {
            navigate('/login');
        } else {
            setUser(JSON.parse(userData));
        }

        const dbRef = ref(rtdb, '/produk/'); 
        return onValue(dbRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // TRANSFORMASI DATA: Flat Object -> Array dengan dbKey
                const formatted = Object.entries(data).map(([key, value]) => ({
                    ...value,
                    dbKey: key, // Kunci vital untuk linking graph
                    Identity: value.Identity || {},
                    Hierarchy: value.Hierarchy || { Parents: [] },
                    Market_Metrics: value.Market_Metrics || {}
                }));
                setAllData(formatted);
            }
        });
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        navigate('/login');
    };

    const toggleViewMode = () => setViewMode(prev => prev === 'readonly' ? 'edit' : 'readonly');

    // 2. INTERACTION ENGINE: DUAL METRICS FETCH (DB & API)
    const onToggleExpand = useCallback(async (clickedId) => {
        const currentNodes = getNodes(); 
        
        // Robust ID Matching (Sanitized vs Original)
        const targetNode = currentNodes.find(n => 
            n.id === clickedId || 
            n.data?.Identity?.Harmony_ID === clickedId
        );

        if (!targetNode) return;
        const validId = targetNode.id;

        if (!targetNode.data.isExpanded) {
            setIsLoading(true);
            try {
                const hsCodeRaw = targetNode.data.Identity?.HS_Code || "";
                const cleanHS = sanitizeHSCode(hsCodeRaw);
                const cacheKey = `${cleanHS}_2024`;
                let liveMetrics = { fetched: true, totalExport: 0, totalImport: 0 };

                // Cek Cache atau Fetch API
                if (marketCache.has(cacheKey)) {
                    liveMetrics = marketCache.get(cacheKey);
                } else if (isValidHSCode(cleanHS)) {
                    const exportRes = await getSumMarketValue(cleanHS, '2024', 'X');
                    await wait(600); // Throttling
                    const importRes = await getSumMarketValue(cleanHS, '2024', 'M');
                    
                    liveMetrics = { 
                        fetched: true, 
                        totalExport: exportRes?.totalValueUSD || 0, 
                        totalImport: importRes?.totalValueUSD || 0 
                    };
                    marketCache.set(cacheKey, liveMetrics);
                }

                // Update Node: Gabungkan data DB (Market_Metrics) dan API (Live_Metrics)
                setNodes((nds) => nds.map((node) => 
                    node.id === validId ? { 
                        ...node, 
                        data: { 
                            ...node.data, 
                            isExpanded: true,
                            Live_Metrics: liveMetrics 
                        } 
                    } : node
                ));

            } catch (err) {
                console.error("API Error:", err);
                setNodes((nds) => nds.map(n => n.id === validId ? { ...n, data: { ...n.data, isExpanded: true }} : n));
            } finally {
                setIsLoading(false);
            }
        } else {
            // Collapse
            setNodes((nds) => nds.map((node) => 
                node.id === validId ? { ...node, data: { ...node.data, isExpanded: false }} : node
            ));
        }
    }, [getNodes, setNodes]);

    // Graph Cleanup Helpers
    const onHideChildren = useCallback((nodeId) => {
        setEdges((eds) => {
            const getDescendants = (parentId, collected = []) => {
                const targets = eds.filter(e => e.source === parentId).map(e => e.target);
                targets.forEach(t => { collected.push(t); getDescendants(t, collected); });
                return collected;
            };
            const toRemove = getDescendants(nodeId);
            setNodes(nds => nds.filter(n => !toRemove.includes(n.id)));
            return eds.filter(e => !toRemove.includes(e.target));
        });
    }, [setNodes, setEdges]);

    const onHideParent = useCallback((nodeId) => {
        setEdges((eds) => {
            const getAncestors = (childId, collected = []) => {
                const sources = eds.filter(e => e.target === childId).map(e => e.source);
                sources.forEach(s => { collected.push(s); getAncestors(s, collected); });
                return collected;
            };
            const toRemove = getAncestors(nodeId);
            setNodes(nds => nds.filter(n => !toRemove.includes(n.id)));
            return eds.filter(e => !toRemove.includes(e.source));
        });
    }, [setNodes, setEdges]);

    // 3. TREE BUILDER ENGINE
    const buildTreeLogic = useCallback((selectedProduct) => {
        if (!selectedProduct?.dbKey) return;

        const nodesMap = new Map();
        const edgesMap = new Map();
        const centerId = selectedProduct.dbKey;
        nodesMap.set(centerId, selectedProduct);

        // Parents Traversal
        (selectedProduct.Hierarchy?.Parents || []).forEach(pRef => {
            const pNode = allData.find(i => i.dbKey === pRef.Harmony_ID);
            if (pNode) {
                nodesMap.set(pNode.dbKey, pNode);
                edgesMap.set(`e-${pNode.dbKey}-${centerId}`, { source: pNode.dbKey, target: centerId, label: pRef.Process_Name });
            }
        });

        // Children Traversal
        const findDescendants = (parentId) => {
            allData.filter(i => i.Hierarchy?.Parents?.some(p => p.Harmony_ID === parentId)).forEach(child => {
                if (!nodesMap.has(child.dbKey)) {
                    nodesMap.set(child.dbKey, child);
                    const rel = child.Hierarchy.Parents.find(p => p.Harmony_ID === parentId);
                    edgesMap.set(`e-${parentId}-${child.dbKey}`, { source: parentId, target: child.dbKey, label: rel?.Process_Name });
                    findDescendants(child.dbKey);
                }
            });
        };
        findDescendants(centerId);

        // ReactFlow Node Factory
        const finalNodes = Array.from(nodesMap.values()).map((item, index) => {
            let depth = 0, curr = item;
            while (curr?.Hierarchy?.Parents?.length > 0 && depth < 10) {
                curr = allData.find(x => x.dbKey === curr.Hierarchy.Parents[0].Harmony_ID);
                if (!curr) break; depth++;
            }

            // HITUNG MULTIPLIER SECARA REALTIME
            console.log(item, allData)
            const calculated = calculateValueAdded(item, allData);
            console.log(calculated)

            return {
                id: item.dbKey,
                type: 'industrial',
                data: { 
                    ...item, 
                    isExpanded: false, 
                    viewMode, // Pass mode read/edit
                    calculatedMultiplier: calculated, // Data hasil hitungan internal
                    onToggleExpand: (id) => onToggleExpand(id), 
                    onHideChildren: (id) => onHideChildren(id), 
                    onHideParent: (id) => onHideParent(id),
                    onExpandChildren: (id) => { const p = allData.find(x=>x.dbKey===id || x.Identity?.Harmony_ID===id); if(p) buildTreeLogic(p); },
                    onExpandParent: (id) => { const p = allData.find(x=>x.dbKey===id || x.Identity?.Harmony_ID===id); if(p) buildTreeLogic(p); },
                    // Pass detail lengkap ke PopUp termasuk hasil hitungan
                    onShowDetail: (d) => setSelectedPopUp({ ...d, calculatedDetails: calculated }) 
                },
                position: { x: depth * 550, y: index * 300 - (nodesMap.size * 100) }
            };
        });

        const finalEdges = Array.from(edgesMap.values()).map((e, idx) => ({
            id: `edge-${idx}-${e.source}-${e.target}`, ...e, animated: true, type: 'smoothstep', style: { stroke: '#6366f1', strokeWidth: 3 }, labelStyle: { fill: '#6366f1', fontWeight: 800, fontSize: 8, textTransform: 'uppercase' }
        }));

        setNodes(finalNodes);
        setEdges(finalEdges);
        setSearchTerm("");
        setTimeout(() => { const t = finalNodes.find(n => n.id === centerId); if (t) setCenter(t.position.x + 180, t.position.y, { zoom: 0.75, duration: 1000 }); }, 200);

    }, [allData, viewMode, onToggleExpand, onHideChildren, onHideParent, setCenter, setNodes, setEdges]);

    // FILTER SEARCH: FIX - Mencari di dalam Identity
    const filteredItems = allData.filter(i => 
        i.Identity?.Product_Name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        i.Identity?.HS_Code?.toString().includes(searchTerm)
    );

    return (
        <div className="flex h-screen bg-sky-50 font-sans overflow-hidden">
            {/* --- SIDEBAR --- */}
            <aside className="w-72 bg-white border-r border-slate-100 flex flex-col p-6 sticky top-0 h-screen z-50 shadow-xl">
                <div className="flex items-center gap-3 mb-10">
                    <div className="bg-sky-600 p-2.5 rounded-xl shadow-lg shadow-sky-100"><LayoutDashboard className="text-white w-6 h-6" /></div>
                    <div><h1 className="text-lg font-black text-slate-900 uppercase leading-none">Intelligence</h1><p className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">Portal Admin BRIN</p></div>
                </div>
                
                <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                    <Link to="/dashboard" className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase text-slate-500 hover:bg-slate-50 transition-all"><LayoutDashboard size={18} /> Kembali ke Dashboard</Link>
                    <div className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase bg-sky-600 text-white shadow-lg shadow-sky-100"><GitMerge size={18} /> Pohon Industri</div>

                    <div className="pt-8 px-2 border-t border-slate-50 mt-4">
                        <div className="flex items-center gap-2 mb-4 text-slate-800"><Database size={14} className="text-slate-400" /><h2 className="text-[10px] font-black uppercase tracking-widest">Navigasi Detail Produk</h2></div>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" size={14} />
                            <input type="text" placeholder="Cari HS / Nama..." className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-sky-100 focus:bg-white transition-all shadow-inner" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="mt-4 space-y-1 max-h-[35vh] overflow-y-auto pr-1">
                            {searchTerm && filteredItems.map(item => (
                                <button key={item.dbKey} onClick={() => buildTreeLogic(item)} className="w-full text-left p-3 rounded-xl hover:bg-sky-50 group transition-all border border-transparent hover:border-sky-100">
                                    <p className="text-[10px] font-black text-slate-700 uppercase leading-none group-hover:text-sky-700">{item.Identity?.Product_Name}</p>
                                    <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">HS {item.Identity?.HS_Code}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-50">
                    <div onClick={() => navigate('/profile')} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-4 cursor-pointer hover:bg-slate-100 transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-white font-black text-sm uppercase">{(user?.nama || user?.email)?.charAt(0).toUpperCase() || 'U'}</div>
                        <div><p className="text-xs font-black text-slate-800 uppercase truncate max-w-[120px]">{user?.nama || 'User'}</p><p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Lihat Profile</p></div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-red-600 font-bold text-xs uppercase transition-colors"><LogOut size={18} /> Logout Portal</button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-8 bg-white border-b border-slate-100 shadow-sm z-10 font-sans">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-1 leading-none">Sistem Industri dan Manufaktur Berkelanjutan</h2>
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-1">Update Data: 12 Jan 2026</p>
                    </div>
                    <div className="flex gap-3">
                        {/* MODE SWITCHER */}
                        <button onClick={toggleViewMode} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm border ${viewMode === 'edit' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                            {viewMode === 'edit' ? <Unlock size={14} /> : <Lock size={14} />}
                            {viewMode === 'edit' ? 'Mode: EDIT' : 'Mode: READ'}
                        </button>
                        <button className="bg-sky-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-sky-100 hover:bg-sky-700 transition-all font-sans tracking-wide"><Download size={16} /> Export</button>
                    </div>
                </header>

                <div className="flex-1 bg-white relative overflow-hidden font-sans">
                    {isLoading && <LoadingSpinner />}
                    
                    <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} nodeTypes={nodeTypes} fitView>
                        <Background color="#cbd5e1" gap={30} size={1} variant="dots" />
                        <Controls className="bg-white shadow-2xl rounded-xl border-none ml-4 mb-4 overflow-hidden" />
                        <ZoomDisplay />
                    </ReactFlow>

                    {/* --- POP UP DETAIL (DUAL METRICS + CALCULATOR) --- */}
                    {selectedPopUp && (
                        <div className="absolute top-10 right-10 w-96 bg-white shadow-[0_25px_60px_rgba(0,0,0,0.15)] rounded-[2.5rem] p-8 border border-slate-50 z-[100] animate-in slide-in-from-right duration-500 overflow-y-auto max-h-[85vh] custom-scrollbar">
                            <div className="flex justify-between items-start mb-6 border-b border-slate-50 pb-4">
                                <div>
                                    <p className="text-[9px] font-black text-sky-600 uppercase tracking-[0.2em] mb-1">{selectedPopUp.Identity?.Tier}</p>
                                    <h3 className="text-xl font-black text-slate-900 uppercase leading-tight tracking-tight">{selectedPopUp.Identity?.Product_Name}</h3>
                                </div>
                                <button onClick={() => setSelectedPopUp(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors group"><X size={20} className="text-slate-400" /></button>
                            </div>
                            
                            <div className="space-y-5">
                                {/* Section 1: Calculated Multiplier */}
                                <div className="p-5 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] text-white shadow-lg text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Calculated Value Added</p>
                                    <div className="flex items-center justify-center gap-1">
                                        <span className="text-5xl font-black tracking-tighter">{selectedPopUp.calculatedDetails?.score || "1.00"}</span>
                                        <span className="text-xl font-bold opacity-70">x</span>
                                    </div>
                                    <p className="text-[9px] mt-2 opacity-60 uppercase font-bold">Based on Internal Data Chain</p>
                                </div>

                                {/* Section 2: Dual Metrics Comparison */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* DATABASE METRICS */}
                                    <div className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                        <div className="flex items-center gap-2 mb-2 text-slate-400 border-b border-slate-200 pb-2">
                                            <Database size={12} /> <span className="text-[9px] font-black uppercase">Internal DB</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] font-medium text-slate-600"><span>Exp:</span> <span className="font-bold text-emerald-600">${Number(selectedPopUp.Market_Metrics?.Downstream_Export || selectedPopUp.Market_Metrics?.Export_Value || 0).toLocaleString('en-US', { notation: "compact" })}</span></div>
                                            <div className="flex justify-between text-[10px] font-medium text-slate-600"><span>Imp:</span> <span className="font-bold text-rose-600">${Number(selectedPopUp.Market_Metrics?.Downstream_Import || selectedPopUp.Market_Metrics?.Import_Value || 0).toLocaleString('en-US', { notation: "compact" })}</span></div>
                                        </div>
                                    </div>

                                    {/* COMTRADE API METRICS */}
                                    <div className="p-4 bg-blue-50 rounded-[1.5rem] border border-blue-100">
                                        <div className="flex items-center gap-2 mb-2 text-blue-400 border-b border-blue-200 pb-2">
                                            <Globe size={12} /> <span className="text-[9px] font-black uppercase">Comtrade API</span>
                                        </div>
                                        {selectedPopUp.Live_Metrics ? (
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] font-medium text-blue-800"><span>Exp:</span> <span className="font-bold">${Number(selectedPopUp.Live_Metrics.totalExport).toLocaleString('en-US', { notation: "compact" })}</span></div>
                                                <div className="flex justify-between text-[10px] font-medium text-blue-800"><span>Imp:</span> <span className="font-bold">${Number(selectedPopUp.Live_Metrics.totalImport).toLocaleString('en-US', { notation: "compact" })}</span></div>
                                            </div>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-[9px] text-blue-300 italic text-center">Data not fetched<br/>(Expand node to load)</div>
                                        )}
                                    </div>
                                </div>

                                {/* Section 3: Ancestors List (jika ada) */}
                                {selectedPopUp.calculatedDetails?.details?.parentList?.length > 0 && (
                                    <div className="p-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm max-h-40 overflow-y-auto custom-scrollbar">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Value Contribution (Ancestors)</p>
                                        <div className="space-y-2">
                                            {selectedPopUp.calculatedDetails.details.parentList.map((p, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-[10px] border-b border-dashed border-slate-100 pb-1 last:border-0">
                                                    <span className="font-bold text-slate-700 truncate max-w-[120px]">{p.name}</span>
                                                    <span className="font-mono text-slate-500">${p.val.toLocaleString('en-US', { notation: "compact" })}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const PohonIndustri = () => (
    <ReactFlowProvider>
        <PohonIndustriContent />
    </ReactFlowProvider>
);

export default PohonIndustri;