import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Upload, CheckCircle, Shield, Mail, User, Target, MapPin, Key, Clock, ShieldAlert, LogIn, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { insertKSEntryIntoSupabase, fetchBlackListFromSupabase } from '../services/supabaseService';
import { fetchAllowedEmailsFromCSV } from '../services/csvService';

interface KSRegistrationFormProps {
  onSuccess?: () => void;
  overviewData?: any;
  rawData?: any[];
  onBack?: () => void;
}

export const KSRegistrationForm: React.FC<KSRegistrationFormProps> = ({ onSuccess, overviewData, rawData, onBack }) => {
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

  // Authorized Emails states
  const [allowedEmails, setAllowedEmails] = useState<string[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(true);

  // Anti-Spam Rate Limiting States
  const [cooldown, setCooldown] = useState({ active: false, seconds: 0, hourly: false });
  const [blacklist, setBlacklist] = useState<string[]>([]);
  
  // Math Captcha (Anti-Bot) State
  const [mathCaptcha, setMathCaptcha] = useState({ num1: 0, num2: 0, answer: 0, userAnswer: '' });

  const generateMathCaptcha = () => {
    const num1 = Math.floor(Math.random() * 9) + 3; // 3 to 11
    const num2 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    setMathCaptcha({
      num1,
      num2,
      answer: num1 + num2,
      userAnswer: ''
    });
  };

  const checkCooldown = () => {
    try {
      const historyStr = localStorage.getItem('ks_submission_history');
      if (!historyStr) return { restricted: false, timeLeft: 0, hourlyRestricted: false };
      
      const history: number[] = JSON.parse(historyStr);
      const now = Date.now();
      
      // Cooldown de 3 minutos entre registros consecutivos
      if (history.length > 0) {
        const lastSubmission = history[history.length - 1];
        const diff = now - lastSubmission;
        const cooldownMs = 3 * 60 * 1000; 
        if (diff < cooldownMs) {
          return { 
            restricted: true, 
            timeLeft: Math.ceil((cooldownMs - diff) / 1000),
            hourlyRestricted: false 
          };
        }
      }
      
      // Bloqueio por excesso de registros: Limite de 5 envios por hora
      const oneHourAgo = now - 60 * 60 * 1000;
      const recentSubmissions = history.filter(ts => ts > oneHourAgo);
      
      if (recentSubmissions.length >= 5) {
        const earliestRecent = recentSubmissions[0];
        const timeToWait = (earliestRecent + 60 * 60 * 1000) - now;
        return {
          restricted: true,
          timeLeft: Math.ceil(timeToWait / 1000),
          hourlyRestricted: true
        };
      }
    } catch (err) {
      console.error('Erro ao processar histórico de envios:', err);
    }
    return { restricted: false, timeLeft: 0, hourlyRestricted: false };
  };

  const formatTimeLeft = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  // Carregar Blacklist, gerar Captcha e sincronizar com e-mails da planilha
  useEffect(() => {
    generateMathCaptcha();

    const loadBlacklist = async () => {
      try {
        const list = await fetchBlackListFromSupabase();
        setBlacklist(list.map((name: string) => name.trim().toLowerCase()));
      } catch (err) {
        console.warn("Falha ao carregar blacklist para validação:", err);
      }
    };
    loadBlacklist();

    const loadAllowedEmails = async () => {
      setLoadingEmails(true);
      try {
        const emails = await fetchAllowedEmailsFromCSV();
        const formattedEmails = emails.map((e: string) => e.trim().toLowerCase());
        if (!formattedEmails.includes('ederinevitavel@gmail.com')) {
          formattedEmails.push('ederinevitavel@gmail.com');
        }
        setAllowedEmails(formattedEmails);
      } catch (err) {
        console.error("Falha ao carregar e-mails autorizados:", err);
        setAllowedEmails(['ederinevitavel@gmail.com']);
      } finally {
        setLoadingEmails(false);
      }
    };
    loadAllowedEmails();
  }, []);

  // Monitoramento do Cooldown em tempo real
  useEffect(() => {
    const check = () => {
      const res = checkCooldown();
      if (res.restricted) {
        setCooldown({ active: true, seconds: res.timeLeft, hourly: res.hourlyRestricted });
      } else {
        setCooldown({ active: false, seconds: 0, hourly: false });
      }
    };
    
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, []);

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

    // 0. Verificação de Autenticação e e-mail permitido
    // 0. Validar se o e-mail inserido está na lista de e-mails autorizados
    const emailLower = formData.email.trim().toLowerCase();
    if (!emailLower || !emailLower.includes('@')) {
      setStatus({ type: 'error', message: 'Acesso negado: Por favor, insira um endereço de e-mail válido.' });
      return;
    }

    const isEmailAuthorized = allowedEmails.some(e => e.trim().toLowerCase() === emailLower);
    if (!isEmailAuthorized) {
      setStatus({ 
        type: 'error', 
        message: `Acesso negado: O e-mail "${emailLower}" não possui permissão para registrar KS no sistema.` 
      });
      return;
    }

    // 1. Verificações básicas de sanidade
    if (files.some(f => !f) || printNames.some(n => !n.trim())) {
      setStatus({ type: 'error', message: 'Por favor, anexe e nomeie as screenshots.' });
      return;
    }

    const charLower = formData.charName.trim().toLowerCase();
    const huntedLower = formData.huntedName.trim().toLowerCase();

    if (charLower.length < 3 || huntedLower.length < 3) {
      setStatus({ type: 'error', message: 'O nome do personagem e do alvo devem ter pelo menos 3 caracteres.' });
      return;
    }

    if (charLower === huntedLower) {
      setStatus({ type: 'error', message: 'Ataque inválido: O personagem do KS não pode ser o mesmo do Alvo.' });
      return;
    }

    // 2. Verificação contra Cooldown ativo
    const cooldownCheck = checkCooldown();
    if (cooldownCheck.restricted) {
      setStatus({ 
        type: 'error', 
        message: cooldownCheck.hourlyRestricted 
          ? `Limite de segurança atingido: máximo de 5 registros por hora. Aguarde para poder registrar novamente.` 
          : `Bloqueio anti-spam ativo: aguarde 3 minutos entre registros consecutivos.` 
      });
      return;
    }

    // 3. Verificação do Math Captcha
    if (parseInt(mathCaptcha.userAnswer.trim()) !== mathCaptcha.answer) {
      setStatus({ type: 'error', message: 'Erro: Verificação matemática Anti-Bot incorreta! Resolva o cálculo indicado.' });
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

      const validPrints = printsData.filter((p): p is { name: string; url: string } => p !== null);

      // Save directly to Supabase Table (Primary Database)
      await insertKSEntryIntoSupabase({
        ...formData,
        prints: validPrints
      });

      // Optional redundant backup copy to Google Sheet
      const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
      if (scriptUrl) {
        try {
          const formDataToSend = new FormData();
          Object.entries(formData).forEach(([key, value]) => formDataToSend.append(key, value as string));
          formDataToSend.append('print1', validPrints[0]?.url || '');
          formDataToSend.append('print2', validPrints[1]?.url || '');
          formDataToSend.append('timestamp', new Date().toLocaleString('pt-BR'));
          formDataToSend.append('sheetName', 'Respostas ao formulário 2');

          await fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: formDataToSend,
          });
        } catch (sheetErr) {
          console.warn("Falha ao salvar cópia de backup na planilha:", sheetErr);
        }
      }

      // Adiciona o envio atual ao histórico de localStorage do usuário
      try {
        const historyStr = localStorage.getItem('ks_submission_history');
        const history: number[] = historyStr ? JSON.parse(historyStr) : [];
        history.push(Date.now());
        localStorage.setItem('ks_submission_history', JSON.stringify(history));
      } catch (storeErr) {
        console.warn("Não foi possível salvar o histórico do dispositivo:", storeErr);
      }

      setStatus({ type: 'success', message: 'Entrada registrada com sucesso no banco de dados Supabase!' });
      setShowConfirmation(true);
      setIsSubmitting(false);
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Erro ao enviar. Tente novamente.' });
      setIsSubmitting(false);
      generateMathCaptcha(); // regenera o captcha em caso de erro
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
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-neon-blue rounded-full" />
          <h3 className="text-xl font-display font-black text-white uppercase tracking-tighter">Registro de KS</h3>
        </div>



      {cooldown.active && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-red-500/10 border border-red-500/30 rounded-xl space-y-2 mb-6"
        >
          <div className="flex items-center gap-2 text-red-400 font-display text-xs uppercase tracking-wider font-bold">
            <Clock className="w-4 h-4 animate-pulse" /> Bloqueio de Segurança Ativo
          </div>
          <p className="text-gray-400 text-xs font-mono leading-relaxed">
            {cooldown.hourly 
              ? "Você atingiu o limite de segurança de 5 registros de KS por hora neste dispositivo. Essa medida preventiva foi ativada para evitar disparos indevidos e abuso intencional do sistema." 
              : "Para evitar envios duplicados e disparos excessivos, há um cooldown obrigatório de 3 minutos entre registros consecutivos de KS."}
          </p>
          <div className="text-[11px] font-mono text-neon-red uppercase tracking-widest pt-1">
            Aguarde: <span className="font-bold font-sans text-xs text-white">{formatTimeLeft(cooldown.seconds)}</span> para poder registrar novamente.
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup 
            icon={<Mail className="w-4 h-4" />}
            label="Endereço de Email (Autorizado)"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="operador@sistema.com"
            disabled={cooldown.active}
          />
          <InputGroup 
            icon={<User className="w-4 h-4" />}
            label="Nome do Personagem"
            name="charName"
            value={formData.charName}
            onChange={handleChange}
            placeholder="Digite o nome do combatente"
            disabled={cooldown.active}
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
              disabled={cooldown.active}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-display uppercase tracking-widest text-white outline-none focus:border-neon-blue transition-all appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
            disabled={cooldown.active}
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
              disabled={cooldown.active}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-display uppercase tracking-widest text-white outline-none focus:border-neon-blue transition-all appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="" disabled className="bg-neon-dark">Selecionar Respawn</option>
              {[
                "Asura Espelho", "Bashmu", "Bulltar", "Burning Gladiator", "Caminho Ferumbras", "Carnivors", "Catedral", "Cobra Castelo",
                "Crypt Warden", "Cults", "Deathling", "DT -2", "Elfo de Fogo", "Elfo de Gelo", "Falcon", "Fury Oramond", "Girtabilu", "Glooth Bandit",
                "Goannas", "Gold Token", "Ingol", "Livraria 4", "Livraria de Energia", "Livraria de Fogo", "Livraria de Gelo",
                "Livraria de Terra", "Livraria Nova", "Lost Souls", "Lower Roshamuul", "Medusa", "Mithmah", "Nagas", "Nightmare Isles",
                "Oramond Sewers", "Orclops", "Plague Seal", "POI", "Prision", "Seacrest", "Sphinx", "Tartarugas de Marapur", "True Asura",
                "Upper Roshamull", "Walls", "Warzones", "Werehyena", "Werelions", "WereTigers", "West", "Wyrm Drefia"
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
            disabled={cooldown.active}
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
                  disabled={cooldown.active}
                  className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-[10px] font-display uppercase tracking-widest text-white mb-3 outline-none focus:border-neon-blue disabled:opacity-40 disabled:cursor-not-allowed"
                />
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(index, e)} className="hidden" id={`file-${index}`} disabled={cooldown.active} />
                <label htmlFor={`file-${index}`} className={`flex items-center justify-center gap-2 cursor-pointer py-2 bg-white/5 rounded-lg text-[10px] font-display uppercase text-neon-blue hover:bg-neon-blue hover:text-black transition-all ${cooldown.active ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}>
                  <Upload className="w-3 h-3" />
                  {files[index] ? files[index]?.name : 'Enviar'}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Math Captcha Protection */}
        {!cooldown.active && (
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
            <p className="text-[10px] font-display uppercase text-gray-500 tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-neon-blue" /> Verificação de Segurança (Anti-Bot)
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-[11px] font-mono tracking-widest text-white shrink-0 select-none">
                RESOLVA: <span className="text-neon-blue font-bold text-sm">{mathCaptcha.num1} + {mathCaptcha.num2}</span> = ?
              </div>
              <input 
                type="number"
                required
                placeholder="Resultado"
                value={mathCaptcha.userAnswer}
                onChange={(e) => setMathCaptcha(prev => ({ ...prev, userAnswer: e.target.value }))}
                className="w-full sm:w-28 bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-center text-xs font-mono text-neon-blue outline-none focus:border-neon-blue"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || cooldown.active}
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

const InputGroup: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  name: string; 
  value: string; 
  onChange: any; 
  placeholder: string; 
  type?: string; 
  list?: string;
  disabled?: boolean;
}> = ({ icon, label, name, value, onChange, placeholder, type = 'text', list, disabled }) => (
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
      disabled={disabled}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-display uppercase tracking-widest text-white outline-none focus:border-neon-blue transition-all placeholder:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
    />
  </div>
);
