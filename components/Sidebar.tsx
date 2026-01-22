import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Info, 
  Bot, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  setPage: (page: Page) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setPage, onLogout }) => {
  const menuItems = [
    { id: Page.Dashboard, icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: Page.ExportImport, icon: <BarChart3 size={20} />, label: 'Data Ekspor Impor' },
    { id: Page.InfoCenter, icon: <Info size={20} />, label: 'Pusat Informasi' },
    { id: Page.AIConsultant, icon: <Bot size={20} />, label: 'AI Konsultan' },
  ];

  return (
    <div className="w-64 h-screen bg-blue-900 text-white fixed left-0 top-0 flex flex-col shadow-xl z-50">
      <div className="p-6 border-b border-blue-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
          <span className="text-blue-900 font-bold text-xl">NI</span>
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight">NUSANTARA</h1>
          <p className="text-[10px] text-blue-300 uppercase">Industries</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPage === item.id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-blue-200 hover:bg-blue-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            {currentPage === item.id && <ChevronRight size={16} />}
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-blue-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-blue-200 hover:text-white hover:bg-red-600/20 rounded-lg transition-colors duration-200"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Keluar</span>
        </button>
      </div>
    </div>
  );
};

