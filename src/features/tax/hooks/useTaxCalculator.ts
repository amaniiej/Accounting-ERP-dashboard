import { useMemo } from 'react';
import { useTransactions } from '../../../../hooks/useFinancials'; // Reusing your global data hook

export const useTaxCalculator = () => {
  const { data: transactions = [] } = useTransactions();

  const taxStats = useMemo(() => {
    let taxableIncome = 0; // Total Revenue without VAT
    let vatCollected = 0;  // Output VAT (15% on Sales)
    let vatPaid = 0;       // Input VAT (15% on Expenses)
    let withholding = 0;   // 2% withheld on payments > 10k

    transactions.forEach((t) => {
      const amount = Math.abs(Number(t.amount || 0));
      
      // LOGIC: Ethiopian VAT is 15%
      // We assume the amount entered includes VAT for simplicity in this MVP, 
      // or acts as the base. Let's assume Base Amount for clearer math.
      
      if (t.type === 'INCOME') {
        taxableIncome += amount;
        // If the transaction is VAT applicable (Standard)
        vatCollected += amount * 0.15; 
      } else if (t.type === 'EXPENSE') {
        // If we bought something with VAT, we claim it back
        vatPaid += amount * 0.15;
        
        // Withholding Tax Logic:
        // If we pay > 10,000 ETB for services/goods, we must withhold 2%
        if (amount >= 10000) {
          withholding += amount * 0.02;
        }
      }
    });

    const vatPayable = vatCollected - vatPaid;

    return {
      taxableIncome,
      vatCollected,
      vatPaid,
      vatPayable: Math.max(0, vatPayable), // Can't be negative for payment (it becomes credit)
      vatCredit: vatPayable < 0 ? Math.abs(vatPayable) : 0,
      withholding
    };
  }, [transactions]);

  return { transactions, taxStats };
};