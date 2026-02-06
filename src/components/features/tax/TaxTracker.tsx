import React, { useState, useMemo, useEffect } from 'react';
import { 
  Scale, Calculator, BookOpen, TrendingUp, Landmark, ShieldCheck, Info, X,
  Percent, FileText, Users, AlertTriangle, CheckCircle2, Printer, 
  ArrowRightLeft, Receipt, Building2, Filter, Download, ChevronRight,
  Wallet, ScrollText, CheckSquare, Square, Layers, HelpCircle, ChevronDown,
  ArrowDown, MousePointer, Building, Briefcase, Globe, Coffee,
  Search
} from 'lucide-react';
import { useLedger } from '../../../context/LedgerContext';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

type TaxRegimeType = 'VAT' | 'TOT' | 'CIT' | 'WHT' | 'EXCISE' | 'CUSTOMS' | 'PAYE' | 'STAMP' | 'PRESUMPTIVE';
type TransactionType = 'INCOME' | 'EXPENSE';
type BusinessType = 'sole_proprietorship' | 'plc' | 'partnership' | 'branch' | 'ngo' | 'cooperative' | 'joint_venture';
type CombinationType = 'standard' | 'small' | 'hybrid' | 'importer' | 'ngo' | 'micro';

interface MasterLedgerTransaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  description: string;
  source: string;
  category?: 'GOODS' | 'SERVICES' | 'EXCISE' | 'CONTRACTOR' | 'GENERAL' | 'SALARY' | 'FOOD' | 'BEVERAGE' | 'RENT' | 'IMPORT';
  vatApplicable?: boolean;
  withholdingEligible?: boolean;
  deductible?: boolean;
  reference?: string;
  counterparty?: string;
}

interface TaxCalculationState {
  vatOutput: number;
  vatInput: number;
  totAmount: number;
  withholdingTax: number;
  profitBeforeTax: number;
  profitTax: number;
  exciseTax: number;
  customsDuty: number;
  payeTax: number;
  stampDuty: number;
  presumptiveTax: number;
  totalLiability: number;
  netCashFlow: number;
}

interface TaxDetail {
  amount: number;
  justification: string;
  baseCalculation: string;
  transactions: MasterLedgerTransaction[];
}

interface TaxRegimeDefinition {
  id: TaxRegimeType;
  name: string;
  amharicName: string;
  description: string;
  detailedExplanation: string;
  legalBasis: string;
  rates: { label: string; value: string }[];
  threshold?: string;
  color: string;
  icon: React.ElementType;
  compatibleWith: TaxRegimeType[];
  incompatibleWith: TaxRegimeType[];
  applicableTo: BusinessType[];
}

const GrainyTexture = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.15] pointer-events-none mix-blend-overlay z-0">
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
  </svg>
);

// =============================================================================
// DONNÉES COMPLÈTES DES RÉGIMES FISCAUX ÉTHIOPIENS
// =============================================================================

