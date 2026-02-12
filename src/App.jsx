import React, { useEffect, useState } from 'react';
import { useConfig } from './hooks/useConfig';
import ConfigPage from './pages/ConfigPage';
import LoginPage from './pages/LoginPage';
import PricingPage from './pages/PricingPage';
import DashboardPage from './pages/DashboardPage';
import { supabase } from './lib/supabase';
import { useSync } from './hooks/useSync';

function App() {
  const { isConfigured, loading: configLoading } = useConfig();
  const { isSyncing } = useSync();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('sales'); // 'sales', 'history', 'dashboard'

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
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ id: session.user.id, plan: plan.name.toLowerCase(), subscription_status: 'active' }])
      .select()
      .single();
    
    if (!error) setProfile(data);
    else alert('Erro ao selecionar plano. Tente novamente.');
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

  if (!profile) {
    return <PricingPage onSelectPlan={handleSelectPlan} />;
  }

  if (!isConfigured) {
    return <ConfigPage />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] relative">
      {isSyncing && (
        <div className="fixed top-4 right-4 z-[100] bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-[#4CAF50]/20 flex items-center gap-2 animate-pulse">
          <div className="w-2 h-2 bg-[#4CAF50] rounded-full"></div>
          <span className="text-[10px] font-black text-[#4CAF50] uppercase tracking-widest">Sincronizando</span>
        </div>
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
