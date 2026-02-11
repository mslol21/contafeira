import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function useHistorico() {
  const historico = useLiveQuery(() => 
    db.resumos.orderBy('data').reverse().toArray()
  );

  return {
    historico,
    loading: historico === undefined
  };
}
