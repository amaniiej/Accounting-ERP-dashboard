import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FolderPlus, Upload, File, FileText, Image, Trash2, Download, Printer, 
  Folder, X, Check, ChevronDown, ChevronRight, Save, Bold, Italic,
  AlignLeft, AlignCenter, AlignRight, Plus, Grid, ArrowLeft, Presentation,
  FileSpreadsheet, FilePlus, FolderOpen, Table as TableIcon, List, Type, Highlighter,
  Undo, Redo, Underline, Strikethrough, ListOrdered, Indent, Outdent,
  Palette, BarChart, Calculator, Eye, Share2, Maximize2, Minimize2,
  ArrowRight, Layout, Scissors, Clipboard, ZoomIn, ZoomOut, Calendar,
  Clock, Hash, MonitorPlay, Edit3, Copy, Search, DownloadCloud,
  FileSignature, Columns, Rows, Sigma, FunctionSquare, TrendingUp, TrendingDown,
  SortAsc, SortDesc, Filter, RefreshCw, Settings, Move, GripVertical,
  Link as LinkIcon, AlignJustify
} from 'lucide-react';

// ============================================================================
// TYPES & CONFIGURATION
// ============================================================================

interface SavedFile {
  id: string;
  name: string;
  type: 'document' | 'spreadsheet' | 'presentation';
  content: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SavedFolder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

const STORAGE_KEY_FILES = 'project_creativity_files';
const STORAGE_KEY_FOLDERS = 'project_creativity_folders';

const generateId = () => Math.random().toString(36).substring(2, 15);

const getFileIcon = (type: string) => {
  switch (type) {
    case 'document': return FileText;
    case 'spreadsheet': return FileSpreadsheet;
    case 'presentation': return Presentation;
    default: return FileText;
  }
};

// ============================================================================
// FORMULA ENGINE FOR SPREADSHEET (EXCEL-LIKE)
// ============================================================================

const FORMULA_FUNCTIONS: Record<string, (...args: any[]) => any> = {
  // Math functions
  SUM: (...args: number[]) => args.flat().reduce((a, b) => a + (Number(b) || 0), 0),
  AVERAGE: (...args: number[]) => { const flat = args.flat().filter(v => typeof v === 'number' || (!isNaN(Number(v)) && v !== '')); return flat.length ? flat.reduce((a, b) => a + Number(b), 0) / flat.length : 0; },
  MAX: (...args: number[]) => Math.max(...args.flat().map(v => Number(v) || -Infinity)),
  MIN: (...args: number[]) => Math.min(...args.flat().map(v => Number(v) || Infinity)),
  COUNT: (...args: any[]) => args.flat().filter(v => v !== '' && v !== null && v !== undefined).length,
  COUNTA: (...args: any[]) => args.flat().filter(v => v !== '' && v !== null && v !== undefined).length,
  ROUND: (num: number, decimals: number = 0) => Number(Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals),
  ROUNDUP: (num: number, decimals: number = 0) => Math.ceil(Number(num) * Math.pow(10, decimals)) / Math.pow(10, decimals),
  ROUNDDOWN: (num: number, decimals: number = 0) => Math.floor(Number(num) * Math.pow(10, decimals)) / Math.pow(10, decimals),
  ABS: (num: number) => Math.abs(num),
  FLOOR: (num: number) => Math.floor(num),
  CEILING: (num: number) => Math.ceil(num),
  SQRT: (num: number) => Math.sqrt(num),
  POWER: (base: number, exp: number) => Math.pow(base, exp),
  MOD: (num: number, divisor: number) => num % divisor,
  PI: () => Math.PI,
  RAND: () => Math.random(),
  RANDBETWEEN: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
  
  // Logical functions
  IF: (condition: boolean, trueVal: any, falseVal: any) => condition ? trueVal : falseVal,
  AND: (...args: boolean[]) => args.flat().every(v => Boolean(v)),
  OR: (...args: boolean[]) => args.flat().some(v => Boolean(v)),
  NOT: (arg: any) => !Boolean(arg),
  IFS: (...args: any[]) => { for (let i = 0; i < args.length; i += 2) { if (args[i]) return args[i + 1]; } return args[args.length - 1]; },
  SWITCH: (expr: any, ...args: any[]) => { for (let i = 0; i < args.length; i += 2) { if (args[i] === expr) return args[i + 1]; } return args[args.length - 1]; },
  
  // Text functions
  CONCATENATE: (...args: string[]) => args.flat().join(''),
  CONCAT: (...args: string[]) => args.flat().join(''),
  TEXT: (value: any, format: string) => String(value),
  LEFT: (text: string, num: number) => String(text).substring(0, num),
  RIGHT: (text: string, num: number) => String(text).slice(-num),
  MID: (text: string, start: number, num: number) => String(text).substr(start - 1, num),
  LEN: (text: string) => String(text).length,
  LOWER: (text: string) => String(text).toLowerCase(),
  UPPER: (text: string) => String(text).toUpperCase(),
  PROPER: (text: string) => String(text).replace(/\b\w/g, c => c.toUpperCase()),
  TRIM: (text: string) => String(text).trim(),
  REPLACE: (text: string, start: number, num: number, replacement: string) => String(text).substring(0, start - 1) + replacement + String(text).substring(start - 1 + num),
  SUBSTITUTE: (text: string, old: string, replacement: string, instance?: number) => { if (instance) { let count = 0; return String(text).replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), (match) => { count++; return count === instance ? replacement : match; }); } return String(text).replace(old, replacement); },
  FIND: (find: string, text: string) => String(text).indexOf(find) + 1,
  SEARCH: (find: string, text: string) => String(text).toLowerCase().indexOf(find.toLowerCase()) + 1,
  
  // Date functions
  TODAY: () => new Date().toLocaleDateString(),
  NOW: () => new Date().toLocaleString(),
  DATE: (year: number, month: number, day: number) => new Date(year, month - 1, day).toLocaleDateString(),
  YEAR: (date: string) => new Date(date).getFullYear(),
  MONTH: (date: string) => new Date(date).getMonth() + 1,
  DAY: (date: string) => new Date(date).getDate(),
  WEEKDAY: (date: string) => new Date(date).getDay() + 1,
  HOUR: (date: string) => new Date(date).getHours(),
  MINUTE: (date: string) => new Date(date).getMinutes(),
  SECOND: (date: string) => new Date(date).getSeconds(),
  
  // Lookup functions
  VLOOKUP: (lookupValue: any, array: any[][], colIndex: number, exact: boolean = true) => {
    const row = array.find(row => row[0] === lookupValue);
    if (row) return row[colIndex - 1];
    return exact ? '#N/A' : '';
  },
  HLOOKUP: (lookupValue: any, array: any[][], rowIndex: number, exact: boolean = true) => {
    const col = array[0]?.findIndex((val: any) => val === lookupValue);
    if (col !== undefined && col >= 0 && array[rowIndex - 1]) return array[rowIndex - 1][col];
    return exact ? '#N/A' : '';
  },
  INDEX: (array: any[][], row: number, col: number) => array[row - 1]?.[col - 1] || '',
  MATCH: (lookupValue: any, array: any[], exact: boolean = true) => {
    const index = array.findIndex((val, idx) => { if (exact) return val === lookupValue; return String(val) === String(lookupValue); });
    return index >= 0 ? index + 1 : '#N/A';
  },
  
  // Financial functions
  PMT: (rate: number, nper: number, pv: number, fv?: number, type?: number) => {
    const fvVal = fv || 0;
    const typeVal = type || 0;
    if (rate === 0) return -(pv + fvVal) / nper;
    const pvif = Math.pow(1 + rate, nper);
    let pmt = rate / (pvif - 1) * -(pv * pvif + fvVal);
    if (typeVal === 1) pmt /= 1 + rate;
    return pmt;
  },
  FV: (rate: number, nper: number, pmt: number, pv?: number, type?: number) => {
    const pvVal = pv || 0;
    const typeVal = type || 0;
    if (rate === 0) return -(pvVal + pmt * nper);
    const cvif = Math.pow(1 + rate, nper);
    let fv = -pvVal * cvif - pmt * (cvif - 1) / rate;
    if (typeVal === 1) fv = -pvVal * cvif - pmt * ((cvif - 1) / rate + 1);
    return fv;
  },
  PV: (rate: number, nper: number, pmt: number, fv?: number, type?: number) => {
    const fvVal = fv || 0;
    const typeVal = type || 0;
    if (rate === 0) return -(fvVal + pmt * nper);
    const cvif = Math.pow(1 + rate, nper);
    let pv = -fvVal / cvif - pmt * (cvif - 1) / (rate * cvif);
    if (typeVal === 1) pv = -fvVal / cvif - pmt * ((cvif - 1) / (rate * cvif) + 1);
    return pv;
  },
};

