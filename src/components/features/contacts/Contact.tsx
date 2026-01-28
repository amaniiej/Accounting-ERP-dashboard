import React, { useState } from 'react';
import { 
  Building2, Scale, Briefcase, Landmark, Truck, 
  Users, Printer, ShieldCheck, Search, MapPin, 
  Phone, Mail, ExternalLink, CheckCircle, Star,
  Filter, Navigation, Smartphone
} from 'lucide-react';

// --- TYPES DE DONNÉES ---

type CategoryType = 'GOV' | 'AUDIT' | 'LEGAL' | 'BIZ' | 'FINTECH' | 'LOGISTIC' | 'COWORK' | 'INSURANCE' | 'HR' | 'IT';

interface ContactEntry {
  id: string;
  name: string;
  category: CategoryType;
  address: string;
  phone?: string;
  verified: boolean; 
  rating: number; 
  coordinates?: string; 
}

// --- BASE DE DONNÉES (ADDIS-ABEBA) ---

const CONTACTS_DB: ContactEntry[] = [
  // 1. Institutions & Autorités
  { id: 'gov1', name: 'Ministry of Revenues (Federal)', category: 'GOV', address: 'Megenagna (Head Office)', phone: '8199', verified: true, rating: 5 },
  { id: 'gov2', name: 'Addis Ababa Revenues Bureau', category: 'GOV', address: 'Piazza (Municipality)', verified: true, rating: 4 },
  { id: 'gov3', name: 'AABE (Accounting Board)', category: 'GOV', address: 'CMC Road', verified: true, rating: 5 },
  { id: 'gov4', name: 'Ethiopian Investment Commission', category: 'GOV', address: 'Hilton Hotel Area', verified: true, rating: 5 },
  { id: 'gov5', name: 'Ministry of Trade', category: 'GOV', address: 'Kasanchis', verified: true, rating: 4 },
  { id: 'gov6', name: 'National Bank of Ethiopia', category: 'GOV', address: 'Sudan St', verified: true, rating: 5 },
  { id: 'gov7', name: 'Customs Commission', category: 'GOV', address: 'Megenagna', verified: true, rating: 4 },
  { id: 'gov8', name: 'Commercial Bank (CBE)', category: 'GOV', address: 'Churchill Road', verified: true, rating: 5 },
  { id: 'gov9', name: 'Ministry of Finance', category: 'GOV', address: 'King George VI St', verified: true, rating: 5 },
  { id: 'gov10', name: 'Federal High Court', category: 'GOV', address: 'Lideta', verified: true, rating: 4 },

  // 2. Cabinets d'Audit
  { id: 'aud1', name: 'HST Consulting', category: 'AUDIT', address: 'Wollo Sefer', verified: true, rating: 5 },
  { id: 'aud2', name: 'Grant Thornton', category: 'AUDIT', address: 'Bole Road', verified: true, rating: 5 },
  { id: 'aud3', name: 'EY Ethiopia', category: 'AUDIT', address: 'Bole Road', verified: true, rating: 5 },
  { id: 'aud4', name: 'BDO Ethiopia', category: 'AUDIT', address: 'Atlas Hotel Area', verified: true, rating: 4 },
  { id: 'aud5', name: 'Deloitte (Hibir)', category: 'AUDIT', address: 'Kazanchis', verified: true, rating: 5 },

  // 3. Juridique
  { id: 'leg1', name: 'MLA (Mehrteab & Getu)', category: 'LEGAL', address: 'Bole Airport Area', verified: true, rating: 5 },
  { id: 'leg2', name: 'Teshome Gabre-Mariam', category: 'LEGAL', address: 'Churchill Road', verified: true, rating: 5 },
  { id: 'leg3', name: 'MTA (Mesfin Tafesse)', category: 'LEGAL', address: 'Radisson Blu Area', verified: true, rating: 5 },

  // 5. Fintech
  { id: 'fin1', name: 'Telebirr (Ethio Telecom)', category: 'FINTECH', address: 'Churchill Road', verified: true, rating: 5 },
  { id: 'fin2', name: 'Chapa Financial', category: 'FINTECH', address: 'Kasanchis', verified: true, rating: 5 },
  { id: 'fin3', name: 'M-Pesa (Safaricom)', category: 'FINTECH', address: 'Bole, Kadisco', verified: true, rating: 5 },
  { id: 'fin4', name: 'SantimPay', category: 'FINTECH', address: 'Bole Road', verified: true, rating: 4 },

  // 6. Logistique
  { id: 'log1', name: 'EthioPost', category: 'LOGISTIC', address: 'Churchill Road', verified: true, rating: 4 },
  { id: 'log2', name: 'DHL Ethiopia', category: 'LOGISTIC', address: 'Bole Road', verified: true, rating: 5 },
  { id: 'log3', name: 'Deliver Addis', category: 'LOGISTIC', address: 'Bole', verified: true, rating: 4 },

  // 9. RH
  { id: 'hr1', name: 'Ethiojobs', category: 'HR', address: 'Bole Road', verified: true, rating: 5 },
  { id: 'hr2', name: 'Dereja', category: 'HR', address: 'Addis Ababa', verified: true, rating: 4 },

  // 10. IT Hardware
  { id: 'it1', name: 'Jupiter IT Solutions', category: 'IT', address: 'Bole', verified: true, rating: 4 },
  { id: 'it2', name: 'Copy Cat Ethiopia', category: 'IT', address: 'Bole Road', verified: true, rating: 5 },
];

