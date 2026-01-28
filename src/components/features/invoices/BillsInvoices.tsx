// src/components/features/invoices/BillsInvoices.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Printer, Send, Plus, Trash2, 
  User, Briefcase, Building2, X, 
  PenTool, Image as ImageIcon, Smartphone, Mail, Scale 
} from 'lucide-react';

// Connect to your new Global Language state
import { useLedger } from '../../../context/LedgerContext';

// --- TYPES ---
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

// EXACT TRANSLATIONS FROM ORIGINAL
const translations = {
  en: { title: "INVOICE GENERATOR", subtitle: "ERCA Compliant Invoicing", print: "Print", send: "Send to Client", sender: "Sender Info", client: "Client Info", name: "Client Name", tin: "TIN Number", invNum: "Invoice #", addr: "Address", date: "Date", desc: "Description", qty: "Qty", price: "Price", add: "Add Item", subtotal: "Subtotal", tax: "Taxable Amount", vat: "VAT (15%)", total: "Grand Total", sign: "Authorized Signature" },
  am: { title: "የደረሰኝ ማመንጫ", subtitle: "ERCA ተገዢ", print: "አትም", send: "ለደንበኛ ላክ", sender: "የላኪ መረጃ", client: "የደንበኛ መረጃ", name: "የደንበኛ ስም", tin: "TIN ቁጥር", invNum: "ደረሰኝ ቁጥር", addr: "አድራሻ", date: "ቀን", desc: "መግለጫ", qty: "ብዛት", price: "ዋጋ", add: "እቃ ጨምር", subtotal: "ንዑስ ድምር", tax: "የሚከፈልበት መጠን", vat: "ተጨማሪ እሴት ታክስ (15%)", total: "ጠቅላላ ድምር", sign: "የተፈቀደ ፊርማ" },
  om: { title: "Maddisiisa Nagahee", subtitle: "ERCA Waliin Kan Hojjatu", print: "Maxxansi", send: "Maamilaaf Ergi", sender: "Odeeffannoo Ergaa", client: "Odeeffannoo Maamilaa", name: "Maqaa Maamilaa", tin: "Lakkoofsa TIN", invNum: "Lakk. Nagahee", addr: "Teessoo", date: "Guyyaa", desc: "Ibsa", qty: "Baay'ina", price: "Gatii", add: "Mi'a Dabali", subtotal: "Ida'ama Xiqqaa", tax: "Hanga Taaksii", vat: "VAT (15%)", total: "Ida'ama Waliigalaa", sign: "Mallattoo Hayyamame" },
  ti: { title: "ደረሰኝ መፍጠሪ", subtitle: "ERCA ዝሰማማዕ", print: "ሕተም", send: "ንዓማዊል ስደድ", sender: "ሓበሬታ ሰዳዲ", client: "ሓበሬታ ዓማዊል", name: "ስም ዓማዊል", tin: "TIN ቁጽሪ", invNum: "ቁጽሪ ደረሰኝ", addr: "ኣድራሻ", date: "ዕለት", desc: "መብርሂ", qty: "ብዝሒ", price: "ዋጋ", add: "ንብረት ወስኽ", subtotal: "ንኡስ ድምር", tax: "ዝግብር መጠን", vat: "ተወሳኺ እሴት ታክስ (15%)", total: "ጠቅላላ ድምር", sign: "ዝተፈቀደ ፊርማ" },
  so: { title: "SOO SAARAHA QAANSHEEGTA", subtitle: "U Hogaansanaanta ERCA", print: "Daabac", send: "U Dir Macaamiilka", sender: "Xogta Diraha", client: "Xogta Macaamiilka", name: "Magaca Macaamiilka", tin: "Lambarka TIN", invNum: "Lambarka Qaansheegta", addr: "Cinwaanka", date: "Taariikhda", desc: "Sharaxaad", qty: "Tirada", price: "Qiimaha", add: "Kudar Alaab", subtotal: "Wadarta Yar", tax: "Lacagta Canshuurta", vat: "VAT (15%)", total: "Wadarta Guud", sign: "Saxiixa La Oggolaaday" }
};

