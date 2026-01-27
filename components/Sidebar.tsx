import React from 'react';
import { NavLink } from 'react-router-dom'; 
import { 
  LayoutDashboard, Layers,
  BarChart3, 
  Info, 
  Bot, 
  LogOut,
  ChevronRight,
  GitMerge,
  PlusCircle
} from 'lucide-react';
import { Page } from '@/types';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const menuItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/export-import', icon: <BarChart3 size={20} />, label: 'Data Ekspor Impor' },
    { path: '/pohon-industri', icon: <GitMerge size={20} />, label: 'Pohon Industri' },
    { path: '/data-management', icon: <Layers size={20} />, label: 'Manajemen Data' },
    // { path: '/input-node', icon: <PlusCircle size={20} />, label: 'Registrasi Node' },
    { path: '/info-center', icon: <Info size={20} />, label: 'Pusat Informasi' },
    { path: '/ai-consultant', icon: <Bot size={20} />, label: 'AI Konsultan' },
  ];

  return (
    <div className="w-64 h-screen bg-blue-900 text-white fixed left-0 top-0 flex flex-col shadow-xl z-50">
      <div className="p-6 border-b border-blue-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-blue-900 font-black text-xl">NI</span>
        </div>
        <div>
          <h1 className="font-black text-sm tracking-tighter uppercase">Nusantara</h1>
          <p className="text-[9px] text-blue-300 font-bold uppercase tracking-widest">Industries Data Hub</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300
              ${isActive 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20 translate-x-2' 
                : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
              }
            `}
          >
            {/* FIX: Gunakan satu fungsi render-prop untuk seluruh konten */}
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-[11px] font-black uppercase tracking-wider">{item.label}</span>
                </div>
                {isActive && (
                  <ChevronRight 
                    size={14} 
                    className="animate-in fade-in slide-in-from-left-2 duration-300" 
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 mt-auto border-t border-blue-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-5 py-3.5 text-rose-300 hover:text-white hover:bg-rose-600 rounded-2xl transition-all duration-300 font-black text-[11px] uppercase tracking-widest"
        >
          <LogOut size={18} />
          <span>Keluar Portal</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;