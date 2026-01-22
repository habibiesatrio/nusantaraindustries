
import React from 'react';
import { NEWS_ITEMS } from '@/constants';
import { Calendar, Tag, ChevronRight, Download } from 'lucide-react';

interface NewsItem {
  id: string;
  imageUrl: string;
  title: string;
  category: string;
  date: string;
  summary: string;
}

const InfoCenter: React.FC = () => {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pusat Informasi Hilirisasi</h1>
          <p className="text-slate-500">Berita, regulasi, dan laporan industri terbaru</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">
          <Download size={18} />
          Unduh Laporan Tahunan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">


        {NEWS_ITEMS.map((news: NewsItem) => (
          <div key={news.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group cursor-pointer transition-all hover:shadow-md hover:-translate-y-1">
            <div className="relative h-48">
              <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 left-4">
                <span className="bg-blue-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded">
                  {news.category}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {news.date}
                </span>
                <span className="flex items-center gap-1">
                  <Tag size={12} />
                  {news.category}
                </span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                {news.title}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                {news.summary}
              </p>
              <div className="flex items-center text-blue-600 text-sm font-semibold gap-1">
                Baca Selengkapnya
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 space-y-4">
            <h2 className="text-xl font-bold text-blue-900">Kumpulan Regulasi Terbaru</h2>
            <p className="text-blue-700/80">Akses seluruh dokumen legalitas dan peraturan menteri terkait hilirisasi mineral dan batubara dalam satu pintu.</p>
            <div className="flex flex-wrap gap-2">
              {['Permen ESDM', 'PP No. 25/2023', 'UU Minerba', 'Inpres Hilirisasi'].map((tag) => (
                <span key={tag} className="px-3 py-1 bg-white border border-blue-200 text-blue-700 text-xs font-medium rounded-full cursor-pointer hover:bg-blue-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="w-full md:w-auto">
            <button className="w-full md:w-auto px-8 py-3 bg-blue-900 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition-colors">
              Buka Arsip Regulasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoCenter;