const CATEGORIES: { id: CategoryType; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'GOV', label: 'Gouvernement', icon: Landmark, color: '#DC2626' },
  { id: 'AUDIT', label: 'Audit & Compta', icon: Scale, color: '#2563EB' },
  { id: 'LEGAL', label: 'Juridique', icon: ShieldCheck, color: '#7C3AED' },
  { id: 'FINTECH', label: 'Paiement', icon: Smartphone, color: '#059669' }, 
  { id: 'LOGISTIC', label: 'Logistique', icon: Truck, color: '#D97706' },
  { id: 'HR', label: 'Recrutement', icon: Users, color: '#DB2777' },
  { id: 'IT', label: 'Matériel IT', icon: Printer, color: '#4B5563' },
];

const translations = {
  en: { title: "ADDIS ABABA BUSINESS DIRECTORY", subtitle: "Qualified & Verified Database", search: "Search a service, area...", all: "VIEW ALL", call: "Call", map: "Directions", send: "Send my documents", sos: "FISCAL EMERGENCY SOS", audit: "Unexpected Audit? Bank Freeze?", lawyer: "FIND A LAWYER (24/7)" },
  am: { title: "የአዲስ አበባ የንግድ ማውጫ", subtitle: "ብቁ እና የተረጋገጠ የውሂብ ጎታ", search: "አገልግሎት፣ አካባቢ ይፈልጉ...", all: "ሁሉንም ይመልከቱ", call: "ደውል", map: "አቅጣጫዎች", send: "ሰነዶቼን ላክ", sos: "የፊስካል ድንገተኛ SOS", audit: "ያልተጠበቀ ኦዲት? የባንክ እገዳ?", lawyer: "ጠበቃ ያግኙ (24/7)" },
  om: { title: "Baaqa Daldala Finfinnee", subtitle: "Kuusaa Daataa Mirkanaa'e", search: "Tajaajila, naannoo barbaadi...", all: "HUNDA ILAALI", call: "Bilbili", map: "Kallattii", send: "Sanadoota koo ergi", sos: "SOS HATATTAMA FISCAL", audit: "Odiitii Hin Eegamne? Dhorkaa Baankii?", lawyer: "ABUKATOO BARBAADI (24/7)" },
  ti: { title: "መዝገብ ንግዲ ኣዲስ ኣበባ", subtitle: "ብቁዕን ዝተረጋገጸን", search: "አገልግሎት፣ ቦታ ድለይ...", all: "ኩሉ ርኣይ", call: "ደውል", map: "ኣንፈት", send: "ሰነዳተይ ስደድ", sos: "ፊስካል ህጹጽ SOS", audit: "ዘይተጸበዮ ኦዲት? እገዳ ባንኪ?", lawyer: "ጠበቃ ድለይ (24/7)" },
  so: { title: "TUSMADA GANACSIGA ADDIS ABABA", subtitle: "Xogta La Xaqiijiyey", search: "Raadi adeeg, aag...", all: "WADA EEG", call: "Wac", map: "Tilmaamaha", send: "Dir dukumeentiyadayda", sos: "Xaaladda Degdegga ah ee Maaliyadda", audit: "Hanti-dhawr Lama Filaan ah? Xannibaadda Bangiga?", lawyer: "HEL QAREEN (24/7)" }
};

