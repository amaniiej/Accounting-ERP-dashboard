import { useState } from 'react';
import { useAddTransaction } from '../../../../hooks/useFinancials';
import { Transaction } from '../../../../types';

export const usePOS = () => {
  const { mutate: addTx } = useAddTransaction();
  const [amount, setAmount] = useState('');
  const [motif, setMotif] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');

  const handleDigit = (digit: string) => {
    if (digit === 'C') {
      setAmount('');
    } else if (digit === '.') {
      if (!amount.includes('.')) setAmount(prev => prev + digit);
    } else {
      setAmount(prev => prev + digit);
    }
  };

  const submitTransaction = () => {
    if (!amount || Number(amount) <= 0) return;
    
    const newTx: Transaction = {
      id: Date.now().toString(),
      date: new Date(),
      amount: Number(amount),
      motif: motif || (type === 'INCOME' ? 'Quick Sale' : 'Expense'),
      category: type === 'INCOME' ? 'Sales' : 'General',
      type,
      source: 'Cash',
      has_file: false
    };

    addTx(newTx);
    setAmount('');
    setMotif('');
  };

  return {
    amount, 
    motif, 
    type,
    setMotif, 
    setType,
    handleDigit, 
    submitTransaction
  };
};