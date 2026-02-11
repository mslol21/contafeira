import Dexie from 'dexie';

export const db = new Dexie('ContaFeiraDB');

db.version(3).stores({
  produtos: 'id, nome, preco, synced, user_id',
  vendas: 'id, nomeProduto, valor, quantidade, formaPagamento, data, hora, synced, user_id',
  resumos: 'id, data, total, totalPix, totalDinheiro, totalCartao, quantidadeVendas, synced, user_id',
  configuracao: 'id, nomeBarraca, synced, user_id'
});

// Helper functions for DB operations
export const initDB = async () => {
  const config = await db.configuracao.toArray();
  return config.length > 0;
};
