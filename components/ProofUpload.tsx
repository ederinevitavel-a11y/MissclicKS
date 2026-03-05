import React, { useState } from 'react';
import { Upload, CheckCircle } from 'lucide-react';

interface ProofUploadProps {
  onComplete?: () => void;
}

export const ProofUpload: React.FC<ProofUploadProps> = ({ onComplete }) => {
  const [files, setFiles] = useState<(File | null)[]>([null, null]);
  const [printNames, setPrintNames] = useState<string[]>(['', '']);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = [...files];
      newFiles[index] = e.target.files[0];
      setFiles(newFiles);
    }
  };

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...printNames];
    newNames[index] = value;
    setPrintNames(newNames);
  };

  const handleUpload = async () => {
    if (files.some(f => !f) || printNames.some(n => !n.trim())) return;
    setIsUploading(true);
    // Simulating upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsUploading(false);
    setSuccess(true);
    setTimeout(() => {
        if (onComplete) onComplete();
    }, 2000);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-neon-surface/50 border border-gray-800 rounded-xl shadow-2xl text-center">
        <CheckCircle className="w-16 h-16 text-neon-green mb-4" />
        <h3 className="text-xl font-display font-black text-white mb-2">Prints Enviadas!</h3>
        <p className="text-gray-400 text-sm">Obrigado por comprovar o KS.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-neon-surface/50 border border-gray-800 rounded-xl p-6 shadow-2xl">
      <h3 className="text-xl font-display font-black text-white mb-6 flex items-center gap-2">
        <span className="w-2 h-6 bg-neon-purple rounded-full"></span>
        ENVIAR COMPROVANTE (PRINTS)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[0, 1].map((index) => (
          <div key={index} className="border-2 border-dashed border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center bg-black/40 hover:border-neon-purple transition-colors">
            <Upload className="w-8 h-8 text-gray-500 mb-2" />
            <input 
              type="text" 
              placeholder={`Nome da Print ${index + 1}`} 
              value={printNames[index]}
              onChange={(e) => handleNameChange(index, e.target.value)}
              className="w-full bg-black/60 border border-gray-800 rounded px-2 py-1 text-xs text-white mb-2 outline-none focus:border-neon-blue"
            />
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(index, e)} className="hidden" id={`file-${index}`} />
            <label htmlFor={`file-${index}`} className="cursor-pointer text-xs text-neon-blue hover:underline">
              {files[index] ? files[index]?.name : 'Selecionar imagem'}
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={handleUpload}
        disabled={isUploading || files.some(f => !f)}
        className="w-full py-4 bg-neon-purple text-white font-display font-black uppercase tracking-[0.2em] rounded-lg hover:bg-neon-purple/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? 'ENVIANDO...' : 'ENVIAR PRINTS'}
      </button>
    </div>
  );
};
