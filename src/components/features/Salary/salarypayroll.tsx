import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, Wallet, Activity, Briefcase, Building2, Plus, Search, 
  Filter, Download, Edit2, Trash2, CheckCircle, XCircle, Clock, 
  Calendar as CalendarIcon, MoreVertical, 
  FileText, Lock, Unlock, CheckSquare, AlertCircle, Repeat, 
  UserPlus, Settings, LogOut, X, ChevronDown, GripVertical,
  Upload, Camera, Phone, Mail, DollarSign, Percent, Shield, History
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  photo?: string;
  role: string;
  level: 'Junior' | 'Senior' | 'Lead' | 'Manager';
  departmentId: string;
  faydaNumber: string; // 12-14 digits Ethiopian ID
  phone: string;
  email: string;
  grossSalary: number;
  bankAccount?: string;
  bankName?: string;
  status: 'active' | 'inactive';
  attendanceStatus: 'absent' | 'present';
  hireDate: string;
  contractType: 'CDI' | 'CDD' | 'Stage' | 'Freelance';
}

interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  actions: string[];
  employeeIds: string[];
  isActive: boolean;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // HH:MM
  checkOut: string | null; // HH:MM
  status: 'present' | 'absent' | 'late' | 'leave' | 'sick';
  validated: boolean;
  notes?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
  assigneeType?: 'individual' | 'group' | 'department';
  assigneeId?: string;
  startDate?: string;
  startTime?: string;
  deadline?: string;
  isRecurring?: boolean;
  recurrence?: any;
  reminder30min?: boolean;
  completed?: boolean;
}

interface PayrollCalculation {
  employeeId: string;
  grossSalary: number;
  taxableIncome: number;
  incomeTax: number;
  employeePension: number; // 7%
  employerPension: number; // 11%
  netSalary: number;
  monthYear: string;
  processed: boolean;
}

const GrainyTexture = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.15] pointer-events-none mix-blend-overlay z-0">
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
  </svg>
);

// ============================================================================
// UTILITAIRES & VALIDATEURS (Conformité Éthiopienne)
// ============================================================================

const validateFaydaNumber = (fayda: string): boolean => {
  return true; // Validation désactivée pour permettre toute saisie
};

const calculateEthiopianTax = (grossSalary: number): { tax: number; taxable: number } => {
  // Tranches progressives Éthiopie (2024)
  // 0-600: 0%, 601-1650: 10%, 1651-3200: 15%, 3201-5250: 20%, 
  // 5251-7800: 25%, 7801-10900: 30%, 10900+: 35%
  const taxable = Math.max(0, grossSalary - 600); // Déduction personnelle mensuelle
  let tax = 0;
  
  if (taxable <= 0) return { tax: 0, taxable: grossSalary };
  
  const brackets = [
    { limit: 1050, rate: 0.10 },   // 600-1650
    { limit: 1550, rate: 0.15 },   // 1650-3200
    { limit: 2050, rate: 0.20 },   // 3200-5250
    { limit: 2550, rate: 0.25 },   // 5250-7800
    { limit: 3100, rate: 0.30 },   // 7800-10900
    { limit: Infinity, rate: 0.35 } // 10900+
  ];
  
  let remaining = taxable;
  let previousLimit = 0;
  
  for (const bracket of brackets) {
    const bracketSize = Math.min(remaining, bracket.limit - previousLimit);
    if (bracketSize <= 0) break;
    tax += bracketSize * bracket.rate;
    remaining -= bracketSize;
    previousLimit = bracket.limit;
  }
  
  return { tax: Math.round(tax), taxable: grossSalary };
};

const calculatePension = (grossSalary: number) => {
  return {
    employee: Math.round(grossSalary * 0.07),
    employer: Math.round(grossSalary * 0.11),
    total: Math.round(grossSalary * 0.18)
  };
};

const formatETB = (amount: number) => {
  return new Intl.NumberFormat('en-ET', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' ETB';
};

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============================================================================
// DONNÉES MOCKÉES
// ============================================================================

const MOCK_DEPARTMENTS: Department[] = [
  { 
    id: 'dept-1', 
    name: 'Engineering', 
    code: 'ENG-001', 
    description: 'Development and IT infrastructure',
    color: '#3B82F6',
    actions: ['Development', 'DevOps', 'QA'],
    employeeIds: ['emp-1', 'emp-2', 'emp-4'],
    isActive: true 
  },
  { 
    id: 'dept-2', 
    name: 'Human Resources', 
    code: 'HR-002', 
    description: 'Talent management and administration',
    color: '#8B5CF6',
    actions: ['Recruitment', 'Payroll', 'Training'],
    employeeIds: ['emp-3'],
    isActive: true 
  },
  { 
    id: 'dept-3', 
    name: 'Finance', 
    code: 'FIN-003', 
    description: 'Accounting and financial operations',
    color: '#10B981',
    actions: ['Accounting', 'Audit', 'Treasury'],
    employeeIds: ['emp-5'],
    isActive: true 
  }
];

export const MOCK_EMPLOYEES: Employee[] = [
  { 
    id: 'emp-1', 
    firstName: 'Abebe', 
    lastName: 'Bikila', 
    role: 'Senior Developer',
    level: 'Senior',
    departmentId: 'dept-1',
    faydaNumber: '1234567890123',
    phone: '+251911234567',
    email: 'abebe.bikila@agrospace.et',
    grossSalary: 50000,
    status: 'active',
    attendanceStatus: 'absent',
    hireDate: '2023-01-15',
    contractType: 'CDI'
  },
  { 
    id: 'emp-2', 
    firstName: 'Tirunesh', 
    lastName: 'Dibaba', 
    role: 'Project Manager',
    level: 'Manager',
    departmentId: 'dept-1',
    faydaNumber: '9876543210987',
    phone: '+251922345678',
    email: 'tirunesh.dibaba@agrospace.et',
    grossSalary: 65000,
    status: 'active',
    attendanceStatus: 'absent',
    hireDate: '2022-06-01',
    contractType: 'CDI'
  },
  { 
    id: 'emp-3', 
    firstName: 'Haile', 
    lastName: 'Gebrselassie', 
    role: 'HR Specialist',
    level: 'Senior',
    departmentId: 'dept-2',
    faydaNumber: '4567890123456',
    phone: '+251933456789',
    email: 'haile.gebrselassie@agrospace.et',
    grossSalary: 45000,
    status: 'active',
    attendanceStatus: 'absent',
    hireDate: '2023-03-10',
    contractType: 'CDI'
  },
  { 
    id: 'emp-4', 
    firstName: 'Kenenisa', 
    lastName: 'Bekele', 
    role: 'Junior Developer',
    level: 'Junior',
    departmentId: 'dept-1',
    faydaNumber: '7890123456789',
    phone: '+251944567890',
    email: 'kenenisa.bekele@agrospace.et',
    grossSalary: 30000,
    status: 'active',
    attendanceStatus: 'absent',
    hireDate: '2024-01-10',
    contractType: 'CDD'
  },
  { 
    id: 'emp-5', 
    firstName: 'Derartu', 
    lastName: 'Tulu', 
    role: 'Financial Analyst',
    level: 'Lead',
    departmentId: 'dept-3',
    faydaNumber: '3216549870321',
    phone: '+251955678901',
    email: 'derartu.tulu@agrospace.et',
    grossSalary: 55000,
    status: 'active',
    attendanceStatus: 'absent',
    hireDate: '2022-11-20',
    contractType: 'CDI'
  }
];

// ============================================================================
// SOUS-COMPOSANTS UI (Glassmorphisme)
// ============================================================================

const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}> = ({ 
  children, 
  className = '', 
  hoverEffect = true,
  onClick,
  style
}) => (
  <div 
    className={`
      bg-white rounded-2xl shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff]
      ${hoverEffect ? 'hover:shadow-[8px_8px_16px_#cbd5e1,-8px_-8px_16px_#ffffff] hover:-translate-y-1 transition-all duration-300' : ''}
      ${className}
    `}
    onClick={onClick}
    style={style}
  >
    {children}
  </div>
);

const GlassButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}> = ({ children, onClick, variant = 'primary', size = 'md', className = '', disabled, type = 'button' }) => {
  const variants = {
    primary: 'bg-blue-600/80 hover:bg-blue-600 text-white border-blue-500/50 shadow-blue-500/20',
    secondary: 'bg-slate-700/50 hover:bg-slate-700/70 text-slate-200 border-slate-600/50',
    danger: 'bg-red-600/80 hover:bg-red-600 text-white border-red-500/50 shadow-red-500/20',
    success: 'bg-emerald-600/80 hover:bg-emerald-600 text-white border-emerald-500/50 shadow-emerald-500/20',
    ghost: 'bg-transparent hover:bg-white/10 text-slate-300 border-transparent'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-2 rounded-lg font-semibold
        border backdrop-blur-md transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

const StatusToggle: React.FC<{
  active: boolean;
  onChange: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}> = ({ active, onChange, disabled, size = 'md' }) => (
  <button
    onClick={onChange}
    disabled={disabled}
    className={`
      relative inline-flex items-center rounded-full transition-colors duration-300 focus:outline-none
      ${active ? 'bg-emerald-500' : 'bg-slate-600'}
      ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'}
      ${size === 'sm' ? 'h-5 w-9' : 'h-6 w-11'}
    `}
  >
    <span
      className={`
        inline-block transform rounded-full bg-white shadow-lg transition-transform duration-300
        ${active ? 'translate-x-5' : 'translate-x-1'}
        ${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}
      `}
    />
  </button>
);

const DepartmentBadge: React.FC<{ department: Department; size?: 'sm' | 'md' }> = ({ department, size = 'md' }) => (
  <span 
    className={`
      inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium border
      ${size === 'sm' ? 'text-xs' : 'text-sm'}
    `}
    style={{ 
      backgroundColor: `${department.color}20`,
      borderColor: `${department.color}40`,
      color: department.color
    }}
  >
    <Briefcase size={size === 'sm' ? 10 : 12} />
    {department.name}
  </span>
);

const LevelBadge: React.FC<{ level: Employee['level'] }> = ({ level }) => {
  const colors = {
    Junior: 'bg-blue-100 text-blue-800 border-blue-200',
    Senior: 'bg-purple-100 text-purple-800 border-purple-200',
    Lead: 'bg-orange-100 text-orange-800 border-orange-200',
    Manager: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };
  
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${colors[level]}`}>
      {level}
    </span>
  );
};

// ============================================================================
// MODALES
// ============================================================================

const AdminAuthModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAuth: () => void;
}> = ({ isOpen, onClose, onAuth }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation auth admin
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      onAuth();
      onClose();
      setCredentials({ username: '', password: '' });
      setError('');
    } else {
      setError('Invalid admin credentials');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <GlassCard className="w-full max-w-md p-6 m-4" hoverEffect={false}>
        <div className="flex items-center gap-3 mb-6 text-amber-400">
          <Lock size={24} />
          <h2 className="text-xl font-bold text-white">Admin Authentication</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Admin Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Enter admin username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <GlassButton variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </GlassButton>
            <GlassButton variant="primary" className="flex-1" type="submit">
              Authenticate
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

interface PayrollHRManagementProps {
  searchTerm?: string;
}

// Hook personnalisé pour calculer les stats de présence
const useAttendanceStats = (employees: Employee[]) => {
  return useMemo(() => {
    const activeEmployees = employees.filter(e => e.status === 'active');
    const presentCount = employees.filter(e => 
      e.status === 'active' && e.attendanceStatus === 'present'
    ).length;
    const attendanceRate = activeEmployees.length > 0 ? 
      Math.round((presentCount / activeEmployees.length) * 100) : 0;
    
    return {
      activeEmployees,
      presentCount,
      attendanceRate,
      totalEmployees: activeEmployees.length
    };
  }, [employees]);
};

const PayrollHRManagement: React.FC<PayrollHRManagementProps> = ({ searchTerm: globalSearch }) => {
  // États principaux
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [payrollCalculations, setPayrollCalculations] = useState<PayrollCalculation[]>([]);
  
  // États UI
  const [activeTab, setActiveTab] = useState<'overview' | 'salary' | 'attendance'>('overview');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminSessionTime, setAdminSessionTime] = useState(0);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notifications, setNotifications] = useState<string[]>([]);
  
  // États Modales
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState<string | null>(null);
  const [showAttendanceHistory, setShowAttendanceHistory] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAutomateSalaries, setShowAutomateSalaries] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showCheckInInputModal, setShowCheckInInputModal] = useState(false);
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [isAutomateSalariesEnabled, setIsAutomateSalariesEnabled] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'month' | 'week' | 'custom'>('month');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  
  // États Formulaires
  const [newDepartment, setNewDepartment] = useState<Partial<Department>>({
    name: '',
    description: '',
    color: '#3B82F6',
    actions: [],
    employeeIds: []
  });
  
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    status: 'active',
    contractType: 'CDI',
    departmentId: ''
  });
  
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    assigneeType: 'individual',
    isRecurring: false,
    reminder30min: true
  });
  
  const [wizardStep, setWizardStep] = useState(1);
  const [faydaError, setFaydaError] = useState('');

  // ============================================================================
  // EFFETS
  // ============================================================================
  
  // Timer session admin (30 min = 1800s)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAdminMode) {
      interval = setInterval(() => {
        setAdminSessionTime(prev => {
          if (prev >= 1800) {
            setIsAdminMode(false);
            setNotifications(prev => [...prev, 'Admin session expired']);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isAdminMode]);

  // Initialisation présence aujourd'hui
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const existing = attendanceRecords.filter(r => r.date === today);
    if (existing.length === 0 && employees.length > 0) {
      const newRecords: AttendanceRecord[] = employees.map(emp => ({
        id: generateId('att'),
        employeeId: emp.id,
        date: today,
        checkIn: null,
        checkOut: null,
        status: 'absent',
        validated: false
      }));
      setAttendanceRecords([...attendanceRecords, ...newRecords]);
    }
  }, []);

  // ============================================================================
  // CALCULS & MEMO
  // ============================================================================
  
  // Utiliser le hook personnalisé pour les stats de présence
  const attendanceStats = useAttendanceStats(employees);

  const stats = useMemo(() => {
    const activeEmployees = employees.filter(e => e.status === 'active');
    const totalPayroll = activeEmployees.reduce((sum, e) => sum + e.grossSalary, 0);
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendanceRecords.filter(r => r.date === today);
    const presentCount = todayAttendance.filter(r => r.status === 'present' || r.status === 'late').length;
    const attendanceRate = activeEmployees.length > 0 ? (presentCount / activeEmployees.length) * 100 : 0;
    
    return {
      totalEmployees: activeEmployees.length,
      totalPayroll,
      attendanceRate: Math.round(attendanceRate),
      totalDepartments: departments.length
    };
  }, [employees, attendanceRecords, departments]);

  const todayAttendance = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return attendanceRecords.filter(r => r.date === today);
  }, [attendanceRecords, selectedDate]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAdminToggle = () => {
    if (!isAdminMode) {
      setShowAdminAuth(true);
    } else {
      setIsAdminMode(false);
      setAdminSessionTime(0);
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminMode(true);
    setAdminSessionTime(0);
  };

  const handleCheckInProcess = () => {
    setShowPermissionModal(false);
    setShowCheckInInputModal(true);
  };

  const handleManualValidation = () => {
    // Logique de validation manuelle
    setEmployees(prev => prev.map(emp => 
      emp.attendanceStatus === 'present' ? { ...emp } : emp
    ));
    setShowCheckInInputModal(false);
    setNotifications(prev => [...prev, 'Attendance validated manually']);
  };

  const handleAutomation = () => {
    // Automatisation
    setEmployees(prev => prev.map(emp => ({ ...emp, attendanceStatus: 'present' })));
    setShowCheckInInputModal(false);
    setNotifications(prev => [...prev, 'Attendance automated (09:00 - 18:00)']);
  };

  // Fonction mise à jour qui lie la case à cocher au pourcentage
  const toggleEmployeeStatus = (id: string) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { 
        ...emp, 
        attendanceStatus: emp.attendanceStatus === 'present' ? 'absent' : 'present' 
      } : emp
    ));
    
    // Notification pour débogage
    const employee = employees.find(e => e.id === id);
    if (employee) {
      const newStatus = employee.attendanceStatus === 'present' ? 'absent' : 'present';
      setNotifications(prev => [...prev, 
        `${employee.firstName} ${employee.lastName} marked as ${newStatus}`
      ]);
    }
  };

  // CORRECTION 1: Fonction validateAllAttendance corrigée avec type explicite
  const validateAllAttendance = useCallback(() => {
    setEmployees(prev => prev.map(emp => ({ ...emp, attendanceStatus: 'present' })));
    setNotifications(prev => [...prev, 'All employees marked as present']);
  }, []);

  const handleEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setNewEmployee({ ...emp });
    setWizardStep(1);
    setShowAddEmployee(true);
  };

  const handleDeleteEmployee = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      setEmployees(prev => prev.filter(e => e.id !== id));
      setAttendanceRecords(prev => prev.filter(r => r.employeeId !== id));
      setNotifications(prev => [...prev, 'Employee deleted successfully']);
    }
  };

  // CORRECTION 3: Fonction handleAddEmployee avec accolade fermante manquante ajoutée
  const handleAddEmployee = () => {
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.faydaNumber) return;
    
    if (editingEmployee) {
      // Update existing
      setEmployees(prev => prev.map(e => e.id === editingEmployee.id ? { ...e, ...newEmployee } as Employee : e));
      setEditingEmployee(null);
    } else {
      // Create new
      const emp: Employee = {
        id: generateId('emp'),
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        role: newEmployee.role || 'New Employee',
        level: newEmployee.level || 'Junior',
        departmentId: newEmployee.departmentId || departments[0]?.id || '',
        faydaNumber: newEmployee.faydaNumber,
        phone: newEmployee.phone || '',
        email: newEmployee.email || '',
        grossSalary: newEmployee.grossSalary || 30000,
        status: 'active',
        attendanceStatus: 'absent',
        hireDate: new Date().toISOString().split('T')[0],
        contractType: newEmployee.contractType || 'CDI'
      };
      
      setEmployees([...employees, emp]);
      
      // Créer entrée attendance pour demain si activé immédiatement
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const newRecord: AttendanceRecord = {
        id: generateId('att'),
        employeeId: emp.id,
        date: tomorrow.toISOString().split('T')[0],
        checkIn: null,
        checkOut: null,
        status: 'absent',
        validated: false
      };
      setAttendanceRecords([...attendanceRecords, newRecord]);
    }
    
    setShowAddEmployee(false);
    setWizardStep(1);
    setNewEmployee({ status: 'active', contractType: 'CDI', departmentId: '' });
    setFaydaError('');
  };

  const handleAutomateSalaries = () => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const calculations: PayrollCalculation[] = employees
      .filter(e => e.status === 'active')
      .map(emp => {
        const { tax, taxable } = calculateEthiopianTax(emp.grossSalary);
        const pension = calculatePension(emp.grossSalary);
        return {
          employeeId: emp.id,
          grossSalary: emp.grossSalary,
          taxableIncome: taxable,
          incomeTax: tax,
          employeePension: pension.employee,
          employerPension: pension.employer,
          netSalary: emp.grossSalary - tax - pension.employee,
          monthYear: currentMonth,
          processed: true
        };
      });
    
    setPayrollCalculations(calculations);
    setShowAutomateSalaries(true);
    setNotifications(prev => [...prev, `Payroll automated for ${calculations.length} employees`]);
  };

  const handleAddTask = () => {
    if (!newTask.title) return;
    
    const task: Task = {
      id: generateId('task'),
      title: newTask.title || '',
      description: newTask.description || '',
      status: 'pending',
      assigneeType: newTask.assigneeType || 'individual',
      assigneeId: newTask.assigneeId || '',
      assignee: employees.find(e => e.id === newTask.assigneeId)?.firstName || '',
      startDate: newTask.startDate || new Date().toISOString().split('T')[0],
      startTime: newTask.startTime || '09:00',
      deadline: newTask.deadline || new Date().toISOString().split('T')[0],
      dueDate: newTask.deadline || new Date().toISOString().split('T')[0],
      priority: newTask.priority || 'medium',
      isRecurring: newTask.isRecurring || false,
      recurrence: newTask.recurrence,
      reminder30min: newTask.reminder30min ?? true,
      completed: false
    };
    
    setTasks([...tasks, task]);
    setShowAddTask(false);
    setNewTask({ priority: 'medium', assigneeType: 'individual', isRecurring: false, reminder30min: true, completed: false });
  };

  const handleEditDepartment = (dept: Department) => {
    setEditingDepartment(dept);
    setNewDepartment({
      name: dept.name,
      code: dept.code,
      description: dept.description,
      color: dept.color,
      actions: dept.actions,
      employeeIds: dept.employeeIds
    });
    setShowAddDepartment(true);
  };

  const handleAddDepartment = () => {
    if (!newDepartment.name) return;
    
    if (editingDepartment) {
      setDepartments(prev => prev.map(d => d.id === editingDepartment.id ? { ...d, ...newDepartment } as Department : d));
      setEditingDepartment(null);
      setNotifications(prev => [...prev, 'Department updated successfully']);
    } else {
      const dept: Department = {
        id: generateId('dept'),
        name: newDepartment.name || '',
        code: newDepartment.code || `DEPT-${String(departments.length + 1).padStart(3, '0')}`,
        description: newDepartment.description || '',
        color: newDepartment.color || '#3B82F6',
        actions: newDepartment.actions || [],
        employeeIds: [],
        isActive: true
      };
      setDepartments([...departments, dept]);
      setNotifications(prev => [...prev, 'Department created successfully']);
    }
    
    setShowAddDepartment(false);
    setNewDepartment({ name: '', description: '', color: '#3B82F6', actions: [], employeeIds: [] });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Employee List', 14, 20);
    
    let y = 30;
    doc.setFontSize(12);
    employees.forEach(emp => {
       if (y > 270) { doc.addPage(); y = 20; }
       doc.text(`${emp.firstName} ${emp.lastName} - ${emp.role} (${emp.email})`, 14, y);
       y += 10;
    });
    
    doc.save('employees_list.pdf');
    setNotifications(prev => [...prev, 'Employee list PDF exported']);
  };

  const handleAutomateSalariesToggle = () => {
    setIsAutomateSalariesEnabled(!isAutomateSalariesEnabled);
    if (!isAutomateSalariesEnabled) {
      handleAutomateSalaries();
    }
  };

  const handleExportBankTransfer = () => {
    if (payrollCalculations.length === 0) return;
    
    const headers = ['Employee ID', 'Name', 'Bank Account', 'Bank Name', 'Net Salary', 'Month'];
    const rows = payrollCalculations.map(calc => {
      const emp = employees.find(e => e.id === calc.employeeId);
      return [
        calc.employeeId,
        `"${emp?.firstName} ${emp?.lastName}"`,
        `"${emp?.bankAccount || 'N/A'}"`,
        `"${emp?.bankName || 'N/A'}"`,
        calc.netSalary,
        calc.monthYear
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bank_transfer_${new Date().toISOString().slice(0, 7)}.csv`;
    link.click();
    
    setNotifications(prev => [...prev, 'Bank transfer CSV exported']);
  };

  const handleGeneratePayslips = () => {
    if (payrollCalculations.length === 0) return;
    
    const doc = new jsPDF();
    let y = 20;
    
    doc.setFontSize(16);
    doc.text('Payslips Generation', 14, y);
    y += 15;
    
    payrollCalculations.forEach((calc) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      const emp = employees.find(e => e.id === calc.employeeId);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Payslip: ${emp?.firstName} ${emp?.lastName}`, 14, y);
      y += 7;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Gross Salary: ${formatETB(calc.grossSalary)}`, 14, y);
      doc.text(`Taxable Income: ${formatETB(calc.taxableIncome)}`, 80, y);
      y += 5;
      doc.text(`Income Tax: -${formatETB(calc.incomeTax)}`, 14, y);
      doc.text(`Pension (7%): -${formatETB(calc.employeePension)}`, 80, y);
      y += 7;
      doc.setFontSize(12);
      doc.setTextColor(0, 128, 0);
      doc.text(`Net Salary: ${formatETB(calc.netSalary)}`, 14, y);
      
      y += 20;
      doc.setDrawColor(200, 200, 200);
      doc.line(14, y - 10, 196, y - 10);
    });
    
    doc.save(`payslips_${new Date().toISOString().slice(0, 7)}.pdf`);
    setNotifications(prev => [...prev, 'Payslips PDF generated']);
  };

  // ============================================================================
  // RENDU SECTIONS
  // ============================================================================

  const renderKPIs = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <GlassCard className="p-6 bg-white border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-bold text-cyan-600 uppercase tracking-wider mb-1">Total Employees</p>
            <p className="text-4xl font-black text-slate-800">{attendanceStats.totalEmployees}</p>
            <p className="text-xs text-cyan-200/70 mt-2">Active workforce</p>
          </div>
          <div className="p-3 bg-cyan-400/20 rounded-xl">
            <Users className="text-cyan-400" size={24} />
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6 bg-white border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">Total Payroll</p>
            <p className="text-2xl font-black text-slate-800">{formatETB(stats.totalPayroll)}</p>
            <p className="text-xs text-slate-500 mt-2">Monthly gross salaries</p>
          </div>
          <div className="p-3 bg-emerald-400/20 rounded-xl">
            <Wallet className="text-emerald-400" size={24} />
          </div>
        </div>
      </GlassCard>

      {/* KPI ATTENDANCE TODAY - LIÉ AU TABLEAU */}
      <GlassCard className="p-6 bg-white border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-1">Attendance Today</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-slate-800">{attendanceStats.attendanceRate}%</p>
              <span className="text-sm text-slate-500">
                ({attendanceStats.presentCount}/{attendanceStats.totalEmployees})
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Real-time presence rate</p>
          </div>
          <div className="p-3 bg-amber-400/20 rounded-xl">
            <Activity className="text-amber-400" size={24} />
          </div>
        </div>
        <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${attendanceStats.attendanceRate < 80 ? 'bg-red-500' : 'bg-emerald-500'}`}
            style={{ width: `${attendanceStats.attendanceRate}%` }}
          />
        </div>
      </GlassCard>

      <GlassCard className="p-6 bg-white border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-bold text-violet-600 uppercase tracking-wider mb-1">Business Units</p>
            <p className="text-4xl font-black text-slate-800">{stats.totalDepartments}</p>
            <p className="text-xs text-slate-500 mt-2">Active departments</p>
          </div>
          <div className="p-3 bg-violet-400/20 rounded-xl">
            <Briefcase className="text-violet-400" size={24} />
          </div>
        </div>
      </GlassCard>
    </div>
  );

  const renderDepartments = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Building2 size={20} className="text-blue-400" />
          Organizational Structure
        </h2>
        <GlassButton variant="primary" size="sm" onClick={() => setShowAddDepartment(true)}>
          <Plus size={16} />
          Add Department
        </GlassButton>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {departments.map(dept => (
          <GlassCard 
            key={dept.id} 
            className="min-w-[280px] p-5 cursor-pointer relative group"
            onClick={() => handleEditDepartment(dept)}
          >
            <div className="flex items-start justify-between mb-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                style={{ backgroundColor: dept.color }}
              >
                {dept.name.charAt(0)}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleEditDepartment(dept); }}
                className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
              >
                <Edit2 size={16} />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-1">{dept.name}</h3>
            <p className="text-xs text-slate-400 mb-3">{dept.code}</p>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {dept.actions.slice(0, 2).map((action, idx) => (
                <span key={idx} className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-600">
                  {action}
                </span>
              ))}
              {dept.actions.length > 2 && (
                <span className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-600">
                  +{dept.actions.length - 2}
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex -space-x-2">
                {employees
                  .filter(e => dept.employeeIds.includes(e.id))
                  .slice(0, 3)
                  .map((emp, idx) => (
                    <div 
                      key={idx} 
                      className="w-8 h-8 rounded-full bg-slate-600 border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                    >
                      {emp.firstName.charAt(0)}
                    </div>
                  ))}
                {dept.employeeIds.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-white flex items-center justify-center text-xs text-white">
                    +{dept.employeeIds.length - 3}
                  </div>
                )}
              </div>
              <span className="text-sm font-semibold text-slate-500">
                {dept.employeeIds.length} employees
              </span>
            </div>
          </GlassCard>
        ))}
        
        <GlassButton 
          variant="ghost" 
          className="min-w-[200px] border-2 border-dashed border-slate-300 hover:border-slate-400 flex-col gap-3"
          onClick={() => {
            setEditingDepartment(null);
            setNewDepartment({ name: '', description: '', color: '#3B82F6', actions: [], employeeIds: [] });
            setShowAddDepartment(true);
          }}
        >
          <Plus size={32} className="text-slate-400" />
          <span className="text-slate-400">New Department</span>
        </GlassButton>
      </div>
    </div>
  );

  const renderSalarySection = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredEmployees = employees.filter(e => 
      e.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.faydaNumber.includes(searchTerm)
    );

    return (
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="text-emerald-400" />
              Salary & Payroll Management
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Ethiopian Tax Compliant (0-35% Progressive) • Fayda ID Verified
            </p>
          </div>
          <div className="flex gap-3">
            <GlassButton variant="secondary" size="sm" onClick={handleExportPDF}>
              <Download size={16} />
              Export PDF
            </GlassButton>
            <GlassButton 
              variant="primary" 
              size="sm" 
              onClick={() => { setEditingEmployee(null); setNewEmployee({ status: 'active', contractType: 'CDI', departmentId: '' }); setShowAddEmployee(true); }}
              className="bg-gradient-to-r from-blue-600 to-violet-600"
            >
              <UserPlus size={16} />
              Add Employee
            </GlassButton>
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
              <span className="text-xs font-bold text-slate-600">Automate Salaries</span>
              <button 
                onClick={handleAutomateSalariesToggle}
                className={`w-10 h-5 rounded-full transition-colors relative ${isAutomateSalariesEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${isAutomateSalariesEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <GlassCard className="overflow-hidden" hoverEffect={false}>
          <div className="p-4 border-b border-slate-200 flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or Fayda ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="p-4">ID / Photo</th>
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Fayda Number</th>
                  <th className="p-4 text-right">Gross Salary</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEmployees.map(emp => {
                  const dept = departments.find(d => d.id === emp.departmentId);
                  const payroll = payrollCalculations.find(p => p.employeeId === emp.id);
                  const isFaydaValid = validateFaydaNumber(emp.faydaNumber);
                  
                  return (
                    <tr key={emp.id} className="hover:bg-blue-50 transition-all duration-200 hover:shadow-sm hover:scale-[1.005] relative z-0 hover:z-10">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                            ['bg-gradient-to-br from-blue-900 to-blue-700', 'bg-gradient-to-br from-blue-700 to-blue-500', 'bg-gradient-to-br from-blue-600 to-blue-400', 'bg-gradient-to-br from-sky-500 to-sky-300', 'bg-gradient-to-br from-indigo-600 to-indigo-400'][emp.id.charCodeAt(emp.id.length - 1) % 5]
                          }`}>
                            {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                          </div>
                          <span className="text-xs font-mono text-blue-300">{emp.id}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-800">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-slate-400">{emp.email}</p>
                      </td>
                      <td className="p-4">
                        <LevelBadge level={emp.level} />
                        <p className="text-xs text-slate-400 mt-1">{emp.role}</p>
                      </td>
                      <td className="p-4">
                        {dept ? <DepartmentBadge department={dept} size="sm" /> : <span className="text-slate-500">-</span>}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-slate-300">
                            {emp.faydaNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}
                          </span>
                          {isFaydaValid ? (
                            <CheckCircle size={14} className="text-emerald-400" />
                          ) : (
                            <XCircle size={14} className="text-red-400" />
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono text-emerald-400 font-bold">
                          {formatETB(emp.grossSalary)}
                        </span>
                        {payroll && (
                          <div className="text-xs text-slate-400 mt-1">
                            Net: {formatETB(payroll.netSalary)}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <StatusToggle 
                          active={emp.status === 'active'} 
                          onChange={() => {
                            setEmployees(employees.map(e => 
                              e.id === emp.id ? { ...e, status: e.status === 'active' ? 'inactive' : 'active' } : e
                            ));
                          }}
                          size="sm"
                        />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleEditEmployee(emp)}
                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors" 
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteEmployee(emp.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors" 
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    );
  };

  const renderAttendanceSection = () => {
    const [attendanceSearchTerm, setAttendanceSearchTerm] = useState('');
    const effectiveSearch = globalSearch || attendanceSearchTerm;
    const formatTime = (time: string | null) => time || '-';
    const calculateHours = (checkIn: string | null, checkOut: string | null) => {
      if (!checkIn || !checkOut) return '-';
      const [h1, m1] = checkIn.split(':').map(Number);
      const [h2, m2] = checkOut.split(':').map(Number);
      let hours = (h2 + m2/60) - (h1 + m1/60);
      if (hours > 6) hours -= 1; // Pause déjeuner
      return hours.toFixed(1) + 'h';
    };

    const filteredAttendance = todayAttendance.filter(record => {
      const emp = employees.find(e => e.id === record.employeeId);
      return emp && (emp.firstName.toLowerCase().includes(effectiveSearch.toLowerCase()) || emp.lastName.toLowerCase().includes(effectiveSearch.toLowerCase()));
    });

    return (
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Clock className="text-amber-400" />
              Attendance Tracking
            </h2>
            <p className="text-slate-400 text-sm mt-1">{new Date().toLocaleDateString('en-ET', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-xs text-amber-500 font-semibold mt-1">
              Current: {attendanceStats.attendanceRate}% ({attendanceStats.presentCount}/{attendanceStats.totalEmployees})
            </p>
          </div>
          <div className="relative mx-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search employee..."
              value={attendanceSearchTerm}
              onChange={(e) => setAttendanceSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
            />
          </div>
          <div className="flex items-center gap-4">
            {isAdminMode && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 text-sm font-bold animate-pulse">
                <Shield size={16} />
                ADMIN MODE • {Math.floor((1800 - adminSessionTime) / 60)}:{String((1800 - adminSessionTime) % 60).padStart(2, '0')} left
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Edit Mode</span>
              <button 
                onClick={handleAdminToggle}
                className={`p-2 rounded-lg transition-colors ${isAdminMode ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700/50 text-slate-400'}`}
              >
                {isAdminMode ? <Unlock size={20} /> : <Lock size={20} />}
              </button>
            </div>
            <GlassButton 
              variant="primary" 
              size="sm" 
              onClick={() => setShowPermissionModal(true)}
            >
              <CheckSquare size={16} />
              Check-in / Check-out
            </GlassButton>
            <GlassButton 
              variant="secondary" 
              size="sm"
              onClick={() => setShowHistoryModal(true)}
            >
              <History size={16} />
              View History
            </GlassButton>
          </div>
        </div>

        <GlassCard className="overflow-hidden" hoverEffect={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="p-4 w-12">
                    <input 
                      type="checkbox" 
                      checked={attendanceStats.presentCount === attendanceStats.totalEmployees && attendanceStats.totalEmployees > 0}
                      onChange={validateAllAttendance}
                      className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Employee</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Current Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendance.map(record => {
                  const emp = employees.find(e => e.id === record.employeeId);
                  if (!emp) return null;
                  const dept = departments.find(d => d.id === emp.departmentId);

                  return (
                    <tr key={emp.id} className={`transition-all duration-200 hover:shadow-sm hover:scale-[1.005] relative z-0 hover:z-10 ${emp.attendanceStatus === 'present' ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`}>
                      <td className="p-4">
                        <input 
                          type="checkbox" 
                          checked={emp.attendanceStatus === 'present'}
                          onChange={() => toggleEmployeeStatus(emp.id)}
                          className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer transition-all"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-bold">
                            {emp.firstName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 block">{emp.firstName} {emp.lastName}</span>
                            <span className="text-xs text-slate-400">{emp.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {dept ? <DepartmentBadge department={dept} size="sm" /> : '-'}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          emp.attendanceStatus === 'present' 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {emp.attendanceStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => toggleEmployeeStatus(emp.id)}
                          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer hover:opacity-90 active:scale-95 ${
                            emp.attendanceStatus === 'present' 
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                          }`}
                        >
                          {emp.attendanceStatus === 'present' ? 'Mark Absent' : 'Mark Present'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td colSpan={5} className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-slate-600">
                        <span className="font-semibold">Summary:</span> {attendanceStats.presentCount} present, {attendanceStats.totalEmployees - attendanceStats.presentCount} absent
                      </div>
                      <div className="text-sm font-bold text-amber-600">
                        Attendance Rate: {attendanceStats.attendanceRate}%
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </GlassCard>

        {/* Modal 1: Permission */}
        <AnimatePresence>
          {showPermissionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-2xl shadow-2xl w-96">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Enable Time Tracking?</h3>
                <div className="flex gap-3 justify-end">
                  <GlassButton variant="secondary" onClick={() => setShowPermissionModal(false)}>Cancel</GlassButton>
                  <GlassButton variant="primary" onClick={handleCheckInProcess}>Confirm</GlassButton>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal 2: Input & Automation */}
        <AnimatePresence>
          {showCheckInInputModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-2xl shadow-2xl w-96">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Time Entry</h3>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Check-in Time</label>
                    <input type="time" value={checkInTime} onChange={e => setCheckInTime(e.target.value)} className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Check-out Time</label>
                    <input type="time" value={checkOutTime} onChange={e => setCheckOutTime(e.target.value)} className="w-full p-2 border rounded-lg" />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <GlassButton variant="primary" onClick={handleManualValidation}>Validate Manually</GlassButton>
                  <GlassButton variant="success" onClick={handleAutomation}>
                    <Activity size={16} /> Automate (09:00 - 18:00)
                  </GlassButton>
                  <GlassButton variant="secondary" onClick={() => setShowCheckInInputModal(false)}>Close</GlassButton>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal 3: History */}
        <AnimatePresence>
          {showHistoryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-800">Attendance History</h3>
                  <button onClick={() => setShowHistoryModal(false)}><X size={24} className="text-slate-400" /></button>
                </div>
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-4">
                  <select 
                    value={historyFilter} 
                    onChange={(e) => setHistoryFilter(e.target.value as any)}
                    className="p-2 border rounded-lg"
                  >
                    <option value="month">This Month</option>
                    <option value="week">This Week</option>
                    <option value="custom">Custom Range</option>
                  </select>
                  {/* Add date pickers if custom */}
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold sticky top-0">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Employee</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-right">Check In/Out</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attendanceRecords.map(record => {
                        const emp = employees.find(e => e.id === record.employeeId);
                        return (
                          <tr key={record.id}>
                            <td className="p-3 text-slate-600">{record.date}</td>
                            <td className="p-3 font-medium text-slate-800">{emp?.firstName} {emp?.lastName}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${record.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {record.status}
                              </span>
                            </td>
                            <td className="p-3 text-right font-mono text-xs text-slate-500">
                              {record.checkIn || '--:--'} - {record.checkOut || '--:--'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ============================================================================
  // MODALES DÉTAILLÉES
  // ============================================================================

  const renderAddDepartmentModal = () => {
    if (!showAddDepartment) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" style={{ zIndex: 9999 }}>
        <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" hoverEffect={false}>
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="text-blue-400" />
              {editingDepartment ? 'Edit Department' : 'Configure Department'}
            </h2>
            <button onClick={() => setShowAddDepartment(false)} className="text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Department Name *</label>
                <input
                  type="text"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Cybersecurity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Department Code</label>
                <input
                  type="text"
                  value={newDepartment.code || `DEPT-${String(departments.length + 1).padStart(3, '0')}`}
                  onChange={(e) => setNewDepartment({...newDepartment, code: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Description</label>
              <textarea
                value={newDepartment.description}
                onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                placeholder="Department responsibilities..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Color Identity</label>
              <div className="flex gap-3 flex-wrap">
                {['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'].map(color => (
                  <button
                    key={color}
                    onClick={() => setNewDepartment({...newDepartment, color})}
                    className={`w-10 h-10 rounded-xl transition-transform ${newDepartment.color === color ? 'scale-125 ring-2 ring-slate-400' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Department Actions</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add action (e.g., Recruitment)"
                  className="flex-1 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (val) {
                        setNewDepartment({
                          ...newDepartment, 
                          actions: [...(newDepartment.actions || []), val]
                        });
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {newDepartment.actions?.map((action, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm flex items-center gap-2 border border-blue-100">
                    {action}
                    <button 
                      onClick={() => setNewDepartment({
                        ...newDepartment,
                        actions: newDepartment.actions?.filter((_, i) => i !== idx)
                      })}
                      className="hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
            <GlassButton variant="secondary" onClick={() => { setShowAddDepartment(false); setEditingDepartment(null); }}>Cancel</GlassButton>
            <GlassButton 
              variant="primary" 
              onClick={handleAddDepartment}
              disabled={!newDepartment.name}
            >
              {editingDepartment ? 'Update Department' : 'Save Department'}
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    );
  };

  const renderAddEmployeeModal = () => {
    if (!showAddEmployee) return null;

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setNewEmployee({ ...newEmployee, photo: ev.target?.result as string });
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <GlassCard className="w-full max-w-3xl max-h-[90vh] overflow-y-auto" hoverEffect={false}>
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <UserPlus className="text-emerald-400" />
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <div className="hidden mt-2">
                {[1].map(step => (
                  <div 
                    key={step} 
                    className={`h-1.5 w-16 rounded-full ${wizardStep >= step ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  />
                ))}
              </div>
            </div>
            <button onClick={() => { setShowAddEmployee(false); setWizardStep(1); setEditingEmployee(null); }} className="text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Personal Information</h3>
                
                <div className="flex justify-center mb-6">
                  <div className="relative w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-slate-50 transition-colors overflow-hidden">
                    {newEmployee.photo ? (
                      <img src={newEmployee.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Camera size={24} className="text-slate-400 mb-1" />
                        <span className="text-xs text-slate-500">Photo</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={newEmployee.firstName || ''}
                      onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={newEmployee.lastName || ''}
                      onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Fayda ID Number * (Ethiopian National ID)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newEmployee.faydaNumber || ''}
                      onChange={(e) => {
                        setNewEmployee({...newEmployee, faydaNumber: e.target.value});
                        setFaydaError('');
                      }}
                      className={`w-full px-4 py-2 bg-white border rounded-lg text-slate-800 font-mono ${
                        faydaError ? 'border-red-500' : 'border-slate-300'
                      }`}
                      placeholder="Any ID Number"
                    />
                    {newEmployee.faydaNumber && validateFaydaNumber(newEmployee.faydaNumber) && (
                      <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
                    )}
                  </div>
                  {faydaError && <p className="text-red-400 text-xs mt-1">{faydaError}</p>}
                  <p className="text-xs text-slate-500 mt-1">12-14 digits Ethiopian National Identity</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Phone (+251)</label>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-slate-400" />
                      <input
                        type="tel"
                        value={newEmployee.phone || ''}
                        onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                        className="flex-1 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                        placeholder="911 234 567"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-slate-400" />
                      <input
                        type="email"
                        value={newEmployee.email || ''}
                        onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                        className="flex-1 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                      />
                    </div>
                  </div>
                </div>
            
                <div className="border-t border-slate-200 my-4"></div>
                
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Professional Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={newEmployee.role || ''}
                      onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Level</label>
                    <select
                      value={newEmployee.level || 'Junior'}
                      onChange={(e) => setNewEmployee({...newEmployee, level: e.target.value as any})}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                    >
                      <option value="Junior">Junior</option>
                      <option value="Senior">Senior</option>
                      <option value="Lead">Lead</option>
                      <option value="Manager">Manager</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Department</label>
                  <select
                    value={newEmployee.departmentId || ''}
                    onChange={(e) => setNewEmployee({...newEmployee, departmentId: e.target.value})}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Contract Type</label>
                    <select
                      value={newEmployee.contractType || 'CDI'}
                      onChange={(e) => setNewEmployee({...newEmployee, contractType: e.target.value as any})}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                    >
                      <option value="CDI">CDI (Permanent)</option>
                      <option value="CDD">CDD (Fixed Term)</option>
                      <option value="Stage">Internship</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Gross Salary (ETB)</label>
                    <input
                      type="number"
                      value={newEmployee.grossSalary || ''}
                      onChange={(e) => setNewEmployee({...newEmployee, grossSalary: Number(e.target.value)})}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                      min={0}
                      step={1000}
                    />
                  </div>
                </div>
                
                {newEmployee.grossSalary && newEmployee.grossSalary > 0 && (
                  <GlassCard className="p-4 bg-emerald-500/10 border-emerald-500/30">
                    <h4 className="text-sm font-bold text-emerald-400 mb-2">Salary Preview (Ethiopian Tax)</h4>
                    {(() => {
                      const { tax, taxable } = calculateEthiopianTax(newEmployee.grossSalary || 0);
                      const pension = calculatePension(newEmployee.grossSalary || 0);
                      return (
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between text-slate-600">
                            <span>Gross Salary:</span>
                            <span className="font-mono">{formatETB(newEmployee.grossSalary || 0)}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Income Tax (0-35%):</span>
                            <span className="font-mono text-red-400">-{formatETB(tax)}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Pension (7% Employee):</span>
                            <span className="font-mono text-red-400">-{formatETB(pension.employee)}</span>
                          </div>
                          <div className="border-t border-emerald-500/30 pt-1 mt-1 flex justify-between text-emerald-400 font-bold">
                            <span>Net Salary:</span>
                            <span className="font-mono">{formatETB((newEmployee.grossSalary || 0) - tax - pension.employee)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </GlassCard>
                )}
            </div>
          </div>
          
          <div className="p-6 border-t border-slate-100 flex justify-between">
            <GlassButton 
              variant="secondary" 
              onClick={() => setShowAddEmployee(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton 
              variant="primary" 
              onClick={handleAddEmployee}
            >
              {editingEmployee ? 'Update Employee' : 'Create Employee'}
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    );
  };

  const renderAutomateSalariesModal = () => {
    if (!showAutomateSalaries) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <GlassCard className="w-full max-w-4xl max-h-[90vh] overflow-y-auto" hoverEffect={false}>
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity className="text-emerald-400" />
              Payroll Automation Results
            </h2>
            <button onClick={() => setShowAutomateSalaries(false)} className="text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6">
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <h3 className="text-lg font-bold text-emerald-400 mb-2">Ethiopian Tax Compliance Check</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>✓ Progressive tax brackets applied (0%, 10%, 15%, 20%, 25%, 30%, 35%)</li>
                <li>✓ Employee Pension: 7% | Employer Pension: 11%</li>
                <li>✓ Personal deduction: 600 ETB/month</li>
                <li>✓ Fayda ID verification passed for all employees</li>
              </ul>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-slate-400">
                  <tr>
                    <th className="p-3">Employee</th>
                    <th className="p-3 text-right">Gross</th>
                    <th className="p-3 text-right">Taxable</th>
                    <th className="p-3 text-right">Tax</th>
                    <th className="p-3 text-right">Pension (7%)</th>
                    <th className="p-3 text-right font-bold text-emerald-400">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payrollCalculations.map(calc => {
                    const emp = employees.find(e => e.id === calc.employeeId);
                    return (
                      <tr key={calc.employeeId}>
                        <td className="p-3 text-white">{emp?.firstName} {emp?.lastName}</td>
                        <td className="p-3 text-right font-mono">{formatETB(calc.grossSalary)}</td>
                        <td className="p-3 text-right font-mono text-slate-400">{formatETB(calc.taxableIncome)}</td>
                        <td className="p-3 text-right font-mono text-red-400">-{formatETB(calc.incomeTax)}</td>
                        <td className="p-3 text-right font-mono text-amber-400">-{formatETB(calc.employeePension)}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-400">{formatETB(calc.netSalary)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-white/5 font-bold">
                  <tr>
                    <td className="p-3 text-white">TOTALS</td>
                    <td className="p-3 text-right font-mono text-white">
                      {formatETB(payrollCalculations.reduce((a, b) => a + b.grossSalary, 0))}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-400">-</td>
                    <td className="p-3 text-right font-mono text-red-400">
                      {formatETB(payrollCalculations.reduce((a, b) => a + b.incomeTax, 0))}
                    </td>
                    <td className="p-3 text-right font-mono text-amber-400">
                      {formatETB(payrollCalculations.reduce((a, b) => a + b.employeePension, 0))}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-400">
                      {formatETB(payrollCalculations.reduce((a, b) => a + b.netSalary, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="mt-6 flex gap-3">
              <GlassButton variant="secondary" className="flex-1" onClick={handleExportBankTransfer}>
                <Download size={16} />
                Export Bank Transfer (CSV)
              </GlassButton>
              <GlassButton variant="primary" className="flex-1" onClick={handleGeneratePayslips}>
                <FileText size={16} />
                Generate Payslips (PDF)
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  };

  // ============================================================================
  // RENDU PRINCIPAL
  // ============================================================================

  return (
    <div className="min-h-screen bg-white text-slate-800 p-6 antialiased relative" style={{ fontFamily: "'Satoshi', sans-serif" }}>

      {/* Header Navigation */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto relative z-10">
        {renderKPIs()}
        
        {(activeTab === 'overview' || activeTab === 'salary') && renderDepartments()}
        {(activeTab === 'overview' || activeTab === 'salary') && renderSalarySection()}
        {(activeTab === 'overview' || activeTab === 'attendance') && renderAttendanceSection()}
      </div>

      {/* Modales */}
      <AdminAuthModal 
        isOpen={showAdminAuth} 
        onClose={() => setShowAdminAuth(false)} 
        onAuth={handleAdminAuthSuccess}
      />
      {renderAddDepartmentModal()}
      {renderAddEmployeeModal()}
      {renderAutomateSalariesModal()}
    </div>
  );
};

export default PayrollHRManagement;