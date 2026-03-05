import React, { useState } from 'react';
import { Upload, ArrowLeft } from 'lucide-react';
import { supabase } from '../services/supabase';

interface SuggestHuntedFormProps {
  onBack: () => void;
  onBackToIntelligence: () => void;
}

export const SuggestHuntedForm: React.FC<SuggestHuntedFormProps> = ({ onBack, onBackToIntelligence }) => {
  const [formData, setFormData] = useState({
    charName: '',
    huntedName: '',
    reason: ''
  });
  const [files, setFiles] = useState<(File | null)[]>([null, null, null]);
  const [printNames, setPrintNames] = useState<string[]>(['', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleSubmit = async () => {
    if (!formData.charName || !formData.huntedName || !formData.reason || files.every(f => !f)) {
      setStatus({ type: 'error', message: 'Por favor, preencha todos os campos obrigatórios e anexe pelo menos uma imagem.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    try {
      // 1. Upload das imagens para o Supabase Storage
      const printsData = await Promise.all(
        files.map(async (file, index) => {
          if (!file) return null;
          
          const fileExt = file.name.split('.').pop();
          const fileName = `hunted_prints/${Date.now()}_${Math.random()}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from('hunted_prints') // Certifique-se de criar este bucket no Supabase
            .upload(fileName, file);

          if (error) throw error;

          const { data: urlData } = supabase.storage
            .from('hunted_prints')
            .getPublicUrl(fileName);

          return { name: printNames[index] || `Print ${index + 1}`, url: urlData.publicUrl };
        })
      );

      // 2. Envio para o Google Sheets
      console.log("Enviando dados para o Google Sheets:", {
        url: import.meta.env.VITE_SUGGEST_HUNTED_SCRIPT_URL,
        charName: formData.charName,
        reason: formData.reason,
        prints: printsData.filter(p => p !== null)
      });

      if (!import.meta.env.VITE_SUGGEST_HUNTED_SCRIPT_URL) {
        throw new Error("A URL do Google Script de 'Sugerir Hunted' não está definida nas variáveis de ambiente.");
      }

      const response = await fetch(import.meta.env.VITE_SUGGEST_HUNTED_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Use no-cors
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          charName: formData.charName,
          huntedName: formData.huntedName,
          reason: formData.reason,
          prints: printsData.filter(p => p !== null)
        }),
      });

      // Com no-cors, não podemos ler response.ok ou response.json()
      // Então assumimos sucesso se não houver erro de rede
      setIsSubmitted(true);
      
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Erro ao enviar sugestão. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto p-6 animate-fade-in text-center">
        <div className="bg-black/60 border border-gray-800 rounded-2xl p-12 space-y-6">
          <div className="w-20 h-20 bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-3xl font-display font-black text-white">Sugestão Enviada!</h2>
          <p className="text-red-500">A sugestão de Hunted será avaliada e medidas serão tomadas que vão de aviso inicial até o Hunted.</p>
          <button 
            onClick={onBackToIntelligence}
            className="w-full py-4 bg-transparent border border-neon-blue text-neon-blue font-display font-black uppercase tracking-[0.2em] rounded-full hover:bg-neon-blue hover:text-black transition-all"
          >
            Voltar para Intelligence
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <h2 className="text-3xl font-display font-black text-white mb-2">Sugerir Hunted</h2>
      <p className="text-gray-400 mb-8">Envie sua sugestão de hunted para análise da guild. Preencha o formulário e anexe pelo menos uma imagem como prova.</p>

      <div className="bg-black/60 border border-gray-800 rounded-2xl p-6 space-y-6">
        {status.message && (
          <div className={`p-4 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-900/30' : 'bg-red-900/20 text-red-400 border border-red-900/30'}`}>
            {status.message}
          </div>
        )}
        <div>
          <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Nome do personagem *</label>
          <input
            type="text"
            placeholder="Ex: Dark Torturer"
            value={formData.charName}
            onChange={(e) => setFormData({...formData, charName: e.target.value})}
            className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-neon-blue"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Hunted Sugerido *</label>
          <input
            type="text"
            placeholder="Ex: Hunted de Ferumbras"
            value={formData.huntedName}
            onChange={(e) => setFormData({...formData, huntedName: e.target.value})}
            className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-neon-blue"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Motivo da solicitação *</label>
          <textarea
            placeholder="Descreva o motivo da sugestão de hunted..."
            value={formData.reason}
            onChange={(e) => setFormData({...formData, reason: e.target.value})}
            rows={5}
            className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-neon-blue resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">Imagens de prova * (mínimo 1, máx 3 - JPG/PNG 5MB)</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((index) => (
              <div key={index} className="border border-dashed border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center bg-black/40 hover:border-neon-blue transition-colors">
                <Upload className="w-6 h-6 text-gray-600 mb-2" />
                <input 
                  type="text" 
                  placeholder={`Nome da Print ${index + 1}`} 
                  value={printNames[index]}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  className="w-full bg-black/60 border border-gray-800 rounded px-2 py-1 text-[10px] text-white mb-2 outline-none focus:border-neon-blue"
                />
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(index, e)} className="hidden" id={`file-${index}`} />
                <label htmlFor={`file-${index}`} className="cursor-pointer text-[10px] text-gray-500 hover:text-neon-blue">
                  {files[index] ? files[index]?.name : `Imagem ${index + 1}`}
                </label>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-neon-blue via-white to-neon-purple text-black font-display font-black uppercase tracking-[0.2em] rounded-full shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'ENVIANDO...' : 'Enviar sua sugestão para análise'}
        </button>
      </div>
    </div>
  );
};
