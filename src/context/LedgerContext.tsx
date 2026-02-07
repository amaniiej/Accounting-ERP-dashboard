import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CompanyProfile } from '../types';

// Only Global Auth/Profile Data lives here now
interface AuthContextType {
  profile: CompanyProfile;
  setProfile: React.Dispatch<React.SetStateAction<CompanyProfile>>;
  isAuthenticated: boolean; // Simple mock for now
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialProfile: CompanyProfile = {
  name: 'Abyssinia CyberSec PLC',
  address: 'Addis Ababa, Bole Sub-city, Woreda 03',
  tin: '0045992188',
  phone: '+251 911 234 567'
};

export const LedgerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<CompanyProfile>(initialProfile);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Default to false to show Login first

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider value={{ profile, setProfile, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a LedgerProvider');
  }
  return context;
};

// Backward compatibility alias
export const useLedger = useAuth;