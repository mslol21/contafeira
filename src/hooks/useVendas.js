import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

export function useVendas() {
  const today = new Date().toISOString().split('T')[0];
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
  }, []);
  
  const vendasHoje = useLiveQuery(() => 
    userId ? db.vendas.where({ data: today, user_id: userId }).toArray() : [],
    [userId, today]
  );

  const registrarVenda = async (produto, formaPagamento, quantidade = 1, cliente = null) => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    const venda = {
      id: uuidv4(),
      nomeProduto: produto.nome,
      valor: produto.preco * quantidade,
      quantidade,
      formaPagamento,
      cliente,
      data: today,
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      user_id: user.id,
      synced: 0
    };

    await db.vendas.add(venda);

    // Decrement stock
    const dbProd = await db.produtos.get(produto.id);
    if (dbProd && dbProd.estoque !== null && !isNaN(dbProd.estoque)) {
      await db.produtos.update(produto.id, { 
        estoque: dbProd.estoque - quantidade
      });
    }
  };

  const encerrarDia = async () => {
    if (!vendasHoje || vendasHoje.length === 0) return;
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
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

    // Calculate total costs for the summary
    const produtos = await db.produtos.where('user_id').equals(user.id).toArray();
    const totalCustos = vendasHoje.reduce((acc, v) => {
      const prod = produtos.find(p => p.nome === v.nomeProduto);
      return acc + ((prod?.custo || 0) * v.quantidade);
    }, 0);

    const resumo = {
      id: uuidv4(),
      data: today,
      total,
      totalPix,
      totalDinheiro,
      totalCartao,
      totalCustos,
      quantidadeVendas: vendasHoje.length,
      user_id: user.id,
      synced: 0
    };

    await db.resumos.add(resumo);
    await db.vendas.where('data').equals(today).delete();
  };

  const cancelarVenda = async (vendaId) => {
    const venda = await db.vendas.get(vendaId);
    if (!venda) return;
    
    // Devolver ao estoque
    const produto = await db.produtos.where('nome').equals(venda.nomeProduto).first();
    if (produto && produto.estoque !== null) {
        await db.produtos.update(produto.id, {
            estoque: produto.estoque + venda.quantidade
        });
    }

    await db.vendas.delete(vendaId);
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
    cancelarVenda,
    encerrarDia,
    stats
  };
}