const TAX_REGIMES_DEFINITIONS: TaxRegimeDefinition[] = [
  {
    id: 'VAT',
    name: 'Value Added Tax (TVA)',
    amharicName: 'የተጨማሪ እሴት ታክስ',
    description: 'Value Added Tax applied at each stage of the production and distribution chain.',
    detailedExplanation: 'VAT is a tax on final consumption. Companies collect VAT on their sales (Output VAT) and deduct VAT paid on their purchases (Input VAT). Only the difference is paid to ERCA. Mandatory for companies with an annual turnover > 1,000,000 ETB. The standard rate is 15%, with a zero rate (0%) for exports and certain essential services.',
    legalBasis: 'Proclamation No. 285/2002 (modifiée par Proc. 1076/2018)',
    rates: [
      { label: 'Standard', value: '15%' },
      { label: 'Exports', value: '0%' },
      { label: 'Exempt', value: 'Exempt' }
    ],
    threshold: 'Turnover > 1,000,000 ETB/year',
    color: 'blue',
    icon: Percent,
    compatibleWith: ['CIT', 'WHT', 'EXCISE', 'CUSTOMS', 'PAYE', 'STAMP'],
    incompatibleWith: ['TOT', 'PRESUMPTIVE'],
    applicableTo: ['plc', 'partnership', 'branch', 'ngo', 'cooperative', 'joint_venture']
  },
  {
    id: 'TOT',
    name: 'Turnover Tax (TOT)',
    amharicName: 'የመሸጫ ገቢ ግብር',
    description: 'Flat tax on turnover for small businesses not subject to VAT.',
    detailedExplanation: 'TOT is a simplified alternative to VAT for small businesses (Turnover < 1M ETB). Unlike VAT, there is no tax credit (Input VAT not deductible). Single rate of 2% on sales of goods AND services. For sole proprietorships, it can replace income tax (CIT) if they opt for the full presumptive regime.',
    legalBasis: 'Proclamation No. 308/2002',
    rates: [
      { label: 'Goods', value: '2%' },
      { label: 'Services', value: '2%' },
      { label: 'Export TOT', value: '0%' }
    ],
    threshold: 'Turnover < 1,000,000 ETB/year',
    color: 'amber',
    icon: Calculator,
    compatibleWith: ['WHT', 'EXCISE', 'PAYE', 'STAMP'],
    incompatibleWith: ['VAT', 'CIT', 'PRESUMPTIVE'],
    applicableTo: ['sole_proprietorship', 'partnership', 'cooperative']
  },
  {
    id: 'CIT',
    name: 'Corporate Income Tax (CIT)',
    amharicName: 'የድርጅት ገቢ ግብር',
    description: 'Corporate income tax, calculated on net income after deduction of expenses.',
    detailedExplanation: 'Tax on profits applicable to legal entities (PLC, Branch, etc.). The standard rate is 30% on net profit (income less deductible expenses). Some mining activities pay specific 25-30%. Losses can be carried forward for 5 years. Mandatory for all companies except those exclusively in TOT (small sole proprietorship).',
    legalBasis: 'Proclamation No. 979/2016',
    rates: [
      { label: 'Standard', value: '30%' },
      { label: 'Mining', value: '25-30%' },
      { label: 'Petroleum', value: '30%' }
    ],
    threshold: 'All companies (except pure TOT)',
    color: 'red',
    icon: TrendingUp,
    compatibleWith: ['VAT', 'WHT', 'EXCISE', 'CUSTOMS', 'PAYE', 'STAMP'],
    incompatibleWith: ['TOT', 'PRESUMPTIVE'],
    applicableTo: ['plc', 'partnership', 'branch', 'ngo', 'joint_venture']
  },
  {
    id: 'WHT',
    name: 'Withholding Tax (WHT)',
    amharicName: 'የሚከፈልበት ግብር',
    description: 'Withholding tax deducted by the payer on certain types of payments.',
    detailedExplanation: 'Withholding tax system where the payer must deduct the tax and pay it to ERCA. Applies to payments to contractors (2% if > 1,000 ETB), commissions (10%), rentals (15%), dividends (10%), interest (5%), royalties (5%). It is an advance payment that is credited against the final tax due.',
    legalBasis: 'Proclamation No. 979/2016 (Articles 90-94)',
    rates: [
      { label: 'Contractors', value: '2%' },
      { label: 'Commissions', value: '10%' },
      { label: 'Dividends', value: '10%' },
      { label: 'Rentals', value: '15%' }
    ],
    threshold: 'Payments > 1,000 ETB',
    color: 'violet',
    icon: Receipt,
    compatibleWith: ['VAT', 'TOT', 'CIT', 'EXCISE', 'CUSTOMS', 'PAYE', 'STAMP', 'PRESUMPTIVE'],
    incompatibleWith: [],
    applicableTo: ['plc', 'partnership', 'branch', 'ngo', 'sole_proprietorship', 'joint_venture']
  },
  {
    id: 'EXCISE',
    name: 'Excise Tax',
    amharicName: 'አይሲዝ ታክስ',
    description: 'Specific taxes on the production, import, and sale of luxury or harmful goods.',
    detailedExplanation: 'Indirect tax on specific products considered luxurious or harmful to health. Generally included in the selling price. Rates vary by product: Alcohol (40-75%), Tobacco (75%), Fuel (variable by type), Vehicles (by engine capacity), Luxury goods (10-20%). Applies in addition to VAT (tax on tax possible).',
    legalBasis: 'Proclamation No. 1186/2020',
    rates: [
      { label: 'Alcohol', value: '40-75%' },
      { label: 'Tobacco', value: '75%' },
      { label: 'Fuel', value: 'Variable' },
      { label: 'Vehicles', value: '10-100%' }
    ],
    threshold: 'Specific products',
    color: 'emerald',
    icon: Scale,
    compatibleWith: ['VAT', 'TOT', 'CIT', 'WHT', 'CUSTOMS', 'PAYE', 'STAMP'],
    incompatibleWith: [],
    applicableTo: ['plc', 'partnership', 'branch', 'sole_proprietorship', 'joint_venture']
  },
  {
    id: 'CUSTOMS',
    name: 'Customs Duty & Import Taxes',
    amharicName: 'የመጓጓዣ እና የአገር ውስጥ ታክስ',
    description: 'Customs duties and import taxes (Customs Duty, Surtax, VAT on import).',
    detailedExplanation: 'Set of import taxes: Customs Duty (0-35% depending on HS Code classification), Surtax (10% on certain luxury goods), Excise Tax if applicable, and VAT (15%) calculated on CIF value + duties. The duty rate depends on the product category (raw materials 0-5%, capital goods 5-10%, consumer goods 20-35%).',
    legalBasis: 'Proclamation No. 859/2014 (Customs)',
    rates: [
      { label: 'Customs Duty', value: '0-35%' },
      { label: 'Surtax', value: '10%' },
      { label: 'Excise Import', value:'Variable' },
      { label: 'VAT Import', value: '15%' }
    ],
    threshold: 'All imports',
    color: 'orange',
    icon: Landmark,
    compatibleWith: ['VAT', 'CIT', 'WHT', 'EXCISE', 'PAYE', 'STAMP'],
    incompatibleWith: ['TOT'],
    applicableTo: ['plc', 'partnership', 'branch', 'sole_proprietorship', 'joint_venture', 'ngo']
  },
  {
    id: 'PAYE',
    name: 'Pay As You Earn (PAYE)',
    amharicName: 'በስራ ላይ ከተቀሙ ሰራተኞች የሚከፈል ግብር',
    description: 'Progressive tax on employee income deducted at source by the employer.',
    detailedExplanation: 'Tax on salaries and wages deducted monthly by the employer. Progressive scale: 0% (0-600 ETB), 10% (601-1,650), 15% (1,651-3,200), 20% (3,201-5,250), 25% (5,251-7,800), 30% (7,801-10,900), 35% (>10,900). The employer must declare and pay before the 30th of the following month. Independent of company status.',
    legalBasis: 'Proclamation No. 979/2016 (Schedules A & B)',
    rates: [
      { label: 'Bracket 1', value: '0%' },
      { label: 'Bracket 2', value: '10%' },
      { label: 'Bracket 3', value: '15%' },
      { label: 'Bracket 4', value: '20%' },
      { label: 'Bracket 5', value: '25%' },
      { label: 'Bracket 6', value: '30%' },
      { label: 'Bracket 7', value: '35%' }
    ],
    threshold: 'Salaries > 600 ETB/month',
    color: 'indigo',
    icon: Users,
    compatibleWith: ['VAT', 'TOT', 'CIT', 'WHT', 'EXCISE', 'CUSTOMS', 'STAMP', 'PRESUMPTIVE'],
    incompatibleWith: [],
    applicableTo: ['plc', 'partnership', 'branch', 'ngo', 'sole_proprietorship', 'joint_venture', 'cooperative']
  },
  {
    id: 'STAMP',
    name: 'Stamp Duty',
    amharicName: 'የጽሕፈት እና የፊርማ ታክስ',
    description: 'Stamp duty on official documents, contracts, and financial transactions.',
    detailedExplanation: 'Tax on legal acts and commercial documents: Lease agreements (0.5% of total rent), Loans/bonds (1% of capital), Property transfers (2%), Notarized documents (fixed rates). Applies to significant documented transactions.',
    legalBasis: 'Proclamation No. 110/1998',
    rates: [
      { label: 'Lease', value: '0.5%' },
      { label: 'Loan', value: '1%' },
      { label: 'Transfer', value: '2%' },
      { label: 'Documents', value: 'Fixe' }
    ],
    threshold: 'Specific documents',
    color: 'rose',
    icon: FileText,
    compatibleWith: ['VAT', 'TOT', 'CIT', 'WHT', 'EXCISE', 'CUSTOMS', 'PAYE', 'PRESUMPTIVE'],
    incompatibleWith: [],
    applicableTo: ['plc', 'partnership', 'branch', 'ngo', 'sole_proprietorship', 'joint_venture']
  },
  {
    id: 'PRESUMPTIVE',
    name: 'Presumptive Tax',
    amharicName: 'የግምት ግብር',
    description: 'Presumptive tax regime for the informal sector and very small business activities.',
    detailedExplanation: 'Simplified regime for micro-enterprises (Turnover < 500,000 ETB/year depending on criteria). Calculated presumptively based on activity type and location, without detailed accounting. Can include a global lump sum replacing VAT, CIT, and other taxes for the smallest sole proprietorships.',
    legalBasis: 'Proclamation No. 979/2016 (Article 125) et directives ERCA',
    rates: [
      { label: 'Category A', value: 'Flat rate' },
      { label: 'Category B', value: 'Flat rate' },
      { label: 'Category C', value: 'Flat rate' }
    ],
    threshold: 'Turnover < 500,000 ETB/year',
    color: 'cyan',
    icon: HelpCircle,
    compatibleWith: ['WHT', 'PAYE', 'STAMP'],
    incompatibleWith: ['VAT', 'TOT', 'CIT', 'EXCISE', 'CUSTOMS'],
    applicableTo: ['sole_proprietorship']
  }
];

// =============================================================================
// CONFIGURATION DES COMBINAISONS
// =============================================================================

