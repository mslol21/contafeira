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
import { WifiOff, Shield } from 'lucide-react';

function App() {
  const { isConfigured, loading: configLoading } = useConfig();
  const { isSyncing } = useSync();
  const isOnline = useOnlineStatus();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('sales'); // 'sales', 'history', 'dashboard', 'admin', 'pix'
  const [selectedPlan, setSelectedPlan] = useState(null);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) setProfile(data);
    else if (error && error.code === 'PGRST116') {
      // Perfil não existe, manter nulo para mostrar PricingPage
      setProfile(null);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      
      // Se for admin, já seta a página inicial como admin
      if (session?.user?.email === 'msjtec12@gmail.com') {
        setCurrentPage('admin');
      }

      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  // Se o pagamento estiver pendente, mostrar uma versão limitada ou aviso
  // ADMIN BYPASS: Se for o admin, ignora status pendente
  const isAdmin = session.user.email === 'msjtec12@gmail.com' || profile.role === 'admin';
  
  if (profile.subscription_status === 'pending' && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-8 text-center font-['Outfit']">
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
          Atualizar Status
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

  if (profile.subscription_status === 'expired') {
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
          <WifiOff size={14} />
          <span>Você está em Modo Offline - As vendas serão salvas localmente</span>
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
