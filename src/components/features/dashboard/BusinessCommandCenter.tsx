// src/components/features/dashboard/BusinessCommandCenter.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLedger } from '../../../context/LedgerContext';
import {
  BarChart as BarChartIcon, ShieldCheck, Lock, Upload, FileText,
  TrendingUp, Activity, CreditCard, MapPin, X, Edit, Save, Printer,
  Camera, Image as ImageIcon, CheckCircle, Trash2, Download, File as FileIcon,
  Calendar as CalendarIcon, Server, AlertTriangle, Maximize2, TrendingDown
} from 'lucide-react';
import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

import TasksWidget from './TasksWidget';
// --- Interfaces ---

interface CompanyProfile {
  name: string;
  address?: string;
  tin?: string;
  logo?: string;
  fy?: string;
  q?: string;
  env?: string;
}

interface Task {
  id: string;
  day: string;
  name: string;
  mission: string;
  completed: boolean;
}

interface FinancialData {
  name: string;
  income: number;
  expense: number;
  fullDate?: string;
}

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: any;
  item: string;
  category: string;
}

interface Document {
  name: string;
  url: string;
  type: string;
  date: string;
}

// --- Components ---

const GrainyTexture = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.15] pointer-events-none mix-blend-overlay">
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
  </svg>
);

// Effet Shiny Liquid Glass overlay
const LiquidShine = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
    <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-50 rotate-12 transform origin-center" />
    <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent" />
  </div>
);

const ProfileEditModal: React.FC<{ profile: CompanyProfile | null; setProfile: (p: CompanyProfile) => void; onClose: () => void; }> = ({ profile, setProfile, onClose }) => {
  const [formData, setFormData] = useState<CompanyProfile | null>(profile || { name: 'General Table' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: CompanyProfile | null) => prev ? { ...prev, [e.target.name]: e.target.value } : null);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setFormData((prev: CompanyProfile | null) => prev ? { ...prev, logo: url } : null);
    }
  };

  const handleSave = () => {
    if (formData) {
      setProfile(formData);
    }
    onClose();
  };

  if (!formData) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white/80 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] w-full max-w-2xl relative overflow-hidden"
      >
        <LiquidShine />
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Edit Company Profile</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/50 backdrop-blur-sm transition-colors"><X size={24} /></button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-white border border-white/50 shadow-inner flex items-center justify-center overflow-hidden">
                 {formData?.logo ? <img src={formData.logo} className="w-full h-full object-cover" alt="Company Logo" /> : <ImageIcon className="text-slate-300" />}
              </div>
              <label className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-white/60 hover:bg-white/80 rounded-lg text-sm font-bold text-slate-600 cursor-pointer transition-all shadow-sm">
                 Change Logo
                 <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </label>
            </div>
            <input name="name" value={formData.name || 'General Table'} onChange={handleChange} placeholder="Company Name" className="w-full p-3 bg-white/50 backdrop-blur-sm border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50" />
            <input name="address" value={formData.address || ''} onChange={handleChange} placeholder="Address" className="w-full p-3 bg-white/50 backdrop-blur-sm border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50" />
            <input name="tin" value={formData.tin || ''} onChange={handleChange} placeholder="TIN" className="w-full p-3 bg-white/50 backdrop-blur-sm border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50" />
            <div className="grid grid-cols-3 gap-4">
              <input name="fy" value={formData.fy || ''} onChange={handleChange} placeholder="Fiscal Year (e.g., FY 2026)" className="w-full p-3 bg-white/50 backdrop-blur-sm border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50" />
              <input name="q" value={formData.q || ''} onChange={handleChange} placeholder="Quarter (e.g., Q1)" className="w-full p-3 bg-white/50 backdrop-blur-sm border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50" />
              <input name="env" value={formData.env || ''} onChange={handleChange} placeholder="Environment (e.g., Secure)" className="w-full p-3 bg-white/50 backdrop-blur-sm border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50" />
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2 bg-white/60 backdrop-blur-sm border border-white/60 text-slate-700 font-semibold rounded-lg hover:bg-white/80 transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600/90 backdrop-blur-sm text-white font-bold rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"><Save size={16} /> Save Changes</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CameraScanner: React.FC<{ onCapture: (file: File) => void; onClose: () => void; }> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      } catch (err) {
        console.error("Camera access denied:", err);
        alert("Camera access was denied. Please enable it in your browser settings.");
        onClose();
      }
    };
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      canvas.toBlob(blob => {
        if (blob) {
          const fileName = `scan_${new Date().toISOString()}.jpg`;
          const file = new File([blob], fileName, { type: 'image/jpeg' });
          onCapture(file);
        }
      }, 'image/jpeg', 0.95);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[101] flex flex-col items-center justify-center p-4">
      <video ref={videoRef} autoPlay playsInline className="w-full max-w-3xl rounded-2xl mb-4 border border-white/20 shadow-2xl"></video>
      <canvas ref={canvasRef} className="hidden"></canvas>
      <div className="flex gap-4">
        <button onClick={handleCapture} className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-110 transition-transform"><Camera size={32} className="text-slate-800" /></button>
        <button onClick={onClose} className="w-20 h-20 bg-red-500/90 backdrop-blur-sm text-white rounded-full flex items-center justify-center border-4 border-white/30 shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:scale-110 transition-transform"><X size={32} /></button>
      </div>
    </div>
  );
};

