import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export function useConfig() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
  }, []);

  const config = useLiveQuery(
    () => userId ? db.configuracao.where('user_id').equals(userId).toArray() : [],
    [userId]
  );
  
  const isConfigured = config?.length > 0;
  
  const saveConfig = async (nomeBarraca, produtos) => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    // Clear previous config for THIS user specifically
    await db.configuracao.where('user_id').equals(user.id).delete();
    
    await db.configuracao.add({ 
      id: uuidv4(), 
      nomeBarraca, 
      user_id: user.id, 
      synced: 0 
    });
    
    // Clear previous products for THIS user specifically
    await db.produtos.where('user_id').equals(user.id).delete();
    
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
    loading: config === undefined || (userId === null && !config)
  };
}
