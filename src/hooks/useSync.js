import { useEffect, useState } from 'react';
import { db } from '../db/db';
import { supabase } from '../lib/supabase';

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const syncData = async () => {
    if (isSyncing) return;
    
    // Check if online
    if (!navigator.onLine) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setIsSyncing(true);
    console.log('Iniciando sincronização...');

    try {
      // 1. Sync CONFIGURATION
      const unsyncedConfig = await db.configuracao.where('synced').equals(0).toArray();
      for (const config of unsyncedConfig) {
        const { error } = await supabase
          .from('configuracao')
          .upsert({ 
            id: config.id, 
            nome_barraca: config.nomeBarraca, 
            user_id: user.id 
          });
        
        if (!error) {
          await db.configuracao.update(config.id, { synced: 1 });
        }
      }

      // 2. Sync PRODUCTS
      const unsyncedProdutos = await db.produtos.where('synced').equals(0).toArray();
      if (unsyncedProdutos.length > 0) {
        const toUpload = unsyncedProdutos.map(p => ({
          id: p.id,
          nome: p.nome,
          preco: p.preco,
          user_id: user.id
        }));

        const { error } = await supabase.from('produtos').upsert(toUpload);
        if (!error) {
          await db.produtos.where('id').anyOf(unsyncedProdutos.map(p => p.id)).modify({ synced: 1 });
        }
      }

      // 3. Sync SALES (Vendas)
      const unsyncedVendas = await db.vendas.where('synced').equals(0).toArray();
      if (unsyncedVendas.length > 0) {
        const toUpload = unsyncedVendas.map(v => ({
          id: v.id,
          nome_produto: v.nomeProduto,
          valor: v.valor,
          quantidade: v.quantidade,
          forma_pagamento: v.formaPagamento,
          cliente: v.cliente,
          data: v.data,
          hora: v.hora,
          user_id: user.id
        }));

        const { error } = await supabase.from('vendas').upsert(toUpload);
        if (!error) {
          await db.vendas.where('id').anyOf(unsyncedVendas.map(v => v.id)).modify({ synced: 1 });
        }
      }

      // 4. Sync SUMMARIES (Resumos)
      const unsyncedResumos = await db.resumos.where('synced').equals(0).toArray();
      if (unsyncedResumos.length > 0) {
        const toUpload = unsyncedResumos.map(r => ({
          id: r.id,
          data: r.data,
          total: r.total,
          total_pix: r.totalPix,
          total_dinheiro: r.totalDinheiro,
          total_cartao: r.totalCartao,
          quantidade_vendas: r.quantidadeVendas,
          user_id: user.id
        }));

        const { error } = await supabase.from('resumos').upsert(toUpload);
        if (!error) {
          await db.resumos.where('id').anyOf(unsyncedResumos.map(r => r.id)).modify({ synced: 1 });
        }
      }

      setLastSync(new Date());
      console.log('Upload concluído, verificando atualizações do servidor...');

      // 5. DOWNLOAD (Sync Down) - Traz dados do servidor para o local
      // Produtos
      const { data: serverProdutos } = await supabase.from('produtos').select('*').eq('user_id', user.id);
      if (serverProdutos) {
        await db.produtos.bulkPut(serverProdutos.map(p => ({ ...p, synced: 1 })));
      }

      // Configuração
      const { data: serverConfig } = await supabase.from('configuracao').select('*').eq('user_id', user.id);
      if (serverConfig) {
        await db.configuracao.bulkPut(serverConfig.map(c => ({
           id: c.id, 
           nomeBarraca: c.nome_barraca, 
           synced: 1, 
           user_id: c.user_id 
        })));
      }

      // Vendas (Traz vendas recentes/todas? Cuidado com volume. Trazemos últimas 1000 ou do dia?)
      // Para consistência de caixa, é bom trazer do dia ou mês. Vamos trazer todas por enquanto (volume baixo esperado).
      // Se volume alto, filtrar por data > lastSync.
      
      console.log('Sincronização bidirecional concluída!');
    } catch (err) {
      console.error('Erro na sincronização:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // Initial sync
    syncData();

    // Listen for online event
    window.addEventListener('online', syncData);
    
    // Periodic sync every 5 minutes
    const interval = setInterval(syncData, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('online', syncData);
      clearInterval(interval);
    };
  }, []);

  return { isSyncing, lastSync, syncData };
}
