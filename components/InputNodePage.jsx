import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { Background, Controls, useNodesState, useEdgesState, addEdge, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { ref, onValue, set } from 'firebase/database';
import { rtdb } from '../services/firebase';
import EditableNode from '@/components/child/EditableNode';
import IndustrialNode from '@/components/child/IndustrialNode';
import { validateIndustrialNode } from '../utils/NodeValidator';
import { Loader2, Plus, Share2, ArrowRightLeft } from 'lucide-react';

const NODE_TYPES = { editable: EditableNode, industrial: IndustrialNode };

const InputNodePage = () => {
    const [allData, setAllData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [nodes, setNodes, onNodesChange] = useNodesState([
        {
            id: `node-${Date.now()}`,
            type: 'editable',
            position: { x: 150, y: 150 },
            data: { 
                status: 'draft', Tier: "", Parent_ID: "", Product_Name: "New Industrial Entity", Harmony_ID: "",
                Process_Name: "", Upstream_Export: 0, Upstream_Import: 0, Downstream_Export: 0, Downstream_Import: 0,
                Step_Score_Coefficient: 1.0, Step_Score_Value: 0, Origin_Score_Value: 0
            }
        }
    ]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [pendingConnection, setPendingConnection] = useState(null);

    useEffect(() => {
        const dbRef = ref(rtdb, '/produk/');
        return onValue(dbRef, (snapshot) => {
            const data = snapshot.val();
            if (data) setAllData(Array.isArray(data) ? data.filter(i => i !== null) : Object.values(data));
        });
    }, []);

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
            id: newId, type: 'editable', position: { x: 100, y: 100 },
            data: { ...nds[0]?.data, status: 'draft', Harmony_ID: "", Product_Name: "New Product" }
        }));
    }, [setNodes]);

    const onConnect = useCallback((params) => {
        const sourceNode = nodes.find(n => n.id === params.source);
        const targetNode = nodes.find(n => n.id === params.target);
        setPendingConnection({
            ...params,
            sourceName: sourceNode?.data.Product_Name || "Node A",
            targetName: targetNode?.data.Product_Name || "Node B"
        });
    }, [nodes]);

    const confirmConnection = (direction, relationType) => {
        if (!pendingConnection) return;
        const isNormal = direction === 'normal';
        const parentId = isNormal ? pendingConnection.source : pendingConnection.target;
        const childId = isNormal ? pendingConnection.target : pendingConnection.source;
        const parentHarmony = nodes.find(n => n.id === parentId)?.data.Harmony_ID || "PENDING";

        setEdges((eds) => addEdge({
            id: `e-${parentId}-${childId}`, source: parentId, target: childId,
            animated: relationType === 'feedback',
            style: { stroke: direction === 'normal' ? '#38bdf8' : '#10b981', strokeWidth: 3 },
            markerEnd: { type: MarkerType.ArrowClosed, color: direction === 'normal' ? '#38bdf8' : '#10b981' }
        }, eds));

        setNodes((nds) => nds.map((node) => {
            if (node.id === childId) return { ...node, data: { ...node.data, Parent_ID: parentHarmony } };
            return node;
        }));
        setPendingConnection(null);
    };

    // --- FIX UX: LOGIKA PEMBERSIHAN INPUT ANGKA ---
    const handleInputChange = useCallback((id, field, value) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                let processedValue = value;

                // Cek apakah field bersifat numerik
                const numericFields = [
                    'Upstream_Export', 'Upstream_Import', 
                    'Downstream_Export', 'Downstream_Import', 
                    'Step_Score_Coefficient', 'Origin_Score_Value'
                ];

                if (numericFields.includes(field)) {
                    // Jika kosong, biarkan kosong sementara agar user bisa menghapus angka
                    // Jika ada isinya, bersihkan leading zero menggunakan Number()
                    if (value === "") {
                        processedValue = 0;
                    } else {
                        processedValue = parseFloat(value);
                    }
                }

                const newData = { ...node.data, [field]: processedValue };
                
                // Trigger auto-calculate
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
        if (!targetNode || !targetNode.data.Harmony_ID) return alert("Harmony ID wajib diisi.");

        let compoundedMultiplier = Number(targetNode.data.Step_Score_Value || 0);
        if (targetNode.data.Parent_ID && targetNode.data.Parent_ID.toUpperCase() !== 'ROOT') {
            const parent = allData.find(item => item.Harmony_ID === targetNode.data.Parent_ID);
            if (parent) compoundedMultiplier *= Number(parent.Origin_Score_Value || 1);
        }

        try {
            setIsLoading(true);
            const sanitizedKey = targetNode.data.Harmony_ID.replace(/\./g, '_');
            const dbPath = ref(rtdb, `/produk/${sanitizedKey}`);
            const dataToSave = { ...targetNode.data, Origin_Score_Value: compoundedMultiplier, status: 'saved' };
            
            delete dataToSave.onInputChange; delete dataToSave.onSave; delete dataToSave.onDelete; delete dataToSave.registry;
            
            await set(dbPath, dataToSave);
            setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: 'saved', Origin_Score_Value: compoundedMultiplier } } : n));
            alert("Database Synced!");
        } catch (err) { alert(err.message); } finally { setIsLoading(false); }
    };

    const nodesWithCallbacks = useMemo(() => 
        nodes.map(node => node.type === 'editable' ? {
            ...node,
            data: { 
                ...node.data, onInputChange: handleInputChange, onSave: () => handleSave(node.id),
                onDelete: () => setNodes(nds => nds.filter(n => n.id !== node.id)),
                registry: allData
            }
        } : node), [nodes, handleInputChange, allData]);

    return (
        <div className="h-screen w-full bg-slate-50 relative overflow-hidden">
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-white/90 backdrop-blur-md p-3 rounded-3xl shadow-2xl border border-slate-100">
                <button onClick={addNewNode} className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                    <Plus size={16} /> Add Industrial Node
                </button>
            </div>

            {pendingConnection && (
                <div className="absolute inset-0 z-[1100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 max-w-lg w-full">
                        <ArrowRightLeft size={32} className="text-sky-600 mb-6" />
                        <h3 className="text-lg font-black uppercase tracking-widest mb-2">Relasi Alur</h3>
                        <p className="text-[10px] text-slate-400 mb-8 uppercase tracking-widest">{pendingConnection.sourceName} ↔ {pendingConnection.targetName}</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => confirmConnection('normal', 'main')} className="py-4 bg-sky-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-sky-100">Normal</button>
                            <button onClick={() => confirmConnection('inverted', 'main')} className="py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100">Inverted</button>
                        </div>
                        <button onClick={() => setPendingConnection(null)} className="w-full mt-6 text-slate-400 text-[10px] font-black uppercase underline">Batal</button>
                    </div>
                </div>
            )}

            {isLoading && <div className="absolute inset-0 z-[1000] bg-white/60 flex items-center justify-center"><Loader2 className="animate-spin text-sky-600" size={48} /></div>}
            
            <ReactFlow nodes={nodesWithCallbacks} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={NODE_TYPES} fitView>
                <Background variant="dots" gap={20} color="#cbd5e1" />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default InputNodePage;