import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Confirme seu e-mail para ativar a conta!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-['Outfit']">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <header className="text-center mb-10">
            <div className="flex items-center justify-center mb-6">
              <img src="/logo.png" alt="ContaFeira Logo" className="w-48 h-auto drop-shadow-xl" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              {isSignUp ? 'Criar sua conta' : 'Bem-vindo de volta'}
            </h1>
            <p className="text-gray-500 font-medium">
              {isSignUp ? 'Comece a organizar suas vendas hoje' : 'Acesse seu dashboard de vendas'}
            </p>
          </header>

          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
                {error}
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                required
                placeholder="E-mail"
                className="w-full p-5 pl-12 bg-white border-2 border-gray-100 rounded-[1.5rem] focus:border-[#4CAF50] focus:ring-4 focus:ring-[#4CAF50]/5 transition-all text-gray-900 font-medium outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                required
                placeholder="Senha"
                className="w-full p-5 pl-12 bg-white border-2 border-gray-100 rounded-[1.5rem] focus:border-[#4CAF50] focus:ring-4 focus:ring-[#4CAF50]/5 transition-all text-gray-900 font-medium outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-[#4CAF50] text-white font-black py-5 rounded-[2rem] shadow-xl shadow-[#4CAF50]/20 active:scale-95 transition-all text-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  {isSignUp ? 'Cadastrar' : 'Entrar'}
                  <ArrowRight size={24} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center px-4">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-gray-400 font-bold text-sm hover:text-[#4CAF50] transition-colors"
            >
              {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem uma conta? Cadastre-se'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
