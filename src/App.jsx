import React, { useEffect, useState } from 'react';
import { useConfig } from './hooks/useConfig';
import ConfigPage from './pages/ConfigPage';
import SalesPage from './pages/SalesPage';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import PricingPage from './pages/PricingPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import PixPayment from './components/PixPayment';
import { supabase } from './lib/supabase';
import { useSync } from './hooks/useSync';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { WifiOff, Shield, Download } from 'lucide-react';

function App() {
  const { isConfigured, loading: configLoading } = useConfig();
  const { isSyncing } = useSync();
  const isOnline = useOnlineStatus();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(() => {
    // Tenta recuperar do cache inicial
    try {
      const cached = localStorage.getItem('user_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('sales'); // 'sales', 'history', 'dashboard', 'admin', 'pix'
  const [selectedPlan, setSelectedPlan] = useState(null);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        setProfile(data);
        localStorage.setItem('user_profile', JSON.stringify(data));
      } else if (error && error.code === 'PGRST116') {
        // Perfil não existe, manter nulo para mostrar PricingPage
        setProfile(null);
        localStorage.removeItem('user_profile');
      }
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      // Mantém o perfil em cache se houver erro de conexão
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      const cached = localStorage.getItem('user_profile');
      if (session) {
        // Se o cache pertencer a outro usuário, limpa
        if (cached) {
          try {
            const p = JSON.parse(cached);
            if (p.id !== session.user.id) {
              setProfile(null);
              localStorage.removeItem('user_profile');
            }
          } catch {
            localStorage.removeItem('user_profile');
          }
        }
        fetchProfile(session.user.id);
        
        // Se for admin, já seta a página inicial como admin
        if (session.user.email === 'msjtec12@gmail.com') {
          setCurrentPage('admin');
        }
      } else {
        // Sem sessão, limpa perfil
        setProfile(null);
        localStorage.removeItem('user_profile');
      }

      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
         fetchProfile(session.user.id);
      } else {
         setProfile(null);
         localStorage.removeItem('user_profile');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // PWA Install Prompt Logic
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
    });
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
      .select()
      .single();
    
    if (!error) {
      setProfile(data);
      localStorage.setItem('user_profile', JSON.stringify(data));
      setCurrentPage('sales');
    } else {
      alert('Erro ao processar transação. Tente novamente.');
    }
  };

  if (authLoading || configLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  // Admin Priority Check
  if (session.user.email === 'msjtec12@gmail.com' || profile?.role === 'admin') {
    if (currentPage === 'admin') {
      return <AdminPage onBack={() => setCurrentPage('sales')} />;
    }
  }

  if (!profile) {
    if (currentPage === 'pix' && selectedPlan) {
      return (
        <PixPayment 
          plan={selectedPlan} 
          onConfirm={handleConfirmPix}
          onBack={() => setCurrentPage('sales')} 
        />
      );
    }
    return <PricingPage onSelectPlan={handleSelectPlan} />;
  }

  // Validação de Status e Expiração
  const isAdmin = session.user.email === 'msjtec12@gmail.com' || profile.role === 'admin';
  // Check if actually expired based on status OR date if trial
  const isExpired = profile.subscription_status === 'expired' || 
    (profile.subscription_status === 'trial' && profile.subscription_expires_at && new Date(profile.subscription_expires_at) < new Date());

  console.log('Profile Status:', profile.subscription_status, 'Expired:', isExpired);
  
  // Se está expirado (seja trial ou pago), manda para pagamento
  // Admin nunca expira
  // Se está expirado (seja trial ou pago), manda para pagamento
  // Admin nunca expira
  if (isExpired && !isAdmin) {
    return <PricingPage onSelectPlan={handleSelectPlan} />;
  }

  // Se o status for 'pending' (foi para análise mas não é trial), bloqueia
  if (profile.subscription_status === 'pending' && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-8 text-center font-['Outfit']">
        {/* ... PWA Banner Logic ... */}
        {!isOnline && (
          <div className="bg-red-500 text-white text-center py-2 text-xs font-bold fixed top-0 w-full z-50 flex items-center justify-center gap-2 shadow-md">
            <WifiOff size={14} /> MODO OFFLINE - VENDAS SALVAS NO DISPOSITIVO
          </div>
        )}
        
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mb-6 animate-pulse">
          <Shield size={40} />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Pagamento em Análise</h1>
        <p className="text-gray-500 font-medium mb-8 max-w-xs">
          Já recebemos sua confirmação de pagamento via PIX. Nossa equipe está validando agora mesmo!
        </p>
        <button 
          onClick={() => fetchProfile(session.user.id)}
          className="w-full max-w-xs py-5 bg-[#4CAF50] text-white rounded-[2rem] font-black shadow-lg shadow-[#4CAF50]/20 active:scale-95 transition-all uppercase tracking-widest text-sm"
        >
          Verificar Novamente
        </button>
        <button 
          onClick={() => supabase.auth.signOut()}
          className="mt-6 text-gray-400 font-bold uppercase tracking-widest text-[10px]"
        >
          Sair da Conta
        </button>
      </div>
    );
  }

  if (profile.subscription_status === 'expired' && !isAdmin) {
    return <PricingPage onSelectPlan={handleSelectPlan} />;
  }

  if (currentPage === 'admin' && (session.user.email === 'msjtec12@gmail.com' || profile.role === 'admin')) {
    return <AdminPage onBack={() => setCurrentPage('sales')} />;
  }

  if (!isConfigured) {
    return <ConfigPage />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] relative">
      {!isOnline && (
        <div className="fixed top-0 left-0 w-full z-[110] bg-orange-500 text-white py-2 px-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <WifiOff size={14} />
            <span>Modo Offline - Vendas salvas no dispositivo</span>
          </div>
        </div>
      )}

      {profile.subscription_status === 'trial' && !isExpired && (
        <div className="fixed top-0 left-0 w-full z-[100] bg-yellow-400 text-yellow-900 py-1 px-4 text-center text-[10px] font-black uppercase tracking-widest shadow-sm">
           Teste Grátis: Restam {Math.ceil((new Date(profile.subscription_expires_at) - new Date()) / (1000 * 60 * 60 * 24))} dias
        </div>
      )}

      {deferredPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-[90] animate-bounce-slow">
          <button 
            onClick={handleInstallClick}
            className="w-full bg-white text-gray-900 p-4 rounded-2xl shadow-2xl border-2 border-[#4CAF50] flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="bg-[#4CAF50] p-2 rounded-xl text-white">
                <Download size={24} />
              </div>
              <div className="text-left">
                <p className="font-black text-xs uppercase tracking-widest text-[#4CAF50]">Disponível Offline</p>
                <p className="font-bold text-sm">Instalar App ContaFeira</p>
              </div>
            </div>
            <span className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-bold text-gray-500">GRÁTIS</span>
          </button>
        </div>
      )}

      {isSyncing && isOnline && (
        <div className="fixed top-4 right-4 z-[100] bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-[#4CAF50]/20 flex items-center gap-2 animate-pulse">
          <div className="w-2 h-2 bg-[#4CAF50] rounded-full"></div>
          <span className="text-[10px] font-black text-[#4CAF50] uppercase tracking-widest">Sincronizando</span>
        </div>
      )}

      {(session.user.email === 'msjtec12@gmail.com' || profile?.role === 'admin') && (
        <button 
          onClick={() => setCurrentPage('admin')}
          className="fixed bottom-24 right-6 z-[100] bg-gray-900 text-white p-4 rounded-full shadow-2xl active:scale-90 transition-all border-4 border-white"
          title="Painel Admin"
        >
          <Shield size={24} />
        </button>
      )}
      
      {currentPage === 'sales' && (
        <SalesPage 
          onShowHistory={() => setCurrentPage('history')} 
          onShowDashboard={() => setCurrentPage('dashboard')}
        />
      )}
      {currentPage === 'history' && (
        <HistoryPage onBack={() => setCurrentPage('sales')} />
      )}
      {currentPage === 'dashboard' && (
        <DashboardPage onBack={() => setCurrentPage('sales')} />
      )}
    </div>
  );
}

export default App;
