/**
 * Menghitung Multiplier Score dengan Logika Rekursif (Full Ancestry).
 * Rumus: Nilai Produk Ini / (Total Nilai Seluruh Rantai Hulu).
 */
export const calculateValueAdded = (nodeData, allData) => {
    if (!nodeData || !allData || allData.length === 0) {
        return { score: "1.00", isRaw: true, details: null };
    }

    // --- 1. HITUNG NILAI PRODUK INI (CHILD) ---
    const D_MVT = Number(nodeData.Market_Value_Technology) || 0;
    const D_Export = Number(nodeData.Export_Value) || 0;
    const D_Import = Number(nodeData.Import_Value) || 0;
    const childTotalValue = D_MVT + (D_Export - D_Import);

    // --- 2. KOLEKSI SEMUA LELUHUR .(REKURSIF)
    let ancestorsMap = new Map();

    const findAncestorsRecursive = (currentId) => {
        // Cari semua entri yang memiliki Harmony_ID ini (untuk handle multi-parent)
        const entries = allData.filter(i => i.Harmony_ID === currentId);

        entries.forEach(entry => {
            // Ambil daftar parent (mendukung array 'Parents' atau string 'Parent_ID')
            let parentsList = [];
            if (entry.Parents && Array.isArray(entry.Parents)) {
                parentsList = entry.Parents;
            } else if (entry.Parent_ID && entry.Parent_ID !== 'ROOT') {
                parentsList = [{ Harmony_ID: entry.Parent_ID }];
            }

            parentsList.forEach(pRef => {
                // Cari data detail bapak tersebut di database
                const parentNode = allData.find(i => i.Harmony_ID === pRef.Harmony_ID);

                if (parentNode && !ancestorsMap.has(parentNode.Harmony_ID)) {
                    // Simpan data bapak ke Map
                    ancestorsMap.set(parentNode.Harmony_ID, parentNode);
                    // TERUS NAIK ke kakek, kakek-buyut, dst (Rekursi)
                    findAncestorsRecursive(parentNode.Harmony_ID);
                }
            });
        });
    };

    // Mulai menelusuri dari node yang sedang dipilih
    findAncestorsRecursive(nodeData.Harmony_ID);

    // --- 3. JUMLAHKAN NILAI SEMUA LELUHUR YANG DITEMUKAN ---
    let totalAncestorsValue = 0;
    const detailedAncestorList = [];

    ancestorsMap.forEach((node) => {
        const val = (Number(node.Market_Value_Technology) || 0) +
            ((Number(node.Export_Value) || 0) - (Number(node.Import_Value) || 0));

        totalAncestorsValue += val;
        detailedAncestorList.push({
            name: node.Product_Name,
            hs: node.HS_Code,
            val: val,
            tier: node.Tier
        });
    });

    // --- 4. HITUNG MULTIPLIER AKHIR ---
    let multiplier = 0;
    let isRaw = false;

    if (totalAncestorsValue > 0) {
        multiplier = childTotalValue / totalAncestorsValue;
    } else {
        // Jika tidak ada leluhur sama sekali, produk ini adalah Raw Material (Base Value 1.00)
        multiplier = 1.00;
        isRaw = true;
    }

    return {
        score: multiplier.toFixed(2), // Mengembalikan string (contoh: "6.28")
        isRaw: isRaw,
        details: {
            childValue: childTotalValue,
            totalParentValue: totalAncestorsValue,
            parentList: detailedAncestorList // Daftar lengkap untuk Pop-up
        }
    };
};