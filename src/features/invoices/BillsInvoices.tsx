import React from 'react';
import { Printer } from 'lucide-react';
import { useInvoiceGenerator } from './hooks/useInvoiceGenerator';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';

const BillsInvoices = () => {
  const { 
    clientName, setClientName, clientTIN, setClientTIN, 
    items, addItem, updateItem, removeItem, totals, companyProfile 
  } = useInvoiceGenerator();

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Input */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-800">New Invoice</h2>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-700"
          >
            <Printer size={18}/> Print / Save PDF
          </button>
        </div>
        <InvoiceForm 
          clientName={clientName} setClientName={setClientName}
          clientTIN={clientTIN} setClientTIN={setClientTIN}
          items={items} onUpdate={updateItem} onAdd={addItem} onRemove={removeItem}
        />
      </div>

      {/* Right: Preview */}
      <div className="bg-slate-50 rounded-3xl p-8 flex items-start justify-center overflow-y-auto">
        <div className="w-full max-w-lg shadow-2xl">
          <InvoicePreview 
            clientName={clientName} clientTIN={clientTIN} 
            items={items} totals={totals} company={companyProfile}
          />
        </div>
      </div>
    </div>
  );
};

export default BillsInvoices;