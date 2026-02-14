'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Search, MapPin, Phone, Mail, Globe, Navigation, X, 
  Clock, ShieldCheck, Building2, Briefcase, Landmark,
  Truck, Users, Cpu, ExternalLink, Copy, Share2,
  Crosshair, CheckCircle2, Map as MapIcon
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

type ContactCategory = "GOVERNMENT" | "AUDIT" | "LEGAL" | "BANKING" | "LOGISTICS" | "RECRUITMENT" | "IT_HARDWARE" | "SUPPLIER" | "CLIENT" | "PARTNER";

interface ContactDirectoryItem {
  id: string;
  category: ContactCategory;
  subCategory: string;
  displayName: string;
  legalName: string;
  address: {
    street: string;
    building: string;
    district: string;
    city: string;
    coordinates: { latitude: number; longitude: number };
    plusCode?: string;
  };
  phone: { primary: string; secondary?: string; fax?: string };
  email?: string;
  website?: string;
  erpCodes?: { tin?: string; vatRegistration?: string };
  officeHours: { weekdays: string; saturday?: string; sunday: string; timeZone: "EAT" };
  services: string[];
  verificationStatus: "VERIFIED" | "PENDING" | "CLOSED";
  lastVerified: string;
}

// =============================================================================
// COMPLETE DATA (48 establishments) - TRANSLATED TO ENGLISH
// =============================================================================

