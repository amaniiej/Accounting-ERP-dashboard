import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { InvoiceItem } from '../hooks/useInvoiceGenerator';

interface Props {
  clientName: string; setClientName: (v: string) => void;
  clientTIN: string; setClientTIN: (v: string) => void;
  items: InvoiceItem[];
  onUpdate: (id: string, f: any, v: any) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

export const InvoiceForm: React.FC<Props> = ({ clientName, setClientName, clientTIN, setClientTIN, items, onUpdate, onAdd, onRemove }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="font-bold text-slate-800 mb-4">Client Details</h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <input placeholder="Client Name" className="p-3 border rounded-xl" value={clientName} onChange={e => setClientName(e.target.value)} />
        <input placeholder="Client TIN" className="p-3 border rounded-xl" value={clientTIN} onChange={e => setClientTIN(e.target.value)} />
      </div>

      <h3 className="font-bold text-slate-800 mb-4">Line Items</h3>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex gap-2">
            <input placeholder="Description" className="flex-1 p-2 border rounded-lg" value={item.desc} onChange={e => onUpdate(item.id, 'desc', e.target.value)} />
            <input type="number" placeholder="Qty" className="w-20 p-2 border rounded-lg" value={item.qty} onChange={e => onUpdate(item.id, 'qty', e.target.value)} />
            <input type="number" placeholder="Price" className="w-28 p-2 border rounded-lg" value={item.price} onChange={e => onUpdate(item.id, 'price', e.target.value)} />
            <button onClick={() => onRemove(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
          </div>
        ))}
      </div>
      <button onClick={onAdd} className="mt-4 flex items-center gap-2 text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition">
        <Plus size={18} /> Add Item
      </button>
    </div>
  );
};