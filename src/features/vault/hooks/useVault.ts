import { useState } from 'react';
import { DocFile } from '../../../../types';

// Mock Data
const INITIAL_DOCS: DocFile[] = [
  { name: 'Trade_License_2016.pdf', url: '#', type: 'pdf', date: '2024-01-10' },
  { name: 'Office_Lease_Agreement.jpg', url: '#', type: 'image', date: '2023-12-01' },
  { name: 'Tax_Clearance_Q1.pdf', url: '#', type: 'pdf', date: '2024-04-15' },
];

export const useVault = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [docs, setDocs] = useState<DocFile[]>(INITIAL_DOCS);
  const [search, setSearch] = useState('');

  // 1. Security Logic
  const attemptUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, this checks Supabase/Auth
    if (pin === '1234') {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Incorrect Security PIN');
      setPin('');
    }
  };

  const lockVault = () => {
    setIsUnlocked(false);
    setPin('');
  };

  // 2. File Logic
  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(f => ({
        name: f.name,
        url: URL.createObjectURL(f),
        type: f.type.includes('pdf') ? 'pdf' : 'image',
        date: new Date().toISOString().split('T')[0]
      }));
      setDocs(prev => [...prev, ...newFiles]);
    }
  };

  const deleteFile = (url: string) => {
    setDocs(prev => prev.filter(d => d.url !== url));
  };

  const filteredDocs = docs.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  return {
    isUnlocked, pin, error, setPin, attemptUnlock, lockVault,
    docs: filteredDocs,
    search, setSearch,
    addFiles, deleteFile
  };
};