import { useState, useEffect, useCallback } from 'react';

// --- Types ---
export interface Product {
  id: string;
  name: string;
  category: string;
  sellingPrice?: number;
  consumedCount: number;
  availableVolume: number;
  initialStock: number;
  threshold: number;
  reorderDate: string | null;
  advanceNoticeDays: number;
  lastConsumption: Date;
  consumptionHistory: number[];
  unitCostHistory: number[];
  defaultSupplier?: string;
  isActive: boolean;
  cump: number;
}

export interface CoreLedgerEntry {
  id: string;
  date: Date;
  productId: string;
  productName: string;
  type: 'consumption' | 'purchase' | 'adjustment';
  quantity: number;
}

// --- Mock Data (Localized for Ethiopia) ---
const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Coffee Beans (Kaffa)', category: 'Raw Material', consumedCount: 128, availableVolume: 45, initialStock: 200, threshold: 50, reorderDate: null, advanceNoticeDays: 7, lastConsumption: new Date(), consumptionHistory: [5, 8, 12], unitCostHistory: [45], defaultSupplier: 'BGI Ethiopia', isActive: true, cump: 45.5, sellingPrice: 250 },
  { id: 'p2', name: 'Ambo Water 1L', category: 'Beverage', consumedCount: 350, availableVolume: 200, initialStock: 1000, threshold: 100, reorderDate: null, advanceNoticeDays: 14, lastConsumption: new Date(), consumptionHistory: [20, 25], unitCostHistory: [12], defaultSupplier: 'Ambo Factory', isActive: true, cump: 12, sellingPrice: 20 },
  { id: 'p3', name: 'Raw Meat (Kg)', category: 'Meat', consumedCount: 45, availableVolume: 8, initialStock: 50, threshold: 10, reorderDate: '2026-02-15', advanceNoticeDays: 7, lastConsumption: new Date(), consumptionHistory: [2, 5], unitCostHistory: [280], defaultSupplier: 'ELFORA', isActive: true, cump: 282, sellingPrice: 450 },
  { id: 'p4', name: 'Teff Flour (Kg)', category: 'Raw Material', consumedCount: 80, availableVolume: 150, initialStock: 200, threshold: 20, reorderDate: null, advanceNoticeDays: 3, lastConsumption: new Date(), consumptionHistory: [10, 15], unitCostHistory: [60], isActive: true, cump: 60, sellingPrice: 0 },
];

export const useInventorySync = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [liveUpdates, setLiveUpdates] = useState<CoreLedgerEntry[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Simulate Live WebSocket Updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const newEntry: CoreLedgerEntry = {
          id: `l${Date.now()}`,
          date: new Date(),
          productId: randomProduct.id,
          productName: randomProduct.name,
          type: Math.random() > 0.3 ? 'consumption' : 'purchase',
          quantity: Math.floor(Math.random() * 5) + 1
        };
        
        setLiveUpdates(prev => [newEntry, ...prev].slice(0, 10)); // Keep last 10
        
        // Update local product state to reflect "Live" change
        setProducts(currentProducts => currentProducts.map(p => 
          p.id === randomProduct.id 
            ? { ...p, availableVolume: newEntry.type === 'consumption' ? p.availableVolume - newEntry.quantity : p.availableVolume + newEntry.quantity }
            : p
        ));
      }
    }, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [products]);

  // Actions
  const addProduct = (productData: Partial<Product>) => {
    const newProduct: Product = {
      ...productData as Product,
      id: `p${Date.now()}`,
      consumedCount: 0,
      consumptionHistory: [],
      unitCostHistory: [],
      lastConsumption: new Date(),
      availableVolume: productData.initialStock || 0,
      isActive: true,
      cump: 0
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const manualSync = async () => {
    setIsSyncing(true);
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSyncing(false);
  };

  return {
    products,
    liveUpdates,
    isSyncing,
    addProduct,
    updateProduct,
    manualSync
  };
};