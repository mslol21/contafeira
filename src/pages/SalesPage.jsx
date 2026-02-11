import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useVendas } from '../hooks/useVendas';
import { CreditCard, Banknote, History, LogOut, TrendingUp, DollarSign } from 'lucide-react';

export default function SalesPage({ onShowHistory }) {
  const { stats, registrarVenda, encerrarDia } = useVendas();
  const produtos = useLiveQuery(() => db.produtos.toArray());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantidade, setQuantidade] = useState(1);

  const handleProductClick = (produto) => {
    setSelectedProduct(produto);
    setQuantidade(1);
  };

  const handlePayment = async (forma) => {
    if (selectedProduct) {
      await registrarVenda(selectedProduct, forma, quantidade);
      setSelectedProduct(null);
    }
  };

  const handleEncerrar = async () => {
    if (confirm('Deseja encerrar o dia? Os dados atuais serão salvos no histórico.')) {
      await encerrarDia();
    }
  };

  const formatCurrency = (val) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#FAFAFA] pb-safe font-['Outfit']">
      {/* Stats Header */}
      <div className="bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] p-6 pt-10 text-white rounded-b-[3.5rem] shadow-xl z-20">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.3em]">Balanço do Dia</p>
            <h2 className="text-4xl font-black mt-1 drop-shadow-sm">{formatCurrency(stats.total)}</h2>
          </div>
          <button 
            onClick={onShowHistory}
            className="p-3 bg-black/10 hover:bg-black/20 active:scale-90 rounded-2xl transition-all border border-white/20 backdrop-blur-sm"
          >
            <History size={24} />
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-1 pt-6 border-t border-white/20 mt-2">
          <div className="text-center">
            <p className="text-[9px] text-white/70 font-black uppercase tracking-widest mb-1">Pix</p>
            <p className="font-bold text-sm">{formatCurrency(stats.totalPix)}</p>
          </div>
          <div className="text-center border-x border-white/20">
            <p className="text-[9px] text-white/70 font-black uppercase tracking-widest mb-1">Dinheiro</p>
            <p className="font-bold text-sm">{formatCurrency(stats.totalDinheiro)}</p>
          </div>
          <div className="text-center border-r border-white/20">
            <p className="text-[9px] text-white/70 font-black uppercase tracking-widest mb-1">Cartão</p>
            <p className="font-bold text-sm">{formatCurrency(stats.totalCartao)}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-white/70 font-black uppercase tracking-widest mb-1">Itens</p>
            <p className="font-bold text-sm">{stats.quantidade}</p>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="flex items-center justify-between px-2 mb-1">
          <h3 className="text-[#4CAF50] font-black text-xs uppercase tracking-[0.2em]">Cardápio / Produtos</h3>
          <span className="w-12 h-1 bg-[#FF9800] rounded-full"></span>
        </div>
        <div className="grid grid-cols-1 gap-4 pb-8">
          {produtos?.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProductClick(p)}
              className="group flex flex-col justify-center bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 active:scale-[0.96] transition-all hover:border-[#4CAF50]/40 hover:shadow-lg min-h-[100px] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-[#4CAF50] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{p.nome}</span>
              <span className="text-3xl font-black text-[#FF9800]">{formatCurrency(p.preco)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-15px_40px_rgba(0,0,0,0.04)] rounded-t-[3rem]">
        <button
          onClick={handleEncerrar}
          disabled={stats.numVendas === 0}
          className="w-full bg-[#4CAF50] text-white font-black py-5 rounded-[2.2rem] flex items-center justify-center gap-3 shadow-lg shadow-[#4CAF50]/20 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale text-lg"
        >
          <LogOut size={22} />
          Fechar Caixa
        </button>
      </div>

      {/* Payment Selection Backdrop */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-[#000000]/70 backdrop-blur-lg z-50 flex items-end sm:items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-sm rounded-[3.5rem] p-8 fade-in relative overflow-hidden shadow-2xl border-t-8 border-[#4CAF50] my-auto">
            
            <div className="relative text-center">
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-2">Confirmar Venda</p>
              <h4 className="text-2xl font-black text-gray-900 mb-1">{selectedProduct.nome}</h4>
              <p className="text-[#FF9800] text-4xl font-black mb-6 drop-shadow-sm">{formatCurrency(selectedProduct.preco * quantidade)}</p>
              
              {/* Quantity Selector */}
              <div className="flex items-center justify-center gap-6 mb-8 bg-gray-50 p-4 rounded-[2rem]">
                <button 
                  onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                  className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-3xl font-black text-[#FF9800] active:scale-90 transition-all border border-gray-100"
                >
                  -
                </button>
                <div className="text-center min-w-[60px]">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Qtd</p>
                  <p className="text-3xl font-black text-gray-800">{quantidade}</p>
                </div>
                <button 
                  onClick={() => setQuantidade(quantidade + 1)}
                  className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-3xl font-black text-[#4CAF50] active:scale-90 transition-all border border-gray-100"
                >
                  +
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => handlePayment('pix')}
                  className="w-full bg-[#4CAF50] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 text-xl shadow-lg shadow-[#4CAF50]/20 active:scale-95 transition-all"
                >
                  <TrendingUp size={24} />
                  PIX
                </button>
                <button
                  onClick={() => handlePayment('dinheiro')}
                  className="w-full bg-[#FF9800] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 text-xl shadow-lg shadow-[#FF9800]/20 active:scale-95 transition-all"
                >
                  <DollarSign size={24} />
                  Dinheiro
                </button>
                <button
                  onClick={() => handlePayment('cartao')}
                  className="w-full bg-white text-[#4CAF50] font-black py-4 rounded-2xl flex items-center justify-center gap-3 text-xl border-4 border-[#4CAF50] active:scale-95 transition-all shadow-md"
                >
                  <CreditCard size={24} />
                  Cartão
                </button>
              </div>
              
              <button 
                  onClick={() => setSelectedProduct(null)}
                  className="mt-6 text-gray-300 font-black uppercase tracking-[0.3em] text-[10px] hover:text-gray-500 transition-colors"
              >
                  CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
