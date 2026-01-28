// src/utils/parsers.ts

export const parseTelebirrSMS = (text: string) => {
  // Example: "You have received 500.00 ETB from 0911... Trans ID: ABC123DEF"
  const amountMatch = text.match(/received\s+([\d,.]+)\s+ETB/i);
  const idMatch = text.match(/ID:\s*(\w+)/i);
  
  if (amountMatch) {
    return {
      amount: parseFloat(amountMatch[1].replace(/,/g, '')),
      id: idMatch ? idMatch[1] : `SMS-${Date.now()}`,
      source: 'Telebirr' as const
    };
  }
  return null;
};

export const parseCBESMS = (text: string) => {
  // Example: "Your account ... has been credited with ETB 1,200.00. Ref: XYZ789"
  const amountMatch = text.match(/ETB\s+([\d,.]+)/i);
  const refMatch = text.match(/Ref:\s*(\w+)/i);

  if (amountMatch) {
    return {
      amount: parseFloat(amountMatch[1].replace(/,/g, '')),
      id: refMatch ? refMatch[1] : `CBE-${Date.now()}`,
      source: 'CBE' as const
    };
  }
  return null;
};