// --- COMPOSANT PRINCIPAL ---

const Contact: React.FC<{lang: 'en' | 'am' | 'om' | 'ti' | 'so'}> = ({ lang = 'en' }) => {
  const t = translations[lang];
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrage
  const filteredContacts = CONTACTS_DB.filter(c => {
    const matchCat = selectedCategory === 'ALL' || c.category === selectedCategory;
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  // --- STYLES ---
  const glassCard: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.75)',
    border: '1px solid rgba(255, 255, 255, 0.9)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.05)',
    backdropFilter: 'blur(12px)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden'
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px', height: '100%', fontFamily: '"Inter", sans-serif', color: '#1E293B', paddingBottom:'20px' }}>

      {/* --- HEADER : RECHERCHE & FILTRES --- */}
      <div style={{ gridColumn: 'span 12', ...glassCard, padding: '24px', height: 'auto' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
               <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Building2 size={24}/> {t.title}
               </h2>
               <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                  {t.subtitle} • {CONTACTS_DB.length} Partners
               </p>
            </div>
            
            {/* Barre de Recherche */}
            <div style={{ position: 'relative', width: '300px' }}>
               <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
               <input 
                  type="text" 
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ 
                     width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', 
                     border: '1px solid #CBD5E1', outline: 'none', fontSize: '13px',
                     background: 'rgba(255,255,255,0.8)'
                  }}
               />
            </div>
         </div>

         {/* Filtres Catégories */}
         <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
            <button 
               onClick={() => setSelectedCategory('ALL')}
               style={{ 
                  padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  background: selectedCategory === 'ALL' ? '#1E3A8A' : '#F1F5F9',
                  color: selectedCategory === 'ALL' ? 'white' : '#64748B',
                  fontWeight: 700, fontSize: '12px', whiteSpace: 'nowrap'
               }}
            >
               {t.all}
            </button>
            {CATEGORIES.map(cat => (
               <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{ 
                     padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                     background: selectedCategory === cat.id ? cat.color : 'white',
                     color: selectedCategory === cat.id ? 'white' : '#64748B',
                     fontWeight: 600, fontSize: '12px', whiteSpace: 'nowrap',
                     display: 'flex', alignItems: 'center', gap: '6px',
                     boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                  }}
               >
                  <cat.icon size={14} /> {cat.label}
               </button>
            ))}
         </div>
      </div>

      {/* --- GRILLE DES CONTACTS --- */}
      <div style={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', overflowY: 'auto', paddingRight: '5px' }}>
         {filteredContacts.map(contact => {
            const catInfo = CATEGORIES.find(c => c.id === contact.category);
            return (
               <div key={contact.id} style={{ 
                  background: 'white', borderRadius: '16px', padding: '20px', 
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid white',
                  display: 'flex', flexDirection: 'column', gap: '12px',
                  position: 'relative'
               }}>
                  {contact.verified && (
                     <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '4px' }}>
                        <ShieldCheck size={16} color="#10B981" fill="#D1FAE5" />
                     </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <div style={{ 
                        width: '40px', height: '40px', borderRadius: '10px', 
                        background: catInfo?.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                     }}>
                        {catInfo && <catInfo.icon size={20} color={catInfo.color} />}
                     </div>
                     <div>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: catInfo?.color, textTransform: 'uppercase' }}>
                           {catInfo?.label}
                        </div>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1E293B', lineHeight: '1.2' }}>
                           {contact.name}
                        </h3>
                     </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#64748B' }}>
                     <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                     {contact.address}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px dashed #E2E8F0' }}>
                     <button style={{ flex: 1, background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} /> Appeler
                     </button>
                     <button style={{ flex: 1, background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                        <Navigation size={14} /> Itinéraire
                     </button>
                  </div>
               </div>
            );
         })}
      </div>

    </div>
  );
};

export default Contact;