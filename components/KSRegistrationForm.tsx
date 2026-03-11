import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Upload, CheckCircle, Shield, Mail, User, Target, MapPin, Key } from 'lucide-react';
import { supabase } from '../services/supabase';

interface KSRegistrationFormProps {
  onSuccess?: () => void;
  overviewData?: any;
  onBack?: () => void;
}

export const KSRegistrationForm: React.FC<KSRegistrationFormProps> = ({ onSuccess, overviewData, onBack }) => {
  const [formData, setFormData] = useState({
    email: '',
    charName: '',
    rank: '',
    huntedName: '',
    respawn: '',
    idCode: ''
  });
  const [files, setFiles] = useState<(File | null)[]>([null, null]);
  const [printNames, setPrintNames] = useState<string[]>(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  const [huntedSuggestions, setHuntedSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (overviewData?.huntedIntel?.targets) {
      setHuntedSuggestions(overviewData.huntedIntel.targets.map((t: any) => t.name));
    }
  }, [overviewData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.some(f => !f) || printNames.some(n => !n.trim())) {
      setStatus({ type: 'error', message: 'Por favor, anexe e nomeie as screenshots.' });
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
          const fileName = `ks_proofs/${Date.now()}_${Math.random()}.${fileExt}`;
          const { error } = await supabase.storage.from('ks_proofs').upload(fileName, file);
          
          if (error) {
            if (error.message === 'Bucket not found') {
              throw new Error('Configuração pendente: O bucket "ks_proofs" não foi encontrado no Supabase.');
            }
            throw error;
          }
          
          const { data: urlData } = supabase.storage.from('ks_proofs').getPublicUrl(fileName);
          return { name: printNames[index], url: urlData.publicUrl };
        })
      );

      const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
      if (!scriptUrl) throw new Error('URL do Script não definida');
      
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => formDataToSend.append(key, value as string));
      formDataToSend.append('print1', printsData[0]?.url || '');
      formDataToSend.append('print2', printsData[1]?.url || '');
      formDataToSend.append('timestamp', new Date().toLocaleString('pt-BR'));
      formDataToSend.append('sheetName', 'Respostas ao formulário 2');

      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: formDataToSend,
      });

      setStatus({ type: 'success', message: 'Entrada e screenshots enviadas com sucesso!' });
      setShowConfirmation(true);
      setIsSubmitting(false);
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Erro ao enviar. Tente novamente.' });
      setIsSubmitting(false);
    }
  };

  if (showConfirmation) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm mx-auto cyber-card p-8 text-center cyber-border"
      >
        <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(10,255,10,0.3)]">
          <CheckCircle className="w-8 h-8 text-neon-green" />
        </div>
        <h3 className="text-xl font-display font-black text-white mb-2 uppercase tracking-tighter">Registro Realizado</h3>
        <p className="text-gray-500 text-xs font-mono mb-8 uppercase tracking-widest">KS sujeito a avaliação da Liderança do KS</p>
        
        <button
          onClick={() => {
            setShowConfirmation(false);
            setFormData({ email: '', charName: '', rank: '', huntedName: '', respawn: '', idCode: '' });
            setFiles([null, null]);
            setPrintNames(['', '']);
            setStatus({ type: null, message: '' });
          }}
          className="neon-button neon-button-blue w-full"
        >
          Nova Entrada
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-display uppercase tracking-widest text-gray-500 hover:text-white transition-colors mb-4"
        >
          <span className="text-neon-blue">←</span> Voltar para o Painel
        </button>
      )}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-8 cyber-border"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-neon-blue rounded-full" />
          <h3 className="text-xl font-display font-black text-white uppercase tracking-tighter">Registro de KS</h3>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup 
            icon={<Mail className="w-4 h-4" />}
            label="Endereço de Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="operador@sistema.com"
          />
          <InputGroup 
            icon={<User className="w-4 h-4" />}
            label="Nome do Personagem"
            name="charName"
            value={formData.charName}
            onChange={handleChange}
            placeholder="Digite o nome do combatente"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-display uppercase text-gray-500 tracking-widest">
              <Shield className="w-3 h-3" /> Rank
            </label>
            <select
              required
              name="rank"
              value={formData.rank}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-display uppercase tracking-widest text-white outline-none focus:border-neon-blue transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled className="bg-neon-dark">Selecionar Rank</option>
              {['Leader', 'Challenger', 'Guardian', 'Loyal', 'Member', 'Begginer', 'Newcommer'].map(rank => (
                <option key={rank} value={rank} className="bg-neon-dark">{rank}</option>
              ))}
            </select>
          </div>
          <InputGroup 
            icon={<Target className="w-4 h-4" />}
            label="Nome do Alvo"
            name="huntedName"
            value={formData.huntedName}
            onChange={handleChange}
            placeholder="Identificar alvo"
            list="hunted-suggestions"
          />
          <datalist id="hunted-suggestions">
            {huntedSuggestions.map(hunted => <option key={hunted} value={hunted} />)}
          </datalist>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-display uppercase text-gray-500 tracking-widest">
              <MapPin className="w-3 h-3" /> Respawn
            </label>
            <select
              required
              name="respawn"
              value={formData.respawn}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-display uppercase tracking-widest text-white outline-none focus:border-neon-blue transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled className="bg-neon-dark">Selecionar Respawn</option>
              {[
                "Asura Espelho", "Catedral", "Caminho Ferumbras", "Carnivors", "Cobra Castelo",
                "Crypt Warden", "Deathling", "DT -2", "Elfo de Fogo", "Elfo de Gelo", "Goannas",
                "Gold Token", "Livraria de Fogo", "Livraria de Gelo", "Livraria de Energia",
                "Livraria de Terra", "Lost Souls", "Lower Roshamuul", "Upper Roshamull",
                "Nagas", "Nightmare Isles", "POI", "Plague Seal", "Prision",
                "Seacrest", "Sphinx", "True Asura", "Warzones", "Werelions", "Werehyena",
                "West", "WereTigers"
              ].map(respawn => (
                <option key={respawn} value={respawn} className="bg-neon-dark">{respawn}</option>
              ))}
            </select>
          </div>
          <InputGroup 
            icon={<Key className="w-4 h-4" />}
            label="Código de Acesso"
            name="idCode"
            value={formData.idCode}
            onChange={handleChange}
            placeholder="MJR-XXXX"
          />
        </div>

        {status.message && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`p-4 rounded-xl text-xs font-mono border ${status.type === 'success' ? 'bg-neon-green/10 text-neon-green border-neon-green/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}
          >
            {status.message}
          </motion.div>
        )}

        <div className="space-y-4 pt-4 border-t border-white/5">
          <p className="text-[10px] font-display uppercase text-gray-500 tracking-widest flex items-center gap-2">
            <Upload className="w-3 h-3" /> Evidência Visual (Screenshots)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1].map((index) => (
              <div key={index} className="cyber-card p-4 bg-white/5 border-dashed border-white/10 hover:border-neon-blue transition-all group">
                <input 
                  type="text" 
                  placeholder={`ID da Imagem ${index + 1}`} 
                  value={printNames[index]}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-[10px] font-display uppercase tracking-widest text-white mb-3 outline-none focus:border-neon-blue"
                />
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(index, e)} className="hidden" id={`file-${index}`} />
                <label htmlFor={`file-${index}`} className="flex items-center justify-center gap-2 cursor-pointer py-2 bg-white/5 rounded-lg text-[10px] font-display uppercase text-neon-blue hover:bg-neon-blue hover:text-black transition-all">
                  <Upload className="w-3 h-3" />
                  {files[index] ? files[index]?.name : 'Enviar'}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 px-4 py-2 bg-neon-blue/10 border border-neon-blue text-neon-blue font-display font-bold uppercase tracking-widest rounded-lg hover:bg-neon-blue hover:text-black hover:shadow-[0_0_20px_rgba(0,243,255,0.5)] transition-all duration-300 flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Processando...</span>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Confirmar KS
              </>
            )}
          </button>
        </div>
      </form>
      </motion.div>
    </div>
  );
};

const InputGroup: React.FC<{ icon: React.ReactNode; label: string; name: string; value: string; onChange: any; placeholder: string; type?: string; list?: string }> = ({ icon, label, name, value, onChange, placeholder, type = 'text', list }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-[10px] font-display uppercase text-gray-500 tracking-widest">
      {icon} {label}
    </label>
    <input
      required
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      list={list}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-display uppercase tracking-widest text-white outline-none focus:border-neon-blue transition-all placeholder:text-gray-700"
    />
  </div>
);
