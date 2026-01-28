// src/types/index.ts

export type Lang = 'en' | 'am' | 'om' | 'ti' | 'so';

export interface Transaction {
  id: string;
  date: Date;
  source: 'Telebirr' | 'CBE' | 'Cash';
  motif: string; 
  amount: number; // Positive = Income, Negative = Expense
  type: 'INCOME' | 'EXPENSE';
  receipt_hash?: string;
  has_file: boolean;
  file_type?: 'PDF' | 'JPG';
}

export interface CompanyProfile {
  initial: string;
  name: string;
  address: string;
  tag: string;
  tin: string;
  phone: string;
}

export interface DocFile {
  name: string;
  url: string;
  type: string;
  date: string;
}

export interface Transaction {
  id: string;
  date: Date;
  source: 'Telebirr' | 'CBE' | 'Cash';
  item_name: string; // The specific product/service
  motif: string;     // The "Reason" or extra detail
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  receipt_hash?: string;
  has_file: boolean;
}