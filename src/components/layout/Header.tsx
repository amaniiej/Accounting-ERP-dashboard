import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { useAuth } from '../../context/LedgerContext';
import { translations } from '../../i18n/translations';
import { Search, Bell } from 'lucide-react';

const Header = () => {
  const { language, setGlobalSearch, globalSearch } = useUIStore();
  const { profile } = useAuth();
  const t = translations[language];

  return (
    <header className="flex justify-between items-center mb-2">
      <div>
        <h2 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-1">
          {profile.name}
        </h2>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          Dashboard
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={t.search || "Search..."}
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none w-64 transition-all"
          />
        </div>
        <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;