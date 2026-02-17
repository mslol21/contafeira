import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDB } from '../db/db';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export function useConfig() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
  }, []);

  const userDB = getDB(userId);

  const config = useLiveQuery(
    () => userId ? userDB.configuracao.toArray() : [],
    [userId]
  );
  
  const savedProdutos = useLiveQuery(
    () => userId ? userDB.produtos.toArray() : [],
    [userId]
  );
  
  const isConfigured = config?.length > 0;
  
  const saveConfig = async (nomeBarraca, produtos) => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    const now = new Date().toISOString();
    const dbInstance = getDB(user.id);

    // Dynamic filtering is implicit because each user has their own DB
    await dbInstance.configuracao.clear();
    await dbInstance.configuracao.add({ 
      id: uuidv4(), 
      nomeBarraca, 
      user_id: user.id, 
      synced: 0,
      updated_at: now
    });
    
    // For products, we use bulkPut to update existing and add new ones.
    // To handle deletions, we find what's in DB but not in the new list.
    const currentDBProdutos = await dbInstance.produtos.toArray();
    const idsToKeep = produtos.map(p => p.id);
    const idsToDelete = currentDBProdutos.filter(p => !idsToKeep.includes(p.id)).map(p => p.id);
    
    if (idsToDelete.length > 0) {
      await dbInstance.produtos.bulkDelete(idsToDelete);
    }

    const produtosComUser = produtos.map(p => ({ 
      ...p, 
      user_id: user.id, 
      synced: 0,
      updated_at: now
    }));
    
    await dbInstance.produtos.bulkPut(produtosComUser);
  };

  return {
    config: config?.[0],
    savedProdutos,
    isConfigured,
    saveConfig,
    loading: config === undefined || (userId === null && !config)
  };
}
