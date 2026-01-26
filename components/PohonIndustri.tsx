import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    ReactFlowProvider,
    useViewport,
    useReactFlow,
    addEdge,
    Node,
    Edge
} from 'reactflow';
import 'reactflow/dist/style.css';

// Firebase RTDB
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../assets/firebase';

import {
    Search,
    X,
    Download,
    PlusCircle
} from 'lucide-react';

// Helper & Components
import IndustrialNode from './IndustrialNode';
import DataModal from './DataModal';
import { saveToFirebase, createRelationship, deleteFromFirebase } from '../assets/firebaseUtils';
import { calculateValueAdded } from '../assets/valueAddedCalculator';
import { Page } from '@/types';

interface PohonIndustriNodeData {
    Desc: string;
    Export_Value: number;
    HS_Code: string;
    Harmony_ID: string;
    Import_Value: number;
    Market_Value_Technology: number;
    Parents?: {
        Harmony_ID: string;
        Process_Name: string;
    }[];
    Process_Name: string;
    Product_Name: string;
    Tier: string;
    isExpanded?: boolean;
    onToggleExpand?: (id: string) => void;
    onShowDetail?: (data: PohonIndustriNodeData) => void;
    onEdit?: (data: PohonIndustriNodeData) => void;
    onDelete?: (data: PohonIndustriNodeData) => void;
    onExpandChildren?: (id: string) => void;
    onExpandParent?: (id: string) => void;
    onHideChildren?: (id: string) => void;
    onHideParent?: (id: string) => void;
    calculateValueAdded?: (data: PohonIndustriNodeData) => { score: number, isRaw: boolean, details: any };
}

const nodeTypes = { industrial: IndustrialNode };

// --- KOMPONEN ZOOM DISPLAY ---
const ZoomDisplay = () => {
    const { zoom } = useViewport();
    return (
        <div className="absolute bottom-6 right-24 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 shadow-sm z-10 font-black text-slate-500 text-[10px] uppercase tracking-widest flex items-center gap-2 font-sans">
            <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse"></div>
            Zoom: {Math.round(zoom * 100)}%
        </div>
    );
};

interface PohonIndustriContentProps {
    setPage: (page: Page) => void;
}

