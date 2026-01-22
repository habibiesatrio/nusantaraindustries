/**
 * Industrial Node Data Validator
 * Standard Enterprise: Strict Type Checking & Dependency Validation
 */
export const validateIndustrialNode = (data) => {
  const errors = {};

  // 1. Validasi Identitas Dasar
  if (!data.Harmony_ID || typeof data.Harmony_ID !== 'string') {
    errors.Harmony_ID = "Harmony ID wajib diisi (Contoh: 2601.12_pellet)";
  }
  if (!data.Product_Name || data.Product_Name.trim().length < 3) {
    errors.Product_Name = "Nama Produk minimal 3 karakter";
  }

  // 2. Logika Tier Fleksibel (Mendukung Tier 1, 2... hingga 7+)
  const rawTier = String(data.Tier || "").trim();
  const tierMatch = rawTier.match(/\d+/); 
  const tierNumber = tierMatch ? parseInt(tierMatch[0]) : null;

  if (tierNumber === null) {
    errors.Tier = "Tier level harus berisi angka (Misal: 2 atau Tier 6)";
  }

  // 3. Validasi Relasi (Logic Snapping & ROOT)
  // Jika Tier > 1, maka wajib punya Parent_ID kecuali user mengisi 'ROOT'
  if (tierNumber > 1) {
    const parent = String(data.Parent_ID || "").trim().toUpperCase();
    if (!parent || parent === 'ROOT') {
      errors.Parent_ID = `Produk Tier ${tierNumber} wajib memiliki Parent ID. Gunakan ROOT hanya untuk bahan mentah Tier 1.`;
    }
  }

  // 4. Validasi Data Numerik Komprehensif
  const numericFields = [
    'Upstream_Export', 'Upstream_Import', 
    'Downstream_Export', 'Downstream_Import',
    'Step_Score_Value', 'Origin_Score_Value',
    'Step_Score_Coefficient'
  ];

  numericFields.forEach(field => {
    const value = data[field];
    // Pastikan tidak null/undefined dan merupakan angka valid
    if (value === undefined || value === null || isNaN(Number(value))) {
      errors[field] = `${field.replace(/_/g, ' ')} harus berupa angka (gunakan 0 jika kosong)`;
    } else if (Number(value) < 0) {
      errors[field] = `${field.replace(/_/g, ' ')} tidak boleh negatif`;
    }
  });

  // 5. Validasi Metadata Formula (Wajib untuk Audit Trail)
  if (!data.Step_Score_Formula || !data.Origin_Score_Formula) {
    errors.Formula = "Dokumentasi Formula wajib ada sesuai skema database industri";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};