import React, { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDB } from '../db/db';
import { supabase } from '../lib/supabase';
import { useVendas } from '../hooks/useVendas';
import { CreditCard, Banknote, History, LogOut, TrendingUp, DollarSign, PieChart, Share2, CheckCircle2, AlertTriangle, Layers, X, ArrowRight, Trash2 } from 'lucide-react';
import UpsellModal from '../components/UpsellModal';

// Hook para persistência de estado local
function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }
  }, [key, value]);

  return [value, setValue];
}

export default function SalesPage({ onShowHistory, onShowDashboard }) {
  const { stats, registrarVenda, cancelarVenda, encerrarDia, vendasHoje } = useVendas();
  
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
  }, []);

  const userDB = getDB(userId);

  const produtos = useLiveQuery(
    () => userId ? userDB.produtos.toArray() : [],
    [userId]
  );

  // Estados persistentes
  const [selectedProduct, setSelectedProduct] = useStickyState(null, 'sales_selectedProduct_v2');
  const [quantidade, setQuantidade] = useStickyState(1, 'sales_quantidade_v2');
  const [cliente, setCliente] = useStickyState('', 'sales_cliente_v2');
  const [clienteTelefone, setClienteTelefone] = useStickyState('', 'sales_clienteTelefone_v2');
  const [filterCategory, setFilterCategory] = useStickyState('Todas', 'sales_filterCategory_v2');
  const [lastSale, setLastSale] = useStickyState(null, 'sales_lastSale_v2');
  const [showDailyHistory, setShowDailyHistory] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellTrigger, setUpsellTrigger] = useState('Recurso Pro');

  const profile = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user_profile') || '{}');
    } catch {
      return {};
    }
  }, []);

  const isPro = profile.plan?.includes('pro');

  const categories = useMemo(() => {
    if (!produtos) return ['Todas'];
    const cats = new Set(produtos.map(p => p.category || p.categoria || 'Geral').filter(c => c !== 'Geral'));
    return ['Todas', ...(isPro ? ['Baixo Estoque'] : []), ...cats];
  }, [produtos, isPro]);

  const handleProductClick = (produto) => {
    setSelectedProduct(produto);
    setQuantidade(1);
    setCliente('');
    setClienteTelefone('');
    setLastSale(null);
  };
  
  const handleCancelarVenda = async (vendaId) => {
    if (confirm('Deseja cancelar esta venda?')) {
        await cancelarVenda(vendaId);
    }
  };

  const handlePayment = async (forma) => {
    if (forma === 'fiado' && !cliente) {
      alert('Para marcar como Fiado, digite o nome do cliente!');
      return;
    }

    if (selectedProduct) {
      await registrarVenda(selectedProduct, forma, quantidade, cliente);
      setLastSale({
        nome: selectedProduct.nome,
        total: selectedProduct.preco * quantidade,
        quantidade,
        forma,
        cliente
      });
      setSelectedProduct(null);
      setCliente('');
    }
  };

  const shareReceipt = () => {
    const dataHora = new Date().toLocaleString('pt-BR');
    let text = `🧾 *CONTA FEIRA* \n--------------------------\n📅 ${dataHora}\n\n*Item:* ${lastSale.nome}\n*Qtd:* ${lastSale.quantidade}\n*💰 Total:* R$ ${lastSale.total.toFixed(2)}\n*Pagamento:* ${lastSale.forma.toUpperCase()}`;
    if (lastSale.cliente) text += `\n*Cliente:* ${lastSale.cliente}`;
    text += `\n--------------------------\nObrigado pela preferência! 🍎`;

    let url = clienteTelefone 
        ? `https://wa.me/55${clienteTelefone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    
    window.open(url);
  };

  const handleEncerrar = async () => {
    if (confirm('Deseja encerrar o dia? Os dados atuais serão consolidados.')) {
      await encerrarDia();
    }
  };

  const handleLogout = async () => {
    if (confirm('Deseja sair da sua conta?')) {
      await supabase.auth.signOut();
      window.location.reload();
    }
  };

  const formatCurrency = (val) => {
    return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const filteredProducts = useMemo(() => {
    if (!produtos) return [];
    if (filterCategory === 'Todas') return produtos;
    if (filterCategory === 'Baixo Estoque') return produtos.filter(p => p.estoque !== null && p.estoque <= 5);
    return produtos.filter(p => (p.category || p.categoria) === filterCategory);
  }, [produtos, filterCategory]);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#FAFAFA] pb-safe font-['Outfit']">
      {showUpsell && (
        <UpsellModal trigger={upsellTrigger} onClose={() => setShowUpsell(false)} onUpgrade={() => window.open('https://wa.me/55NUMERO?text=Upgrade', '_blank')} />
      )}

      {/* Stats Header */}
      <div className="bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] p-6 pt-10 text-white rounded-b-[3.5rem] shadow-xl z-20">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.3em]">Balanço do Dia</p>
            <h2 className="text-4xl font-black mt-1 drop-shadow-sm">{formatCurrency(stats.total)}</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => isPro ? onShowDashboard() : setShowUpsell(true)} className="p-3 bg-black/10 rounded-2xl border border-white/20 backdrop-blur-sm"><PieChart size={24} /></button>
            <button onClick={onShowHistory} className="p-3 bg-black/10 rounded-2xl border border-white/20 backdrop-blur-sm"><History size={24} /></button>
            <button onClick={handleLogout} className="p-3 bg-red-500/20 rounded-2xl border border-white/10 backdrop-blur-sm text-red-100"><LogOut size={24} /></button>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-1 pt-6 border-t border-white/20 mt-2">
          <div className="text-center"><p className="text-[9px] text-white/70 font-black uppercase tracking-widest mb-1">Pix</p><p className="font-bold text-sm">{formatCurrency(stats.totalPix)}</p></div>
          <div className="text-center border-x border-white/20"><p className="text-[9px] text-white/70 font-black uppercase tracking-widest mb-1">Dinheiro</p><p className="font-bold text-sm">{formatCurrency(stats.totalDinheiro)}</p></div>
          <div className="text-center border-r border-white/20"><p className="text-[9px] text-white/70 font-black uppercase tracking-widest mb-1">Cartão</p><p className="font-bold text-sm">{formatCurrency(stats.totalCartao)}</p></div>
          <div className="text-center"><p className="text-[9px] text-white/70 font-black uppercase tracking-widest mb-1">Itens</p><p className="font-bold text-sm">{stats.quantidade}</p></div>
        </div>
      </div>

      {/* filters */}
      <div className="px-6 pt-6 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterCategory === cat ? 'bg-[#4CAF50] text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}>
            {cat === 'Baixo Estoque' ? <span className="flex items-center gap-1"><AlertTriangle size={12}/> {cat}</span> : cat}
          </button>
        ))}
        <button onClick={() => setShowDailyHistory(true)} className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all bg-white text-gray-400 border border-gray-100 flex items-center gap-1"><History size={12} /> Histórico Hoje ({stats.numVendas})</button>
      </div>

      {/* History Modal */}
      {showDailyHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm p-4 animate-in fade-in">
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                 <h3 className="text-xl font-black text-gray-800 flex items-center gap-2"><History size={24} className="text-[#4CAF50]" />Vendas de Hoje</h3>
                 <button onClick={() => setShowDailyHistory(false)} className="p-2 bg-gray-50 rounded-full text-gray-400"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                 {vendasHoje?.slice().reverse().map((venda) => (
                    <div key={venda.id} className="bg-gray-50 p-4 rounded-[1.5rem] flex justify-between items-center transition-all hover:bg-gray-100">
                       <div>
                          <p className="font-black text-gray-800 text-sm truncate max-w-[150px]">{venda.nomeProduto}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${venda.formaPagamento === 'pix' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>{venda.formaPagamento}</span>
                             <span className="text-[10px] text-gray-400 font-bold">{venda.hora}</span>
                          </div>
                       </div>
                       <div className="text-right flex items-center gap-3">
                          <p className="font-black text-gray-800">{formatCurrency(venda.valor)}</p>
                          <button onClick={() => handleCancelarVenda(venda.id)} className="p-2 text-red-400 hover:text-red-500"><Trash2 size={16}/></button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Products */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {lastSale && (
          <div className="bg-white p-5 rounded-[2.5rem] shadow-lg border border-[#4CAF50]/20 flex flex-col gap-3 animate-in slide-in-from-top">
            <div className="flex items-center gap-3"><CheckCircle2 className="text-[#4CAF50]" size={28} /><div><p className="text-[10px] font-black text-[#4CAF50] uppercase tracking-widest">Sucesso!</p><p className="font-bold text-sm">{lastSale.nome} ({formatCurrency(lastSale.total)})</p></div></div>
            <div className="flex gap-2">
              <input 
                type="tel" 
                placeholder="Telefone Cliente" 
                className="flex-1 p-3 bg-gray-50 rounded-xl text-xs font-bold text-gray-900 placeholder:text-gray-400" 
                value={clienteTelefone} 
                onChange={(e) => setClienteTelefone(e.target.value)} 
              />
              <button onClick={shareReceipt} className="bg-[#4CAF50] text-white px-4 rounded-xl shadow-lg flex items-center gap-2">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 pb-8">
          {filteredProducts.map((p) => (
            <button key={p.id} onClick={() => handleProductClick(p)} className="group flex flex-col justify-center bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 active:scale-[0.96] transition-all hover:border-[#4CAF50]/40 hover:shadow-lg min-h-[100px] relative overflow-hidden text-left">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#4CAF50] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{p.nome}</span>
                {isPro && p.estoque !== null && (
                  <span className={`text-[9px] font-black uppercase tracking-widest ${p.estoque <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-300'}`}>Estoque: {p.estoque}</span>
                )}
              </div>
              <div className="flex justify-between items-end"><span className="text-3xl font-black text-[#FF9800]">{formatCurrency(p.preco)}</span><span className="text-[10px] font-black text-gray-300 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md">{p.category || p.categoria || 'Geral'}</span></div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 bg-white border-t border-gray-100 rounded-t-[3rem] shadow-xl">
        <button onClick={handleEncerrar} disabled={stats.numVendas === 0} className="w-full bg-[#4CAF50] text-white font-black py-5 rounded-[2.2rem] flex items-center justify-center gap-3 shadow-lg shadow-[#4CAF50]/20 active:scale-95 disabled:opacity-30 text-lg uppercase tracking-widest">Fechar Caixa</button>
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3.5rem] p-8 relative shadow-2xl animate-in slide-in-from-bottom">
            <div className="text-center">
              <h4 className="text-2xl font-black text-gray-900 mb-1">{selectedProduct.nome}</h4>
              <p className="text-[#FF9800] text-4xl font-black mb-6">{formatCurrency(selectedProduct.preco * quantidade)}</p>
              
              <div className="flex items-center justify-center gap-6 mb-6 bg-gray-50 p-4 rounded-[2rem]">
                <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))} className="w-12 h-12 rounded-full shadow-md text-3xl font-black text-[#FF9800]">-</button>
                <div className="text-center min-w-[60px]"><p className="text-3xl font-black text-gray-800">{quantidade}</p></div>
                <button onClick={() => setQuantidade(quantidade + 1)} className="w-12 h-12 rounded-full shadow-md text-3xl font-black text-[#4CAF50]">+</button>
              </div>

              <input 
                type="text" 
                placeholder="Nome do Cliente" 
                className="w-full p-4 bg-gray-50 rounded-2xl text-center font-bold mb-6 text-gray-900 placeholder:text-gray-300" 
                value={cliente} 
                onChange={(e) => setCliente(e.target.value)} 
              />

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handlePayment('pix')} className="bg-[#4CAF50] text-white font-black py-4 rounded-2xl active:scale-95 transition-all">PIX</button>
                <button onClick={() => handlePayment('dinheiro')} className="bg-[#FF9800] text-white font-black py-4 rounded-2xl active:scale-95 transition-all">Dinheiro</button>
                <button onClick={() => handlePayment('cartao')} className="bg-blue-500 text-white font-black py-4 rounded-2xl active:scale-95 transition-all">Cartão</button>
                <button onClick={() => handlePayment('fiado')} className="border-2 border-dashed border-gray-300 font-black py-4 rounded-2xl text-gray-400 active:scale-95 transition-all">Fiado</button>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="mt-6 text-gray-300 font-black uppercase tracking-widest text-[10px]">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
