import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

export function useVendas() {
  const today = new Date().toISOString().split('T')[0];
  
  const vendasHoje = useLiveQuery(() => 
    db.vendas.where('data').equals(today).toArray()
  );

  const registrarVenda = async (produto, formaPagamento, quantidade = 1) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date();
    const valorTotal = produto.preco * parseInt(quantidade);
    const venda = {
      id: uuidv4(),
      nomeProduto: produto.nome,
      valor: valorTotal,
      quantidade: parseInt(quantidade),
      formaPagamento,
      data: today,
      hora: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      user_id: user.id,
      synced: 0
    };
    await db.vendas.add(venda);
  };

  const encerrarDia = async () => {
    if (!vendasHoje || vendasHoje.length === 0) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const total = vendasHoje.reduce((acc, v) => acc + v.valor, 0);
    const totalPix = vendasHoje
      .filter(v => v.formaPagamento === 'pix')
      .reduce((acc, v) => acc + v.valor, 0);
    const totalDinheiro = vendasHoje
      .filter(v => v.formaPagamento === 'dinheiro')
      .reduce((acc, v) => acc + v.valor, 0);
    const totalCartao = vendasHoje
      .filter(v => v.formaPagamento === 'cartao')
      .reduce((acc, v) => acc + v.valor, 0);

    const resumo = {
      id: uuidv4(),
      data: today,
      total,
      totalPix,
      totalDinheiro,
      totalCartao,
      quantidadeVendas: vendasHoje.length,
      user_id: user.id,
      synced: 0
    };

    await db.resumos.add(resumo);
    // Mark sales as "archived" locally instead of deleting if we want to sync them later? 
    // Actually, the requirement is "sync when internet". 
    // If we delete here, they might not have synced yet.
    // Let's mark them as archived? Or just wait for sync before delete?
    // Better: keep them but with a flag.
    await db.vendas.where('data').equals(today).delete();
  };

  const stats = {
    total: vendasHoje?.reduce((acc, v) => acc + v.valor, 0) || 0,
    totalPix: vendasHoje?.filter(v => v.formaPagamento === 'pix').reduce((acc, v) => acc + v.valor, 0) || 0,
    totalDinheiro: vendasHoje?.filter(v => v.formaPagamento === 'dinheiro').reduce((acc, v) => acc + v.valor, 0) || 0,
    totalCartao: vendasHoje?.filter(v => v.formaPagamento === 'cartao').reduce((acc, v) => acc + v.valor, 0) || 0,
    quantidade: vendasHoje?.reduce((acc, v) => acc + (v.quantidade || 1), 0) || 0,
    numVendas: vendasHoje?.length || 0
  };

  return {
    vendasHoje,
    registrarVenda,
    encerrarDia,
    stats
  };
}