const ROW_BLOCK_SIZE = 50;
const COL_BLOCK_SIZE = 10;
const TOTAL_ROWS = 1000;
const TOTAL_COLS = 26;

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const getColLabel = (index: number) => {
  let label = "";
  let i = index;
  while (i >= 0) {
    label = ALPHABET[i % 26] + label;
    i = Math.floor(i / 26) - 1;
  }
  return label;
};

const getCellCoords = (label: string) => {
  const match = label.match(/^([A-Z]+)([0-9]+)$/);
  if (!match) return null;
  const colStr = match[1];
  const rowStr = match[2];
  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 64);
  }
  return { row: parseInt(rowStr) - 1, col: col - 1 };
};

const getCellName = (row: number, col: number) => `${getColLabel(col)}${row + 1}`;

// ============================================================================
// TOOL CARDS COMPONENT
// ============================================================================

interface ToolCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ icon: Icon, title, description, color, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 group"
  >
    <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
      <Icon className="w-8 h-8 text-white" />
    </div>
    <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 text-center">{description}</p>
  </button>
);

// ============================================================================
// FILE MANAGER COMPONENT
// ============================================================================

interface FileManagerProps {
  onBack: () => void;
  files: SavedFile[];
  setFiles: React.Dispatch<React.SetStateAction<SavedFile[]>>;
  folders: SavedFolder[];
  setFolders: React.Dispatch<React.SetStateAction<SavedFolder[]>>;
}

