import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, RefreshCw, Link, Calendar, Edit2, Check, Trash2,
  AlertTriangle, X, TrendingDown, Package, Clock, ChevronDown,
  History, Calculator, Bell, BarChart3, MoreHorizontal, Filter, ArrowRight,
  Minus, AlertCircle, Save, RotateCcw, Printer, Layers
} from 'lucide-react';
import { useLedger } from '../../../context/LedgerContext';

// ============================================================================
// TYPES & INTERFACES (Architecture Strict)
// ============================================================================

type StockStatus = 'optimal' | 'warning' | 'critical';
type AdjustmentReason = 'breakage' | 'expiry' | 'theft' | 'correction' | 'initial';
type UrgencyLevel = 'normal' | 'urgent' | 'critical';

interface CoreLedgerEntry {
  id: string;
  date: Date;
  productId: string;
  productName: string;
  type: 'consumption' | 'purchase' | 'adjustment';
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  source: 'expense_module' | 'purchase_order' | 'manual_adjustment';
}

interface StockAdjustment {
  id: string;
  date: Date;
  reason: AdjustmentReason;
  quantityDelta: number;
  notes: string;
  userId: string;
  previousStock: number;
  newStock: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  sellingPrice?: number;
  consumedCount: number;
  availableVolume: number;
  initialStock: number;
  threshold: number;
  reorderDate: string | null;
  advanceNoticeDays: number;
  lastConsumption: Date;
  consumptionHistory: number[];
  unitCostHistory: number[];
  adjustments: StockAdjustment[];
  defaultSupplier?: string;
  isActive: boolean;
  cump: number;
}

interface PurchaseOrderDraft {
  productId: string;
  quantity: number;
  urgency: UrgencyLevel;
  supplierId?: string;
  notes: string;
  estimatedDelivery?: string;
}

// ============================================================================
// MOCK DATA & CONSTANTS
// ============================================================================

