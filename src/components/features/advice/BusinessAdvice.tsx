import React from 'react';
import { Newspaper } from 'lucide-react';
import { useBusinessSimulator } from './hooks/useBusinessSimulator';
import { Simulator } from './components/Simulator';
import { PortfolioGrid } from './components/PortfolioGrid';
import { NewsFeed } from './components/NewsFeed';

const BusinessAdvice = () => {
  const { simulatorState, simulatorActions, simulationResult, portfolio, news } = useBusinessSimulator();

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* LEFT COLUMN (7/12) */}
      <div className="lg:col-span-7 flex flex-col gap-8">
        <Simulator 
          basePrice={simulatorState.basePrice}
          setBase={simulatorActions.setBasePrice}
          margin={simulatorState.marginIncrease}
          setMargin={simulatorActions.setMarginIncrease}
          result={simulationResult}
        />
        <PortfolioGrid portfolio={portfolio} />
      </div>

      {/* RIGHT COLUMN (5/12) - News */}
      <div className="lg:col-span-5 flex flex-col h-full bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-xl">
            <Newspaper size={20} className="text-blue-600" />
          </div>
          <h3 className="font-black text-slate-800 text-lg">Market Intelligence</h3>
        </div>
        <NewsFeed news={news} />
      </div>

    </div>
  );
};

export default BusinessAdvice;