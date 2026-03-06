import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, User, Phone, Sword, CheckCircle, ArrowLeft, AlertTriangle } from 'lucide-react';

interface JoinKSTeamFormProps {
  onBack: () => void;
}

export const JoinKSTeamForm: React.FC<JoinKSTeamFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    email: '',
    charName: '',
    vocation: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!formData.email || !formData.charName || !formData.vocation || !formData.phone) {
      setStatus({ type: 'error', message: 'Por favor, preencha todos os campos obrigatórios.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    try {
      if (!import.meta.env.VITE_JOIN_KS_TEAM_SCRIPT_URL) {
        throw new Error("A URL do Google Script de 'Inscrição Time KS' não está definida.");
      }

      await fetch(import.meta.env.VITE_JOIN_KS_TEAM_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      setIsSubmitted(true);
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Erro ao enviar inscrição. Tente novamente.' });
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
        <h2 className="text-3xl font-display font-black text-white mb-4 uppercase tracking-tighter">Inscrição Enviada</h2>
        <p className="text-gray-500 font-mono text-sm mb-12 uppercase tracking-widest">Sua solicitação para o time de KS foi recebida.</p>
        <button 
          onClick={onBack}
          className="neon-button neon-button-blue w-full"
        >
          Voltar para o Painel
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
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Voltar para o Ranking
      </button>

      <div className="flex items-center gap-4 mb-2">
        <Sword className="w-8 h-8 text-neon-purple" />
        <h2 className="text-3xl font-display font-black text-white uppercase tracking-tighter">Inscrição Time de KS</h2>
      </div>
      <p className="text-gray-500 font-mono text-xs mb-8 uppercase tracking-widest">Junte-se à elite da Missclick.</p>

      <div className="cyber-card p-8 cyber-border space-y-8">
        {status.message && (
          <div className={`p-4 rounded-xl text-xs font-mono border ${status.type === 'success' ? 'bg-neon-green/10 text-neon-green border-neon-green/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
            {status.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-display uppercase text-gray-500 tracking-widest">
              <Mail className="w-3 h-3" /> Email
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-display uppercase tracking-widest text-white outline-none focus:border-neon-purple transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-display uppercase text-gray-500 tracking-widest">
              <User className="w-3 h-3" /> Nome do Personagem
            </label>
            <input
              type="text"
              placeholder="Nome do char"
              value={formData.charName}
              onChange={(e) => setFormData({...formData, charName: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-display uppercase tracking-widest text-white outline-none focus:border-neon-purple transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-display uppercase text-gray-500 tracking-widest">
              <Sword className="w-3 h-3" /> Vocação
            </label>
            <select
              value={formData.vocation}
              onChange={(e) => setFormData({...formData, vocation: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-display uppercase tracking-widest text-white outline-none focus:border-neon-purple transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled className="bg-black">Selecionar Vocação</option>
              {['Elite Knight', 'Elder Druid', 'Master Sorcerer', 'Royal Paladin', 'Exalted Monk'].map(voc => (
                <option key={voc} value={voc} className="bg-black">{voc}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-display uppercase text-gray-500 tracking-widest">
              <Phone className="w-3 h-3" /> Telefone com DDD
            </label>
            <input
              type="text"
              placeholder="(XX) XXXXX-XXXX"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-display uppercase tracking-widest text-white outline-none focus:border-neon-purple transition-all"
            />
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
                Enviar Inscrição
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
