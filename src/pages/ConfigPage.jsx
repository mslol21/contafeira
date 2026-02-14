import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useConfig } from '../hooks/useConfig';
import { Plus, Trash2, Store, Package, Tag, LogOut, ArrowUpCircle, Save } from 'lucide-react';
import UpsellModal from '../components/UpsellModal';
import { supabase } from '../lib/supabase';

export default function ConfigPage({ onUpgrade }) {
  const { config, saveConfig, loading } = useConfig();
  const [nomeBarraca, setNomeBarraca] = useState('');
  const [showUpsell, setShowUpsell] = useState(false);
  const [produtos, setProdutos] = useState([{ 
    id: uuidv4(), 
    nome: '', 
    preco: '', 
    custo: '', 
    estoque: '', 
    categoria: 'Geral' 
  }]);

  useEffect(() => {
    if (config) {
      setNomeBarraca(config.nomeBarraca || '');
    }
  }, [config]);

  const profile = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user_profile') || '{}');
    } catch {
      return {};
    }
  }, []);

  const isPro = profile.plan?.includes('pro');

  const addProduto = () => {
    if (!isPro && produtos.length >= 15) {
      setShowUpsell(true);
      return;
    }
    setProdutos([...produtos, { id: uuidv4(), nome: '', preco: '', custo: '', estoque: '', categoria: 'Geral' }]);
  };

  const removeProduto = (id) => setProdutos(produtos.filter(p => p.id !== id));

  const updateProduto = (id, field, value) => {
    setProdutos(produtos.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nomeBarraca || produtos.some(p => !p.nome || !p.preco)) {
      alert('Preencha os campos obrigatórios (Nome e Preço).');
      return;
    }
    
    const formatted = produtos.map(p => ({
      ...p,
      preco: parseFloat(p.preco) || 0,
      custo: parseFloat(p.custo) || 0,
      estoque: p.estoque !== '' ? parseInt(p.estoque) : null
    }));

    await saveConfig(nomeBarraca, formatted);
    window.location.reload();
  };

  const handleLogout = async () => {
     await supabase.auth.signOut();
     window.location.reload();
  };

  if (loading) return <div className="flex items-center justify-center h-screen font-black text-[#4CAF50] animate-pulse">CARREGANDO...</div>;

  return (
    <div className="max-w-md mx-auto p-6 font-['Outfit'] pb-24">
      {showUpsell && (
        <UpsellModal trigger="Limite de Produtos" onClose={() => setShowUpsell(false)} onUpgrade={onUpgrade} />
      )}

      <header className="text-center mb-10 pt-4 relative">
        <button onClick={handleLogout} className="absolute top-4 right-0 p-2 text-red-400 hover:text-red-500"><LogOut size={20}/></button>
        <div className="flex justify-center mb-4 text-white">
           <Store size={48} className="text-[#4CAF50]" />
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Configuração de Inventário</p>
        {!isPro && (
          <div className="mt-4 px-4 py-2 bg-gray-100 rounded-2xl inline-block">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{produtos.length} / 15 Produtos</p>
            <div className="w-32 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
               <div className="bg-[#4CAF50] h-full" style={{ width: `${(produtos.length / 15) * 100}%` }}></div>
            </div>
          </div>
        )}
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50">
          <label className="text-[10px] font-black text-[#4CAF50] uppercase tracking-widest mb-3 block">Nome da Barraca / Negócio</label>
          <input
            type="text"
            required
            className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-lg outline-none focus:ring-2 focus:ring-[#4CAF50]/20 text-gray-900 placeholder:text-gray-300"
            placeholder="Minha Lojinha"
            value={nomeBarraca}
            onChange={(e) => setNomeBarraca(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Catálogo de Produtos</h3>
            {isPro && <span className="text-[9px] font-black text-[#4CAF50] bg-green-50 px-2 py-1 rounded-md uppercase tracking-widest">Plano Pro Liberado</span>}
          </div>

          {produtos.map((p, index) => (
            <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm space-y-4 relative group animate-in zoom-in-95 duration-200">
               <button type="button" onClick={() => removeProduto(p.id)} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
               
               <div className="pr-10">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Produto #{index+1}</p>
                 <input 
                    type="text" 
                    required 
                    placeholder="Ex: Pastel de Carne" 
                    className="w-full p-3 bg-gray-50 rounded-xl font-black text-gray-900 placeholder:text-gray-300" 
                    value={p.nome} 
                    onChange={(e) => updateProduto(p.id, 'nome', e.target.value)} 
                 />
               </div>

               <div className="grid grid-cols-2 gap-3">
                 <div>
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Preço Venda</p>
                   <input 
                    type="number" 
                    step="0.01" 
                    required 
                    placeholder="R$ 0,00" 
                    className="w-full p-3 bg-gray-50 rounded-xl font-bold text-orange-500 placeholder:text-orange-200" 
                    value={p.preco} 
                    onChange={(e) => updateProduto(p.id, 'preco', e.target.value)} 
                   />
                 </div>
                 <div>
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Custo (Opcional)</p>
                   <input 
                    type="number" 
                    step="0.01" 
                    placeholder="R$ 0,00" 
                    className="w-full p-3 bg-gray-50 rounded-xl font-bold text-red-500 placeholder:text-red-200" 
                    value={p.custo} 
                    onChange={(e) => updateProduto(p.id, 'custo', e.target.value)} 
                   />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                 <div>
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Estoque</p>
                   <input 
                    type="number" 
                    placeholder="0" 
                    className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-900 placeholder:text-gray-300" 
                    value={p.estoque} 
                    onChange={(e) => updateProduto(p.id, 'estoque', e.target.value)} 
                   />
                 </div>
                 <div>
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Categoria</p>
                   <select 
                    className="w-full p-3 bg-gray-50 rounded-xl font-bold text-sm text-gray-900" 
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

          <button type="button" onClick={addProduto} className="w-full p-5 border-4 border-dashed border-gray-100 rounded-[2.5rem] text-gray-300 font-black hover:border-[#FF9800]/30 hover:text-[#FF9800] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
            <Plus size={20} /> Adicionar Produto
          </button>
        </div>

        <button type="submit" className="w-full bg-[#4CAF50] text-white font-black py-6 rounded-[2.5rem] shadow-xl shadow-[#4CAF50]/20 active:scale-95 transition-all text-xl uppercase tracking-widest flex items-center justify-center gap-3">
          <Save size={24} /> Salvar Tudo
        </button>
      </form>
    </div>
  );
}
