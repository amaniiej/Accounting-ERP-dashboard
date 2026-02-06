
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Printer, Send, Plus, Trash2, User, Briefcase, Building2, X, 
  PenTool, Image as ImageIcon, Smartphone, Mail, Scale, Upload, Pencil,
  Banknote, FileText, Landmark, FileSignature, Ship, DollarSign, Users,
  Lock, FileCheck, Calculator, Calendar, AlertCircle, ChevronRight, Camera,
  Eye, FileUp, Shield, Globe, Anchor, Plane, Truck, Package,
  TrendingUp, CheckCircle, Clock, FileSpreadsheet, Download, Receipt,
  Minus, Plus as PlusIcon, Type, Copy
} from 'lucide-react';

// ============================================================================
// TYPES & STRICT INTERFACES
// ============================================================================

interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  suppliedQty?: number;
  consumedQty?: number;
}

interface DocumentEditableFields {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  clientId: string;
  clientName: string;
  faydaNumber?: string;
  clientAddress: string;
  clientTIN: string;
  currency: "ETB";
  taxRate: number;
  discountGlobal: number;
  paymentTerms: string;
  bankDetails: string;
  notesLegales: string;
  contractDuration?: string;
  employeePosition?: string;
  employeeDepartment?: string;
  leaveStartDate?: string;
  leaveEndDate?: string;
  propertyAddress?: string;
  monthlyRent?: number;
  inventoryCategory?: string;
  waybillDestination?: string;
  waybillCarrier?: string;
  companyName: string;
  companyAddress: string;
  companyTIN: string;
  companyPhone: string;
  companyDepartment: string;
  docTitle: string;
  labelBillTo: string;
  labelPayment: string;
  labelDueDate: string;
  labelSubtotal: string;
  labelDiscount: string;
  labelTax: string;
  labelTotal: string;
  labelDescription: string;
  labelQty: string;
  labelUnitPrice: string;
  labelTotalLine: string;
  labelBeneficiary: string;
  labelFinancialDetails: string;
  labelAmount: string;
  labelInWords: string;
  labelReason: string;
  labelEmployeeName: string;
  labelEmployeeID: string;
  labelPosition: string;
  labelDepartment: string;
  labelBaseSalary: string;
  labelOvertime: string;
  labelTotalGains: string;
  labelIncomeTax: string;
  labelSocialSecurity: string;
  labelTotalDeductions: string;
  labelNetPay: string;
  labelContractType: string;
  labelArticle1: string;
  labelArticle2: string;
  labelArticle3: string;
  labelArticle4: string;
  labelEmployer: string;
  labelEmployee: string;
  labelLeaveType: string;
  labelLeaveReason: string;
  labelLessor: string;
  labelTenant: string;
  labelPropertyAddress: string;
  labelPropertyType: string;
  labelSurface: string;
  labelMonthlyRent: string;
  labelDeposit: string;
  labelDuration: string;
  labelSender: string;
  labelCarrier: string;
  labelDestination: string;
  labelMerchandise: string;
  labelWeight: string;
  labelVolume: string;
  labelSignatureSender: string;
  labelSignatureCarrier: string;
  labelInventoryCategory: string;
  labelLastInventory: string;
  labelTheoreticalStock: string;
  labelRealStock: string;
  labelVariance: string;
  labelInventoryBy: string;
  labelVerifiedBy: string;
  labelNDATitle: string;
  labelBetween: string;
  labelAnd: string;
  labelArticle1Title: string;
  labelArticle1Content: string;
  labelKYCFormTitle: string;
  labelKYCInstructions: string;
  labelCompanyInfo: string;
  labelContactInfo: string;
  footerText: string;
  generatedBy: string;
  pageLabel: string;
  ofLabel: string;
}

interface DraggableElement {
  id: string;
  type: 'signature' | 'stamp';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale?: number;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  encryptedData: string;
  category: string;
  status: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const DOCUMENT_TYPES = [
  { id: 'facture-fiscale', label: 'Tax Invoice (VAT Invoice)', category: 'I. COMMERCIAL DOCUMENTS' },
  { id: 'devis-proforma', label: 'Quote / Proforma', category: 'I. COMMERCIAL DOCUMENTS' },
  { id: 'bon-commande', label: 'Purchase Order', category: 'I. COMMERCIAL DOCUMENTS' },
  { id: 'bon-livraison', label: 'Delivery Note', category: 'I. COMMERCIAL DOCUMENTS' },
  { id: 'recu-caisse', label: 'Cash Receipt', category: 'I. COMMERCIAL DOCUMENTS' },
  { id: 'note-credit', label: 'Credit Note', category: 'II. FINANCE & TREASURY' },
  { id: 'note-frais', label: 'Expense Claim Form', category: 'II. FINANCE & TREASURY' },
  { id: 'demande-paiement', label: 'Payment Request', category: 'II. FINANCE & TREASURY' },
  { id: 'journal-ventes', label: 'Sales Journal', category: 'II. FINANCE & TREASURY' },
  { id: 'avis-virement', label: 'Bank Transfer Advice', category: 'II. FINANCE & TREASURY' },
  { id: 'bulletin-paie', label: 'Payslip', category: 'III. HUMAN RESOURCES' },
  { id: 'contrat-travail', label: 'Employment Contract', category: 'III. HUMAN RESOURCES' },
  { id: 'certificat-travail', label: 'Certificate of Service', category: 'III. HUMAN RESOURCES' },
  { id: 'demande-conge', label: 'Leave Request', category: 'III. HUMAN RESOURCES' },
  { id: 'avertissement', label: 'Formal Warning', category: 'III. HUMAN RESOURCES' },
  { id: 'fiche-inventaire', label: 'Inventory Sheet', category: 'IV. LOGISTICS & ADMINISTRATION' },
  { id: 'contrat-bail', label: 'Lease Agreement', category: 'IV. LOGISTICS & ADMINISTRATION' },
  { id: 'lettre-transport', label: 'Waybill / Bill of Lading', category: 'IV. LOGISTICS & ADMINISTRATION' },
  { id: 'nda', label: 'Non-Disclosure Agreement', category: 'IV. LOGISTICS & ADMINISTRATION' },
  { id: 'kyc', label: 'KYC Form', category: 'IV. LOGISTICS & ADMINISTRATION' },
];

const STANDARD_FONTS = [
  'Satoshi', 'Aeonik', 'Arial', 'Times New Roman', 'Calibri', 'Helvetica', 'Georgia',
  'Cambria', 'Garamond', 'Verdana', 'Roboto', 'Open Sans',
  'Lato', 'Montserrat', 'Inter', 'Poppins', 'Source Sans Pro',
  'Bookman Old Style', 'Century Gothic', 'Trebuchet MS', 'Segoe UI', 'system-ui'
];

// ============================================================================
// UI PRIMITIVE COMPONENTS
// ============================================================================

const SecureInput: React.FC<{
  label: string;
  value: string | number;
  onChange?: (val: any) => void;
  readOnly?: boolean;
  type?: string;
  required?: boolean;
  encrypted?: boolean;
  placeholder?: string;
  fontFamily?: string;
}> = ({ label, value, onChange, readOnly, type = "text", required, encrypted, placeholder, fontFamily }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-600 flex items-center gap-2" style={{ fontFamily: fontFamily || 'inherit' }}>
      {label}
      {required && <span className="text-red-500">*</span>}
      {encrypted && <Lock size={10} className="text-amber-500" />}
      {readOnly && <span className="text-[10px] bg-slate-200 px-1.5 rounded text-slate-500">ERP</span>}
    </label>
    <input
      type={type}
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange?.(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
      placeholder={placeholder}
      style={{ fontFamily: fontFamily || 'inherit' }}
      className={`w-full p-2.5 text-sm border rounded-lg outline-none transition-all ${
        readOnly 
          ? 'bg-slate-100/80 border-slate-200 text-slate-600' 
          : 'bg-white/80 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
      }`}
    />
  </div>
);

const SignatureCanvas: React.FC<{
  onSave: (data: string) => void;
  label?: string;
  existing?: string;
  fontFamily?: string;
}> = ({ onSave, label, existing, fontFamily }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!existing);

  useEffect(() => {
    if (existing && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const img = new Image();
      img.onload = () => ctx?.drawImage(img, 0, 0);
      img.src = existing;
    }
  }, [existing]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current && hasSignature) {
      onSave(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="text-xs font-semibold text-slate-600 flex justify-between" style={{ fontFamily: fontFamily || 'inherit' }}>
          <span>{label}</span>
          {hasSignature && <span className="text-green-600 flex items-center gap-1"><CheckCircle size={10}/> Captured</span>}
        </label>
      )}
      <div className="relative border-2 border-slate-300 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={300}
          height={100}
          className="w-full touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {hasSignature && (
          <button 
            onClick={clear}
            className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
          >
            <Trash2 size={14}/>
          </button>
        )}
      </div>
    </div>
  );
};

