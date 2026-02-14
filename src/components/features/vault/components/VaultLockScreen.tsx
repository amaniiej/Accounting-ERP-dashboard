import React from 'react';
import { Lock, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  pin: string;
  setPin: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string;
}

export const VaultLockScreen: React.FC<Props> = ({ pin, setPin, onSubmit, error }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
      >
        <div className="bg-slate-900 p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
            <Lock className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Encrypted Vault</h2>
          <p className="text-slate-400 text-sm mt-2">Enter your 4-digit security PIN to access sensitive documents.</p>
        </div>

        <div className="p-8">
          <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <div>
              <input
                type="password"
                maxLength={4}
                autoFocus
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full text-center text-4xl font-mono tracking-[0.5em] py-4 border-b-2 border-slate-200 focus:border-blue-600 outline-none transition-all text-slate-800"
                placeholder="••••"
              />
              {error && (
                <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-center gap-2 mt-4 text-red-500 text-sm font-bold">
                  <ShieldAlert size={16} /> {error}
                </motion.div>
              )}
            </div>
            
            <button 
              disabled={pin.length < 4}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
            >
              UNLOCK REPOSITORY
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};