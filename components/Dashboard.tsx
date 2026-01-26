
import React from 'react';
import { 
  TrendingUp, 
  Ship, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { EXPORT_DATA } from '@/constants';

import {
  GitMerge,
} from 'lucide-react';
import { Page } from '@/types';

const StatsCard: React.FC<{
  title: string,
  value: string,
  trend: string,
  isPositive: boolean,
  icon: React.ReactNode
}> = ({ title, value, trend, isPositive, icon }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
        {trend}
        {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
      </div>
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

interface ExportData {
  name: string;
  rawExport: number;
  processedExport: number;
}

const Dashboard: React.FC<{ setPage: (page: Page) => void }> = ({ setPage }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ringkasan Nasional</h1>
          <p className="text-slate-500">Overview performa hilirisasi industri Indonesia</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Terakhir diperbarui</p>
          <p className="text-sm font-medium text-slate-700">Mei 2024</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total Nilai Tambah Hilirisasi"
          value="US$ 33.8 Miliar"
          trend="+24.5%"
          isPositive={true}
          icon={<Activity size={24} />}
        />
        <StatsCard
          title="Volume Ekspor Olahan"
          value="14.2 Juta Ton"
          trend="+18.2%"
          isPositive={true}
          icon={<Ship size={24} />}
        />
        <StatsCard
          title="Investasi Smelter"
          value="Rp 128 Triliun"
          trend="-2.1%"
          isPositive={false}
          icon={<TrendingUp size={24} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Nilai Ekspor: Mentah vs Olahan (US$ Juta)</h3>
            <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-1 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Tahun 2023</option>
              <option>Tahun 2022</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={EXPORT_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar name="Bahan Mentah" dataKey="rawExport" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar name="Hasil Hilirisasi" dataKey="processedExport" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Distribusi Komoditas</h3>
          <div className="space-y-6">
            {EXPORT_DATA.slice(0, 4).map((item: ExportData, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700">{item.name}</span>
                  <span className="text-slate-500">{Math.round((item.processedExport / (item.processedExport + item.rawExport)) * 100)}% Rasio Hilirisasi</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${(item.processedExport / (item.processedExport + item.rawExport)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
            <button className="w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Lihat Detail Komoditas
            </button>
          </div>
        </div>
      </div>
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-500/50 transition-colors group">
        <button onClick={() => setPage(Page.PohonIndustri)} className="w-full text-left">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <GitMerge size={24} />
            </div>
          </div>
          <h3 className="text-slate-500 text-sm font-medium mb-1 group-hover:text-blue-600">Pohon Industri</h3>
          <p className="text-2xl font-bold text-slate-900 group-hover:text-blue-800">Visualisasikan Rantai Pasok</p>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
