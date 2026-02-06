import React, { useState, useMemo, Component, ErrorInfo, ReactNode, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Info, Plus, Minus, Lock, ArrowRight, X, Check, Calendar, 
  Trash2, Printer, PlusCircle, ShoppingCart, ScrollText, Filter, 
  Download, CheckCircle2, FileText, Loader2, RefreshCw, Save, Folder, Calendar as CalendarIcon, ChevronDown,
  BarChart3, Monitor, Layout, Type, Image as ImageIcon, Square, Circle, Triangle, Move, RotateCw, ZoomIn, ZoomOut,
  Undo, Redo, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, List, ListOrdered,
  Presentation, Layers, Palette, Download as DownloadIcon, Share2, Trash, Copy, Edit3, Upload, Lock as LockIcon
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  TooltipProps, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
// On garde les imports de types mais on va utiliser 'any' dans la fonction pour éviter le blocage
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useLedger } from '../../../context/LedgerContext';
import { INITIAL_PRODUCTS as allProducts } from '../Inventory/inventory';
import { jsPDF } from 'jspdf';
import SecureVault from './SecureVault';

// --- ERROR BOUNDARY ---
interface EBProps { children: ReactNode }
interface EBState { hasError: boolean; error: Error | null }

class MoneyFlowErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MoneyFlow Fatal Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          background: '#fee2e2', 
          color: '#991b1b', 
          minHeight: '100vh',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '20px' }}>❌ CRITICAL ERROR</h2>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
            <strong>Message:</strong> {this.state.error?.message}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- TYPES ---
interface Transaction {
  id: string;
  date: string;
  item: string;
  description: string;
  category: string;
  amount: number; // Montant en unités (ETB)
  type: 'INCOME' | 'EXPENSE';
  vatApplicable?: boolean;
  reference?: string;
  counterparty?: string;
}

// Interface étendue pour garantir que TS ne bloque pas sur les fonctions manquantes
interface LedgerContextFull {
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, t: Transaction) => void;
}

interface CartItem {
  id: string;
  name: string;
  price: number; // Prix en ETB
  category: string;
  quantity: number;
  type: 'INCOME' | 'EXPENSE';
}

interface QuickProduct {
  id: string;
  name: string;
  price: number; // Prix en ETB
  category: string;
  type: 'INCOME' | 'EXPENSE';
}

interface AuthModalProps {
  title: string;
  onUnlock: () => void;
  onClose: () => void;
}

// Optimisée : mémorisation de generateId
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// --- UTILS ---
const formatETB = (amountInCents: number | bigint) => {
  return new Intl.NumberFormat('en-ET', { 
    style: 'currency', 
    currency: 'ETB', 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(Number(amountInCents) / 100);
};

const GrainyTexture = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.15] pointer-events-none mix-blend-overlay z-0">
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
  </svg>
);

// --- MODALS ---

const AuthModal: React.FC<AuthModalProps> = ({ title, onUnlock, onClose }) => {
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onUnlock();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/90 backdrop-blur-2xl border border-white/30 rounded-2xl p-8 shadow-2xl w-full max-w-sm text-center"
      >
        <div className="mx-auto w-16 h-16 bg-blue-600/20 text-blue-600 rounded-full flex items-center justify-center mb-4">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Secure Access</h2>
        <p className="text-slate-500 mb-6">Section: <span className="font-semibold">{title}</span></p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="text" placeholder="Admin" defaultValue="admin" className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg" />
          <input type="password" placeholder="Password" defaultValue="password" className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg" />
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">
            Unlock
          </button>
        </form>
        <button onClick={onClose} className="mt-4 text-slate-400 hover:text-slate-600">Close</button>
      </motion.div>
    </div>
  );
};

