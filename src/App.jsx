import React, { useEffect, useState, useCallback } from 'react';
import { useConfig } from './hooks/useConfig';
import ConfigPage from './pages/ConfigPage';
import SalesPage from './pages/SalesPage';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import PixPayment from './components/PixPayment';
import ConnectionStatus from './components/ConnectionStatus';
import { supabase } from './lib/supabase';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import StockNotifier from './components/StockNotifier';
import { Shield, Download, Rocket } from 'lucide-react';

function App() {
  const { isConfigured, loading: configLoading } = useConfig();
  const isOnline = useOnlineStatus();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(() => {
    try {
      const cached = localStorage.getItem('user_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('sales'); 
  const [selectedPlan, setSelectedPlan] = useState(null);

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        // Automatic Downgrade Logic: if trial expired, update to essencial
        const isTrial = data.plan.includes('trial');
        const isExpired = data.subscription_expires_at && new Date(data.subscription_expires_at) < new Date();
        
        if (isTrial && isExpired && data.plan !== 'essencial') {
          const { data: updated } = await supabase
            .from('profiles')
            .update({ plan: 'essencial', subscription_status: 'active' })
            .eq('id', userId)
            .select()
            .single();
          
          if (updated) {
            setProfile(updated);
            localStorage.setItem('user_profile', JSON.stringify(updated));
            return;
          }
        }

        setProfile(data);
        localStorage.setItem('user_profile', JSON.stringify(data));
      } else if (error && error.code === 'PGRST116') {
        // CREATE AUTOMATIC TRIAL for new users
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ 
            id: userId, 
            plan: 'pro_trial', 
            subscription_status: 'trial',
            subscription_expires_at: expiresAt.toISOString()
          }])
          .select()
          .single();

        if (newProfile) {
          setProfile(newProfile);
          localStorage.setItem('user_profile', JSON.stringify(newProfile));
        }
      }
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
        if (session.user.email === 'msjtec12@gmail.com') setCurrentPage('admin');
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        localStorage.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
  };

  const handleSelectPlan = async (plan) => {
    setSelectedPlan(plan);
    setCurrentPage('pix');
  };

  const handleConfirmPix = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .upsert([{ 
        id: session.user.id, 
        plan: selectedPlan.name.toLowerCase(), 
        subscription_status: 'pending' 
      }])
      .select().single();
    
    if (!error) {
      setProfile(data);
      localStorage.setItem('user_profile', JSON.stringify(data));
      setCurrentPage('sales');
    }
  };

  const [showLogin, setShowLogin] = useState(false);
  const [initialIsSignUp, setInitialIsSignUp] = useState(false);

  if (authLoading || configLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div>
      </div>
    );
  }

  if (!session) {
    if (showLogin) return <LoginPage onBack={() => setShowLogin(false)} initialIsSignUp={initialIsSignUp} />;
    return (
      <LandingPage 
        onGetStarted={(isSignUp) => {
          setInitialIsSignUp(isSignUp);
          setShowLogin(true);
        }} 
      />
    );
  }

  const isAdmin = session.user.email === 'msjtec12@gmail.com' || profile?.role === 'admin';

  if (!profile && !authLoading) return <div className="p-10 text-center">Configurando sua conta...</div>;

  if (profile.subscription_status === 'pending' && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-8 text-center font-['Outfit']">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mb-6 animate-pulse">
          <Shield size={40} />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Pagamento em Análise</h1>
        <button onClick={() => fetchProfile(session.user.id)} className="w-full max-w-xs py-5 bg-[#4CAF50] text-white rounded-[2rem] font-black shadow-lg">Verificar Novamente</button>
        <button onClick={() => supabase.auth.signOut()} className="mt-6 text-gray-400 font-bold uppercase tracking-widest text-[10px]">Sair da Conta</button>
      </div>
    );
  }

  if (!isConfigured) return <ConfigPage onUpgrade={() => setCurrentPage('pricing')} />;

  return (
    <div className="min-h-screen bg-[#FAFAFA] relative">
      <ConnectionStatus />
      <StockNotifier />

      {/* Trial Banner */}
      {profile.plan === 'pro_trial' && (
        <div className="fixed top-0 left-0 w-full z-[100] bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-950 py-1.5 px-4 text-center text-[10px] font-black uppercase tracking-[0.2em] shadow-md flex items-center justify-center gap-4">
           <span>⚡ Teste Pro Ativo: {Math.ceil((new Date(profile.subscription_expires_at) - new Date()) / (1000 * 60 * 60 * 24))} dias restantes</span>
           <button onClick={() => setCurrentPage('sales')} className="bg-white/30 px-2 py-0.5 rounded-md hover:bg-white/50 transition-colors">Assinar Agora</button>
        </div>
      )}

      {/* Upgrade Banner for Essential */}
      {profile.plan === 'essencial' && (
        <div className="fixed top-0 left-0 w-full z-[100] bg-gray-900 text-white py-1.5 px-4 text-center text-[10px] font-black uppercase tracking-[0.2em] shadow-md flex items-center justify-center gap-4">
           <span>🚀 Evolua para o Plano Profissional</span>
           <button onClick={() => handleSelectPlan({ name: 'Pro Cloud' })} className="text-[#4CAF50] underline">Ver Benefícios</button>
        </div>
      )}

      {deferredPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-[90]">
          <button onClick={handleInstallClick} className="w-full bg-white text-gray-900 p-4 rounded-2xl shadow-2xl border-2 border-[#4CAF50] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#4CAF50] p-2 rounded-xl text-white"><Download size={24} /></div>
              <div className="text-left">
                <p className="font-black text-xs uppercase tracking-widest text-[#4CAF50]">App ContaFeira</p>
                <p className="font-bold text-sm">Instalar no Celular</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {isAdmin && currentPage === 'admin' ? (
        <AdminPage onBack={() => setCurrentPage('sales')} />
      ) : (
        <>
          {currentPage === 'sales' && (
            <SalesPage 
              onShowHistory={() => setCurrentPage('history')} 
              onShowDashboard={() => setCurrentPage('dashboard')} 
              onShowSettings={() => setCurrentPage('config')}
              onUpgrade={() => setCurrentPage('pricing')}
            />
          )}
          {currentPage === 'config' && <ConfigPage onUpgrade={() => setCurrentPage('pricing')} onBack={() => setCurrentPage('sales')} />}
          {currentPage === 'history' && <HistoryPage onBack={() => setCurrentPage('sales')} />}
          {currentPage === 'dashboard' && <DashboardPage onBack={() => setCurrentPage('sales')} />}
          {currentPage === 'pricing' && <PricingPage onSelectPlan={handleSelectPlan} onBack={() => setCurrentPage('sales')} />}
          {currentPage === 'pix' && <PixPayment plan={selectedPlan} onConfirm={handleConfirmPix} onBack={() => setCurrentPage('pricing')} />}
        </>
      )}

      {isAdmin && (
        <button onClick={() => setCurrentPage('admin')} className="fixed bottom-24 right-6 z-[100] bg-gray-900 text-white p-4 rounded-full shadow-2xl border-4 border-white"><Shield size={24} /></button>
      )}
    </div>
  );
}

export default App;