const MOCK_CORE_LEDGER: CoreLedgerEntry[] = [
  { 
    id: 'l1', 
    date: new Date(Date.now() - 30 * 60000), 
    productId: 'p1', 
    productName: 'Coffee Beans (Kaffa)', 
    type: 'consumption', 
    quantity: -5, 
    source: 'expense_module' 
  },
  { 
    id: 'l2', 
    date: new Date(Date.now() - 2 * 60 * 60000), 
    productId: 'p2', 
    productName: 'Water Bottles 1L',
    type: 'consumption', 
    quantity: -20, 
    source: 'expense_module' 
  },
  { 
    id: 'l3', 
    date: new Date(Date.now() - 24 * 60 * 60000), 
    productId: 'p3', 
    productName: 'Raw Meat (Kg)', 
    type: 'consumption', 
    quantity: -2, 
    source: 'expense_module' 
  },
  { 
    id: 'l4', 
    date: new Date(Date.now() - 10 * 60000), 
    productId: 'p5', 
    productName: 'Macchiato', 
    type: 'consumption', 
    quantity: -50, 
    source: 'expense_module' 
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  { 
    id: 'p1', 
    name: 'Coffee Beans (Kaffa)', 
    category: 'Raw Material', 
    consumedCount: 128, 
    availableVolume: 45, 
    initialStock: 200,
    threshold: 50, 
    reorderDate: null,
    advanceNoticeDays: 7,
    lastConsumption: new Date(Date.now() - 30 * 60000), 
    consumptionHistory: [5, 8, 12, 7, 10, 9, 14],
    unitCostHistory: [45, 45, 46, 46, 45.5],
    adjustments: [],
    defaultSupplier: 'BGI Ethiopia',
    isActive: true,
    cump: 45.5,
    sellingPrice: 250
  },
  { 
    id: 'p2', 
    name: 'Water Bottles 1L', 
    category: 'Beverage', 
    consumedCount: 350, 
    availableVolume: 200, 
    initialStock: 1000,
    threshold: 100, 
    reorderDate: null,
    advanceNoticeDays: 14,
    lastConsumption: new Date(Date.now() - 2 * 60 * 60000), 
    consumptionHistory: [20, 25, 18, 30, 22, 28, 35],
    unitCostHistory: [12, 12, 11.5],
    adjustments: [],
    defaultSupplier: 'Safari Water',
    isActive: true,
    cump: 12,
    sellingPrice: 20
  },
  { 
    id: 'p3', 
    name: 'Raw Meat (Kg)', 
    category: 'Meat', 
    consumedCount: 45, 
    availableVolume: 8, 
    initialStock: 50,
    threshold: 10, 
    reorderDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    advanceNoticeDays: 7,
    lastConsumption: new Date(Date.now() - 24 * 60 * 60000), 
    consumptionHistory: [2, 5, 3, 6, 4, 5, 7],
    unitCostHistory: [280, 285, 282],
    adjustments: [],
    defaultSupplier: 'ELFORA',
    isActive: true,
    cump: 282,
    sellingPrice: 450
  },
  { 
    id: 'p4', 
    name: 'Takeaway Bags', 
    category: 'Consumable', 
    consumedCount: 800, 
    availableVolume: 1500, 
    initialStock: 2000,
    threshold: 500, 
    reorderDate: null,
    advanceNoticeDays: 7,
    lastConsumption: new Date(Date.now() - 5 * 60 * 60000), 
    consumptionHistory: [80, 95, 70, 110, 100, 120, 125],
    unitCostHistory: [2, 2, 1.8],
    adjustments: [],
    isActive: true,
    cump: 2,
    sellingPrice: 5
  },
  { 
    id: 'p5', 
    name: 'Macchiato', 
    category: 'Beverage', 
    consumedCount: 0, 
    availableVolume: 100, 
    initialStock: 100,
    threshold: 20, 
    reorderDate: null,
    advanceNoticeDays: 3,
    lastConsumption: new Date(), 
    consumptionHistory: [],
    unitCostHistory: [35],
    adjustments: [],
    defaultSupplier: "Kaldi's Coffee",
    isActive: true,
    cump: 18,
    sellingPrice: 35
  },
  { 
    id: 'p6', 
    name: 'Croissant', 
    category: 'Pastry', 
    consumedCount: 0, 
    availableVolume: 50, 
    initialStock: 50, 
    threshold: 10, 
    reorderDate: null,
    advanceNoticeDays: 3,
    lastConsumption: new Date(), 
    consumptionHistory: [],
    unitCostHistory: [15],
    adjustments: [],
    isActive: true,
    cump: 60,
    sellingPrice: 120
  },
  { 
    id: 'p7', 
    name: 'Lunch Menu', 
    category: 'Dish', 
    consumedCount: 0, 
    availableVolume: 30, 
    initialStock: 30, 
    threshold: 5, 
    reorderDate: null,
    advanceNoticeDays: 2,
    lastConsumption: new Date(), 
    consumptionHistory: [],
    unitCostHistory: [400],
    adjustments: [],
    isActive: true,
    cump: 400,
    sellingPrice: 900
  },
  { 
    id: 'p8', 
    name: 'Tea', 
    category: 'Beverage', 
    consumedCount: 0, 
    availableVolume: 100, 
    initialStock: 100,
    threshold: 20, 
    reorderDate: null,
    advanceNoticeDays: 7,
    lastConsumption: new Date(), 
    consumptionHistory: [],
    unitCostHistory: [5],
    adjustments: [],
    isActive: true,
    cump: 10,
    sellingPrice: 25
  },
];

const CATEGORY_STYLES: { [key: string]: string } = {
  'Raw Material': 'bg-orange-100/80 text-orange-800 border-orange-200',
  'Beverage': 'bg-sky-100/80 text-sky-800 border-sky-200',
  'Meat': 'bg-rose-100/80 text-rose-800 border-rose-200',
  'Consumable': 'bg-indigo-100/80 text-indigo-800 border-indigo-200',
  'Pastry': 'bg-amber-100/80 text-amber-800 border-amber-200',
  'Dish': 'bg-emerald-100/80 text-emerald-800 border-emerald-200',
  'Default': 'bg-slate-100/80 text-slate-800 border-slate-200'
};

const ADJUSTMENT_REASONS: { [key in AdjustmentReason]: string } = {
  breakage: 'Breakage / Damage',
  expiry: 'Expiry',
  theft: 'Theft / Loss',
  correction: 'Inventory Correction',
  initial: 'Initial Stock'
};

const GrainyTexture = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.15] pointer-events-none mix-blend-overlay z-0">
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
  </svg>
);

// ============================================================================
// SERVICES & BRIDGES (Couche d'intégration)
// ============================================================================

class CoreLedgerBridge {
  private listeners: ((entries: CoreLedgerEntry[]) => void)[] = [];
  
