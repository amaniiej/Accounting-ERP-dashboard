import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, ChevronRight, Save, Download, 
  Type, Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  Plus, Trash2, FileSpreadsheet, Printer, Share2,
  Maximize2, Minimize2, Grid, ArrowRight, Layout,
  Table as TableIcon, ArrowLeft, Presentation, MonitorPlay,
  FileText, FilePlus, FolderOpen, FileDown, Scissors, Clipboard, 
  ZoomIn, ZoomOut, ListOrdered, Indent, Outdent, Highlighter, 
  Image as ImageIcon, BarChart, Link as LinkIcon, Bookmark, 
  Eye, Search as SearchIcon, Palette, Baseline, Strikethrough,
  Superscript, Subscript, Undo, Redo, List, Shapes, StickyNote,
  AlignJustify, Copy, Underline, Calendar, Clock, Eraser, Sigma, Hash,
  FolderPlus, Folder, X
} from 'lucide-react';
import { motion } from 'framer-motion';

// ============================================================================
// FILE MANAGEMENT TYPES & STORAGE
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
// CONSTANTES & CONFIGURATION
// ============================================================================

const ROW_BLOCK_SIZE = 50;
const COL_BLOCK_SIZE = 10;
const TOTAL_ROWS = 1000;
const TOTAL_COLS = 100;

const STANDARD_FONTS = [
  'Arial', 'Arial Black', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Impact', 'Times New Roman',
  'Didot', 'Georgia', 'American Typewriter', 'Andale Mono', 'Courier', 'Lucida Console',
  'Monaco', 'Bradley Hand', 'Brush Script MT', 'Luminari', 'Comic Sans MS', 'Satoshi',
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Source Sans Pro',
  'Merriweather', 'Playfair Display', 'Lora', 'PT Serif', 'Noto Sans', 'Nunito', 'Ubuntu'
];

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

const getCellName = (row: number, col: number) => {
  return `${getColLabel(col)}${row + 1}`;
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

// ============================================================================
// FORMULA ENGINE
// ============================================================================

const FORMULA_FUNCTIONS = {
  SUM: (...args: any[]) => args.flat().reduce((a, b) => a + (Number(b) || 0), 0),
  AVERAGE: (...args: any[]) => {
    const flat = args.flat().filter(v => typeof v === 'number' || (!isNaN(Number(v)) && v !== ''));
    return flat.length ? flat.reduce((a, b) => a + Number(b), 0) / flat.length : 0;
  },
  MAX: (...args: any[]) => Math.max(...args.flat().map(v => Number(v) || -Infinity)),
  MIN: (...args: any[]) => Math.min(...args.flat().map(v => Number(v) || Infinity)),
  COUNT: (...args: any[]) => args.flat().filter(v => v !== '' && v !== null && v !== undefined).length,
  ROUND: (num: number, decimals: number = 0) => Number(Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals),
  IF: (condition: boolean, trueVal: any, falseVal: any) => condition ? trueVal : falseVal,
  ABS: (num: number) => Math.abs(num),
  AND: (...args: any[]) => args.flat().every(v => Boolean(v)),
  OR: (...args: any[]) => args.flat().some(v => Boolean(v)),
  NOT: (arg: any) => !Boolean(arg),
  TRIM: (text: string) => String(text).trim(),
  UPPER: (text: string) => String(text).toUpperCase(),
  LOWER: (text: string) => String(text).toLowerCase(),
  LEN: (text: string) => String(text).length,
  CONCAT: (...args: any[]) => args.flat().join(''),
  CONCATENATE: (...args: any[]) => args.flat().join(''),
  LEFT: (text: string, num: number) => String(text).substring(0, num),
  RIGHT: (text: string, num: number) => String(text).slice(-num),
  MID: (text: string, start: number, len: number) => String(text).substr(start - 1, len),
  TODAY: () => new Date().toLocaleDateString(),
  NOW: () => new Date().toLocaleString(),
  DATE: (year: number, month: number, day: number) => new Date(year, month - 1, day).toLocaleDateString(),
  POWER: (base: number, exp: number) => Math.pow(base, exp),
  SQRT: (num: number) => Math.sqrt(num),
  PI: () => Math.PI,
  RAND: () => Math.random(),
  FLOOR: (num: number) => Math.floor(num),
  CEILING: (num: number) => Math.ceil(num),
};

// ============================================================================
// COMPOSANTS UTILITAIRES
// ============================================================================

const GrainyTexture = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.15] pointer-events-none mix-blend-overlay z-0">
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
  </svg>
);

const AutoResizeTextarea: React.FC<{
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  fontFamily?: string;
}> = ({ value, onChange, className, placeholder, fontFamily }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value, fontFamily]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className={`w-full resize-none overflow-hidden bg-transparent outline-none ${className}`}
      style={{ minHeight: '24px', fontFamily: fontFamily || 'inherit' }}
    />
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

