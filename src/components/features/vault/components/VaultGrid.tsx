import React from 'react';
import { FileText, Image as ImageIcon, Download, Trash2, Search, Upload, Lock } from 'lucide-react';
import { DocFile } from '../../../../types';

interface Props {
  docs: DocFile[];
  search: string;
  setSearch: (v: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLock: () => void;
  onDelete: (url: string) => void;
}

export const VaultGrid: React.FC<Props> = ({ docs, search, setSearch, onUpload, onLock, onDelete }) => {
  return (
    <div className="flex flex-col h-full gap-6">
      {/* Toolbar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search documents..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onLock} className="flex items-center gap-2 px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">
            <Lock size={18} /> Lock
          </button>
          <label className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-xl cursor-pointer hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
            <Upload size={18} /> Upload
            <input type="file" hidden multiple onChange={onUpload} />
          </label>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-4">
        {docs.map((doc, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 hover:shadow-lg transition-all group flex flex-col">
            <div className={`h-32 rounded-xl mb-4 flex items-center justify-center ${doc.type === 'pdf' ? 'bg-red-50' : 'bg-blue-50'}`}>
              {doc.type === 'pdf' ? <FileText size={40} className="text-red-400"/> : <ImageIcon size={40} className="text-blue-400"/>}
            </div>
            
            <h4 className="font-bold text-slate-800 text-sm truncate mb-1" title={doc.name}>{doc.name}</h4>
            <p className="text-xs text-slate-400 mb-4">{doc.date} • {doc.type.toUpperCase()}</p>
            
            <div className="mt-auto flex gap-2">
              <a href={doc.url} download={doc.name} className="flex-1 py-2 flex justify-center items-center bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                <Download size={16} />
              </a>
              <button onClick={() => onDelete(doc.url)} className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};