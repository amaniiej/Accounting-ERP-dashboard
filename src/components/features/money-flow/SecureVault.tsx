import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Unlock, FileText, Image as ImageIcon, Upload, 
  Download, Trash2, Eye, EyeOff, FolderLock, Shield, Key,
  Calendar, File, X, Check, AlertCircle
} from 'lucide-react';

interface VaultDocument {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'other';
  date: string;
  size?: string;
  isLocked: boolean;
  content?: string; // For demo purposes
}

interface SecureVaultProps {
  searchTerm?: string;
}

// Sample documents as per user request
const initialDocuments: VaultDocument[] = [
  { id: '1', name: 'Comm_Licence_2024.pdf', type: 'pdf', date: '2024-01-01', isLocked: true },
  { id: '2', name: 'Office_Lease.jpg', type: 'image', date: '2024-02-15', isLocked: true },
];

const SecureVault: React.FC<SecureVaultProps> = ({ searchTerm = '' }) => {
  const [documents, setDocuments] = useState<VaultDocument[]>(initialDocuments);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newFileDate, setNewFileDate] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<VaultDocument | null>(null);
  const [error, setError] = useState('');

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.date.includes(searchTerm)
  );

  const handleUnlock = () => {
    // Demo password: "admin" or "secure"
    if (password === 'admin' || password === 'secure' || password === '') {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Invalid password. Try "admin"');
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setPassword('');
  };

  const handleUpload = () => {
    if (newFile && newFileDate) {
      const newDoc: VaultDocument = {
        id: Date.now().toString(),
        name: newFile.name,
        type: newFile.type.includes('pdf') ? 'pdf' : newFile.type.includes('image') ? 'image' : 'other',
        date: newFileDate,
        isLocked: true,
        content: URL.createObjectURL(newFile)
      };
      setDocuments([...documents, newDoc]);
      setShowUploadModal(false);
      setNewFile(null);
      setNewFileDate('');
    }
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
    setSelectedDoc(null);
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!isUnlocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto mt-8"
      >
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Lock className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white">Secure Vault</h2>
            <p className="text-slate-300 text-sm mt-1">Your documents are encrypted</p>
          </div>

          {/* Lock Body */}
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-slate-100 rounded-full">
                <Shield className="w-12 h-12 text-slate-600" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  Enter Password to Unlock
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2 flex items-center gap-1"
                  >
                    <AlertCircle size={14} />
                    {error}
                  </motion.p>
                )}
              </div>

              <button
                onClick={handleUnlock}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Unlock size={18} />
                Unlock Vault
              </button>

              <p className="text-xs text-slate-400 text-center">
                Demo password: "admin" or "secure"
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
              <Key size={14} />
              <span>256-bit AES Encryption</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto mt-8"
    >
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              className="p-3 bg-emerald-100 rounded-xl"
            >
              <FolderLock className="w-8 h-8 text-emerald-600" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Secure Vault</h2>
              <p className="text-slate-500 text-sm">
                {documents.length} document{documents.length !== 1 ? 's' : ''} stored securely
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLock}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <Lock size={18} />
              Lock
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <Upload size={18} />
              Upload Document
            </button>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-2xl shadow-lg border p-4 cursor-pointer transition-all hover:shadow-xl ${
                selectedDoc?.id === doc.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200'
              }`}
              onClick={() => setSelectedDoc(doc)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${
                  doc.type === 'pdf' ? 'bg-red-100' : doc.type === 'image' ? 'bg-blue-100' : 'bg-slate-100'
                }`}>
                  {doc.type === 'pdf' ? (
                    <FileText className="w-6 h-6 text-red-600" />
                  ) : doc.type === 'image' ? (
                    <ImageIcon className="w-6 h-6 text-blue-600" />
                  ) : (
                    <File className="w-6 h-6 text-slate-600" />
                  )}
                </div>
                {doc.isLocked ? (
                  <Lock className="w-4 h-4 text-amber-500" />
                ) : (
                  <Unlock className="w-4 h-4 text-emerald-500" />
                )}
              </div>

              <h3 className="font-semibold text-slate-800 truncate" title={doc.name}>
                {doc.name}
              </h3>

              <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                <Calendar size={14} />
                <span>{doc.date}</span>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  doc.type === 'pdf' ? 'bg-red-50 text-red-600' : 
                  doc.type === 'image' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {doc.type.toUpperCase()}
                </span>
                <div className="flex items-center gap-2">
                  {doc.isLocked ? (
                    <Lock size={14} className="text-amber-500" />
                  ) : (
                    <Check size={14} className="text-emerald-500" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-3xl border border-slate-200"
        >
          <div className="p-4 bg-slate-100 rounded-full inline-block mb-4">
            <FolderLock className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-600">No documents found</h3>
          <p className="text-slate-400 text-sm mt-1">Upload your first document to get started</p>
        </motion.div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Upload Document</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Select File
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">
                        {newFile ? newFile.name : 'Click to select file'}
                      </p>
                      {newFile && (
                        <p className="text-xs text-slate-400 mt-1">
                          {formatSize(newFile.size)}
                        </p>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Document Date
                  </label>
                  <input
                    type="date"
                    value={newFileDate}
                    onChange={(e) => setNewFileDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!newFile || !newFileDate}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload size={18} />
                    Upload
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Detail Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDoc(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    selectedDoc.type === 'pdf' ? 'bg-red-100' : selectedDoc.type === 'image' ? 'bg-blue-100' : 'bg-slate-100'
                  }`}>
                    {selectedDoc.type === 'pdf' ? (
                      <FileText className="w-8 h-8 text-red-600" />
                    ) : selectedDoc.type === 'image' ? (
                      <ImageIcon className="w-8 h-8 text-blue-600" />
                    ) : (
                      <File className="w-8 h-8 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{selectedDoc.name}</h3>
                    <p className="text-sm text-slate-500">{selectedDoc.type.toUpperCase()} Document</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Document Date</p>
                    <p className="font-medium text-slate-700">{selectedDoc.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  {selectedDoc.isLocked ? (
                    <Lock className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Unlock className="w-5 h-5 text-emerald-500" />
                  )}
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Security Status</p>
                    <p className="font-medium text-slate-700">
                      {selectedDoc.isLocked ? 'Encrypted & Locked' : 'Unlocked'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                    <Download size={18} />
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(selectedDoc.id)}
                    className="flex-1 py-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SecureVault;