const COMBINATION_CONFIGS: Record<CombinationType, { 
  name: string; 
  regimes: TaxRegimeType[]; 
  description: string;
  businessType: BusinessType;
  color: string;
  icon: React.ElementType;
  explanation: string;
}> = {
  standard: {
    name: 'Standard Company (PLC)',
    regimes: ['VAT', 'CIT', 'WHT', 'PAYE'],
    description: 'Typical combination for a share company with VAT and corporate income tax.',
    businessType: 'plc',
    color: 'blue',
    icon: Building,
    explanation: 'This standard regime applies to companies with a turnover exceeding 1 million ETB. VAT (15%) applies to sales, corporate income tax (30%) to profits, and you must withhold tax at source (2%) on payments to contractors.'
  },
  small: {
    name: 'Small Business (TOT)',
    regimes: ['TOT', 'WHT', 'PAYE'],
    description: 'Simplified regime for turnover < 1 million ETB with Turnover Tax.',
    businessType: 'sole_proprietorship',
    color: 'amber',
    icon: Coffee,
    explanation: 'For small businesses (turnover < 1M ETB), TOT replaces VAT and often corporate income tax. You pay 2% on your total turnover, with no deduction possible. Simpler but less advantageous if you have many expenses.'
  },
  hybrid: {
    name: 'Hybrid Regime (Multi-activity)',
    regimes: ['VAT', 'TOT', 'CIT', 'WHT', 'PAYE'],
    description: 'Company with distinct activities subject to different regimes.',
    businessType: 'partnership',
    color: 'indigo',
    icon: Layers,
    explanation: 'If you have multiple activities (e.g., separate trade + services), you can be subject to VAT for one and TOT for the other. Requires separate analytical accounting but allows optimizing the tax burden according to each activity.'
  },
  importer: {
    name: 'Importer',
    regimes: ['CUSTOMS', 'VAT', 'CIT', 'WHT', 'PAYE', 'EXCISE'],
    description: 'Import-focused company with customs duties and import taxes.',
    businessType: 'plc',
    color: 'orange',
    icon: Globe,
    explanation: 'Importers pay customs duties (0-35% depending on the product), plus import VAT (15% calculated on value + duty), plus excise if applicable (alcohol, tobacco). This is the most complex regime with the most obligations.'
  },
  ngo: {
    name: 'NGO / Sectoral',
    regimes: ['PAYE', 'WHT', 'VAT'],
    description: 'Non-profit organizations with potential exemptions.',
    businessType: 'ngo',
    color: 'rose',
    icon: Briefcase,
    explanation: 'NGOs are generally exempt from corporate income tax for their main activities, but must pay VAT if their commercial turnover exceeds 1M ETB. They must always withhold tax on salaries (PAYE) and at source (WHT).'
  },
  micro: {
    name: 'Micro-Enterprise',
    regimes: ['PRESUMPTIVE', 'STAMP'],
    description: 'Very small informal sector with simplified presumptive regime.',
    businessType: 'sole_proprietorship',
    color: 'cyan',
    icon: Calculator,
    explanation: 'For very small activities (Turnover < 500,000 ETB/year). You pay a fixed lump sum each year that replaces VAT, CIT, and other taxes. Very simple but limited in terms of growth and tax deductions.'
  }
};

// =============================================================================
// DONNÉES MASTER LEDGER
// =============================================================================

// =============================================================================
// UTILITAIRES
// =============================================================================

