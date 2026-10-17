import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, LogIn, Loader2 } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebaseAuth';
import { fetchAllowedEmailsFromCSV, ADMIN_EMAILS } from '../services/csvService';

interface FirebaseLoginCardProps {
  onLoginSuccess: (email: string) => void;
}

export const FirebaseLoginCard: React.FC<FirebaseLoginCardProps> = ({ onLoginSuccess }) => {
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
    <div className="flex items-center justify-center min-h-[70vh] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full cyber-card p-8 cyber-border space-y-6 text-left relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/5 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2">
          <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-center">
            <span className="text-[#00F3FF] drop-shadow-[0_0_10px_rgba(0,243,255,0.8)]">MISSCLIC</span>
            <span className="text-[#FF0000] drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">KS</span>
          </h2>
          <p className="text-xs text-gray-400 font-mono leading-relaxed text-center">
            Acesso restrito para membros do KS autorizados. Faça login com o Google.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-mono flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-neon-blue/50 rounded-xl text-white font-display text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer group"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-neon-blue" />
          ) : (
            <>
              {/* Ícone oficial do Google */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.19v3.15C3.18 21.32 7.22 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.19C.43 8.1 0 9.8 0 12s.43 3.9 1.19 5.42l4.09-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.18 2.68 1.19 6.58l4.09 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span className="group-hover:text-neon-blue transition-colors">Entrar</span>
            </>
          )}
        </button>

        <div className="pt-2 border-t border-white/5 text-center">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            Protegido por Firebase & Google Auth
          </span>
        </div>
      </motion.div>
    </div>
  );
};
