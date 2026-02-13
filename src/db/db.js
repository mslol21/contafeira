import Dexie from 'dexie';

export const db = new Dexie('ContaFeiraDB');

db.version(6).stores({
  produtos: 'id, nome, preco, custo, estoque, categoria, synced, user_id',
  vendas: 'id, nomeProduto, valor, quantidade, formaPagamento, data, hora, cliente, synced, user_id',
  resumos: 'id, data, total, totalPix, totalDinheiro, totalCartao, quantidadeVendas, totalCustos, synced, user_id',
  despesas: 'id, descricao, valor, categoria, data, synced, user_id',
  configuracao: 'id, nomeBarraca, synced, user_id',
  profiles: 'id, plan, subscription_status'
});

// Helper functions for DB operations
export const initDB = async () => {
  const config = await db.configuracao.toArray();
  return config.length > 0;
};