const DIRECTORY_DATA: ContactDirectoryItem[] = [
  {
    id: "gov-erca-hq",
    category: "GOVERNMENT",
    subCategory: "Tax Authority",
    displayName: "Ethiopian Revenue Commission (ERC)",
    legalName: "Ethiopian Revenue Commission",
    address: {
      street: "Megenagna, Africa Avenue",
      building: "ERC Tower",
      district: "Yeka",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0218, longitude: 38.8115 },
      plusCode: "8Q7X+QR5"
    },
    phone: { primary: "+251 11 667 3100", secondary: "+251 11 667 3200", fax: "+251 11 667 3300" },
    email: "info@erca.gov.et",
    website: "www.erca.gov.et",
    erpCodes: { tin: "00001", vatRegistration: "VAT-001-ET" },
    officeHours: { weekdays: "08:00 - 17:00", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["Tax Declaration", "TIN Registration", "VAT Services", "Customs Clearance"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-15T00:00:00.000Z"
  },
  {
    id: "gov-min-trade",
    category: "GOVERNMENT",
    subCategory: "Ministry",
    displayName: "Ministry of Trade & Regional Integration",
    legalName: "Federal Democratic Republic of Ethiopia - Ministry of Trade",
    address: {
      street: "King George VI Street",
      building: "Ministry Building",
      district: "Arada",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0099, longitude: 38.7578 },
      plusCode: "8Q5X+9C4"
    },
    phone: { primary: "+251 11 551 7011", fax: "+251 11 551 2388" },
    email: "info@moti.gov.et",
    website: "www.motr.gov.et",
    officeHours: { weekdays: "08:30 - 12:30, 13:30 - 17:30", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["Business Licensing", "Import/Export Permits", "Trade Regulation"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-02-01T00:00:00.000Z"
  },
  {
    id: "gov-eic",
    category: "GOVERNMENT",
    subCategory: "Investment",
    displayName: "Ethiopian Investment Commission (EIC)",
    legalName: "Ethiopian Investment Commission",
    address: {
      street: "South Africa Street",
      building: "EIC Building",
      district: "Kirkos",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0089, longitude: 38.7702 },
      plusCode: "8Q6X+3C8"
    },
    phone: { primary: "+251 11 551 0033", secondary: "+251 11 551 0077" },
    email: "info@eic.gov.et",
    website: "www.eic.gov.et",
    officeHours: { weekdays: "08:00 - 17:00", saturday: "08:00 - 12:00", sunday: "Closed", timeZone: "EAT" },
    services: ["Investment Licensing", "One-Stop Service", "Investment Incentives"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-20T00:00:00.000Z"
  },
  {
    id: "gov-min-innovation",
    category: "GOVERNMENT",
    subCategory: "Ministry",
    displayName: "Ministry of Innovation & Technology",
    legalName: "Ministry of Innovation and Technology",
    address: {
      street: "Churchill Road",
      building: "Churchill Building",
      district: "Arada",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0112, longitude: 38.7615 },
      plusCode: "8Q6X+MC5"
    },
    phone: { primary: "+251 11 551 9555" },
    email: "info@mint.gov.et",
    website: "www.mint.gov.et",
    officeHours: { weekdays: "08:30 - 17:00", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["ICT Policy", "Digital Transformation", "Tech Startup Support"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-10T00:00:00.000Z"
  },
  {
    id: "gov-customs",
    category: "GOVERNMENT",
    subCategory: "Customs",
    displayName: "Ethiopian Customs Commission",
    legalName: "Ethiopian Customs Commission",
    address: {
      street: "Kality Industrial Area",
      building: "Customs HQ",
      district: "Akaki Kality",
      city: "Addis Ababa",
      coordinates: { latitude: 8.9087, longitude: 38.7321 },
      plusCode: "8Q5P+MC2"
    },
    phone: { primary: "+251 11 470 1516" },
    email: "info@customs.gov.et",
    officeHours: { weekdays: "08:00 - 17:00", saturday: "08:00 - 12:00", sunday: "Closed", timeZone: "EAT" },
    services: ["Customs Declaration", "Tariff Classification", "Border Control"],
    verificationStatus: "VERIFIED",
    lastVerified: "2023-12-15T00:00:00.000Z"
  },
  {
    id: "gov-police-federal",
    category: "GOVERNMENT",
    subCategory: "Security",
    displayName: "Federal Police Commission HQ",
    legalName: "Ethiopian Federal Police Commission",
    address: {
      street: "Mexico Square",
      building: "Federal Police Building",
      district: "Kirkos",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0105, longitude: 38.7389 },
      plusCode: "8Q6X+3F2"
    },
    phone: { primary: "+251 11 551 7070", secondary: "+251 11 551 7171" },
    email: "info@federalpolice.gov.et",
    officeHours: { weekdays: "24 Hours", saturday: "24 Hours", sunday: "24 Hours", timeZone: "EAT" },
    services: ["Police Report", "Cyber Crime Unit", "Passport Services"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-05T00:00:00.000Z"
  },
  {
    id: "gov-aacaba",
    category: "GOVERNMENT",
    subCategory: "Municipality",
    displayName: "Addis Ababa City Administration",
    legalName: "Addis Ababa City Administration - Trade Bureau",
    address: {
      street: "Churchill Road",
      building: "City Hall Complex",
      district: "Arada",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0095, longitude: 38.7612 },
      plusCode: "8Q6X+MC3"
    },
    phone: { primary: "+251 11 155 3030" },
    email: "info@addisababacity.gov.et",
    officeHours: { weekdays: "08:30 - 17:00", saturday: "08:30 - 12:00", sunday: "Closed", timeZone: "EAT" },
    services: ["Business Registration", "Property Tax", "City Services"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-25T00:00:00.000Z"
  },
  {
    id: "audit-deloitte",
    category: "AUDIT",
    subCategory: "Big Four",
    displayName: "Deloitte Ethiopia",
    legalName: "Deloitte Consulting Plc",
    address: {
      street: "Africa Avenue (Bole Road)",
      building: "Noah Plaza, 4th Floor, Wollo Sefer",
      district: "Bole",
      city: "Addis Ababa",
      coordinates: { latitude: 8.9906, longitude: 38.7755 },
      plusCode: "8Q7X+9F6"
    },
    phone: { primary: "+251 11 552 7667" },
    email: "info.ethiopia@deloitte.com",
    website: "www.deloitte.com/et",
    officeHours: { weekdays: "08:30 - 17:30", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["Audit & Assurance", "Tax Advisory", "Consulting", "Risk Advisory"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-12T00:00:00.000Z"
  },
  {
    id: "audit-kpmg",
    category: "AUDIT",
    subCategory: "Big Four",
    displayName: "KPMG Ethiopia",
    legalName: "KPMG Professional Services",
    address: {
      street: "Ras Desta Damtew Street",
      building: "Lucy Tower, 8th Floor",
      district: "Kirkos",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0102, longitude: 38.7412 },
      plusCode: "8Q6X+4G9"
    },
    phone: { primary: "+251 11 515 0188" },
    email: "info@kpmg.com.et",
    website: "www.kpmg.com/et",
    officeHours: { weekdays: "08:30 - 17:30", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["Financial Audit", "Tax Services", "Advisory", "Deal Advisory"],
    verificationStatus: "VERIFIED",
    lastVerified: "2023-12-20T00:00:00.000Z"
  },
  {
    id: "audit-pwc",
    category: "AUDIT",
    subCategory: "Big Four",
    displayName: "PwC Ethiopia",
    legalName: "PriceWaterhouseCoopers",
    address: {
      street: "Churchill Avenue",
      building: "Arat Kilo, Near Parliament",
      district: "Arada",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0350, longitude: 38.7630 },
      plusCode: "8Q7Q+MC8"
    },
    phone: { primary: "+251 11 124 9333" },
    email: "info@pwc.com",
    website: "www.pwc.com/et",
    officeHours: { weekdays: "08:00 - 17:00", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["Assurance", "Tax & Legal", "Consulting Services"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-08T00:00:00.000Z"
  },
  {
    id: "audit-ey",
    category: "AUDIT",
    subCategory: "Big Four",
    displayName: "EY Ethiopia",
    legalName: "Ernst & Young Ethiopia",
    address: {
      street: "Cameroon Street",
      building: "DH Geda Tower, 7th Floor",
      district: "Kirkos",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0156, longitude: 38.7734 },
      plusCode: "8Q6X+MC2"
    },
    phone: { primary: "+251 11 550 6666" },
    email: "info@ey.com",
    website: "www.ey.com/en_et",
    officeHours: { weekdays: "08:30 - 17:30", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["Audit", "Tax", "Strategy and Transactions", "Consulting"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-14T00:00:00.000Z"
  },
  {
    id: "audit-grant-thornton",
    category: "AUDIT",
    subCategory: "Mid Tier",
    displayName: "Grant Thornton Ethiopia",
    legalName: "Grant Thornton Chartered Accountants",
    address: {
      street: "Bole Road",
      building: "Bole Olympia, Near DH Geda",
      district: "Bole",
      city: "Addis Ababa",
      coordinates: { latitude: 8.9945, longitude: 38.7890 },
      plusCode: "8Q7X+8F3"
    },
    phone: { primary: "+251 11 470 1515" },
    email: "info@gtethiopia.com.et",
    officeHours: { weekdays: "08:30 - 17:00", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["Audit", "Tax", "Advisory", "Outsourcing"],
    verificationStatus: "VERIFIED",
    lastVerified: "2023-11-30T00:00:00.000Z"
  },
  {
    id: "audit-bdo",
    category: "AUDIT",
    subCategory: "Mid Tier",
    displayName: "BDO Ethiopia",
    legalName: "BDO Consulting Plc",
    address: {
      street: "Mazoria, Total Roundabout",
      building: "Mazoria Tower, 5th Floor",
      district: "Kirkos",
      city: "Addis Ababa",
      coordinates: { latitude: 8.9998, longitude: 38.7689 },
      plusCode: "8Q7X+3C5"
    },
    phone: { primary: "+251 11 466 0055" },
    email: "info@bdo.com.et",
    officeHours: { weekdays: "08:00 - 17:00", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["Audit", "Tax", "Business Advisory"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-03T00:00:00.000Z"
  },
  {
    id: "audit-horwath",
    category: "AUDIT",
    subCategory: "Local Major",
    displayName: "Horwath DHB Ethiopia",
    legalName: "Horwath DHB Chartered Accountants",
    address: {
      street: "Dubai Tower Road",
      building: "Dubai Tower, 3rd Floor",
      district: "Kirkos",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0089, longitude: 38.7690 },
      plusCode: "8Q6X+4C5"
    },
    phone: { primary: "+251 11 551 5151" },
    email: "info@horwath.com.et",
    officeHours: { weekdays: "08:30 - 17:00", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["Audit", "Tax", "Management Consulting"],
    verificationStatus: "VERIFIED",
    lastVerified: "2023-12-10T00:00:00.000Z"
  },
  {
    id: "legal-mehrteab",
    category: "LEGAL",
    subCategory: "Law Firm",
    displayName: "Mehrteab & Mehrteab Law Office",
    legalName: "Mehrteab & Mehrteab Advocates",
    address: {
      street: "Ras Desta Damtew Street",
      building: "Tobian Building, 3rd Floor",
      district: "Kirkos",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0110, longitude: 38.7420 },
      plusCode: "8Q6X+4F2"
    },
    phone: { primary: "+251 11 551 4411" },
    email: "info@mehrteablaw.com",
    website: "www.mehrteablaw.com",
    officeHours: { weekdays: "08:30 - 17:30", saturday: "08:30 - 12:30", sunday: "Closed", timeZone: "EAT" },
    services: ["Corporate Law", "Investment Law", "Litigation", "Arbitration"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-18T00:00:00.000Z"
  },
  {
    id: "legal-tadesse-kiros",
    category: "LEGAL",
    subCategory: "Law Firm",
    displayName: "Tadesse Kiros Law Office",
    legalName: "Tadesse Kiros and Associates",
    address: {
      street: "Marsabit Square",
      building: "Marsabit Plaza, 4th Floor",
      district: "Kirkos",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0120, longitude: 38.7450 },
      plusCode: "8Q6X+5C3"
    },
    phone: { primary: "+251 11 551 3344" },
    email: "tkl@ethionet.et",
    officeHours: { weekdays: "09:00 - 18:00", saturday: "09:00 - 13:00", sunday: "Closed", timeZone: "EAT" },
    services: ["Corporate Law", "Banking & Finance", "Intellectual Property"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-05T00:00:00.000Z"
  },
  {
    id: "legal-aman",
    category: "LEGAL",
    subCategory: "Law Firm",
    displayName: "Aman & Partners",
    legalName: "Aman & Partners Law Office",
    address: {
      street: "Bole Road",
      building: "Getahun Beshah Building, 5th Floor",
      district: "Bole",
      city: "Addis Ababa",
      coordinates: { latitude: 8.9850, longitude: 38.7900 },
      plusCode: "8Q7X+9C2"
    },
    phone: { primary: "+251 11 618 1056" },
    email: "info@amanpartners.com",
    website: "www.amanpartners.com",
    officeHours: { weekdays: "08:30 - 17:30", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["Construction Law", "Energy Law", "PPP Advisory"],
    verificationStatus: "VERIFIED",
    lastVerified: "2023-12-28T00:00:00.000Z"
  },
  {
    id: "legal-zion",
    category: "LEGAL",
    subCategory: "Law Firm",
    displayName: "Zion Law Firm",
    legalName: "Zion Law Office PLC",
    address: {
      street: "Kazanchis, Debrezit Road",
      building: "Berhane Eyesus Building",
      district: "Arada",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0200, longitude: 38.7550 },
      plusCode: "8Q7X+MC1"
    },
    phone: { primary: "+251 11 157 7070" },
    email: "info@zionlaw.com.et",
    officeHours: { weekdays: "08:00 - 17:00", saturday: "08:00 - 12:00", sunday: "Closed", timeZone: "EAT" },
    services: ["Labor Law", "Tax Litigation", "Commercial Law"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-22T00:00:00.000Z"
  },
  {
    id: "legal-bar-assoc",
    category: "LEGAL",
    subCategory: "Bar Association",
    displayName: "Ethiopian Federal Bar Association",
    legalName: "Federal Bar Association of Ethiopia",
    address: {
      street: "Churchill Road",
      building: "Near Ministry of Justice",
      district: "Arada",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0115, longitude: 38.7620 },
      plusCode: "8Q6X+MC6"
    },
    phone: { primary: "+251 11 551 4114" },
    email: "info@fbe.org.et",
    officeHours: { weekdays: "08:30 - 17:00", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["Lawyer Registration", "Bar Exams", "Legal Ethics"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-01T00:00:00.000Z"
  },
  {
    id: "legal-notary-1",
    category: "LEGAL",
    subCategory: "Notary",
    displayName: "Notary Public Office - Bole",
    legalName: "Federal Notary Public Office",
    address: {
      street: "Bole Medhanealem Road",
      building: "Bole Rwanda Area",
      district: "Bole",
      city: "Addis Ababa",
      coordinates: { latitude: 8.9980, longitude: 38.7950 },
      plusCode: "8Q7X+5C9"
    },
    phone: { primary: "+251 11 618 2020" },
    email: "notary.bole@justice.gov.et",
    officeHours: { weekdays: "08:30 - 16:30", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["Document Notarization", "Power of Attorney", "Legal Attestation"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-10T00:00:00.000Z"
  },
  {
    id: "legal-notary-2",
    category: "LEGAL",
    subCategory: "Notary",
    displayName: "Notary Public Office - Arada",
    legalName: "Federal Notary Public Office - Arada Branch",
    address: {
      street: "Churchill Road",
      building: "Arada Sub-City Building",
      district: "Arada",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0090, longitude: 38.7600 },
      plusCode: "8Q6X+MC2"
    },
    phone: { primary: "+251 11 551 3322" },
    officeHours: { weekdays: "08:30 - 16:30", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["Notarization", "Legal Translation Certification"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-15T00:00:00.000Z"
  },
  {
    id: "bank-cbe-megenagna",
    category: "BANKING",
    subCategory: "Commercial Bank",
    displayName: "CBE - Megenagna Branch",
    legalName: "Commercial Bank of Ethiopia",
    address: {
      street: "Megenagna Square",
      building: "Megenagna Commercial Center",
      district: "Yeka",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0220, longitude: 38.8120 },
      plusCode: "8Q7X+QR6"
    },
    phone: { primary: "+251 11 662 3030" },
    email: "megenagna@cbe.com.et",
    website: "www.combanketh.et",
    officeHours: { weekdays: "08:00 - 16:00", saturday: "08:00 - 12:00", sunday: "Closed", timeZone: "EAT" },
    services: ["Retail Banking", "Corporate Banking", "International Banking", "ATM"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-20T00:00:00.000Z"
  },
  {
    id: "bank-cbe-churchill",
    category: "BANKING",
    subCategory: "Commercial Bank",
    displayName: "CBE - Churchill Branch",
    legalName: "Commercial Bank of Ethiopia",
    address: {
      street: "Churchill Road",
      building: "Churchill Building",
      district: "Arada",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0108, longitude: 38.7615 },
      plusCode: "8Q6X+MC5"
    },
    phone: { primary: "+251 11 551 7010" },
    email: "churchill@cbe.com.et",
    website: "www.combanketh.et",
    officeHours: { weekdays: "08:00 - 16:00", saturday: "08:00 - 12:00", sunday: "Closed", timeZone: "EAT" },
    services: ["Banking Services", "Forex", "Safe Deposit Boxes"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-12T00:00:00.000Z"
  },
  {
    id: "bank-dashen",
    category: "BANKING",
    subCategory: "Private Bank",
    displayName: "Dashen Bank HQ",
    legalName: "Dashen Bank S.C.",
    address: {
      street: "Kazanchis",
      building: "Dashen Bank Tower",
      district: "Arada",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0170, longitude: 38.7520 },
      plusCode: "8Q7X+MC4"
    },
    phone: { primary: "+251 11 466 9911" },
    email: "info@dashenbanksc.com",
    website: "www.dashenbanksc.com",
    officeHours: { weekdays: "08:00 - 18:00", saturday: "08:00 - 12:00", sunday: "Closed", timeZone: "EAT" },
    services: ["Branch Banking", "ATM", "Mobile Banking", "Corporate Banking"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-08T00:00:00.000Z"
  },
  {
    id: "bank-awash",
    category: "BANKING",
    subCategory: "Private Bank",
    displayName: "Awash Bank - Main Branch",
    legalName: "Awash International Bank S.C.",
    address: {
      street: "Gambia Street",
      building: "Awash Bank Building",
      district: "Kirkos",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0105, longitude: 38.7455 },
      plusCode: "8Q6X+4F5"
    },
    phone: { primary: "+251 11 126 8811" },
    email: "info@awashbank.com",
    website: "www.awashbank.com",
    officeHours: { weekdays: "08:00 - 18:00", saturday: "08:00 - 12:00", sunday: "Closed", timeZone: "EAT" },
    services: ["Retail Banking", "SME Banking", "Forex Services"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-15T00:00:00.000Z"
  },
  {
    id: "bank-abyssinia",
    category: "BANKING",
    subCategory: "Private Bank",
    displayName: "Bank of Abyssinia",
    legalName: "Bank of Abyssinia S.C.",
    address: {
      street: "Bole Road",
      building: "Bole Medhanealem Tower",
      district: "Bole",
      city: "Addis Ababa",
      coordinates: { latitude: 8.9950, longitude: 38.7850 },
      plusCode: "8Q7X+9F5"
    },
    phone: { primary: "+251 11 618 8000" },
    email: "info@bankofabyssinia.com",
    website: "www.bankofabyssinia.com",
    officeHours: { weekdays: "08:00 - 17:00", saturday: "08:00 - 12:00", sunday: "Closed", timeZone: "EAT" },
    services: ["Banking", "Loans", "Money Transfer"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-05T00:00:00.000Z"
  },
  {
    id: "bank-cbo",
    category: "BANKING",
    subCategory: "Cooperative Bank",
    displayName: "Cooperative Bank of Oromia",
    legalName: "Cooperative Bank of Oromia S.C.",
    address: {
      street: "Fitawrari Habtegiorgis Street",
      building: "CBO Tower, Dembel Area",
      district: "Kirkos",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0085, longitude: 38.7700 },
      plusCode: "8Q6X+4C8"
    },
    phone: { primary: "+251 11 557 0700" },
    email: "info@cboet.com",
    website: "www.cbo.et",
    officeHours: { weekdays: "08:00 - 17:00", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["Cooperative Banking", "Agro-Processing Finance", "Retail Banking"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-18T00:00:00.000Z"
  },
  {
    id: "bank-telebirr",
    category: "BANKING",
    subCategory: "Mobile Money",
    displayName: "Telebirr Experience Center",
    legalName: "Ethio Telecom - Telebirr",
    address: {
      street: "Churchill Road",
      building: "Ethio Telecom Tower",
      district: "Arada",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0098, longitude: 38.7625 },
      plusCode: "8Q6X+MC7"
    },
    phone: { primary: "+251 11 551 0022" },
    email: "telebirr@ethiotelecom.et",
    website: "www.ethiotelecom.et/telebirr",
    officeHours: { weekdays: "08:00 - 18:00", saturday: "08:00 - 12:00", sunday: "Closed", timeZone: "EAT" },
    services: ["Mobile Money", "Digital Wallet", "Bill Payment", "Airtime"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-25T00:00:00.000Z"
  },
  {
    id: "post-ethiopost",
    category: "LOGISTICS",
    subCategory: "Postal Service",
    displayName: "EthioPost - Headquarters",
    legalName: "Ethiopian Postal Service Enterprise",
    address: {
      street: "Churchill Road",
      building: "EthioPost Building (Near Filwuha Hot Springs)",
      district: "Arada",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0108, longitude: 38.7613 },
      plusCode: "8Q6X+MC5"
    },
    phone: { primary: "+251 11 551 1212", secondary: "+251 11 551 1313", fax: "+251 11 551 1414" },
    email: "info@ethiopostal.gov.et",
    website: "www.ethiopostal.com",
    officeHours: { weekdays: "08:30 - 18:00", saturday: "08:30 - 12:00", sunday: "Closed", timeZone: "EAT" },
    services: ["EMS", "Registered Mail", "Parcel Service", "PO Boxes", "Philately", "Express Delivery"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-15T00:00:00.000Z"
  },
  {
    id: "log-dhl",
    category: "LOGISTICS",
    subCategory: "International Courier",
    displayName: "DHL Express Ethiopia",
    legalName: "DHL Global Forwarding Ethiopia",
    address: {
      street: "Africa Avenue",
      building: "Bole Olympia Behind DH Geda",
      district: "Bole",
      city: "Addis Ababa",
      coordinates: { latitude: 8.9920, longitude: 38.7880 },
      plusCode: "8Q7X+9C7"
    },
    phone: { primary: "+251 11 665 0600" },
    email: "info.ethiopia@dhl.com",
    website: "www.dhl.com/et",
    officeHours: { weekdays: "08:00 - 17:30", saturday: "08:00 - 12:00", sunday: "Closed", timeZone: "EAT" },
    services: ["International Express", "Freight", "E-commerce Logistics"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-10T00:00:00.000Z"
  },
  {
    id: "log-fedex",
    category: "LOGISTICS",
    subCategory: "International Courier",
    displayName: "FedEx Ethiopia",
    legalName: "Federal Express Ethiopia",
    address: {
      street: "Bole Road",
      building: "Edna Mall Area",
      district: "Bole",
      city: "Addis Ababa",
      coordinates: { latitude: 8.9890, longitude: 38.7910 },
      plusCode: "8Q7X+8C9"
    },
    phone: { primary: "+251 11 618 4848" },
    email: "ethiopia@fedex.com",
    officeHours: { weekdays: "08:00 - 17:00", saturday: "08:00 - 12:00", sunday: "Closed", timeZone: "EAT" },
    services: ["International Shipping", "Cargo Services"],
    verificationStatus: "VERIFIED",
    lastVerified: "2023-12-20T00:00:00.000Z"
  },
  {
    id: "log-african-express",
    category: "LOGISTICS",
    subCategory: "Air Cargo",
    displayName: "African Express Airways",
    legalName: "African Express Airways Ethiopia",
    address: {
      street: "Bole International Airport",
      building: "Cargo Terminal",
      district: "Bole",
      city: "Addis Ababa",
      coordinates: { latitude: 8.9778, longitude: 38.7993 },
      plusCode: "8Q7X+5C2"
    },
    phone: { primary: "+251 11 665 8585" },
    email: "cargo@africanexpress.co.ke",
    officeHours: { weekdays: "24 Hours", saturday: "24 Hours", sunday: "24 Hours", timeZone: "EAT" },
    services: ["Air Cargo", "Charter Services", "Freight"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-05T00:00:00.000Z"
  },
  {
    id: "log-ems",
    category: "LOGISTICS",
    subCategory: "Courier",
    displayName: "EMS Ethiopia",
    legalName: "Ethiopian Mail Service",
    address: {
      street: "Churchill Road",
      building: "EthioPost Complex",
      district: "Arada",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0110, longitude: 38.7620 },
      plusCode: "8Q6X+MC6"
    },
    phone: { primary: "+251 11 551 1555" },
    email: "ems@ethiopostal.gov.et",
    officeHours: { weekdays: "08:30 - 17:00", saturday: "08:30 - 12:00", sunday: "Closed", timeZone: "EAT" },
    services: ["Express Mail Service", "Domestic Courier", "International Mail"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-12T00:00:00.000Z"
  },
  {
    id: "log-cadyna",
    category: "LOGISTICS",
    subCategory: "Local Transport",
    displayName: "Cadyna Transport",
    legalName: "Cadyna Transport PLC",
    address: {
      street: "Debrezit Road",
      building: "Kality Industrial Zone",
      district: "Akaki Kality",
      city: "Addis Ababa",
      coordinates: { latitude: 8.9120, longitude: 38.7410 },
      plusCode: "8Q5P+MC3"
    },
    phone: { primary: "+251 11 470 2525" },
    email: "info@cadynatransport.com",
    officeHours: { weekdays: "08:00 - 17:00", saturday: "08:00 - 12:00", sunday: "Closed", timeZone: "EAT" },
    services: ["Freight Transport", "Warehousing", "Distribution"],
    verificationStatus: "VERIFIED",
    lastVerified: "2023-12-15T00:00:00.000Z"
  },
  {
    id: "log-abyssinia-freight",
    category: "LOGISTICS",
    subCategory: "Freight Forwarder",
    displayName: "Abyssinia Freight Services",
    legalName: "Abyssinia Freight & Logistics PLC",
    address: {
      street: "Kazanchis",
      building: "Freight Terminal",
      district: "Arada",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0180, longitude: 38.7530 },
      plusCode: "8Q7X+MC3"
    },
    phone: { primary: "+251 11 551 3030" },
    email: "info@abyssiniafreight.et",
    officeHours: { weekdays: "08:00 - 17:00", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["Freight Forwarding", "Customs Brokerage", "Project Cargo"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-20T00:00:00.000Z"
  },
  {
    id: "hr-ethiojobs",
    category: "RECRUITMENT",
    subCategory: "Job Portal",
    displayName: "Ethiojobs.net",
    legalName: "Ethiojobs.net - Info Mind Solutions",
    address: {
      street: "Bole Road",
      building: "Friendship Building, 4th Floor",
      district: "Bole",
      city: "Addis Ababa",
      coordinates: { latitude: 8.9960, longitude: 38.7820 },
      plusCode: "8Q7X+5C8"
    },
    phone: { primary: "+251 11 618 5888" },
    email: "info@ethiojobs.net",
    website: "www.ethiojobs.net",
    officeHours: { weekdays: "08:30 - 17:30", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["Job Posting", "CV Database", "Recruitment Services", "HR Consulting"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-15T00:00:00.000Z"
  },
  {
    id: "hr-gebeya",
    category: "RECRUITMENT",
    subCategory: "Tech Talent",
    displayName: "Gebeya Inc.",
    legalName: "Gebeya Talent",
    address: {
      street: "Cameroon Street",
      building: "Ice Addis Building",
      district: "Kirkos",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0160, longitude: 38.7750 },
      plusCode: "8Q6X+4C7"
    },
    phone: { primary: "+251 11 470 1515" },
    email: "info@gebeya.com",
    website: "www.gebeya.com",
    officeHours: { weekdays: "09:00 - 18:00", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["Tech Talent Marketplace", "IT Outsourcing", "Training"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-08T00:00:00.000Z"
  },
  {
    id: "hr-highered",
    category: "RECRUITMENT",
    subCategory: "Education HR",
    displayName: "HigherEd Global",
    legalName: "HigherEd Global Services Ethiopia",
    address: {
      street: "Ras Desta Damtew Street",
      building: "Sunshine Tower, 3rd Floor",
      district: "Kirkos",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0120, longitude: 38.7430 },
      plusCode: "8Q6X+4F3"
    },
    phone: { primary: "+251 11 551 2525" },
    email: "addisababa@highered.global",
    website: "www.highered.global",
    officeHours: { weekdays: "08:30 - 17:00", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["Executive Search", "Academic Recruitment", "Assessment Centers"],
    verificationStatus: "VERIFIED",
    lastVerified: "2023-12-22T00:00:00.000Z"
  },
  {
    id: "hr-brighter",
    category: "RECRUITMENT",
    subCategory: "Generalist",
    displayName: "BrighterMonday Ethiopia",
    legalName: "BrighterMonday Ethiopia",
    address: {
      street: "Bole Road",
      building: "Getahun Beshah Building, 3rd Floor",
      district: "Bole",
      city: "Addis Ababa",
      coordinates: { latitude: 8.9870, longitude: 38.7930 },
      plusCode: "8Q7X+8F7"
    },
    phone: { primary: "+251 11 618 1919" },
    email: "info@brightermonday.et",
    website: "www.brightermonday.et",
    officeHours: { weekdays: "08:00 - 17:00", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["Job Portal", "HR Services", "Career Advice"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-18T00:00:00.000Z"
  },
  {
    id: "hr-strategic",
    category: "RECRUITMENT",
    subCategory: "Executive Search",
    displayName: "Strategic Solutions HR",
    legalName: "Strategic Solutions HR Consultancy",
    address: {
      street: "Mohammed Mazoria",
      building: "Mazoria Tower, 6th Floor",
      district: "Kirkos",
      city: "Addis Ababa",
      coordinates: { latitude: 8.9985, longitude: 38.7695 },
      plusCode: "8Q7X+3C6"
    },
    phone: { primary: "+251 11 466 1122" },
    email: "info@strategichr.et",
    officeHours: { weekdays: "08:30 - 17:30", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["Executive Search", "Payroll Management", "HR Outsourcing"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-10T00:00:00.000Z"
  },
  {
    id: "hr-alice",
    category: "RECRUITMENT",
    subCategory: "Agency",
    displayName: "Alice Recruitment Agency",
    legalName: "Alice Human Resource Solutions",
    address: {
      street: "Debrezit Road",
      building: "Sunshine Hotel Building, 2nd Floor",
      district: "Kirkos",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0020, longitude: 38.7650 },
      plusCode: "8Q7X+3F4"
    },
    phone: { primary: "+251 11 470 3030" },
    email: "info@alicerecruitment.com",
    officeHours: { weekdays: "08:00 - 17:00", saturday: "08:00 - 12:00", sunday: "Closed", timeZone: "EAT" },
    services: ["Domestic Workers Placement", "General Staffing", "Training"],
    verificationStatus: "VERIFIED",
    lastVerified: "2023-12-28T00:00:00.000Z"
  },
  {
    id: "it-midroc",
    category: "IT_HARDWARE",
    subCategory: "Systems Integrator",
    displayName: "Midroc Technology Solutions",
    legalName: "Midroc Technology Group",
    address: {
      street: "Bole Road",
      building: "Midroc Building, Behind Millennium Hall",
      district: "Bole",
      city: "Addis Ababa",
      coordinates: { latitude: 8.9955, longitude: 38.7960 },
      plusCode: "8Q7X+9C9"
    },
    phone: { primary: "+251 11 618 8888" },
    email: "info@midroc-tech.com",
    website: "www.midroc-et.com",
    officeHours: { weekdays: "08:30 - 17:30", saturday: "08:30 - 12:30", sunday: "Closed", timeZone: "EAT" },
    services: ["IT Infrastructure", "Data Center Solutions", "Software Development", "Hardware Supply"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-20T00:00:00.000Z"
  },
  {
    id: "it-zte",
    category: "IT_HARDWARE",
    subCategory: "Telecom Equipment",
    displayName: "ZTE Ethiopia",
    legalName: "ZTE Corporation Ethiopia Branch",
    address: {
      street: "Africa Avenue",
      building: "ZTE Tower, Wollo Sefer",
      district: "Kirkos",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0080, longitude: 38.7720 },
      plusCode: "8Q6X+4C9"
    },
    phone: { primary: "+251 11 551 9090" },
    email: "info.zte@zte.com.cn",
    website: "www.zte.com.cn",
    officeHours: { weekdays: "08:00 - 17:00", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["Telecom Equipment", "Network Solutions", "Smart Phones", "IT Infrastructure"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-12T00:00:00.000Z"
  },
  {
    id: "it-huawei",
    category: "IT_HARDWARE",
    subCategory: "Telecom Equipment",
    displayName: "Huawei Ethiopia",
    legalName: "Huawei Technologies Ethiopia PLC",
    address: {
      street: "Bole Road",
      building: "Huawei Building, Near Airport",
      district: "Bole",
      city: "Addis Ababa",
      coordinates: { latitude: 8.9820, longitude: 38.8000 },
      plusCode: "8Q5M+5C2"
    },
    phone: { primary: "+251 11 618 8888" },
    email: "info@huawei.com",
    website: "www.huawei.com/et",
    officeHours: { weekdays: "08:00 - 17:00", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["ICT Infrastructure", "Smart Devices", "Enterprise Solutions", "Cloud Services"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-15T00:00:00.000Z"
  },
  {
    id: "it-smart",
    category: "IT_HARDWARE",
    subCategory: "Reseller",
    displayName: "Smart Business Systems",
    legalName: "Smart Business Systems PLC",
    address: {
      street: "Churchill Road",
      building: "Churchill Building, Ground Floor",
      district: "Arada",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0112, longitude: 38.7618 },
      plusCode: "8Q6X+MC6"
    },
    phone: { primary: "+251 11 551 7000" },
    email: "info@smartbusiness.et",
    website: "www.smartbusiness.et",
    officeHours: { weekdays: "08:30 - 17:30", saturday: "08:30 - 12:00", sunday: "Closed", timeZone: "EAT" },
    services: ["Dell/HP/Apple Reseller", "IT Support", "Server Maintenance", "Networking Equipment"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-08T00:00:00.000Z"
  },
  {
    id: "it-warehouse",
    category: "IT_HARDWARE",
    subCategory: "Retailer",
    displayName: "Computer Warehouse",
    legalName: "Computer Warehouse PLC",
    address: {
      street: "Churchill Road",
      building: "Eden Building, Near Semien Hotel",
      district: "Arada",
      city: "Addis Ababa",
      coordinates: { latitude: 9.0100, longitude: 38.7605 },
      plusCode: "8Q6X+MC4"
    },
    phone: { primary: "+251 11 551 2323" },
    email: "info@computerwarehouse.et",
    officeHours: { weekdays: "08:30 - 18:00", saturday: "08:30 - 14:00", sunday: "Closed", timeZone: "EAT" },
    services: ["Computer Sales", "Components", "Repair Services", "Accessories"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-22T00:00:00.000Z"
  },
  {
    id: "it-itiq",
    category: "IT_HARDWARE",
    subCategory: "Solutions Provider",
    displayName: "IT IQ Solutions",
    legalName: "IT IQ Technologies",
    address: {
      street: "Bole Road",
      building: "Friendship City Center, 5th Floor",
      district: "Bole",
      city: "Addis Ababa",
      coordinates: { latitude: 8.9970, longitude: 38.7810 },
      plusCode: "8Q7X+5C9"
    },
    phone: { primary: "+251 11 618 4545" },
    email: "info@itiq.et",
    website: "www.itiq.et",
    officeHours: { weekdays: "08:00 - 17:00", saturday: "Closed", sunday: "Closed", timeZone: "EAT" },
    services: ["IT Consulting", "Hardware Supply", "Software Solutions", "Maintenance"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-05T00:00:00.000Z"
  },
  {
    id: "it-raxio",
    category: "IT_HARDWARE",
    subCategory: "Data Center",
    displayName: "Raxio Data Center",
    legalName: "Raxio Ethiopia",
    address: {
      street: "ICT Park",
      building: "Ethiopian ICT Park, Bole Lemi",
      district: "Bole",
      city: "Addis Ababa",
      coordinates: { latitude: 8.9650, longitude: 38.8100 },
      plusCode: "8Q7M+3C5"
    },
    phone: { primary: "+251 11 557 9090" },
    email: "info@raxio.co",
    website: "www.raxio.co",
    officeHours: { weekdays: "24 Hours", saturday: "24 Hours", sunday: "24 Hours", timeZone: "EAT" },
    services: ["Colocation", "Cloud Services", "Managed Hosting", "Disaster Recovery"],
    verificationStatus: "VERIFIED",
    lastVerified: "2024-01-25T00:00:00.000Z"
  }
];

// Category configuration with display labels in English
const CATEGORY_CONFIG: Record<ContactCategory, { label: string; color: string; icon: React.ElementType }> = {
  GOVERNMENT: { label: "Government", color: "#DC2626", icon: Landmark },
  AUDIT: { label: "Audit & Accounting", color: "#059669", icon: Briefcase },
  LEGAL: { label: "Legal", color: "#7C3AED", icon: ShieldCheck },
  BANKING: { label: "Banking", color: "#2563EB", icon: Building2 },
  LOGISTICS: { label: "Logistics", color: "#D97706", icon: Truck },
  RECRUITMENT: { label: "Recruitment", color: "#DB2777", icon: Users },
  IT_HARDWARE: { label: "IT Hardware", color: "#0891B2", icon: Cpu },
  SUPPLIER: { label: "Supplier", color: "#EA580C", icon: Truck },
  CLIENT: { label: "Client", color: "#7C3AED", icon: Users },
  PARTNER: { label: "Partner", color: "#0891B2", icon: Briefcase }
};

// =============================================================================
// MAP VIEW COMPONENT
// =============================================================================

interface MapViewProps {
  contacts: ContactDirectoryItem[];
  selectedContact: ContactDirectoryItem | null;
  userLocation: [number, number] | null;
}

const SimpleMapView = ({ selectedContact }: MapViewProps) => {
  const getMapUrl = () => {
    if (selectedContact) {
      const { latitude, longitude } = selectedContact.address.coordinates;
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.5!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM40wMCcwMC4wIk4gMzg8MNTAnMDAuMCJF!5e0!3m2!1sen!2set!4v1609459200000!5m2!1sen!2set&q=${encodeURIComponent(selectedContact.displayName)}`;
    }
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.5!2d38.7577!3d9.0084!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85cef5ab402d%3A0x8467b6b037a1c2e0!2sAddis%20Ababa!5e0!3m2!1sen!2set!4v1609459200000!5m2!1sen!2set`;
  };

  return (
    <div className="h-full w-full bg-white relative">
      <iframe
        src={getMapUrl()}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="transition-all duration-500"
      />
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ContactDirectory() {
  const [activeCategory, setActiveCategory] = useState<ContactCategory | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<ContactDirectoryItem | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(loc);
        },
        (err) => console.log('Geolocation not available:', err.message),
        { timeout: 10000, enableHighAccuracy: false }
      );
    }
  }, []);

  const filteredContacts = useMemo(() => {
    const data = DIRECTORY_DATA || [];
    if (!searchTerm && activeCategory === 'ALL') return data;
    
    return data.filter(contact => {
      const categoryMatch = activeCategory === 'ALL' || contact.category === activeCategory;
      const searchLower = searchTerm.toLowerCase().trim();
      const searchMatch = !searchLower || (
        contact.displayName.toLowerCase().includes(searchLower) ||
        contact.legalName.toLowerCase().includes(searchLower) ||
        contact.address.street.toLowerCase().includes(searchLower) ||
        contact.address.district.toLowerCase().includes(searchLower) ||
        contact.phone.primary.includes(searchTerm)
      );
      return categoryMatch && searchMatch;
    });
  }, [activeCategory, searchTerm]);

  const openItinerary = useCallback((contact: ContactDirectoryItem) => {
    if (typeof window === 'undefined') return;
    const { latitude, longitude } = contact.address.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const formatPhone = useCallback((phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\s/g, '');
    return cleaned.replace(/(\+251)(\d{2})(\d{3})(\d{4})/, '$1 $2 $3 $4');
  }, []);

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 10) / 10;
  }, []);

  const copyToClipboard = useCallback((text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(console.error);
    }
  }, []);

  const shareContact = useCallback(async (contact: ContactDirectoryItem) => {
    if (typeof navigator === 'undefined' || !navigator.share) return;
    try {
      await navigator.share({
        title: contact.displayName,
        text: `${contact.displayName} - ${contact.address.street}, ${contact.address.city}`,
        url: window.location.href
      });
    } catch (err) {
      console.log('Share cancelled');
    }
  }, []);

  if (!isMounted) return <div className="h-screen bg-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden font-sans text-slate-800" style={{ fontFamily: 'Satoshi, sans-serif' }}>
      
      {/* HEADER SECTION */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center z-40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg text-white">
            <MapPin size={24} />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">ADDIS DIRECTORY</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block w-64 lg:w-96">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, street, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => userLocation && setUserLocation(userLocation)}
            disabled={!userLocation}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 text-sm font-bold transition-all"
          >
            <Crosshair size={16} />
            <span className="hidden sm:inline">My Location</span>
          </button>
        </div>
      </header>

      {/* TOP BANNER: CATEGORIES & CONTACTS */}
      <section className="bg-white border-b border-slate-100 z-30 shadow-sm flex-shrink-0">
        {/* Categories Bar */}
        <div className="px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-50">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeCategory === 'ALL' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
          >
            All ({DIRECTORY_DATA.length})
          </button>
          {(Object.keys(CATEGORY_CONFIG) as ContactCategory[]).map(cat => {
            const count = DIRECTORY_DATA.filter(c => c.category === cat).length;
            if (count === 0) return null;
            const isActive = activeCategory === cat;
            const config = CATEGORY_CONFIG[cat];
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(isActive ? 'ALL' : cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${isActive ? 'text-white border-transparent' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                style={isActive ? { backgroundColor: config.color } : {}}
              >
                <config.icon size={12} />
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Horizontal Contacts Banner */}
        <div className="px-6 py-5 flex gap-4 overflow-x-auto scroll-smooth no-scrollbar">
          {filteredContacts.length === 0 ? (
            <div className="py-10 px-4 text-slate-400 text-sm font-medium">No establishments found matching your criteria.</div>
          ) : (
            filteredContacts.map(contact => (
              <div 
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`flex-shrink-0 w-72 p-4 rounded-2xl border transition-all cursor-pointer group hover:shadow-lg ${selectedContact?.id === contact.id ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500' : 'border-slate-100 bg-white'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: CATEGORY_CONFIG[contact.category].color }}>
                    {contact.displayName.charAt(0)}
                  </div>
                  {contact.verificationStatus === "VERIFIED" && (
                    <ShieldCheck size={16} className="text-emerald-500" />
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {contact.displayName}
                </h3>
                <p className="text-[10px] text-slate-500 mb-1">{contact.subCategory}</p>
                <p className="text-[11px] text-slate-500 mb-3 flex items-center gap-1">
                  <MapPin size={10} /> {contact.address.district}, {contact.address.city}
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); openItinerary(contact); }}
                    className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-[10px] font-bold text-slate-700 transition-colors"
                  >
                    Directions
                  </button>
                  <button 
                    className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-[10px] font-bold text-white transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* MAP SECTION - UNDERNEATH */}
      <main className="flex-1 relative">
        <SimpleMapView 
          contacts={filteredContacts}
          selectedContact={selectedContact}
          userLocation={userLocation}
        />
        
        {/* Floating Contact Summary on Map */}
        {selectedContact && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/95 backdrop-blur shadow-2xl rounded-2xl border border-slate-200 p-5 flex items-center gap-5">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Selected Place</p>
                <h4 className="font-black text-slate-900 text-lg truncate">{selectedContact.displayName}</h4>
                <p className="text-sm text-slate-500 truncate">{selectedContact.address.street}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => openItinerary(selectedContact)}
                  className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200"
                >
                  <Navigation size={20} />
                </button>
                <button 
                  onClick={() => setSelectedContact(null)}
                  className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* SIDE DETAIL PANEL */}
      {selectedContact && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm"
          onClick={() => setSelectedContact(null)}
        >
          <aside 
            className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Detail Header */}
            <div className="relative h-48 flex items-end p-8" style={{ backgroundColor: CATEGORY_CONFIG[selectedContact.category].color }}>
              <button 
                onClick={() => setSelectedContact(null)}
                className="absolute top-6 right-6 p-2 bg-black/10 hover:bg-black/20 rounded-full text-white transition-colors"
              >
                <X size={24} />
              </button>
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-white/20 rounded text-[10px] font-bold text-white border border-white/30 mb-2 uppercase tracking-widest">
                  {CATEGORY_CONFIG[selectedContact.category].label}
                </span>
                <h2 className="text-3xl font-black text-white leading-tight">{selectedContact.displayName}</h2>
              </div>
            </div>

            <div className="p-8 space-y-8 bg-white">
              {/* Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => openItinerary(selectedContact)}
                  className="flex items-center justify-center gap-3 p-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-100"
                >
                  <Navigation size={20} />
                  Directions
                </button>
                <a
                  href={`tel:${selectedContact.phone.primary.replace(/\s/g, '')}`}
                  className="flex items-center justify-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-100"
                >
                  <Phone size={20} />
                  Call Now
                </a>
              </div>

              {/* Information Sections */}
              <section className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Contact Details</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400"><MapPin size={20} /></div>
                    <div>
                      <p className="text-slate-900 font-bold text-base">{selectedContact.address.street}</p>
                      <p className="text-slate-500 text-sm">{selectedContact.address.building}</p>
                      <p className="text-slate-500 text-sm">{selectedContact.address.district}, {selectedContact.address.city}</p>
                      {userLocation && (
                        <p className="text-emerald-600 text-xs font-bold mt-2 flex items-center gap-1">
                          <Navigation size={12} />
                          {calculateDistance(userLocation[0], userLocation[1], selectedContact.address.coordinates.latitude, selectedContact.address.coordinates.longitude)} km away
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400"><Phone size={20} /></div>
                    <div className="flex-1">
                      <p className="text-slate-900 font-bold font-mono">{formatPhone(selectedContact.phone.primary)}</p>
                      {selectedContact.phone.secondary && <p className="text-slate-400 text-xs font-mono">{formatPhone(selectedContact.phone.secondary)}</p>}
                    </div>
                    <button onClick={() => copyToClipboard(selectedContact.phone.primary)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-300"><Copy size={16} /></button>
                  </div>

                  {selectedContact.email && (
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-50 rounded-xl text-slate-400"><Mail size={20} /></div>
                      <a href={`mailto:${selectedContact.email}`} className="text-blue-600 font-bold hover:underline">{selectedContact.email}</a>
                    </div>
                  )}

                  {selectedContact.website && (
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-50 rounded-xl text-slate-400"><Globe size={20} /></div>
                      <a href={`https://${selectedContact.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline flex items-center gap-2">
                        {selectedContact.website} <ExternalLink size={14} />
                      </a>
                    </div>
                  )}
                </div>
              </section>

              {/* Business Hours */}
              <section className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Business Hours</h3>
                <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Monday - Friday</span>
                    <span className="text-slate-900 font-bold">{selectedContact.officeHours.weekdays}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Saturday</span>
                    <span className="text-slate-900 font-bold">{selectedContact.officeHours.saturday || 'Closed'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Sunday</span>
                    <span className="text-slate-900 font-bold">{selectedContact.officeHours.sunday}</span>
                  </div>
                </div>
              </section>

              {/* Services */}
              <section className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Services Offered</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedContact.services.map((service, idx) => (
                    <span key={idx} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-sm">
                      {service}
                    </span>
                  ))}
                </div>
              </section>

              {/* ERP Data */}
              {(selectedContact.erpCodes?.tin || selectedContact.erpCodes?.vatRegistration) && (
                <section className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Corporate Identity</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedContact.erpCodes.tin && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 mb-1">TIN NUMBER</p>
                        <p className="text-sm font-mono font-bold text-slate-900">{selectedContact.erpCodes.tin}</p>
                      </div>
                    )}
                    {selectedContact.erpCodes.vatRegistration && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 mb-1">VAT REGISTRATION</p>
                        <p className="text-sm font-mono font-bold text-slate-900">{selectedContact.erpCodes.vatRegistration}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Footer Actions */}
              <div className="pt-8 border-t border-slate-100 space-y-4">
                <button 
                  onClick={() => shareContact(selectedContact)}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-black transition-transform active:scale-[0.98]"
                >
                  <Share2 size={18} />
                  Share Contact Info
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  {selectedContact.verificationStatus} • Updated {new Date(selectedContact.lastVerified).toLocaleDateString('en-US')}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}