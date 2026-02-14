import React, { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

// Imports from our new structure
import { useInventorySync, Product } from './hooks/useInventorySync';
import { LiveActivityFeed } from './components/LiveActivityFeed';
import { ProductTable } from './components/ProductTable';
import { ProductFormModal } from './modals/ProductFormModal';
import { StockAlertModal } from './modals/StockAlertModal';

const Inventory: React.FC<{ searchTerm?: string }> = ({ searchTerm: globalSearch }) => {
  // 1. Logic Layer
  const { products, liveUpdates, isSyncing, addProduct, updateProduct, manualSync } = useInventorySync();
  
  // 2. UI State
  const [localSearch, setLocalSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<{ type: 'ADJUST' | 'DATE', product: Product } | null>(null);

  // 3. Filtering
  const filteredProducts = useMemo(() => {
    const search = (globalSearch || localSearch).toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(search) && p.isActive);
  }, [products, globalSearch, localSearch]);

  return (
    <div className="h-full flex flex-col gap-6 relative">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      {/* Top Section: Live Feed */}
      <LiveActivityFeed updates={liveUpdates} onSync={manualSync} isSyncing={isSyncing} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative z-10">
        
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="relative w-1/3 min-w-[300px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              placeholder="Search inventory..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus size={18} strokeWidth={2.5}/>
            Add Product
          </button>
        </div>

        {/* Data Grid */}
        <ProductTable 
          products={filteredProducts} 
          onAdjust={(p) => setActiveModal({ type: 'ADJUST', product: p })}
          onEditDate={(p) => setActiveModal({ type: 'DATE', product: p })}
        />

        {/* Footer Stats */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between items-center font-bold uppercase tracking-wider">
          <span>Total Items: {filteredProducts.length}</span>
          <span>Critical Alerts: {filteredProducts.filter(p => p.availableVolume <= p.threshold).length}</span>
        </div>
      </div>

      {/* Modals Layer */}
      <AnimatePresence>
        {isAddModalOpen && (
          <ProductFormModal onClose={() => setIsAddModalOpen(false)} onSave={addProduct} />
        )}
        {activeModal && (
          <StockAlertModal 
            type={activeModal.type} 
            product={activeModal.product} 
            onClose={() => setActiveModal(null)} 
            onConfirm={(val) => {
              if (activeModal.type === 'ADJUST') {
                updateProduct(activeModal.product.id, { availableVolume: activeModal.product.availableVolume + Number(val) });
              } else {
                updateProduct(activeModal.product.id, { reorderDate: val });
              }
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;