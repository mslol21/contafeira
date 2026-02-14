import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2, ArrowRight, UserPlus, LogIn, ChevronLeft } from 'lucide-react';

export default function LoginPage({ onBack, initialIsSignUp = false }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        if (data?.session) {
          // Login automático (confirmação de email desativada)
          // O App.jsx vai detectar a mudança de sessão
        } else {
          alert('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-['Outfit']">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <header className="text-center mb-8">
            <div className="flex items-center justify-center mb-6 relative">
              <button 
                type="button"
                onClick={onBack}
                className="absolute left-0 p-2 text-gray-400 hover:text-gray-900 transition-colors"
                title="Voltar para a página inicial"
              >
                <ChevronLeft size={24} />
              </button>
              <img src="/logo.png" alt="ContaFeira Logo" className="w-48 h-auto drop-shadow-xl" />
            </div>
            
            {/* Tabs for Login/Sign-up */}
            <div className="flex bg-gray-100 p-1.5 rounded-[2rem] mb-8">
              <button 
                onClick={() => setIsSignUp(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${
                  !isSignUp ? 'bg-white text-[#4CAF50] shadow-md' : 'text-gray-400'
                }`}
              >
                <LogIn size={16} /> Entrar
              </button>
              <button 
                onClick={() => setIsSignUp(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${
                  isSignUp ? 'bg-white text-[#4CAF50] shadow-md' : 'text-gray-400'
                }`}
              >
                <UserPlus size={16} /> Cadastrar
              </button>
            </div>

            <h1 className="text-3xl font-black text-gray-900 mb-2">
              {isSignUp ? 'Criar sua conta' : 'Bem-vindo de volta'}
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              {isSignUp ? 'Junte-se a centenas de feirantes' : 'Acesse seu painel de vendas'}
            </p>
          </header>

          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 animate-in fade-in duration-300">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[10px] font-black text-[#4CAF50] uppercase tracking-widest ml-4">E-mail Comercial</span>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  className="w-full p-5 pl-14 bg-white border-2 border-gray-50 rounded-[1.8rem] focus:border-[#4CAF50] focus:ring-4 focus:ring-[#4CAF50]/5 transition-all text-gray-900 font-bold outline-none shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black text-[#4CAF50] uppercase tracking-widest ml-4">Senha Segura</span>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full p-5 pl-14 bg-white border-2 border-gray-50 rounded-[1.8rem] focus:border-[#4CAF50] focus:ring-4 focus:ring-[#4CAF50]/5 transition-all text-gray-900 font-bold outline-none shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              disabled={loading}
              className={`w-full text-white font-black py-5 rounded-[2.2rem] shadow-xl active:scale-95 transition-all text-xl flex items-center justify-center gap-3 mt-6 ${
                isSignUp ? 'bg-orange-500 shadow-orange-500/20' : 'bg-[#4CAF50] shadow-[#4CAF50]/20'
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  {isSignUp ? 'CRIAR MINHA CONTA' : 'ACESSAR AGORA'}
                  <ArrowRight size={24} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-400 text-xs font-medium px-6 leading-relaxed">
            {isSignUp ? (
              <>Ao cadastrar-se, você concorda com nossos <span className="text-gray-900 font-bold underline">Termos</span> e com a política de fomento à economia local.</>
            ) : (
              <>Esqueceu sua senha? <span className="text-[#4CAF50] font-bold underline cursor-pointer">Clique aqui</span> para recuperar.</>
            )}
          </p>
        </div>
      </div>
      
      <footer className="p-8 text-center bg-gray-50 border-t border-gray-100">
         <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
           ContaFeira &copy; 2025 - O braço direito do ambulante
         </p>
      </footer>
    </div>
  );
}
