import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sheet, ArrowLeft, FileText } from 'lucide-react';

// Placeholder pour l'outil tableur
const SpreadsheetTool: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="animate-in fade-in duration-500">
    <button 
      onClick={onBack} 
      className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
    >
      <ArrowLeft size={16} /> Retour au menu
    </button>
    <div className="p-8 border rounded-2xl bg-white shadow-lg">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
        <FileText className="text-blue-500" />
        Outil Tableur
      </h2>
      <p className="text-slate-600 mt-2">Ceci est un placeholder pour l'outil tableur. La fonctionnalité complète sera implémentée ici.</p>
      <div className="mt-6 h-96 bg-slate-50 rounded-lg border flex items-center justify-center text-slate-400">
        Zone de contenu du tableur
      </div>
    </div>
  </div>
);

const ActivityCreation: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  if (activeTool === 'spreadsheet') {
    return <SpreadsheetTool onBack={() => setActiveTool(null)} />;
  }

  return (
    <div className="p-4">
      <h1 className="text-4xl font-black text-slate-800 mb-2">Project Creativity</h1>
      <p className="text-slate-500 mb-8">Sélectionnez un outil pour démarrer votre projet.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ y: -8, scale: 1.03 }}
          onClick={() => setActiveTool('spreadsheet')}
          className="p-6 rounded-3xl cursor-pointer bg-white/60 backdrop-blur-xl border border-white/30 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col items-center justify-center text-center transition-all duration-300 aspect-square"
        >
          <Sheet size={48} className="text-blue-500 mb-4" strokeWidth={1.5} />
          <h2 className="text-lg font-bold text-slate-800">Tableur Sheet</h2>
          <p className="text-xs text-slate-500 mt-1 px-4">Créez et gérez des feuilles de calcul pour vos projets.</p>
        </motion.div>
        {/* D'autres outils peuvent être ajoutés ici */}
      </div>
    </div>
  );
};

export default ActivityCreation;