const SpreadsheetEditor: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  // État des données de la feuille (Row-Col -> Value)
  const [sheetData, setSheetData] = useState<Record<string, string>>({});
  const [cellStyles, setCellStyles] = useState<Record<string, React.CSSProperties>>({});
  const [selectedFont, setSelectedFont] = useState<string>('Satoshi');
  const [selectedCell, setSelectedCell] = useState<{r: number, c: number} | null>(null);
  const [formulaBarValue, setFormulaBarValue] = useState("");
  const [clipboard, setClipboard] = useState<{val: string, style: React.CSSProperties} | null>(null);
  
  const colorInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  
  // File management state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [fileName, setFileName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  
  // Load files and folders from localStorage
  const [files, setFiles] = useState<SavedFile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FILES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [folders, setFolders] = useState<SavedFolder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FOLDERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  // Save files and folders to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(files));
  }, [files]);
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders));
  }, [folders]);
  
  const handleSave = () => setShowSaveDialog(true);
  
  const confirmSave = () => {
    const name = fileName.trim() || 'Untitled Spreadsheet';
    const newFile: SavedFile = {
      id: generateId(),
      name,
      type: 'spreadsheet',
      content: JSON.stringify({ sheetData, cellStyles }),
      folderId: selectedFolder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFiles(prev => [...prev, newFile]);
    setShowSaveDialog(false);
    setFileName('');
  };
  
  const handleOpen = () => setShowOpenDialog(true);
  
  const loadFile = (file: SavedFile) => {
    try {
      const content = JSON.parse(file.content);
      setSheetData(content.sheetData || {});
      setCellStyles(content.cellStyles || {});
    } catch (e) {
      console.error('Error loading file:', e);
    }
    setShowOpenDialog(false);
  };
  
  const handleNewFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: SavedFolder = {
        id: generateId(),
        name: newFolderName.trim(),
        parentId: null,
        createdAt: new Date().toISOString(),
      };
      setFolders(prev => [...prev, newFolder]);
      setShowNewFolderDialog(false);
      setNewFolderName('');
    }
  };
  
  const handleNew = () => {
    if (confirm('Create new spreadsheet? Unsaved changes will be lost.')) {
      setSheetData({});
      setCellStyles({});
      setSelectedCell(null);
      setFormulaBarValue('');
    }
  };
  
  const handlePrint = () => window.print();
  
  // État des blocs ouverts (Lignes et Colonnes)
  const [openRowBlocks, setOpenRowBlocks] = useState<Set<number>>(new Set([0])); // Premier bloc ouvert par défaut
  const [openColBlocks, setOpenColBlocks] = useState<Set<number>>(new Set([0])); // Premier bloc ouvert par défaut

  // Mise à jour de la barre de formule quand la sélection change
  useEffect(() => {
    if (selectedCell) {
      const key = `${selectedCell.r}-${selectedCell.c}`;
      setFormulaBarValue(sheetData[key] || "");
    } else {
      setFormulaBarValue("");
    }
  }, [selectedCell, sheetData]);

  const getSelectedKey = () => selectedCell ? `${selectedCell.r}-${selectedCell.c}` : null;

  const handleCellChange = (row: number, col: number, value: string) => {
    setSheetData(prev => ({
      ...prev,
      [`${row}-${col}`]: value
    }));
  };

  const updateStyle = (style: Partial<React.CSSProperties>) => {
    const key = getSelectedKey();
    if (!key) return;
    setCellStyles(prev => ({
      ...prev,
      [key]: { ...prev[key], ...style }
    }));
  };

  const handleCopy = () => {
    const key = getSelectedKey();
    if (key) setClipboard({ val: sheetData[key] || '', style: cellStyles[key] || {} });
  };

  const handleCut = () => {
    handleCopy();
    const key = getSelectedKey();
    if (key) {
      handleCellChange(selectedCell!.r, selectedCell!.c, '');
      setCellStyles(prev => { const n = {...prev}; delete n[key]; return n; });
    }
  };

  const handlePaste = () => {
    const key = getSelectedKey();
    if (key && clipboard) {
      handleCellChange(selectedCell!.r, selectedCell!.c, clipboard.val);
      setCellStyles(prev => ({ ...prev, [key]: clipboard.style }));
    }
  };

  const handleAutoSum = () => {
    if (!selectedCell) return;
    const { r, c } = selectedCell;
    let startR = r - 1;
    while (startR >= 0 && sheetData[`${startR}-${c}`] && !isNaN(Number(sheetData[`${startR}-${c}`]))) {
      startR--;
    }
    startR++; 
    if (startR < r) {
      const formula = `=SUM(${getColLabel(c)}${startR + 1}:${getColLabel(c)}${r})`;
      handleCellChange(r, c, formula);
      setFormulaBarValue(formula);
    }
  };

  const handleSort = () => {
    if (!selectedCell) return;
    const col = selectedCell.c;
    
    // Collect rows with data
    const rowsWithData = [];
    for(let r=0; r<TOTAL_ROWS; r++) {
        let hasData = false;
        const rowData: any = {};
        for(let c=0; c<TOTAL_COLS; c++) {
            const key = `${r}-${c}`;
            if(sheetData[key]) {
                hasData = true;
                rowData[c] = { val: sheetData[key], style: cellStyles[key] };
            }
        }
        if(hasData) rowsWithData.push({ r, data: rowData });
    }

    // Sort based on selected column
    rowsWithData.sort((a, b) => {
        const valA = a.data[col]?.val || '';
        const valB = b.data[col]?.val || '';
        const numA = parseFloat(valA);
        const numB = parseFloat(valB);
        return !isNaN(numA) && !isNaN(numB) ? numA - numB : valA.localeCompare(valB);
    });

    // Apply new order
    const nextSheetData = { ...sheetData };
    const nextStyles = { ...cellStyles };
    const indices = rowsWithData.map(x => x.r);

    rowsWithData.forEach((item, i) => {
        const targetR = indices[i];
        for(let c=0; c<TOTAL_COLS; c++) {
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

  const handleFormulaBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormulaBarValue(val);
    if (selectedCell) {
      handleCellChange(selectedCell.r, selectedCell.c, val);
    }
  };

  const evaluateFormula = (expression: string, visitedCells: Set<string> = new Set()): string | number => {
    if (!expression?.startsWith('=')) {
      return isNaN(Number(expression)) ? expression : Number(expression);
    }

    // Cycle detection
    if (visitedCells.size > 50) return "#CYCLE";

    try {
      const formula = expression.substring(1).toUpperCase();
      
      // 1. Handle Ranges (e.g., A1:B2) -> [val1, val2, ...]
      const parsedWithRanges = formula.replace(/([A-Z]+[0-9]+):([A-Z]+[0-9]+)/g, (match, start, end) => {
        const startCoords = getCellCoords(start);
        const endCoords = getCellCoords(end);
        if (!startCoords || !endCoords) return "[]";
        
        const values = [];
        for (let r = Math.min(startCoords.row, endCoords.row); r <= Math.max(startCoords.row, endCoords.row); r++) {
          for (let c = Math.min(startCoords.col, endCoords.col); c <= Math.max(startCoords.col, endCoords.col); c++) {
            const cellKey = `${r}-${c}`;
            if (visitedCells.has(cellKey)) {
                values.push(0); 
                continue;
            }
            const cellVal = sheetData[cellKey] || "";
            const evaluated = evaluateFormula(cellVal.startsWith('=') ? cellVal : `=${cellVal}`, new Set([...visitedCells, cellKey]));
            values.push(evaluated);
          }
        }
        return `[${values.map(v => typeof v === 'string' ? `"${v}"` : v).join(',')}]`;
      });

      // 2. Handle Single Cell References (e.g., A1) -> val
      const parsed = parsedWithRanges.replace(/[A-Z]+[0-9]+/g, (ref) => {
        const coords = getCellCoords(ref);
        if (!coords) return "0";
        const cellKey = `${coords.row}-${coords.col}`;
        
        if (visitedCells.has(cellKey)) return "0"; 
        
        const cellVal = sheetData[cellKey] || "";
        // Recursively evaluate referenced cell
        const evaluated = evaluateFormula(cellVal.startsWith('=') ? cellVal : `=${cellVal}`, new Set([...visitedCells, cellKey]));
        
        return typeof evaluated === 'string' ? `"${evaluated}"` : String(evaluated);
      });

      // 3. Execute with functions
      const funcNames = Object.keys(FORMULA_FUNCTIONS);
      const funcValues = Object.values(FORMULA_FUNCTIONS);
      
      // eslint-disable-next-line no-new-func
      const result = new Function(...funcNames, `return ${parsed}`)(...funcValues);
      return result;
    } catch (e) {
      return "#ERROR";
    }
  };

  const toggleRowBlock = (blockIndex: number) => {
    setOpenRowBlocks(prev => {
      const next = new Set(prev);
      if (next.has(blockIndex)) next.delete(blockIndex);
      else next.add(blockIndex);
      return next;
    });
  };

  const toggleColBlock = (blockIndex: number) => {
    setOpenColBlocks(prev => {
      const next = new Set(prev);
      if (next.has(blockIndex)) next.delete(blockIndex);
      else next.add(blockIndex);
      return next;
    });
  };

  // Génération des blocs
  const rowBlocks = Array.from({ length: Math.ceil(TOTAL_ROWS / ROW_BLOCK_SIZE) }, (_, i) => i);
  const colBlocks = Array.from({ length: Math.ceil(TOTAL_COLS / COL_BLOCK_SIZE) }, (_, i) => i);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 text-slate-900 overflow-hidden relative font-sans" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      <GrainyTexture />

      {/* EXCEL-LIKE HEADER */}
      <div className="bg-white border-b border-slate-200 flex flex-col shrink-0 z-20 shadow-sm">
        {/* Top Bar: Title & Window Controls */}
        <div className="flex items-center justify-between px-4 py-2 bg-emerald-700 text-white">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={18} />
              <span className="font-bold text-sm">Untitled Spreadsheet</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button className="p-1.5 hover:bg-white/20 rounded text-white/80"><Share2 size={16} /></button>
             <div className="w-8 h-8 bg-emerald-800 rounded-full flex items-center justify-center text-xs font-bold border-2 border-emerald-600">JS</div>
          </div>
        </div>

        {/* Ribbon / Toolbar */}
        <div className="px-4 py-2 bg-slate-50 flex items-center gap-4 overflow-x-auto border-b border-slate-200">
          {/* File Operations */}
          <div className="flex items-center gap-1 pr-4 border-r border-slate-200">
            <button onClick={handleNew} className="p-2 hover:bg-slate-200 rounded text-slate-600" title="New"><FilePlus size={18} /></button>
            <button onClick={handleOpen} className="p-2 hover:bg-slate-200 rounded text-slate-600" title="Open"><FolderOpen size={18} /></button>
            <button onClick={handleSave} className="p-2 hover:bg-slate-200 rounded text-slate-600" title="Save"><Save size={18} /></button>
            <button onClick={handlePrint} className="p-2 hover:bg-slate-200 rounded text-slate-600" title="Print"><Printer size={18} /></button>
          </div>

          {/* Clipboard */}
          <div className="flex items-center gap-1 pr-4 border-r border-slate-200">
            <button onClick={handlePaste} className="p-2 hover:bg-slate-200 rounded text-slate-600" title="Paste"><Clipboard size={18} /></button>
            <div className="flex flex-col gap-1">
              <button onClick={handleCopy} className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Copy"><Copy size={14} /></button>
              <button onClick={handleCut} className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Cut"><Scissors size={14} /></button>
            </div>
          </div>

          {/* Font */}
          <div className="flex flex-col gap-2 pr-4 border-r border-slate-200">
            <div className="flex gap-2">
              <select className="h-6 text-xs border border-slate-300 rounded bg-white w-28 outline-none">
                {STANDARD_FONTS.map(f => <option key={f}>{f}</option>)}
              </select>
              <select className="h-6 text-xs border border-slate-300 rounded bg-white w-12 outline-none">
                {[10,11,12,14,16,18,24,36].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-1">
              <button onClick={() => updateStyle({ fontWeight: 'bold' })} className="p-1 hover:bg-slate-200 rounded text-slate-700 font-bold"><Bold size={14} /></button>
              <button onClick={() => updateStyle({ fontStyle: 'italic' })} className="p-1 hover:bg-slate-200 rounded text-slate-700 italic"><Italic size={14} /></button>
              <button onClick={() => updateStyle({ textDecoration: 'underline' })} className="p-1 hover:bg-slate-200 rounded text-slate-700 underline"><Underline size={14} /></button>
              <div className="w-px h-4 bg-slate-300 mx-1" />
              <button onClick={() => colorInputRef.current?.click()} className="p-1 hover:bg-slate-200 rounded text-slate-700"><Baseline size={14} /></button>
              <button onClick={() => bgInputRef.current?.click()} className="p-1 hover:bg-slate-200 rounded text-slate-700"><Highlighter size={14} /></button>
            </div>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 pr-4 border-r border-slate-200">
            <button onClick={() => updateStyle({ textAlign: 'left' })} className="p-1.5 hover:bg-slate-200 rounded text-slate-600"><AlignLeft size={16} /></button>
            <button onClick={() => updateStyle({ textAlign: 'center' })} className="p-1.5 hover:bg-slate-200 rounded text-slate-600"><AlignCenter size={16} /></button>
            <button onClick={() => updateStyle({ textAlign: 'right' })} className="p-1.5 hover:bg-slate-200 rounded text-slate-600"><AlignRight size={16} /></button>
          </div>

          {/* Number */}
          <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
            <select className="h-7 text-xs border border-slate-300 rounded bg-white w-24 outline-none" onChange={(e) => { if(selectedCell) handleCellChange(selectedCell.r, selectedCell.c, e.target.value === 'Date' ? new Date().toLocaleDateString() : sheetData[`${selectedCell.r}-${selectedCell.c}`]) }}>
              <option>General</option>
              <option>Number</option>
              <option>Currency</option>
              <option>Date</option>
            </select>
            <button onClick={() => { if(selectedCell) handleCellChange(selectedCell.r, selectedCell.c, `$${sheetData[`${selectedCell.r}-${selectedCell.c}`] || ''}`) }} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 font-mono font-bold">$</button>
            <button onClick={() => { if(selectedCell) handleCellChange(selectedCell.r, selectedCell.c, `${sheetData[`${selectedCell.r}-${selectedCell.c}`] || ''}%`) }} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 font-mono font-bold">%</button>
          </div>

          {/* Operations */}
          <div className="flex items-center gap-2">
            <button onClick={handleAutoSum} className="flex flex-col items-center p-1 hover:bg-slate-200 rounded text-slate-600">
              <Sigma size={18} />
              <span className="text-[9px]">AutoSum</span>
            </button>
            <button onClick={handleSort} className="flex flex-col items-center p-1 hover:bg-slate-200 rounded text-slate-600">
              <ArrowRight size={18} />
              <span className="text-[9px]">Sort</span>
            </button>
          </div>
        </div>

        {/* Hidden Inputs */}
        <input type="color" ref={colorInputRef} className="hidden" onChange={(e) => updateStyle({ color: e.target.value })} />
        <input type="color" ref={bgInputRef} className="hidden" onChange={(e) => updateStyle({ backgroundColor: e.target.value })} />

        {/* Formula Bar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-slate-200">
          <div className="w-16 h-7 bg-slate-50 border border-slate-300 rounded flex items-center justify-center text-xs font-bold text-slate-600 shadow-inner">
            {selectedCell ? getCellName(selectedCell.r, selectedCell.c) : ''}
          </div>
          <div className="text-slate-400 px-1">
            <Hash size={14} />
          </div>
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={formulaBarValue}
              onChange={handleFormulaBarChange}
              className="w-full h-7 px-2 text-sm border border-slate-300 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
              placeholder="fx"
            />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - SHEET */}
      <div className="flex-1 overflow-auto p-6 relative z-10">
        <div className="bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full">
          
          {/* COLUMN GROUP HEADERS */}
          <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-30">
            <div className="w-16 shrink-0 border-r border-slate-200 bg-slate-100 flex items-center justify-center">
              <Grid size={16} className="text-slate-400" />
            </div>
            <div className="flex-1 overflow-hidden flex">
              {colBlocks.map(blockIndex => {
                const isOpen = openColBlocks.has(blockIndex);
                const startCol = blockIndex * COL_BLOCK_SIZE;
                const endCol = Math.min((blockIndex + 1) * COL_BLOCK_SIZE, TOTAL_COLS);
                
                return (
                  <div key={blockIndex} className={`flex flex-col border-r border-slate-300 transition-all duration-300 ${isOpen ? 'flex-1' : 'w-12 bg-slate-100'}`}>
                    {/* Block Toggle Header */}
                    <button 
                      onClick={() => toggleColBlock(blockIndex)}
                      className={`h-8 flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 hover:bg-blue-50 transition-colors ${isOpen ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {isOpen ? (
                        <>
                          Columns {getColLabel(startCol)} - {getColLabel(endCol - 1)}
                          <Minimize2 size={10} />
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1 py-1">
                          <span className="writing-vertical-lr">{blockIndex + 1}</span>
                          <Maximize2 size={10} />
                        </div>
                      )}
                    </button>

                    {/* Individual Column Headers */}
                    {isOpen && (
                      <div className="flex flex-1">
                        {Array.from({ length: endCol - startCol }, (_, i) => startCol + i).map(colIndex => (
                          <div key={colIndex} className={`flex-1 min-w-[100px] border-r border-slate-200 last:border-r-0 px-2 py-1.5 text-xs font-bold text-slate-600 text-center bg-slate-50 ${selectedCell?.c === colIndex ? 'bg-emerald-100 text-emerald-700' : ''}`}>
                            {getColLabel(colIndex)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ROWS & GRID */}
          <div className="flex-1 overflow-y-auto">
            {rowBlocks.map(blockIndex => {
              const isOpen = openRowBlocks.has(blockIndex);
              const startRow = blockIndex * ROW_BLOCK_SIZE;
              const endRow = Math.min((blockIndex + 1) * ROW_BLOCK_SIZE, TOTAL_ROWS);

              return (
                <div key={blockIndex} className="border-b-2 border-slate-200">
                  {/* Row Block Header */}
                  <button 
                    onClick={() => toggleRowBlock(blockIndex)}
                    className={`w-full flex items-center gap-4 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${isOpen ? 'bg-blue-50 text-blue-700 border-b border-blue-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span>Rows {startRow + 1} - {endRow}</span>
                    {!isOpen && <span className="ml-auto text-[10px] bg-slate-200 px-2 py-0.5 rounded-full">{ROW_BLOCK_SIZE} rows hidden</span>}
                  </button>

                  {/* Rows Content */}
                  {isOpen && (
                    <div className="flex flex-col">
                      {Array.from({ length: endRow - startRow }, (_, i) => startRow + i).map(rowIndex => (
                        <div key={rowIndex} className="flex border-b border-slate-100 hover:bg-blue-50/30 transition-colors group">
                          {/* Row Number */}
                          <div className={`w-16 shrink-0 bg-slate-50 border-r border-slate-200 flex items-center justify-center text-xs font-mono text-slate-500 group-hover:text-blue-600 group-hover:font-bold select-none ${selectedCell?.r === rowIndex ? 'bg-emerald-100 text-emerald-700' : ''}`}>
                            {rowIndex + 1}
                          </div>

                          {/* Cells (mapped by active column blocks) */}
                          <div className="flex-1 flex">
                            {colBlocks.map(colBlockIndex => {
                              const isColBlockOpen = openColBlocks.has(colBlockIndex);
                              const startCol = colBlockIndex * COL_BLOCK_SIZE;
                              const endCol = Math.min((colBlockIndex + 1) * COL_BLOCK_SIZE, TOTAL_COLS);

                              if (!isColBlockOpen) {
                                return (
                                  <div key={colBlockIndex} className="w-12 shrink-0 border-r border-slate-300 bg-slate-50/50 flex items-center justify-center">
                                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                                  </div>
                                );
                              }

                              return (
                                <div key={colBlockIndex} className="flex flex-1">
                                  {Array.from({ length: endCol - startCol }, (_, i) => startCol + i).map(colIndex => (
                                    <div 
                                      key={colIndex} 
                                      className={`flex-1 min-w-[100px] border-r border-slate-200 last:border-r-0 p-0 relative ${selectedCell?.r === rowIndex && selectedCell?.c === colIndex ? 'ring-2 ring-emerald-500 z-10' : ''}`}
                                      onClick={() => setSelectedCell({r: rowIndex, c: colIndex})}
                                    >
                                      {selectedCell?.r === rowIndex && selectedCell?.c === colIndex ? (
                                        <input
                                          autoFocus
                                          value={sheetData[`${rowIndex}-${colIndex}`] || ''}
                                          onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                          className="w-full h-full px-2 py-1 text-sm outline-none bg-white"
                                          style={{ fontFamily: selectedFont, ...cellStyles[`${rowIndex}-${colIndex}`] }}
                                        />
                                      ) : (
                                        <div 
                                          className="w-full h-full px-2 py-1 text-sm text-slate-700 overflow-hidden whitespace-nowrap"
                                          style={{ fontFamily: selectedFont, ...cellStyles[`${rowIndex}-${colIndex}`] }}
                                        >
                                          {evaluateFormula(sheetData[`${rowIndex}-${colIndex}`], new Set([`${rowIndex}-${colIndex}`]))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Footer of the sheet */}
            <div className="p-8 text-center text-slate-400 text-sm">
              <p>End of Sheet • {TOTAL_ROWS} Rows Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* STATUS BAR */}
      <div className="bg-white border-t border-slate-200 px-4 py-2 flex justify-between items-center text-[10px] text-slate-500 font-mono uppercase tracking-wider shrink-0 z-20">
        <div className="flex gap-4">
          <span>Ready</span>
          <span>{Object.keys(sheetData).length} Cells Modified</span>
        </div>
        <div className="flex gap-4">
          <span>Auto-Save: ON</span>
          <span>UTF-8</span>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Save Spreadsheet</h3>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Spreadsheet name"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowSaveDialog(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={confirmSave} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Open Dialog */}
      {showOpenDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Open Spreadsheet</h3>
              <button onClick={() => setShowOpenDialog(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-600 mb-2">Spreadsheets</h4>
                <div className="grid gap-2">
                  {files.filter(f => !f.folderId && f.type === 'spreadsheet').map(file => {
                    const Icon = getFileIcon(file.type);
                    return (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg group">
                        <button onClick={() => loadFile(file)} className="flex items-center gap-3 flex-1">
                          <Icon size={20} className="text-emerald-600" />
                          <span className="font-medium text-slate-700">{file.name}</span>
                          <span className="text-xs text-slate-400">{new Date(file.updatedAt).toLocaleDateString()}</span>
                        </button>
                        <button onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                  {files.filter(f => !f.folderId && f.type === 'spreadsheet').length === 0 && <p className="text-slate-400 text-sm italic">No saved spreadsheets</p>}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-slate-600">Folders</h4>
                  <button onClick={() => setShowNewFolderDialog(true)} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                    <FolderPlus size={16} /> New Folder
                  </button>
                </div>
                <div className="grid gap-2">
                  {folders.map(folder => (
                    <div key={folder.id} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Folder size={20} className="text-amber-500" />
                          <span className="font-medium text-slate-700">{folder.name}</span>
                        </div>
                        <button onClick={() => setFolders(prev => prev.filter(f => f.id !== folder.id))} className="p-1 hover:bg-red-100 rounded text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="pl-7 grid gap-1">
                        {files.filter(f => f.folderId === folder.id && f.type === 'spreadsheet').map(file => {
                          const Icon = getFileIcon(file.type);
                          return (
                            <div key={file.id} className="flex items-center justify-between p-2 hover:bg-white rounded group">
                              <button onClick={() => loadFile(file)} className="flex items-center gap-2 flex-1">
                                <Icon size={16} className="text-emerald-600" />
                                <span className="text-sm text-slate-600">{file.name}</span>
                              </button>
                              <button onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded text-red-500">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">New Folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewFolderDialog(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleNewFolder} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DocumentEditor: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [zoom, setZoom] = useState(100);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [fileName, setFileName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  
  // Load files and folders from localStorage
  const [files, setFiles] = useState<SavedFile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FILES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [folders, setFolders] = useState<SavedFolder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FOLDERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  // Save files and folders to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(files));
  }, [files]);
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders));
  }, [folders]);
  
  const handleSave = () => {
    if (contentRef.current) {
      setShowSaveDialog(true);
    }
  };
  
  const confirmSave = () => {
    const name = fileName.trim() || 'Untitled Document';
    const newFile: SavedFile = {
      id: generateId(),
      name,
      type: 'document',
      content: contentRef.current?.innerHTML || '',
      folderId: selectedFolder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFiles(prev => [...prev, newFile]);
    setShowSaveDialog(false);
    setFileName('');
  };
  
  const handleOpen = () => {
    setShowOpenDialog(true);
  };
  
  const loadFile = (file: SavedFile) => {
    if (contentRef.current) {
      contentRef.current.innerHTML = file.content;
    }
    setShowOpenDialog(false);
  };
  
  const handleNewFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: SavedFolder = {
        id: generateId(),
        name: newFolderName.trim(),
        parentId: null,
        createdAt: new Date().toISOString(),
      };
      setFolders(prev => [...prev, newFolder]);
      setShowNewFolderDialog(false);
      setNewFolderName('');
    }
  };
  
  const deleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };
  
  const deleteFolder = (folderId: string) => {
    setFolders(prev => prev.filter(f => f.id !== folderId));
    setFiles(prev => prev.filter(f => f.folderId !== folderId));
  };
  const contentRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const highlightInputRef = useRef<HTMLInputElement>(null);
  
  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    contentRef.current?.focus();
  };

  const handleNew = () => {
    if (contentRef.current && confirm('Create new document? Unsaved changes will be lost.')) {
      contentRef.current.innerHTML = '';
    }
  };

  const handlePrint = () => window.print();

  const handleFind = () => {
    const text = prompt('Find text:');
    if (text) (window as any).find(text);
  };

  const handleInsertImage = () => {
    const url = prompt('Enter image URL:', 'https://source.unsplash.com/random/400x300');
    if (url) execCmd('insertImage', url);
  };

  const handleLink = () => {
    const url = prompt('Enter link URL:');
    if (url) execCmd('createLink', url);
  };

  const handleColorClick = (type: 'foreColor' | 'hiliteColor') => {
    if (type === 'foreColor' && colorInputRef.current) colorInputRef.current.click();
    if (type === 'hiliteColor' && highlightInputRef.current) highlightInputRef.current.click();
  };

  const handleInsertTable = () => {
    const rows = prompt('Rows:', '3');
    const cols = prompt('Columns:', '3');
    if (rows && cols) {
      let html = '<table style="width:100%; border-collapse: collapse; margin: 10px 0;"><tbody>';
      for (let i = 0; i < parseInt(rows); i++) {
        html += '<tr>';
        for (let j = 0; j < parseInt(cols); j++) {
          html += '<td style="border: 1px solid #ddd; padding: 8px;">Cell</td>';
        }
        html += '</tr>';
      }
      html += '</tbody></table>';
      execCmd('insertHTML', html);
    }
  };

  const ToolbarButton = ({ icon: Icon, title, onClick }: { icon: any, title: string, onClick?: () => void }) => (
    <button 
      className="p-1.5 text-slate-600 hover:bg-slate-100 hover:text-blue-600 rounded transition-colors" 
      title={title}
      onMouseDown={(e) => e.preventDefault()} // Empêche la perte de focus de l'éditeur
      onClick={onClick}
    >
      <Icon size={18} />
    </button>
  );

  const ToolbarSeparator = () => <div className="w-px h-5 bg-slate-200 mx-1" />;

  return (
    <div className="h-full flex flex-col bg-white text-slate-900 overflow-hidden relative font-sans">
      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Save Document</h3>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Document name"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowSaveDialog(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={confirmSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Open Dialog */}
      {showOpenDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Open Document</h3>
              <button onClick={() => setShowOpenDialog(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {/* Root folder */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-600 mb-2">Documents</h4>
                <div className="grid gap-2">
                  {files.filter(f => !f.folderId).map(file => {
                    const Icon = getFileIcon(file.type);
                    return (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg group">
                        <button onClick={() => loadFile(file)} className="flex items-center gap-3 flex-1">
                          <Icon size={20} className="text-blue-600" />
                          <span className="font-medium text-slate-700">{file.name}</span>
                          <span className="text-xs text-slate-400">{new Date(file.updatedAt).toLocaleDateString()}</span>
                        </button>
                        <button onClick={() => deleteFile(file.id)} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                  {files.filter(f => !f.folderId).length === 0 && <p className="text-slate-400 text-sm italic">No saved documents</p>}
                </div>
              </div>
              {/* Folders */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-slate-600">Folders</h4>
                  <button onClick={() => setShowNewFolderDialog(true)} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                    <FolderPlus size={16} /> New Folder
                  </button>
                </div>
                <div className="grid gap-2">
                  {folders.map(folder => (
                    <div key={folder.id} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Folder size={20} className="text-amber-500" />
                          <span className="font-medium text-slate-700">{folder.name}</span>
                        </div>
                        <button onClick={() => deleteFolder(folder.id)} className="p-1 hover:bg-red-100 rounded text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="pl-7 grid gap-1">
                        {files.filter(f => f.folderId === folder.id).map(file => {
                          const Icon = getFileIcon(file.type);
                          return (
                            <div key={file.id} className="flex items-center justify-between p-2 hover:bg-white rounded group">
                              <button onClick={() => loadFile(file)} className="flex items-center gap-2 flex-1">
                                <Icon size={16} className="text-blue-600" />
                                <span className="text-sm text-slate-600">{file.name}</span>
                              </button>
                              <button onClick={() => deleteFile(file.id)} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded text-red-500">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {folders.length === 0 && <p className="text-slate-400 text-sm italic">No folders created</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">New Folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewFolderDialog(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleNewFolder} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 shrink-0 z-20 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowLeft size={20} />
          </button>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <FileText size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">Untitled Document</h1>
            <p className="text-[10px] text-slate-500 font-medium">Word Processor</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
             Share
           </button>
        </div>
      </div>

      {/* Toolbars */}
      <div className="bg-slate-50 border-b border-slate-200 flex flex-col shadow-sm z-10">
        {/* Standard Toolbar */}
        <div className="flex items-center gap-1 p-1.5 border-b border-slate-200/60 overflow-x-auto">
          <ToolbarButton icon={FilePlus} title="New" onClick={handleNew} />
          <ToolbarButton icon={FolderOpen} title="Open" onClick={handleOpen} />
          <ToolbarButton icon={Save} title="Save" onClick={handleSave} />
          <ToolbarButton icon={FileDown} title="Export PDF" onClick={handlePrint} />
          <ToolbarButton icon={Printer} title="Print" onClick={handlePrint} />
          <ToolbarButton icon={Eye} title="Preview" onClick={() => alert('Preview Mode')} />
          <ToolbarSeparator />
          <ToolbarButton icon={Scissors} title="Cut" onClick={() => execCmd('cut')} />
          <ToolbarButton icon={Copy} title="Copy" onClick={() => execCmd('copy')} />
          <ToolbarButton icon={Clipboard} title="Paste" onClick={() => navigator.clipboard.readText().then(t => execCmd('insertText', t))} />
          <ToolbarSeparator />
          <ToolbarButton icon={Undo} title="Undo" onClick={() => execCmd('undo')} />
          <ToolbarButton icon={Redo} title="Redo" onClick={() => execCmd('redo')} />
          <ToolbarSeparator />
          <ToolbarButton icon={SearchIcon} title="Find & Replace" onClick={handleFind} />
          <ToolbarSeparator />
          <div className="flex items-center gap-1 bg-white border border-slate-300 rounded px-1">
             <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-1 hover:bg-slate-100 rounded"><Minimize2 size={12} /></button>
             <span className="text-xs w-8 text-center select-none">{zoom}%</span>
             <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-1 hover:bg-slate-100 rounded"><Maximize2 size={12} /></button>
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 p-1.5 border-b border-slate-200/60 overflow-x-auto">
          <select 
            className="h-7 text-xs border border-slate-300 rounded px-2 bg-white outline-none w-32 cursor-pointer"
            onChange={(e) => execCmd('fontName', e.target.value)}
          >
            {STANDARD_FONTS.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
          <select 
            className="h-7 text-xs border border-slate-300 rounded px-2 bg-white outline-none w-16 cursor-pointer"
            onChange={(e) => execCmd('fontSize', e.target.value)}
          >
            <option value="1">8 pt</option>
            <option value="2">10 pt</option>
            <option value="3">12 pt</option>
            <option value="4">14 pt</option>
            <option value="5">18 pt</option>
            <option value="6">24 pt</option>
            <option value="7">36 pt</option>
          </select>
          <ToolbarSeparator />
          <ToolbarButton icon={Bold} title="Bold" onClick={() => execCmd('bold')} />
          <ToolbarButton icon={Italic} title="Italic" onClick={() => execCmd('italic')} />
          <ToolbarButton icon={Underline} title="Underline" onClick={() => execCmd('underline')} />
          <ToolbarButton icon={Strikethrough} title="Strikethrough" onClick={() => execCmd('strikeThrough')} />
          <ToolbarButton icon={Superscript} title="Superscript" onClick={() => execCmd('superscript')} />
          <ToolbarButton icon={Subscript} title="Subscript" onClick={() => execCmd('subscript')} />
          <ToolbarSeparator />
          <ToolbarButton icon={AlignLeft} title="Align Left" onClick={() => execCmd('justifyLeft')} />
          <ToolbarButton icon={AlignCenter} title="Align Center" onClick={() => execCmd('justifyCenter')} />
          <ToolbarButton icon={AlignRight} title="Align Right" onClick={() => execCmd('justifyRight')} />
          <ToolbarButton icon={AlignJustify} title="Justify" onClick={() => execCmd('justifyFull')} />
          <ToolbarSeparator />
          <ToolbarButton icon={List} title="Bullet List" onClick={() => execCmd('insertUnorderedList')} />
          <ToolbarButton icon={ListOrdered} title="Numbered List" onClick={() => execCmd('insertOrderedList')} />
          <ToolbarSeparator />
          <ToolbarButton icon={Outdent} title="Decrease Indent" onClick={() => execCmd('outdent')} />
          <ToolbarButton icon={Indent} title="Increase Indent" onClick={() => execCmd('indent')} />
          <ToolbarSeparator />
          <ToolbarButton icon={Baseline} title="Text Color" onClick={() => handleColorClick('foreColor')} />
          <ToolbarButton icon={Highlighter} title="Highlight Color" onClick={() => handleColorClick('hiliteColor')} />
          <ToolbarButton icon={Eraser} title="Clear Formatting" onClick={() => execCmd('removeFormat')} />
          <ToolbarSeparator />
          <ToolbarButton icon={Undo} title="Undo" onClick={() => execCmd('undo')} />
          <ToolbarButton icon={Redo} title="Redo" onClick={() => execCmd('redo')} />
        </div>

        {/* Insert Toolbar */}
        <div className="flex items-center gap-1 p-1.5 overflow-x-auto bg-slate-50/50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 select-none">Insert:</span>
          <ToolbarButton icon={TableIcon} title="Table" onClick={handleInsertTable} />
          <ToolbarButton icon={ImageIcon} title="Image" onClick={handleInsertImage} />
          <ToolbarButton icon={Shapes} title="Horizontal Rule" onClick={() => execCmd('insertHorizontalRule')} />
          <ToolbarButton icon={BarChart} title="Chart" onClick={() => execCmd('insertHTML', '<div style="background:#f0f9ff; border:1px dashed #0ea5e9; padding:20px; text-align:center; margin:10px 0; color:#0284c7;">Chart Placeholder</div>')} />
          <ToolbarButton icon={Type} title="Art Text" onClick={() => execCmd('formatBlock', 'H1')} />
          <ToolbarSeparator />
          <ToolbarButton icon={Calendar} title="Date" onClick={() => execCmd('insertText', new Date().toLocaleDateString())} />
          <ToolbarButton icon={Clock} title="Time" onClick={() => execCmd('insertText', new Date().toLocaleTimeString())} />
          <ToolbarButton icon={LinkIcon} title="Link" onClick={handleLink} />
          <ToolbarButton icon={Bookmark} title="Bookmark" onClick={() => execCmd('createBookmark', prompt('Bookmark Name:') || 'bookmark')} />
          <ToolbarButton icon={StickyNote} title="Note" onClick={() => execCmd('insertHTML', '<div style="background:#fef9c3; border-left:4px solid #eab308; padding:10px; margin:10px 0;">Note: </div>')} />
          <ToolbarSeparator />
          <ToolbarButton icon={Scissors} title="Cut" onClick={() => execCmd('cut')} />
          <ToolbarButton icon={Copy} title="Copy" onClick={() => execCmd('copy')} />
          <ToolbarButton icon={Clipboard} title="Paste" onClick={() => navigator.clipboard.readText().then(t => execCmd('insertText', t))} />
        </div>
      </div>

      {/* Document Canvas */}
      <div className="flex-1 overflow-auto bg-slate-200/50 p-8 flex justify-center relative">
        <div 
          ref={contentRef}
          className="bg-white shadow-xl min-h-[1000px] w-[800px] p-[2.54cm] outline-none text-slate-900"
          contentEditable
          style={{ 
            transform: `scale(${zoom/100})`, 
            transformOrigin: 'top center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0,0,0,0.05)'
          }}
        >
          <h1 className="text-3xl font-bold mb-4">Project Proposal</h1>
          <p className="mb-4">Start typing your document here...</p>
        </div>
      </div>

      {/* Hidden Color Inputs */}
      <input 
        type="color" 
        ref={colorInputRef} 
        className="hidden" 
        onChange={(e) => execCmd('foreColor', e.target.value)} 
      />
      <input 
        type="color" 
        ref={highlightInputRef} 
        className="hidden" 
        onChange={(e) => execCmd('hiliteColor', e.target.value)} 
      />
      
      {/* Status Bar */}
      <div className="bg-white border-t border-slate-200 px-4 py-1 flex justify-between items-center text-[10px] text-slate-500 shrink-0 z-20">
        <div className="flex gap-4">
          <span>Page 1 of 1</span>
          <span>0 words</span>
          <span>English (US)</span>
        </div>
        <div className="flex gap-4">
          <span>Print Layout</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

const PresentationEditor: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [zoom, setZoom] = useState(100);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const highlightInputRef = useRef<HTMLInputElement>(null);
  
  // File management state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [fileName, setFileName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [presentationData, setPresentationData] = useState({ slides: [{ title: 'New Presentation', content: '' }] });
  
  // Load files and folders from localStorage
  const [files, setFiles] = useState<SavedFile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FILES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [folders, setFolders] = useState<SavedFolder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FOLDERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  // Save files and folders to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(files));
  }, [files]);
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders));
  }, [folders]);
  
  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
  };

  const handleNew = () => {
    if (confirm('Create new presentation? Unsaved changes will be lost.')) {
      setPresentationData({ slides: [{ title: 'New Presentation', content: '' }] });
    }
  };

  const handleSave = () => setShowSaveDialog(true);
  
  const confirmSave = () => {
    const name = fileName.trim() || 'Untitled Presentation';
    const newFile: SavedFile = {
      id: generateId(),
      name,
      type: 'presentation',
      content: JSON.stringify(presentationData),
      folderId: selectedFolder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFiles(prev => [...prev, newFile]);
    setShowSaveDialog(false);
    setFileName('');
  };
  
  const handleOpen = () => setShowOpenDialog(true);
  
  const loadFile = (file: SavedFile) => {
    try {
      const content = JSON.parse(file.content);
      setPresentationData(content);
    } catch (e) {
      console.error('Error loading file:', e);
    }
    setShowOpenDialog(false);
  };
  
  const handleNewFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: SavedFolder = {
        id: generateId(),
        name: newFolderName.trim(),
        parentId: null,
        createdAt: new Date().toISOString(),
      };
      setFolders(prev => [...prev, newFolder]);
      setShowNewFolderDialog(false);
      setNewFolderName('');
    }
  };

  const handlePrint = () => window.print();

  const handleInsertImage = () => {
    const url = prompt('Enter image URL:', 'https://source.unsplash.com/random/800x600');
    if (url) execCmd('insertImage', url);
  };

  const handleLink = () => {
    const url = prompt('Enter link URL:');
    if (url) execCmd('createLink', url);
  };

  const handleColorClick = (type: 'foreColor' | 'hiliteColor') => {
    if (type === 'foreColor' && colorInputRef.current) colorInputRef.current.click();
    if (type === 'hiliteColor' && highlightInputRef.current) highlightInputRef.current.click();
  };
  
  const ToolbarButton = ({ icon: Icon, title, onClick }: { icon: any, title: string, onClick?: () => void }) => (
    <button 
      className="p-1.5 text-slate-600 hover:bg-slate-100 hover:text-orange-600 rounded transition-colors" 
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      <Icon size={18} />
    </button>
  );

  const ToolbarSeparator = () => <div className="w-px h-5 bg-slate-200 mx-1" />;

  return (
    <div className="h-full flex flex-col bg-slate-50 text-slate-900 overflow-hidden relative font-sans">
      {/* Toolbars */}
      <div className="bg-slate-50 border-b border-slate-200 flex flex-col shadow-sm z-10">
        {/* Standard Toolbar */}
        <div className="flex items-center gap-1 p-1.5 border-b border-slate-200/60 overflow-x-auto">
          <button onClick={onBack} className="p-1.5 hover:bg-slate-200 rounded text-slate-600 mr-1" title="Back">
            <ArrowLeft size={18} />
          </button>
          <ToolbarSeparator />
          <ToolbarButton icon={FilePlus} title="New Slide" onClick={handleNew} />
          <ToolbarButton icon={FolderOpen} title="Open" onClick={handleOpen} />
          <ToolbarButton icon={Save} title="Save" onClick={handleSave} />
          <ToolbarButton icon={FileDown} title="Export PDF" onClick={handlePrint} />
          <ToolbarButton icon={Printer} title="Print" onClick={handlePrint} />
          <ToolbarButton icon={Eye} title="Preview" onClick={() => alert('Preview Mode')} />
          <ToolbarSeparator />
          <ToolbarButton icon={Scissors} title="Cut" onClick={() => execCmd('cut')} />
          <ToolbarButton icon={Copy} title="Copy" onClick={() => execCmd('copy')} />
          <ToolbarButton icon={Clipboard} title="Paste" onClick={() => navigator.clipboard.readText().then(t => execCmd('insertText', t))} />
          <ToolbarSeparator />
          <ToolbarButton icon={Undo} title="Undo" onClick={() => execCmd('undo')} />
          <ToolbarButton icon={Redo} title="Redo" onClick={() => execCmd('redo')} />
          <ToolbarSeparator />
          <div className="flex items-center gap-1 bg-white border border-slate-300 rounded px-1">
             <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-1 hover:bg-slate-100 rounded"><Minimize2 size={12} /></button>
             <span className="text-xs w-8 text-center select-none">{zoom}%</span>
             <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-1 hover:bg-slate-100 rounded"><Maximize2 size={12} /></button>
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 p-1.5 border-b border-slate-200/60 overflow-x-auto">
          <select className="h-7 text-xs border border-slate-300 rounded px-2 bg-white outline-none w-32 cursor-pointer">
            {STANDARD_FONTS.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
          <select className="h-7 text-xs border border-slate-300 rounded px-2 bg-white outline-none w-16 cursor-pointer">
            <option>12</option>
            <option>14</option>
            <option>18</option>
            <option>24</option>
            <option>36</option>
            <option>48</option>
            <option>60</option>
          </select>
          <ToolbarSeparator />
          <ToolbarButton icon={Bold} title="Bold" onClick={() => execCmd('bold')} />
          <ToolbarButton icon={Italic} title="Italic" onClick={() => execCmd('italic')} />
          <ToolbarButton icon={Underline} title="Underline" onClick={() => execCmd('underline')} />
          <ToolbarButton icon={Strikethrough} title="Strikethrough" onClick={() => execCmd('strikeThrough')} />
          <ToolbarSeparator />
          <ToolbarButton icon={AlignLeft} title="Align Left" onClick={() => execCmd('justifyLeft')} />
          <ToolbarButton icon={AlignCenter} title="Align Center" onClick={() => execCmd('justifyCenter')} />
          <ToolbarButton icon={AlignRight} title="Align Right" onClick={() => execCmd('justifyRight')} />
          <ToolbarButton icon={AlignJustify} title="Justify" onClick={() => execCmd('justifyFull')} />
          <ToolbarSeparator />
          <ToolbarButton icon={List} title="Bullet List" onClick={() => execCmd('insertUnorderedList')} />
          <ToolbarButton icon={ListOrdered} title="Numbered List" onClick={() => execCmd('insertOrderedList')} />
          <ToolbarSeparator />
          <ToolbarButton icon={Baseline} title="Text Color" onClick={() => handleColorClick('foreColor')} />
          <ToolbarButton icon={Highlighter} title="Highlight Color" onClick={() => handleColorClick('hiliteColor')} />
        </div>

        {/* Insert Toolbar */}
        <div className="flex items-center gap-1 p-1.5 overflow-x-auto bg-slate-50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 select-none">Insert:</span>
          <ToolbarButton icon={ImageIcon} title="Image" onClick={handleInsertImage} />
          <ToolbarButton icon={Shapes} title="Shape" onClick={() => execCmd('insertHTML', '<div style="width:100px;height:100px;background:red;display:inline-block;"></div>')} />
          <ToolbarButton icon={Type} title="Text Box" onClick={() => execCmd('insertHTML', '<div style="border:1px solid #ccc;padding:10px;display:inline-block;">Text Box</div>')} />
          <ToolbarButton icon={BarChart} title="Chart" onClick={() => execCmd('insertHTML', '<img src="https://quickchart.io/chart?c={type:%27bar%27,data:{labels:[1,2,3],datasets:[{data:[1,2,3]}]}}" />')} />
          <ToolbarButton icon={TableIcon} title="Table" onClick={() => execCmd('insertHTML', '<table border="1"><tr><td>Cell</td></tr></table>')} />
          <ToolbarSeparator />
          <ToolbarButton icon={LinkIcon} title="Link" onClick={handleLink} />
          <ToolbarButton icon={StickyNote} title="Note" onClick={() => execCmd('insertHTML', '<div style="background:#ffeb3b;padding:5px;">Note</div>')} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slides Sidebar */}
        <div className="w-48 bg-slate-200 border-r border-slate-300 overflow-y-auto p-4 flex flex-col gap-4 shrink-0">
            {[1, 2, 3].map(i => (
                <div key={i} className={`aspect-video bg-white shadow-sm rounded border-2 ${i === 1 ? 'border-orange-500' : 'border-transparent'} flex items-center justify-center text-xs text-slate-300 cursor-pointer hover:border-orange-300 relative group`}>
                    <span className="absolute top-1 left-1 text-[10px] text-slate-400 font-bold">{i}</span>
                    Slide {i}
                </div>
            ))}
            <button className="w-full py-2 border-2 border-dashed border-slate-300 rounded text-slate-500 hover:border-orange-400 hover:text-orange-600 transition-colors text-xs font-bold uppercase">
                + New Slide
            </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-slate-100 overflow-auto flex items-center justify-center p-8">
            <div 
                className="aspect-video bg-white shadow-2xl w-full max-w-5xl rounded-sm p-16 flex flex-col items-center justify-center text-center relative"
                style={{ transform: `scale(${zoom/100})` }}
            >
                <div className="border-2 border-dashed border-transparent hover:border-slate-200 p-4 rounded w-full">
                    <h1 className="text-6xl font-bold text-slate-900 mb-4 outline-none" contentEditable suppressContentEditableWarning>Click to add title</h1>
                </div>
                <div className="border-2 border-dashed border-transparent hover:border-slate-200 p-4 rounded w-full">
                    <p className="text-2xl text-slate-500 outline-none" contentEditable suppressContentEditableWarning>Click to add subtitle</p>
                </div>
            </div>
        </div>
      </div>
      
      {/* Hidden Color Inputs */}
      <input 
        type="color" 
        ref={colorInputRef} 
        className="hidden" 
        onChange={(e) => execCmd('foreColor', e.target.value)} 
      />
      <input 
        type="color" 
        ref={highlightInputRef} 
        className="hidden" 
        onChange={(e) => execCmd('hiliteColor', e.target.value)} 
      />
      
      {/* Status Bar */}
      <div className="bg-white border-t border-slate-200 px-4 py-1 flex justify-between items-center text-[10px] text-slate-500 shrink-0 z-20">
        <div className="flex gap-4">
          <span>Slide 1 of 3</span>
          <span>English (US)</span>
        </div>
        <div className="flex gap-4">
          <span>Notes</span>
          <span>Comments</span>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Save Presentation</h3>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Presentation name"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowSaveDialog(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={confirmSave} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Open Dialog */}
      {showOpenDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Open Presentation</h3>
              <button onClick={() => setShowOpenDialog(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-600 mb-2">Presentations</h4>
                <div className="grid gap-2">
                  {files.filter(f => !f.folderId && f.type === 'presentation').map(file => {
                    const Icon = getFileIcon(file.type);
                    return (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg group">
                        <button onClick={() => loadFile(file)} className="flex items-center gap-3 flex-1">
                          <Icon size={20} className="text-orange-600" />
                          <span className="font-medium text-slate-700">{file.name}</span>
                          <span className="text-xs text-slate-400">{new Date(file.updatedAt).toLocaleDateString()}</span>
                        </button>
                        <button onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                  {files.filter(f => !f.folderId && f.type === 'presentation').length === 0 && <p className="text-slate-400 text-sm italic">No saved presentations</p>}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-slate-600">Folders</h4>
                  <button onClick={() => setShowNewFolderDialog(true)} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                    <FolderPlus size={16} /> New Folder
                  </button>
                </div>
                <div className="grid gap-2">
                  {folders.map(folder => (
                    <div key={folder.id} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Folder size={20} className="text-amber-500" />
                          <span className="font-medium text-slate-700">{folder.name}</span>
                        </div>
                        <button onClick={() => setFolders(prev => prev.filter(f => f.id !== folder.id))} className="p-1 hover:bg-red-100 rounded text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="pl-7 grid gap-1">
                        {files.filter(f => f.folderId === folder.id && f.type === 'presentation').map(file => {
                          const Icon = getFileIcon(file.type);
                          return (
                            <div key={file.id} className="flex items-center justify-between p-2 hover:bg-white rounded group">
                              <button onClick={() => loadFile(file)} className="flex items-center gap-2 flex-1">
                                <Icon size={16} className="text-orange-600" />
                                <span className="text-sm text-slate-600">{file.name}</span>
                              </button>
                              <button onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded text-red-500">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">New Folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewFolderDialog(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleNewFolder} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ActivityCreation: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'spreadsheet' | 'presentation' | 'document' | null>(null);

  if (activeTool === 'spreadsheet') {
    return <SpreadsheetEditor onBack={() => setActiveTool(null)} />;
  }
  
  if (activeTool === 'presentation') {
    return <PresentationEditor onBack={() => setActiveTool(null)} />;
  }

  if (activeTool === 'document') {
    return <DocumentEditor onBack={() => setActiveTool(null)} />;
  }

  return (
    <div className="h-full p-8 overflow-y-auto bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
        <motion.div 
            whileHover={{ y: -4 }}
            onClick={() => setActiveTool('spreadsheet')}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-all group"
        >
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileSpreadsheet size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Spreadsheet</h3>
            <p className="text-sm text-slate-500">Advanced sheet editor for data analysis.</p>
        </motion.div>

        <motion.div 
            whileHover={{ y: -4 }}
            onClick={() => setActiveTool('document')}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-all group"
        >
            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                <FileText size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Document Writer</h3>
            <p className="text-sm text-slate-500">Professional word processing.</p>
        </motion.div>

        <motion.div 
            whileHover={{ y: -4 }}
            onClick={() => setActiveTool('presentation')}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-all group"
        >
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <Presentation size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Presentation Creator</h3>
            <p className="text-sm text-slate-500">Create stunning presentations with ease.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default ActivityCreation;