/**
 * Menghitung Multiplier Score dengan Logika Rekursif
 * UPDATE: Tier 0 diabaikan dalam kalkulasi, sehingga Tier 1 menjadi Baseline (1.00x)
 */
export const calculateValueAdded = (nodeData, allData) => {
    // 1. Safety Check
    if (!nodeData || !allData || allData.length === 0) {
        return { score: "1.00", isRaw: true, details: null };
    }

    const safeNum = (val) => {
        const n = Number(val);
        return isNaN(n) ? 0 : n;
    };

    const getMetrics = (n) => n.Market_Metrics || {};

    // Helper: Hitung Gross Value (Tech + Export)
    const getNodeValue = (n) => {
        const m = getMetrics(n);
        const exp = m.Downstream_Export !== undefined ? safeNum(m.Downstream_Export) : safeNum(m.Export_Value);
        const mvt = safeNum(m.Market_Value_Technology);
        
        // Value = Tech + Export (Gross Output)
        return Math.max(0, mvt + exp); 
    };

    // --- 2. HITUNG NILAI NODE INI (CHILD) ---
    const childTotalValue = getNodeValue(nodeData);

    // --- 3. KOLEKSI LELUHUR (REKURSIF) ---
    let ancestorsMap = new Map();
    let visitedKeys = new Set(); 

    const findAncestorsRecursive = (currentNode) => {
        const currentKey = currentNode.dbKey || currentNode.Identity?.Harmony_ID;
        if (visitedKeys.has(currentKey)) return;
        visitedKeys.add(currentKey);

        const parents = currentNode.Hierarchy?.Parents || [];

        parents.forEach(pRef => {
            if (!pRef.Harmony_ID) return;

            // Dual Search Strategy
            const parentNode = allData.find(i => 
                i.dbKey === pRef.Harmony_ID || 
                i.Identity?.Harmony_ID === pRef.Harmony_ID
            );

            if (parentNode) {
                const pKey = parentNode.dbKey || parentNode.Identity?.Harmony_ID;
                if (!ancestorsMap.has(pKey)) {
                    ancestorsMap.set(pKey, parentNode);
                    findAncestorsRecursive(parentNode);
                }
            }
        });
    };

    findAncestorsRecursive(nodeData);

    // --- 4. AGREGASI NILAI LELUHUR (DENGAN FILTER TIER 0) ---
    let totalAncestorsValue = 0;
    const detailedAncestorList = [];

    ancestorsMap.forEach((node) => {
        const val = getNodeValue(node);
        const tierString = node.Identity?.Tier || "";
        
        // [LOGIC CHANGE] Deteksi apakah node ini Tier 0
        const isTier0 = tierString.includes("Tier 0") || tierString.toLowerCase().includes("hulu tambang");

        // HANYA jumlahkan nilai jika BUKAN Tier 0
        if (!isTier0) {
            totalAncestorsValue += val;
        }

        // Tapi tetap masukkan ke list detail untuk keperluan UI (Visualisasi)
        detailedAncestorList.push({
            name: node.Identity?.Product_Name || "Unknown",
            hs: node.Identity?.HS_Code || "N/A",
            val: val,
            tier: tierString,
            excluded: isTier0 // Flag untuk UI jika ingin memberi tanda
        });
    });

    // --- 5. KALKULASI FINAL ---
    let multiplier = 1.00;
    let isRaw = false;

    // Logika Baseline Baru:
    // Jika totalAncestorsValue == 0, artinya leluhurnya hanya Tier 0 (atau tidak punya leluhur).
    // Maka Node ini adalah "Start of Value Chain" (Tier 1).
    
    if (totalAncestorsValue > 0) {
        // Rumus Multiplier: (Nilai Anak + Nilai Input Olahan) / Nilai Input Olahan
        multiplier = (childTotalValue + totalAncestorsValue) / totalAncestorsValue;
    } else {
        // Fallback ke 1.00 untuk Tier 1 (karena pembaginya Tier 0 yang diabaikan)
        multiplier = 1.00;
        isRaw = true; // Dianggap raw material dalam konteks industri pengolahan
    }

    // Cap visual agar tidak overflow
    if (multiplier > 1000) multiplier = 999.9;

    return {
        score: multiplier.toFixed(2),
        isRaw: isRaw,
        details: {
            childValue: childTotalValue,
            totalParentValue: totalAncestorsValue,
            parentList: detailedAncestorList
        }
    };
};