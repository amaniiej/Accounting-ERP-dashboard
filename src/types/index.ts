export type Lang = 'en' | 'am' | 'om' | 'ti' | 'so';

export interface Transaction {
  id: string;
  date: Date;
  source: 'Telebirr' | 'CBE' | 'Cash';
  item_name?: string; 
  motif: string;     
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  receipt_hash?: string;
  has_file: boolean;
  file_type?: 'PDF' | 'JPG';
  vatApplicable?: boolean; // Added this to fix potential errors in calculations
}

export interface CompanyProfile {
  initial?: any;
  name: string;
  address?: string; // Made optional
  tag?: any;
  tin?: string;     // Made optional
  phone?: string;
  logo?: string;
  fy?: string;
  q?: string;
  env?: string;
}

export interface DocFile {
  name: string;
  url: string;
  type: string;
  date: string;
}

// src/types/index.ts

export type Lang = 'en' | 'am' | 'om' | 'ti' | 'so';

export interface Transaction {
  id: string;
  date: Date;
  source: 'Telebirr' | 'CBE' | 'Cash';
  item_name?: string; 
  motif: string;     
  category: string; // <--- ADD THIS LINE
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  receipt_hash?: string;
  has_file: boolean;
  file_type?: 'PDF' | 'JPG';
  vatApplicable?: boolean;
}