import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { 
    Background, Controls, useNodesState, useEdgesState, 
    addEdge, MarkerType 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ref, onValue, set } from 'firebase/database';
import { rtdb } from '../services/firebase';
import EditableNode from '../components/EditableNode';
import IndustrialNode from '../components/IndustrialNode';
import { validateIndustrialNode } from '../utils/NodeValidator';
import { Loader2, Plus, Share2, ArrowRightLeft } from 'lucide-react';

const NODE_TYPES = { editable: EditableNode, industrial: IndustrialNode };

const InputNodePage = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [allData, setAllData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // State untuk Modal Pilihan Koneksi yang Cerdas
    const [pendingConnection, setPendingConnection] = useState(null);

    useEffect(() => {
        if (nodes.length === 0) addNewNode();
        const dbRef = ref(rtdb, '/produk/');
        return onValue(dbRef, (snapshot) => {
            const data = snapshot.val();
            if (data) setAllData(Array.isArray(data) ? data.filter(i => i !== null) : Object.values(data));
        });
    }, []);

    // --- FITUR: AUTO-CALCULATE SCORE ---
    const calculateStepScore = (data) => {
        const upstream = Number(data.Upstream_Export || 0);
        const downstream = Number(data.Downstream_Export || 0);
        const coeff = Number(data.Step_Score_Coefficient || 1);
        if (upstream === 0) return coeff;
        return (downstream / upstream) * coeff;
    };

    const addNewNode = useCallback(() => {
        const newId = `node-${Date.now()}`;
        setNodes((nds) => nds.concat({
            id: newId,
            type: 'editable',
            position: { x: 150, y: 150 },
            data: { 
                status: 'draft', Tier: "", Parent_ID: "", Product_Name: "Produk Baru", Harmony_ID: "",
                Process_Name: "", Upstream_Export: 0, Upstream_Import: 0,
                Downstream_Export: 0, Downstream_Import: 0,
                Step_Score_Coefficient: 1.0, Step_Score_Value: 0, Origin_Score_Value: 0,
                Step_Score_Formula: "(Downstream_Export / Upstream_Export) * Coefficient",
                Origin_Score_Formula: "Parent_Origin_Score + Step_Score_Value"
            }
        }));
    }, [setNodes]);

    const onConnect = useCallback((params) => {
        // Cari data node asli untuk ditampilkan di menu pilihan
        const sourceNode = nodes.find(n => n.id === params.source);
        const targetNode = nodes.find(n => n.id === params.target);
        
        setPendingConnection({
            ...params,
            sourceName: sourceNode?.data.Product_Name || "Produk A",
            targetName: targetNode?.data.Product_Name || "Produk B",
            sourceHarmony: sourceNode?.data.Harmony_ID,
            targetHarmony: targetNode?.data.Harmony_ID
        });
    }, [nodes]);

    // --- FITUR: DYNAMIC RELATION SELECTION ---
    const confirmConnection = (direction, relationType) => {
        if (!pendingConnection) return;

        // Tentukan siapa yang jadi Bapak dan siapa yang jadi Anak berdasarkan 'direction'
        // Normal: Source -> Target (Target jadi anak)
        // Inverted: Target -> Source (Source jadi anak)
        const isNormal = direction === 'normal';
        const parentId = isNormal ? pendingConnection.source : pendingConnection.target;
        const childId = isNormal ? pendingConnection.target : pendingConnection.source;
        
        const parentHarmony = nodes.find(n => n.id === parentId)?.data.Harmony_ID || "PENDING";

        const labels = { main: "Primary", byproduct: "By-Product", feedback: "Loopback" };
        const colors = { main: "#38bdf8", byproduct: "#f59e0b", feedback: "#10b981" };

        const newEdge = {
            id: `e-${parentId}-${childId}`,
            source: parentId,
            target: childId,
            label: labels[relationType],
            animated: relationType === 'feedback',
            style: { stroke: colors[relationType], strokeWidth: 3 },
            markerEnd: { type: MarkerType.ArrowClosed, color: colors[relationType] },
            labelStyle: { fill: '#64748b', fontWeight: 800, fontSize: 10 }
        };

        setEdges((eds) => addEdge(newEdge, eds));

        // Update State Parent_ID pada Node yang menjadi Anak
        setNodes((nds) => nds.map((node) => {
            if (node.id === childId) {
                return { ...node, data: { ...node.data, Parent_ID: parentHarmony, Relation_Type: relationType } };
            }
            return node;
        }));

        setPendingConnection(null);
    };

    const handleInputChange = useCallback((id, field, value) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                const newData = { ...node.data, [field]: value };
                if (['Upstream_Export', 'Downstream_Export', 'Step_Score_Coefficient'].includes(field)) {
                    newData.Step_Score_Value = calculateStepScore(newData);
                }
                return { ...node, data: newData };
            }
            return node;
        }));
    }, [setNodes]);

    const handleSave = async (nodeId) => {
        const targetNode = nodes.find(n => n.id === nodeId);
        if (!targetNode || !targetNode.data.Harmony_ID) return alert("Harmony ID wajib diisi!");
        
        try {
            setIsLoading(true);
            const sanitizedKey = targetNode.data.Harmony_ID.replace(/\./g, '_');
            const dbPath = ref(rtdb, `/produk/${sanitizedKey}`);
            const dataToSave = {
                ...targetNode.data,
                status: 'saved',
                Upstream_Export: Number(targetNode.data.Upstream_Export || 0),
                Downstream_Export: Number(targetNode.data.Downstream_Export || 0),
                Step_Score_Value: Number(targetNode.data.Step_Score_Value || 0)
            };
            delete dataToSave.onInputChange; delete dataToSave.onSave; delete dataToSave.onDelete;
            await set(dbPath, dataToSave);
            setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: 'saved' } } : n));
            alert("Data Disimpan!");
        } catch (err) {
            alert(err.message);
        } finally { setIsLoading(false); }
    };

    const nodesWithCallbacks = useMemo(() => 
        nodes.map(node => node.type === 'editable' ? {
            ...node,
            data: { 
                ...node.data, 
                onInputChange: handleInputChange, 
                onSave: () => handleSave(node.id),
                onDelete: () => setNodes(nds => nds.filter(n => n.id !== node.id))
            }
        } : node), [nodes, handleInputChange]);

    return (
        <div className="h-screen w-full bg-slate-50 relative overflow-hidden">
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-white/90 backdrop-blur-md p-3 rounded-3xl shadow-2xl border border-slate-200">
                <button onClick={addNewNode} className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                    <Plus size={16} /> Add Industrial Node
                </button>
            </div>

            {/* MODAL PILIHAN KONEKSI YANG DINAMIS */}
            {pendingConnection && (
                <div className="absolute inset-0 z-[1100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 max-w-lg w-full animate-in zoom-in duration-300">
                        <div className="flex items-center gap-4 text-sky-600 mb-6 font-black uppercase tracking-tighter">
                            <ArrowRightLeft size={32} /> 
                            <div>
                                <h3 className="text-lg">Konfigurasi Hubungan</h3>
                                <p className="text-[10px] text-slate-400 tracking-widest">Pilih arah aliran data industri</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* OPSI 1: NORMAL DIRECTION */}
                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 group hover:border-sky-400 transition-all">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-4">Arah: {pendingConnection.sourceName} → {pendingConnection.targetName}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => confirmConnection('normal', 'main')} className="py-3 bg-sky-600 text-white rounded-xl text-[9px] font-black uppercase">Utama (Child)</button>
                                    <button onClick={() => confirmConnection('normal', 'byproduct')} className="py-3 bg-amber-500 text-white rounded-xl text-[9px] font-black uppercase">By-Product</button>
                                </div>
                            </div>

                            {/* OPSI 2: INVERTED DIRECTION */}
                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 group hover:border-emerald-400 transition-all">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-4">Arah Terbalik: {pendingConnection.targetName} → {pendingConnection.sourceName}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => confirmConnection('inverted', 'main')} className="py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase">Utama (Child)</button>
                                    <button onClick={() => confirmConnection('inverted', 'feedback')} className="py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase">Feedback Loop</button>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setPendingConnection(null)} className="w-full mt-6 text-slate-400 text-[10px] font-black uppercase underline">Batalkan Koneksi</button>
                    </div>
                </div>
            )}

            <ReactFlow nodes={nodesWithCallbacks} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={NODE_TYPES} fitView>
                <Background variant="dots" gap={20} color="#cbd5e1" />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default InputNodePage;