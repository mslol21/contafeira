import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useConfig } from '../hooks/useConfig';
import { Plus, Trash2, Store } from 'lucide-react';

export default function ConfigPage() {
  const { saveConfig } = useConfig();
  const [nomeBarraca, setNomeBarraca] = useState('');
  const [produtos, setProdutos] = useState([{ id: uuidv4(), nome: '', preco: '', custo: '' }]);

  const addProduto = () => {
    if (produtos.length < 20) {
      setProdutos([...produtos, { id: uuidv4(), nome: '', preco: '', custo: '' }]);
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
      alert('Por favor, preencha todos os campos.');
      return;
    }
    
    const produtosFormatados = produtos.map(p => ({
      ...p,
      preco: parseFloat(p.preco),
      custo: parseFloat(p.custo) || 0
    }));

    await saveConfig(nomeBarraca, produtosFormatados);
    window.location.reload();
  };

  return (
    <div className="max-w-md mx-auto p-6 fade-in pb-24">
      <header className="text-center mb-8 pt-4">
        <div className="flex items-center justify-center mb-4">
          <img src="/logo.png" alt="ContaFeira Logo" className="w-56 h-auto drop-shadow-xl" />
        </div>
        <p className="text-gray-500 font-medium mt-1">Configuração Profissional de Vendas</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-black text-[#4CAF50] mb-2 uppercase tracking-widest pl-1">
            Nome do seu Negócio
          </label>
          <input
            type="text"
            required
            className="w-full p-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-[#4CAF50] focus:ring-4 focus:ring-[#4CAF50]/5 transition-all text-lg shadow-sm outline-none text-gray-900"
            placeholder="Ex: Pastelaria do João"
            value={nomeBarraca}
            onChange={(e) => setNomeBarraca(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-black text-[#4CAF50] mb-2 uppercase tracking-widest pl-1">
            Produtos & Custos
          </label>
          <div className="space-y-4">
            {produtos.map((p, index) => (
              <div key={p.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                <div className="flex justify-between items-center bg-gray-50 -mx-5 -mt-5 p-4 py-2 rounded-t-3xl mb-2 border-b border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Item #{index + 1}</span>
                  {produtos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProduto(p.id)}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                
                <input
                  type="text"
                  required
                  placeholder="Nome do Produto"
                  className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#4CAF50] outline-none text-gray-900 font-bold"
                  value={p.nome}
                  onChange={(e) => updateProduto(p.id, 'nome', e.target.value)}
                />

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
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Custo Unid.</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        className="w-full p-3 pl-8 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-red-400 outline-none text-gray-900 font-bold"
                        value={p.custo}
                        onChange={(e) => updateProduto(p.id, 'custo', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addProduto}
            className="w-full mt-4 p-4 border-2 border-dashed border-[#FF9800]/30 rounded-2xl text-[#FF9800] font-black hover:bg-[#FF9800]/5 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={24} />
            ADICIONAR ITEM
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-[#4CAF50] text-white font-black py-5 rounded-[2rem] shadow-xl shadow-[#4CAF50]/20 hover:bg-[#43A047] active:scale-95 transition-all text-xl mt-4"
        >
          Iniciar Atividade
        </button>
      </form>
    </div>
  );
}
