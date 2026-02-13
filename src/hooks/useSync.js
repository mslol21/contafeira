import { useEffect, useState, useCallback } from 'react';
import { getDB } from '../db/db';
import { supabase } from '../lib/supabase';

export function useSync() {
  const [status, setStatus] = useState('synced'); // 'offline', 'syncing', 'synced'
  const [lastSync, setLastSync] = useState(() => localStorage.getItem('last_sync_time'));

  const getPlan = useCallback(() => {
    try {
      const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');
      return profile.plan || 'essencial';
    } catch {
      return 'essencial';
    }
  }, []);

  const syncData = useCallback(async () => {
    if (!navigator.onLine) {
       setStatus('offline');
       return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setStatus('offline');
        return;
    }

    const plan = getPlan();
    const isPro = plan.includes('pro');
    
    // Only Pro users (or Pro Trial) have cloud sync
    if (!isPro) {
        setStatus('synced');
        return;
    }

    setStatus('syncing');
    const userDB = getDB(user.id);
    
    try {
      const tables = ['configuracao', 'produtos', 'vendas', 'resumos', 'despesas'];
      
      for (const table of tables) {
        const lastSyncKey = `last_sync_${table}_${user.id}`;
        const lastSyncTime = localStorage.getItem(lastSyncKey) || '1970-01-01T00:00:00Z';

        // 1. UPLOAD LOCAL CHANGES (synced = 0)
        const localItems = await userDB[table].where('synced').equals(0).toArray();
        if (localItems.length > 0) {
          const toUpsert = localItems.map(item => {
            const { synced, ...rest } = item;
            // Mapping for Supabase (Snake Case)
            if (table === 'configuracao') return { ...rest, nome_barraca: item.nomeBarraca, user_id: user.id };
            if (table === 'vendas') return { ...rest, nome_produto: item.nomeProduto, forma_pagamento: item.formaPagamento, user_id: user.id };
            if (table === 'resumos') return { ...rest, total_pix: item.totalPix, total_dinheiro: item.totalDinheiro, total_cartao: item.totalCartao, quantidade_vendas: item.quantidadeVendas, total_custos: item.totalCustos, user_id: user.id };
            return { ...rest, user_id: user.id };
          });

          const { error } = await supabase.from(table).upsert(toUpsert);
          if (!error) {
            await userDB[table].where('id').anyOf(localItems.map(i => i.id)).modify({ synced: 1 });
          }
        }

        // 2. DOWNLOAD REMOTE CHANGES
        const { data: remoteItems, error: downError } = await supabase
          .from(table)
          .select('*')
          .gt('updated_at', lastSyncTime)
          .eq('user_id', user.id);

        if (!downError && remoteItems && remoteItems.length > 0) {
          for (const remote of remoteItems) {
            const local = await userDB[table].get(remote.id);
            // Conflict Control: Last Write Wins
            if (!local || new Date(remote.updated_at) > new Date(local.updated_at)) {
              let toStore = { ...remote, synced: 1 };
              // Reverse mapping for local (Camel Case)
              if (table === 'configuracao') toStore = { ...toStore, nomeBarraca: remote.nome_barraca };
              if (table === 'vendas') toStore = { ...toStore, nomeProduto: remote.nome_produto, formaPagamento: remote.forma_pagamento };
              if (table === 'resumos') toStore = { ...toStore, totalPix: remote.total_pix, totalDinheiro: remote.total_dinheiro, totalCartao: remote.total_cartao, quantidadeVendas: remote.quantidade_vendas, totalCustos: remote.total_custos };
              
              await userDB[table].put(toStore);
            }
          }
          const maxUpdate = remoteItems.reduce((max, i) => i.updated_at > max ? i.updated_at : max, lastSyncTime);
          localStorage.setItem(lastSyncKey, maxUpdate);
        }
      }

      const globalNow = new Date().toISOString();
      localStorage.setItem('last_sync_time', globalNow);
      setLastSync(globalNow);
      setStatus('synced');
    } catch (err) {
      console.error('Sync error:', err);
      setStatus('offline');
    }
  }, [getPlan]);

  useEffect(() => {
    syncData();
    const interval = setInterval(syncData, 60000); // More frequent sync (1 min)
    
    const handleOnline = () => syncData();
    const handleOffline = () => setStatus('offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncData]);

  return { status, lastSync, syncData };
}