const PohonIndustriContent: React.FC<PohonIndustriContentProps> = ({ setPage }) => {
    const { setCenter, getNodes } = useReactFlow();

    // --- STATE UTAMA ---
    const [allData, setAllData] = useState<PohonIndustriNodeData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Modal & PopUp State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{mode: 'add' | 'edit', initialData: Partial<PohonIndustriNodeData>}>({ mode: 'add', initialData: {} });
    const [selectedPopUp, setSelectedPopUp] = useState<PohonIndustriNodeData | null>(null);

    // 1. SINKRONISASI DATA FIREBASE
    useEffect(() => {
        const dbRef = ref(rtdb, '/');
        return onValue(dbRef, (snapshot) => {
            const data = snapshot.val();
            if (data && typeof data === 'object') {
                const formatted = Object.values(data).filter(item => (item as PohonIndustriNodeData)?.Harmony_ID);
                setAllData(formatted as PohonIndustriNodeData[]);
            }
        });
    }, []);

    // --- HANDLERS INTERAKSI NODE (DIDEFINISIKAN SEBELUM ENGINE) ---

    const onShowDetail = useCallback((nodeData: PohonIndustriNodeData) => {
        setSelectedPopUp(nodeData);
    }, []);

    const onToggleExpand = useCallback((id: string) => {
        setNodes((nds: Node<PohonIndustriNodeData>[]) => nds.map(n => n.id === id ? {...n, data: {...n.data, isExpanded: !n.data.isExpanded } } : n));
    }, [setNodes]);

    // Fungsi sembunyikan jalur (Requirement 1)
    const onHideBranch = useCallback((id: string, direction: 'up' | 'down') => {
        const getRelatedIds = (startId: string, dir: 'up' | 'down', collected: Set<string> = new Set()): Set<string> => {
            collected.add(startId);
            const relatedEdges = edges.filter(e => dir === 'down' ? e.source === startId : e.target === startId);
            relatedEdges.forEach(e => {
                const nextId = dir === 'down' ? e.target : e.source;
                if (!collected.has(nextId)) getRelatedIds(nextId, dir, collected);
            });
            return collected;
        };

        const idsToRemove = getRelatedIds(id, direction);
        idsToRemove.delete(id); // Sembunyikan anak/bapaknya saja, node utama tetap

        setNodes(nds => nds.filter(n => !idsToRemove.has(n.id)));
        setEdges(eds => eds.filter(e => !idsToRemove.has(e.source) && !idsToRemove.has(e.target)));
    }, [edges, setNodes, setEdges]);

    // --- CRUD HANDLERS ---

    const handleEditNode = useCallback((nodeData: PohonIndustriNodeData) => {
        setModalConfig({ mode: 'edit', initialData: nodeData });
        setIsModalOpen(true);
    }, []);

    const handleDeleteNode = useCallback(async (nodeData: PohonIndustriNodeData) => {
        if (window.confirm(`Hapus "${nodeData.Product_Name}"?`)) {
            try {
                await deleteFromFirebase(nodeData);
                setNodes(nds => nds.filter(n => n.id !== nodeData.Harmony_ID));
                setEdges(eds => eds.filter(e => e.source !== nodeData.Harmony_ID && e.target !== nodeData.Harmony_ID));
            } catch (err) { console.error(err); }
        }
    }, [setNodes, setEdges]);

    const handleAddNewProduct = useCallback(() => {
        setModalConfig({ mode: 'add', initialData: { Parent_ID: 'ROOT' } as any });
        setIsModalOpen(true);
    }, []);

    // Helper Factory Node
    const createNodeInstance = useCallback((item: PohonIndustriNodeData, x: number, y: number): Node<PohonIndustriNodeData> => ({
        id: item.Harmony_ID,
        type: 'industrial',
        data: {
            ...item,
            isExpanded: false,
            onToggleExpand,
            onShowDetail,
            onEdit: handleEditNode,
            onDelete: handleDeleteNode,
            onExpandChildren: (hid: string) => buildIntegratedTree(allData.find(x => x.Harmony_ID === hid)),
            onExpandParent: (hid: string) => buildIntegratedTree(allData.find(x => x.Harmony_ID === hid)),
            onHideChildren: (id: string) => onHideBranch(id, 'down'),
            onHideParent: (id: string) => onHideBranch(id, 'up'),
            calculateValueAdded: (d: any) => calculateValueAdded(d, allData)
        },
        position: { x, y }
    }), [allData, onToggleExpand, onShowDetail, handleEditNode, handleDeleteNode, onHideBranch]);

    // Save Logic (Instant Injection - Requirement 2)
    const handleSaveData = async (formData: PohonIndustriNodeData) => {
        try {
            await saveToFirebase(formData, modalConfig.mode);
            setIsModalOpen(false);

            if (modalConfig.mode === 'add') {
                const currentNodes = getNodes();
                const position = currentNodes.length > 0 ? { x: currentNodes[0].position.x, y: currentNodes[currentNodes.length - 1].position.y + 350 } : { x: 0, y: 0 };

                const newNode = createNodeInstance(formData, position.x, position.y);
                setNodes(prev => [...prev, newNode]);

                setTimeout(() => setCenter(position.x + 150, position.y + 50, { zoom: 1, duration: 1200 }), 100);
            } else {
                setNodes((nds: Node<PohonIndustriNodeData>[]) => nds.map(n => n.id === formData.Harmony_ID ? {...n, data: {...n.data, ...formData } } : n));
            }
        } catch (error: any) { alert(error.message); }
    };

    // --- ENGINE UTAMA: BUILD TREE ---
    const buildIntegratedTree = useCallback((selectedProduct?: PohonIndustriNodeData) => {
        if (!selectedProduct || !allData.length) return;

        const nodesMap = new Map<string, PohonIndustriNodeData>();
        const edgesMap = new Map<string, Partial<Edge>>();

        const traverse = (harmonyId: string, direction = 'both') => {
            if (nodesMap.has(harmonyId)) return;
            const entries = allData.filter(i => i.Harmony_ID === harmonyId);
            if (entries.length === 0) return;
            nodesMap.set(harmonyId, entries[0]);

            if (direction === 'both' || direction === 'up') {
                entries.forEach(entry => {
                    const parents = entry.Parents || [];
                    parents.forEach((pRef: any) => {
                        const pData = allData.find(x => x.Harmony_ID === pRef.Harmony_ID);
                        if (pData) {
                            edgesMap.set(`${pRef.Harmony_ID}-${harmonyId}`, { source: pRef.Harmony_ID, target: harmonyId, label: pRef.Process_Name });
                            if (direction === 'both') traverse(pRef.Harmony_ID, 'up');
                        }
                    });
                });
            }

            if (direction === 'both' || direction === 'down') {
                const children = allData.filter(item => item.Parents && item.Parents.some((p: any) => p.Harmony_ID === harmonyId));
                children.forEach(child => {
                    const rel = child.Parents?.find((p: any) => p.Harmony_ID === harmonyId);
                    edgesMap.set(`${harmonyId}-${child.Harmony_ID}`, { source: harmonyId, target: child.Harmony_ID, label: rel.Process_Name });

                    child.Parents?.forEach((otherParent: any) => {
                        if (otherParent.Harmony_ID !== harmonyId) {
                            const opData = allData.find(x => x.Harmony_ID === otherParent.Harmony_ID);
                            if (opData && !nodesMap.has(otherParent.Harmony_ID)) {
                                nodesMap.set(otherParent.Harmony_ID, opData);
                                edgesMap.set(`${otherParent.Harmony_ID}-${child.Harmony_ID}`, { source: otherParent.Harmony_ID, target: child.Harmony_ID, label: otherParent.Process_Name });
                                if (direction === 'both') traverse(otherParent.Harmony_ID, 'up');
                            }
                        }
                    });
                    traverse(child.Harmony_ID, 'down');
                });
            }
        };

        traverse(selectedProduct.Harmony_ID);

        const getDepth = (id: string) => {
            const item = allData.find(i => i.Harmony_ID === id);
            let d = 0;
            let curr = item;
            while (curr?.Parents && curr.Parents.length > 0) {
                d++;
                curr = allData.find(x => x.Harmony_ID === curr!.Parents![0].Harmony_ID);
                if (d > 12) break;
            }
            return d;
        };

        const nodesByLevel: {[key: number]: number} = {};
        const finalNodes = Array.from(nodesMap.values()).map(item => {
            const level = getDepth(item.Harmony_ID);
            if (!nodesByLevel[level]) nodesByLevel[level] = 0;
            const rank = nodesByLevel[level]++;
            return createNodeInstance(item, level * 520, rank * 350);
        });

        setNodes(finalNodes);
        setEdges(Array.from(edgesMap.values()).map((e, idx) => ({
            id: `e-${idx}`,
            ...e,
            animated: true,
            type: 'smoothstep',
            style: { stroke: '#ef4444', strokeWidth: 3 },
            labelStyle: { fill: '#ef4444', fontWeight: 800, fontSize: 8, textTransform: 'uppercase' }
        })));

        setSearchTerm("");
        setTimeout(() => {
            const n = finalNodes.find(x => x.id === selectedProduct.Harmony_ID);
            if (n) setCenter(n.position.x + 150, n.position.y, { zoom: 0.75, duration: 1200 });
        }, 150);
    }, [allData, createNodeInstance, setNodes, setEdges, setCenter]);

    return (
        <div className="flex-1 flex flex-col overflow-hidden relative bg-white">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-8 bg-white border-b border-slate-100 shadow-sm z-10 font-sans">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-1 leading-none tracking-tighter">Pohon Industri Nusantara</h2>
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-1">Visualisasi Rantai Pasok dan Hilirisasi Industri Nasional</p>
                </div>
                <div className="flex gap-4 font-sans">
                     <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500" size={14} />
                        <input
                            type="text"
                            placeholder="Cari HS / Nama Produk..."
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-sky-100"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                         {searchTerm && (
                            <div className="absolute top-full mt-2 w-full bg-white shadow-lg rounded-xl border border-slate-100 z-20 max-h-60 overflow-y-auto">
                                {allData.filter(i => i.Product_Name?.toLowerCase().includes(searchTerm.toLowerCase())).map((item, idx) => (
                                    <button
                                        key={`${item.Harmony_ID}-${idx}`}
                                        onClick={() => buildIntegratedTree(item)}
                                        className="w-full text-left p-3 hover:bg-sky-50 transition-all border-b border-slate-50 last:border-b-0"
                                    >
                                        <p className="text-sm font-bold text-slate-700">{item.Product_Name}</p>
                                        <p className="text-xs text-slate-400">HS {item.HS_Code}</p>
                                    </button>
                                ))
                                }
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleAddNewProduct}
                        className="bg-sky-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-sky-100 hover:bg-sky-700 transition-all font-sans flex items-center gap-2"
                    >
                        <PlusCircle size={16} /> Tambah Produk
                    </button>
                    <button className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all font-sans flex items-center gap-2">
                        <Download size={16} /> Export Report
                    </button>
                </div>
            </header>

            <div className="flex-1 relative bg-white overflow-hidden font-sans">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    onConnect={async (params) => {
                        setEdges((eds) => addEdge({ ...params, animated: true, type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 3 } }, eds));
                        await createRelationship(params.source as string, params.target as string);
                    }}
                >
                    <Background color="#cbd5e1" gap={30} size={1} variant="dots" />
                    <Controls className="bg-white shadow-2xl rounded-xl border-none ml-4 mb-4 overflow-hidden" />
                    <ZoomDisplay />
                </ReactFlow>

                {selectedPopUp && (() => {
                const valAdded = calculateValueAdded(selectedPopUp, allData);
                return (
                    <div className="absolute top-10 right-10 w-[420px] bg-white/95 backdrop-blur-md shadow-[0_25px_60px_rgba(0,0,0,0.2)] rounded-[2.5rem] p-8 border border-slate-100 z-[100] animate-in slide-in-from-right duration-300 font-sans max-h-[85vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                            <div>
                                <p className="text-[9px] font-black text-sky-600 uppercase tracking-[0.2em] mb-1.5">{selectedPopUp.Tier}</p>
                                <h3 className="text-xl font-black text-slate-900 uppercase leading-tight tracking-tight">{selectedPopUp.Product_Name}</h3>
                            </div>
                            <button onClick={() => setSelectedPopUp(null)} className="p-2 bg-slate-50 hover:bg-red-50 rounded-full transition-colors group">
                                <X size={20} className="text-slate-300 group-hover:text-red-500" />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div className="p-6 bg-gradient-to-br from-sky-600 to-indigo-700 rounded-3xl text-white shadow-xl shadow-sky-100 text-center relative overflow-hidden">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Total Multiplier (Full Chain)</p>
                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-6xl font-black tracking-tighter">{valAdded.score}</span>
                                    <span className="text-2xl font-bold opacity-60">x</span>
                                </div>
                                <div className="mt-3 pt-3 border-t border-white/20 text-[9px] uppercase font-bold opacity-60">
                                    {valAdded.isRaw ? "Bahan Baku Dasar" : `Dihitung dari ${valAdded.details.parentList.length} Leluhur`}
                                </div>
                            </div>
                            {!valAdded.isRaw && (
                                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 font-sans">Rantai Nilai Hulu (Ancestors)</p>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                        {valAdded.details.parentList.map((p: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center text-[10px] font-mono text-slate-600 border-b border-dashed border-slate-200 pb-1.5 last:border-0 last:pb-0 font-sans">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 truncate max-w-[180px] font-sans">{p.name}</span>
                                                    <span className="text-[8px] opacity-60 uppercase font-sans">HS {p.hs}</span>
                                                </div>
                                                <span className="font-black text-sky-700 font-sans">${p.val.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200 text-xs font-black text-slate-800 uppercase tracking-tighter font-sans">
                                        <span>Total Input Hulu</span>
                                        <span>${valAdded.details.totalParentValue.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    );
                })()}
            </div>

            <DataModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveData}
                initialData={modalConfig.initialData}
                mode={modalConfig.mode}
                allData={allData}
            />
        </div>
    );
};

const PohonIndustri = ({ setPage }: { setPage: (page: Page) => void; }) => (
    <ReactFlowProvider>
        <PohonIndustriContent setPage={setPage} />
    </ReactFlowProvider>
);

export default PohonIndustri;
