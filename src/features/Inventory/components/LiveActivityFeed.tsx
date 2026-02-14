import React from 'react';
import { RefreshCw, History } from 'lucide-react';
import { CoreLedgerEntry } from '../hooks/useInventorySync';

interface Props {
  updates: CoreLedgerEntry[];
  onSync: () => void;
  isSyncing: boolean;
}

export const LiveActivityFeed: React.FC<Props> = ({ updates, onSync, isSyncing }) => {
  return (
    <div className="shrink-0 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 shadow-lg mb-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <History size={18} className="text-blue-200"/>
          Live Activity Feed
        </h3>
        <button 
          onClick={onSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-white rounded-lg hover:bg-blue-50 transition-colors shadow-md disabled:opacity-70"
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''}/>
          {isSyncing ? 'Syncing...' : 'Sync with Ledger'}
        </button>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {updates.length === 0 ? (
          <div className="text-blue-200 text-sm italic w-full text-center py-2">Waiting for live transactions...</div>
        ) : (
          updates.map((entry, idx) => (
            <div key={entry.id + idx} className="shrink-0 w-32 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 hover:bg-white/20 transition-all cursor-default">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${entry.type === 'consumption' ? 'bg-blue-500/20 text-blue-200' : 'bg-emerald-500/20 text-emerald-200'}`}>
                  {entry.type === 'consumption' ? 'SALE' : 'RESTOCK'}
                </span>
                <span className="text-[9px] text-blue-200">{new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <p className="text-xs font-bold truncate" title={entry.productName}>{entry.productName}</p>
              <p className="text-sm font-black mt-1">
                {entry.type === 'consumption' ? '-' : '+'}{entry.quantity}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};