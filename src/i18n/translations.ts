// src/i18n/translations.ts
import { Lang } from '../types';

export const translations: Record<Lang, any> = {
  en: { 
    // Main Layout & Dashboard
    menu: "MENU", generalTable: "General Table", moneyFlow: "Money Flow", bills: "Bills & Invoices", advice: "Business Advice", tax: "Tax Tracker", report: "Final Report", contact: "Contact", expert: "Cyber Expert", admin: "Admin", lang: "EN",
    cmdPanel: "COMMAND PANEL", license: "Business License", active: "ACTIVE", missing: "MISSING", ocr: "OPEN OCR / SCANNER ENGINE", edit: "Edit Profile", netProfit: "Net Profit", margin: "Margin", basedOn: "Based on Core Ledger transactions",
    finResult: "Financial Result", rev: "TOTAL REVENUE", exp: "TOTAL EXPENSES", vault: "DIGITAL VAULT", encrypted: "ENCRYPTED", upload: "Upload", emptyVault: "Empty Vault.",
    history: "Weekly Cash Flow History", realTime: "Real-time aggregation from Core Ledger", netWeekly: "Net Weekly Flow",
    // Money Flow Specific
    flash: "FLASH INVOICE", sms: "SMS CERTIFIED", client: "Client Phone", reason: "Reason", amount: "Amount", send: "CASH & SEND RECEIPT", retail: "RETAIL MODE (POS)", config: "CONFIG PRODUCTS", validate: "VALIDATE", ledger: "Core Ledger", search: "Search...", date: "Date", source: "Source", motif: "Reason", proof: "Proof", analyzer: "STRATEGIC FLOW ANALYZER", secure: "Secured Data", compare: "Real-time vs Archive", export: "Export Excel", print: "Print Report", sales: "Total Sales", expenses: "Expenses",
    net: "Net Profit",
    watermark: "OFFICIAL COPY",
    digSig: "Digital Signature",
    auth: "Authorized Signature",
    storage: "Storage Code",
    audit: "Audit Journal"
  },
  am: { 
    menu: "ምናሌ", generalTable: "ጠቅላላ ሰንጠረዥ", moneyFlow: "የገንዘብ ፍሰት", bills: "ሂሳቦች", advice: "የንግድ ምክር", tax: "ግብር", report: "ሪፖርት", contact: "እውቂያ", expert: "ኤክስፐርት", admin: "አስተዳዳሪ", lang: "AM",
    cmdPanel: "የትእዛዝ ፓነል", license: "የንግድ ፈቃድ", active: "ንቁ", missing: "የለም", ocr: "OCR / ስካነር ክፈት", edit: "መገለጫ አርትዕ", netProfit: "የተጣራ ትርፍ", margin: "ኅዳግ", basedOn: "በዋና መዝገብ ላይ የተመሠረተ",
    finResult: "የፋይናንስ ውጤት", rev: "ጠቅላላ ገቢ", exp: "ጠቅላላ ወጪ", vault: "ዲጂታል ካዝና", encrypted: "የተመሰጠረ", upload: "ስቀል", emptyVault: "ባዶ ካዝና",
    history: "የሳምንታዊ የገንዘብ ፍሰት", realTime: "ከዋና መዝገብ የተወሰደ", netWeekly: "የሳምንቱ የተጣራ",
    flash: "ፈጣን ደረሰኝ", sms: "SMS የተረጋገጠ", client: "የደንበኛ ስልክ", reason: "ምክንያት", amount: "መጠን", send: "ክፈል እና ደረሰኝ ላክ", retail: "የችርቻሮ ሁነታ", config: "ምርቶችን አዋቅር", validate: "አረጋግጥ", ledger: "ዋና መዝገብ", search: "ፈልግ...", date: "ቀን", source: "ምንጭ", motif: "ምክንያት", proof: "ማረጋገጫ", analyzer: "ስትራቴጂካዊ ፍሰት ተንታኝ", secure: "የተጠበቀ መረጃ", compare: "በእውነተኛ ጊዜ vs ማህደር", export: "Excel ላክ", print: "ሪፖርት አትም", sales: "ጠቅላላ ሽያጭ", expenses: "ወጪዎች",
    net: "የተጣራ ትርፍ",
    watermark: "ኦፊሴላዊ ቅጂ",
    digSig: "ዲጂታል ፊርማ",
    auth: "የተፈቀደ ፊርማ",
    storage: "የማከማቻ ኮድ",
    audit: "የኦዲት መዝገብ"
  },
  om: { 
    menu: "Baafata", generalTable: "Gabatee Waliigalaa", moneyFlow: "Ya'a Maallaqaa", bills: "Kaffaltii", advice: "Gorsa Daldalaa", tax: "Taaksii", report: "Gabaasa", contact: "Qunnamtii", expert: "Ogeessa", admin: "Bulchaa", lang: "OM",
    cmdPanel: "Gabatee Ajajaa", license: "Hayyama Daldalaa", active: "Hoil", missing: "Dhabame", ocr: "OCR / Scanner Bani", edit: "Profaayilii Gulaali", netProfit: "Bu'aa Qulqulluu", margin: "Madaallii", basedOn: "Galmee Bu'uuraa irratti hundaa'e",
    finResult: "Bu'aa Faayinaansii", rev: "Galii Waliigalaa", exp: "Baasii Waliigalaa", vault: "Kuusaa Dijitaalaa", encrypted: "Iccitiin Eegame", upload: "Olkaa'i", emptyVault: "Kuusaan Duwwaadha",
    history: "Seenaa Ya'a Maallaqaa", realTime: "Galmee irraa kan fudhatame", netWeekly: "Ya'a Torbanii",
    flash: "Nagahee Saffisaa", sms: "SMS Mirkanaa'e", client: "Bilbila Maamilaa", reason: "Sababa", amount: "Hanga", send: "Kaffali & Nagahee Ergi", retail: "Haala Hurgufaa", config: "Oomishaalee Qopheessi", validate: "Mirkaneessi", ledger: "Galmee Bu'uuraa", search: "Barbaadi...", date: "Guyyaa", source: "Madda", motif: "Sababa", proof: "Ragaa", analyzer: "Xiinxala Ya'a Tarsiimoo", secure: "Daataa Eegame", compare: "Yeroo Dhugaa vs Kuusaa", export: "Excel Ergi", print: "Gabaasa Maxxansi", sales: "Gurgurtaa Waliigalaa", expenses: "Baasii"
  },
  ti: { 
    menu: "ዝርዝር", generalTable: "ሰሌዳ", moneyFlow: "ውሕዝ ገንዘብ", bills: "ክፍሊት", advice: "ምኽሪ", tax: "ግብሪ", report: "ፀብፃብ", contact: "ርክብ", expert: "ኪኢላ", admin: "መመሓደሪ", lang: "TI",
    cmdPanel: "መተግበሪ", license: "ፍቃድ ንግዲ", active: "ንጡፍ", missing: "ጎደሎ", ocr: "OCR / ስካነር", edit: "መገለጫ", netProfit: "ጽሩይ መክሰብ", margin: "ወሰን", basedOn: "ካብ ዋና መዝገብ",
    finResult: "ፋይናንስ ውጽኢት", rev: "ጠቅላላ ኣታዊ", exp: "ጠቅላላ ወጻኢ", vault: "ዲጂታል ካዝና", encrypted: "ምስጢራዊ", upload: "ጽዓን", emptyVault: "ባዶ",
    history: "ናይ ሰሙን ገንዘብ", realTime: "ካብ መዝገብ", netWeekly: "ናይ ሰሙን ጽሩይ",
    flash: "ቀልጢፍ ደረሰኝ", sms: "SMS ዝተረጋገጸ", client: "ቴሌፎን ዓማዊል", reason: "ምኽንያት", amount: "መጠን", send: "ክፈል & ደረሰኝ ስደድ", retail: "ናይ ቸርቻሪ", config: "ምርቲ ኣሰናዱ", validate: "ኣረጋግጽ", ledger: "ዋና መዝገብ", search: "ድለይ...", date: "ዕለት", source: "ምንጪ", motif: "ምኽንያት", proof: "መረጋገጺ", analyzer: "ስትራቴጂካዊ ፍሰት ተንታኒ", secure: "ዝተሓለወ ሓበሬታ", compare: "ብቀጥታ vs መዝገብ", export: "Excel ስደድ", print: "ሪፖርት ሕተም", sales: "ጠቅላላ መሸጣ", expenses: "ወጻኢታት"
  },
  so: {
    menu: "Liiska", generalTable: "Shaxda Guud", moneyFlow: "Socodka Lacagta", bills: "Biilasha", advice: "Talo Ganacsi", tax: "Canshuurta", report: "Warbixin", contact: "Xiriir", expert: "Khabiir", admin: "Maamule", lang: "SO",
    cmdPanel: "Guddiga Amarka", license: "Shatiga Ganacsiga", active: "FIRFIRCOON", missing: "MAQAN", ocr: "FUR OCR / ISKAAN", edit: "Wax ka beddel", netProfit: "Faa'iidada Net", margin: "Xad", basedOn: "Iyadoo lagu saleynayo Diiwaanka",
    finResult: "Natiijada Maaliyadeed", rev: "Dakhliga Guud", exp: "Kharashka Guud", vault: "Khasnadda Dijitaalka", encrypted: "QARSOODI", upload: "Soo rar", emptyVault: "Khasnad madhan",
    history: "Taariikhda Lacagta", realTime: "Waqtiga dhabta ah", netWeekly: "Socodka Net",
    flash: "QAANSHEEG DEGDEG", sms: "SMS LA XAQIIJIYEY", client: "Tel Macaamiil", reason: "Sabab", amount: "Cadad", send: "LACAG & DIR RASIID", retail: "HABKAIIBKA (POS)", config: "HABEYN ALAABTA", validate: "XAQIIJI", ledger: "Diiwaanka Muhiimka", search: "Raadi...", date: "Taariikh", source: "Xigasho", motif: "Sabab", proof: "Cadeyn", analyzer: "FALANQEYNTA SOCODKA", secure: "Xog Sugan", compare: "Waqtiga Dhabta vs Kaydka", export: "Dhoofinta Excel", print: "Daabac Warbixin", sales: "Wadarta Iibka", expenses: "Kharashaadka"
  }
};