import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useConfig } from '../hooks/useConfig';
import { Plus, Trash2, Store, Package, Tag, LogOut } from 'lucide-react';

export default function ConfigPage() {
  const { saveConfig } = useConfig();
  const [nomeBarraca, setNomeBarraca] = useState('');
  const [produtos, setProdutos] = useState([{ 
    id: uuidv4(), 
    nome: '', 
    preco: '', 
    custo: '', 
    estoque: '', 
    categoria: 'Geral' 
  }]);

  const addProduto = () => {
    if (produtos.length < 30) {
      setProdutos([...produtos, { 
        id: uuidv4(), 
        nome: '', 
        preco: '', 
        custo: '', 
        estoque: '', 
        categoria: 'Geral' 
      }]);
    }
  };

  const removeProduto = (id) => {
    setProdutos(produtos.filter(p => p.id !== id));
  };

  const updateProduto = (id, field, value) => {
    setProdutos(produtos.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nomeBarraca || produtos.some(p => !p.nome || !p.preco)) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    const produtosFormatados = produtos.map(p => ({
      ...p,
      preco: parseFloat(p.preco),
      custo: parseFloat(p.custo) || 0,
      estoque: p.estoque !== '' ? parseInt(p.estoque) : null
    }));

    await saveConfig(nomeBarraca, produtosFormatados);
    window.location.reload();
  };

  return (
    <div className="max-w-md mx-auto p-6 fade-in pb-24">
      <header className="text-center mb-8 pt-4 relative">
        <div className="absolute top-0 right-0">
            <button 
              onClick={() => {
                import('../lib/supabase').then(({ supabase }) => {
                  supabase.auth.signOut().then(() => window.location.reload());
                });
              }}
              className="p-2 text-red-300 hover:text-red-500 transition-colors"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
        </div>
        <div className="flex items-center justify-center mb-4">
          <img src="/logo.png" alt="ContaFeira Logo" className="w-56 h-auto drop-shadow-xl" />
        </div>
        <p className="text-gray-500 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Gestão Profissional de Inventário</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          <label className="block text-xs font-black text-[#4CAF50] mb-3 uppercase tracking-widest pl-1 flex items-center gap-2">
            <Store size={14} /> Nome do seu Negócio
          </label>
          <input
            type="text"
            required
            className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-[#4CAF50]/10 transition-all text-lg font-bold outline-none text-gray-900"
            placeholder="Ex: Pastelaria do João"
            value={nomeBarraca}
            onChange={(e) => setNomeBarraca(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <label className="text-xs font-black text-[#4CAF50] uppercase tracking-widest flex items-center gap-2">
              <Package size={14} /> Seus Produtos & Estoque
            </label>
          </div>
          
          <div className="space-y-4">
            {produtos.map((p, index) => (
              <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gray-50 flex items-center justify-center rounded-bl-[2rem]">
                  {produtos.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeProduto(p.id)}
                      className="text-red-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  ) : (
                    <span className="text-gray-300 font-black text-xs">#{index + 1}</span>
                  )}
                </div>
                
                <div className="pr-12">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome do Item</span>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pastel de Queijo"
                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#4CAF50] outline-none text-gray-900 font-black"
                    value={p.nome}
                    onChange={(e) => updateProduto(p.id, 'nome', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Preço Venda</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="0,00"
                        className="w-full p-3 pl-8 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#FF9800] outline-none text-gray-900 font-bold"
                        value={p.preco}
                        onChange={(e) => updateProduto(p.id, 'preco', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Custo Produção</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        className="w-full p-3 pl-8 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-red-400 outline-none text-gray-900 font-bold text-red-600"
                        value={p.custo}
                        onChange={(e) => updateProduto(p.id, 'custo', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Estoque Inicial</span>
                    <input
                      type="number"
                      placeholder="∞"
                      className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-400 outline-none text-gray-900 font-bold"
                      value={p.estoque}
                      onChange={(e) => updateProduto(p.id, 'estoque', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Categoria</span>
                    <select
                      className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-gray-300 outline-none text-gray-900 font-bold text-sm appearance-none"
                      value={p.categoria}
                      onChange={(e) => updateProduto(p.id, 'categoria', e.target.value)}
                    >
                      <option value="Geral">Geral</option>
                      <option value="Comida">Comida</option>
                      <option value="Bebida">Bebida</option>
                      <option value="Fruta">Fruta</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addProduto}
            className="w-full mt-2 p-5 border-4 border-dashed border-gray-100 rounded-[2.5rem] text-gray-300 font-black hover:border-[#FF9800]/20 hover:text-[#FF9800] hover:bg-[#FF9800]/5 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
          >
            <Plus size={20} /> ADICIONAR ITEM AO CARDÁPIO
          </button>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            className="w-full bg-[#4CAF50] text-white font-black py-6 rounded-[2.5rem] shadow-2xl shadow-[#4CAF50]/30 hover:bg-[#43A047] active:scale-95 transition-all text-xl"
          >
            SOLTAR O CAIXA 🚀
          </button>
        </div>
      </form>
    </div>
  );
}
