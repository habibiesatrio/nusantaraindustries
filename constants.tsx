
import { CommodityData, PSNProject } from './src/types';

export const COMMODITIES: CommodityData[] = [
  {
    id: 'nikel',
    name: 'Nikel',
    description: 'Tulang punggung hilirisasi untuk ekosistem baterai kendaraan listrik global.',
    importValue: 2.4,
    exportValue: 33.8,
    rawExport: 1.2,
    processedExport: 32.6,
    year: 2023,
    derivatives: [
      { level: 'Hulu', product: 'Bijih Nikel', valueAdded: '1x' },
      { level: 'Antara', product: 'Nikel Matte / MHP', valueAdded: '6x' },
      { level: 'Hilir', product: 'Katoda Baterai / Sel Baterai', valueAdded: '18x' }
    ]
  },
  {
    id: 'bauksit',
    name: 'Bauksit',
    description: 'Transformasi dari bijih mentah menjadi aluminium untuk industri transportasi.',
    importValue: 1.8,
    exportValue: 5.4,
    rawExport: 0.9,
    processedExport: 4.5,
    year: 2023,
    derivatives: [
      { level: 'Hulu', product: 'Bijih Bauksit', valueAdded: '1x' },
      { level: 'Antara', product: 'Alumina (SGA)', valueAdded: '8x' },
      { level: 'Hilir', product: 'Ingot Aluminium', valueAdded: '15x' }
    ]
  },
  {
    id: 'tembaga',
    name: 'Tembaga',
    description: 'Penyokong utama infrastruktur energi terbarukan dan transmisi listrik.',
    importValue: 3.1,
    exportValue: 8.9,
    rawExport: 2.1,
    processedExport: 6.8,
    year: 2023,
    derivatives: [
      { level: 'Hulu', product: 'Konsentrat Tembaga', valueAdded: '1x' },
      { level: 'Antara', product: 'Katoda Tembaga', valueAdded: '4x' },
      { level: 'Hilir', product: 'Kabel & Komponen Presisi', valueAdded: '12x' }
    ]
  },
  {
    id: 'timah',
    name: 'Timah',
    description: 'Material krusial untuk industri semikonduktor dan penyolderan elektronik.',
    importValue: 0.5,
    exportValue: 3.2,
    rawExport: 0.4,
    processedExport: 2.8,
    year: 2023,
    derivatives: [
      { level: 'Hulu', product: 'Pasir Timah', valueAdded: '1x' },
      { level: 'Antara', product: 'Timah Ingot', valueAdded: '3x' },
      { level: 'Hilir', product: 'Tin Chemical / Solder', valueAdded: '10x' }
    ]
  }
];

export const PSN_PROJECTS: PSNProject[] = [
  { name: 'Kawasan Industri Weda Bay', region: 'Maluku Utara', status: 'Operasional', progress: 100 },
  { name: 'Smelter Manyar (Freeport)', region: 'Jawa Timur', status: 'Konstruksi Akhir', progress: 96 },
  { name: 'Kawasan Industri Tanah Kuning', region: 'Kaltara', status: 'Pematangan Lahan', progress: 48 },
  { name: 'Smelter Nikel Sorowako', region: 'Sulawesi Selatan', status: 'Ekspansi', progress: 72 }
];

// Added EXPORT_DATA for Dashboard visualization (converting Billion to Million for chart display)
export const EXPORT_DATA = COMMODITIES.map(c => ({
  name: c.name,
  rawExport: c.rawExport * 1000,
  processedExport: c.processedExport * 1000
}));

// Added NEWS_ITEMS for InfoCenter news feed
export const NEWS_ITEMS = [
  {
    id: '1',
    title: 'Pemerintah Siapkan Insentif Baru untuk Hilirisasi Bauksit',
    summary: 'Kementerian Investasi/BKPM menjanjikan tax holiday hingga 20 tahun bagi investor smelter bauksit guna mempercepat target larangan ekspor bijih.',
    category: 'Kebijakan',
    date: '12 Mei 2024',
    imageUrl: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '2',
    title: 'Realisasi Investasi Sektor Manufaktur Capai Rp 145 Triliun',
    summary: 'Capaian investasi triwulan I didominasi oleh pembangunan pabrik pengolahan nikel dan tembaga di wilayah Indonesia Timur.',
    category: 'Ekonomi',
    date: '10 Mei 2024',
    imageUrl: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '3',
    title: 'Teknologi HPAL Mulai Diimplementasikan di Maluku Utara',
    summary: 'Penerapan teknologi High Pressure Acid Leaching (HPAL) memungkinkan ekstraksi nikel kadar rendah untuk bahan baku baterai EV.',
    category: 'Teknologi',
    date: '08 Mei 2024',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800'
  }
];
