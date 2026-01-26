
export enum Page {
  Landing = 'landing',
  Login = 'login',
  Dashboard = 'dashboard',
  PohonIndustri = 'pohon-industri',
  ExportImport = 'export-import',
  InfoCenter = 'info-center',
  AIConsultant = 'ai-consultant'
}

export interface CommodityDerivative {
  level: string;
  product: string;
  valueAdded: string;
  subProducts?: CommodityDerivative[];
}

export interface CommodityData {
  id: string;
  name: string;
  description: string;
  importValue: number; // in Billion USD
  exportValue: number; // in Billion USD
  rawExport: number;
  processedExport: number;
  year: number;
  derivatives: CommodityDerivative[];
}

export interface PSNProject {
  name: string;
  region: string;
  status: string;
  progress: number;
}
