import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { Background, Controls, useNodesState, useEdgesState, addEdge, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { ref, onValue, set, remove } from 'firebase/database';
import { rtdb } from '../services/firebase';
import EditableNode from '@/components/child/EditableNode';
import { Loader2, Plus, Search, X } from 'lucide-react';

const NODE_TYPES = { editable: EditableNode };

const InputNodePage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [rawData, setRawData] = useState({}); 

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        setIsLoading(true);
        const dbRef = ref(rtdb, '/produk/');
        onValue(dbRef, (snapshot) => {
            const data = snapshot.val();
            if (data) setRawData(data);
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        if (searchTerm.length > 1) {
            const results = Object.entries(rawData).filter(([key, val]) => 
                val.Identity?.Product_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                val.Identity?.HS_Code?.toString().includes(searchTerm)
            ).slice(0, 8);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [searchTerm, rawData]);

    // FUNGSI: Build Tree (Recursive)
    const buildTreeData = (startKey, allData, startX = 100, startY = 100) => {
        const foundNodes = [];
        const foundEdges = [];
        const processed = new Set();

        const traverse = (currentKey, x, y) => {
            if (processed.has(currentKey)) return;
            processed.add(currentKey);
            const product = allData[currentKey];
            if (!product) return;

            foundNodes.push({
                id: `node-${currentKey}`,
                type: 'editable',
                position: { x, y },
                data: { 
                    ...product.Identity, ...product.Market_Metrics, 
                    Parents: product.Hierarchy?.Parents || [], status: 'saved'
                }
            });

            const children = Object.entries(allData).filter(([k, v]) => 
                v.Hierarchy?.Parents?.some(p => p.Harmony_ID.replace(/\./g, '_') === currentKey)
            );

            children.forEach(([childKey], index) => {
                foundEdges.push({
                    id: `e-${currentKey}-${childKey}`,
                    source: `node-${currentKey}`,
                    target: `node-${childKey}`,
                    type: 'smoothstep',
                    animated: true,
                    style: { stroke: '#38bdf8', strokeWidth: 2 },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' }
                });
                traverse(childKey, x + 550, y + (index * 450));
            });
        };
        traverse(startKey, startX, startY);
        return { foundNodes, foundEdges };
    };

    // 1. SEARCH: ADD WITHOUT RESET
    const handleSelectProduct = (key) => {
        setSearchTerm("");
        const { foundNodes, foundEdges } = buildTreeData(key, rawData, Math.random() * 200, Math.random() * 200);
        
        setNodes((nds) => {
            const existingIds = new Set(nds.map(n => n.id));
            const uniqueNewNodes = foundNodes.filter(n => !existingIds.has(n.id));
            return [...nds, ...uniqueNewNodes];
        });

        setEdges((eds) => {
            const existingIds = new Set(eds.map(e => e.id));
            const uniqueNewEdges = foundEdges.filter(e => !existingIds.has(e.id));
            return [...eds, ...uniqueNewEdges];
        });
    };

    // 2. CASCADING DELETE (Hapus Relasi di Anak saat Bapak dihapus)
    const handleDeleteNode = async (nodeId) => {
        const targetNode = nodes.find(n => n.id === nodeId);
        if (!targetNode) return;

        const deletedHarmonyID = targetNode.data.Harmony_ID;

        if (window.confirm(`Hapus node ${targetNode.data.Product_Name}?`)) {
            // A. Jika sudah di DB, hapus dari DB
            if (targetNode.data.status === 'saved') {
                setIsLoading(true);
                try {
                    const dbKey = deletedHarmonyID.replace(/\./g, '_');
                    await remove(ref(rtdb, `/produk/${dbKey}`));
                } catch (e) { console.error(e); }
                setIsLoading(false);
            }

            // B. Hapus Node & Edge miliknya dari UI
            setNodes((nds) => nds.filter((n) => n.id !== nodeId));
            setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));

            // C. LOGIKA ORPHAN: Hapus deletedHarmonyID dari semua array Parents milik node lain
            setNodes((nds) => nds.map(node => {
                if (node.data.Parents?.some(p => p.Harmony_ID === deletedHarmonyID)) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            Parents: node.data.Parents.filter(p => p.Harmony_ID !== deletedHarmonyID),
                            status: 'unsaved' // Tandai perlu sync ulang ke DB
                        }
                    };
                }
                return node;
            }));
        }
    };

    // 3. HAPUS RELASI (UNLINK)
    const handleUpdateParents = useCallback((nodeId, newParents) => {
        // Update Data Node
        setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, Parents: newParents, status: 'unsaved' } } : n));

        // Update Visual Garis (Hapus edge yang tidak ada di newParents)
        setEdges(eds => {
            // Simpan edge yang tidak menuju ke node ini
            const otherEdges = eds.filter(e => e.target !== nodeId);
            // Buat ulang edge hanya untuk parent yang masih ada
            const validEdges = newParents.map(p => {
                const parentKey = p.Harmony_ID.replace(/\./g, '_');
                return {
                    id: `e-${parentKey}-${nodeId.replace('node-','')}`,
                    source: `node-${parentKey}`,
                    target: nodeId,
                    type: 'smoothstep',
                    style: { stroke: '#38bdf8', strokeWidth: 2 },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' }
                };
            });
            return [...otherEdges, ...validEdges];
        });
    }, [setNodes, setEdges]);

    const onConnect = useCallback((params) => {
        const sourceNode = nodes.find(n => n.id === params.source);
        const targetNode = nodes.find(n => n.id === params.target);
        if (!sourceNode || !targetNode) return;

        const parentID = sourceNode.data.Harmony_ID;

        setNodes((nds) => nds.map((node) => {
            if (node.id === params.target) {
                const currentParents = node.data.Parents || [];
                if (currentParents.some(p => p.Harmony_ID === parentID)) return node;
                return { ...node, data: { ...node.data, status: 'unsaved', Parents: [...currentParents, { Harmony_ID: parentID }] } };
            }
            return node;
        }));

        setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true, style: { stroke: '#38bdf8', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' } }, eds));
    }, [nodes, setNodes, setEdges]);

    const handleInputChange = useCallback((id, field, value) => {
        setNodes(nds => nds.map(n => {
            if (n.id === id) {
                const newData = { ...n.data, [field]: value };
                if (field === 'HS_Code' || field === 'Product_Name') {
                    if (newData.HS_Code && newData.Product_Name) {
                        newData.Harmony_ID = `${newData.HS_Code}_${newData.Product_Name.trim().toLowerCase().replace(/\s+/g, '-')}`;
                    }
                }
                return { ...n, data: newData };
            }
            return n;
        }));
    }, [setNodes]);

    const handleSave = async (nodeId) => {
        const targetNode = nodes.find(n => n.id === nodeId);
        const d = targetNode.data;
        if (!d.Harmony_ID) return alert("ID Error");
        setIsLoading(true);
        try {
            const dbKey = d.Harmony_ID.replace(/\./g, '_');
            const payload = {
                Identity: { HS_Code: d.HS_Code, Product_Name: d.Product_Name, Harmony_ID: d.Harmony_ID, Tier: d.Tier || "Tier 1", Desc: d.Desc || "" },
                Hierarchy: { Parents: d.Parents || [] },
                Market_Metrics: { Export_Value: parseFloat(d.Export_Value || 0), Import_Value: parseFloat(d.Import_Value || 0), Market_Value_Technology: parseFloat(d.Market_Value_Technology || 0) }
            };
            await set(ref(rtdb, `/produk/${dbKey}`), payload);
            setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: 'saved' } } : n));
            alert("Database Synced");
        } catch (e) { alert(e.message); } finally { setIsLoading(false); }
    };

    const nodesWithCallbacks = useMemo(() => 
        nodes.map(n => ({
            ...n,
            data: { 
                ...n.data, 
                onInputChange: handleInputChange, 
                onUpdateParents: handleUpdateParents,
                onSave: () => handleSave(n.id),
                onDelete: () => handleDeleteNode(n.id)
            }
        })), [nodes, handleInputChange, handleUpdateParents]);

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-50 overflow-hidden flex flex-col">
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 w-full max-w-5xl px-6">
                <div className="relative flex-1 group">
                    <div className="flex items-center bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden focus-within:ring-4 ring-sky-500/10 transition-all">
                        <Search className="ml-4 text-slate-400" size={20} />
                        <input 
                            type="text"
                            placeholder="Cari & Tambah Produk ke Canvas..."
                            className="w-full pl-3 pr-4 py-4 bg-transparent outline-none text-sm font-semibold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {searchResults.length > 0 && (
                        <div className="absolute top-20 left-0 w-full bg-white border rounded-2xl shadow-2xl overflow-hidden z-[1000]">
                            {searchResults.map(([key, val]) => (
                                <button key={key} onClick={() => handleSelectProduct(key)} className="w-full text-left px-6 py-5 hover:bg-sky-50 flex justify-between items-center border-b last:border-0 group">
                                    <span className="font-bold text-slate-800 group-hover:text-sky-600">{val.Identity?.Product_Name}</span>
                                    <span className="text-[10px] bg-slate-100 px-3 py-1.5 rounded-lg font-mono text-slate-500 uppercase">{val.Identity?.HS_Code}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-2xl border border-slate-200">
                    <button onClick={() => setNodes(nds => [...nds, { id: `node-${Date.now()}`, type: 'editable', position: { x: 200, y: 200 }, data: { Product_Name: "New Product", HS_Code: "", Tier: "Tier 1", Parents: [], Market_Value_Technology: 0 } }])}
                        className="flex items-center gap-2 bg-sky-600 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-sky-700">
                        <Plus size={18} /> Add Node
                    </button>
                    <button onClick={() => { if(window.confirm("Clear All?")) { setNodes([]); setEdges([]); } }}
                        className="px-5 py-3 bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-[10px] font-black uppercase">
                        Clear Canvas
                    </button>
                </div>
            </div>

            {isLoading && <div className="absolute inset-0 z-[1000] bg-white/60 flex items-center justify-center"><Loader2 className="animate-spin text-sky-600" size={48} /></div>}

            <ReactFlow nodes={nodesWithCallbacks} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={NODE_TYPES} fitView>
                <Background variant="dots" gap={30} color="#e2e8f0" />
                <Controls className="!bg-white !shadow-2xl !border-none !rounded-2xl !overflow-hidden !m-10" />
            </ReactFlow>
        </div>
    );
};

export default InputNodePage;