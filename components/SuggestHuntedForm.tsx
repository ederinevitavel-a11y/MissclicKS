import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, ArrowLeft, CheckCircle, User, Target, FileText, AlertTriangle } from 'lucide-react';
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
      if (!supabase) {
        throw new Error("Configuração pendente: As variáveis de ambiente do Supabase não foram configuradas.");
      }

      const printsData = await Promise.all(
        files.map(async (file, index) => {
          if (!file) return null;
          const fileExt = file.name.split('.').pop();
          const fileName = `hunted_prints/${Date.now()}_${Math.random()}.${fileExt}`;
          const { error } = await supabase.storage.from('hunted_prints').upload(fileName, file);

          if (error) {
            if (error.message === 'Bucket not found') {
              throw new Error('Configuração pendente: O bucket "hunted_prints" não foi encontrado no Supabase.');
            }
            throw error;
          }

          const { data: urlData } = supabase.storage.from('hunted_prints').getPublicUrl(fileName);
          return { name: printNames[index] || `Print ${index + 1}`, url: urlData.publicUrl };
        })
      );

      if (!import.meta.env.VITE_SUGGEST_HUNTED_SCRIPT_URL) {
        throw new Error("A URL do Google Script de 'Sugerir Hunted' não está definida.");
      }

      await fetch(import.meta.env.VITE_SUGGEST_HUNTED_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          charName: formData.charName,
          huntedName: formData.huntedName,
          reason: formData.reason,
          prints: printsData.filter(p => p !== null)
        }),
      });

      setIsSubmitted(true);
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Erro ao enviar sugestão. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto cyber-card p-12 text-center cyber-border"
      >
        <div className="w-20 h-20 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(10,255,10,0.3)]">
          <CheckCircle className="w-10 h-10 text-neon-green" />
        </div>
        <h2 className="text-3xl font-display font-black text-white mb-4 uppercase tracking-tighter">Envio Transmitido</h2>
        <p className="text-red-500 font-mono text-sm mb-12 uppercase tracking-widest">A sugestão está sob análise.</p>
        <button 
          onClick={onBackToIntelligence}
          className="neon-button neon-button-blue w-full"
        >
          Retornar para Inteligência
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-3xl mx-auto"
    >
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-neon-blue mb-8 transition-all group font-display text-[10px] uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Voltar para o Painel
      </button>

      <div className="flex items-center gap-4 mb-2">
        <AlertTriangle className="w-8 h-8 text-red-500" />
        <h2 className="text-3xl font-display font-black text-white uppercase tracking-tighter">Sugerir Alvo</h2>
      </div>
      <p className="text-gray-500 font-mono text-xs mb-8 uppercase tracking-widest">Envie detalhes e descrição da ocorrência.</p>

      <div className="cyber-card p-8 cyber-border space-y-8">
        {status.message && (
          <div className={`p-4 rounded-xl text-xs font-mono border ${status.type === 'success' ? 'bg-neon-green/10 text-neon-green border-neon-green/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
            {status.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-display uppercase text-gray-500 tracking-widest">
              <User className="w-3 h-3" /> ID do Relator
            </label>
            <input
              type="text"
              placeholder="Nome do seu personagem"
              value={formData.charName}
              onChange={(e) => setFormData({...formData, charName: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-display uppercase tracking-widest text-white outline-none focus:border-neon-blue transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-display uppercase text-gray-500 tracking-widest">
              <Target className="w-3 h-3" /> Designação do Alvo
            </label>
            <input
              type="text"
              placeholder="Nome do personagem alvo"
              value={formData.huntedName}
              onChange={(e) => setFormData({...formData, huntedName: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-display uppercase tracking-widest text-white outline-none focus:border-neon-blue transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-display uppercase text-gray-500 tracking-widest">
            <FileText className="w-3 h-3" /> Resumo do Motivo
          </label>
          <textarea
            placeholder="Descreva as ações hostis do alvo..."
            value={formData.reason}
            onChange={(e) => setFormData({...formData, reason: e.target.value})}
            rows={5}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-display uppercase tracking-widest text-white outline-none focus:border-neon-blue transition-all resize-none"
          />
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-[10px] font-display uppercase text-gray-500 tracking-widest">
            <Upload className="w-3 h-3" /> Evidência Visual (Máx 3)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((index) => (
              <div key={index} className="cyber-card p-4 bg-white/5 border-dashed border-white/10 hover:border-neon-purple transition-all group">
                <input 
                  type="text" 
                  placeholder={`ID da Imagem ${index + 1}`} 
                  value={printNames[index]}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-[10px] font-display uppercase tracking-widest text-white mb-3 outline-none focus:border-neon-purple"
                />
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(index, e)} className="hidden" id={`file-${index}`} />
                <label htmlFor={`file-${index}`} className="flex items-center justify-center gap-2 cursor-pointer py-2 bg-white/5 rounded-lg text-[10px] font-display uppercase text-neon-purple hover:bg-neon-purple hover:text-black transition-all">
                  <Upload className="w-3 h-3" />
                  {files[index] ? files[index]?.name : 'Enviar'}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="mt-6 px-6 py-2.5 bg-neon-purple/10 border border-neon-purple text-neon-purple font-display font-bold uppercase tracking-widest rounded-lg hover:bg-neon-purple hover:text-black hover:shadow-[0_0_20px_rgba(188,19,254,0.5)] transition-all duration-300 flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Enviando...</span>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Enviar Sugestão
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