const FileDropZone: React.FC<{
  label: string;
  required?: boolean;
  acceptedTypes?: string;
  onUpload: (file: UploadedFile) => void;
  existingFile?: UploadedFile;
  fontFamily?: string;
}> = ({ label, required, onUpload, existingFile, acceptedTypes, fontFamily }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<UploadedFile | undefined>(existingFile);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) processFile(droppedFile);
  };

  const processFile = (rawFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const encrypted = e.target?.result as string;
      const newFile: UploadedFile = {
        id: `file_${Date.now()}`,
        name: rawFile.name,
        type: rawFile.type,
        size: rawFile.size,
        encryptedData: encrypted,
        category: 'other',
        status: 'valid'
      };
      setFile(newFile);
      onUpload(newFile);
    };
    reader.readAsDataURL(rawFile);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-600 flex items-center gap-2" style={{ fontFamily: fontFamily || 'inherit' }}>
        {label}
        {required && <span className="text-red-500">*</span>}
        {file && <CheckCircle size={12} className="text-green-500" />}
      </label>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-4 transition-all ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50/50'
        } ${file ? 'bg-green-50/30 border-green-300' : ''}`}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept={acceptedTypes}
          onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
        />
        <div className="flex flex-col items-center gap-2 text-center">
          {file ? (
            <>
              <FileCheck size={24} className="text-green-600" />
              <span className="text-xs font-medium text-green-700 truncate max-w-[200px]" style={{ fontFamily: fontFamily || 'inherit' }}>{file.name}</span>
            </>
          ) : (
            <>
              <Upload size={20} className="text-slate-400" />
              <span className="text-xs text-slate-500" style={{ fontFamily: fontFamily || 'inherit' }}>Drop file or click</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
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
// MAIN COMPONENT
// ============================================================================

interface BillsInvoicesProps {
  initialDocType?: string;
}

const BillsInvoices: React.FC<BillsInvoicesProps> = ({ initialDocType = 'facture-fiscale' }) => {
  const [selectedDocType, setSelectedDocType] = useState<string>(initialDocType);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [stampScale, setStampScale] = useState(1);
  const [selectedFont, setSelectedFont] = useState<string>('Satoshi');
  
  const [docData, setDocData] = useState<DocumentEditableFields>({
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clientId: '',
    clientName: 'Client Name',
    faydaNumber: 'FAY-0000-0000',
    clientAddress: 'Addis Ababa, Ethiopia',
    clientTIN: '0000000000',
    currency: 'ETB',
    taxRate: 0.15,
    discountGlobal: 0,
    paymentTerms: 'Net 30 Days',
    bankDetails: 'CBE: 1000123456789',
    notesLegales: '',
    contractDuration: '12 months',
    employeePosition: 'Manager',
    employeeDepartment: 'Operations',
    leaveStartDate: '',
    leaveEndDate: '',
    propertyAddress: '',
    monthlyRent: 0,
    inventoryCategory: '',
    waybillDestination: '',
    waybillCarrier: '',
    companyName: 'ABYSSINIA CYBERSEC PLC',
    companyAddress: 'Addis Ababa, Ethiopia',
    companyTIN: '0012345678',
    companyPhone: '+251 11 123 4567',
    companyDepartment: 'Human Resources Department',
    docTitle: '',
    labelBillTo: 'Bill To',
    labelPayment: 'Payment',
    labelDueDate: 'Due Date',
    labelSubtotal: 'Subtotal',
    labelDiscount: 'Discount',
    labelTax: 'VAT (15%)',
    labelTotal: 'Total (Inc. Tax)',
    labelDescription: 'Description',
    labelQty: 'Qty',
    labelUnitPrice: 'Unit Price',
    labelTotalLine: 'Total',
    labelBeneficiary: 'Beneficiary',
    labelFinancialDetails: 'Financial Details',
    labelAmount: 'Total Amount',
    labelInWords: 'In words',
    labelReason: 'Reason / Notes',
    labelEmployeeName: 'Full Name',
    labelEmployeeID: 'Employee ID / TIN',
    labelPosition: 'Position',
    labelDepartment: 'Department',
    labelBaseSalary: 'Base Salary',
    labelOvertime: 'Overtime Pay',
    labelTotalGains: 'Total Gross',
    labelIncomeTax: 'Income Tax (15%)',
    labelSocialSecurity: 'Pension / SS',
    labelTotalDeductions: 'Total Deductions',
    labelNetPay: 'NET PAY',
    labelContractType: 'Contract Nature',
    labelArticle1: 'Article 1',
    labelArticle2: 'Article 2',
    labelArticle3: 'Article 3',
    labelArticle4: 'Article 4',
    labelEmployer: 'The Employer',
    labelEmployee: 'The Employee',
    labelLeaveType: 'Leave Type',
    labelLeaveReason: 'Reason',
    labelLessor: 'Lessor',
    labelTenant: 'Tenant',
    labelPropertyAddress: 'Property Address',
    labelPropertyType: 'Property Type',
    labelSurface: 'Surface Area',
    labelMonthlyRent: 'Monthly Rent',
    labelDeposit: 'Security Deposit',
    labelDuration: 'Duration',
    labelSender: 'Sender',
    labelCarrier: 'Carrier',
    labelDestination: 'Destination',
    labelMerchandise: 'Merchandise Details',
    labelWeight: 'Weight',
    labelVolume: 'Volume',
    labelSignatureSender: 'Sender Signature',
    labelSignatureCarrier: 'Carrier Signature',
    labelInventoryCategory: 'Category',
    labelLastInventory: 'Last Movement',
    labelTheoreticalStock: 'Supplied Quantity',
    labelRealStock: 'Consumed Volume',
    labelVariance: 'Remaining Volume',
    labelInventoryBy: 'Inventoried by',
    labelVerifiedBy: 'Verified by',
    labelNDATitle: 'Non-Disclosure Agreement',
    labelBetween: 'BY AND BETWEEN',
    labelAnd: 'AND',
    labelArticle1Title: 'Article 1: Purpose',
    labelArticle1Content: 'The purpose of this agreement is to protect confidential information exchanged during the collaboration between the parties.',
    labelKYCFormTitle: 'KYC FORM (Know Your Customer)',
    labelKYCInstructions: 'This form must be completed by all new clients or partners.',
    labelCompanyInfo: 'General Information',
    labelContactInfo: 'Contact Details',
    footerText: 'Official Document',
    generatedBy: 'Generated by',
    pageLabel: 'Page',
    ofLabel: 'of',
  });

  const [lines, setLines] = useState<InvoiceLine[]>([
    { id: '1', description: 'Consulting Services', quantity: 10, unitPrice: 2500, taxRate: 0.15, suppliedQty: 100, consumedQty: 20 },
    { id: '2', description: 'Software License', quantity: 1, unitPrice: 15000, taxRate: 0.15, suppliedQty: 50, consumedQty: 5 }
  ]);

  const [draggableElements, setDraggableElements] = useState<DraggableElement[]>([]);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureTab, setSignatureTab] = useState<'draw' | 'import' | 'scan'>('draw');

  const isCommercial = ['facture-fiscale', 'devis-proforma', 'bon-commande', 'bon-livraison', 'recu-caisse'].includes(selectedDocType);
  const isFinance = ['note-credit', 'note-frais', 'demande-paiement', 'journal-ventes', 'avis-virement'].includes(selectedDocType);
  const isHR = ['bulletin-paie', 'contrat-travail', 'certificat-travail', 'demande-conge', 'avertissement'].includes(selectedDocType);
  const isLogistics = ['fiche-inventaire', 'contrat-bail', 'lettre-transport', 'nda', 'kyc'].includes(selectedDocType);

  const totals = useMemo(() => {
    const subtotal = lines.reduce((acc, line) => acc + (line.quantity * line.unitPrice), 0);
    const discountAmount = (subtotal * docData.discountGlobal) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = lines.reduce((acc, line) => {
      const lineTotal = line.quantity * line.unitPrice;
      const lineDiscount = (lineTotal * docData.discountGlobal) / 100;
      return acc + ((lineTotal - lineDiscount) * line.taxRate);
    }, 0);
    const total = taxableAmount + taxAmount;
    return { subtotal, discountAmount, taxableAmount, taxAmount, total };
  }, [lines, docData.discountGlobal]);

  const handlePrint = () => window.print();

  const handleExportPDF = () => {
    document.body.classList.add('printing-pdf');
    window.print();
    document.body.classList.remove('printing-pdf');
  };

  const handleDocTypeChange = (typeId: string) => {
    setSelectedDocType(typeId);
    const docType = DOCUMENT_TYPES.find(d => d.id === typeId);
    if (docType) {
      const prefix = docType.id === 'facture-fiscale' ? 'INV' : 
                     docType.id === 'devis-proforma' ? 'QT' :
                     docType.id === 'bon-commande' ? 'PO' :
                     docType.id === 'bon-livraison' ? 'DO' :
                     docType.id === 'recu-caisse' ? 'REC' :
                     docType.id === 'note-credit' ? 'CN' :
                     docType.id === 'bulletin-paie' ? 'PAY' :
                     docType.id === 'contrat-travail' ? 'EC' :
                     docType.id === 'certificat-travail' ? 'CERT' :
                     docType.id === 'demande-conge' ? 'LEV' :
                     docType.id === 'avertissement' ? 'WARN' :
                     docType.id === 'fiche-inventaire' ? 'STK' :
                     docType.id === 'contrat-bail' ? 'LSE' :
                     docType.id === 'lettre-transport' ? 'WB' :
                     docType.id === 'nda' ? 'NDA' :
                     docType.id === 'kyc' ? 'KYC' : 'DOC';
      
      setDocData(prev => ({
        ...prev,
        invoiceNumber: `${prefix}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
      }));
    }
  };

  const addLine = () => {
    setLines([...lines, { id: Date.now().toString(), description: 'New Item', quantity: 1, unitPrice: 0, taxRate: 0.15, suppliedQty: 0, consumedQty: 0 }]);
  };

  const updateLine = (id: string, field: keyof InvoiceLine, value: any) => {
    setLines(lines.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const removeLine = (id: string) => {
    setLines(lines.filter(l => l.id !== id));
  };

  const addDraggableElement = (type: 'signature' | 'stamp', content: string) => {
    setDraggableElements(prev => [...prev, {
      id: Date.now().toString(),
      type,
      content,
      x: 50,
      y: 80,
      width: type === 'stamp' ? 150 * stampScale : 150,
      height: type === 'stamp' ? 150 * stampScale : 80,
      scale: 1
    }]);
    setShowSignatureModal(false);
  };

  const updateElementScale = (id: string, newScale: number) => {
    setDraggableElements(prev => prev.map(el => {
      if (el.id === id) {
        return {
          ...el,
          scale: newScale,
          width: el.type === 'stamp' ? 150 * newScale : el.width,
          height: el.type === 'stamp' ? 150 * newScale : el.height
        };
      }
      return el;
    }));
  };

  const handleDragStart = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = draggableElements.find(el => el.id === id);
    if (!element) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = element.x;
    const startTop = element.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      const containerWidth = document.getElementById('a4-container')?.clientWidth || 794;
      const containerHeight = document.getElementById('a4-container')?.clientHeight || 1123;

      const newX = Math.max(0, Math.min(100, startLeft + (deltaX / containerWidth) * 100));
      const newY = Math.max(0, Math.min(100, startTop + (deltaY / containerHeight) * 100));

      setDraggableElements(prev => prev.map(el => el.id === id ? { ...el, x: newX, y: newY } : el));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const generateStamp = () => {
    const canvas = document.createElement('canvas');
    const size = 350;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);

    // Outer circle
    ctx.beginPath();
    ctx.arc(size/2, size/2, 165, 0, 2 * Math.PI);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#1e3a8a';
    ctx.stroke();

    // Inner circle
    ctx.beginPath();
    ctx.arc(size/2, size/2, 150, 0, 2 * Math.PI);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#1e3a8a';
    ctx.stroke();

    // Company name - centered in the stamp (LARGER)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1e3a8a';
    ctx.font = `bold 22px ${selectedFont}, Arial`;
    
    const companyName = docData.companyName.toUpperCase();
    // Adjust font size for longer names
    if (companyName.length > 20) {
      ctx.font = `bold 18px ${selectedFont}, Arial`;
    }
    ctx.fillText(companyName.substring(0, 30), size/2, size/2 - 50);

    // Date inside the circle - International format
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).split('/').join('/');
    ctx.font = `bold 14px ${selectedFont}, Arial`;
    ctx.fillText(dateStr, size/2, size/2 - 22);

    // Company address (LARGER)
    const companyAddress = docData.companyAddress.length > 35 
      ? docData.companyAddress.substring(0, 35) + '...' 
      : docData.companyAddress;
    ctx.font = `13px ${selectedFont}, Arial`;
    ctx.fillText(companyAddress, size/2, size/2 + 5);

    // Separator line
    ctx.beginPath();
    ctx.moveTo(size/2 - 50, size/2 + 20);
    ctx.lineTo(size/2 + 50, size/2 + 20);
    ctx.lineWidth = 1;
    ctx.stroke();

    // TIN - Ethiopian format (LARGER)
    ctx.font = `bold 14px ${selectedFont}, Arial`;
    ctx.fillText(`TIN: ${docData.companyTIN}`, size/2, size/2 + 42);

    // Phone (LARGER)
    ctx.font = `12px ${selectedFont}, Arial`;
    ctx.fillText(`Tel: ${docData.companyPhone}`, size/2, size/2 + 62);

    // Add decorative stars at top and bottom
    ctx.font = '14px Arial';
    ctx.fillText('*', size/2, size/2 - 65);
    ctx.fillText('*', size/2, size/2 + 70);

    addDraggableElement('stamp', canvas.toDataURL());
  };

  const handleLogoUpload = (file: UploadedFile) => {
    setLogoImage(file.encryptedData);
    setShowLogoModal(false);
  };

  const getDocumentTitle = () => {
    const doc = DOCUMENT_TYPES.find(d => d.id === selectedDocType);
    return doc ? doc.label.split('(')[0].trim() : 'Document';
  };

  const EditableText: React.FC<{
    value: string;
    onChange: (val: string) => void;
    className?: string;
    style?: React.CSSProperties;
    multiline?: boolean;
    fontFamily?: string;
  }> = ({ value, onChange, className = '', style = {}, multiline = false, fontFamily }) => {
    const font = fontFamily || selectedFont;
    if (multiline) {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`bg-transparent outline-none focus:text-blue-600 resize-none w-full ${className}`}
          style={{ fontFamily: font, ...style }}
          rows={2}
        />
      );
    }
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`bg-transparent outline-none focus:text-blue-600 w-full ${className}`}
        style={{ fontFamily: font, ...style }}
      />
    );
  };

  const renderDocumentContent = () => {
    if (isCommercial) {
      return (
        <>
          <header className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center font-bold text-xl rounded cursor-pointer hover:bg-slate-700 transition-colors overflow-hidden relative group"
                onClick={() => setShowLogoModal(true)}
              >
                {logoImage ? (
                  <img src={logoImage} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs" style={{ fontFamily: selectedFont }}>LOGO</span>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload size={20} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: selectedFont }}>
                  <EditableText 
                    value={docData.companyName} 
                    onChange={(v) => setDocData({...docData, companyName: v})}
                    className="font-black uppercase"
                  />
                </h2>
                <p className="text-sm text-slate-500" style={{ fontFamily: selectedFont }}>
                  <EditableText 
                    value={docData.companyAddress} 
                    onChange={(v) => setDocData({...docData, companyAddress: v})}
                  />
                </p>
                <p className="text-sm text-slate-500 font-mono" style={{ fontFamily: selectedFont }}>
                  TIN: <EditableText 
                    value={docData.companyTIN} 
                    onChange={(v) => setDocData({...docData, companyTIN: v})}
                    className="font-mono"
                  />
                </p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-4xl font-black text-slate-200 uppercase tracking-widest" style={{ fontFamily: selectedFont }}>
                <EditableText 
                  value={docData.docTitle || getDocumentTitle()} 
                  onChange={(v) => setDocData({...docData, docTitle: v})}
                  className="text-right uppercase text-slate-200"
                />
              </h1>
              <p className="text-lg font-bold text-slate-700 mt-1" style={{ fontFamily: selectedFont }}>#{docData.invoiceNumber}</p>
              <p className="text-sm text-slate-500" style={{ fontFamily: selectedFont }}>Date: {docData.issueDate}</p>
            </div>
          </header>

          <div className="mb-10 flex justify-between">
            <div className="w-1/2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2" style={{ fontFamily: selectedFont }}>
                <EditableText 
                  value={docData.labelBillTo} 
                  onChange={(v) => setDocData({...docData, labelBillTo: v})}
                />
              </h3>
              <p className="font-bold text-lg" style={{ fontFamily: selectedFont }}>
                <EditableText value={docData.clientName} onChange={(v) => setDocData({...docData, clientName: v})} />
              </p>
              <p className="text-sm text-slate-600 whitespace-pre-line" style={{ fontFamily: selectedFont }}>
                <EditableText 
                  value={docData.clientAddress} 
                  onChange={(v) => setDocData({...docData, clientAddress: v})}
                  multiline
                />
              </p>
              <p className="text-sm text-slate-600 mt-1 font-mono" style={{ fontFamily: selectedFont }}>
                TIN: <EditableText 
                  value={docData.clientTIN} 
                  onChange={(v) => setDocData({...docData, clientTIN: v})}
                  className="font-mono"
                />
              </p>
            </div>
            <div className="w-1/3 text-right">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2" style={{ fontFamily: selectedFont }}>
                <EditableText 
                  value={docData.labelPayment} 
                  onChange={(v) => setDocData({...docData, labelPayment: v})}
                />
              </h3>
              <p className="text-sm font-semibold" style={{ fontFamily: selectedFont }}>{docData.paymentTerms}</p>
              <p className="text-sm text-slate-500" style={{ fontFamily: selectedFont }}>
                <EditableText 
                  value={docData.labelDueDate} 
                  onChange={(v) => setDocData({...docData, labelDueDate: v})}
                  className="inline"
                />: {docData.dueDate}
              </p>
              <p className="text-slate-600 mt-2 font-mono text-xs" style={{ fontFamily: selectedFont }}>
                <EditableText 
                  value={docData.bankDetails} 
                  onChange={(v) => setDocData({...docData, bankDetails: v})}
                  className="font-mono"
                />
              </p>
            </div>
          </div>

          <div className="flex-1">
            <table className="w-full text-left mb-8">
              <thead>
                <tr className="border-b-2 border-slate-900 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 w-1/2" style={{ fontFamily: selectedFont }}>
                    <EditableText 
                      value={docData.labelDescription} 
                      onChange={(v) => setDocData({...docData, labelDescription: v})}
                    />
                  </th>
                  <th className="py-3 text-center" style={{ fontFamily: selectedFont }}>
                    <EditableText 
                      value={docData.labelQty} 
                      onChange={(v) => setDocData({...docData, labelQty: v})}
                    />
                  </th>
                  <th className="py-3 text-right" style={{ fontFamily: selectedFont }}>
                    <EditableText 
                      value={docData.labelUnitPrice} 
                      onChange={(v) => setDocData({...docData, labelUnitPrice: v})}
                    />
                  </th>
                  <th className="py-3 text-right" style={{ fontFamily: selectedFont }}>
                    <EditableText 
                      value={docData.labelTotalLine} 
                      onChange={(v) => setDocData({...docData, labelTotalLine: v})}
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {lines.map((line) => (
                  <tr key={line.id} className="border-b border-slate-100 group">
                    <td className="py-3 pr-4">
                      <input 
                        type="text" 
                        value={line.description}
                        onChange={e => updateLine(line.id, 'description', e.target.value)}
                        className="w-full bg-transparent outline-none focus:text-blue-600 font-medium"
                        style={{ fontFamily: selectedFont }}
                      />
                    </td>
                    <td className="py-3 text-center">
                      <input 
                        type="number" 
                        value={line.quantity}
                        onChange={e => updateLine(line.id, 'quantity', parseFloat(e.target.value))}
                        className="w-16 text-center bg-transparent outline-none focus:text-blue-600"
                        style={{ fontFamily: selectedFont }}
                      />
                    </td>
                    <td className="py-3 text-right font-mono">
                      <input 
                        type="number" 
                        value={line.unitPrice}
                        onChange={e => updateLine(line.id, 'unitPrice', parseFloat(e.target.value))}
                        className="w-24 text-right bg-transparent outline-none focus:text-blue-600"
                        style={{ fontFamily: selectedFont }}
                      />
                    </td>
                    <td className="py-3 text-right font-mono font-bold" style={{ fontFamily: selectedFont }}>
                      {(line.quantity * line.unitPrice).toLocaleString()}
                    </td>
                    <td className="w-8 text-center opacity-0 group-hover:opacity-100 print:hidden">
                      <button onClick={() => removeLine(line.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={addLine} className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 print:hidden mb-8" style={{ fontFamily: selectedFont }}>
              <Plus size={14} /> Add line
            </button>
          </div>

          <div className="flex justify-end mb-12">
            <div className="w-1/2 space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span style={{ fontFamily: selectedFont }}>
                  <EditableText 
                    value={docData.labelSubtotal} 
                    onChange={(v) => setDocData({...docData, labelSubtotal: v})}
                  />
                </span>
                <span className="font-mono" style={{ fontFamily: selectedFont }}>{totals.subtotal.toLocaleString()} {docData.currency}</span>
              </div>
              {docData.discountGlobal > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span style={{ fontFamily: selectedFont }}>
                    <EditableText 
                      value={`${docData.labelDiscount} (${docData.discountGlobal}%)`} 
                      onChange={(v) => setDocData({...docData, labelDiscount: v})}
                    />
                  </span>
                  <span className="font-mono" style={{ fontFamily: selectedFont }}>-{totals.discountAmount.toLocaleString()} {docData.currency}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-slate-600">
                <span style={{ fontFamily: selectedFont }}>
                  <EditableText 
                    value={docData.labelTax} 
                    onChange={(v) => setDocData({...docData, labelTax: v})}
                  />
                </span>
                <span className="font-mono" style={{ fontFamily: selectedFont }}>{totals.taxAmount.toLocaleString()} {docData.currency}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-slate-900 border-t-2 border-slate-900 pt-3">
                <span style={{ fontFamily: selectedFont }}>
                  <EditableText 
                    value={docData.labelTotal} 
                    onChange={(v) => setDocData({...docData, labelTotal: v})}
                  />
                </span>
                <span style={{ fontFamily: selectedFont }}>{totals.total.toLocaleString()} {docData.currency}</span>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (isFinance) {
      return (
        <>
          <header className="text-center border-b-2 border-slate-900 pb-6 mb-8">
            <div className="flex justify-center mb-4">
              <div 
                className="w-20 h-20 bg-slate-900 text-white flex items-center justify-center font-bold text-2xl rounded-full cursor-pointer hover:bg-slate-700 transition-colors overflow-hidden relative group"
                onClick={() => setShowLogoModal(true)}
              >
                {logoImage ? <img src={logoImage} alt="Logo" className="w-full h-full object-contain" /> : <Landmark size={32} />}
              </div>
            </div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-widest mb-2" style={{ fontFamily: selectedFont }}>
              <EditableText 
                value={docData.docTitle || getDocumentTitle()} 
                onChange={(v) => setDocData({...docData, docTitle: v})}
                className="text-center uppercase"
              />
            </h1>
            <p className="text-lg font-mono text-slate-600" style={{ fontFamily: selectedFont }}>Ref: {docData.invoiceNumber}</p>
            <p className="text-sm text-slate-500 mt-1" style={{ fontFamily: selectedFont }}>Date: {docData.issueDate}</p>
          </header>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-2" style={{ fontFamily: selectedFont }}>
                <EditableText 
                  value={docData.labelBeneficiary} 
                  onChange={(v) => setDocData({...docData, labelBeneficiary: v})}
                />
              </h3>
              <p className="font-bold text-lg" style={{ fontFamily: selectedFont }}>
                <EditableText value={docData.clientName} onChange={(v) => setDocData({...docData, clientName: v})} />
              </p>
              <p className="text-sm text-slate-600" style={{ fontFamily: selectedFont }}>
                <EditableText value={docData.clientAddress} onChange={(v) => setDocData({...docData, clientAddress: v})} multiline />
              </p>
              <p className="text-sm font-mono mt-2" style={{ fontFamily: selectedFont }}>TIN: <EditableText value={docData.clientTIN} onChange={(v) => setDocData({...docData, clientTIN: v})} className="font-mono" /></p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-2" style={{ fontFamily: selectedFont }}>
                <EditableText 
                  value={docData.labelFinancialDetails} 
                  onChange={(v) => setDocData({...docData, labelFinancialDetails: v})}
                />
              </h3>
              <p className="text-sm" style={{ fontFamily: selectedFont }}><span className="font-semibold">Bank:</span> {docData.bankDetails}</p>
              <p className="text-sm" style={{ fontFamily: selectedFont }}><span className="font-semibold">Currency:</span> {docData.currency}</p>
              <p className="text-sm" style={{ fontFamily: selectedFont }}><span className="font-semibold">Mode:</span> {docData.paymentTerms}</p>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-blue-900 uppercase" style={{ fontFamily: selectedFont }}>
                <EditableText 
                  value={docData.labelAmount} 
                  onChange={(v) => setDocData({...docData, labelAmount: v})}
                />
              </span>
              <span className="text-3xl font-black text-blue-900" style={{ fontFamily: selectedFont }}>{totals.total.toLocaleString()} {docData.currency}</span>
            </div>
            <div className="border-t border-blue-200 pt-4">
              <p className="text-sm text-blue-800 mb-2" style={{ fontFamily: selectedFont }}>
                <span className="font-semibold">
                  <EditableText 
                    value={docData.labelInWords} 
                    onChange={(v) => setDocData({...docData, labelInWords: v})}
                    className="font-semibold"
                  />:
                </span> [Amount in words]
              </p>
              <p className="text-sm text-blue-800" style={{ fontFamily: selectedFont }}>
                <span className="font-semibold">
                  <EditableText 
                    value={docData.labelReason} 
                    onChange={(v) => setDocData({...docData, labelReason: v})}
                    className="font-semibold"
                  />:
                </span> {docData.notesLegales}
              </p>
            </div>
          </div>

          {selectedDocType === 'note-frais' && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-4" style={{ fontFamily: selectedFont }}>Expense Breakdown</h3>
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-3 text-xs font-bold" style={{ fontFamily: selectedFont }}>Date</th>
                    <th className="p-3 text-xs font-bold" style={{ fontFamily: selectedFont }}>Description</th>
                    <th className="p-3 text-xs font-bold text-right" style={{ fontFamily: selectedFont }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.id} className="border-b border-slate-100">
                      <td className="p-3 text-sm" style={{ fontFamily: selectedFont }}>{docData.issueDate}</td>
                      <td className="p-3 text-sm" style={{ fontFamily: selectedFont }}>{line.description}</td>
                      <td className="p-3 text-sm text-right font-mono" style={{ fontFamily: selectedFont }}>{(line.quantity * line.unitPrice).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      );
    }

    if (isHR) {
      return (
        <>
          <header className="border-b-2 border-slate-900 pb-6 mb-8">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center rounded cursor-pointer hover:bg-slate-700 transition-colors overflow-hidden"
                  onClick={() => setShowLogoModal(true)}
                >
                  {logoImage ? <img src={logoImage} alt="Logo" className="w-full h-full object-contain" /> : <Users size={24} />}
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase" style={{ fontFamily: selectedFont }}>
                    <EditableText value={docData.companyName} onChange={(v) => setDocData({...docData, companyName: v})} className="uppercase" />
                  </h2>
                  <p className="text-xs text-slate-500" style={{ fontFamily: selectedFont }}>
                    <EditableText value={docData.companyDepartment} onChange={(v) => setDocData({...docData, companyDepartment: v})} />
                  </p>
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-black text-slate-900 uppercase" style={{ fontFamily: selectedFont }}>
                  <EditableText value={docData.docTitle || getDocumentTitle()} onChange={(v) => setDocData({...docData, docTitle: v})} className="uppercase" />
                </h1>
                <p className="text-sm font-mono text-slate-500 mt-1" style={{ fontFamily: selectedFont }}>No. {docData.invoiceNumber}</p>
              </div>
            </div>
            
          </header>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4" style={{ fontFamily: selectedFont }}>Employee Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500" style={{ fontFamily: selectedFont }}>
                  <EditableText value={docData.labelEmployeeName} onChange={(v) => setDocData({...docData, labelEmployeeName: v})} />
                </p>
                <p className="text-lg font-bold" style={{ fontFamily: selectedFont }}>
                  <EditableText value={docData.clientName} onChange={(v) => setDocData({...docData, clientName: v})} />
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500" style={{ fontFamily: selectedFont }}>
                  <EditableText value={docData.labelEmployeeID} onChange={(v) => setDocData({...docData, labelEmployeeID: v})} />
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">FAYDA:</span>
                  <p className="text-lg font-mono font-black text-black" style={{ fontFamily: selectedFont }}>
                    <EditableText value={docData.faydaNumber || ''} onChange={(v) => setDocData({...docData, faydaNumber: v})} className="font-black text-black" />
                  </p>
                </div>
                <p className="text-lg font-mono" style={{ fontFamily: selectedFont }}>
                  <EditableText value={docData.clientTIN} onChange={(v) => setDocData({...docData, clientTIN: v})} className="font-mono" />
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500" style={{ fontFamily: selectedFont }}>
                  <EditableText value={docData.labelPosition} onChange={(v) => setDocData({...docData, labelPosition: v})} />
                </p>
                <p className="font-semibold" style={{ fontFamily: selectedFont }}>
                  <EditableText value={docData.employeePosition || ''} onChange={(v) => setDocData({...docData, employeePosition: v})} />
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500" style={{ fontFamily: selectedFont }}>
                  <EditableText value={docData.labelDepartment} onChange={(v) => setDocData({...docData, labelDepartment: v})} />
                </p>
                <p className="font-semibold" style={{ fontFamily: selectedFont }}>
                  <EditableText value={docData.employeeDepartment || ''} onChange={(v) => setDocData({...docData, employeeDepartment: v})} />
                </p>
              </div>
            </div>
          </div>

          {selectedDocType === 'bulletin-paie' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-4" style={{ fontFamily: selectedFont }}>Salary Details</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-sm mb-2 text-green-700" style={{ fontFamily: selectedFont }}>
                    <EditableText value="Earnings" onChange={(v) => {}} />
                  </h4>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="py-2" style={{ fontFamily: selectedFont }}>
                          <EditableText value={docData.labelBaseSalary} onChange={(v) => setDocData({...docData, labelBaseSalary: v})} />
                        </td>
                        <td className="text-right font-mono" style={{ fontFamily: selectedFont }}>{totals.subtotal.toLocaleString()}</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-2" style={{ fontFamily: selectedFont }}>
                          <EditableText value={docData.labelOvertime} onChange={(v) => setDocData({...docData, labelOvertime: v})} />
                        </td>
                        <td className="text-right font-mono" style={{ fontFamily: selectedFont }}>0.00</td>
                      </tr>
                      <tr className="font-bold bg-green-50">
                        <td className="py-2" style={{ fontFamily: selectedFont }}>
                          <EditableText value={docData.labelTotalGains} onChange={(v) => setDocData({...docData, labelTotalGains: v})} />
                        </td>
                        <td className="text-right font-mono" style={{ fontFamily: selectedFont }}>{totals.subtotal.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-2 text-red-700" style={{ fontFamily: selectedFont }}>Deductions</h4>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="py-2" style={{ fontFamily: selectedFont }}>
                          <EditableText value={docData.labelIncomeTax} onChange={(v) => setDocData({...docData, labelIncomeTax: v})} />
                        </td>
                        <td className="text-right font-mono text-red-600" style={{ fontFamily: selectedFont }}>{totals.taxAmount.toLocaleString()}</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-2" style={{ fontFamily: selectedFont }}>
                          <EditableText value={docData.labelSocialSecurity} onChange={(v) => setDocData({...docData, labelSocialSecurity: v})} />
                        </td>
                        <td className="text-right font-mono" style={{ fontFamily: selectedFont }}>0.00</td>
                      </tr>
                      <tr className="font-bold bg-red-50">
                        <td className="py-2" style={{ fontFamily: selectedFont }}>
                          <EditableText value={docData.labelTotalDeductions} onChange={(v) => setDocData({...docData, labelTotalDeductions: v})} />
                        </td>
                        <td className="text-right font-mono text-red-600" style={{ fontFamily: selectedFont }}>{totals.taxAmount.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-6 p-4 bg-slate-900 text-white rounded-lg flex justify-between items-center">
                <span className="font-bold" style={{ fontFamily: selectedFont }}>
                  <EditableText value={docData.labelNetPay} onChange={(v) => setDocData({...docData, labelNetPay: v})} className="text-white" />
                </span>
                <span className="text-2xl font-black font-mono" style={{ fontFamily: selectedFont }}>{totals.total.toLocaleString()} {docData.currency}</span>
              </div>
            </motion.div>
          )}

          {selectedDocType === 'contrat-travail' && (
            <div className="prose prose-sm max-w-none mb-8">
              <div className="bg-white border border-slate-300 p-6 rounded-lg font-serif">
                <h2 className="text-center font-bold text-lg mb-4 uppercase" style={{ fontFamily: selectedFont }}>
                  <EditableText value={docData.docTitle || 'Employment Contract'} onChange={(v) => setDocData({...docData, docTitle: v})} className="text-center uppercase" />
                </h2>
                <p className="mb-4 text-justify" style={{ fontFamily: selectedFont }}>
                  Between the employer <strong>
                    <EditableText value={docData.companyName} onChange={(v) => setDocData({...docData, companyName: v})} />
                  </strong>, represented by its General Manager, of the first part, and the employee <strong>
                    <EditableText value={docData.clientName} onChange={(v) => setDocData({...docData, clientName: v})} />
                  </strong>, of the second part, the following has been agreed:
                </p>
                <div className="space-y-2 text-sm">
                  <p style={{ fontFamily: selectedFont }}>
                    <strong>
                      <EditableText value={docData.labelArticle1} onChange={(v) => setDocData({...docData, labelArticle1: v})} />
                      :
                    </strong> 
                    <EditableText value={docData.labelContractType} onChange={(v) => setDocData({...docData, labelContractType: v})} /> - Contract for a duration of {docData.contractDuration}
                  </p>
                  <p style={{ fontFamily: selectedFont }}>
                    <strong>
                      <EditableText value={docData.labelArticle2} onChange={(v) => setDocData({...docData, labelArticle2: v})} />
                      :
                    </strong> Position held - {docData.employeePosition}
                  </p>
                  <p style={{ fontFamily: selectedFont }}>
                    <strong>
                      <EditableText value={docData.labelArticle3} onChange={(v) => setDocData({...docData, labelArticle3: v})} />
                      :
                    </strong> Monthly gross salary of {totals.subtotal.toLocaleString()} {docData.currency}
                  </p>
                  <p style={{ fontFamily: selectedFont }}>
                    <strong>
                      <EditableText value={docData.labelArticle4} onChange={(v) => setDocData({...docData, labelArticle4: v})} />
                      :
                    </strong> Place of work - {docData.clientAddress}
                  </p>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-8 text-center">
                  <div>
                    <p className="text-sm font-bold mb-8" style={{ fontFamily: selectedFont }}>
                      <EditableText value={docData.labelEmployer} onChange={(v) => setDocData({...docData, labelEmployer: v})} />
                    </p>
                    <p className="text-xs text-slate-500" style={{ fontFamily: selectedFont }}>Date and signature</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold mb-8" style={{ fontFamily: selectedFont }}>
                      <EditableText value={docData.labelEmployee} onChange={(v) => setDocData({...docData, labelEmployee: v})} />
                    </p>
                    <p className="text-xs text-slate-500" style={{ fontFamily: selectedFont }}>Date and signature</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedDocType === 'demande-conge' && (
            <div className="bg-white border-2 border-slate-300 p-8 rounded-lg mb-8">
              <h3 className="text-center font-bold text-lg mb-6" style={{ fontFamily: selectedFont }}>
                <EditableText value={docData.docTitle || 'LEAVE REQUEST'} onChange={(v) => setDocData({...docData, docTitle: v})} className="text-center uppercase" />
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1" style={{ fontFamily: selectedFont }}>Start Date</label>
                    <input type="date" className="w-full border border-slate-300 rounded p-2 text-sm" value={docData.leaveStartDate} onChange={e => setDocData({...docData, leaveStartDate: (e.target as HTMLInputElement).value})} style={{ fontFamily: selectedFont }} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1" style={{ fontFamily: selectedFont }}>End Date</label>
                    <input type="date" className="w-full border border-slate-300 rounded p-2 text-sm" value={docData.leaveEndDate} onChange={e => setDocData({...docData, leaveEndDate: (e.target as HTMLInputElement).value})} style={{ fontFamily: selectedFont }} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1" style={{ fontFamily: selectedFont }}>
                    <EditableText value={docData.labelLeaveType} onChange={(v) => setDocData({...docData, labelLeaveType: v})} />
                  </label>
                  <select className="w-full border border-slate-300 rounded p-2 text-sm" style={{ fontFamily: selectedFont }}>
                    <option>Annual Leave</option>
                    <option>Sick Leave</option>
                    <option>Unpaid Leave</option>
                    <option>Maternity/Paternity Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1" style={{ fontFamily: selectedFont }}>
                    <EditableText value={docData.labelLeaveReason} onChange={(v) => setDocData({...docData, labelLeaveReason: v})} />
                  </label>
                  <textarea className="w-full border border-slate-300 rounded p-2 text-sm" rows={3} placeholder="Specify the reason for your request..." style={{ fontFamily: selectedFont }}></textarea>
                </div>
              </div>
            </div>
          )}
        </>
      );
    }

    if (isLogistics) {
      return (
        <>
          <header className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-end">
            <div className="flex items-center gap-3">
              <div 
                className="w-14 h-14 bg-slate-800 text-white flex items-center justify-center rounded cursor-pointer hover:bg-slate-700 transition-colors overflow-hidden"
                onClick={() => setShowLogoModal(true)}
              >
                {logoImage ? <img src={logoImage} alt="Logo" className="w-full h-full object-contain" /> : <Package size={20} />}
              </div>
              <div>
                <h1 className="text-xl font-black uppercase text-slate-900" style={{ fontFamily: selectedFont }}>
                  <EditableText value={docData.docTitle || getDocumentTitle()} onChange={(v) => setDocData({...docData, docTitle: v})} className="uppercase" />
                </h1>
                <p className="text-xs text-slate-500 font-mono" style={{ fontFamily: selectedFont }}>REF: {docData.invoiceNumber}</p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p style={{ fontFamily: selectedFont }}>Issued: {docData.issueDate}</p>
              <p style={{ fontFamily: selectedFont }}>{docData.pageLabel} 1 {docData.ofLabel} 1</p>
            </div>
          </header>

          {selectedDocType === 'contrat-bail' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                <h2 className="font-bold text-amber-900 mb-2" style={{ fontFamily: selectedFont }}>
                  <EditableText value="REAL ESTATE LEASE AGREEMENT" onChange={() => {}} />
                </h2>
                <p className="text-sm text-amber-800" style={{ fontFamily: selectedFont }}>This contract is established between the lessor and the tenant according to the terms defined below.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="border border-slate-200 rounded-lg p-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-2" style={{ fontFamily: selectedFont }}>
                    <EditableText value={docData.labelLessor} onChange={(v) => setDocData({...docData, labelLessor: v})} />
                  </h3>
                  <p className="font-bold" style={{ fontFamily: selectedFont }}>{docData.companyName}</p>
                  <p className="text-sm text-slate-600" style={{ fontFamily: selectedFont }}>{docData.companyAddress}</p>
                  <p className="text-sm font-mono" style={{ fontFamily: selectedFont }}>TIN: {docData.companyTIN}</p>
                </div>
                <div className="border border-slate-200 rounded-lg p-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-2" style={{ fontFamily: selectedFont }}>
                    <EditableText value={docData.labelTenant} onChange={(v) => setDocData({...docData, labelTenant: v})} />
                  </h3>
                  <p className="font-bold" style={{ fontFamily: selectedFont }}>{docData.clientName}</p>
                  <p className="text-sm text-slate-600" style={{ fontFamily: selectedFont }}>{docData.clientAddress}</p>
                  <p className="text-sm font-mono" style={{ fontFamily: selectedFont }}>TIN: {docData.clientTIN}</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3" style={{ fontFamily: selectedFont }}>Property Description</h3>
                <p className="text-sm mb-2" style={{ fontFamily: selectedFont }}>
                  <span className="font-semibold">
                    <EditableText value={docData.labelPropertyAddress} onChange={(v) => setDocData({...docData, labelPropertyAddress: v})} />:
                  </span> {docData.propertyAddress || '_________________________'}
                </p>
                <p className="text-sm mb-2" style={{ fontFamily: selectedFont }}>
                  <span className="font-semibold">
                    <EditableText value={docData.labelPropertyType} onChange={(v) => setDocData({...docData, labelPropertyType: v})} />:
                  </span> Office / Warehouse / Commercial Space
                </p>
                <p className="text-sm" style={{ fontFamily: selectedFont }}>
                  <span className="font-semibold">
                    <EditableText value={docData.labelSurface} onChange={(v) => setDocData({...docData, labelSurface: v})} />:
                  </span> _____ m²
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="border border-slate-200 rounded-lg p-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Financial Conditions</h3>
                  <p className="text-sm mb-1" style={{ fontFamily: selectedFont }}>
                    <span className="font-semibold">
                      <EditableText value={docData.labelMonthlyRent} onChange={(v) => setDocData({...docData, labelMonthlyRent: v})} />:
                    </span> {docData.monthlyRent?.toLocaleString() || '________'} {docData.currency}
                  </p>
                  <p className="text-sm mb-1" style={{ fontFamily: selectedFont }}>
                    <span className="font-semibold">
                      <EditableText value={docData.labelDeposit} onChange={(v) => setDocData({...docData, labelDeposit: v})} />:
                    </span> {((docData.monthlyRent || 0) * 3).toLocaleString()} {docData.currency}
                  </p>
                  <p className="text-sm" style={{ fontFamily: selectedFont }}>
                    <span className="font-semibold">
                      <EditableText value={docData.labelDuration} onChange={(v) => setDocData({...docData, labelDuration: v})} />:
                    </span> {docData.contractDuration}
                  </p>
                </div>
                <div className="border border-slate-200 rounded-lg p-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Signatures</h3>
                  <div className="h-20 border-b border-slate-300 mb-2"></div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span style={{ fontFamily: selectedFont }}>{docData.labelLessor}</span>
                    <span style={{ fontFamily: selectedFont }}>{docData.labelTenant}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedDocType === 'lettre-transport' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center border-2 border-slate-900 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-slate-500 uppercase" style={{ fontFamily: selectedFont }}>
                    <EditableText value={docData.labelSender} onChange={(v) => setDocData({...docData, labelSender: v})} />
                  </p>
                  <p className="font-bold text-sm" style={{ fontFamily: selectedFont }}>{docData.companyName}</p>
                </div>
                <div className="border-x border-slate-300">
                  <p className="text-xs text-slate-500 uppercase" style={{ fontFamily: selectedFont }}>
                    <EditableText value={docData.labelCarrier} onChange={(v) => setDocData({...docData, labelCarrier: v})} />
                  </p>
                  <p className="font-bold text-sm" style={{ fontFamily: selectedFont }}>{docData.waybillCarrier || '_____________'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase" style={{ fontFamily: selectedFont }}>
                    <EditableText value={docData.labelDestination} onChange={(v) => setDocData({...docData, labelDestination: v})} />
                  </p>
                  <p className="font-bold text-sm" style={{ fontFamily: selectedFont }}>{docData.waybillDestination || '_____________'}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3" style={{ fontFamily: selectedFont }}>
                  <EditableText value={docData.labelMerchandise} onChange={(v) => setDocData({...docData, labelMerchandise: v})} />
                </h3>
                <table className="w-full text-sm">
                  <thead className="bg-slate-200">
                    <tr>
                      <th className="p-2 text-left" style={{ fontFamily: selectedFont }}>
                        <EditableText value={docData.labelDescription} onChange={(v) => setDocData({...docData, labelDescription: v})} />
                      </th>
                      <th className="p-2 text-center" style={{ fontFamily: selectedFont }}>
                        <EditableText value={docData.labelQty} onChange={(v) => setDocData({...docData, labelQty: v})} />
                      </th>
                      <th className="p-2 text-center" style={{ fontFamily: selectedFont }}>
                        <EditableText value={docData.labelWeight} onChange={(v) => setDocData({...docData, labelWeight: v})} />
                      </th>
                      <th className="p-2 text-center" style={{ fontFamily: selectedFont }}>
                        <EditableText value={docData.labelVolume} onChange={(v) => setDocData({...docData, labelVolume: v})} />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line) => (
                      <tr key={line.id} className="border-b border-slate-100">
                        <td className="p-2" style={{ fontFamily: selectedFont }}>{line.description}</td>
                        <td className="p-2 text-center">{line.quantity}</td>
                        <td className="p-2 text-center">___ kg</td>
                        <td className="p-2 text-center">___ m³</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-8" style={{ fontFamily: selectedFont }}>
                    <EditableText value={docData.labelSignatureSender} onChange={(v) => setDocData({...docData, labelSignatureSender: v})} />
                  </p>
                  <div className="border-t border-slate-400 w-48 mx-auto pt-2">
                    <p className="text-xs text-slate-400" style={{ fontFamily: selectedFont }}>Date: {docData.issueDate}</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-8" style={{ fontFamily: selectedFont }}>
                    <EditableText value={docData.labelSignatureCarrier} onChange={(v) => setDocData({...docData, labelSignatureCarrier: v})} />
                  </p>
                  <div className="border-t border-slate-400 w-48 mx-auto pt-2">
                    <p className="text-xs text-slate-400" style={{ fontFamily: selectedFont }}>Date: ____/____/______</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedDocType === 'fiche-inventaire' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-100 p-3 rounded">
                <span className="font-bold text-sm" style={{ fontFamily: selectedFont }}>
                  <EditableText value={docData.labelInventoryCategory} onChange={(v) => setDocData({...docData, labelInventoryCategory: v})} />: {docData.inventoryCategory || 'All items'}
                </span>
                <span className="text-xs text-slate-500" style={{ fontFamily: selectedFont }}>
                  <EditableText value={docData.labelLastInventory} onChange={(v) => setDocData({...docData, labelLastInventory: v})} />: {docData.issueDate}
                </span>
              </div>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="p-3 text-left" style={{ fontFamily: selectedFont }}>SKU</th>
                    <th className="p-3 text-left" style={{ fontFamily: selectedFont }}>
                      <EditableText value={docData.labelDescription} onChange={(v) => setDocData({...docData, labelDescription: v})} />
                    </th>
                    <th className="p-3 text-center w-40" style={{ fontFamily: selectedFont }}>
                      <EditableText value={docData.labelTheoreticalStock} onChange={(v) => setDocData({...docData, labelTheoreticalStock: v})} />
                    </th>
                    <th className="p-3 text-center" style={{ fontFamily: selectedFont }}>
                      <EditableText value={docData.labelRealStock} onChange={(v) => setDocData({...docData, labelRealStock: v})} />
                    </th>
                    <th className="p-3 text-center" style={{ fontFamily: selectedFont }}>
                      <EditableText value={docData.labelVariance} onChange={(v) => setDocData({...docData, labelVariance: v})} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, idx) => (
                    <tr key={line.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="p-3 font-mono text-xs" style={{ fontFamily: selectedFont }}>SKU-{1000 + idx}</td>
                      <td className="p-3" style={{ fontFamily: selectedFont }}>{line.description}</td>
                      <td className="p-3 text-center font-mono" style={{ fontFamily: selectedFont }}>
                        <div className="flex items-center justify-center gap-2">
                          <input 
                            type="number" 
                            value={line.suppliedQty || 0}
                            onChange={(e) => updateLine(line.id, 'suppliedQty', parseFloat((e.target as HTMLInputElement).value))}
                            className="w-20 text-center border border-blue-200 bg-blue-50 rounded px-1 py-0.5 font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            style={{ fontFamily: selectedFont }} 
                          />
                          <Pencil size={12} className="text-blue-400" />
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <input 
                          type="number" 
                          value={line.consumedQty || 0}
                          onChange={(e) => updateLine(line.id, 'consumedQty', parseFloat((e.target as HTMLInputElement).value))}
                          className="w-20 text-center border border-slate-300 rounded px-1 py-0.5" style={{ fontFamily: selectedFont }} />
                      </td>
                      <td className="p-3 text-center text-green-600 font-bold">{(line.suppliedQty || 0) - (line.consumedQty || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-8 flex justify-between text-xs text-slate-500">
                <div>
                  <p className="font-bold" style={{ fontFamily: selectedFont }}>
                    <EditableText value={docData.labelInventoryBy} onChange={(v) => setDocData({...docData, labelInventoryBy: v})} />:
                  </p>
                  <p className="mt-4" style={{ fontFamily: selectedFont }}>Signature: _________________</p>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{ fontFamily: selectedFont }}>
                    <EditableText value={docData.labelVerifiedBy} onChange={(v) => setDocData({...docData, labelVerifiedBy: v})} />:
                  </p>
                  <p className="mt-4" style={{ fontFamily: selectedFont }}>Signature: _________________</p>
                </div>
              </div>
            </div>
          )}

          {selectedDocType === 'nda' && (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-black uppercase mb-2" style={{ fontFamily: selectedFont }}>
                  <EditableText value={docData.labelNDATitle} onChange={(v) => setDocData({...docData, labelNDATitle: v})} className="uppercase" />
                </h1>
                <p className="text-sm text-slate-500" style={{ fontFamily: selectedFont }}>Non-Disclosure Agreement (NDA)</p>
              </div>
              
              <div className="prose prose-sm max-w-none text-justify space-y-4 text-sm">
                <p style={{ fontFamily: selectedFont }}>
                  <EditableText value={docData.labelBetween} onChange={(v) => setDocData({...docData, labelBetween: v})} /> :
                </p>
                <p style={{ fontFamily: selectedFont }}>
                  <strong>{docData.companyName}</strong>, a company registered under TIN {docData.companyTIN}, with its registered office located at {docData.companyAddress}, hereinafter referred to as <strong>"the Company"</strong>,
                </p>
                <p className="text-center font-bold" style={{ fontFamily: selectedFont }}>
                  <EditableText value={docData.labelAnd} onChange={(v) => setDocData({...docData, labelAnd: v})} />
                </p>
                <p style={{ fontFamily: selectedFont }}>
                  <strong>{docData.clientName}</strong>, registered under TIN {docData.clientTIN}, residing at {docData.clientAddress}, hereinafter referred to as <strong>"the Partner"</strong>,
                </p>
                
                <div className="bg-slate-50 p-4 rounded border-l-4 border-slate-800 my-6">
                  <h3 className="font-bold mb-2" style={{ fontFamily: selectedFont }}>
                    <EditableText value={docData.labelArticle1Title} onChange={(v) => setDocData({...docData, labelArticle1Title: v})} />
                  </h3>
                  <p style={{ fontFamily: selectedFont }}>
                    <EditableText value={docData.labelArticle1Content} onChange={(v) => setDocData({...docData, labelArticle1Content: v})} multiline />
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 mt-12">
                  <div className="text-center">
                    <p className="font-bold mb-2" style={{ fontFamily: selectedFont }}>For the Company</p>
                    <p className="text-xs text-slate-500 mb-8" style={{ fontFamily: selectedFont }}>{docData.companyName}</p>
                    <div className="border-t border-slate-400 pt-2">
                      <p className="text-xs" style={{ fontFamily: selectedFont }}>Signature and Date</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-bold mb-2" style={{ fontFamily: selectedFont }}>For the Partner</p>
                    <p className="text-xs text-slate-500 mb-8" style={{ fontFamily: selectedFont }}>{docData.clientName}</p>
                    <div className="border-t border-slate-400 pt-2">
                      <p className="text-xs" style={{ fontFamily: selectedFont }}>Signature and Date</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedDocType === 'kyc' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h2 className="font-bold text-blue-900 mb-2" style={{ fontFamily: selectedFont }}>
                  <EditableText value={docData.labelKYCFormTitle} onChange={(v) => setDocData({...docData, labelKYCFormTitle: v})} />
                </h2>
                <p className="text-xs text-blue-700" style={{ fontFamily: selectedFont }}>
                  <EditableText value={docData.labelKYCInstructions} onChange={(v) => setDocData({...docData, labelKYCInstructions: v})} multiline />
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase" style={{ fontFamily: selectedFont }}>
                    <EditableText value={docData.labelCompanyInfo} onChange={(v) => setDocData({...docData, labelCompanyInfo: v})} />
                  </h3>
                  <SecureInput label="Entity Name" value={docData.clientName} onChange={v => setDocData({...docData, clientName: v})} fontFamily={selectedFont} />
                  <SecureInput label="TIN / Identification Number" value={docData.clientTIN} onChange={v => setDocData({...docData, clientTIN: v})} fontFamily={selectedFont} />
                  <SecureInput label="Date of Incorporation" type="date" value={docData.issueDate} onChange={v => setDocData({...docData, issueDate: v})} fontFamily={selectedFont} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase" style={{ fontFamily: selectedFont }}>
                    <EditableText value={docData.labelContactInfo} onChange={(v) => setDocData({...docData, labelContactInfo: v})} />
                  </h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600" style={{ fontFamily: selectedFont }}>Full Address</label>
                    <textarea 
                      value={docData.clientAddress}
                      onChange={e => setDocData({...docData, clientAddress: (e.target as HTMLTextAreaElement).value})}
                      rows={3}
                      className="w-full p-2 text-sm border border-slate-300 rounded-lg outline-none resize-none"
                      style={{ fontFamily: selectedFont }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 border-2 border-dashed border-slate-300 rounded-lg text-center">
                <p className="text-xs font-bold text-slate-500 mb-2" style={{ fontFamily: selectedFont }}>Documents to Attach (Certified Copies):</p>
                <div className="flex justify-center gap-4 text-xs">
                  <label className="flex items-center gap-2" style={{ fontFamily: selectedFont }}><input type="checkbox" /> ID Card / Passport</label>
                  <label className="flex items-center gap-2" style={{ fontFamily: selectedFont }}><input type="checkbox" /> TIN Certificate</label>
                  <label className="flex items-center gap-2" style={{ fontFamily: selectedFont }}><input type="checkbox" /> Bank Statement</label>
                </div>
              </div>
            </div>
          )}
        </>
      );
    }

    return null;
  };

  return (
    <div className="h-full flex flex-col bg-white text-slate-900 overflow-hidden relative" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      <GrainyTexture />
      
      <div className="bg-white/80 backdrop-blur-[5px] border-b border-slate-200 flex items-center justify-end px-6 py-4 shrink-0 z-20 print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={handleExportPDF} className="px-4 py-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
            <Download size={16} /> Save PDF
          </button>
          <button onClick={handlePrint} className="px-4 py-1.5 text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 overflow-hidden print:block">
        
        {/* LEFT PANEL */}
        <div className="col-span-3 bg-white/60 backdrop-blur-[5px] border-r border-slate-200 overflow-y-auto p-6 z-10 print:hidden">
          <div className="mb-6">
            <label className="text-xs font-semibold text-slate-600 mb-2 block">Document Type</label>
            <select 
              value={selectedDocType}
              onChange={(e) => handleDocTypeChange(e.target.value)}
              className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <optgroup label="I. COMMERCIAL DOCUMENTS">
                {DOCUMENT_TYPES.filter(d => d.category === 'I. COMMERCIAL DOCUMENTS').map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.label}</option>
                ))}
              </optgroup>
              <optgroup label="II. FINANCE & TREASURY">
                {DOCUMENT_TYPES.filter(d => d.category === 'II. FINANCE & TREASURY').map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.label}</option>
                ))}
              </optgroup>
              <optgroup label="III. HUMAN RESOURCES">
                {DOCUMENT_TYPES.filter(d => d.category === 'III. HUMAN RESOURCES').map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.label}</option>
                ))}
              </optgroup>
              <optgroup label="IV. LOGISTICS & ADMINISTRATION">
                {DOCUMENT_TYPES.filter(d => d.category === 'IV. LOGISTICS & ADMINISTRATION').map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.label}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Document Properties</h3>
          
          <div className="mb-5">
            <label className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-2">
              <Type size={12} />
              Font Style
            </label>
            <select 
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value)}
              className="w-full p-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              {STANDARD_FONTS.map(font => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-5">
            <SecureInput label="Document Number" value={docData.invoiceNumber} onChange={v => setDocData({...docData, invoiceNumber: v})} />
            
            <div className="grid grid-cols-2 gap-3">
              <SecureInput label="Issue Date" type="date" value={docData.issueDate} onChange={v => setDocData({...docData, issueDate: v})} />
              <SecureInput label="Due Date" type="date" value={docData.dueDate} onChange={v => setDocData({...docData, dueDate: v})} />
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company</h4>
              <SecureInput label="Company Name" value={docData.companyName} onChange={v => setDocData({...docData, companyName: v})} />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Company Address</label>
                <textarea 
                  value={docData.companyAddress}
                  onChange={e => setDocData({...docData, companyAddress: (e.target as HTMLTextAreaElement).value})}
                  rows={2}
                  className="w-full p-2 text-sm border border-slate-300 rounded-lg outline-none resize-none"
                />
              </div>
              <SecureInput label="Company TIN" value={docData.companyTIN} onChange={v => setDocData({...docData, companyTIN: v})} />
              <SecureInput label="Phone" value={docData.companyPhone} onChange={v => setDocData({...docData, companyPhone: v})} />
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isHR ? 'Employee' : isLogistics && selectedDocType === 'contrat-bail' ? 'Tenant' : 'Client'}
              </h4>
              <SecureInput label={isHR ? "Employee Name" : "Name / Entity"} value={docData.clientName} onChange={v => setDocData({...docData, clientName: v})} />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Address</label>
                <textarea 
                  value={docData.clientAddress}
                  onChange={e => setDocData({...docData, clientAddress: (e.target as HTMLTextAreaElement).value})}
                  rows={2}
                  className="w-full p-2 text-sm border border-slate-300 rounded-lg outline-none resize-none"
                />
              </div>
              <SecureInput label="TIN / ID" value={docData.clientTIN} onChange={v => setDocData({...docData, clientTIN: v})} />
              
              {isHR && (
                <>
                  <SecureInput label="Fayda Number" value={docData.faydaNumber || ''} onChange={v => setDocData({...docData, faydaNumber: v})} />
                  <SecureInput label="Position" value={docData.employeePosition || ''} onChange={v => setDocData({...docData, employeePosition: v})} />
                  <SecureInput label="Department" value={docData.employeeDepartment || ''} onChange={v => setDocData({...docData, employeeDepartment: v})} />
                  {selectedDocType === 'contrat-travail' && (
                    <SecureInput label="Contract Duration" value={docData.contractDuration || ''} onChange={v => setDocData({...docData, contractDuration: v})} />
                  )}
                </>
              )}

              {selectedDocType === 'contrat-bail' && (
                <>
                  <SecureInput label="Property Address" value={docData.propertyAddress || ''} onChange={v => setDocData({...docData, propertyAddress: v})} />
                  <SecureInput label="Monthly Rent" type="number" value={docData.monthlyRent || 0} onChange={v => setDocData({...docData, monthlyRent: v})} />
                </>
              )}

              {selectedDocType === 'lettre-transport' && (
                <>
                  <SecureInput label="Destination" value={docData.waybillDestination || ''} onChange={v => setDocData({...docData, waybillDestination: v})} />
                  <SecureInput label="Carrier" value={docData.waybillCarrier || ''} onChange={v => setDocData({...docData, waybillCarrier: v})} />
                </>
              )}

              {selectedDocType === 'fiche-inventaire' && (
                <SecureInput label="Inventory Category" value={docData.inventoryCategory || ''} onChange={v => setDocData({...docData, inventoryCategory: v})} />
              )}
            </div>

            {(isCommercial || isFinance) && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Financials</h4>
                <SecureInput label="Global Discount %" type="number" value={docData.discountGlobal} onChange={v => setDocData({...docData, discountGlobal: v})} />
                <SecureInput label="Payment Terms" value={docData.paymentTerms} onChange={v => setDocData({...docData, paymentTerms: v})} />
              </div>
            )}
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className="col-span-9 bg-slate-100/50 overflow-y-auto p-4 flex flex-col items-center relative z-10 print:p-0 print:bg-transparent">
          <div 
            id="a4-container"
            className="bg-white shadow-2xl relative flex flex-col text-slate-900 print:shadow-none"
            style={{ 
              width: '210mm', 
              minHeight: '297mm', 
              padding: '15mm',
              boxSizing: 'border-box',
              fontFamily: selectedFont
            }}
          >
            {renderDocumentContent()}

            <div className="mt-auto pt-6 border-t border-slate-200">
              <div className="flex justify-between items-end mb-6 print:hidden">
                <div className="w-1/2 text-xs text-slate-500">
                  <p className="font-bold text-slate-700 mb-1" style={{ fontFamily: selectedFont }}>Notes:</p>
                  <EditableText 
                    value={docData.notesLegales} 
                    onChange={(v) => setDocData({...docData, notesLegales: v})}
                    multiline
                  />
                </div>
              </div>
              
              <footer className="border-t border-slate-200 pt-3 text-center text-[10px] text-slate-400 uppercase tracking-widest" style={{ fontFamily: selectedFont }}>
                <EditableText 
                  value={`${docData.generatedBy} ${docData.companyName}`} 
                  onChange={(v) => {
                    setDocData({...docData, generatedBy: v.replace(docData.companyName, '').trim()});
                  }}
                  className="inline"
                /> • <EditableText value={docData.footerText} onChange={(v) => setDocData({...docData, footerText: v})} className="inline" /> • {new Date().toLocaleString()}
              </footer>
            </div>

            {draggableElements.map(el => (
              <div
                key={el.id}
                onMouseDown={(e) => handleDragStart(e, el.id)}
                className="absolute cursor-move group"
                style={{ 
                  left: `${el.x}%`, 
                  top: `${el.y}%`,
                  width: `${el.width}px`,
                  height: `${el.height}px`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <img src={el.content} alt={el.type} className="w-full h-full object-contain pointer-events-none" />
                <div className="absolute inset-0 border-2 border-blue-400 opacity-0 group-hover:opacity-100 rounded-lg pointer-events-none" />
                <button 
                  onClick={() => setDraggableElements(prev => prev.filter(e => e.id !== el.id))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
                {el.type === 'stamp' && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded shadow-lg p-1 border border-slate-200">
                    <button onClick={(e) => { e.stopPropagation(); updateElementScale(el.id, Math.max(0.5, (el.scale || 1) - 0.1)); }} className="p-1 hover:bg-slate-100 rounded"><Minus size={12} /></button>
                    <span className="text-xs px-1 flex items-center" style={{ fontFamily: selectedFont }}>{Math.round((el.scale || 1) * 100)}%</span>
                    <button onClick={(e) => { e.stopPropagation(); updateElementScale(el.id, Math.min(1.5, (el.scale || 1) + 0.1)); }} className="p-1 hover:bg-slate-100 rounded"><PlusIcon size={12} /></button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="w-[210mm] mt-8 mb-8 bg-slate-50 p-8 rounded-xl border-2 border-dashed border-slate-400 print:hidden relative shadow-sm">
            <div className="absolute -top-3 left-6 bg-slate-400 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={14} />
              Off-Document Features
            </div>

            <div className="mb-8 mt-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Type size={18} className="text-blue-600" />
                Label Customization
              </h3>
              <p className="text-xs text-slate-500 mb-4 italic">
                Click on the texts above to edit labels directly, or edit global footers here:
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">
                    Footer text
                  </label>
                  <EditableText 
                    value={docData.footerText} 
                    onChange={(v) => setDocData({...docData, footerText: v})}
                    className="text-sm font-medium text-slate-800 p-2 bg-slate-50 rounded border border-slate-200 w-full"
                  />
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">
                    "Generated By" Text
                  </label>
                  <EditableText 
                    value={docData.generatedBy} 
                    onChange={(v) => setDocData({...docData, generatedBy: v})}
                    className="text-sm font-medium text-slate-800 p-2 bg-slate-50 rounded border border-slate-200 w-full"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield size={18} className="text-emerald-600" />
                Validation Tools
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <PenTool size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">Signature</h4>
                      <p className="text-xs text-slate-500">Add digital signature</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowSignatureModal(true)}
                    className="w-full py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    Manage Signature
                  </button>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Shield size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">Company Stamp</h4>
                      <p className="text-xs text-slate-500">Apply official bilingual seal</p>
                    </div>
                  </div>
                  
                  <div className="mb-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-600">Stamp size</span>
                      <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border">
                        {Math.round(stampScale * 100)}%
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="150" 
                      value={stampScale * 100}
                      onChange={(e) => setStampScale(parseInt((e.target as HTMLInputElement).value) / 100)}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>
                  
                  <button 
                    onClick={generateStamp}
                    className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    Generate Stamp
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>Note:</strong> These tools are located outside the document sheet and allow you to customize labels and add validation elements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showSignatureModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Add a Signature</h3>
              <button onClick={() => setShowSignatureModal(false)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="flex border-b border-slate-100">
              <button onClick={() => setSignatureTab('draw')} className={`flex-1 py-3 text-sm font-medium ${signatureTab === 'draw' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Draw</button>
              <button onClick={() => setSignatureTab('import')} className={`flex-1 py-3 text-sm font-medium ${signatureTab === 'import' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Import</button>
              <button onClick={() => setSignatureTab('scan')} className={`flex-1 py-3 text-sm font-medium ${signatureTab === 'scan' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Scan</button>
            </div>
            <div className="p-6">
              {signatureTab === 'draw' && <SignatureCanvas onSave={(data) => addDraggableElement('signature', data)} />}
              {signatureTab === 'import' && <FileDropZone label="Image File" acceptedTypes="image/png, image/jpeg, image/svg+xml" onUpload={(f) => addDraggableElement('signature', f.encryptedData)} />}
              {signatureTab === 'scan' && <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200"><Camera size={32} className="mx-auto text-slate-400 mb-2" /><p className="text-sm text-slate-500">Webcam integration placeholder</p></div>}
            </div>
          </motion.div>
        </div>, document.body
      )}

      {showLogoModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Edit Logo</h3>
              <button onClick={() => setShowLogoModal(false)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-6">
              <FileDropZone label="Upload a Logo" acceptedTypes="image/png, image/jpeg, image/svg+xml" onUpload={handleLogoUpload} />
              {logoImage && <div className="mt-4 p-4 bg-slate-50 rounded-lg"><img src={logoImage} alt="Current logo" className="h-16 object-contain mx-auto" /><button onClick={() => setLogoImage(null)} className="mt-2 text-xs text-red-600 hover:text-red-700 w-full text-center">Delete logo</button></div>}
            </div>
          </motion.div>
        </div>, document.body
      )}
    </div>
  );
};

export default BillsInvoices;