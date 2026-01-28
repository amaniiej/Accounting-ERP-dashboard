// src/components/features/money-flow/MoneyFlow.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Minus, Search, Zap, Trash2, X, List, ShoppingCart, Check, Info 
} from 'lucide-react';

import { useLedger } from '../../../context/LedgerContext';
import { translations } from '../../../i18n/translations';
import { Transaction } from '../../../types';
import { parseTelebirrSMS, parseCBESMS } from '../../../utils/parsers';

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string; // e.g. "cup", "kg", "hr"
}

const MoneyFlow: React.FC = () => {
  const { transactions, setTransactions, language } = useLedger();
  const t = translations[language];
  
  // --- UI STATE ---
  const [smsPaste, setSmsPaste] = useState('');
  const [manualReason, setManualReason] = useState('');
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- DATA STATE ---
  const [cart, setCart] = useState<Record<string, number>>({}); 
  const [newProduct, setNewProduct] = useState({ name: '', price: '', unit: '' });
  const [inventory, setInventory] = useState<Product[]>([
    { id: '1', name: 'Macchiato', price: 35, unit: 'cup' },
    { id: '2', name: 'Tir Sega', price: 900, unit: 'kg' },
    { id: '3', name: 'Consulting IT', price: 2500, unit: 'hr' },
    { id: '4', name: 'Hardware Fix', price: 1500, unit: 'unit' },
  ]);

  // --- 1. ACCURATE LIVE CALCULATION LOGIC ---
  const cartItems = useMemo(() => {
    return Object.entries(cart).map(([id, qty]) => {
      const p = inventory.find(item => item.id === id);
      return p ? { product: p, qty } : null;
    }).filter((item): item is { product: Product; qty: number } => item !== null);
  }, [cart, inventory]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.product.price * item.qty), 0);
  }, [cartItems]);

  const filteredInventory = inventory.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- 2. BODY SCROLL LOCK (FIXED) ---
  useEffect(() => {
    const isModalOpen = showInventoryModal || showAddModal;
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [showInventoryModal, showAddModal]);

  // --- 3. HANDLERS ---
  const updateQty = (id: string, delta: number) => {
    setCart(prev => {
      const currentQty = prev[id] || 0;
      const newQty = Math.max(0, currentQty + delta);
      const newCart = { ...prev };
      if (newQty === 0) delete newCart[id];
      else newCart[id] = newQty;
      return newCart;
    });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    const newTxs: Transaction[] = cartItems.map(item => ({
      id: crypto.randomUUID(),
      date: new Date(),
      source: 'Cash',
      item_name: item.product.name,
      motif: `${item.qty} ${item.product.unit}(s) recorded via POS`,
      amount: item.product.price * item.qty,
      type: 'INCOME',
      has_file: false
    }));
    setTransactions([...newTxs, ...transactions]);
    setCart({});
    alert("Sale Recorded successfully.");
  };

  const handleCreateProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    setInventory(prev => [...prev, {
      id: crypto.randomUUID(),
      name: newProduct.name,
      price: parseFloat(newProduct.price.toString()) || 0,
      unit: newProduct.unit || 'unit'
    }]);
    setNewProduct({ name: '', price: '', unit: '' });
    setShowAddModal(false);
  };

  // --- 4. STYLES ---
  const blueGlass: React.CSSProperties = {
    background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
    borderRadius: '24px', padding: '15px', color: 'white', height: '320px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative'
  };

  const whiteGlass: React.CSSProperties = {
    background: 'white', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '15px', color: '#1E293B', height: '320px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: 'white', outline: 'none', fontSize: '12px'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* SECTION_START: TOP_TERMINAL_ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '20px' }}>
        
        {/* INTAKE BLOCK */}
        <div style={blueGlass}>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={16} fill="white"/> INTAKE</h2>
          <textarea value={smsPaste} onChange={(e) => setSmsPaste(e.target.value)} placeholder="1. Paste Confirmation SMS..." style={{ ...inputStyle, flex: 1, resize: 'none' }} />
          <input value={manualReason} onChange={(e) => setManualReason(e.target.value)} placeholder="2. Service name..." style={inputStyle} />
          <button onClick={() => {}} style={{ width: '100%', padding: '12px', background: 'white', color: '#2563EB', border: 'none', borderRadius: '10px', fontWeight: 900, fontSize: '13px', cursor: 'pointer' }}>SAVE</button>
        </div>

        {/* RETAIL POS BLOCK */}
        <div style={whiteGlass}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h2 style={{ margin: 0, fontWeight: 900, fontSize: '18px' }}>RETAIL POS</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowInventoryModal(true)} style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}><List size={16}/> Items</button>
                <button onClick={() => setShowAddModal(true)} style={{ background: '#2563EB', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={16}/> Add Item</button>
              </div>
           </div>

           {/* SELECTION AREA: TWO COLUMN COMPACT GRID */}
           <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
              {cartItems.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '12px', fontStyle: 'italic' }}>No items selected...</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {cartItems.map(({ product, qty }) => (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={product.id} style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', padding: '10px 15px', borderRadius: '14px', border: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
                       <div style={{ fontWeight: 800, fontSize: '12px', color: '#1E293B', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                       
                       <div style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: '0 10px' }}>
                          <button onClick={() => updateQty(product.id, -1)} style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={12}/></button>
                          <span style={{ fontWeight: 900, fontSize: '12px', minWidth: '15px', textAlign: 'center' }}>{qty}</span>
                          <button onClick={() => updateQty(product.id, 1)} style={{ background: '#2563EB', color: 'white', border: 'none', borderRadius: '6px', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={12}/></button>
                       </div>

                       <div style={{ fontWeight: 900, fontSize: '12px', color: '#1E293B', width: '60px', textAlign: 'right' }}>{(product.price * qty).toLocaleString()}</div>
                    </motion.div>
                  ))}
                </div>
              )}
           </div>

           {/* COMPRESSED FOOTER: TOTAL UPDATES IN REAL-TIME */}
           <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '9px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Total Session</span>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#1E293B' }}>{cartTotal.toLocaleString()} <small style={{fontSize:'12px'}}>ETB</small></div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setCart({})} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', color: '#EF4444', cursor: 'pointer', background: 'white' }}><Trash2 size={16}/></button>
                <button onClick={handleCheckout} disabled={cartTotal === 0} style={{ background: cartTotal > 0 ? '#10B981' : '#CBD5E1', color: 'white', border: 'none', padding: '10px 30px', borderRadius: '12px', fontWeight: 900, fontSize: '13px', cursor: 'pointer', display:'flex', alignItems:'center', gap:'8px' }}><ShoppingCart size={16}/> RECORD SALE</button>
              </div>
           </div>
        </div>
      </div>

      {/* MASTER LEDGER TABLE */}
      <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '24px', overflow: 'hidden' }}>
        <div style={{ padding: '15px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontWeight: 900, fontSize: '16px' }}>MASTER LEDGER</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead style={{ background: '#F8FAFC', color: '#64748B' }}>
                <tr><th style={{padding:'12px 20px'}}>Date</th><th style={{padding:'12px 20px'}}>Item</th><th style={{padding:'12px 20px'}}>Description</th><th style={{padding:'12px 20px'}}>Source</th><th style={{padding:'12px 20px', textAlign:'right'}}>Amount</th><th style={{padding:'12px 20px', textAlign:'center'}}>Info</th></tr>
            </thead>
            <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{padding:'10px 20px'}}>{tx.date.toLocaleDateString()}</td>
                    <td style={{padding:'10px 20px', fontWeight: 800, color: '#2563EB'}}>{tx.item_name}</td>
                    <td style={{padding:'10px 20px'}}>{tx.motif}</td>
                    <td style={{padding:'10px 20px'}}><span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '20px', fontWeight: 800, fontSize: '10px' }}>{tx.source}</span></td>
                    <td style={{padding:'10px 20px', textAlign:'right', fontWeight: 900}}>{tx.amount.toLocaleString()}</td>
                    <td style={{padding:'10px 20px', textAlign:'center'}}><Info size={16} color="#CBD5E1" /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: SELECT FROM INVENTORY */}
      <AnimatePresence>
        {showInventoryModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.7)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', borderRadius: '32px', padding: '30px', width: '450px', height: '500px', display: 'flex', flexDirection: 'column' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>Inventory</h3>
                  <button onClick={() => setShowInventoryModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#64748B"/></button>
               </div>
               <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {inventory.map(p => (
                    <div key={p.id} onClick={() => { updateQty(p.id, 1); setShowInventoryModal(false); }} style={{ padding: '12px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer', display:'flex', justifyContent:'space-between', color: '#1E293B' }}>
                       <span style={{ fontWeight: 700 }}>{p.name}</span>
                       <span style={{ fontWeight: 900, color: '#2563EB' }}>{p.price} ETB</span>
                    </div>
                  ))}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD ITEM FORM (FIXED FIELDS) */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.7)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', borderRadius: '32px', padding: '40px', width: '400px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>New Item</h3>
                  <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#64748B"/></button>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize:'10px', fontWeight:800, color:'#94A3B8' }}>ITEM</label>
                    <input value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Consulting" style={{ width: '100%', padding: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', color: '#1E293B', outline: 'none' }} />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns: '1fr 1.2fr', gap:'15px' }}>
                    <div>
                      <label style={{ fontSize:'10px', fontWeight:800, color:'#94A3B8' }}>UNIT</label>
                      <input value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} placeholder="e.g. kg" style={{ width: '100%', padding: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', color: '#1E293B', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ fontSize:'10px', fontWeight:800, color:'#94A3B8' }}>PRICE / UNIT</label>
                      <input value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})} type="number" placeholder="0.00" style={{ width: '100%', padding: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', color: '#1E293B', outline: 'none' }} />
                    </div>
                  </div>
                  <button onClick={handleCreateProduct} style={{ width: '100%', background: '#2563EB', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 900, marginTop: '10px', cursor:'pointer' }}>ADD TO INVENTORY</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MoneyFlow;