import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDB } from '../db/db';
import { supabase } from '../lib/supabase';

export function useHistorico() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
  }, []);

  const userDB = getDB(userId);

  const historico = useLiveQuery(
    () => userId ? userDB.resumos.reverse().sortBy('data') : [],
    [userId]
  );

  return {
    historico,
    loading: historico === undefined || (userId === null && !historico)
  };
}
