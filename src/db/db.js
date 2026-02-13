import Dexie from 'dexie';

// Singleton map to hold database instances per user
const dbInstances = new Map();

/**
 * Retorna uma instância do Dexie isolada por usuário.
 * Isso garante segurança absoluta entre dados de diferentes feirantes no mesmo dispositivo.
 */
export const getDB = (userId) => {
  if (!userId) {
    return new Dexie('ContaFeiraDB_Guest');
  }

  const dbName = `ContaFeiraDB_${userId}`;
  
  if (dbInstances.has(dbName)) {
    return dbInstances.get(dbName);
  }

  const db = new Dexie(dbName);
  
  // Versão 8: Adicionado resumo_id para permitir arquivamento sem deleção local
  db.version(8).stores({
    produtos: 'id, nome, preco, custo, estoque, categoria, synced, user_id, updated_at',
    vendas: 'id, nomeProduto, valor, quantidade, formaPagamento, data, hora, cliente, synced, user_id, updated_at, resumo_id',
    resumos: 'id, data, total, totalPix, totalDinheiro, totalCartao, quantidadeVendas, totalCustos, synced, user_id, updated_at',
    despesas: 'id, descricao, valor, categoria, data, synced, user_id, updated_at',
    configuracao: 'id, nomeBarraca, synced, user_id, updated_at',
    profiles: 'id, plan, subscription_status, updated_at'
  });

  dbInstances.set(dbName, db);
  return db;
};

// Legacy Export (Manter apenas para compatibilidade durante migração total)
export const db = new Dexie('ContaFeiraDB');
db.version(6).stores({
  produtos: 'id, nome, preco, custo, estoque, categoria, synced, user_id',
  vendas: 'id, nomeProduto, valor, quantidade, formaPagamento, data, hora, cliente, synced, user_id',
  resumos: 'id, data, total, totalPix, totalDinheiro, totalCartao, quantidadeVendas, totalCustos, synced, user_id',
  despesas: 'id, descricao, valor, categoria, data, synced, user_id',
  configuracao: 'id, nomeBarraca, synced, user_id',
  profiles: 'id, plan, subscription_status'
});
