import React, { useEffect, useState } from 'react';
import { useConfig } from './hooks/useConfig';
import ConfigPage from './pages/ConfigPage';
import SalesPage from './pages/SalesPage';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import { supabase } from './lib/supabase';
import { useSync } from './hooks/useSync';

function App() {
  const { isConfigured, loading: configLoading } = useConfig();
  const { isSyncing } = useSync();
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('sales');

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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
      {currentPage === 'sales' ? (
        <SalesPage onShowHistory={() => setCurrentPage('history')} />
      ) : (
        <HistoryPage onBack={() => setCurrentPage('sales')} />
      )}
    </div>
  );
}

export default App;