  subscribe(callback: (entries: CoreLedgerEntry[]) => void) {
    this.listeners.push(callback);
    callback([...MOCK_CORE_LEDGER]);
    
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomProduct = INITIAL_PRODUCTS[Math.floor(Math.random() * INITIAL_PRODUCTS.length)];
        const newEntry: CoreLedgerEntry = {
          id: `l${Date.now()}`,
          date: new Date(),
          productId: randomProduct.id,
          productName: randomProduct.name,
          type: 'consumption',
          quantity: -Math.floor(Math.random() * 5) - 1,
          source: 'expense_module'
        };
        MOCK_CORE_LEDGER.push(newEntry);
        this.listeners.forEach(l => l([...MOCK_CORE_LEDGER]));
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }

  async syncWithInventory(): Promise<CoreLedgerEntry[]> {
    return new Promise(resolve => setTimeout(() => resolve([...MOCK_CORE_LEDGER]), 1000));
  }
}

const ledgerBridge = new CoreLedgerBridge();

// ============================================================================
// SOUS-COMPOSANTS (Architecture Modulaire)
// ============================================================================

const Sparkline: React.FC<{ data: number[]; color?: string }> = ({ data, color = 'currentColor' }) => {
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 90;
    const y = 30 - ((d - min) / range) * 25 - 2.5;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg viewBox="0 0 90 30" className="w-full h-8 overflow-visible">
      <defs>
        <linearGradient id={`gradient-${points.length}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <polygon 
        points={`0,30 ${points} 90,30`} 
        fill={`url(#gradient-${points.length})`}
        opacity="0.3"
      />
    </svg>
  );
};

const ThresholdAlertModal: React.FC<{ 
  product: Product; 
  onClose: (snooze?: boolean) => void;
  onCreateOrder: () => void;
  onEditThreshold: () => void;
}> = ({ product, onClose, onCreateOrder, onEditThreshold }) => {
  const deficit = product.threshold - product.availableVolume;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border-2 border-red-500 overflow-hidden"
      >
        <div className="bg-red-50 px-6 py-4 border-b border-red-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0 animate-pulse">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-red-800">⚠️ Restocking Needed</h2>
            <p className="text-sm text-red-600">Critical stock detected</p>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="p-4 bg-red-50/50 rounded-xl border border-red-100">
            <p className="text-slate-700">
              Stock for <span className="font-bold text-slate-900 text-lg">{product.name}</span> is dangerously low.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase font-semibold">Current Stock</p>
              <p className="text-2xl font-bold text-red-600">{product.availableVolume} <span className="text-sm font-normal text-slate-500">units</span></p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase font-semibold">Defined threshold</p>
              <p className="text-2xl font-bold text-slate-700">{product.threshold} <span className="text-sm font-normal text-slate-500">units</span></p>
            </div>
          </div>
          
          <div className="p-4 bg-red-100/50 rounded-lg border border-red-200 flex justify-between items-center">
            <span className="font-semibold text-red-800">Deficit to cover :</span>
            <span className="text-2xl font-black text-red-700">{deficit} units</span>
          </div>
          
          {product.defaultSupplier && (
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
              <Package size={16} className="text-slate-400"/>
              Default supplier : <span className="font-semibold text-slate-800">{product.defaultSupplier}</span>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-3 pt-2">
            <button 
              onClick={onCreateOrder}
              className="col-span-3 md:col-span-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              <Plus size={18}/>
              Create Order
            </button>
            <button 
              onClick={() => onClose(true)} 
              className="px-4 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition"
            >
              Ignore (24h)
            </button>
            <button 
              onClick={onEditThreshold}
              className="px-4 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition"
            >
              Modify Threshold
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AdvanceReorderModal: React.FC<{
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (order: PurchaseOrderDraft) => void;
  onSnooze: () => void;
  onCancelSchedule: () => void;
}> = ({ product, isOpen, onClose, onSubmit, onSnooze, onCancelSchedule }) => {
  const [quantity, setQuantity] = useState(product.threshold * 2 - product.availableVolume);
  const [urgency, setUrgency] = useState<UrgencyLevel>('normal');
  const [notes, setNotes] = useState('');
  
  if (!isOpen || !product.reorderDate) return null;
  
  const daysUntil = Math.ceil((new Date(product.reorderDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const avgConsumption = Math.round(product.consumptionHistory.reduce((a, b) => a + b, 0) / (product.consumptionHistory.length || 1));
  
  const handleSubmit = () => {
    onSubmit({
      productId: product.id,
      quantity,
      urgency,
      notes,
      supplierId: product.defaultSupplier
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Scheduled Restocking Request</h2>
            <p className="text-blue-100 text-sm flex items-center gap-2">
              <Clock size={14}/>
              Due in {daysUntil} days ({new Date(product.reorderDate!).toLocaleDateString('en-GB')})
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition"><X size={20}/></button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BarChart3 size={14}/> Summary Information
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Current Stock</span>
                    <span className="font-bold text-slate-900">{product.availableVolume} units</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${product.availableVolume <= product.threshold ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min((product.availableVolume / (product.threshold * 2)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-sm text-slate-600">Average consumption (7d)</span>
                  <span className="font-semibold text-slate-900">{avgConsumption}/day</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-sm text-slate-600">Current WAC</span>
                  <span className="font-semibold text-slate-900">{product.cump.toFixed(2)} ETB</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-600">Usual supplier</span>
                  <span className="font-semibold text-blue-600">{product.defaultSupplier || 'Not defined'}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Edit2 size={14}/> Request Settings
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Quantity to order</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    />
                    <span className="absolute right-3 top-2.5 text-sm text-slate-400">units</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Suggestion based on (Threshold × 2 - Stock)</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Urgency Level</label>
                  <div className="flex gap-2">
                    {(['normal', 'urgent', 'critical'] as UrgencyLevel[]).map((level) => (
                      <button
                        key={level}
                        onClick={() => setUrgency(level)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          urgency === level 
                            ? level === 'normal' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' :
                              level === 'urgent' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' :
                              'bg-red-500 text-white shadow-lg shadow-red-500/30'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Comment <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Reasons for restocking..."
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white h-20 resize-none"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="text-emerald-600" size={20}/>
              <div>
                <p className="text-sm font-semibold text-emerald-900">Total Cost Estimate</p>
                <p className="text-xs text-emerald-700">Based on current WAC</p>
              </div>
            </div>
            <span className="text-2xl font-black text-emerald-800">
              {(quantity * product.cump).toLocaleString()} ETB
            </span>
          </div>
        </div>
        
        <div className="bg-slate-50 px-6 py-4 border-t flex justify-between items-center">
          <div className="flex gap-4 text-sm">
            <button onClick={onSnooze} className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1">
              <Clock size={14}/> Snooze for 3 days
            </button>
            <button onClick={onCancelSchedule} className="text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
              <Trash2 size={14}/> Cancel schedule
            </button>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white font-medium transition">
              Close
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!notes || quantity <= 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Check size={18}/> Send Request
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ProductFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: any) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Raw Material',
    initialStock: 0,
    threshold: 0,
    advanceNoticeDays: 7,
    defaultSupplier: '',
    sellingPrice: 0
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6">New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Product Name</label>
            <input 
              type="text" 
              required
              maxLength={100}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
              <select 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {Object.keys(CATEGORY_STYLES).filter(k => k !== 'Default').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Initial Stock</label>
              <input 
                type="number" 
                min="0"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                onChange={e => setFormData({...formData, initialStock: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Critical Threshold</label>
              <input 
                type="number" 
                min="0"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                onChange={e => setFormData({...formData, threshold: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Notice Days</label>
              <input 
                type="number" 
                min="1"
                defaultValue={7}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                onChange={e => setFormData({...formData, advanceNoticeDays: parseInt(e.target.value) || 7})}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">Create Product</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const StockAdjustmentModal: React.FC<{
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSave: (adjustment: Omit<StockAdjustment, 'id' | 'date'>) => void;
}> = ({ product, isOpen, onClose, onSave }) => {
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState<AdjustmentReason>('correction');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      reason,
      quantityDelta: quantity,
      notes,
      userId: 'admin',
      previousStock: product.availableVolume,
      newStock: product.availableVolume + quantity
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Adjustment : {product.name}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full"><X size={18}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Quantity (+/-)</label>
            <input 
              type="number" 
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Reason</label>
            <select 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setReason(e.target.value as AdjustmentReason)}
            >
              {Object.entries(ADJUSTMENT_REASONS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium">Save</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

interface InventoryProps { searchTerm?: string; }

const Inventory: React.FC<InventoryProps> = ({ searchTerm: globalSearch }) => {
  const { transactions } = useLedger() || { transactions: [] };
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [liveUpdates, setLiveUpdates] = useState<CoreLedgerEntry[]>([]);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingRestock, setEditingRestock] = useState<{ id: string, value: number } | null>(null);
  const [alertedProduct, setAlertedProduct] = useState<Product | null>(null);
  const [reorderProduct, setReorderProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [editingThreshold, setEditingThreshold] = useState<Product | null>(null);
  const [editingReorder, setEditingReorder] = useState<Product | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [reorderNotification, setReorderNotification] = useState<Product | null>(null);

  useEffect(() => {
    const unsubscribe = ledgerBridge.subscribe((entries) => {
      setLiveUpdates(entries.slice(-20));
      // Logique de recalcul simplifiée ici
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkReorderDates = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowString = tomorrow.toISOString().split('T')[0];

        const productToNotify = products.find(p => p.reorderDate === tomorrowString && sessionStorage.getItem(`notif_dismissed_${p.id}`) !== 'true');
        
        if (productToNotify && (!reorderNotification || reorderNotification.id !== productToNotify.id)) {
            setReorderNotification(productToNotify);
        }
    };

    const interval = setInterval(checkReorderDates, 60 * 1000); // Check every minute
    checkReorderDates(); // Initial check

    return () => clearInterval(interval);
  }, [products, reorderNotification]);

  const handleSync = async () => {
    setIsSyncing(true);
    await ledgerBridge.syncWithInventory();
    setIsSyncing(false);
  };

  const handleSaveReorderDate = (productId: string, date: string | null) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, reorderDate: date } : p));
  };

  // Reorder Notification Component
  const ReorderNotification: React.FC<{
    product: Product;
    onClose: () => void;
    onValidate: (productId: string) => void;
  }> = ({ product, onClose, onValidate }) => (
    <div className="fixed bottom-4 right-4 bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-xl z-50 max-w-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg">
          <AlertTriangle size={20} className="text-amber-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-amber-800">Rappel de réapprovisionnement</h4>
          <p className="text-sm text-amber-700 mt-1">
            {product.name} doit être réapprovisionné le {product.reorderDate}
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-amber-700 hover:bg-amber-100 rounded-lg"
            >
              Plus tard
            </button>
            <button
              onClick={() => onValidate(product.id)}
              className="px-3 py-1.5 text-sm bg-amber-600 text-white hover:bg-amber-700 rounded-lg"
            >
              Valider
            </button>
          </div>
        </div>
        <button onClick={onClose} className="text-amber-400 hover:text-amber-600">
          <X size={18} />
        </button>
      </div>
    </div>
  );

  // Restock Date Modal Component
  const RestockDateModal: React.FC<{
    isOpen: boolean;
    product: Product | null;
    onClose: () => void;
    onSave: (productId: string, date: string | null) => void;
  }> = ({ isOpen, product, onClose, onSave }) => {
    const [date, setDate] = useState(product?.reorderDate || '');

    if (!isOpen || !product) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">Définir la date de réapprovisionnement</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Produit: <span className="font-semibold">{product.name}</span>
            </label>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date de réapprovisionnement
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Annuler
            </button>
            <button
              onClick={() => onSave(product.id, date || null)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleAdjustment = (product: Product, adj: any) => {
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, availableVolume: p.availableVolume + adj.quantityDelta } : p));
  };

  const filteredProducts = useMemo(() => 
    products.filter(p => p.isActive && p.name.toLowerCase().includes((globalSearch || searchTerm).toLowerCase())),
    [products, searchTerm, globalSearch]
  );

  return (
    <div className="h-full flex flex-col gap-6 antialiased bg-white p-6 overflow-hidden">
      <GrainyTexture />
      
      {/* Live Activity Feed synced with Master Ledger */}
      <div className="shrink-0 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <History size={18} className="text-blue-200"/>
            Live Activity
          </h3>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-white rounded-lg hover:bg-blue-50 transition-colors shadow-md"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''}/>
            Sync with Ledger
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {liveUpdates.slice(0, 6).map((entry, idx) => (
            <div 
              key={entry.id + idx} 
              className="shrink-0 relative group cursor-pointer"
            >
              {/* Square Card */}
              <div className="w-28 h-28 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-200">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm mb-2 ${
                  entry.type === 'consumption' 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                    : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                }`}>
                  {entry.productName.substring(0, 2).toUpperCase()}
                </div>
                <p className="text-xs font-bold text-slate-700 truncate leading-tight">{entry.productName}</p>
                <p className={`text-xs font-semibold mt-1 ${
                  entry.type === 'consumption' ? 'text-blue-600' : 'text-emerald-600'
                }`}>
                  {entry.type === 'consumption' ? '-' : '+'}{Math.abs(entry.quantity)} units
                </p>
              </div>
              
              {/* Popup on Hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                  <p className="font-semibold">{entry.productName}</p>
                  <p>{entry.type === 'consumption' ? 'Consumed' : 'Added'}: {Math.abs(entry.quantity)} units</p>
                  <p className="text-slate-400 mt-1">{new Date(entry.date).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          ))}
          {liveUpdates.length === 0 && (
            <div className="flex items-center justify-center w-full py-4">
              <p className="text-blue-200 italic">No recent activity - all systems operational</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative z-10">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="relative w-1/3 min-w-[300px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowAddProduct(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">
              <Plus size={18} strokeWidth={2.5}/>
              Add Product
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr className="text-[10px] text-slate-500 uppercase font-bold tracking-wider border-b">
                <th className="px-6 py-4">PRODUCT NAME</th>
                <th className="px-6 py-4">CATEGORY</th>
                <th className="px-6 py-4 text-right">PRIX</th>
                <th className="px-6 py-4 text-center">RESTOCKED</th>
                <th className="px-6 py-4 text-center">CONSUMED</th>
                <th className="px-6 py-4 text-right">REMAINING</th>
                <th className="px-6 py-4 text-center">ACTIONS</th>
                <th className="px-6 py-4 text-center">RESTOCK DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => {
                const isCritical = product.availableVolume <= product.threshold;
                return (
                  <tr key={product.id} className={`group hover:bg-blue-50/80 transition-colors ${isCritical ? 'bg-red-100' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm text-slate-800">{product.name}</div>
                      {isCritical && <span className="text-[9px] font-black text-red-500 uppercase animate-pulse">Critical Stock</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${CATEGORY_STYLES[product.category] || CATEGORY_STYLES.Default}`}>
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold tabular-nums text-slate-700">
                      {product.sellingPrice 
                        ? `${product.sellingPrice.toLocaleString()} ETB`
                        : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-6 py-4 text-center font-bold tabular-nums text-slate-700">{product.initialStock}</td>
                    <td className="px-6 py-4 text-center text-slate-500 tabular-nums">{product.consumedCount}</td>
                    <td className={`px-6 py-4 text-right font-black tabular-nums ${isCritical ? 'text-red-600' : 'text-emerald-600'}`}>
                      {product.availableVolume}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setAdjustingProduct(product)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><RotateCcw size={16}/></button>
                        <button onClick={() => setEditingReorder(product)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Calendar size={16}/></button>
                        <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center" onClick={() => setEditingReorder(product)}>
                      <div className="cursor-pointer font-bold text-blue-700 hover:text-blue-900">
                        {product.reorderDate 
                          ? new Date(product.reorderDate).toLocaleDateString('en-US')
                          : <span className="text-slate-400 italic">Set date</span>
                        }
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between items-center">
          <span>Showing {filteredProducts.length} active products</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Live Sync</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"/> {liveUpdates.length} Transactions</span>
          </div>
        </div>
      </div>

      {reorderNotification && (
        <ReorderNotification
            product={reorderNotification}
            onClose={() => {
                if (reorderNotification) {
                    sessionStorage.setItem(`notif_dismissed_${reorderNotification.id}`, 'true');
                }
                setReorderNotification(null);
            }}
            onValidate={(productId) => {
                setProducts(prev => prev.map(p => p.id === productId ? { ...p, reorderDate: null } : p));
                setReorderNotification(null);
            }}
        />
      )}

      <AnimatePresence>
        {editingReorder && (
          <RestockDateModal isOpen={!!editingReorder} product={editingReorder} onClose={() => setEditingReorder(null)} onSave={handleSaveReorderDate} />
        )}
        {adjustingProduct && (
          <StockAdjustmentModal 
            product={adjustingProduct} 
            isOpen={true} 
            onClose={() => setAdjustingProduct(null)} 
            onSave={(adj) => handleAdjustment(adjustingProduct, adj)} 
          />
        )}
        {showAddProduct && (
          <ProductFormModal 
            isOpen={true} 
            onClose={() => setShowAddProduct(false)} 
            onSave={(data) => setProducts([...products, { ...data, id: `p${Date.now()}`, consumedCount: 0, consumptionHistory: [], adjustments: [], cump: 0, lastConsumption: new Date(), availableVolume: data.initialStock, isActive: true }])} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;