const BillsInvoices: React.FC = () => {
  const { language } = useLedger(); // Get current language from Sidebar toggle
  const t = translations[language];

  // --- STATE ---
  const [clientInfo, setClientInfo] = useState({
    name: '', tin: '', address: '',
    date: new Date().toISOString().split('T')[0],
    invoiceNum: 'INV-2024-001'
  });

  const [senderInfo, setSenderInfo] = useState({
    name: 'Abyssinia CyberSec',
    address: 'Addis Ababa, Bole, W03',
    tinVat: 'TIN: 0045992188 | VAT Reg: 7782'
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Consulting CyberSec', quantity: 1, unitPrice: 5000 },
    { id: '2', description: 'Installation Firewall', quantity: 2, unitPrice: 1500 }
  ]);

  const [showSendModal, setShowSendModal] = useState(false);
  const [showSigModal, setShowSigModal] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [sendType, setSendType] = useState<'email' | 'sms'>('email');
  const [contactValue, setContactValue] = useState('');
  const [sigTab, setSigTab] = useState<'draw' | 'upload'>('draw');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // --- CALCULATIONS ---
  const subTotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const vatRate = 0.15; 
  const vatAmount = subTotal * vatRate;
  const grandTotal = subTotal + vatAmount;

  // --- ACTIONS ---
  const addItem = () => setItems([...items, { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 }]);
  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));
  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const handlePrint = () => window.print();
  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Lien PDF envoyé par ${sendType === 'email' ? 'Email' : 'SMS'} à : ${contactValue}`);
    setShowSendModal(false);
    setContactValue('');
  };

  // --- SIGNATURE LOGIC ---
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.beginPath(); ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); ctx.stroke();
  };
  const saveCanvasSignature = () => {
    if (canvasRef.current) { setSignatureImage(canvasRef.current.toDataURL()); setShowSigModal(false); }
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => { if (ev.target?.result) { setSignatureImage(ev.target.result as string); setShowSigModal(false); } };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // --- STYLES ---
  const glassCard: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.65)', border: '1px solid rgba(255, 255, 255, 0.8)',
    borderRadius: '20px', boxShadow: '0 8px 32px rgba(31, 38, 135, 0.05)', backdropFilter: 'blur(12px)',
    padding: '24px', display: 'flex', flexDirection: 'column'
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.5)', border: '1px solid #CBD5E1', borderRadius: '8px',
    padding: '8px 12px', fontSize: '13px', width: '100%', outline: 'none', color: '#1E293B'
  };

  const modalOverlay: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999,
    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <style>{`
        @media print { .no-print { display: none !important; } .invoice-preview { box-shadow: none !important; width: 100% !important; margin: 0 !important; border: none !important; } }
      `}</style>

      {/* HEADER */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '36px', fontWeight: 900, color: '#1E3A8A', letterSpacing: '-1px' }}>{t.title}</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748B' }}>{t.subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
           <button onClick={handlePrint} style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '10px 20px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems:'center', gap:'8px' }}><Printer size={18}/>{t.print}</button>
           <button onClick={() => setShowSendModal(true)} style={{ background: '#2563EB', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems:'center', gap:'8px' }}><Send size={18}/>{t.send}</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '25px', alignItems: 'start' }}>
        
        {/* EDITOR (5/12) */}
        <div className="no-print" style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={glassCard}>
             <h3 style={{ margin: '0 0 15px 0', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}><Building2 size={16} color="#2563EB"/> {t.sender}</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               <input style={inputStyle} value={senderInfo.name} onChange={e => setSenderInfo({...senderInfo, name: e.target.value})} placeholder="Nom Émetteur" />
               <input style={inputStyle} value={senderInfo.address} onChange={e => setSenderInfo({...senderInfo, address: e.target.value})} placeholder="Adresse" />
               <input style={inputStyle} value={senderInfo.tinVat} onChange={e => setSenderInfo({...senderInfo, tinVat: e.target.value})} placeholder="TIN / VAT" />
             </div>
          </div>

          <div style={glassCard}>
             <h3 style={{ margin: '0 0 15px 0', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}><User size={16} color="#2563EB"/> {t.client}</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input style={inputStyle} value={clientInfo.name} onChange={e => setClientInfo({...clientInfo, name: e.target.value})} placeholder={t.name} />
                <div style={{display:'flex', gap:'10px'}}>
                  <input style={inputStyle} value={clientInfo.tin} onChange={e => setClientInfo({...clientInfo, tin: e.target.value})} placeholder={t.tin} />
                  <input style={inputStyle} value={clientInfo.invoiceNum} onChange={e => setClientInfo({...clientInfo, invoiceNum: e.target.value})} />
                </div>
                <input style={inputStyle} value={clientInfo.address} onChange={e => setClientInfo({...clientInfo, address: e.target.value})} placeholder={t.addr} />
                <input type="date" style={inputStyle} value={clientInfo.date} onChange={e => setClientInfo({...clientInfo, date: e.target.value})} />
             </div>
          </div>

          <div style={{ ...glassCard, flex: 1 }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '300px' }}>
                {items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'white', padding: '10px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                     <input style={{...inputStyle, border:'none', background:'transparent', flex: 3}} value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} placeholder={t.desc} />
                     <input type="number" style={{...inputStyle, border:'none', background:'transparent', flex: 1}} value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)} />
                     <button onClick={() => removeItem(item.id)} style={{background:'transparent', border:'none', cursor:'pointer', color:'#EF4444'}}><Trash2 size={14}/></button>
                  </div>
                ))}
             </div>
             <button onClick={addItem} style={{marginTop: '15px', width: '100%', background:'#F1F5F9', color:'#64748B', border:'1px dashed #CBD5E1', borderRadius:'8px', padding:'10px', fontSize:'12px', fontWeight:700, cursor:'pointer'}}><Plus size={14}/> {t.add}</button>
          </div>
        </div>

        {/* PREVIEW (7/12) */}
        <div style={{ gridColumn: 'span 7' }}>
           <div className="invoice-preview" style={{ background: 'white', borderRadius: '4px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', minHeight: '800px', padding: '50px', display: 'flex', flexDirection: 'column', color: '#1E293B' }}>
              <div style={{display:'flex', justifyContent:'space-between', borderBottom:'2px solid #1E3A8A', paddingBottom:'20px', marginBottom:'20px'}}>
                 <div><h1 style={{margin:0, fontSize:'32px', color:'#1E3A8A'}}>TAX INVOICE</h1><span style={{fontSize:'12px', color:'#64748B'}}>Original Copy</span></div>
                 <div style={{textAlign:'right'}}><h2 style={{margin:0, fontSize:'20px', fontWeight:800}}>{senderInfo.name}</h2><p style={{margin:0, fontSize:'12px'}}>{senderInfo.address}</p><p style={{margin:0, fontSize:'12px'}}>{senderInfo.tinVat}</p></div>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'40px'}}>
                 <div><span style={{fontSize:'11px', color:'#94A3B8', fontWeight:700}}>BILL TO:</span><br/><b>{clientInfo.name || 'Client Name'}</b><br/>{clientInfo.address}<br/>TIN: {clientInfo.tin}</div>
                 <div style={{textAlign:'right'}}>Date: <b>{clientInfo.date}</b><br/>Invoice #: <b>{clientInfo.invoiceNum}</b></div>
              </div>
              <table style={{width:'100%', borderCollapse:'collapse', fontSize:'13px'}}>
                 <thead><tr style={{background:'#F8FAFC', borderTop:'2px solid #1E3A8A', borderBottom:'1px solid #CBD5E1'}}><th style={{padding:'12px 10px', textAlign:'left'}}>{t.desc}</th><th style={{padding:'12px 10px', textAlign:'center'}}>{t.qty}</th><th style={{padding:'12px 10px', textAlign:'right'}}>{t.price}</th><th style={{padding:'12px 10px', textAlign:'right'}}>{t.total}</th></tr></thead>
                 <tbody>{items.map(item => (<tr key={item.id} style={{borderBottom:'1px solid #E2E8F0'}}><td style={{padding:'12px 10px'}}>{item.description}</td><td style={{padding:'12px 10px', textAlign:'center'}}>{item.quantity}</td><td style={{padding:'12px 10px', textAlign:'right'}}>{item.unitPrice.toLocaleString()}</td><td style={{padding:'12px 10px', textAlign:'right', fontWeight:700}}>{(item.quantity * item.unitPrice).toLocaleString()}</td></tr>))}</tbody>
              </table>
              <div style={{display:'flex', justifyContent:'flex-end', marginTop:'auto', paddingTop:'40px'}}>
                 <div style={{width:'250px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'13px'}}><span>{t.subtotal}:</span><span>{subTotal.toLocaleString()} ETB</span></div>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'13px', margin:'5px 0'}}><span>{t.vat}:</span><span>{vatAmount.toLocaleString()} ETB</span></div>
                    <div style={{height:'2px', background:'#1E3A8A', margin:'10px 0'}}></div>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'18px', fontWeight:900, color:'#1E3A8A'}}><span>{t.total}:</span><span>{grandTotal.toLocaleString()} ETB</span></div>
                 </div>
              </div>
              <div style={{marginTop:'60px', borderTop:'1px dashed #CBD5E1', paddingTop:'20px', display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
                 <div style={{fontSize:'10px', color:'#94A3B8'}}>Certified by ERCA Authority. Payment due within 30 days.</div>
                 <div onClick={() => setShowSigModal(true)} style={{textAlign:'center', cursor: 'pointer'}}>
                     {signatureImage ? <img src={signatureImage} style={{height: '60px', mixBlendMode: 'multiply'}} /> : <div style={{height:'40px', color:'#CBD5E1', fontSize:'10px'}}>(Click to sign)</div>}
                     <div style={{height:'1px', background:'#1E293B', width:'120px', marginBottom:'4px'}}></div><span style={{fontSize:'11px', fontWeight:700}}>{t.sign}</span>
                 </div>
              </div>
              <div style={{position:'absolute', top:'45%', left:'50%', transform:'translate(-50%, -50%) rotate(-15deg)', opacity:0.04, pointerEvents:'none'}}><Scale size={350} color="#1E3A8A" /></div>
           </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {showSendModal && (
        <div style={modalOverlay}>
          <div style={{background: 'white', padding: '30px', borderRadius: '24px', width: '400px'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}><h3 style={{margin:0}}>Envoyer la facture</h3><button onClick={()=>setShowSendModal(false)} style={{background:'none', border:'none', cursor:'pointer'}}><X/></button></div>
            <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
              <button onClick={()=>setSendType('email')} style={{flex:1, padding:'10px', borderRadius:'8px', border: sendType==='email'?'2px solid #2563EB':'1px solid #E2E8F0', background:sendType==='email'?'#EFF6FF':'white', cursor:'pointer'}}><Mail size={16}/> Email</button>
              <button onClick={()=>setSendType('sms')} style={{flex:1, padding:'10px', borderRadius:'8px', border: sendType==='sms'?'2px solid #2563EB':'1px solid #E2E8F0', background:sendType==='sms'?'#EFF6FF':'white', cursor:'pointer'}}><Smartphone size={16}/> SMS</button>
            </div>
            <form onSubmit={handleSendSubmit}>
              <input type={sendType==='email'?'email':'tel'} required style={{width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid #CBD5E1', marginBottom:'20px'}} placeholder={sendType==='email'?'client@company.com':'+251 9...'} value={contactValue} onChange={e=>setContactValue(e.target.value)} />
              <button type="submit" style={{width:'100%', padding:'14px', background:'#2563EB', color:'white', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer'}}>Envoyer le lien PDF</button>
            </form>
          </div>
        </div>
      )}

      {showSigModal && (
        <div style={modalOverlay}>
          <div style={{background: 'white', padding: '30px', borderRadius: '24px', width: '500px'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}><h3 style={{margin:0}}>Signature</h3><X style={{cursor:'pointer'}} onClick={()=>setShowSigModal(false)}/></div>
            <div style={{display:'flex', borderBottom:'1px solid #EEE', marginBottom:'20px'}}>
              <button onClick={()=>setSigTab('draw')} style={{padding:'10px 20px', border:'none', background:'none', borderBottom: sigTab==='draw'?'2px solid #2563EB':'none', fontWeight:700, color: sigTab==='draw'?'#2563EB':'#666', cursor:'pointer'}}>Dessiner</button>
              <button onClick={()=>setSigTab('upload')} style={{padding:'10px 20px', border:'none', background:'none', borderBottom: sigTab==='upload'?'2px solid #2563EB':'none', fontWeight:700, color: sigTab==='upload'?'#2563EB':'#666', cursor:'pointer'}}>Importer</button>
            </div>
            {sigTab==='draw' ? (
              <div>
                <canvas ref={canvasRef} width={440} height={200} style={{border:'1px dashed #CCC', background:'#FAFAFA', cursor:'crosshair'}} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={()=>setIsDrawing(false)} />
                <div style={{display:'flex', justifyContent:'space-between', marginTop:'15px'}}><button onClick={()=>{const c=canvasRef.current; c?.getContext('2d')?.clearRect(0,0,c.width,c.height)}} style={{color:'red', background:'none', border:'none', cursor:'pointer'}}>Effacer</button><button onClick={saveCanvasSignature} style={{padding:'10px 20px', background:'#2563EB', color:'white', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer'}}>Valider</button></div>
              </div>
            ) : (
              <div style={{textAlign:'center', padding:'20px', background:'#F8FAFC', border:'1px dashed #CCC', borderRadius:'12px'}}><input type="file" accept="image/*" onChange={handleImageUpload} /></div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default BillsInvoices;