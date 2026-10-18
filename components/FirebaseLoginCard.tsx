import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, LogIn, Loader2, Target, Sword, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebaseAuth';
import { fetchAllowedEmailsFromCSV, ADMIN_EMAILS } from '../services/csvService';

interface FirebaseLoginCardProps {
  onLoginSuccess: (email: string) => void;
  onOpenSuggestHunted?: () => void;
  onOpenJoinTeam?: () => void;
}

export const FirebaseLoginCard: React.FC<FirebaseLoginCardProps> = ({ 
  onLoginSuccess,
  onOpenSuggestHunted,
  onOpenJoinTeam
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    if (!auth || !googleProvider) {
      setErrorMsg("Configuração do Firebase ausente. Verifique seu arquivo .env.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const email = user.email ? user.email.trim().toLowerCase() : '';

      if (!email) {
        throw new Error("Não foi possível obter o e-mail da sua conta Google.");
      }

      // Validação de Admin: acesso irrestrito garantido aos administradores
      const formattedAdmins = ADMIN_EMAILS.map(e => e.trim().toLowerCase());
      const isAdmin = formattedAdmins.includes(email);

      if (!isAdmin) {
        // Validação padrão: Coluna B da planilha de respostas ou inscritos
        const allowedEmails = await fetchAllowedEmailsFromCSV();
        const formattedAllowed = allowedEmails.map(e => e.trim().toLowerCase());

        const isAuthorized = formattedAllowed.includes(email);

        if (!isAuthorized) {
          await auth.signOut();
          throw new Error(`Acesso negado: O e-mail "${email}" não está autorizado na Coluna B da planilha.`);
        }
      }

      onLoginSuccess(email);
    } catch (err: any) {
      console.error("Erro no login Firebase:", err);
      setErrorMsg(err.message || 'Erro ao autenticar com o Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8 max-w-5xl mx-auto w-full">
      {/* Brand Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 space-y-2"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono tracking-widest uppercase text-neon-blue mb-2">
          <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span>Major</span>
          <span className="text-gray-500">·</span>
          <span className="text-gray-400">v2.4</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter">
          <span className="text-[#00F3FF] drop-shadow-[0_0_15px_rgba(0,243,255,0.6)]">MISSCLIC</span>
          <span className="text-[#FF0000] drop-shadow-[0_0_15px_rgba(255,0,0,0.6)]">KS</span>
        </h1>
        <p className="text-xs md:text-sm text-gray-400 font-mono tracking-wider max-w-lg mx-auto">
          Monitoramento, Inteligência de Alvos e Operações de KS
        </p>
      </motion.div>

      {/* Side-by-Side Grid: Login vs Public Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Card 1: Membros Autorizados (Login) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="cyber-card p-6 md:p-8 cyber-border flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-neon-blue/10 rounded-full blur-3xl pointer-events-none group-hover:bg-neon-blue/20 transition-all duration-500" />
          
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center text-neon-blue">
                <LogIn className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-neon-blue" /> Área Restrita
              </span>
            </div>

            <div>
              <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">
                Membros do KS
              </h2>
              <p className="text-xs text-gray-400 font-mono mt-1.5 leading-relaxed">
                Acesso exclusivo para combatentes autorizados. Visualize o ranking completo e registre suas ações de KS.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-mono flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span className="leading-tight">{errorMsg}</span>
              </div>
            )}
          </div>

          <div className="pt-6 relative z-10 space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-neon-blue/60 rounded-xl text-white font-display text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-neon-blue" />
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.19v3.15C3.18 21.32 7.22 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.19C.43 8.1 0 9.8 0 12s.43 3.9 1.19 5.42l4.09-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.18 2.68 1.19 6.58l4.09 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span className="group-hover:text-neon-blue transition-colors">Entrar com Google</span>
                </>
              )}
            </button>

            <p className="text-[10px] font-mono text-center text-gray-500 uppercase tracking-widest">
              Área Restrita
            </p>
          </div>
        </motion.div>

        {/* Card 2: Ações Públicas (Não requerem login) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="cyber-card p-6 md:p-8 cyber-border flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-neon-purple/10 rounded-full blur-3xl pointer-events-none group-hover:bg-neon-purple/20 transition-all duration-500" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-neon-purple/10 border border-neon-purple/30 flex items-center justify-center text-neon-purple">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-neon-green uppercase tracking-widest">
                Uso Missclick
              </span>
            </div>

            <div>
              <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">
                Social
              </h2>
              <p className="text-xs text-gray-400 font-mono mt-1.5 leading-relaxed">
                Você pode sugerir alvos ou solicitar entrada no time de KS
              </p>
            </div>

            {/* Public Action Buttons */}
            <div className="space-y-3 pt-1">
              {/* Botão Sugerir Hunted */}
              <button
                onClick={onOpenSuggestHunted}
                className="w-full text-left p-3.5 bg-white/5 hover:bg-neon-red/10 border border-white/10 hover:border-neon-red/40 rounded-xl transition-all group/btn flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 group-hover/btn:scale-110 transition-transform">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-display font-bold text-white uppercase tracking-wider group-hover/btn:text-red-400 transition-colors">
                      Sugerir Hunted
                    </h3>
                    <p className="text-[11px] text-gray-400 font-mono leading-tight">
                      Indique um novo alvo com prints para a liderança
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover/btn:text-red-400 group-hover/btn:translate-x-1 transition-all shrink-0" />
              </button>

              {/* Botão Entrar para o Time de KS */}
              <button
                onClick={onOpenJoinTeam}
                className="w-full text-left p-3.5 bg-white/5 hover:bg-neon-green/10 border border-white/10 hover:border-neon-green/40 rounded-xl transition-all group/btn flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-neon-green/10 border border-neon-green/30 flex items-center justify-center text-neon-green group-hover/btn:scale-110 transition-transform">
                    <Sword className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-display font-bold text-white uppercase tracking-wider group-hover/btn:text-neon-green transition-colors">
                      Entrar para o Time de KS
                    </h3>
                    <p className="text-[11px] text-gray-400 font-mono leading-tight">
                      Inscreva seu personagem para participar das operações
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover/btn:text-neon-green group-hover/btn:translate-x-1 transition-all shrink-0" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-center relative z-10">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              Envios moderados e analisados pela liderança
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
