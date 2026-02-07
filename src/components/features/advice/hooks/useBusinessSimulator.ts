import { useState, useMemo } from 'react';

interface ProductHealth {
  id: string;
  name: string;
  currentPrice: number;
  volume: 'High' | 'Med' | 'Low';
  margin: number;
  status: 'Star' | 'CashCow' | 'Problem' | 'Dog';
}

interface NewsItem {
  id: number;
  source: string;
  title: string;
  time: string;
  category: string;
  image: string;
}

const INITIAL_PORTFOLIO: ProductHealth[] = [
  { id: '1', name: 'Macchiato', currentPrice: 35, volume: 'High', margin: 65, status: 'CashCow' },
  { id: '2', name: 'Tir Sega (1kg)', currentPrice: 900, volume: 'Med', margin: 22, status: 'Problem' },
  { id: '3', name: 'Consulting IT', currentPrice: 2500, volume: 'High', margin: 85, status: 'Star' },
];

const MOCK_NEWS: NewsItem[] = [
  { id: 1, source: 'Addis Fortune', title: 'Ethiopian Coffee Exports Hit Record $1.3B', time: '2h ago', category: 'Export', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150' },
  { id: 2, source: 'Capital Ethiopia', title: 'National Bank New Directive on Forex', time: '4h ago', category: 'Finance', image: 'https://images.unsplash.com/photo-1611974765270-ca1258634369?w=150' },
];

export const useBusinessSimulator = () => {
  // Simulator State
  const [basePrice, setBasePrice] = useState<number>(100);
  const [marginIncrease, setMarginIncrease] = useState<number>(10);
  const [inflationRate, setInflationRate] = useState<number>(10);

  // Derived Calculations
  const simulation = useMemo(() => {
    const inflationMultiplier = 1 + (inflationRate / 100);
    const marginMultiplier = 1 + (marginIncrease / 100);
    
    // Logic: New Price = Base * Margin Hike * Inflation
    const calculatedPrice = basePrice * marginMultiplier * inflationMultiplier;
    const priceDelta = calculatedPrice - basePrice;
    
    return {
      finalPrice: Math.round(calculatedPrice),
      delta: Math.round(priceDelta),
      isPositive: priceDelta >= 0
    };
  }, [basePrice, marginIncrease, inflationRate]);

  return {
    simulatorState: { basePrice, marginIncrease, inflationRate },
    simulatorActions: { setBasePrice, setMarginIncrease, setInflationRate },
    simulationResult: simulation,
    portfolio: INITIAL_PORTFOLIO,
    news: MOCK_NEWS
  };
};