const AddItemModal: React.FC<{
  type: 'INCOME' | 'EXPENSE';
  onAdd: (item: { name: string; category: string; amount: number }) => void;
  onClose: () => void;
  categories: string[];
}> = ({ type, onAdd, onClose, categories }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (name && category && numAmount > 0) {
      onAdd({ name, category, amount: numAmount });
      onClose();
    }
  };

  const isExpense = type === 'EXPENSE';
  const btnClass = isExpense ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700';
  const textClass = isExpense ? 'text-red-700' : 'text-green-700';

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${textClass}`}>
            New {isExpense ? 'Expense' : 'Revenue'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border rounded-lg" required />
          <input list={`cats-${type}`} type="text" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 border rounded-lg" required />
          <datalist id={`cats-${type}`}>
            {categories.map((cat: string) => <option key={cat} value={cat} />)}
          </datalist>
          <div className="relative">
            <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-3 border rounded-lg pr-12" required />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">ETB</span>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg">Cancel</button>
            <button type="submit" className={`px-4 py-2 text-white font-semibold rounded-lg ${btnClass}`}>
              Validate
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const ExportModal: React.FC<{ onClose: () => void; onExport: (format: 'csv' | 'pdf' | 'print') => void }> = ({ onClose, onExport }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Export Report</h3>
        <div className="space-y-3">
          <button onClick={() => onExport('csv')} className="w-full flex items-center gap-3 p-3 rounded-xl border hover:bg-blue-100 hover:border-blue-300 transition-all group">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-200"><FileText size={20} /></div>
            <span className="font-semibold text-slate-700">CSV Format</span>
          </button>
          <button onClick={() => onExport('pdf')} className="w-full flex items-center gap-3 p-3 rounded-xl border hover:bg-blue-100 hover:border-blue-300 transition-all group">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg group-hover:bg-red-200"><FileText size={20} /></div>
            <span className="font-semibold text-slate-700">PDF Format</span>
          </button>
          <button onClick={() => onExport('print')} className="w-full flex items-center gap-3 p-3 rounded-xl border hover:bg-blue-100 hover:border-blue-300 transition-all group">
            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg group-hover:bg-slate-200"><Printer size={20} /></div>
            <span className="font-semibold text-slate-700">Print</span>
          </button>
        </div>
        <button onClick={onClose} className="mt-6 w-full py-2 text-slate-500 hover:text-slate-700 font-medium">Cancel</button>
      </motion.div>
    </div>
  );
};

// --- CHARTS ---

const ExpensesPieChart: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const data = useMemo(() => {
    const expenses = (Array.isArray(transactions) ? transactions : []).filter((t: Transaction) => t.type === 'EXPENSE');
    if (expenses.length === 0) return [];
    const grouped = expenses.reduce((acc: Record<string, number>, tx: Transaction) => {
      const amount = Math.abs(tx.amount);
      const finalAmount = tx.vatApplicable ? amount * 1.15 : amount;
      acc[tx.category] = (acc[tx.category] || 0) + finalAmount;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  if (data.length === 0) return <div className="h-64 flex items-center justify-center text-slate-400">No expenses</div>;

  // CORRECTION CRITIQUE : Utilisation de 'any' pour contourner le blocage TypeScript strict
  const tooltipFormatter = (value: any, name: any) => {
    if (typeof value === 'number') {
      return [formatETB(value * 100), String(name)];
    }
    return [String(value || ''), String(name)];
  };

  return (
    <div className="h-64">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" nameKey="name" stroke="none">
            {data.map((_, i) => (
              <Cell key={i} fill={['#ef4444', '#dc2626', '#b91c1c', '#f87171', '#fca5a5'][i % 5]} />
            ))}
          </Pie>
          <Legend />
          <RechartsTooltip formatter={tooltipFormatter} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const RevenuesPieChart: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const data = useMemo(() => {
    const revenues = (Array.isArray(transactions) ? transactions : []).filter((t: Transaction) => t.type === 'INCOME');
    if (revenues.length === 0) return [];
    const grouped = revenues.reduce((acc: Record<string, number>, tx: Transaction) => {
      const amount = Math.abs(tx.amount);
      const finalAmount = tx.vatApplicable ? amount * 1.15 : amount;
      acc[tx.category] = (acc[tx.category] || 0) + finalAmount;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  if (data.length === 0) return <div className="h-64 flex items-center justify-center text-slate-400">No revenue</div>;

  // CORRECTION CRITIQUE : Utilisation de 'any' pour contourner le blocage TypeScript strict
  const tooltipFormatter = (value: any, name: any) => {
    if (typeof value === 'number') {
      return [formatETB(value * 100), String(name)];
    }
    return [String(value || ''), String(name)];
  };

  return (
    <div className="h-64">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" nameKey="name" stroke="none">
            {data.map((_, i) => (
              <Cell key={i} fill={['#2563eb', '#3b82f6', '#60a5fa', '#1d4ed8', '#1e40af'][i % 5]} />
            ))}
          </Pie>
          <Legend />
          <RechartsTooltip formatter={tooltipFormatter} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- WEEKLY BAR CHART COMPONENT ---
const WEEK_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const WeeklyBarChart: React.FC<{ transactions: Transaction[]; viewMode: 'week' | 'month' | 'year' }> = ({ transactions, viewMode }) => {
  const data = useMemo(() => {
    const now = new Date();
    
    if (viewMode === 'week') {
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : dayOfWeek - 1;
      const monday = new Date(now);
      monday.setDate(now.getDate() - mondayOffset);
      
      return WEEK_DAYS.map((day, index) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayTransactions = transactions.filter(tx => tx.date === dateStr);
        const income = dayTransactions
          .filter(tx => tx.type === 'INCOME')
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        const expense = dayTransactions
          .filter(tx => tx.type === 'EXPENSE')
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        
        return { day, date: dateStr, income, expense, label: day };
      });
    } else if (viewMode === 'month') {
      // Monthly view - 4 weeks
      const weeks = ['W1', 'W2', 'W3', 'W4'];
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      return weeks.map((week, index) => {
        const weekStart = new Date(monthStart);
        weekStart.setDate(monthStart.getDate() + (index * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const weekTransactions = transactions.filter(tx => {
          const txDate = new Date(tx.date);
          return txDate >= weekStart && txDate <= weekEnd;
        });
        
        const income = weekTransactions
          .filter(tx => tx.type === 'INCOME')
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        const expense = weekTransactions
          .filter(tx => tx.type === 'EXPENSE')
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        
        return { day: week, date: `${index + 1}`, income, expense, label: week };
      });
    } else {
      // Year view - 12 months
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const currentYear = now.getFullYear();
      
      return months.map((month, index) => {
        const monthTransactions = transactions.filter(tx => {
          const txDate = new Date(tx.date);
          return txDate.getFullYear() === currentYear && txDate.getMonth() === index;
        });
        
        const income = monthTransactions
          .filter(tx => tx.type === 'INCOME')
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        const expense = monthTransactions
          .filter(tx => tx.type === 'EXPENSE')
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        
        return { day: month, date: `${index + 1}`, income, expense, label: month };
      });
    }
  }, [transactions, viewMode]);

  if (data.every(d => d.income === 0 && d.expense === 0)) {
    return <div className="h-64 flex items-center justify-center text-slate-400">No data for this period</div>;
  }

  return (
    <div className="w-full">
      {/* Day/Month Labels at bottom of graph band */}
      <div className="flex mb-4">
        {data.map((item, index) => (
          <div 
            key={item.day} 
            className="flex-1 text-center font-bold text-sm text-slate-600 bg-slate-100 py-2 mx-1 rounded-lg first:ml-0 last:mr-0 border-b-4 border-blue-500"
          >
            {item.label}
          </div>
        ))}
      </div>
      
      {/* Bar Chart - Full Width */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 0, fill: 'transparent' }}
              height={0}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v: number) => (v / 100).toLocaleString()}
            />
            <RechartsTooltip 
              formatter={(value: number | undefined) => formatETB(value || 0)}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
            <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
          <span className="text-sm font-semibold text-slate-600">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
          <span className="text-sm font-semibold text-slate-600">Expense</span>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

interface MoneyFlowProps {
  searchTerm?: string;
}

const MoneyFlowInner: React.FC<MoneyFlowProps> = ({ searchTerm: globalSearch }) => {
  // Utilisation sécurisée du contexte avec cast pour éviter les erreurs TS
  const { 
    transactions: contextTransactions = [], 
    addTransaction, 
    deleteTransaction, 
    updateTransaction 
  } = (useLedger() || {}) as unknown as LedgerContextFull;
  
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [isValidatingCart, setIsValidatingCart] = useState(false);
  
  // View mode for Cash Flow Analytics
  const [cashFlowViewMode, setCashFlowViewMode] = useState<'week' | 'month' | 'year'>('week');
  
  // Presentation Editor State
  const [showPresentationEditor, setShowPresentationEditor] = useState(false);
  const [presentationSlides, setPresentationSlides] = useState([
    { id: 1, title: 'Cash Flow Overview', content: 'Monthly Analysis' },
    { id: 2, title: 'Revenue Streams', content: 'Income Distribution' },
    { id: 3, title: 'Expense Analysis', content: 'Cost Breakdown' }
  ]);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Spreadsheet State
  const initialSpreadsheetData: Record<string, { value: string | number; formula?: string }> = {
    'A1': { value: 'Date' }, 'B1': { value: 'Description' }, 'C1': { value: 'Category' },
    'D1': { value: 'Income' }, 'E1': { value: 'Expense' }, 'F1': { value: 'Balance' },
    'A2': { value: '2024-01-01' }, 'B2': { value: 'Product Sale' }, 'C2': { value: 'Sales' },
    'D2': { value: 1500, formula: '' }, 'E2': { value: 0, formula: '' }, 'F2': { value: 0, formula: '=D2-E2' },
    'A3': { value: '2024-01-02' }, 'B3': { value: 'Office Supplies' }, 'C3': { value: 'Expenses' },
    'D3': { value: 0, formula: '' }, 'E3': { value: 250, formula: '' }, 'F3': { value: 0, formula: '=D3-E3' },
    'A4': { value: '2024-01-03' }, 'B4': { value: 'Service Revenue' }, 'C4': { value: 'Services' },
    'D4': { value: 3000, formula: '' }, 'E4': { value: 0, formula: '' }, 'F4': { value: 0, formula: '=D4-E4' },
    'A5': { value: '2024-01-04' }, 'B5': { value: 'Utility Bill' }, 'C5': { value: 'Utilities' },
    'D5': { value: 0, formula: '' }, 'E5': { value: 180, formula: '' }, 'F5': { value: 0, formula: '=D5-E5' },
    'A6': { value: '2024-01-05' }, 'B6': { value: 'Consulting Fee' }, 'C6': { value: 'Services' },
    'D6': { value: 5000, formula: '' }, 'E6': { value: 0, formula: '' }, 'F6': { value: 0, formula: '=D6-E6' },
    'A7': { value: '2024-01-06' }, 'B7': { value: 'Transport' }, 'C7': { value: 'Logistics' },
    'D7': { value: 0, formula: '' }, 'E7': { value: 120, formula: '' }, 'F7': { value: 0, formula: '=D7-E7' },
    'A8': { value: '2024-01-07' }, 'B8': { value: 'Online Sale' }, 'C8': { value: 'Sales' },
    'D8': { value: 2200, formula: '' }, 'E8': { value: 0, formula: '' }, 'F8': { value: 0, formula: '=D8-E8' },
    'A9': { value: 'TOTAL', formula: '' }, 'B9': { value: '' }, 'C9': { value: '' },
    'D9': { value: 0, formula: '=SUM(D2:D8)' }, 'E9': { value: 0, formula: '=SUM(E2:E8)' }, 'F9': { value: 0, formula: '=SUM(F2:F8)' },
  };
  const [spreadsheetData, setSpreadsheetData] = useState<Record<string, { value: string | number; formula?: string }>>(initialSpreadsheetData);
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  
  // Calculate formula values
  const calculatedSpreadsheetData = useMemo(() => {
    const result: Record<string, { value: string | number; formula?: string }> = { ...spreadsheetData };
    
    // Simple formula parser
    const evaluateFormula = (formula: string, data: Record<string, { value: string | number; formula?: string }>): number => {
      if (!formula.startsWith('=')) return parseFloat(formula) || 0;
      
      const expr = formula.substring(1).toUpperCase();
      
      // SUM function
      if (expr.startsWith('SUM(')) {
        const range = expr.match(/([A-Z]+)([0-9]+):([A-Z]+)([0-9]+)/);
        if (range) {
          const startCol = range[1];
          const startRow = parseInt(range[2]);
          const endCol = range[3];
          const endRow = parseInt(range[4]);
          
          let sum = 0;
          for (let row = startRow; row <= endRow; row++) {
            for (let colCode = startCol.charCodeAt(0); colCode <= endCol.charCodeAt(0); colCode++) {
              const cell = `${String.fromCharCode(colCode)}${row}`;
              if (data[cell]) {
                const val = data[cell].formula ? evaluateFormula(data[cell].formula!, data) : data[cell].value;
                sum += parseFloat(String(val)) || 0;
              }
            }
          }
          return sum;
        }
      }
      
      // Simple arithmetic
      try {
        // Replace cell references with values
        let evalExpr = expr;
        const cellRefs = expr.match(/[A-Z]+[0-9]+/g) || [];
        cellRefs.forEach(ref => {
          if (data[ref]) {
            const val = data[ref].formula ? evaluateFormula(data[ref].formula!, data) : data[ref].value;
            evalExpr = evalExpr.replace(ref, String(parseFloat(String(val)) || 0));
          }
        });
        // eslint-disable-next-line no-eval
        return eval(evalExpr);
      } catch {
        return 0;
      }
    };
    
    // Calculate all formulas
    Object.keys(result).forEach(key => {
      if (result[key].formula) {
        result[key].value = evaluateFormula(result[key].formula!, result);
      }
    });
    
    return result;
  }, [spreadsheetData]);
  
  const handleCellChange = (cell: string, value: string) => {
    const newData = { ...spreadsheetData };
    if (value.startsWith('=')) {
      newData[cell] = { value: 0, formula: value };
    } else {
      const numValue = parseFloat(value);
      newData[cell] = { value: isNaN(numValue) ? value : numValue, formula: '' };
    }
    setSpreadsheetData(newData);
  };
  
  // Presentation Editor functions
  const addSlide = () => {
    const newSlide = {
      id: presentationSlides.length + 1,
      title: `Slide ${presentationSlides.length + 1}`,
      content: 'New Content'
    };
    setPresentationSlides([...presentationSlides, newSlide]);
    setCurrentSlide(presentationSlides.length);
  };
  
  const deleteSlide = (index: number) => {
    if (presentationSlides.length > 1) {
      const newSlides = presentationSlides.filter((_, i) => i !== index);
      setPresentationSlides(newSlides);
      setCurrentSlide(Math.min(currentSlide, newSlides.length - 1));
    }
  };
  
  const duplicateSlide = (index: number) => {
    const slide = presentationSlides[index];
    const newSlide = { ...slide, id: Date.now() };
    const newSlides = [...presentationSlides];
    newSlides.splice(index + 1, 0, newSlide);
    setPresentationSlides(newSlides);
  };
  
  const updateSlideTitle = (index: number, title: string) => {
    const newSlides = [...presentationSlides];
    newSlides[index] = { ...newSlides[index], title };
    setPresentationSlides(newSlides);
  };
  
  const updateSlideContent = (index: number, content: string) => {
    const newSlides = [...presentationSlides];
    newSlides[index] = { ...newSlides[index], content };
    setPresentationSlides(newSlides);
  };
  const transactions = useMemo(() => {
    // Utiliser directement les transactions du contexte comme seule source de vérité.
    if (!Array.isArray(contextTransactions)) {
      return [];
    }
    return contextTransactions.filter(Boolean).map(tx => {
      // S'assurer que chaque transaction a des valeurs par défaut pour éviter les erreurs de rendu
      // Cela nettoie les données à la volée.
      let formattedDate = new Date().toISOString().split('T')[0];
      try {
        if (tx.date) {
          const d = new Date(tx.date);
          if (!isNaN(d.getTime())) {
            formattedDate = d.toISOString().split('T')[0];
          }
        }
      } catch (e) { /* Ignorer les erreurs de date et utiliser la date du jour par défaut */ }
      return {
          ...tx,
          item: tx.item || tx.description || 'Transaction',
          description: tx.item || tx.description || 'Transaction',
          category: tx.category || 'General',
          date: formattedDate,
          vatApplicable: tx.vatApplicable !== undefined ? tx.vatApplicable : true,
          amount: typeof tx.amount === 'number' ? tx.amount : 0,
          reference: tx.reference || tx.id?.substring(0, 8).toUpperCase() || 'REF',
          counterparty: tx.counterparty || 'External Party'
      };
    });
  }, [contextTransactions]);
  
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddRevenue, setShowAddRevenue] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isDirectMode, setIsDirectMode] = useState(false);

  // --- HISTORY SEARCH STATE ---
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [historyDateRange, setHistoryDateRange] = useState({ start: '', end: '' });
  const [historyPeriod, setHistoryPeriod] = useState<'day' | 'week' | 'month' | 'year' | 'custom'>('day');
  const [historyResults, setHistoryResults] = useState<Transaction[]>([]);
  const [showHistoryResults, setShowHistoryResults] = useState(false);
  const [isLedgerExpanded, setIsLedgerExpanded] = useState(false);
  const [isExpensesExpanded, setIsExpensesExpanded] = useState(false);
  const [isRevenuesExpanded, setIsRevenuesExpanded] = useState(false);
  
  // Carts
  const [expenseCart, setExpenseCart] = useState<CartItem[]>([]);
  const [revenueCart, setRevenueCart] = useState<CartItem[]>([]);

  // Available products for quick click
  const [expenseProducts, setExpenseProducts] = useState<QuickProduct[]>([
    { id: 'e1', name: 'Office Supplies', price: 2500, category: 'Supplier', type: 'EXPENSE' },
    { id: 'e2', name: 'Premises Rent', price: 12000, category: 'Real Estate', type: 'EXPENSE' },
    { id: 'e3', name: 'Internet', price: 500, category: 'Services', type: 'EXPENSE' },
    { id: 'e4', name: 'Transport', price: 300, category: 'Logistics', type: 'EXPENSE' },
  ]);

  const [revenueProducts, setRevenueProducts] = useState<QuickProduct[]>(
    allProducts
      .filter(p => typeof p.sellingPrice === 'number' && p.sellingPrice > 0)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.sellingPrice!,
        category: p.category,
        type: 'INCOME'
      }))
  );

  // --- DAILY LEDGER LOGIC (Main Table) ---
  const today = new Date().toISOString().split('T')[0];

  const dailyTransactions = useMemo(() => {
    // Filter strictly for today
    let daily = transactions.filter(t => t.date === today);
    
    // Optional: Allow global search to filter within today's transactions if needed, or keep it strict
    const term = (globalSearch || searchTerm).toLowerCase();
    if (term) {
      daily = daily.filter(tx => 
        tx.item.toLowerCase().includes(term) ||
        tx.category.toLowerCase().includes(term) ||
        tx.amount.toString().includes(term)
      );
    }
    return daily;
  }, [transactions, today, globalSearch, searchTerm]);

  // Préparation des données pour le tableau (DAILY)
  const tableTransactions = useMemo(() => {
    return dailyTransactions.map(tx => {
      const categoryUpper = (tx.category || 'GENERAL').toUpperCase();
      const amountInCents = Math.abs(tx.amount || 0) * 100; 
      
      return {
        ...tx,
        description: tx.item,
        amount: amountInCents,
        vatApplicable: tx.vatApplicable !== undefined ? tx.vatApplicable : true,
        withholdingEligible: ['CONTRACTOR', 'RENT', 'COMMISSION', 'CONSULTANT'].some(c => categoryUpper.includes(c)),
        reference: tx.reference || tx.id.substring(0, 8).toUpperCase(),
        counterparty: tx.counterparty || 'External Party'
      };
    });
  }, [dailyTransactions]);

  // Sort table transactions
  const sortedTableTransactions = useMemo(() => {
    return [...tableTransactions].sort((a, b) => b.id.localeCompare(a.id)); // Simple sort for daily
  }, [tableTransactions]);

  const ledgerTransactionsToShow = useMemo(() => {
    return isLedgerExpanded ? sortedTableTransactions : sortedTableTransactions.slice(0, 10);
  }, [sortedTableTransactions, isLedgerExpanded]);

  // Calcul des totaux (DAILY)
  const { totalExpenses, totalRevenues, totalVat } = useMemo(() => {
    let exp = 0;
    let rev = 0;
    let vat = 0;
    
    for (const tx of tableTransactions) {
      const amountInETB = tx.amount / 100;
      const amountWithVat = amountInETB + (tx.vatApplicable ? amountInETB * 0.15 : 0);
      
      if (tx.type === 'EXPENSE') {
        exp += amountWithVat;
      } else {
        rev += amountWithVat;
      }
      
      if (tx.vatApplicable) {
        vat += amountInETB * 0.15;
      }
    }
    
    return {
      totalExpenses: exp,
      totalRevenues: rev,
      totalVat: vat
    };
  }, [tableTransactions]);

  // --- HISTORY SEARCH HANDLERS ---
  const handleHistorySearch = useCallback(() => {
    let results = [...transactions];

    // Date Filtering
    if (historyPeriod === 'custom' && historyDateRange.start && historyDateRange.end) {
      results = results.filter(t => t.date >= historyDateRange.start && t.date <= historyDateRange.end);
    } else if (historyPeriod === 'day' && historyDateRange.start) {
      results = results.filter(t => t.date === historyDateRange.start);
    } else if (historyPeriod === 'week') {
      // Simple week logic (last 7 days from start date or today)
      const d = historyDateRange.start ? new Date(historyDateRange.start) : new Date();
      const weekAgo = new Date(d);
      weekAgo.setDate(d.getDate() - 7);
      const minDate = weekAgo.toISOString().split('T')[0];
      const maxDate = d.toISOString().split('T')[0];
      results = results.filter(t => t.date >= minDate && t.date <= maxDate);
    } else if (historyPeriod === 'month') {
      const d = historyDateRange.start ? new Date(historyDateRange.start) : new Date();
      const monthPrefix = d.toISOString().slice(0, 7); // YYYY-MM
      results = results.filter(t => t.date.startsWith(monthPrefix));
    } else if (historyPeriod === 'year') {
      const d = historyDateRange.start ? new Date(historyDateRange.start) : new Date();
      const yearPrefix = d.toISOString().slice(0, 4); // YYYY
      results = results.filter(t => t.date.startsWith(yearPrefix));
    }

    // Term Filtering
    if (historySearchTerm.trim()) {
      const term = historySearchTerm.toLowerCase();
      results = results.filter(tx => 
        tx.item.toLowerCase().includes(term) ||
        tx.category.toLowerCase().includes(term) ||
        tx.amount.toString().includes(term) ||
        tx.type.toLowerCase().includes(term)
      );
    }

    // Sort by date desc
    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setHistoryResults(results);
    setShowHistoryResults(true);
  }, [transactions, historyPeriod, historyDateRange, historySearchTerm]);

  const saveToFiles = useCallback((data: Transaction[], title: string) => {
    try {
      const fileId = `file_${Date.now()}`;
      
      // Convert transactions to spreadsheet cells format
      const cells: any = {};
      const headers = ['Date', 'Item', 'Category', 'Type', 'Amount', 'VAT'];
      headers.forEach((h, i) => {
        cells[`${String.fromCharCode(65+i)}1`] = { value: h, style: { bold: true, bgColor: '#f1f5f9' } };
      });
      
      data.forEach((tx, rowIdx) => {
        const row = rowIdx + 2;
        cells[`A${row}`] = { value: tx.date, style: {} };
        cells[`B${row}`] = { value: tx.item, style: {} };
        cells[`C${row}`] = { value: tx.category, style: {} };
        cells[`D${row}`] = { value: tx.type, style: { textColor: tx.type === 'EXPENSE' ? '#ef4444' : '#10b981' } };
        cells[`E${row}`] = { value: Math.abs(tx.amount).toString(), style: {} };
        cells[`F${row}`] = { value: tx.vatApplicable ? 'Yes' : 'No', style: {} };
      });

      const newFile = {
        id: fileId,
        name: title,
        type: 'spreadsheet',
        size: `${(JSON.stringify(data).length / 1024).toFixed(2)} KB`,
        createdAt: new Date().toISOString(),
        folderId: 'root',
        data: { name: title, cells }
      };

      // Save to localStorage
      const files = JSON.parse(localStorage.getItem('creative-workspace-files') || '[]');
      const folders = JSON.parse(localStorage.getItem('creative-workspace-folders') || '[]');
      
      localStorage.setItem('creative-workspace-files', JSON.stringify([...files, newFile]));
      
      const rootFolder = folders.find((f: any) => f.id === 'root');
      if (rootFolder) {
        rootFolder.items.push(fileId);
        localStorage.setItem('creative-workspace-folders', JSON.stringify(folders));
      } else {
        // Initialize folders if missing
        const newRoot = { id: 'root', name: 'Main Folder', createdAt: new Date().toISOString(), items: [fileId] };
        localStorage.setItem('creative-workspace-folders', JSON.stringify([newRoot, ...folders]));
      }
      
      alert('Saved to Files & Projects successfully!');
    } catch (e) {
      console.error('Error saving file:', e);
      alert('Failed to save file.');
    }
  }, []);

  /* REMOVED OLD SEARCH LOGIC BLOCKS TO AVOID CONFLICTS */
  /*
  const filteredTransactions = useMemo(() => {
    const effectiveSearch = globalSearch || searchTerm;
    if (!effectiveSearch.trim()) return transactions;
    const term = effectiveSearch.toLowerCase();
    
    return transactions.filter((tx: Transaction) => {
      return (
        tx.date.toLowerCase().includes(term) ||
        tx.item.toLowerCase().includes(term) ||
        tx.category.toLowerCase().includes(term) ||
        tx.amount.toString().includes(term) ||
        tx.type.toLowerCase().includes(term)
      );
    });
  }, [transactions, searchTerm, globalSearch]); */

  // Handlers
  const addToCart = useCallback((product: QuickProduct, type: 'INCOME' | 'EXPENSE') => {
    const cart = type === 'EXPENSE' ? expenseCart : revenueCart;
    const setCart = type === 'EXPENSE' ? setExpenseCart : setRevenueCart;

    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1, type }]);
    }
  }, [expenseCart, revenueCart]);

  const removeFromCart = useCallback((id: string, type: 'INCOME' | 'EXPENSE') => {
    const setCart = type === 'EXPENSE' ? setExpenseCart : setRevenueCart;
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, delta: number, type: 'INCOME' | 'EXPENSE') => {
    const cart = type === 'EXPENSE' ? expenseCart : revenueCart;
    const setCart = type === 'EXPENSE' ? setExpenseCart : setRevenueCart;
    
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  }, [expenseCart, revenueCart]);

  const validateCart = useCallback((type: 'INCOME' | 'EXPENSE') => {
    const cart = type === 'EXPENSE' ? expenseCart : revenueCart;
    const setCart = type === 'EXPENSE' ? setExpenseCart : setRevenueCart;
    
    if (cart.length === 0 || isValidatingCart) return;

    setIsValidatingCart(true);
    
    const newTransactions = cart.map(item => ({
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      item: item.quantity > 1 ? `${item.name} (x${item.quantity})` : item.name,
      description: item.quantity > 1 ? `${item.name} (x${item.quantity})` : item.name,
      category: item.category,
      amount: type === 'EXPENSE' ? -Math.abs(item.price * item.quantity) : Math.abs(item.price * item.quantity),
      type,
      vatApplicable: true,
      reference: generateId().substring(0, 8).toUpperCase(),
      counterparty: 'Client'
    } as Transaction));

    if (addTransaction) {
      newTransactions.forEach(tx => addTransaction(tx));
    } else {
      console.warn('⚠️ addTransaction is undefined - context not available. Cannot add transactions.');
      // Optionally, show an error to the user.
    }
    
    setCart([]);
    setIsValidatingCart(false);

  }, [expenseCart, revenueCart, isValidatingCart, addTransaction]);

  const addQuickTransaction = useCallback((product: QuickProduct) => {
    const newTx: Transaction = {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      item: product.name,
      description: product.name,
      category: product.category,
      amount: product.type === 'EXPENSE' ? -Math.abs(product.price) : Math.abs(product.price),
      type: product.type,
      vatApplicable: true,
      reference: generateId().substring(0, 8).toUpperCase(),
      counterparty: 'Client Direct'
    };
    
    if (addTransaction) {
      addTransaction(newTx);
    } else {
      console.warn('⚠️ addTransaction is undefined!');
    }
  }, [addTransaction]);

  const handleAddNewItem = useCallback((item: { name: string; category: string; amount: number }, type: 'INCOME' | 'EXPENSE') => {
    const newTx: Transaction = {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      item: item.name,
      description: item.name,
      category: item.category,
      amount: type === 'EXPENSE' ? -Math.abs(item.amount) : Math.abs(item.amount),
      type,
      vatApplicable: true,
      reference: generateId().substring(0, 8).toUpperCase(),
      counterparty: 'Manual Entry'
    };
    
    if (addTransaction) {
      addTransaction(newTx);
    } else {
      console.warn('⚠️ addTransaction is undefined!');
    }

    const newProduct: QuickProduct = {
      id: generateId(),
      name: item.name,
      price: item.amount,
      category: item.category,
      type,
    };
    
    if (type === 'EXPENSE') {
      setExpenseProducts(prev => [...prev, newProduct]);
    } else {
      setRevenueProducts(prev => [...prev, newProduct]);
    }
  }, [addTransaction]);

  const handleDeleteTransaction = useCallback(() => {
    if (transactionToDelete) {
      if (deleteTransaction) {
        deleteTransaction(transactionToDelete);
      } else {
        console.warn('⚠️ deleteTransaction is undefined!');
      }
      setTransactionToDelete(null);
    }
  }, [transactionToDelete, deleteTransaction]);

  const handleManualRefresh = useCallback(() => {
    // This might not be needed anymore if context updates are reliable.
    // If needed, it should trigger a re-fetch at the context level.
  }, []);

  const handleExport = useCallback((format: 'csv' | 'pdf' | 'print') => {
    if (format === 'print') {
      window.print();
    } else if (format === 'csv') {
      const headers = ['Date', 'Item', 'Category', 'Type', 'Amount', 'VAT Applicable', 'Reference'];
      const rows = sortedTableTransactions.map(tx => [
        tx.date,
        `"${tx.item.replace(/"/g, '""')}"`,
        tx.category,
        tx.type,
        (tx.amount / 100).toFixed(2),
        tx.vatApplicable ? 'Yes' : 'No',
        tx.reference
      ]);
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `money_flow_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text("Money Flow Report", 14, 15);
      let y = 25;
      sortedTableTransactions.forEach((tx) => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.setFontSize(10);
        doc.text(`${tx.date} | ${tx.item} | ${formatETB(tx.amount)}`, 14, y);
        y += 7;
      });
      doc.save(`money_flow_report.pdf`);
    }
    setShowExportModal(false);
  }, [sortedTableTransactions]);

  return (
    <div className="relative min-h-screen bg-white p-4 md:p-8 overflow-hidden" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      {/* MODALS */}
      <AnimatePresence>
        {showAddExpense && (
          <AddItemModal type="EXPENSE" onAdd={(item) => handleAddNewItem(item, 'EXPENSE')} onClose={() => setShowAddExpense(false)} categories={['Supplier', 'Real Estate', 'Services', 'Logistics']} />
        )}
        {showAddRevenue && (
          <AddItemModal type="INCOME" onAdd={(item) => handleAddNewItem(item, 'INCOME')} onClose={() => setShowAddRevenue(false)} categories={['Beverage', 'Pastry', 'Dish']} />
        )}
        {transactionToDelete && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Confirm deletion</h3>
              <p className="text-slate-500 mb-6">Are you sure you want to delete this transaction? This action is irreversible.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setTransactionToDelete(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200">Cancel</button>
                <button onClick={handleDeleteTransaction} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {showExportModal && (
          <ExportModal onClose={() => setShowExportModal(false)} onExport={handleExport} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-end items-start md:items-center gap-4 relative z-10">
        <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <span className={`text-sm font-bold ${isDirectMode ? 'text-blue-600' : 'text-slate-500'}`}>Direct Mode</span>
          <button 
            onClick={() => setIsDirectMode(!isDirectMode)}
            className={`w-12 h-6 rounded-full transition-colors relative ${isDirectMode ? 'bg-blue-600' : 'bg-slate-300'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${isDirectMode ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>
      
      {/* SEARCH - ALL FIELDS */}
      <div className="sticky top-0 z-30 mb-8 max-w-4xl mx-auto">
        <motion.div whileHover={{ scale: 1.01 }} className="relative flex items-center bg-white rounded-xl shadow-lg border border-slate-200 p-1">
          <Search className="ml-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search in TODAY'S transactions..."
            value={searchTerm || globalSearch || ''}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-3 pr-4 bg-transparent placeholder-slate-400 text-slate-700 focus:outline-none"
          />
        </motion.div>
      </div>

      {/* MAIN GRID - EXPENSES & REVENUES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 max-w-7xl mx-auto relative z-10">
        
        {/* EXPENSES - RECTANGLE STYLE */}
        <motion.div whileHover={{ scale: 1.01 }} className="bg-white/70 backdrop-blur-[5px] p-6 rounded-2xl shadow-lg border border-red-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-red-700 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              Expenses
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowAddExpense(true)} 
                className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
          
          {/* EXPENSE PRODUCTS WITH CART CONTROLS */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {expenseProducts.slice(0, isExpensesExpanded ? undefined : 4).map((product) => {
              const inCart = expenseCart.find((i: CartItem) => i.id === product.id);
              return (
                <div key={product.id} className="relative p-4 bg-white rounded-xl shadow-sm hover:shadow-md border border-red-100 hover:border-red-300 transition text-left group cursor-pointer">
                  <button 
                    onClick={() => {
                      if (isDirectMode) {
                        addQuickTransaction(product);
                      } else {
                        const existing = expenseCart.find(item => item.id === product.id);
                        if (existing) {
                          updateQuantity(product.id, 1, 'EXPENSE');
                        } else {
                          addToCart(product, 'EXPENSE');
                        }
                      }
                    }} 
                    className="w-full text-left active:scale-95 transition-transform"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-slate-800 text-sm">{product.name}</span>
                      <div className="flex items-center gap-1">
                        {inCart && (
                          <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            {inCart.quantity} clicks
                          </span>
                        )}
                        <PlusCircle size={16} className="text-red-400 group-hover:text-red-600" />
                      </div>
                    </div>
                    <div className="text-red-600 font-bold">
                      {product.price.toLocaleString()} ETB
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{product.category}</div>
                  </button>
                </div>
              );
            })}
          </div>
          
          {expenseProducts.length > 4 && (
            <button 
              onClick={() => setIsExpensesExpanded(!isExpensesExpanded)}
              className="w-full py-2 text-xs font-bold text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-1 mb-2"
            >
              {isExpensesExpanded ? 'Show Less' : `Show ${expenseProducts.length - 4} More`}
              <ChevronDown size={14} className={`transition-transform ${isExpensesExpanded ? 'rotate-180' : ''}`} />
            </button>
          )}

          {/* EXPENSE CART */}
          {expenseCart.length > 0 && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-red-800 text-sm">Expense Cart ({expenseCart.reduce((a: number, b: CartItem) => a + b.quantity, 0)})</h4>
                <button 
                  onClick={() => validateCart('EXPENSE')}
                  disabled={isValidatingCart}
                  className="px-4 py-1.5 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isValidatingCart ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      Validate All
                    </>
                  )}
                </button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {expenseCart.map((item: CartItem) => (
                  <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded-lg text-sm">
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">{item.name}</div>
                      <div className="text-xs text-slate-500">{item.category}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                        {item.quantity} × {item.price.toLocaleString()} ETB
                      </div>
                      <div className="text-red-600 font-bold w-24 text-right">
                        {(item.price * item.quantity).toLocaleString()} ETB
                      </div>
                      <button onClick={() => removeFromCart(item.id, 'EXPENSE')} className="text-slate-400 hover:text-red-500">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* REVENUES - RECTANGLE STYLE */}
        <motion.div whileHover={{ scale: 1.01 }} className="bg-white/70 backdrop-blur-[5px] p-6 rounded-2xl shadow-lg border border-green-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-green-700 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Revenues
            </h2>
            <button 
              onClick={() => setShowAddRevenue(true)} 
              className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition"
            >
              <Plus size={20} />
            </button>
          </div>
          
          {/* REVENUE PRODUCTS WITH CART CONTROLS */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {revenueProducts.slice(0, isRevenuesExpanded ? undefined : 4).map((product) => {
              const inCart = revenueCart.find((i: CartItem) => i.id === product.id);
              return (
                <div key={product.id} className="relative p-4 bg-white rounded-xl shadow-sm hover:shadow-md border border-green-100 hover:border-green-300 transition text-left group cursor-pointer">
                  <button 
                    onClick={() => {
                      if (isDirectMode) {
                        addQuickTransaction(product);
                      } else {
                        const existing = revenueCart.find(item => item.id === product.id);
                        if (existing) {
                          updateQuantity(product.id, 1, 'INCOME');
                        } else {
                          addToCart(product, 'INCOME');
                        }
                      }
                    }} 
                    className="w-full text-left active:scale-95 transition-transform"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-slate-800 text-sm">{product.name}</span>
                      <div className="flex items-center gap-1">
                        {inCart && (
                          <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            {inCart.quantity} clicks
                          </span>
                        )}
                        <PlusCircle size={16} className="text-green-400 group-hover:text-green-600" />
                      </div>
                    </div>
                    <div className="text-green-600 font-bold">
                      {product.price.toLocaleString()} ETB
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{product.category}</div>
                  </button>
                </div>
              );
            })}
          </div>

          {revenueProducts.length > 4 && (
            <button 
              onClick={() => setIsRevenuesExpanded(!isRevenuesExpanded)}
              className="w-full py-2 text-xs font-bold text-green-500 hover:bg-green-50 rounded-lg transition-colors flex items-center justify-center gap-1 mb-2"
            >
              {isRevenuesExpanded ? 'Show Less' : `Show ${revenueProducts.length - 4} More`}
              <ChevronDown size={14} className={`transition-transform ${isRevenuesExpanded ? 'rotate-180' : ''}`} />
            </button>
          )}

          {/* REVENUE CART */}
          {revenueCart.length > 0 && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-green-800 text-sm">Revenue Cart ({revenueCart.reduce((a: number, b: CartItem) => a + b.quantity, 0)})</h4>
                <button 
                  onClick={() => validateCart('INCOME')}
                  disabled={isValidatingCart}
                  className="px-4 py-1.5 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isValidatingCart ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      Validate All
                    </>
                  )}
                </button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {revenueCart.map((item: CartItem) => (
                  <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded-lg text-sm">
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">{item.name}</div>
                      <div className="text-xs text-slate-500">{item.category}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        {item.quantity} × {item.price.toLocaleString()} ETB
                      </div>
                      <div className="text-green-600 font-bold w-24 text-right">
                        {(item.price * item.quantity).toLocaleString()} ETB
                      </div>
                      <button onClick={() => removeFromCart(item.id, 'INCOME')} className="text-slate-400 hover:text-green-500">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* CASH FLOW ANALYTICS - FULL WIDTH WITH WEEK/MONTH/YEAR */}
      <div className="w-full mb-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">CASH FLOW ANALYTICS</h3>
                <p className="text-sm text-slate-500">Income vs Expenses Analysis</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCashFlowViewMode('week')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${cashFlowViewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Week
              </button>
              <button
                onClick={() => setCashFlowViewMode('month')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${cashFlowViewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Month
              </button>
              <button
                onClick={() => setCashFlowViewMode('year')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${cashFlowViewMode === 'year' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Year
              </button>
            </div>
          </div>
          <WeeklyBarChart transactions={transactions} viewMode={cashFlowViewMode} />
        </div>
      </div>

      {/* SPREADSHEET - ACTIVE CALCULATION SPACE */}
      <div className="w-full mb-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Layout size={24} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Money Flow Spreadsheet</h3>
              <p className="text-sm text-slate-500">Active calculation space with formulas</p>
            </div>
            <div className="ml-auto flex gap-2">
              <button 
                onClick={() => setSpreadsheetData(initialSpreadsheetData)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-inner">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-600 to-slate-700">
                  <th className="w-12 p-3 text-center font-semibold text-white border border-slate-500">#</th>
                  {['A', 'B', 'C', 'D', 'E', 'F'].map(col => (
                    <th key={col} className="w-28 p-3 text-center font-semibold text-white border border-slate-500">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 15 }, (_, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-blue-50/50'}>
                    <td className="p-2 text-center font-semibold text-slate-500 border border-slate-200 bg-slate-100">{rowIndex + 1}</td>
                    {['A', 'B', 'C', 'D', 'E', 'F'].map(col => {
                      const cellId = `${col}${rowIndex + 1}`;
                      const cellData = calculatedSpreadsheetData[cellId];
                      const isActive = activeCell === cellId;
                      const isEditing = editingCell === cellId;
                      
                      return (
                        <td key={cellId} className="border border-slate-200 p-0">
                          {isEditing ? (
                            <input
                              type="text"
                              autoFocus
                              className="w-full h-full px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                              defaultValue={cellData?.formula || String(cellData?.value || '')}
                              onBlur={(e) => {
                                handleCellChange(cellId, e.target.value);
                                setEditingCell(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleCellChange(cellId, e.currentTarget.value);
                                  setEditingCell(null);
                                }
                              }}
                            />
                          ) : (
                            <div
                              className={`w-full h-full px-3 py-2 cursor-text transition-all ${isActive ? 'ring-2 ring-emerald-500 bg-emerald-50' : 'hover:bg-blue-100'}
                                ${cellData?.formula ? 'text-blue-600 font-medium' : 'text-slate-700'}
                              `}
                              onClick={() => setActiveCell(cellId)}
                              onDoubleClick={() => setEditingCell(cellId)}
                            >
                              {cellData?.formula ? (
                                <span className="flex items-center gap-1">
                                  <span className="text-blue-400">=</span>
                                  {cellData.value}
                                </span>
                              ) : (
                                <span className={cellData?.value !== undefined && cellData?.value !== '' ? '' : 'text-slate-300'}>
                                  {cellData?.value !== undefined ? cellData?.value : ' '}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Click to select cell
            </span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Double-click to edit
            </span>
            <span className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Use =SUM() formulas
            </span>
          </div>
        </div>
      </div>

      {/* PRESENTATION EDITOR - POWERPOINT FEATURES */}
      <div className="w-full mb-8 relative z-10">
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Presentation size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Back Presentation Editor</h3>
                <p className="text-purple-100 text-sm">PowerPoint-style presentation features</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors" title="Undo">
                <Undo size={18} />
              </button>
              <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors" title="Redo">
                <Redo size={18} />
              </button>
              <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors" title="Add Slide">
                <Plus size={18} />
              </button>
              <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors" title="Delete Slide">
                <Trash size={18} />
              </button>
            </div>
          </div>
          
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 mb-6 p-3 bg-white/10 rounded-lg">
            <button className="p-2 hover:bg-white/20 rounded transition-colors"><Bold size={16} /></button>
            <button className="p-2 hover:bg-white/20 rounded transition-colors"><Italic size={16} /></button>
            <button className="p-2 hover:bg-white/20 rounded transition-colors"><Underline size={16} /></button>
            <div className="w-px bg-white/20 mx-1"></div>
            <button className="p-2 hover:bg-white/20 rounded transition-colors"><AlignLeft size={16} /></button>
            <button className="p-2 hover:bg-white/20 rounded transition-colors"><AlignCenter size={16} /></button>
            <button className="p-2 hover:bg-white/20 rounded transition-colors"><AlignRight size={16} /></button>
            <div className="w-px bg-white/20 mx-1"></div>
            <button className="p-2 hover:bg-white/20 rounded transition-colors"><List size={16} /></button>
            <button className="p-2 hover:bg-white/20 rounded transition-colors"><ListOrdered size={16} /></button>
            <div className="w-px bg-white/20 mx-1"></div>
            <button className="p-2 hover:bg-white/20 rounded transition-colors"><Type size={16} /></button>
            <button className="p-2 hover:bg-white/20 rounded transition-colors"><Palette size={16} /></button>
            <button className="p-2 hover:bg-white/20 rounded transition-colors"><ImageIcon size={16} /></button>
            <button className="p-2 hover:bg-white/20 rounded transition-colors"><Square size={16} /></button>
            <button className="p-2 hover:bg-white/20 rounded transition-colors"><Circle size={16} /></button>
            <button className="p-2 hover:bg-white/20 rounded transition-colors"><Triangle size={16} /></button>
            <div className="w-px bg-white/20 mx-1"></div>
            <button className="p-2 hover:bg-white/20 rounded transition-colors"><Move size={16} /></button>
            <button className="p-2 hover:bg-white/20 rounded transition-colors"><RotateCw size={16} /></button>
            <button className="p-2 hover:bg-white/20 rounded transition-colors"><ZoomIn size={16} /></button>
            <button className="p-2 hover:bg-white/20 rounded transition-colors"><ZoomOut size={16} /></button>
            <div className="w-px bg-white/20 mx-1"></div>
            <button className="p-2 hover:bg-white/20 rounded transition-colors"><Layers size={16} /></button>
            <button className="p-2 hover:bg-white/20 rounded transition-colors"><Monitor size={16} /></button>
          </div>
          
          {/* Slides Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {presentationSlides.map((slide, index) => (
              <div 
                key={slide.id}
                className={`relative p-4 rounded-xl cursor-pointer transition-all ${currentSlide === index ? 'bg-white text-purple-800 ring-4 ring-white/30' : 'bg-white/10 hover:bg-white/20'}`}
                onClick={() => setCurrentSlide(index)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold opacity-60">Slide {index + 1}</span>
                  <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); duplicateSlide(index); }}
                      className="p-1 bg-white/20 hover:bg-white/40 rounded"
                      title="Duplicate"
                    >
                      <Copy size={12} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteSlide(index); }}
                      className="p-1 bg-red-500/50 hover:bg-red-500/70 rounded"
                      title="Delete"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) => updateSlideTitle(index, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-transparent border-none focus:outline-none font-bold text-lg mb-2 placeholder-white/50"
                  placeholder="Slide Title"
                />
                <textarea
                  value={slide.content}
                  onChange={(e) => updateSlideContent(index, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-transparent border-none focus:outline-none text-sm opacity-70 resize-none"
                  placeholder="Click to add content..."
                  rows={3}
                />
              </div>
            ))}
            <button 
              onClick={addSlide}
              className="p-4 rounded-xl border-2 border-dashed border-white/30 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-2 text-white/60 hover:text-white"
            >
              <Plus size={24} />
              <span className="text-sm font-semibold">Add Slide</span>
            </button>
          </div>
          
          {/* Export Options */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-white/20">
            <button className="flex-1 py-2 bg-white text-purple-700 font-semibold rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-2">
              <DownloadIcon size={16} /> Export as PPTX
            </button>
            <button className="flex-1 py-2 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors flex items-center justify-center gap-2">
              <Share2 size={16} /> Share Presentation
            </button>
          </div>
        </div>

        {/* SECURE VAULT - BACK SECTION */}
        <div className="mt-6">
          <SecureVault searchTerm={searchTerm} />
        </div>
      </div>

      {/* SECURE VAULT */}
      <SecureVault searchTerm={searchTerm} />

      {/* MASTER LEDGER */}
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-[5px] rounded-2xl shadow-lg overflow-hidden mb-8 relative z-10">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><ScrollText size={24} className="text-blue-600" /></div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Daily Ledger</h3>
              <p className="text-sm text-slate-500">Transactions for {today}</p>
              <p className="text-xs text-slate-400 mt-1">{sortedTableTransactions.length} entries today</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
            <button onClick={handleManualRefresh} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors" title="Refresh">
              <RefreshCw size={20} className="text-slate-600" />
            </button>
            <button onClick={() => setShowExportModal(true)} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Download size={18} /><span className="hidden sm:inline text-sm font-semibold">EXPORT in CSV/ PDF</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 bg-slate-50">
                <th className="pb-3 pt-2 px-2 font-semibold">DATE</th>
                <th className="pb-3 pt-2 px-2 font-semibold">ITEM / DESCRIPTION</th>
                <th className="pb-3 pt-2 px-2 font-semibold">CATEGORY</th>
                <th className="pb-3 pt-2 px-2 font-semibold text-right">DEBIT</th>
                <th className="pb-3 pt-2 px-2 font-semibold text-right">CREDIT</th>
                <th className="pb-3 pt-2 px-2 font-semibold text-center">VAT (15%)</th>
                <th className="pb-3 pt-2 px-2 font-semibold text-xs">REFERENCE</th>
                <th className="pb-3 pt-2 px-2 font-semibold text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {sortedTableTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShoppingCart size={32} className="text-slate-300" />
                      <p>No transactions for today</p>
                      <p className="text-sm">Add expenses or revenues above</p>
                    </div>
                  </td>
                </tr>
              ) : (
                ledgerTransactionsToShow.map((tx) => {
                  const totalAmount = tx.amount + (tx.vatApplicable ? tx.amount * 0.15 : 0);
                  return (
                    <tr key={tx.id} className="border-b border-slate-200 hover:bg-blue-50 transition-colors">
                      <td className="py-3 px-2 text-slate-600 whitespace-nowrap">{tx.date}</td>
                      <td className="py-3 px-2">
                        <p className="font-medium text-slate-800">{tx.description}</p>
                        <p className="text-xs text-slate-400">{tx.counterparty}</p>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          tx.category === 'Beverage' ? 'bg-blue-50 text-blue-600' :
                          tx.category === 'Pastry' ? 'bg-amber-50 text-amber-600' :
                          tx.category === 'Dish' || tx.category === 'Menu' ? 'bg-emerald-50 text-emerald-600' :
                          tx.category === 'Supplier' ? 'bg-red-50 text-red-600' :
                          tx.category === 'Real Estate' ? 'bg-purple-50 text-purple-600' :
                          tx.category === 'Services' ? 'bg-cyan-50 text-cyan-600' :
                          tx.category === 'Logistics' ? 'bg-orange-50 text-orange-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>{tx.category || 'GENERAL'}</span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        {tx.type === 'EXPENSE' && (
                          <div className="flex flex-col items-end">
                            <span className="text-red-600 font-mono font-bold">{formatETB(totalAmount)}</span>
                            {tx.vatApplicable && <span className="text-[10px] text-slate-400 font-mono">HT: {formatETB(tx.amount)}</span>}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {tx.type === 'INCOME' && (
                          <div className="flex flex-col items-end">
                            <span className="text-emerald-600 font-mono font-bold">{formatETB(totalAmount)}</span>
                            {tx.vatApplicable && <span className="text-[10px] text-slate-400 font-mono">HT: {formatETB(tx.amount)}</span>}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {tx.vatApplicable && (
                            <span className="text-[10px] font-bold text-blue-600">{formatETB(tx.amount * 0.15)}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-xs text-slate-400 font-mono">{tx.reference}</td>
                      <td className="py-3 px-2 text-center">
                        <button onClick={() => setTransactionToDelete(tx.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className="bg-slate-50/80 font-semibold text-slate-700">
              <tr className="border-t-2 border-slate-200">
                <td colSpan={3} className="py-4 px-2">TOTALS</td>
                <td className="py-4 px-2 text-right text-red-600">
                  {formatETB(totalExpenses * 100)}
                </td>
                <td className="py-4 px-2 text-right text-emerald-600">
                  {formatETB(totalRevenues * 100)}
                </td>
                <td className="py-4 px-2 text-center text-blue-600 font-bold">
                  {formatETB(totalVat * 100)}
                </td>
                <td colSpan={2}></td>
              </tr>
              {sortedTableTransactions.length > 10 && (
                <tr className="border-t border-slate-200">
                  <td colSpan={8} className="text-center py-2">
                    <button
                      onClick={() => setIsLedgerExpanded(!isLedgerExpanded)}
                      className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all flex items-center gap-2 mx-auto"
                    >
                      {isLedgerExpanded ? 'Show less' : `Show ${sortedTableTransactions.length - 10} more transactions...`}
                      <ChevronDown size={16} className={`transition-transform ${isLedgerExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      </div>

      {/* HISTORY SEARCH BANNER */}
      <div className="max-w-7xl mx-auto mb-8 relative z-10">
        <div className="bg-blue-600 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-blue-500 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-700 rounded-lg"><Search size={24} className="text-white" /></div>
              <div>
                <h3 className="text-xl font-bold text-white">History Search</h3>
                <p className="text-sm text-blue-100">Find past transactions and generate reports</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-blue-100 mb-2 uppercase">Period</label>
              <select 
                value={historyPeriod}
                onChange={(e) => setHistoryPeriod(e.target.value as any)}
                className="w-full bg-blue-700 border border-blue-500 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-white/50 outline-none"
              >
                <option value="day">Specific Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-blue-100 mb-2 uppercase">Date</label>
              <div className="flex gap-2">
                <input 
                  type="date" 
                  value={historyDateRange.start}
                  onChange={(e) => setHistoryDateRange({...historyDateRange, start: e.target.value})}
                  className="w-full bg-blue-700 border border-blue-500 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-white/50 outline-none"
                />
                {historyPeriod === 'custom' && (
                  <input 
                    type="date" 
                    value={historyDateRange.end}
                    onChange={(e) => setHistoryDateRange({...historyDateRange, end: e.target.value})}
                    className="w-full bg-blue-700 border border-blue-500 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-white/50 outline-none"
                  />
                )}
              </div>
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-blue-100 mb-2 uppercase">Keywords</label>
              <input 
                type="text" 
                placeholder="Item, Category, Amount..."
                value={historySearchTerm}
                onChange={(e) => setHistorySearchTerm(e.target.value)}
                className="w-full bg-blue-700 border border-blue-500 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-white/50 outline-none placeholder-blue-300"
              />
            </div>
            
            <div className="md:col-span-1 flex items-end">
              <button 
                onClick={handleHistorySearch}
                className="w-full bg-white text-blue-600 hover:bg-blue-100 font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <Search size={18} /> Search History
              </button>
            </div>
          </div>

          {showHistoryResults && (
            <div className="border-t border-blue-500 bg-blue-800/30 p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-white font-bold flex items-center gap-2">
                  <FileText size={18} className="text-blue-200" />
                  Results Preview ({historyResults.length})
                </h4>
                <div className="flex gap-2">
                  <button onClick={() => window.print()} className="p-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg" title="Print"><Printer size={18} /></button>
                  <button onClick={() => saveToFiles(historyResults, `Report_${new Date().toISOString().split('T')[0]}`)} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 text-sm font-bold">
                    <Folder size={18} /> Save to Files & Projects
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl overflow-hidden border border-blue-500/30 shadow-inner">
                <table className="w-full text-left text-slate-600 text-sm">
                  <thead className="bg-blue-50 text-blue-800 uppercase text-xs font-bold">
                    <tr><th className="p-3">Date</th><th className="p-3">Item</th><th className="p-3">Category</th><th className="p-3 text-right">Amount</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {historyResults.slice(0, 10).map(tx => (
                      <tr key={tx.id} className="hover:bg-blue-50"><td className="p-3">{tx.date}</td><td className="p-3 font-medium">{tx.item}</td><td className="p-3"><span className="px-2 py-0.5 bg-blue-100 rounded text-xs font-bold text-blue-700">{tx.category}</span></td><td className={`p-3 text-right font-mono font-bold ${tx.type === 'EXPENSE' ? 'text-red-600' : 'text-emerald-600'}`}>{formatETB(Math.abs(tx.amount)*100)}</td></tr>
                    ))}
                  </tbody>
                </table>
                {historyResults.length > 10 && <div className="p-2 text-center text-xs text-slate-500 bg-slate-50 border-t border-slate-100">...and {historyResults.length - 10} more rows</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto pb-20 relative z-10">
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
          <h3 className="text-lg font-bold text-slate-700 mb-4 text-center">Expenses by Category</h3>
          <ExpensesPieChart transactions={transactions} />
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
          <h3 className="text-lg font-bold text-slate-700 mb-4 text-center">Revenues by Category</h3>
          <RevenuesPieChart transactions={transactions} />
        </div>
      </div>

      {/* SECURE VAULT */}
      <SecureVault searchTerm={searchTerm} />

    </div>
  );
};

const MoneyFlow: React.FC<MoneyFlowProps> = (props) => (
  <MoneyFlowErrorBoundary>
    <MoneyFlowInner {...props} />
  </MoneyFlowErrorBoundary>
);

export default MoneyFlow;