const FileManager: React.FC<FileManagerProps> = ({ onBack, files, setFiles, folders, setFolders }) => {
  const [selectedFile, setSelectedFile] = useState<SavedFile | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<SavedFolder | null>(null);
  const [fileName, setFileName] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;
    
    Array.from(uploadedFiles).forEach(file => {
      const newFile: SavedFile = {
        id: generateId(),
        name: file.name,
        type: file.type.includes('spreadsheet') ? 'spreadsheet' : file.type.includes('document') || file.name.endsWith('.pdf') ? 'document' : 'document',
        content: '',
        folderId: selectedFolder?.id || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setFiles(prev => [...prev, newFile]);
    });
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const createFolder = () => {
    const folderName = prompt('Folder name:');
    if (!folderName) return;
    
    const newFolder: SavedFolder = {
      id: generateId(),
      name: folderName,
      parentId: null,
      createdAt: new Date().toISOString(),
    };
    setFolders(prev => [...prev, newFolder]);
  };

  const validateFileName = () => {
    if (!fileName.trim()) { alert('Please enter a file name'); return; }
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      setValidationSuccess(true);
      if (selectedFile) {
        setFiles(prev => prev.map(f => f.id === selectedFile.id ? { ...f, name: fileName, updatedAt: new Date().toISOString() } : f));
        setSelectedFile(prev => prev ? { ...prev, name: fileName } : null);
      }
      setTimeout(() => setValidationSuccess(false), 2000);
    }, 500);
  };

  const deleteItem = (id: string, type: 'file' | 'folder') => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    if (type === 'file') {
      setFiles(prev => prev.filter(f => f.id !== id));
      if (selectedFile?.id === id) { setSelectedFile(null); setFileName(''); }
    } else {
      setFolders(prev => prev.filter(f => f.id !== id));
      if (selectedFolder?.id === id) setSelectedFolder(null);
    }
  };

  const printToPDF = () => window.print();

  const downloadFile = (file: SavedFile) => {
    const blob = new Blob([`File: ${file.name}\nCreated: ${file.createdAt}\nType: ${file.type}\n\nContent:\n${file.content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const saveToFile = () => {
    const data = { files, folders, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'project_creativity_backup.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const loadFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.files) setFiles(data.files);
        if (data.folders) setFolders(data.folders);
        alert('Data loaded successfully!');
      } catch (err) { alert('Error loading file'); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="file-manager h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="flex items-center gap-3">
          <Folder className="size-8" />
          <h1 className="text-2xl font-bold">File Manager</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={saveToFile} className="flex items-center gap-2 px-3 py-2 bg-purple-700 hover:bg-purple-900 rounded-lg transition-colors">
            <DownloadCloud size={18} /> Backup
          </button>
          <label className="flex items-center gap-2 px-3 py-2 bg-purple-700 hover:bg-purple-900 rounded-lg transition-colors cursor-pointer">
            <Upload size={18} /> Restore
            <input type="file" accept=".json" onChange={loadFromFile} className="hidden" />
          </label>
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
            <ArrowLeft size={18} /> Back
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 p-4 bg-slate-100 border-b border-slate-200">
        <input 
          type="text" 
          placeholder="Search files..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500"
        />
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-white border border-slate-300'}`}>
            <Grid size={18} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-white border border-slate-300'}`}>
            <List size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Upload Area */}
          <div 
            className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer bg-slate-50 mb-6"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-12 mx-auto mb-4 text-slate-400" />
            <p className="text-lg font-medium mb-2 text-slate-700">Drag and drop files here</p>
            <p className="text-sm text-slate-500 mb-4">or click to browse files</p>
            <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">Browse Files</button>
          </div>

          {/* Create Folder Button */}
          <button onClick={createFolder} className="flex items-center gap-2 px-4 py-3 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-colors mb-4">
            <FolderPlus size={20} /> Create New Folder
          </button>

          {/* Items */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredFolders.map(folder => {
                const Icon = Folder;
                return (
                  <div key={folder.id} onClick={() => setSelectedFolder(folder)} className={`flex flex-col items-center p-4 bg-amber-50 hover:bg-amber-100 rounded-xl border cursor-pointer transition-all ${selectedFolder?.id === folder.id ? 'border-amber-500 ring-2 ring-amber-200' : 'border-amber-200'}`}>
                    <Icon className="size-12 text-amber-500 mb-2" />
                    <span className="text-sm text-slate-700 font-medium text-center">{folder.name}</span>
                    <span className="text-xs text-slate-400 mt-1">{new Date(folder.createdAt).toLocaleDateString()}</span>
                  </div>
                );
              })}
              {filteredFiles.map(file => {
                const Icon = getFileIcon(file.type);
                return (
                  <div key={file.id} onClick={() => { setSelectedFile(file); setFileName(file.name); setSelectedFolder(null); }} className={`flex flex-col items-center p-4 bg-white hover:bg-slate-50 rounded-xl border cursor-pointer transition-all ${selectedFile?.id === file.id ? 'border-purple-500 ring-2 ring-purple-200' : 'border-slate-200'}`}>
                    <Icon className="size-12 text-blue-500 mb-2" />
                    <span className="text-sm text-slate-700 font-medium text-center truncate w-full">{file.name}</span>
                    <span className="text-xs text-slate-400 mt-1">{new Date(file.updatedAt).toLocaleDateString()}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <table className="w-full bg-white rounded-lg border border-slate-200">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="p-3 text-left text-sm font-semibold text-slate-600">Name</th>
                  <th className="p-3 text-left text-sm font-semibold text-slate-600">Type</th>
                  <th className="p-3 text-left text-sm font-semibold text-slate-600">Modified</th>
                  <th className="p-3 text-left text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFolders.map(folder => (
                  <tr key={folder.id} onClick={() => setSelectedFolder(folder)} className={`border-b border-slate-100 cursor-pointer ${selectedFolder?.id === folder.id ? 'bg-amber-50' : 'hover:bg-slate-50'}`}>
                    <td className="p-3 flex items-center gap-2"><Folder className="text-amber-500" size={18} />{folder.name}</td>
                    <td className="p-3 text-slate-500">Folder</td>
                    <td className="p-3 text-slate-500">{new Date(folder.createdAt).toLocaleDateString()}</td>
                    <td className="p-3"><button onClick={(e) => { e.stopPropagation(); deleteItem(folder.id, 'folder'); }} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
                {filteredFiles.map(file => {
                  const Icon = getFileIcon(file.type);
                  return (
                    <tr key={file.id} onClick={() => { setSelectedFile(file); setFileName(file.name); setSelectedFolder(null); }} className={`border-b border-slate-100 cursor-pointer ${selectedFile?.id === file.id ? 'bg-purple-50' : 'hover:bg-slate-50'}`}>
                      <td className="p-3 flex items-center gap-2"><Icon className="text-blue-500" size={18} />{file.name}</td>
                      <td className="p-3 text-slate-500 capitalize">{file.type}</td>
                      <td className="p-3 text-slate-500">{new Date(file.updatedAt).toLocaleDateString()}</td>
                      <td className="p-3 flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); downloadFile(file); }} className="text-blue-500 hover:text-blue-700"><Download size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); printToPDF(); }} className="text-green-500 hover:text-green-700"><Printer size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); deleteItem(file.id, 'file'); }} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Details Panel */}
        <div className="w-80 bg-slate-50 border-l border-slate-200 p-4 overflow-auto">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
            <FileText size={20} /> Details
          </h2>

          {(selectedFile || selectedFolder) ? (
            <div className="space-y-4">
              {/* Preview */}
              <div className="flex justify-center py-4 bg-white rounded-lg border border-slate-200">
                {selectedFile ? (() => { const Icon = getFileIcon(selectedFile.type); return <Icon className="size-16 text-blue-500" />; })() : <Folder className="size-16 text-amber-500" />}
              </div>

              {/* File Name */}
              <div>
                <label className="block text-xs text-slate-500 mb-1 uppercase font-semibold">Name</label>
                <div className="flex gap-2">
                  <input type="text" value={fileName || selectedFile?.name || selectedFolder?.name || ''} onChange={(e) => setFileName(e.target.value)} className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="File name" />
                  <button onClick={validateFileName} disabled={isValidating} className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1 text-sm ${validationSuccess ? 'bg-green-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>
                    {isValidating ? <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : validationSuccess ? <Check size={16} /> : 'Save'}
                  </button>
                </div>
              </div>

              {/* File Info */}
              <div className="bg-white rounded-lg p-3 space-y-2 border border-slate-200">
                <div className="flex justify-between"><span className="text-xs text-slate-500 uppercase">Type</span><span className="text-sm text-slate-800">{selectedFile?.type || 'Folder'}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-500 uppercase">Created</span><span className="text-sm text-slate-800">{new Date(selectedFile?.createdAt || selectedFolder?.createdAt || '').toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-500 uppercase">Modified</span><span className="text-sm text-slate-800">{selectedFile ? new Date(selectedFile.updatedAt).toLocaleDateString() : '-'}</span></div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => selectedFile && downloadFile(selectedFile)} className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"><Download size={16} /> Download</button>
                <button onClick={printToPDF} className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"><Printer size={16} /> Print PDF</button>
              </div>

              {/* Delete */}
              <button onClick={() => selectedFile ? deleteItem(selectedFile.id, 'file') : selectedFolder && deleteItem(selectedFolder.id, 'folder')} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"><Trash2 size={16} /> Delete</button>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <File className="size-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Select a file or folder to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SPREADSHEET EDITOR COMPONENT (EXCEL-LIKE)
// ============================================================================

const SpreadsheetEditor: React.FC<{ onBack: () => void; files: SavedFile[]; setFiles: React.Dispatch<React.SetStateAction<SavedFile[]>> }> = ({ onBack, files, setFiles }) => {
  const [sheetData, setSheetData] = useState<Record<string, string>>({});
  const [cellStyles, setCellStyles] = useState<Record<string, CellStyle>>({});
  const [selectedCell, setSelectedCell] = useState<{r: number, c: number} | null>(null);
  const [formulaBarValue, setFormulaBarValue] = useState("");
  const [selectedRange, setSelectedRange] = useState<{start: {r: number, c: number}, end: {r: number, c: number}} | null>(null);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(12);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [zoom, setZoom] = useState(100);

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [fileName, setFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [folders, setFolders] = useState<SavedFolder[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY_FOLDERS) || '[]'); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders)); }, [folders]);

  const handleSave = () => setShowSaveDialog(true);
  const confirmSave = () => {
    const name = fileName.trim() || 'Untitled Spreadsheet';
    const newFile: SavedFile = { id: generateId(), name, type: 'spreadsheet', content: JSON.stringify({ sheetData, cellStyles }), folderId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setFiles(prev => [...prev, newFile]);
    setShowSaveDialog(false);
    setFileName('');
    alert('File saved successfully!');
  };

  const handleNewFolder = () => { if (newFolderName.trim()) { setFolders(prev => [...prev, { id: generateId(), name: newFolderName.trim(), parentId: null, createdAt: new Date().toISOString() }]); setShowNewFolderDialog(false); setNewFolderName(''); } };
  const handleNew = () => { if (confirm('Create new spreadsheet? Unsaved changes will be lost.')) { setSheetData({}); setCellStyles({}); setSelectedCell(null); setFormulaBarValue(''); }};
  const handlePrint = () => window.print();

  const getSelectedKey = () => selectedCell ? `${selectedCell.r}-${selectedCell.c}` : null;

  const handleCellChange = (row: number, col: number, value: string) => {
    setSheetData(prev => ({ ...prev, [`${row}-${col}`]: value }));
  };

  const updateStyle = (style: Partial<CellStyle>) => {
    const key = getSelectedKey();
    if (!key) return;
    setCellStyles(prev => ({ ...prev, [key]: { ...prev[key], ...style } }));
  };

  const handleCopy = () => {
    const key = getSelectedKey();
    if (key) navigator.clipboard.writeText(sheetData[key] || '');
  };

  const handleCut = () => {
    handleCopy();
    const key = getSelectedKey();
    if (key) { handleCellChange(selectedCell!.r, selectedCell!.c, ''); setCellStyles(prev => { const n = {...prev}; delete n[key]; return n; }); }
  };

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    if (selectedCell && text) {
      const lines = text.split('\n');
      lines.forEach((line, i) => {
        const cells = line.split('\t');
        cells.forEach((cell, j) => {
          handleCellChange(selectedCell.r + i, selectedCell.c + j, cell);
        });
      });
    }
  };

  const handleAutoSum = () => {
    if (!selectedCell) return;
    const { r, c } = selectedCell;
    let startR = r - 1;
    while (startR >= 0 && sheetData[`${startR}-${c}`] && !isNaN(Number(sheetData[`${startR}-${c}`]))) { startR--; }
    startR++;
    if (startR < r) {
      const formula = `=SUM(${getColLabel(c)}${startR + 1}:${getColLabel(c)}${r + 1})`;
      handleCellChange(r, c, formula);
      setFormulaBarValue(formula);
    }
  };

  const handleSort = () => {
    if (!selectedCell) return;
    const col = selectedCell.c;
    const rowsWithData = [];
    for (let r = 0; r < TOTAL_ROWS; r++) {
      let hasData = false;
      const rowData: any = {};
      for (let c = 0; c < TOTAL_COLS; c++) {
        const key = `${r}-${c}`;
        if (sheetData[key]) { hasData = true; rowData[c] = { val: sheetData[key], style: cellStyles[key] }; }
      }
      if (hasData) rowsWithData.push({ r, data: rowData });
    }
    rowsWithData.sort((a, b) => {
      const valA = a.data[col]?.val || '';
      const valB = b.data[col]?.val || '';
      const numA = parseFloat(valA);
      const numB = parseFloat(valB);
      return !isNaN(numA) && !isNaN(numB) ? numA - numB : valA.localeCompare(valB);
    });
    const nextSheetData = { ...sheetData };
    const nextStyles = { ...cellStyles };
    const indices = rowsWithData.map(x => x.r);
    rowsWithData.forEach((item, i) => {
      const targetR = indices[i];
      for (let c = 0; c < TOTAL_COLS; c++) {
        delete nextSheetData[`${targetR}-${c}`];
        delete nextStyles[`${targetR}-${c}`];
      }
      Object.keys(item.data).forEach(c => {
        nextSheetData[`${targetR}-${c}`] = item.data[c].val;
        if (item.data[c].style) nextStyles[`${targetR}-${c}`] = item.data[c].style;
      });
    });
    setSheetData(nextSheetData);
    setCellStyles(nextStyles);
  };

  const evaluateFormula = useCallback((expression: string, visitedCells: Set<string> = new Set()): string | number => {
    if (!expression?.startsWith('=')) return isNaN(Number(expression)) ? expression : Number(expression);
    if (visitedCells.size > 50) return "#CYCLE";
    try {
      const formula = expression.substring(1).toUpperCase();
      const parsedWithRanges = formula.replace(/([A-Z]+[0-9]+):([A-Z]+[0-9]+)/g, (_, start, end) => {
        const startCoords = getCellCoords(start);
        const endCoords = getCellCoords(end);
        if (!startCoords || !endCoords) return "[]";
        const values = [];
        for (let r = Math.min(startCoords.row, endCoords.row); r <= Math.max(startCoords.row, endCoords.row); r++) {
          for (let c = Math.min(startCoords.col, endCoords.col); c <= Math.max(startCoords.col, endCoords.col); c++) {
            const cellKey = `${r}-${c}`;
            if (visitedCells.has(cellKey)) { values.push(0); continue; }
            const cellVal = sheetData[cellKey] || "";
            const evaluated = evaluateFormula(cellVal.startsWith('=') ? cellVal : `=${cellVal}`, new Set([...visitedCells, cellKey]));
            values.push(evaluated);
          }
        }
        return `[${values.map(v => typeof v === 'string' ? `"${v}"` : v).join(',')}]`;
      });
      const parsed = parsedWithRanges.replace(/[A-Z]+[0-9]+/g, (ref) => {
        const coords = getCellCoords(ref);
        if (!coords) return "0";
        const cellKey = `${coords.row}-${coords.col}`;
        if (visitedCells.has(cellKey)) return "0";
        const cellVal = sheetData[cellKey] || "";
        const evaluated = evaluateFormula(cellVal.startsWith('=') ? cellVal : `=${cellVal}`, new Set([...visitedCells, cellKey]));
        return typeof evaluated === 'string' ? `"${evaluated}"` : String(evaluated);
      });
      const funcNames = Object.keys(FORMULA_FUNCTIONS);
      const funcValues = Object.values(FORMULA_FUNCTIONS);
      const result = new Function(...funcNames, `return ${parsed}`)(...funcValues);
      return result;
    } catch { return "#ERROR"; }
  }, [sheetData]);

  const handleFormulaBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormulaBarValue(val);
    if (selectedCell) handleCellChange(selectedCell.r, selectedCell.c, val);
  };

  useEffect(() => {
    if (selectedCell) {
      const key = `${selectedCell.r}-${selectedCell.c}`;
      const val = sheetData[key];
      if (val?.startsWith('=')) {
        const result = evaluateFormula(val);
        setFormulaBarValue(`${val} = ${result}`);
      } else {
        setFormulaBarValue(val || "");
      }
    } else {
      setFormulaBarValue("");
    }
  }, [selectedCell, sheetData, evaluateFormula]);

  const rowBlocks = Array.from({ length: Math.ceil(TOTAL_ROWS / ROW_BLOCK_SIZE) }, (_, i) => i);
  const [openRowBlocks, setOpenRowBlocks] = useState<Set<number>>(new Set([0]));
  const [openColBlocks, setOpenColBlocks] = useState<Set<number>>(new Set([0]));

  const fonts = ['Arial', 'Arial Black', 'Calibri', 'Comic Sans MS', 'Courier New', 'Georgia', 'Impact', 'Lucida Console', 'Microsoft YaHei', 'Monaco', 'Segoe UI', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'];
  const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 48, 72];
  const colors = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#000080', '#808080', '#C0C0C0'];
  const bgColors = ['#FFFFFF', '#FFCDD2', '#C8E6C9', '#BBDEFB', '#FFF9C4', '#F3E5F5', '#B3E5FC', '#FFE0B2', '#D7CCC8', '#E1BEE7', '#B2DFDB', '#BCD5EC', '#F5F5F5', '#EEEEEE'];

  return (
    <div className="spreadsheet-editor h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="bg-emerald-700 text-white">
        {/* Top Row */}
        <div className="flex items-center gap-1 p-2 border-b border-emerald-600">
          <button onClick={onBack} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 rounded transition-colors text-sm"><ArrowLeft size={16} /> Back</button>
          <span className="font-bold text-lg px-3 border-l border-emerald-600">Spreadsheet</span>
          <div className="flex-1" />
          <button onClick={handleNew} className="p-2 hover:bg-emerald-800 rounded transition-colors" title="New"><FilePlus size={18} /></button>
          <button onClick={handleSave} className="p-2 hover:bg-emerald-800 rounded transition-colors" title="Save"><Save size={18} /></button>
          <button onClick={handlePrint} className="p-2 hover:bg-emerald-800 rounded transition-colors" title="Print"><Printer size={18} /></button>
        </div>
        {/* Format Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-emerald-600 flex-wrap">
          {/* Font */}
          <select value={fontFamily} onChange={(e) => { setFontFamily(e.target.value); updateStyle({ fontFamily: e.target.value }); }} className="bg-emerald-800 border border-emerald-600 rounded px-2 py-1 text-sm focus:outline-none">
            {fonts.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select value={fontSize} onChange={(e) => { setFontSize(Number(e.target.value)); updateStyle({ fontSize: Number(e.target.value) }); }} className="bg-emerald-800 border border-emerald-600 rounded px-2 py-1 text-sm w-16 focus:outline-none">
            {fontSizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="w-px h-6 bg-emerald-600 mx-2" />
          {/* Text Format */}
          <button onClick={() => updateStyle({ bold: !cellStyles[getSelectedKey() || '']?.bold })} className={`p-1.5 hover:bg-emerald-800 rounded transition-colors ${cellStyles[getSelectedKey() || '']?.bold ? 'bg-emerald-900' : ''}`} title="Bold"><Bold size={16} /></button>
          <button onClick={() => updateStyle({ italic: !cellStyles[getSelectedKey() || '']?.italic })} className={`p-1.5 hover:bg-emerald-800 rounded transition-colors ${cellStyles[getSelectedKey() || '']?.italic ? 'bg-emerald-900' : ''}`} title="Italic"><Italic size={16} /></button>
          <button onClick={() => updateStyle({ underline: !cellStyles[getSelectedKey() || '']?.underline })} className={`p-1.5 hover:bg-emerald-800 rounded transition-colors ${cellStyles[getSelectedKey() || '']?.underline ? 'bg-emerald-900' : ''}`} title="Underline"><Underline size={16} /></button>
          <button onClick={() => updateStyle({ strikethrough: !cellStyles[getSelectedKey() || '']?.strikethrough })} className={`p-1.5 hover:bg-emerald-800 rounded transition-colors ${cellStyles[getSelectedKey() || '']?.strikethrough ? 'bg-emerald-900' : ''}`} title="Strikethrough"><Strikethrough size={16} /></button>
          <div className="w-px h-6 bg-emerald-600 mx-2" />
          {/* Align */}
          <button onClick={() => updateStyle({ textAlign: 'left' })} className="p-1.5 hover:bg-emerald-800 rounded transition-colors" title="Align Left"><AlignLeft size={16} /></button>
          <button onClick={() => updateStyle({ textAlign: 'center' })} className="p-1.5 hover:bg-emerald-800 rounded transition-colors" title="Align Center"><AlignCenter size={16} /></button>
          <button onClick={() => updateStyle({ textAlign: 'right' })} className="p-1.5 hover:bg-emerald-800 rounded transition-colors" title="Align Right"><AlignRight size={16} /></button>
          <div className="w-px h-6 bg-emerald-600 mx-2" />
          {/* Colors */}
          <div className="relative">
            <button onClick={() => setShowColorPicker(!showColorPicker)} className="p-1.5 hover:bg-emerald-800 rounded transition-colors flex items-center gap-1" title="Text Color">
              <Type size={16} />
              <div className="w-4 h-4 border border-white rounded" style={{ backgroundColor: cellStyles[getSelectedKey() || '']?.color || '#000000' }} />
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg p-2 shadow-lg grid grid-cols-5 gap-1 z-50">
                {colors.map(c => <button key={c} onClick={() => { updateStyle({ color: c }); setShowColorPicker(false); }} className="w-6 h-6 rounded border border-slate-300" style={{ backgroundColor: c }} />)}
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => setShowBgColorPicker(!showBgColorPicker)} className="p-1.5 hover:bg-emerald-800 rounded transition-colors flex items-center gap-1" title="Fill Color">
              <Highlighter size={16} />
              <div className="w-4 h-4 border border-slate-300 rounded" style={{ backgroundColor: cellStyles[getSelectedKey() || '']?.backgroundColor || '#FFFFFF' }} />
            </button>
            {showBgColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg p-2 shadow-lg grid grid-cols-5 gap-1 z-50">
                {bgColors.map(c => <button key={c} onClick={() => { updateStyle({ backgroundColor: c }); setShowBgColorPicker(false); }} className="w-6 h-6 rounded border border-slate-300" style={{ backgroundColor: c }} />)}
              </div>
            )}
          </div>
          <div className="w-px h-6 bg-emerald-600 mx-2" />
          {/* Clipboard */}
          <button onClick={handleCopy} className="p-1.5 hover:bg-emerald-800 rounded transition-colors" title="Copy"><Copy size={16} /></button>
          <button onClick={handleCut} className="p-1.5 hover:bg-emerald-800 rounded transition-colors" title="Cut"><Scissors size={16} /></button>
          <button onClick={handlePaste} className="p-1.5 hover:bg-emerald-800 rounded transition-colors" title="Paste"><Clipboard size={16} /></button>
          <div className="w-px h-6 bg-emerald-600 mx-2" />
          {/* Data */}
          <button onClick={handleAutoSum} className="p-1.5 hover:bg-emerald-800 rounded transition-colors" title="AutoSum"><Sigma size={16} /></button>
          <button onClick={handleSort} className="p-1.5 hover:bg-emerald-800 rounded transition-colors" title="Sort"><SortAsc size={16} /></button>
          <button onClick={() => setSheetData({})} className="p-1.5 hover:bg-emerald-800 rounded transition-colors" title="Clear"><Trash2 size={16} /></button>
          <div className="w-px h-6 bg-emerald-600 mx-2" />
          {/* Zoom */}
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1 hover:bg-emerald-800 rounded"><ZoomOut size={16} /></button>
            <span className="text-sm">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-1 hover:bg-emerald-800 rounded"><ZoomIn size={16} /></button>
          </div>
        </div>
      </div>

      {/* Formula Bar */}
      <div className="flex items-center bg-slate-100 border-b border-slate-300">
        <div className="flex items-center px-2 py-1 bg-slate-200 border-r border-slate-300">
          {selectedCell && <span className="text-sm font-medium text-slate-600">{getCellName(selectedCell.r, selectedCell.c)}</span>}
        </div>
        <input type="text" value={formulaBarValue} onChange={handleFormulaBarChange} className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" placeholder="Enter value or formula" />
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto" style={{ zoom }}>
        <table className="border-collapse w-full">
          <thead>
            <tr>
              <th className="w-10 bg-slate-200 border border-slate-300 p-1 sticky top-0 z-10"></th>
              {Array.from({ length: TOTAL_COLS }, (_, i) => (
                <th key={i} className="bg-slate-200 border border-slate-300 p-1 text-xs text-slate-600 font-normal w-20 min-w-20 text-center">{getColLabel(i)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: TOTAL_ROWS }, (_, rowIndex) => (
              <tr key={rowIndex}>
                <td className="bg-slate-200 border border-slate-300 p-1 text-xs text-slate-600 font-normal text-center">{rowIndex + 1}</td>
                {Array.from({ length: TOTAL_COLS }, (_, colIndex) => {
                  const key = `${rowIndex}-${colIndex}`;
                  const isSelected = selectedCell?.r === rowIndex && selectedCell?.c === colIndex;
                  const style = cellStyles[key] || {};
                  return (
                    <td key={colIndex} className={`border border-slate-300 p-0 relative ${isSelected ? 'ring-2 ring-blue-500 z-10' : ''}`}>
                      <input 
                        type="text"
                        value={sheetData[key] || ''}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        onFocus={() => setSelectedCell({ r: rowIndex, c: colIndex })}
                        onKeyDown={(e) => {
                          if (e.key === 'Tab') { e.preventDefault(); setSelectedCell({ r: rowIndex, c: colIndex + 1 }); }
                          else if (e.key === 'Enter') { e.preventDefault(); setSelectedCell({ r: rowIndex + 1, c: colIndex }); }
                          else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedCell({ r: Math.max(0, rowIndex - 1), c: colIndex }); }
                          else if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedCell({ r: rowIndex + 1, c: colIndex }); }
                          else if (e.key === 'ArrowLeft') { e.preventDefault(); setSelectedCell({ r: rowIndex, c: Math.max(0, colIndex - 1) }); }
                          else if (e.key === 'ArrowRight') { e.preventDefault(); setSelectedCell({ r: rowIndex, c: colIndex + 1 }); }
                          else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); handleCellChange(rowIndex, colIndex, ''); }
                        }}
                        className="w-full h-7 px-2 text-sm focus:outline-none bg-transparent"
                        style={style}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Save Spreadsheet</h3>
            <input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-emerald-500" placeholder="File name" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowSaveDialog(false)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors">Cancel</button>
              <button onClick={confirmSave} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// DOCUMENT EDITOR COMPONENT (WORD-LIKE)
// ============================================================================

const DocumentEditor: React.FC<{ onBack: () => void; files: SavedFile[]; setFiles: React.Dispatch<React.SetStateAction<SavedFile[]>> }> = ({ onBack, files, setFiles }) => {
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(12);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');

  const handleSave = () => {
    if (!fileName.trim()) { alert('Please enter a file name'); return; }
    const newFile: SavedFile = { id: generateId(), name: fileName, type: 'document', content, folderId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setFiles(prev => [...prev, newFile]);
    setFileName('');
    alert('Document saved successfully!');
  };

  const handlePrint = () => window.print();

  const fonts = ['Arial', 'Arial Black', 'Calibri', 'Georgia', 'Times New Roman', 'Verdana', 'Courier New', 'Impact', 'Comic Sans MS'];
  const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 48, 72];
  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'];

  return (
    <div className="document-editor h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="bg-blue-700 text-white">
        <div className="flex items-center gap-1 p-2 border-b border-blue-600">
          <button onClick={onBack} className="flex items-center gap-1 px-3 py-1.5 bg-blue-800 hover:bg-blue-900 rounded transition-colors text-sm"><ArrowLeft size={16} /> Back</button>
          <span className="font-bold text-lg px-3 border-l border-blue-600">Document Editor</span>
          <div className="flex-1" />
          <button onClick={handlePrint} className="p-2 hover:bg-blue-800 rounded transition-colors" title="Print"><Printer size={18} /></button>
          <button onClick={handleSave} className="p-2 hover:bg-blue-800 rounded transition-colors" title="Save"><Save size={18} /></button>
        </div>
        <div className="flex items-center gap-1 p-2 flex-wrap">
          {/* File Name */}
          <input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Document name" className="bg-blue-800 border border-blue-600 rounded px-3 py-1 text-sm w-48 focus:outline-none" />
          <div className="w-px h-6 bg-blue-600 mx-2" />
          {/* Font */}
          <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="bg-blue-800 border border-blue-600 rounded px-2 py-1 text-sm focus:outline-none">
            {fonts.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="bg-blue-800 border border-blue-600 rounded px-2 py-1 text-sm w-16 focus:outline-none">
            {fontSizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="w-px h-6 bg-blue-600 mx-2" />
          {/* Format */}
          <button onClick={() => setBold(!bold)} className={`p-1.5 hover:bg-blue-800 rounded transition-colors ${bold ? 'bg-blue-900' : ''}`} title="Bold"><Bold size={16} /></button>
          <button onClick={() => setItalic(!italic)} className={`p-1.5 hover:bg-blue-800 rounded transition-colors ${italic ? 'bg-blue-900' : ''}`} title="Italic"><Italic size={16} /></button>
          <button onClick={() => setUnderline(!underline)} className={`p-1.5 hover:bg-blue-800 rounded transition-colors ${underline ? 'bg-blue-900' : ''}`} title="Underline"><Underline size={16} /></button>
          <div className="w-px h-6 bg-blue-600 mx-2" />
          <button onClick={() => setTextAlign('left')} className={`p-1.5 hover:bg-blue-800 rounded transition-colors ${textAlign === 'left' ? 'bg-blue-900' : ''}`} title="Align Left"><AlignLeft size={16} /></button>
          <button onClick={() => setTextAlign('center')} className={`p-1.5 hover:bg-blue-800 rounded transition-colors ${textAlign === 'center' ? 'bg-blue-900' : ''}`} title="Align Center"><AlignCenter size={16} /></button>
          <button onClick={() => setTextAlign('right')} className={`p-1.5 hover:bg-blue-800 rounded transition-colors ${textAlign === 'right' ? 'bg-blue-900' : ''}`} title="Align Right"><AlignRight size={16} /></button>
          <button onClick={() => setTextAlign('justify')} className={`p-1.5 hover:bg-blue-800 rounded transition-colors ${textAlign === 'justify' ? 'bg-blue-900' : ''}`} title="Justify"><AlignJustify size={16} /></button>
          <div className="w-px h-6 bg-blue-600 mx-2" />
          <button className="p-1.5 hover:bg-blue-800 rounded transition-colors flex items-center gap-1" title="Text Color">
            <Type size={16} />
            <div className="w-4 h-4 border border-white rounded" style={{ backgroundColor: '#000000' }} />
          </button>
          <button className="p-1.5 hover:bg-blue-800 rounded transition-colors" title="Insert Image"><Image size={16} /></button>
          <button className="p-1.5 hover:bg-blue-800 rounded transition-colors" title="Insert Table"><TableIcon size={16} /></button>
          <button className="p-1.5 hover:bg-blue-800 rounded transition-colors" title="Insert Link"><LinkIcon size={16} /></button>
        </div>
      </div>

      {/* Document Area */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto bg-white shadow-lg min-h-[calc(100vh-200px)] p-12" style={{ fontFamily, fontSize: `${fontSize}px` }}>
          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            className="w-full h-full min-h-[500px] resize-none focus:outline-none"
            style={{ fontWeight: bold ? 'bold' : 'normal', fontStyle: italic ? 'italic' : 'normal', textDecoration: underline ? 'underline' : 'none', textAlign }}
            placeholder="Start typing your document here..."
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PRESENTATION EDITOR COMPONENT (POWERPOINT-LIKE)
// ============================================================================

const PresentationEditor: React.FC<{ onBack: () => void; files: SavedFile[]; setFiles: React.Dispatch<React.SetStateAction<SavedFile[]>> }> = ({ onBack, files, setFiles }) => {
  const [slides, setSlides] = useState<{id: string; title: string; content: string; type: 'title' | 'content' | 'bullet' | 'two-column'}[]>([{ id: generateId(), title: 'Slide 1', content: '', type: 'title' }]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fileName, setFileName] = useState('');
  const [slideTheme, setSlideTheme] = useState('default');

  const addSlide = (type: 'title' | 'content' | 'bullet' | 'two-column') => {
    setSlides(prev => [...prev, { id: generateId(), title: `Slide ${prev.length + 1}`, content: '', type }]);
    setCurrentSlide(slides.length);
  };

  const deleteSlide = (index: number) => {
    if (slides.length > 1) {
      setSlides(prev => prev.filter((_, i) => i !== index));
      if (currentSlide >= slides.length) setCurrentSlide(slides.length - 1);
    }
  };

  const duplicateSlide = () => {
    const current = slides[currentSlide];
    setSlides(prev => [...prev.slice(0, currentSlide + 1), { ...current, id: generateId(), title: `${current.title} (copy)` }, ...prev.slice(currentSlide + 1)]);
  };

  const handleSave = () => {
    if (!fileName.trim()) { alert('Please enter a name'); return; }
    const newFile: SavedFile = { id: generateId(), name: fileName, type: 'presentation', content: JSON.stringify(slides), folderId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setFiles(prev => [...prev, newFile]);
    alert('Presentation saved successfully!');
  };

  const handlePrint = () => window.print();

  const themes = [
    { id: 'default', name: 'Default', bg: 'bg-white', text: 'text-slate-800' },
    { id: 'dark', name: 'Dark', bg: 'bg-slate-900', text: 'text-white' },
    { id: 'blue', name: 'Blue', bg: 'bg-blue-700', text: 'text-white' },
    { id: 'green', name: 'Green', bg: 'bg-emerald-700', text: 'text-white' },
    { id: 'purple', name: 'Purple', bg: 'bg-purple-700', text: 'text-white' },
  ];

  const currentTheme = themes.find(t => t.id === slideTheme) || themes[0];

  return (
    <div className="presentation-editor h-full flex flex-col bg-slate-800">
      {/* Toolbar */}
      <div className="bg-orange-700 text-white">
        <div className="flex items-center gap-1 p-2 border-b border-orange-600">
          <button onClick={onBack} className="flex items-center gap-1 px-3 py-1.5 bg-orange-800 hover:bg-orange-900 rounded transition-colors text-sm"><ArrowLeft size={16} /> Back</button>
          <span className="font-bold text-lg px-3 border-l border-orange-600">Presentation Editor</span>
          <div className="flex-1" />
          <button onClick={handlePrint} className="p-2 hover:bg-orange-800 rounded transition-colors" title="Print"><Printer size={18} /></button>
          <button onClick={handleSave} className="p-2 hover:bg-orange-800 rounded transition-colors" title="Save"><Save size={18} /></button>
          <button onClick={() => window.open('?mode=present', '_blank')} className="p-2 hover:bg-orange-800 rounded transition-colors" title="Present"><MonitorPlay size={18} /></button>
        </div>
        <div className="flex items-center gap-1 p-2 flex-wrap">
          <input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Presentation name" className="bg-orange-800 border border-orange-600 rounded px-3 py-1 text-sm w-48 focus:outline-none" />
          <div className="w-px h-6 bg-orange-600 mx-2" />
          <select value={slideTheme} onChange={(e) => setSlideTheme(e.target.value)} className="bg-orange-800 border border-orange-600 rounded px-2 py-1 text-sm focus:outline-none">
            {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <div className="w-px h-6 bg-orange-600 mx-2" />
          <button onClick={() => addSlide('title')} className="p-1.5 hover:bg-orange-800 rounded transition-colors text-sm" title="Title Slide">Title</button>
          <button onClick={() => addSlide('content')} className="p-1.5 hover:bg-orange-800 rounded transition-colors text-sm" title="Content Slide">Content</button>
          <button onClick={() => addSlide('bullet')} className="p-1.5 hover:bg-orange-800 rounded transition-colors text-sm" title="Bullet Slide">Bullet</button>
          <button onClick={() => addSlide('two-column')} className="p-1.5 hover:bg-orange-800 rounded transition-colors text-sm" title="Two Column">2-Column</button>
          <button onClick={duplicateSlide} className="p-1.5 hover:bg-orange-800 rounded transition-colors text-sm" title="Duplicate Slide"><Copy size={16} /></button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Slides Sidebar */}
        <div className="w-56 bg-slate-700 border-r border-slate-600 p-2 overflow-auto">
          {slides.map((slide, index) => (
            <div key={slide.id} onClick={() => setCurrentSlide(index)} className={`p-2 mb-2 bg-white rounded cursor-pointer border-2 transition-colors ${currentSlide === index ? 'border-orange-500' : 'border-transparent'}`}>
              <div className="text-xs text-slate-500 mb-1">{index + 1}</div>
              <input type="text" value={slide.title} onChange={(e) => { const newSlides = [...slides]; newSlides[index].title = e.target.value; setSlides(newSlides); }} className="w-full text-xs border border-slate-200 rounded px-2 py-1 mb-1 focus:outline-none focus:border-orange-500" />
              <div className="flex justify-between">
                <button onClick={(e) => { e.stopPropagation(); setCurrentSlide(Math.max(0, index - 1)); }} className="text-slate-400 hover:text-slate-600"><ChevronDown size={12} className="rotate-180" /></button>
                <button onClick={(e) => { e.stopPropagation(); setCurrentSlide(Math.min(slides.length - 1, index + 1)); }} className="text-slate-400 hover:text-slate-600"><ChevronDown size={12} /></button>
                <button onClick={(e) => { e.stopPropagation(); deleteSlide(index); }} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
          <button onClick={() => addSlide('content')} className="w-full p-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded text-sm transition-colors">+ New Slide</button>
        </div>

        {/* Slide Editor */}
        <div className="flex-1 p-8 overflow-auto flex items-center justify-center">
          <div className={`w-full max-w-4xl aspect-video rounded-lg shadow-2xl p-8 ${currentTheme.bg} ${currentTheme.text}`}>
            <input type="text" value={slides[currentSlide]?.title || ''} onChange={(e) => { const newSlides = [...slides]; newSlides[currentSlide].title = e.target.value; setSlides(newSlides); }} className={`w-full text-3xl font-bold border-none bg-transparent mb-4 focus:outline-none placeholder-current ${currentTheme.text}`} placeholder="Slide Title" />
            {slides[currentSlide]?.type === 'title' ? (
              <textarea value={slides[currentSlide]?.content || ''} onChange={(e) => { const newSlides = [...slides]; newSlides[currentSlide].content = e.target.value; setSlides(newSlides); }} className={`w-full h-64 text-xl border-none bg-transparent resize-none focus:outline-none placeholder-current ${currentTheme.text}`} placeholder="Subtitle or content..." />
            ) : slides[currentSlide]?.type === 'two-column' ? (
              <div className="flex gap-8 h-64">
                <div className="flex-1">
                  <textarea value={(slides[currentSlide]?.content || '|||').split('|||')[0]} onChange={(e) => { const newSlides = [...slides]; const parts = (newSlides[currentSlide].content || '|||').split('|||'); parts[0] = e.target.value; newSlides[currentSlide].content = parts.join('|||'); setSlides(newSlides); }} className={`w-full h-full text-lg border-none bg-transparent resize-none focus:outline-none placeholder-current ${currentTheme.text}`} placeholder="Left column content..." />
                </div>
                <div className="w-px bg-current opacity-30" />
                <div className="flex-1">
                  <textarea value={(slides[currentSlide]?.content || '|||').split('|||')[1] || ''} onChange={(e) => { const newSlides = [...slides]; const parts = (newSlides[currentSlide].content || '|||').split('|||'); parts[1] = e.target.value; newSlides[currentSlide].content = parts.join('|||'); setSlides(newSlides); }} className={`w-full h-full text-lg border-none bg-transparent resize-none focus:outline-none placeholder-current ${currentTheme.text}`} placeholder="Right column content..." />
                </div>
              </div>
            ) : (
              <textarea value={slides[currentSlide]?.content || ''} onChange={(e) => { const newSlides = [...slides]; newSlides[currentSlide].content = e.target.value; setSlides(newSlides); }} className={`w-full h-64 text-lg border-none bg-transparent resize-none focus:outline-none placeholder-current ${currentTheme.text}`} placeholder={slides[currentSlide]?.type === 'bullet' ? "Enter bullet points (one per line):\n- Point 1\n- Point 2\n- Point 3" : "Enter content..."} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ProjectCreativity: React.FC = () => {
  const [currentTool, setCurrentTool] = useState<'menu' | 'file-manager' | 'spreadsheet' | 'document' | 'presentation'>('menu');
  const [files, setFiles] = useState<SavedFile[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY_FILES) || '[]'); } catch { return []; }
  });
  const [folders, setFolders] = useState<SavedFolder[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY_FOLDERS) || '[]'); } catch { return []; }
  });
  
  // Confirmation dialog state
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  
  const handleConfirm = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(action);
    setShowConfirm(true);
  };

  useEffect(() => { localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(files)); }, [files]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders)); }, [folders]);

  const tools = [
    { id: 'file-manager', icon: Folder, title: 'File Manager', description: 'Organize, manage and share your files', color: 'bg-purple-500' },
    { id: 'spreadsheet', icon: FileSpreadsheet, title: 'Spreadsheet', description: 'Create spreadsheets with formulas', color: 'bg-emerald-500' },
    { id: 'document', icon: FileText, title: 'Document', description: 'Write professional documents', color: 'bg-blue-500' },
    { id: 'presentation', icon: Presentation, title: 'Presentation', description: 'Create impactful slides', color: 'bg-orange-500' },
  ];

  const renderContent = () => {
    switch (currentTool) {
      case 'file-manager':
        return <FileManager onBack={() => setCurrentTool('menu')} files={files} setFiles={setFiles} folders={folders} setFolders={setFolders} />;
      case 'spreadsheet':
        return <SpreadsheetEditor onBack={() => setCurrentTool('menu')} files={files} setFiles={setFiles} />;
      case 'document':
        return <DocumentEditor onBack={() => setCurrentTool('menu')} files={files} setFiles={setFiles} />;
      case 'presentation':
        return <PresentationEditor onBack={() => setCurrentTool('menu')} files={files} setFiles={setFiles} />;
      default:
        return (
          <div className="h-full bg-white p-8">
            <div className="flex items-center gap-3 mb-8">
              <Folder className="size-10 text-purple-500" />
              <h1 className="text-3xl font-bold text-slate-800">Project Creativity</h1>
            </div>
            <p className="text-slate-500 mb-8">Choose a tool to start creating</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tools.map(tool => {
                const Icon = tool.icon;
                return (
                  <ToolCard key={tool.id} icon={Icon} title={tool.title} description={tool.description} color={tool.color} onClick={() => setCurrentTool(tool.id as any)} />
                );
              })}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-white">
      <style>{`
        @media print {
          .spreadsheet-editor .bg-emerald-700, .document-editor .bg-blue-700, .presentation-editor .bg-orange-700, .file-manager .bg-gradient-to-r {
            display: none !important;
          }
          .spreadsheet-editor, .document-editor, .presentation-editor {
            background: white !important;
          }
        }
      `}</style>
      {renderContent()}
      
      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-lg mb-4">Confirm Action</h3>
            <p className="text-slate-600 mb-6">{confirmMessage}</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  confirmAction?.();
                  setShowConfirm(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCreativity;
