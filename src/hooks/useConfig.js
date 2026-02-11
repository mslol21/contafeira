import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { supabase } from '../lib/supabase';

export function useConfig() {
  const config = useLiveQuery(() => db.configuracao.toArray());
  const isConfigured = config?.length > 0;
  
  const saveConfig = async (nomeBarraca, produtos) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await db.configuracao.clear();
    await db.configuracao.add({ 
      id: 'config', 
      nomeBarraca, 
      user_id: user.id, 
      synced: 0 
    });
    
    await db.produtos.clear();
    const produtosComUser = produtos.map(p => ({ 
      ...p, 
      user_id: user.id, 
      synced: 0 
    }));
    await db.produtos.bulkAdd(produtosComUser);
  };

  return {
    config: config?.[0],
    isConfigured,
    saveConfig,
    loading: config === undefined
  };
}
