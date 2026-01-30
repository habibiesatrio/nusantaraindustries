/**
 * HIGH PERFORMANCE CALCULATOR
 * Optimized for 12k+ nodes using Hash Map Lookup (O(1))
 */
export const calculateValueAdded = (nodeData, dataMap) => {
    // 1. Safety Check
    if (!nodeData || !dataMap || dataMap.size === 0) {
        return { score: "1.00", isRaw: true, details: null };
    }

    const safeNum = (val) => {
        const n = Number(val);
        return isNaN(n) ? 0 : n;
    };

    const getMetrics = (n) => n.Market_Metrics || {};

    const getNodeValue = (n) => {
        const m = getMetrics(n);
        const exp = m.Downstream_Export !== undefined ? safeNum(m.Downstream_Export) : safeNum(m.Export_Value);
        const mvt = safeNum(m.Market_Value_Technology);
        return Math.max(0, exp + mvt); 
    };

    // --- HITUNG NILAI ANAK ---
    const childTotalValue = getNodeValue(nodeData);

    // --- TRAVERSAL REKURSIF (OPTIMIZED) ---
    let ancestorsMap = new Map();
    let visitedKeys = new Set(); 

    const findAncestorsRecursive = (currentNode) => {
        const currentKey = currentNode.dbKey;
        if (visitedKeys.has(currentKey)) return;
        visitedKeys.add(currentKey);

        const parents = currentNode.Hierarchy?.Parents || [];

        for (const pRef of parents) {
            if (!pRef.Harmony_ID) continue;

            // [PERFORMANCE FIX] Gunakan Map.get() - INSTANT LOOKUP
            // Mencoba cari langsung via key
            let parentNode = dataMap.get(pRef.Harmony_ID);

            // Fallback: Jika ID di DB berbeda format (misal underscore vs titik), kita perlu normalisasi
            // Namun untuk performa 12k data, DISARANKAN data di DB sudah konsisten key-nya.
            // Jika tidak, kita terpaksa scan (hindari ini jika bisa).
            
            if (parentNode) {
                if (!ancestorsMap.has(parentNode.dbKey)) {
                    ancestorsMap.set(parentNode.dbKey, parentNode);
                    findAncestorsRecursive(parentNode);
                }
            }
        }
    };

    findAncestorsRecursive(nodeData);

    // --- AGREGASI ---
    let totalInputVal = 0;
    const detailedAncestorList = [];

    ancestorsMap.forEach((node) => {
        const val = getNodeValue(node);
        const tierStr = node.Identity?.Tier || "";
        const isTier0 = tierStr.includes("Tier 0") || tierStr.toLowerCase().includes("hulu");

        if (!isTier0) {
            totalInputVal += val;
        }

        detailedAncestorList.push({
            name: node.Identity?.Product_Name || "Unknown",
            hs: node.Identity?.HS_Code || "N/A",
            val: val,
            tier: tierStr,
            isExcluded: isTier0
        });
    });

    // --- FINAL SCORE ---
    let multiplier = 1.00;
    let isRaw = false;

    if (ancestorsMap.size === 0) {
        multiplier = 1.00;
        isRaw = true;
    } else if (totalInputVal > 0) {
        multiplier = (childTotalValue + totalInputVal) / totalInputVal;
    } else {
        multiplier = 1.00;
        isRaw = true; 
    }

    if (multiplier > 999) multiplier = 999.9;

    return {
        score: multiplier.toFixed(2),
        isRaw: isRaw,
        details: {
            childValue: childTotalValue,
            totalParentValue: totalInputVal,
            parentList: detailedAncestorList
        }
    };
};