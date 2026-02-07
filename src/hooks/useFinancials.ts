import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Transaction } from '../types';

// Mock Data for MVP - This is where we will later plug in Supabase
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: new Date(), source: 'Telebirr', motif: 'Consulting IT (Addis)', amount: 2500, type: 'INCOME', has_file: true },
  { id: 't2', date: new Date(), source: 'Cash', motif: 'Macchiato', amount: 35, type: 'INCOME', has_file: false },
  { id: 't3', date: new Date(), source: 'CBE', motif: 'Office Rent (Bole)', amount: -15000, type: 'EXPENSE', has_file: true },
  { id: 't4', date: new Date(), source: 'Telebirr', motif: 'Project Alpha', amount: 12000, type: 'INCOME', has_file: false },
  { id: 't5', date: new Date(), source: 'Cash', motif: 'Supplies', amount: -2000, type: 'EXPENSE', has_file: false },
];

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_TRANSACTIONS;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
  });
};

export const useAddTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newTx: Transaction) => {
       // Simulate API call
       await new Promise(resolve => setTimeout(resolve, 500));
       return newTx; 
    },
    onSuccess: (newTx) => {
      queryClient.setQueryData(['transactions'], (old: Transaction[] = []) => [newTx, ...old]);
    },
  });
};