interface BusinessCommandCenterProps {
  searchTerm?: string;
}

const ReportModal: React.FC<{ onClose: () => void; transactions: Transaction[] }> = ({ onClose, transactions }) => {
    const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year' | 'range'>('week');
    const [range, setRange] = useState({ start: '', end: '' });

    const filteredData = useMemo(() => {
        const now = new Date();
        let data = transactions;

        switch (period) {
            case 'day':
                const today = now.toISOString().split('T')[0];
                data = transactions.filter(tx => tx.date === today);
                break;
            case 'week':
                const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                data = transactions.filter(tx => new Date(tx.date) >= weekStart);
                break;
            case 'month':
                data = transactions.filter(tx => new Date(tx.date).getMonth() === now.getMonth() && new Date(tx.date).getFullYear() === now.getFullYear());
                break;
            case 'year':
                data = transactions.filter(tx => new Date(tx.date).getFullYear() === now.getFullYear());
                break;
            case 'range':
                if (range.start && range.end) {
                    data = transactions.filter(tx => new Date(tx.date) >= new Date(range.start) && new Date(tx.date) <= new Date(range.end));
                }
                break;
        }

        const totalExpenses = data.filter(tx => tx.type === 'EXPENSE').reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        const totalRevenues = data.filter(tx => tx.type === 'INCOME').reduce((sum, tx) => sum + tx.amount, 0);

        return { transactions: data, totalExpenses, totalRevenues };
    }, [transactions, period, range]);

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/90 backdrop-blur-2xl rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] border border-white/40 w-full max-w-5xl max-h-[90vh] overflow-y-auto relative"
            >
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/40 to-transparent" />
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2"><BarChartIcon className="text-blue-600"/> Master Ledger Report</h2>
                      <button onClick={onClose} className="p-2 rounded-full hover:bg-white/60 backdrop-blur-sm transition-colors"><X size={24} /></button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6 bg-slate-100/50 backdrop-blur-sm p-1 rounded-xl w-fit border border-white/60">
                      {(['day', 'week', 'month', 'year', 'range'] as const).map(p => (
                          <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${period === p ? 'bg-white/80 text-blue-600 shadow-sm backdrop-blur-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'}`}>{p}</button>
                      ))}
                  </div>
                  
                  {period === 'range' && (
                      <div className="flex gap-4 mb-6">
                          <input type="date" value={range.start} onChange={e => setRange(r => ({ ...r, start: e.target.value }))} className="p-3 border border-white/60 rounded-xl bg-white/50 backdrop-blur-sm font-bold text-slate-700" />
                          <input type="date" value={range.end} onChange={e => setRange(r => ({ ...r, end: e.target.value }))} className="p-3 border border-white/60 rounded-xl bg-white/50 backdrop-blur-sm font-bold text-slate-700" />
                      </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="p-6 bg-gradient-to-br from-red-50/80 to-white/40 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg shadow-red-500/10">
                          <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-2">Total Expenses</p>
                          <p className="text-3xl font-black text-red-600">{filteredData.totalExpenses.toLocaleString()} ETB</p>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-blue-50/80 to-white/40 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg shadow-blue-500/10">
                          <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Total Revenue</p>
                          <p className="text-3xl font-black text-blue-600">{filteredData.totalRevenues.toLocaleString()} ETB</p>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-emerald-50/80 to-white/40 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg shadow-emerald-500/10">
                          <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Net Profit</p>
                          <p className="text-3xl font-black text-emerald-600">{(filteredData.totalRevenues - filteredData.totalExpenses).toLocaleString()} ETB</p>
                      </div>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-white/60 bg-white/40 backdrop-blur-sm">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-white/40 text-slate-600 uppercase font-bold text-xs backdrop-blur-sm">
                              <tr>
                                  <th className="p-4">Date</th>
                                  <th className="p-4">Item</th>
                                  <th className="p-4">Category</th>
                                  <th className="p-4 text-right">Amount</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-white/40">
                              {filteredData.transactions.map(tx => (
                                  <tr key={tx.id} className="hover:bg-white/30 transition-colors">
                                      <td className="p-4 font-mono text-slate-500 font-medium">{tx.date}</td>
                                      <td className="p-4 font-bold text-slate-800">{tx.item}</td>
                                      <td className="p-4 text-slate-500"><span className="px-2 py-1 bg-white/60 backdrop-blur-sm rounded-md text-xs font-bold border border-white/40">{tx.category}</span></td>
                                      <td className={`p-4 text-right font-mono font-bold ${tx.amount < 0 ? 'text-red-500' : 'text-blue-600'}`}>
                                          {tx.amount.toLocaleString()} ETB
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>

                  <div className="mt-8 flex justify-end">
                      <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-slate-900/90 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg border border-white/20">
                          <Printer size={18} /> Print Report
                      </button>
                  </div>
                </div>
            </motion.div>
        </div>
    );
};

const BusinessCommandCenter: React.FC<BusinessCommandCenterProps> = ({ searchTerm = '' }) => {
  const { transactions, profile, setProfile, docs, setDocs } = useLedger();
  
  // --- State Management ---
  const [chartTimeRange, setChartTimeRange] = useState<'week' | 'month' | 'year' | 'custom'>('week');
  const [isClient, setIsClient] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [vaultError, setVaultError] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  
  // Hydration Mismatch Prevention
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter transactions based on global search
  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions || [];
    return (transactions || []).filter((t: any) => 
      t.item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.amount?.toString().includes(searchTerm)
    );
  }, [transactions, searchTerm]);

  // --- Financial Logic ---
  const financials = useMemo(() => {
    let income = 0;
    let expense = 0;

    filteredTransactions.forEach((t: any) => {
      const amount = Math.abs(Number(t.amount || 0));
      const vatApplicable = t.vatApplicable !== undefined ? t.vatApplicable : true;
      const amountWithVat = amount + (vatApplicable ? amount * 0.15 : 0);

      if (t.type === 'INCOME') income += amountWithVat;
      else if (t.type === 'EXPENSE') expense += amountWithVat;
    });

    const net = income - expense;
    return { income, expense, net };
  }, [filteredTransactions]);

  // --- Automatic Monthly Comparison Logic ---
  const monthlyComparison = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const calculateRevenue = (txs: any[]) => {
      return txs.reduce((sum: number, t: any) => {
         const amount = Math.abs(Number(t.amount || 0));
         const vatApplicable = t.vatApplicable !== undefined ? t.vatApplicable : true;
         return sum + amount + (vatApplicable ? amount * 0.15 : 0);
      }, 0);
    };

    const currentMonthExpense = calculateRevenue(filteredTransactions.filter((t: any) => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === 'EXPENSE';
    }));
      
    const lastMonthExpense = calculateRevenue(filteredTransactions.filter((t: any) => {
        const d = new Date(t.date);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear && t.type === 'EXPENSE';
    }));
      
    if (lastMonthExpense === 0) return { percent: 0, isPositive: true, current: currentMonthExpense, previous: lastMonthExpense };
    const percent = ((currentMonthExpense - lastMonthExpense) / lastMonthExpense) * 100;
    return { 
      percent: Math.abs(percent).toFixed(1), 
      isPositive: percent <= 0, // Positive if expenses decreased
      current: currentMonthExpense,
      previous: lastMonthExpense
    };
  }, [filteredTransactions]);

  // --- Enhanced Chart Data with Date Formatting ---
  const chartData = useMemo(() => {
    const dataMap = new Map<string, { name: string; income: number; expense: number; date: Date }>();
    const now = new Date();

    filteredTransactions.forEach((tx: any) => {
      const date = new Date(tx.date);
      let key = '';
      let displayName = '';

      if (chartTimeRange === 'week') {
        // Group by day name for current week
        const dayName = date.toLocaleString('en-us', { weekday: 'short' });
        const dayNum = date.getDate();
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        displayName = `${dayName} ${dayNum}`;
        if (!dataMap.has(key)) dataMap.set(key, { name: displayName, income: 0, expense: 0, date });
      } else if (chartTimeRange === 'month') {
        // Group by day of month
        key = `${date.getDate()}`;
        displayName = `${date.getDate()}`;
        if (!dataMap.has(key)) dataMap.set(key, { name: displayName, income: 0, expense: 0, date });
      } else if (chartTimeRange === 'year') {
        // Group by month
        const monthName = date.toLocaleString('en-us', { month: 'short' });
        key = `${date.getMonth()}`;
        displayName = monthName;
        if (!dataMap.has(key)) dataMap.set(key, { name: displayName, income: 0, expense: 0, date });
      }

      if (key && dataMap.has(key)) {
        const entry = dataMap.get(key)!;
        const amount = Math.abs(Number(tx.amount || 0));
        const vatApplicable = tx.vatApplicable !== undefined ? tx.vatApplicable : true;
        const amountWithVat = amount + (vatApplicable ? amount * 0.15 : 0);

        if (tx.type === 'INCOME') {
          entry.income += amountWithVat;
        } else {
          entry.expense += amountWithVat;
        }
      }
    });

    // Sort data based on time range
    let sortedData = Array.from(dataMap.values());
    if (chartTimeRange === 'year') {
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      sortedData = sortedData.sort((a, b) => monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name));
    } else {
      sortedData = sortedData.sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    return sortedData;
  }, [chartTimeRange, filteredTransactions]);

  const handleVaultLogin = () => {
    setIsVaultUnlocked(true);
    setVaultError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: any) => {
        const url = URL.createObjectURL(file);
        const newDoc: Document = {
          name: file.name,
          url: url,
          type: file.type,
          date: new Date().toLocaleDateString()
        };
        setDocs((prev: Document[]) => [...prev, newDoc]);
      });
    }
  };

  const handleDocDelete = (docUrl: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      setDocs((prev: Document[]) => prev.filter(d => d.url !== docUrl));
    }
  };
  
  const handlePrint = () => {
    window.print();
  };

  // --- Calendar Logic ---
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', day: 'Mon', name: 'VAT Filing', mission: 'Submit monthly report', completed: false },
    { id: '2', day: 'Tue', name: 'Payroll', mission: 'Review salaries', completed: true },
    { id: '3', day: 'Wed', name: 'Audit', mission: 'Internal check', completed: false },
    { id: '4', day: 'Thu', name: 'Client Meet', mission: 'Project Alpha', completed: false },
    { id: '5', day: 'Fri', name: 'Backup', mission: 'Server maintenance', completed: false },
    { id: '6', day: 'Sat', name: 'Review', mission: 'Weekly summary', completed: false },
    { id: '7', day: 'Sun', name: 'Off', mission: 'Rest day', completed: true },
  ]);

  const toggleTask = (id: string) => {
    setTasks((prev: Task[]) => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // --- Profile Logic ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setProfile((prev) => prev ? { ...prev, logo: url } : { name: '', address: '', tin: '' });
    }
  };

  // --- Modal States ---
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);

  if (!isClient) return null;

  // Custom Tooltip for Chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 p-4 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
          <p className="font-bold text-slate-800 mb-2">{label}</p>
          <p className="text-blue-600 font-mono text-sm">
            Income: {Number(payload[0].value).toLocaleString()} ETB
          </p>
          <p className="text-red-500 font-mono text-sm">
            Expense: {Number(payload[1].value).toLocaleString()} ETB
          </p>
        </div>
      );
    }
    return null;
  };

  // Get current date information for labels
  const getDateLabel = () => {
    const now = new Date();
    switch (chartTimeRange) {
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${startOfWeek.getDate()} ${startOfWeek.toLocaleString('en-us', { month: 'short' })} - ${endOfWeek.getDate()} ${endOfWeek.toLocaleString('en-us', { month: 'short' })} ${endOfWeek.getFullYear()}`;
      case 'month':
        return now.toLocaleString('en-us', { month: 'long', year: 'numeric' });
      case 'year':
        return now.getFullYear().toString();
      default:
        return now.toLocaleString('en-us', { month: 'long', year: 'numeric' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden relative" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      <GrainyTexture />
      
      <AnimatePresence>
        {isProfileModalOpen && <ProfileEditModal profile={profile} setProfile={(p) => setProfile(p)} onClose={() => setIsProfileModalOpen(false)} />}
        {isCameraScannerOpen && <CameraScanner onClose={() => setIsCameraScannerOpen(false)} onCapture={(file) => {
          handleFileUpload({ target: { files: [file] } } as any);
          setIsCameraScannerOpen(false);
        }} />}
        {showReportModal && <ReportModal onClose={() => setShowReportModal(false)} transactions={filteredTransactions as any[]} />}
      </AnimatePresence>

      {/* --- 1. HEADER --- */}
      <div className="relative h-[180px] w-full overflow-hidden bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-white/10 to-purple-100/20" />
        <LiquidShine />
        <div className="relative z-10 h-full flex justify-between items-center px-10 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-8">
             <div className="relative group">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center overflow-hidden shadow-[0_8px_32px_rgba(37,99,235,0.3)] group-hover:shadow-[0_12px_40px_rgba(37,99,235,0.4)] transition-all duration-300 border border-white/40">
                  {profile && profile.logo ? (
                    <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <ShieldCheck size={40} className="text-white drop-shadow-md" />
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
             </div>
             <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                  {profile?.name || 'ABYSSINIA CYBERSEC PLC'}
                </h2>
                <div className="flex gap-4 mt-2">
                   <div className="flex items-center gap-2 text-slate-500 font-bold text-xs bg-white/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/60">
                      <MapPin size={14}/> {profile?.address || 'Addis Ababa, Bole Sub-city, Woreda 03'}
                   </div>
                   <div className="flex items-center gap-2 text-slate-500 font-bold text-xs bg-white/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/60">
                      <CreditCard size={14}/> {profile?.tin || '0045992188'}
                   </div>
                </div>
             </div>
          </div>
          <div className="flex items-start gap-4">
            <button onClick={() => setIsProfileModalOpen(true)} className="p-2 bg-white/40 backdrop-blur-md border border-white/60 rounded-full hover:bg-white/60 hover:scale-110 transition-all shadow-lg">
              <Edit size={16} className="text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-10 overflow-y-auto relative z-10">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LEFT COLUMN - Stats & Chart */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Net Profit Card */}
              <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                <LiquidShine />
                <div className="relative z-10">
                  <div className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-4">Expenses</div>
                  <div className="text-4xl font-black text-slate-800 tracking-tighter drop-shadow-sm">
                    {new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(Number(financials.expense))}
                  </div>
                  <div className={`mt-4 text-xs font-black flex items-center gap-2 uppercase px-3 py-1.5 rounded-full w-fit backdrop-blur-sm border ${monthlyComparison.isPositive ? 'bg-emerald-100/50 text-emerald-700 border-emerald-300/50' : 'bg-red-100/50 text-red-700 border-red-300/50'}`}>
                    {monthlyComparison.isPositive ? <TrendingUp size={14} className="animate-pulse"/> : <TrendingDown size={14} className="animate-pulse"/>}
                    {monthlyComparison.percent}% vs last month
                    <span className="text-[10px] opacity-60 ml-1">({new Intl.NumberFormat('en-ET', { notation: 'compact', compactDisplay: 'short' }).format(monthlyComparison.previous)} ETB)</span>
                  </div>
                </div>
              </div>

              {/* Revenue Card */}
              <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                <LiquidShine />
                <div className="relative z-10">
                  <div className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-4">Total Revenue</div>
                  <div className="text-4xl font-black text-slate-800 tracking-tighter drop-shadow-sm">
                    {new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(Number(financials.income))}
                  </div>
                  <div className="mt-4 text-blue-600 text-xs font-black flex items-center gap-2 uppercase px-3 py-1.5 rounded-full w-fit bg-blue-100/50 backdrop-blur-sm border border-blue-300/50">
                    <Activity size={14} className="animate-pulse"/> Current Active Flow
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div id="analytics-chart" className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-8 shadow-sm min-h-[500px] flex flex-col print:shadow-none print:border-0 print:bg-white">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/40 to-transparent" />
              </div>
              
              <div className="flex justify-between items-center mb-8 print:hidden relative z-10">
                <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
                  <BarChartIcon size={20} className="text-blue-600"/> Cash Flow Analytics
                </h3>
                <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm p-1 rounded-xl border border-white/60 shadow-sm">
                  {(['week', 'month', 'year'] as const).map(range => (
                    <button 
                      key={range} 
                      onClick={() => setChartTimeRange(range)} 
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${chartTimeRange === range ? 'bg-white/80 text-blue-600 shadow-sm border border-white/80' : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={chartData} barGap={8} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="rgba(148, 163, 184, 0.2)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 11, fontWeight: 700}} 
                      dy={10}
                      interval={0}
                      angle={chartTimeRange === 'month' ? 45 : 0}
                      textAnchor={chartTimeRange === 'month' ? 'start' : 'middle'}
                      height={chartTimeRange === 'month' ? 60 : 30}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 11}} 
                      tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(value)}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(59, 130, 246, 0.05)'}} />
                    
                    {/* Vertical separators for time periods */}
                    {chartData.map((entry, index) => (
                      index < chartData.length - 1 && (
                        <ReferenceLine 
                          key={`sep-${index}`} 
                          x={entry.name} 
                          stroke="rgba(148, 163, 184, 0.15)" 
                          strokeWidth={1}
                          yAxisId={0}
                          xAxisId={0}
                          ifOverflow="visible"
                          segment={[{ y: 0 }, { y: 'dataMax' }]}
                        />
                      )
                    ))}
                    
                    <Bar dataKey="income" fill="url(#incomeGradient)" radius={[8, 8, 0, 0]} barSize={16} />
                    <Bar dataKey="expense" fill="url(#expenseGradient)" radius={[8, 8, 0, 0]} barSize={16} />
                    
                    <defs>
                      <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.6}/>
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#fb7185" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
              
              {/* X-AXIS LABELS DISPLAY */}
              <div className="flex justify-between items-center px-12 mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest print:hidden">
                {chartTimeRange === 'week' && (
                  <>
                    <span className="bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/40">Mon Tue Wed Thu Fri Sat Sun</span>
                    <span className="text-slate-300">|</span>
                    <span className="font-mono text-slate-500 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/40">
                      {getDateLabel()}
                    </span>
                  </>
                )}
                {chartTimeRange === 'month' && (
                  <>
                    <span className="bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/40">1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31</span>
                    <span className="text-slate-300">|</span>
                    <span className="font-mono text-slate-500 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/40">
                      {getDateLabel()}
                    </span>
                  </>
                )}
                {chartTimeRange === 'year' && (
                  <>
                    <span className="bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/40">Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec</span>
                    <span className="text-slate-300">|</span>
                    <span className="font-mono text-slate-500 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/40">
                      {getDateLabel()}
                    </span>
                  </>
                )}
              </div>
              
              <div className="flex justify-end gap-2 mt-6 print:hidden relative z-10">
                <button onClick={handlePrint} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white/60 backdrop-blur-sm border border-white/60 rounded-lg hover:bg-white/80 transition-all flex items-center gap-2 shadow-sm">
                  <Printer size={16} /> Print / Save PDF
                </button>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN (Vault) --- */}
          <div className="h-full">
            <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 p-2 shadow-sm h-full sticky top-10">
              <div className="overflow-hidden rounded-xl h-full flex flex-col p-8 relative">
                <GrainyTexture />
                <div className="relative z-10 flex flex-col h-full">
                  <h3 className="text-slate-700 font-black text-sm tracking-[0.2em] uppercase flex items-center gap-3 mb-8">
                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-400/20">
                      <ShieldCheck size={18} className="text-blue-600"/>
                    </div>
                    SECURE VAULT
                  </h3>

                  <AnimatePresence mode="wait">
                    {!isVaultUnlocked ? (
                      <motion.div key="lock" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-6">
                          <Lock size={32} className="text-slate-400"/>
                        </div>
                        <form onSubmit={handleVaultLogin} className="w-full flex flex-col gap-4 px-4">
                          <p className="text-slate-500 text-sm">Enter PIN to access documents.</p>
                          <input 
                            type="password" maxLength={4} value={pinInput} onChange={(e) => setPinInput(e.target.value)}
                            className={`w-full bg-white border-2 ${vaultError ? 'border-red-400' : 'border-slate-200'} rounded-2xl p-4 text-center text-slate-800 text-3xl font-mono tracking-[0.5em] outline-none focus:border-blue-400`}
                            placeholder="••••"
                          />
                          <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-xs uppercase hover:bg-slate-800 transition-colors">
                            UNLOCK
                          </button>
                        </form>
                      </motion.div>
                    ) : (
                      <motion.div key="content" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="flex-1 flex flex-col min-h-0">
                        <div className="flex items-center gap-2 mb-6">
                          <label className="flex-1 border-2 border-dashed border-slate-300 bg-white rounded-2xl p-4 flex items-center justify-center cursor-pointer group hover:bg-slate-50 hover:border-blue-400 transition-all">
                            <Upload size={20} className="text-blue-600 mr-2 group-hover:scale-110 transition-transform"/>
                            <span className="text-slate-600 font-semibold text-sm">Upload File</span>
                            <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                          </label>
                          <button onClick={() => setIsCameraScannerOpen(true)} className="p-4 border-2 border-dashed border-slate-300 bg-white rounded-2xl flex items-center justify-center cursor-pointer group hover:bg-slate-50 hover:border-blue-400 transition-all">
                            <Camera size={20} className="text-blue-600 group-hover:scale-110 transition-transform"/>
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 -mr-2 pr-2 custom-scrollbar">
                          {docs.length === 0 ? (
                            <div className="text-center text-slate-400 py-10 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                              <FileIcon size={32} className="mx-auto mb-2 opacity-50"/>
                              <p className="text-sm font-semibold">No documents yet.</p>
                              <p className="text-xs opacity-70">Upload Business License, TIN Certificate, etc.</p>
                            </div>
                          ) : docs.map((doc: any, idx: number) => (
                            <motion.div 
                              key={idx} 
                              layout 
                              initial={{opacity:0, y:10}} 
                              animate={{opacity:1, y:0}} 
                              exit={{opacity:0, x:-20}} 
                              className="group bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between hover:shadow-md transition-all"
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                                  <FileText size={18} className="text-blue-600"/>
                                </div>
                                <div className="min-w-0">
                                  <span className="text-slate-800 text-xs font-bold truncate block">{doc.name}</span>
                                  <span className="text-slate-400 text-[10px] font-medium">{doc.date}</span>
                                </div>
                              </div>
                              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                <a href={doc.url} download={doc.name} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                  <Download size={16}/>
                                </a>
                                <button onClick={() => handleDocDelete(doc.url)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                  <Trash2 size={16}/>
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* --- TASKS WIDGET --- */}
          <div className="lg:col-span-3">
            {/* Master Ledger Preview - Last 5 Transactions */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mb-6 overflow-hidden">
              <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <FileText size={18} />
                  Master Ledger - Last 5 Transactions
                </h3>
                <span className="text-slate-400 text-xs">Auto-updates from Money Flow</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Description</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-center">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 5).map((tx: any, index: number) => {
                      const amount = Math.abs(Number(tx.amount || 0));
                      const isIncome = tx.type === 'INCOME';
                      const dateStr = typeof tx.date === 'string' ? tx.date : new Date(tx.date).toISOString().split('T')[0];
                      return (
                        <tr key={tx.id || index} className={`border-t border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                          <td className="px-4 py-3 font-mono text-slate-600">{dateStr}</td>
                          <td className="px-4 py-3 font-medium text-slate-800">{tx.item || tx.motif || 'Transaction'}</td>
                          <td className="px-4 py-3 text-slate-500">{tx.category || 'General'}</td>
                          <td className={`px-4 py-3 text-right font-mono font-bold ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>
                            {isIncome ? '+' : '-'}{amount.toLocaleString()} ETB
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {tx.type}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                          No transactions yet. Add transactions in Money Flow.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <TasksWidget />
          </div>

        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
      `}</style>
    </div>
  );
};

export default BusinessCommandCenter;