const formatETB = (amount: number | bigint) => {
  return new Intl.NumberFormat('en-ET', { 
    style: 'currency', 
    currency: 'ETB', 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(Number(amount) / 100);
};

const formatETBRaw = (amount: number) => {
  return new Intl.NumberFormat('en-ET', { 
    style: 'currency', 
    currency: 'ETB', 
    maximumFractionDigits: 0 
  }).format(amount);
};

// =============================================================================
// COMPOSANTS UI
// =============================================================================

const GlassCard: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  color?: 'default' | 'blue' | 'emerald' | 'amber' | 'red' | 'violet' | 'indigo' | 'orange' | 'rose' | 'cyan';
  noHover?: boolean;
}> = ({ children, className = '', color = 'default', noHover = false }) => {
  const colorStyles = {
    default: 'bg-white',
    blue: 'bg-blue-50',
    emerald: 'bg-emerald-50',
    amber: 'bg-amber-50',
    red: 'bg-red-50',
    violet: 'bg-violet-50',
    indigo: 'bg-indigo-50',
    orange: 'bg-orange-50',
    rose: 'bg-rose-50',
    cyan: 'bg-cyan-50'
  };

  return (
    <div className={`backdrop-blur-xl rounded-2xl shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] ${colorStyles[color]} ${!noHover ? 'hover:shadow-[8px_8px_16px_#cbd5e1,-8px_-8px_16px_#ffffff] hover:-translate-y-1 transition-all duration-300' : ''} ${className}`}>
      {children}
    </div>
  );
};

// =============================================================================
// COMPOSANT PRINCIPAL COMPLET
// =============================================================================

interface TaxTrackerProps {
  searchTerm?: string;
}

const EthiopianTaxDashboard: React.FC<TaxTrackerProps> = ({ searchTerm: globalSearch }) => {
  const { transactions: contextTransactions } = useLedger();
  const [selectedRegimes, setSelectedRegimes] = useState<TaxRegimeType[]>(['VAT', 'CIT', 'WHT', 'PAYE']);
  const [businessType, setBusinessType] = useState<BusinessType>('plc');
  const [isConfigured, setIsConfigured] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('2026-01-29');
  const [showERCAModal, setShowERCAModal] = useState(false);
  const [expandedRegime, setExpandedRegime] = useState<string | null>(null);
  const [showCompatibilityMatrix, setShowCompatibilityMatrix] = useState(false);
  const [selectedCombination, setSelectedCombination] = useState<CombinationType | null>('standard');
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Ethiopian Trading Solutions PLC',
    tin: 'TIN-9876543210',
    address: 'Bole Road, Addis Ababa',
    phone: '+251 911 234 567'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLedgerExpanded, setIsLedgerExpanded] = useState(false);

  // Adaptation des données du contexte pour le Tax Tracker
  const transactions = useMemo<MasterLedgerTransaction[]>(() => {
    const ctxTxs = Array.isArray(contextTransactions) ? contextTransactions : [];
    const allTxs = ctxTxs;

    return allTxs.map((tx: any) => {
      const categoryUpper = (tx.category || 'GENERAL').toUpperCase();
      const isIncome = tx.type === 'INCOME';
      
      return {
        id: tx.id,
        date: typeof tx.date === 'string' ? tx.date : new Date(tx.date).toISOString().split('T')[0],
        type: tx.type,
        amount: Math.abs(tx.amount) * 100, // Conversion en centimes pour le formatETB existant
        description: tx.item || tx.description || 'Transaction',
        source: 'Master Ledger',
        category: categoryUpper as any,
        vatApplicable: tx.vatApplicable !== undefined ? tx.vatApplicable : true,
        withholdingEligible: ['CONTRACTOR', 'RENT', 'COMMISSION', 'CONSULTANT'].some(c => categoryUpper.includes(c)),
        deductible: tx.type === 'EXPENSE',
        reference: tx.id.substring(0, 8).toUpperCase(),
        counterparty: 'External Party'
      };
    });
  }, [contextTransactions]);

  const effectiveSearch = globalSearch || searchTerm;

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => 
      tx.description.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      tx.category?.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      tx.amount.toString().includes(effectiveSearch)
    );
  }, [transactions, effectiveSearch]);

  const toggleRegime = (regimeId: TaxRegimeType) => {
    setSelectedRegimes(prev => 
      prev.includes(regimeId) 
        ? prev.filter(r => r !== regimeId)
        : [...prev, regimeId]
    );
  };

  const handleCombinationSelect = (combo: CombinationType) => {
    setSelectedCombination(combo);
    const config = COMBINATION_CONFIGS[combo];
    setSelectedRegimes(config.regimes);
    setBusinessType(config.businessType);
    // Auto-configure pour montrer que c'est lié
    setIsConfigured(true);
  };

  const calculations = useMemo<TaxCalculationState>(() => {
    const totalIncome = filteredTransactions.filter(tx => tx.type === 'INCOME').reduce((acc, tx) => acc + Number(tx.amount), 0) / 100;
    const totalExpenses = filteredTransactions.filter(tx => tx.type === 'EXPENSE').reduce((acc, tx) => acc + Number(tx.amount), 0) / 100;

    const vatOutput = selectedRegimes.includes('VAT') ? filteredTransactions.filter(tx => tx.type === 'INCOME' && tx.vatApplicable).reduce((acc, tx) => acc + (Number(tx.amount) * 0.15), 0) / 100 : 0;
    const vatInput = selectedRegimes.includes('VAT') ? filteredTransactions.filter(tx => tx.type === 'EXPENSE' && tx.vatApplicable && tx.deductible !== false).reduce((acc, tx) => acc + (Number(tx.amount) * 0.15), 0) / 100 : 0;
    
    const totBase = filteredTransactions.filter(tx => tx.type === 'INCOME').reduce((acc, tx) => acc + Number(tx.amount), 0) / 100;
    const totAmount = selectedRegimes.includes('TOT') ? totBase * 0.02 : 0;
    
    const withholdingTax = selectedRegimes.includes('WHT') ? filteredTransactions.filter(tx => tx.type === 'EXPENSE' && tx.withholdingEligible && Number(tx.amount) > 100000).reduce((acc, tx) => acc + (Number(tx.amount) * 0.02), 0) / 100 : 0;
    
    const deductibleExpenses = filteredTransactions.filter(tx => tx.type === 'EXPENSE' && tx.deductible).reduce((acc, tx) => acc + Number(tx.amount), 0) / 100;
    const profitBeforeTax = Math.max(0, totalIncome - deductibleExpenses);
    const profitTax = selectedRegimes.includes('CIT') ? profitBeforeTax * 0.30 : 0;
    
    const exciseTax = selectedRegimes.includes('EXCISE') ? filteredTransactions.filter(tx => tx.category === 'EXCISE' && tx.type === 'EXPENSE').reduce((acc, tx) => acc + (Number(tx.amount) * 0.50), 0) / 100 : 0;
    const customsDuty = selectedRegimes.includes('CUSTOMS') ? filteredTransactions.filter(tx => tx.category === 'IMPORT').reduce((acc, tx) => acc + (Number(tx.amount) * 0.20), 0) / 100 : 0;
    const payeTax = selectedRegimes.includes('PAYE') ? filteredTransactions.filter(tx => tx.category === 'SALARY').reduce((acc, tx) => acc + (Number(tx.amount) * 0.10), 0) / 100 : 0;
    const stampDuty = selectedRegimes.includes('STAMP') ? 15000 : 0;
    const presumptiveTax = selectedRegimes.includes('PRESUMPTIVE') ? 50000 : 0;

    const totalLiability = Math.max(0, vatOutput - vatInput) + totAmount + withholdingTax + profitTax + exciseTax + customsDuty + payeTax + stampDuty + presumptiveTax;
    
    return {
      vatOutput, vatInput, totAmount, withholdingTax, profitBeforeTax, profitTax, 
      exciseTax, customsDuty, payeTax, stampDuty, presumptiveTax, totalLiability,
      netCashFlow: totalIncome - totalExpenses - totalLiability
    };
  }, [filteredTransactions, selectedRegimes]);

  // Calcul détaillé avec justifications liées au Master Ledger
  const taxDetails = useMemo(() => {
    const details: Record<string, TaxDetail> = {};
    
    if (selectedRegimes.includes('VAT')) {
      const vatTransactions = filteredTransactions.filter(tx => tx.vatApplicable);
      const outputTx = vatTransactions.filter(tx => tx.type === 'INCOME');
      const inputTx = vatTransactions.filter(tx => tx.type === 'EXPENSE' && tx.deductible !== false);
      const outputAmount = outputTx.reduce((acc, tx) => acc + (Number(tx.amount) * 0.15), 0) / 100;
      const inputAmount = inputTx.reduce((acc, tx) => acc + (Number(tx.amount) * 0.15), 0) / 100;
      
      details['VAT'] = {
        amount: Math.max(0, outputAmount - inputAmount),
        justification: 'VAT collected on sales minus deductible VAT on business-related purchases.',
        baseCalculation: `(${outputTx.length} sales operations × 15%) - (${inputTx.length} purchase operations × 15%)`,
        transactions: vatTransactions
      };
    }
    
    if (selectedRegimes.includes('TOT')) {
      const incomeTx = filteredTransactions.filter(tx => tx.type === 'INCOME');
      const base = incomeTx.reduce((acc, tx) => acc + Number(tx.amount), 0) / 100;
      details['TOT'] = {
        amount: base * 0.02,
        justification: 'Flat tax of 2% on total turnover. No deduction possible unlike VAT.',
        baseCalculation: `Total Turnover ${formatETBRaw(base)} × 2%`,
        transactions: incomeTx
      };
    }
    
    if (selectedRegimes.includes('CIT')) {
      const deductibleTx = filteredTransactions.filter(tx => tx.type === 'EXPENSE' && tx.deductible);
      const income = filteredTransactions.filter(tx => tx.type === 'INCOME').reduce((acc, tx) => acc + Number(tx.amount), 0) / 100;
      const expenses = deductibleTx.reduce((acc, tx) => acc + Number(tx.amount), 0) / 100;
      const profit = Math.max(0, income - expenses);
      
      details['CIT'] = {
        amount: profit * 0.30,
        justification: 'Tax on net profits after deduction of justified business-related expenses.',
        baseCalculation: `(Revenue ${formatETBRaw(income)} - Expenses ${formatETBRaw(expenses)}) × 30%`,
        transactions: deductibleTx
      };
    }
    
    if (selectedRegimes.includes('WHT')) {
      const whtTx = filteredTransactions.filter(tx => tx.type === 'EXPENSE' && tx.withholdingEligible && Number(tx.amount) > 100000);
      const amount = whtTx.reduce((acc, tx) => acc + (Number(tx.amount) * 0.02), 0) / 100;
      
      details['WHT'] = {
        amount: amount,
        justification: '2% withholding tax on payments to contractors and service providers (>1,000 ETB).',
        baseCalculation: `${whtTx.length} contractor payments × 2%`,
        transactions: whtTx
      };
    }
    
    if (selectedRegimes.includes('EXCISE')) {
      const exciseTx = filteredTransactions.filter(tx => tx.category === 'EXCISE' && tx.type === 'EXPENSE');
      const amount = exciseTx.reduce((acc, tx) => acc + (Number(tx.amount) * 0.50), 0) / 100;
      
      details['EXCISE'] = {
        amount: amount,
        justification: 'Excise tax on specific products (fuel, alcohol). Average rate of 50% applied here.',
        baseCalculation: `${exciseTx.length} subject product operations × excise rate`,
        transactions: exciseTx
      };
    }
    
    if (selectedRegimes.includes('CUSTOMS')) {
      const importTx = filteredTransactions.filter(tx => tx.category === 'IMPORT');
      const amount = importTx.reduce((acc, tx) => acc + (Number(tx.amount) * 0.20), 0) / 100;
      
      details['CUSTOMS'] = {
        amount: amount,
        justification: 'Import customs duties (average rate of 20% for simulation). Varies by product HS classification.',
        baseCalculation: `CIF Value ${formatETBRaw(importTx.reduce((a, t) => a + Number(t.amount), 0)/100)} × customs rate`,
        transactions: importTx
      };
    }
    
    if (selectedRegimes.includes('PAYE')) {
      const salaryTx = filteredTransactions.filter(tx => tx.category === 'SALARY');
      const amount = salaryTx.reduce((acc, tx) => acc + (Number(tx.amount) * 0.10), 0) / 100;
      
      details['PAYE'] = {
        amount: amount,
        justification: 'Progressive tax on salaries and wages deducted at source by the employer.',
        baseCalculation: `Payroll × effective average rate (~10% for this simulation)`,
        transactions: salaryTx
      };
    }
    
    return details;
  }, [selectedRegimes, filteredTransactions]);

  const handleValidation = () => {
    if (selectedRegimes.length > 0) setIsConfigured(true);
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculer le pourcentage du seuil TVA
  const annualTurnover = transactions
    .filter(tx => tx.type === 'INCOME')
    .reduce((acc, tx) => acc + Number(tx.amount), 0) * 13 / 100; // Projection annuelle simplifiée
  const vatThresholdPercentage = Math.min(100, (annualTurnover / 1000000) * 100);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden pb-12 print:bg-white relative" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      
      <GrainyTexture />
      {/* Styles pour impression */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .shadow-sm { box-shadow: none !important; }
          .bg-slate-50 { background: white !important; }
        }
        .print-only { display: none; }
      `}</style>
      
      {/* =============================================================================
          HEADER ÉDUCATIF COMPLET - SYSTÈME FISCAL ÉTHIOPIEN
          ============================================================================= */}
      <div className="bg-white/80 backdrop-blur-[5px] border-b border-slate-200 print:border-b-2 print:border-slate-300 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Titre principal */}

          {/* Section Définitions Détaillées - CARTES DÉROULANTES */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 print:text-xl">
              <BookOpen className="text-blue-600" />
              Legal Framework of Tax Regimes
              <span className="text-sm font-normal text-slate-500 ml-2">(Click to expand)</span>
            </h2>
            
            <div className="space-y-3">
              {TAX_REGIMES_DEFINITIONS.map((regime) => {
                const Icon = regime.icon;
                const isExpanded = expandedRegime === regime.id;
                
                return (
                  <div 
                    key={regime.id} 
                    className={`bg-white rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                      isExpanded ? 'border-blue-400 shadow-md' : 'border-slate-200 hover:border-slate-300 hover:-translate-y-1 hover:shadow-lg'
                    }`}
                  >
                    <div 
                      className="p-5 cursor-pointer flex items-center justify-between"
                      onClick={() => setExpandedRegime(isExpanded ? null : regime.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-${regime.color}-100`}>
                          <Icon size={24} className={`text-${regime.color}-600`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-slate-800">{regime.name}</h3>
                            <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{regime.legalBasis}</span>
                          </div>
                          <p className="text-sm text-slate-500">{regime.description}</p>
                        </div>
                      </div>
                      <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={24} className="text-slate-400" />
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-slate-100 bg-slate-50/50">
                        <div className="pt-4 space-y-4">
                          <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                              <Info size={16} className="text-blue-500" /> Simple Explanation
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {regime.detailedExplanation}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <h5 className="text-xs font-bold text-blue-800 mb-2 uppercase">Applicable Rates</h5>
                              <div className="space-y-1">
                                {regime.rates.map((rate, idx) => (
                                  <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-slate-600">{rate.label}:</span>
                                    <span className="font-bold text-blue-700">{rate.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                              <h5 className="text-xs font-bold text-emerald-800 mb-2 uppercase">Compatible with</h5>
                              <div className="flex flex-wrap gap-1">
                                {regime.compatibleWith.length > 0 ? (
                                  regime.compatibleWith.map(comp => (
                                    <span key={comp} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                                      {TAX_REGIMES_DEFINITIONS.find(r => r.id === comp)?.name.split(' ')[0]}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-emerald-600">Aucun (Régime exclusif)</span>
                                )}
                              </div>
                            </div>

                            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                              <h5 className="text-xs font-bold text-amber-800 mb-2 uppercase">Incompatible avec</h5>
                              <div className="flex flex-wrap gap-1">
                                {regime.incompatibleWith.length > 0 ? (
                                  regime.incompatibleWith.map(inc => (
                                    <span key={inc} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                                      {TAX_REGIMES_DEFINITIONS.find(r => r.id === inc)?.name.split(' ')[0]}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-slate-500">No major incompatibility</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {regime.threshold && (
                            <div className="flex items-center gap-2 text-sm bg-slate-100 p-2 rounded-lg">
                              <AlertTriangle size={16} className="text-amber-500" />
                              <span className="font-semibold text-slate-700">Application threshold:</span>
                              <span className="text-slate-600">{regime.threshold}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section Combinaisons de Régimes - SÉLECTIONNABLES */}
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] no-print">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Layers className="text-blue-600" />
                  Tax Regime Combinations
                </h2>
                <p className="text-slate-600">Click a combination to automatically apply it to your company</p>
              </div>
              <button 
                onClick={() => setShowCompatibilityMatrix(!showCompatibilityMatrix)}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                {showCompatibilityMatrix ? 'Hide matrix' : 'View Compatibility Matrix'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {(Object.keys(COMBINATION_CONFIGS) as CombinationType[]).map((comboKey) => {
                const combo = COMBINATION_CONFIGS[comboKey];
                const Icon = combo.icon;
                const isSelected = selectedCombination === comboKey;
                
                return (
                  <button
                    key={comboKey}
                    onClick={() => handleCombinationSelect(comboKey)}
                    className={`relative text-left rounded-xl p-5 border-2 transition-all duration-200 group ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]' 
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg hover:-translate-y-1'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-200' : 'bg-slate-100'}`}>
                        <Icon size={24} className={isSelected ? 'text-blue-700' : 'text-slate-600'} />
                      </div>
                      {isSelected && (
                        <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Selected
                        </div>
                      )}
                    </div>
                    
                    <h3 className={`font-bold mb-2 ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                      {combo.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{combo.description}</p>
                    
                    <div className="space-y-1 text-sm">
                      {combo.regimes.slice(0, 4).map(regime => (
                        <div key={regime} className="flex items-center gap-2">
                          <CheckCircle2 size={14} className={isSelected ? 'text-blue-600' : 'text-emerald-500'} />
                          <span className={isSelected ? 'text-blue-800' : 'text-slate-600'}>
                            {TAX_REGIMES_DEFINITIONS.find(r => r.id === regime)?.name.split('(')[0]}
                          </span>
                        </div>
                      ))}
                      {combo.regimes.length > 4 && (
                        <div className="text-xs text-slate-400 pl-6">+ {combo.regimes.length - 4} autres</div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-500 italic">
                        <MousePointer size={12} className="inline mr-1" />
                        Click to configure automatically
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explication de la combinaison sélectionnée */}
            {selectedCombination && (
              <div className="bg-white rounded-xl p-5 border-2 border-blue-200 mb-6 shadow-sm">
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Info size={18} className="text-blue-600" />
                  Why this combination?
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {COMBINATION_CONFIGS[selectedCombination].explanation}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-bold text-slate-700">Active regimes:</span>
                  {COMBINATION_CONFIGS[selectedCombination].regimes.map(regime => (
                    <span key={regime} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      {TAX_REGIMES_DEFINITIONS.find(r => r.id === regime)?.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Matrice de Compatibilité Simplifiée - VERSION EXPERT vs SIMPLE */}
            {showCompatibilityMatrix && (
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 text-lg">Simplified Compatibility Matrix</h3>
                <p className="text-sm text-slate-600 mb-4">
                  This table indicates which regimes can coexist (✓) or are mutually exclusive (✕).
                  <span className="block mt-1 text-amber-600">Tip: If you see an ✕, choose one or the other, never both together.</span>
                </p>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left p-3 text-slate-600 font-bold">Main Regime</th>
                        <th className="text-center p-3 text-blue-600 font-bold">VAT</th>
                        <th className="text-center p-3 text-amber-600 font-bold">TOT</th>
                        <th className="text-center p-3 text-red-600 font-bold">CIT</th>
                        <th className="text-center p-3 text-violet-600 font-bold">WHT</th>
                        <th className="text-center p-3 text-emerald-600 font-bold">Excise</th>
                        <th className="text-center p-3 text-indigo-600 font-bold">PAYE</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      <tr className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 font-semibold text-blue-700">VAT (15%)</td>
                        <td className="text-center p-3 text-slate-400">-</td>
                        <td className="text-center p-3"><span className="bg-red-100 text-red-700 px-2 py-1 rounded font-bold">✕ Exclusive</span></td>
                        <td className="text-center p-3"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">✓ Together</span></td>
                        <td className="text-center p-3"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">✓ Together</span></td>
                        <td className="text-center p-3"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">✓ Together</span></td>
                        <td className="text-center p-3"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">✓ Together</span></td>
                      </tr>
                      <tr className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 font-semibold text-amber-700">TOT (2%)</td>
                        <td className="text-center p-3"><span className="bg-red-100 text-red-700 px-2 py-1 rounded font-bold">✕ Exclusive</span></td>
                        <td className="text-center p-3 text-slate-400">-</td>
                        <td className="text-center p-3"><span className="bg-amber-100 text-amber-800 px-2 py-1 rounded font-bold">~ Optional</span></td>
                        <td className="text-center p-3"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">✓ Together</span></td>
                        <td className="text-center p-3"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">✓ Together</span></td>
                        <td className="text-center p-3"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">✓ Together</span></td>
                      </tr>
                      <tr className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 font-semibold text-red-700">CIT (30%)</td>
                        <td className="text-center p-3"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">✓ Together</span></td>
                        <td className="text-center p-3"><span className="bg-red-100 text-red-700 px-2 py-1 rounded font-bold">✕ Exclusive</span></td>
                        <td className="text-center p-3 text-slate-400">-</td>
                        <td className="text-center p-3"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">✓ Together</span></td>
                        <td className="text-center p-3"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">✓ Together</span></td>
                        <td className="text-center p-3"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">✓ Together</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-emerald-100 rounded"></span>
                    <span className="text-slate-600">Compatible: Works together</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-100 rounded"></span>
                    <span className="text-slate-600">Incompatible: Exclusive choice</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-amber-100 rounded"></span>
                    <span className="text-slate-600">Optional: Depending on structure</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =============================================================================
          SECTION CONFIGURATION
          ============================================================================= */}
      <div className="max-w-4xl mx-auto px-6 mt-8 relative z-10 no-print">
        <GlassCard className="p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="text-blue-600" />
              Company Configuration
            </h2>
            {selectedCombination && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                Configured via: {COMBINATION_CONFIGS[selectedCombination].name}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Company Type</label>
              <select 
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="sole_proprietorship">Sole Proprietorship (TOT eligible)</option>
                <option value="plc">Private Limited Company (PLC)</option>
                <option value="partnership">Partnership / General Partnership</option>
                <option value="branch">Branch (Foreign Branch)</option>
                <option value="ngo">ONG / Association</option>
                <option value="cooperative">Cooperative Society</option>
                <option value="joint_venture">Joint Venture</option>
              </select>
              <p className="text-xs text-slate-500 mt-2">
                The company type determines available tax regimes and reporting obligations.
                {selectedCombination && (
                  <span className="text-blue-600 font-semibold block mt-1">
                    Automatically adjusted according to the combination "{COMBINATION_CONFIGS[selectedCombination].name}" selected above.
                  </span>
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Selection of Applicable Tax Regimes
                <span className="text-xs font-normal text-slate-500 block mt-1">
                  Automatically pre-filled according to the chosen combination. You can manually modify if needed.
                </span>
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TAX_REGIMES_DEFINITIONS.map((regime) => {
                  const isSelected = selectedRegimes.includes(regime.id);
                  const Icon = regime.icon;
                  const isCompatible = regime.applicableTo.includes(businessType);
                  const isAutoSelected = selectedCombination && COMBINATION_CONFIGS[selectedCombination].regimes.includes(regime.id);
                  
                  return (
                    <button
                      key={regime.id}
                      onClick={() => isCompatible && toggleRegime(regime.id)}
                      disabled={!isCompatible}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left relative hover:-translate-y-0.5 hover:shadow-md ${
                        !isCompatible ? 'opacity-50 cursor-not-allowed bg-slate-50' :
                        isSelected ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-slate-200 hover:border-blue-200 bg-white'
                      }`}
                    >
                      <div className={`flex-shrink-0 ${isSelected ? 'text-blue-600' : isCompatible ? 'text-slate-400' : 'text-slate-300'}`}>
                        {isSelected ? <CheckSquare size={24} /> : <Square size={24} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Icon size={16} className={isSelected ? 'text-blue-600' : 'text-slate-400'} />
                          <span className="font-bold text-sm">{regime.name}</span>
                          {!isCompatible && <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded">Not applicable</span>}
                          {isAutoSelected && isSelected && (
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Auto</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{regime.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {selectedRegimes.length === 0 && (
                <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                  <AlertTriangle size={14} /> Please select at least one tax regime
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={handleValidation}
              disabled={selectedRegimes.length === 0}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-xl disabled:bg-slate-300 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-lg"
            >
              <Calculator size={24} />
              Calculate Tax Obligations
              <ChevronRight size={24} />
            </button>
          </div>
        </GlassCard>
      </div>

      {/* =============================================================================
          TABLEAU DE BORD FISCAL AVEC Bannière de Montants et Justifications
          ============================================================================= */}
      {isConfigured && (
        <div className="max-w-7xl mx-auto px-6 mt-12 space-y-8 print:mt-4">
          {/* En-tête pour impression */}
          <div className="print-only mb-6 border-2 border-slate-300 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{companyInfo.name}</h2>
                <p className="text-slate-600">TIN: {companyInfo.tin}</p>
                <p className="text-slate-600">{companyInfo.address}</p>
                <p className="text-slate-600">{companyInfo.phone}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">Document Fiscal ERCA</p>
                <p className="text-sm text-slate-500">Generated on: {new Date().toLocaleDateString('en-GB')}</p>
                <p className="text-sm text-slate-500">Period: January 2026</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Tax Dashboard</h2>
              <p className="text-slate-500">
                Company: {businessType.replace(/_/g, ' ')} | Active regimes: {selectedRegimes.length} | 
                Base: Master Ledger
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                <Printer size={18} /> Print / PDF
              </button>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-right">
                <p className="text-sm text-red-600 font-semibold">Estimated Total Tax Liability</p>
                <p className="text-4xl font-black text-red-600">{formatETBRaw(calculations.totalLiability)}</p>
                <p className="text-xs text-red-500 mt-1">Period: January 2026</p>
              </div>
            </div>
          </div>

          {/* BANNIÈRE DES MONTANTS AVEC JUSTIFICATIONS */}
          <div className="bg-white rounded-2xl shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] overflow-hidden">
            <div className="bg-white px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Receipt className="text-blue-600" />
                Detail of Taxes Payable (linked to Master Ledger)
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Each amount is calculated from actual transactions in the ledger
              </p>
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(taxDetails).map(([regimeId, detail]) => {
                const regime = TAX_REGIMES_DEFINITIONS.find(r => r.id === regimeId);
                if (!regime) return null;
                const Icon = regime.icon;
                
                return (
                  <div key={regimeId} className={`bg-${regime.color}-50 rounded-xl p-5 border border-${regime.color}-200`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Icon size={20} className={`text-${regime.color}-600`} />
                        <h4 className="font-bold text-slate-800">{regime.name}</h4>
                      </div>
                      <span className={`text-2xl font-black text-${regime.color}-700`}>
                        {formatETBRaw(detail.amount)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-3 bg-white/50 p-3 rounded-lg">
                      <span className="font-semibold">Justification:</span> {detail.justification}
                    </p>
                    
                    <div className="text-xs text-slate-500 mb-2">
                      <span className="font-semibold">Calculation:</span> {detail.baseCalculation}
                    </div>
                    
                    <div className="text-xs text-slate-400">
                      Based on {detail.transactions.length} Master Ledger transaction(s)
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="bg-white px-6 py-4 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">TOTAL TAX OBLIGATIONS:</span>
                <span className="text-3xl font-black text-red-600">{formatETBRaw(calculations.totalLiability)}</span>
              </div>
            </div>
          </div>

          {/* Cartes de synthèse visuelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-3">
            {selectedRegimes.includes('VAT') && (
              <div className="md:col-span-2 bg-blue-600 rounded-2xl p-6 text-white shadow-sm print:col-span-2 print:shadow-none print:border-2 print:border-blue-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white/20 rounded-xl"><Percent size={32} /></div>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Proc. 285/2002</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Value Added Tax (TVA)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/10 rounded-lg">
                    <p className="text-blue-100 text-sm">Output VAT (Sales)</p>
                    <p className="text-xl font-bold">+{formatETBRaw(calculations.vatOutput)}</p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-lg">
                    <p className="text-blue-100 text-sm">Input VAT (Purchases)</p>
                    <p className="text-xl font-bold">-{formatETBRaw(calculations.vatInput)}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/30 flex justify-between items-center">
                  <span className="font-semibold">Net payable</span>
                  <span className="text-3xl font-black">{formatETBRaw(Math.max(0, calculations.vatOutput - calculations.vatInput))}</span>
                </div>
              </div>
            )}

            {selectedRegimes.includes('TOT') && (
              <div className="bg-amber-500 rounded-2xl p-6 text-white shadow-sm print:shadow-none print:border-2 print:border-amber-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white/20 rounded-xl"><Calculator size={24} /></div>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Proc. 308/2002</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Turnover Tax</h3>
                <p className="text-sm text-amber-100 mb-4">Flat tax on total turnover</p>
                <div className="mt-4 flex justify-between items-end">
                  <span className="text-amber-100">Total TOT (2%)</span>
                  <span className="text-3xl font-black">{formatETBRaw(calculations.totAmount)}</span>
                </div>
              </div>
            )}

            {selectedRegimes.includes('CIT') && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-100 rounded-lg"><TrendingUp size={20} className="text-red-600" /></div>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">CIT 30%</span>
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Corporate Income Tax</h3>
                <p className="text-3xl font-bold text-slate-800 mb-1">{formatETBRaw(calculations.profitTax)}</p>
                <p className="text-xs text-slate-500">Taxable profit: {formatETBRaw(calculations.profitBeforeTax)}</p>
              </div>
            )}

            {selectedRegimes.includes('WHT') && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-violet-100 rounded-lg"><Receipt size={20} className="text-violet-600" /></div>
                  <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded">WHT 2%</span>
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Withholding Tax</h3>
                <p className="text-3xl font-bold text-slate-800 mb-1">{formatETBRaw(calculations.withholdingTax)}</p>
                <p className="text-xs text-slate-500">On payments to contractors</p>
              </div>
            )}

            {selectedRegimes.includes('EXCISE') && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-100 rounded-lg"><Scale size={20} className="text-emerald-600" /></div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Excise</span>
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Excise Tax</h3>
                <p className="text-3xl font-bold text-slate-800 mb-1">{formatETBRaw(calculations.exciseTax)}</p>
                <p className="text-xs text-slate-500">Fuel, tobacco, alcohol</p>
              </div>
            )}

            {selectedRegimes.includes('CUSTOMS') && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-100 rounded-lg"><Landmark size={20} className="text-orange-600" /></div>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">Douanes</span>
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Import Duties</h3>
                <p className="text-3xl font-bold text-slate-800 mb-1">{formatETBRaw(calculations.customsDuty)}</p>
                <p className="text-xs text-slate-500">Customs duty + Surtax</p>
              </div>
            )}

            {selectedRegimes.includes('PAYE') && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-100 rounded-lg"><Users size={20} className="text-indigo-600" /></div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">PAYE</span>
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Tax on Salaries</h3>
                <p className="text-3xl font-bold text-slate-800 mb-1">{formatETBRaw(calculations.payeTax)}</p>
                <p className="text-xs text-slate-500">Monthly withholding</p>
              </div>
            )}

            {selectedRegimes.includes('STAMP') && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-rose-100 rounded-lg"><FileText size={20} className="text-rose-600" /></div>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">Stamp</span>
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Stamp Duties</h3>
                <p className="text-3xl font-bold text-slate-800 mb-1">{formatETBRaw(calculations.stampDuty)}</p>
                <p className="text-xs text-slate-500">Contracts and documents</p>
              </div>
            )}

            {selectedRegimes.includes('PRESUMPTIVE') && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-cyan-100 rounded-lg"><HelpCircle size={20} className="text-cyan-600" /></div>
                  <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-1 rounded">Forfait</span>
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Presumptive Tax</h3>
                <p className="text-3xl font-bold text-slate-800 mb-1">{formatETBRaw(calculations.presumptiveTax)}</p>
                <p className="text-xs text-slate-500">Presumptive Regime</p>
              </div>
            )}

            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-100 rounded-lg"><Wallet size={20} className="text-indigo-600" /></div>
              </div>
              <p className="text-sm text-indigo-600 mb-1">Net Cash Flow</p>
              <p className={`text-3xl font-bold ${calculations.netCashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatETBRaw(calculations.netCashFlow)}
              </p>
              <p className="text-xs text-indigo-500 mt-2">After all tax charges</p>
            </div>

            <div 
              onClick={() => setShowERCAModal(true)}
              className="bg-slate-800 rounded-2xl p-6 text-white cursor-pointer hover:bg-slate-700 hover:-translate-y-1 hover:shadow-xl transition-all flex flex-col justify-between no-print"
            >
              <div className="p-2 bg-white/10 rounded-lg w-fit mb-3"><Download size={20} /></div>
              <div>
                <p className="font-bold mb-1">Generate Declarations</p>
                <p className="text-xs text-slate-300">Official ERCA format</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsConfigured(false)}
            className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 no-print"
          >
            <ArrowRightLeft size={14} /> Modify configuration
          </button>
        </div>
      )}

      {/* =============================================================================
          MASTER LEDGER
          ============================================================================= */}
      <div className={`max-w-7xl mx-auto px-6 ${isConfigured ? 'mt-12' : 'mt-8'} print:mt-8`}>
        <GlassCard className="p-6 overflow-hidden print:border-2 print:border-slate-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><ScrollText size={24} className="text-blue-600" /></div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Master Ledger</h3>
                <p className="text-sm text-slate-500">Complete financial flow journal - Single source of truth</p>
              </div>
            </div>
            <div className="flex items-center gap-3 no-print">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white rounded-lg text-sm outline-none w-48 shadow-[inset_2px_2px_5px_#cbd5e1,inset_-2px_-2px_5px_#ffffff]"
                />
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white rounded-lg px-3 py-2 text-sm outline-none shadow-[inset_2px_2px_5px_#cbd5e1,inset_-2px_-2px_5px_#ffffff]"
              />
              <button className="p-2 bg-white rounded-lg transition-all shadow-[5px_5px_10px_#cbd5e1,-5px_-5px_10px_#ffffff] hover:shadow-[inset_2px_2px_5px_#cbd5e1,inset_-2px_-2px_5px_#ffffff] text-slate-600"><Filter size={20} /></button>
              <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-[5px_5px_10px_#cbd5e1,-5px_-5px_10px_#ffffff] hover:translate-y-[-1px]">
                <Download size={18} /><span className="hidden sm:inline text-sm font-semibold">Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 bg-white">
                  <th className="pb-3 pt-2 px-2 font-semibold">Date</th>
                  <th className="pb-3 pt-2 px-2 font-semibold">Item / Description</th>
                  <th className="pb-3 pt-2 px-2 font-semibold">Category</th>
                  <th className="pb-3 pt-2 px-2 font-semibold text-right">Debit</th>
                  <th className="pb-3 pt-2 px-2 font-semibold text-right">Credit</th>
                  <th className="pb-3 pt-2 px-2 font-semibold text-center">VAT (15%)</th>
                  <th className="pb-3 pt-2 px-2 font-semibold text-xs">Reference</th>
                  <th className="pb-3 pt-2 px-2 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {(isLedgerExpanded ? filteredTransactions : filteredTransactions.slice(0, 10)).map((tx) => {
                  const totalAmount = tx.amount + (tx.vatApplicable ? tx.amount * 0.15 : 0);
                  return (
                  <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-2 text-slate-600 whitespace-nowrap">{tx.date}</td>
                    <td className="py-3 px-2">
                      <p className="font-medium text-slate-800">{tx.description}</p>
                      <p className="text-xs text-slate-400">{tx.counterparty}</p>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        tx.category === 'GOODS' ? 'bg-blue-50 text-blue-600' :
                        tx.category === 'SERVICES' ? 'bg-violet-50 text-violet-600' :
                        tx.category === 'EXCISE' ? 'bg-red-50 text-red-600' :
                        tx.category === 'SALARY' ? 'bg-amber-50 text-amber-600' :
                        tx.category === 'RENT' ? 'bg-orange-50 text-orange-600' :
                        tx.category === 'IMPORT' ? 'bg-cyan-50 text-cyan-600' :
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
                    <td className="py-3 px-2 text-center"></td>
                  </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-white font-semibold text-slate-700">
                <tr className="border-t-2 border-slate-200">
                  <td colSpan={3} className="py-4 px-2">TOTALS</td>
                  <td className="py-4 px-2 text-right text-slate-700">
                    {formatETB(filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((a, t) => a + t.amount + (t.vatApplicable ? t.amount * 0.15 : 0), 0))}
                  </td>
                  <td className="py-4 px-2 text-right text-slate-700">
                    {formatETB(filteredTransactions.filter(t => t.type === 'INCOME').reduce((a, t) => a + t.amount + (t.vatApplicable ? t.amount * 0.15 : 0), 0))}
                  </td>
                  <td className="py-4 px-2 text-center text-blue-600 font-bold">
                    {formatETB(filteredTransactions.reduce((a, t) => a + (t.vatApplicable ? t.amount * 0.15 : 0), 0))}
                  </td>
                  <td colSpan={3}></td>
                </tr>
                {filteredTransactions.length > 10 && (
                  <tr className="border-t border-slate-200">
                    <td colSpan={8} className="text-center py-2">
                      <button onClick={() => setIsLedgerExpanded(!isLedgerExpanded)} className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all flex items-center gap-2 mx-auto">
                        {isLedgerExpanded ? 'Show less' : `Show ${filteredTransactions.length - 10} more transactions...`}
                        <ChevronDown size={16} className={`transition-transform ${isLedgerExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-200">
            <div className="p-4 bg-white rounded-xl shadow-[5px_5px_10px_#cbd5e1,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#cbd5e1,-7px_-7px_14px_#ffffff] hover:-translate-y-1 transition-all duration-300">
              <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-800">{formatETB(filteredTransactions.filter(t => t.type === 'INCOME').reduce((a, t) => a + t.amount, 0))}</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-[5px_5px_10px_#cbd5e1,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#cbd5e1,-7px_-7px_14px_#ffffff] hover:-translate-y-1 transition-all duration-300">
              <p className="text-sm text-slate-500 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-slate-800">{formatETB(filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((a, t) => a + t.amount, 0))}</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-[5px_5px_10px_#cbd5e1,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#cbd5e1,-7px_-7px_14px_#ffffff] hover:-translate-y-1 transition-all duration-300">
              <p className="text-sm text-slate-500 mb-1">Net Balance</p>
              <p className="text-2xl font-bold text-slate-800">{formatETB(filteredTransactions.reduce((acc, t) => acc + (t.type === 'INCOME' ? t.amount : -t.amount), 0))}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* =============================================================================
          MODAL ERCA - DOCUMENT IMPRIMABLE
          ============================================================================= */}
      {showERCAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print">
          <GlassCard className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white" noHover>
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <FileText className="text-violet-600" /> Generate ERCA Declarations
              </h2>
              <button onClick={() => setShowERCAModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Informations Entreprise pour le document */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-800 mb-2">Company Information (for printing)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600">Company Name</label>
                    <input 
                      type="text" 
                      value={companyInfo.name}
                      onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded mt-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">TIN (Tax Identification Number)</label>
                    <input 
                      type="text" 
                      value={companyInfo.tin}
                      onChange={(e) => setCompanyInfo({...companyInfo, tin: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded mt-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">Address</label>
                    <input 
                      type="text" 
                      value={companyInfo.address}
                      onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded mt-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">Phone</label>
                    <input 
                      type="text" 
                      value={companyInfo.phone}
                      onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded mt-1 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {selectedRegimes.includes('VAT') && (
                  <button className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-blue-300 rounded-xl transition-all group hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg"><FileText size={20} className="text-blue-600" /></div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800">VAT Declaration (Form 401)</p>
                        <p className="text-xs text-slate-500">Monthly - Detailed VAT 15% Statement</p>
                        <p className="text-xs text-blue-600 mt-1">Declared amount: {formatETBRaw(Math.max(0, calculations.vatOutput - calculations.vatInput))}</p>
                      </div>
                    </div>
                    <Download size={20} className="text-slate-400 group-hover:text-blue-600" />
                  </button>
                )}
                
                {selectedRegimes.includes('TOT') && (
                  <button className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-amber-300 rounded-xl transition-all group hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg"><FileText size={20} className="text-amber-600" /></div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800">TOT Declaration</p>
                        <p className="text-xs text-slate-500">Quarterly - Turnover Tax 2%</p>
                        <p className="text-xs text-amber-600 mt-1">Declared amount: {formatETBRaw(calculations.totAmount)}</p>
                      </div>
                    </div>
                    <Download size={20} className="text-slate-400 group-hover:text-amber-600" />
                  </button>
                )}

                {selectedRegimes.includes('CIT') && (
                  <button className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-red-300 rounded-xl transition-all group hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg"><FileText size={20} className="text-red-600" /></div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800">Annual CIT Declaration</p>
                        <p className="text-xs text-slate-500">Proc. 979/2016 - Tax 30%</p>
                        <p className="text-xs text-red-600 mt-1">Declared amount: {formatETBRaw(calculations.profitTax)}</p>
                      </div>
                    </div>
                    <Download size={20} className="text-slate-400 group-hover:text-red-600" />
                  </button>
                )}

                {selectedRegimes.includes('PAYE') && (
                  <button className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all group hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg"><FileText size={20} className="text-indigo-600" /></div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800">Monthly PAYE Declaration</p>
                        <p className="text-xs text-slate-500">Tax on salaries - Progressive scale</p>
                        <p className="text-xs text-indigo-600 mt-1">Declared amount: {formatETBRaw(calculations.payeTax)}</p>
                      </div>
                    </div>
                    <Download size={20} className="text-slate-400 group-hover:text-indigo-600" />
                  </button>
                )}

                {selectedRegimes.includes('WHT') && (
                  <button className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-violet-300 rounded-xl transition-all group hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-violet-100 rounded-lg"><FileText size={20} className="text-violet-600" /></div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800">WHT Summary</p>
                        <p className="text-xs text-slate-500">Withholding tax on services</p>
                        <p className="text-xs text-violet-600 mt-1">Declared amount: {formatETBRaw(calculations.withholdingTax)}</p>
                      </div>
                    </div>
                    <Download size={20} className="text-slate-400 group-hover:text-violet-600" />
                  </button>
                )}

                {selectedRegimes.includes('EXCISE') && (
                  <button className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all group hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg"><FileText size={20} className="text-emerald-600" /></div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800">Excise Tax Declaration</p>
                        <p className="text-xs text-slate-500">Specific taxes - Proc. 1186/2020</p>
                        <p className="text-xs text-emerald-600 mt-1">Declared amount: {formatETBRaw(calculations.exciseTax)}</p>
                      </div>
                    </div>
                    <Download size={20} className="text-slate-400 group-hover:text-emerald-600" />
                  </button>
                )}
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <ShieldCheck size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-700">ERCA Legal Obligations</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Declarations must be submitted via the ERCA e-filing portal before legal deadlines (30th of the following month for VAT/PAYE, 4 months after closing for CIT).
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowERCAModal(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold">Cancel</button>
              <button onClick={handlePrint} className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2">
                <Printer size={18} /> Print Declarations
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default EthiopianTaxDashboard;