import { useState } from 'react';
import { useAuth } from '../../../../context/LedgerContext';

export interface InvoiceItem {
  id: string;
  desc: string;
  qty: number;
  price: number;
  total: number;
}

export const useInvoiceGenerator = () => {
  const { profile } = useAuth();
  const [clientName, setClientName] = useState('');
  const [clientTIN, setClientTIN] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);

  // Actions
  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), desc: '', qty: 1, price: 0, total: 0 }]);
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updates = { [field]: value };
        // Auto-calculate total if qty or price changes
        if (field === 'qty' || field === 'price') {
          const qty = field === 'qty' ? Number(value) : item.qty;
          const price = field === 'price' ? Number(value) : item.price;
          return { ...item, ...updates, total: qty * price };
        }
        return { ...item, ...updates };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  // Totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.15; // 15% VAT
  const grandTotal = subtotal + tax;

  return {
    clientName, setClientName,
    clientTIN, setClientTIN,
    items, addItem, updateItem, removeItem,
    totals: { subtotal, tax, grandTotal },
    companyProfile: profile
  };
};