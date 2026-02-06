// src/context/LedgerContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Transaction, Lang, CompanyProfile, DocFile } from '../types/index';

interface LedgerContextType {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  addTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  language: Lang;
  setLanguage: (lang: Lang) => void;
  profile: CompanyProfile;
  setProfile: React.Dispatch<React.SetStateAction<CompanyProfile>>;
  docs: DocFile[];
  setDocs: React.Dispatch<React.SetStateAction<DocFile[]>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

// Initial Data Mockups
const initialTransactions: Transaction[] = [
  { id: 't1', date: new Date(), source: 'Telebirr', motif: 'Consulting IT (Addis)', amount: 2500, type: 'INCOME', has_file: true, receipt_hash: 'hash_x9s8' },
  { id: 't2', date: new Date(), source: 'Cash', motif: 'Macchiato', amount: 35, type: 'INCOME', has_file: false },
  { id: 't3', date: new Date(), source: 'CBE', motif: 'Office Rent (Bole)', amount: -15000, type: 'EXPENSE', has_file: true, file_type: 'JPG' },
  { id: 't4', date: new Date(), source: 'Telebirr', motif: 'Project Alpha', amount: 12000, type: 'INCOME', has_file: false },
  { id: 't5', date: new Date(), source: 'Cash', motif: 'Supplies', amount: -2000, type: 'EXPENSE', has_file: false },
  { id: 't6', date: new Date(), source: 'CBE', motif: 'Consulting Fee', amount: 8500, type: 'INCOME', has_file: false },
  { id: 't7', date: new Date(), source: 'Telebirr', motif: 'Advance Payment', amount: 20000, type: 'INCOME', has_file: true },
];

const initialProfile: CompanyProfile = {
  initial: 'A.',
  name: 'Abyssinia CyberSec PLC',
  address: 'Addis Ababa, Bole Sub-city, Woreda 03',
  tag: 'HQ',
  tin: '0045992188',
  phone: '+251 911 234 567'
};

const initialDocs: DocFile[] = [
  { name: 'Comm_Licence_2024.pdf', url: '#', type: 'application/pdf', date: '2024-01-01' },
  { name: 'Office_Lease.jpg', url: '#', type: 'image/jpeg', date: '2024-02-15' }
];

export const LedgerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [language, setLanguage] = useState<Lang>('en');
  const [profile, setProfile] = useState<CompanyProfile>(initialProfile);
  const [docs, setDocs] = useState<DocFile[]>(initialDocs);
  const [activeTab, setActiveTab] = useState('general-table');

  return (
    <LedgerContext.Provider value={{ 
      transactions, 
      setTransactions,
      addTransaction: (transaction: Transaction) => setTransactions(prev => [transaction, ...prev]),
      deleteTransaction: (id: string) => setTransactions(prev => prev.filter(t => t.id !== id)),
      language, 
      setLanguage,
      profile,
      setProfile,
      docs,
      setDocs,
      activeTab,
      setActiveTab
    }}>
      {children}
    </LedgerContext.Provider>
  );
};

export const useLedger = () => {
  const context = useContext(LedgerContext);
  if (context === undefined) {
    throw new Error('useLedger must be used within a LedgerProvider');
  }
  return context;
};