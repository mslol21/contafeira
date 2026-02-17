import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDB } from '../db/db';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

export function useVendas() {
  const [userId, setUserId] = useState(null);
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
  }, []);
  
  const userDB = getDB(userId);

  // Vendas do dia atual que ainda NÃO foram arquivadas num resumo
  const vendasHoje = useLiveQuery(() => 
    userId ? userDB.vendas.where({ data: today }).filter(v => !v.resumo_id).toArray() : [],
    [userId, today]
  );

  const registrarVenda = useCallback(async (produto, formaPagamento, quantidade = 1, cliente = null) => {
    if (!userId) return;
    const now = new Date().toISOString();
    const dbInstance = getDB(userId);

    const venda = {
      id: uuidv4(),
      nomeProduto: produto.nome,
      valor: produto.preco * quantidade,
      quantidade,
      formaPagamento,
      cliente,
      data: today,
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      user_id: userId,
      synced: 0,
      updated_at: now,
      resumo_id: null // Ainda não arquivado
    };

    await dbInstance.vendas.add(venda);

    // Gestão de Estoque
    const dbProd = await dbInstance.produtos.get(produto.id);
    if (dbProd && dbProd.estoque !== null) {
      await dbInstance.produtos.update(produto.id, { 
        estoque: dbProd.estoque - quantidade,
        updated_at: now,
        synced: 0
      });
    }
  }, [userId, today]);

  const encerrarDia = useCallback(async () => {
    if (!vendasHoje || vendasHoje.length === 0 || !userId) return;
    
    const now = new Date().toISOString();
    const dbInstance = getDB(userId);
    const resumoId = uuidv4();

    // Consolidação
    const total = vendasHoje.reduce((acc, v) => acc + v.valor, 0);
    const totalPix = vendasHoje.filter(v => v.formaPagamento === 'pix').reduce((acc, v) => acc + v.valor, 0);
    const totalDinheiro = vendasHoje.filter(v => v.formaPagamento === 'dinheiro').reduce((acc, v) => acc + v.valor, 0);
    const totalCartao = vendasHoje.filter(v => v.formaPagamento === 'cartao').reduce((acc, v) => acc + v.valor, 0);

    const produtos = await dbInstance.produtos.toArray();
    const totalCustos = vendasHoje.reduce((acc, v) => {
      const prod = produtos.find(p => p.nome === v.nomeProduto);
      return acc + ((prod?.custo || 0) * v.quantidade);
    }, 0);

    const resumo = {
      id: resumoId,
      data: today,
      total,
      totalPix,
      totalDinheiro,
      totalCartao,
      totalCustos,
      quantidadeVendas: vendasHoje.length,
      user_id: userId,
      synced: 0,
      updated_at: now
    };

    await dbInstance.resumos.add(resumo);

    // Em vez de deletar, marcamos como arquivado. 
    // Isso garante que os registros individuais sejam sincronizados para relatórios detalhados no futuro.
    await dbInstance.vendas.where({ data: today }).modify({ resumo_id: resumoId, updated_at: now, synced: 0 });
  }, [vendasHoje, userId, today]);

  const cancelarVenda = useCallback(async (vendaId) => {
    if (!userId) return;
    const dbInstance = getDB(userId);
    const now = new Date().toISOString();
    
    const venda = await dbInstance.vendas.get(vendaId);
    if (!venda) return;
    
    const produto = await dbInstance.produtos.where('nome').equals(venda.nomeProduto).first();
    if (produto && produto.estoque !== null) {
        await dbInstance.produtos.update(produto.id, {
            estoque: produto.estoque + venda.quantidade,
            updated_at: now,
            synced: 0
        });
    }

    await dbInstance.vendas.delete(vendaId);
  }, [userId]);

  const stats = useMemo(() => ({
    total: vendasHoje?.reduce((acc, v) => acc + v.valor, 0) || 0,
    totalPix: vendasHoje?.filter(v => v.formaPagamento === 'pix').reduce((acc, v) => acc + v.valor, 0) || 0,
    totalDinheiro: vendasHoje?.filter(v => v.formaPagamento === 'dinheiro').reduce((acc, v) => acc + v.valor, 0) || 0,
    totalCartao: vendasHoje?.filter(v => v.formaPagamento === 'cartao').reduce((acc, v) => acc + v.valor, 0) || 0,
    quantidade: vendasHoje?.reduce((acc, v) => acc + (v.quantidade || 1), 0) || 0,
    numVendas: vendasHoje?.length || 0
  }), [vendasHoje]);

  return {
    vendasHoje,
    registrarVenda,
    cancelarVenda,
    encerrarDia,
    updateEstoque: async (produtoId, novoEstoque) => {
      if (!userId) return;
      const dbInstance = getDB(userId);
      await dbInstance.produtos.update(produtoId, { 
        estoque: parseInt(novoEstoque), 
        updated_at: new Date().toISOString(),
        synced: 0 
      });
    },
    stats
  };
}
