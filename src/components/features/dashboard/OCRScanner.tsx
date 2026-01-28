// src/components/features/dashboard/OCRScanner.tsx
import React, { useState, useRef } from 'react';
import { ScanLine, X, Camera, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { useLedger } from '../../../context/LedgerContext';

interface OCRScannerProps {
  onClose: () => void;
}

const OCRScanner: React.FC<OCRScannerProps> = ({ onClose }) => {
  const { setDocs } = useLedger();
  const [mode, setMode] = useState<'select' | 'camera' | 'upload'>('select');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addDocToVault = (file: File) => {
    const newDoc = {
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      date: new Date().toISOString().split('T')[0]
    };
    setDocs(prev => [...prev, newDoc]);
  };

  const startCamera = async () => {
    setMode('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied");
      setMode('select');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context?.drawImage(videoRef.current, 0, 0, 640, 480);
      setCapturedImage(canvasRef.current.toDataURL('image/png'));
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center">
      <div className="bg-white p-10 rounded-[32px] w-[600px] shadow-2xl flex flex-col gap-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-blue-900">
            <ScanLine size={32} className="text-blue-600"/> INTELLIGENT SCANNER
          </h2>
          <button onClick={onClose}><X size={32} className="text-slate-400"/></button>
        </div>

        {mode === 'select' && (
          <div className="flex gap-5 h-48">
            <button onClick={startCamera} className="flex-1 rounded-3xl border-3 border-dashed border-blue-400 bg-blue-50 flex flex-col items-center justify-center gap-3">
              <Camera size={50} /> <span className="font-bold">CAMERA SCAN</span>
            </button>
            <label className="flex-1 rounded-3xl border-3 border-dashed border-emerald-400 bg-emerald-50 flex flex-col items-center justify-center gap-3 cursor-pointer">
              <ImageIcon size={50} /> <span className="font-bold">UPLOAD FILE</span>
              <input type="file" hidden onChange={(e) => e.target.files && addDocToVault(e.target.files[0])} />
            </label>
          </div>
        )}

        {/* Camera and Capture UI logic goes here exactly like the original... */}
        {capturedImage && (
           <div className="text-center">
              <img src={capturedImage} className="rounded-2xl max-h-72 mx-auto" />
              <button onClick={() => {
                fetch(capturedImage).then(res => res.blob()).then(blob => {
                  addDocToVault(new File([blob], "capture.png"));
                  onClose();
                });
              }} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl">Save to Vault</button>
           </div>
        )}
      </div>
    </div>
  );
};

export default OCRScanner;