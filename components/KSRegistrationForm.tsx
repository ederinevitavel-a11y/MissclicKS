
import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabase';

interface KSRegistrationFormProps {
  onSuccess?: () => void;
  overviewData?: any;
}

export const KSRegistrationForm: React.FC<KSRegistrationFormProps> = ({ onSuccess, overviewData }) => {
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

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Leader': return '#FFD700';
      case 'Challenger': return '#FF0000';
      case 'Guardian': return '#A020F0';
      case 'Loyal': return '#00FF00';
      case 'Member': return '#FFFFFF';
      case 'Begginer': return '#0000FF';
      case 'Prata': return '#CD7F32';
      default: return 'inherit';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.some(f => !f) || printNames.some(n => !n.trim())) {
      setStatus({ type: 'error', message: 'Por favor, anexe e nomeie as prints.' });
      return;
    }
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    try {
      // 1. Upload das imagens
      const printsData = await Promise.all(
        files.map(async (file, index) => {
          if (!file) return null;
          const fileExt = file.name.split('.').pop();
          const fileName = `ks_proofs/${Date.now()}_${Math.random()}.${fileExt}`;
          const { error } = await supabase.storage.from('ks_proofs').upload(fileName, file);
          
          if (error) {
            if (error.message === 'Bucket not found') {
              throw new Error('Configuração pendente: O bucket "ks_proofs" não foi encontrado no Supabase. Crie-o no dashboard.');
            }
            throw error;
          }
          
          const { data: urlData } = supabase.storage.from('ks_proofs').getPublicUrl(fileName);
          return { name: printNames[index], url: urlData.publicUrl };
        })
      );

      // 2. Envio para o Google Sheets
      const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
      if (!scriptUrl) throw new Error('URL do Script não definida');
      
      console.log('URL DO SCRIPT CARREGADA:', scriptUrl);

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => formDataToSend.append(key, value));
      
      // Preenchendo colunas N e O com os links das prints
      formDataToSend.append('print1', printsData[0]?.url || '');
      formDataToSend.append('print2', printsData[1]?.url || '');
      
      formDataToSend.append('timestamp', new Date().toLocaleString('pt-BR'));
      formDataToSend.append('sheetName', 'Respostas ao formulário 2');

      console.log('Enviando para:', scriptUrl);
      console.log('Dados:', Object.fromEntries(formDataToSend.entries()));

      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: formDataToSend,
      });

      setStatus({ type: 'success', message: 'Registro e prints enviados com sucesso!' });
      setShowConfirmation(true);
      setIsSubmitting(false);
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Erro ao enviar. Tente novamente.' });
      setIsSubmitting(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="max-w-sm mx-auto bg-black/90 border border-gray-800 border-l-4 border-l-green-500 rounded-xl p-6 shadow-2xl text-center relative overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-green-500/5 blur-3xl -z-10"></div>
        
        <div className="flex justify-center mb-4">
          <div className="p-2 bg-green-500/10 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <h3 className="text-lg font-display font-black text-white mb-1 tracking-tight">REGISTRO CONFIRMADO!</h3>
        <p className="text-gray-400 mb-6 font-mono text-xs">Seu KS foi registrado com sucesso.</p>
        
        <button
          onClick={() => {
            setShowConfirmation(false);
            setFormData({ email: '', charName: '', rank: '', huntedName: '', respawn: '', idCode: '' });
            setFiles([null, null]);
            setPrintNames(['', '']);
            setStatus({ type: null, message: '' });
          }}
          className="w-full py-3 font-display font-black uppercase tracking-[0.2em] transition-all relative group overflow-hidden bg-transparent text-green-500 border-2 border-green-500 hover:text-black"
          style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}
        >
          <div className="absolute inset-0 bg-green-500 transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 -z-10"></div>
          <span className="relative z-10 text-sm">REGISTRAR OUTRO KS</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-neon-surface/50 border border-gray-800 rounded-xl p-6 shadow-2xl">
      <h3 className="text-xl font-display font-black text-red-500 mb-6 flex items-center gap-2">
        <span className="w-2 h-6 bg-red-600 rounded-full"></span>
        REGISTRO DE KS
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Endereço de e-mail</label>
          <input
            required
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-2 text-sm focus:border-neon-blue outline-none transition-all text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Nome do Char</label>
            <input
              required
              type="text"
              name="charName"
              value={formData.charName}
              onChange={handleChange}
              placeholder="Seu personagem"
              className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-2 text-sm focus:border-neon-blue outline-none transition-all text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Qual é o seu Rank ?</label>
            <select
              required
              name="rank"
              value={formData.rank}
              onChange={handleChange}
              className="w-full bg-black/80 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-neon-blue outline-none transition-all text-white"
              style={{ color: getRankColor(formData.rank) }}
            >
              <option value="" disabled className="text-gray-400">Selecione seu rank</option>
              <option value="Leader" className="bg-black text-[#FFD700]">Leader</option>
              <option value="Challenger" className="bg-black text-[#FF0000]">Challenger</option>
              <option value="Guardian" className="bg-black text-[#A020F0]">Guardian</option>
              <option value="Loyal" className="bg-black text-[#00FF00]">Loyal</option>
              <option value="Member" className="bg-black text-[#FFFFFF]">Member</option>
              <option value="Begginer" className="bg-black text-[#0000FF]">Begginer</option>
              <option value="Prata" className="bg-black text-[#CD7F32]">Prata</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Qual é o Hunted que você deu KS ?</label>
          <input
            required
            type="text"
            name="huntedName"
            list="hunted-suggestions"
            value={formData.huntedName}
            onChange={handleChange}
            placeholder="Selecione ou digite o nome do Hunted"
            className="w-full bg-black/80 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-neon-blue outline-none transition-all text-white"
          />
          <datalist id="hunted-suggestions">
            {huntedSuggestions.map(hunted => (
              <option key={hunted} value={hunted} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Em qual Respawn você deu KS ?</label>
          <select
            required
            name="respawn"
            value={formData.respawn}
            onChange={handleChange}
            className="w-full bg-black/80 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-neon-blue outline-none transition-all text-white"
          >
            <option value="" disabled className="text-gray-400">Selecione o Respawn</option>
            {[
              "Asura Espelho", "Catedral", "Caminho Ferumbras", "Carnivors", "Cobra Castelo",
              "Crypt Warden", "DT -2", "Elfo de Fogo", "Elfo de Gelo", "Goannas",
              "Gold Token", "Livraria de Fogo", "Livraria de Gelo", "Livraria de Energia",
              "Livraria de Terra", "Lost Souls", "Lower Roshamuul", "Upper Roshamull",
              "Nagas", "Nightmare Isles", "POI", "Plague Seal", "Prision",
              "Seacrest", "True Asura", "Warzones", "Werelions", "Werehyena",
              "West", "WereTigers"
            ].map(respawn => (
              <option key={respawn} value={respawn} className="bg-black text-white">{respawn}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-mono text-gray-500 mb-1">Qual é o seu código de identificação ?</label>
          <input
            required
            type="text"
            name="idCode"
            value={formData.idCode}
            onChange={handleChange}
            placeholder="Código MJR"
            className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-2 text-sm focus:border-neon-blue outline-none transition-all text-white"
          />
        </div>

        {status.message && (
          <div className={`p-3 rounded-lg text-xs font-mono ${status.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
            {status.message}
          </div>
        )}

        {/* Nova seção de Upload */}
        <div className="pt-4 border-t border-gray-800">
          <label className="block text-[10px] uppercase font-mono text-gray-500 mb-2">Comprovantes (Prints)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 md:py-4 font-display font-black uppercase tracking-[0.2em] transition-all relative group overflow-hidden
            ${isSubmitting 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
              : 'bg-transparent text-neon-blue border-2 border-neon-blue hover:text-black'}`}
          style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}
        >
          {!isSubmitting && (
            <div className="absolute inset-0 bg-neon-blue transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 -z-10"></div>
          )}
          <span className="relative z-10">
            {isSubmitting ? 'PROCESSANDO...' : 'CONFIRMAR REGISTRO'}
          </span>
        </button>
      </form>
    </div>
  );
};
