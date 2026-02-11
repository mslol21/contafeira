import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useConfig } from '../hooks/useConfig';
import { Plus, Trash2, Store } from 'lucide-react';

export default function ConfigPage() {
  const { saveConfig } = useConfig();
  const [nomeBarraca, setNomeBarraca] = useState('');
  const [produtos, setProdutos] = useState([{ id: uuidv4(), nome: '', preco: '' }]);

  const addProduto = () => {
    if (produtos.length < 10) {
      setProdutos([...produtos, { id: uuidv4(), nome: '', preco: '' }]);
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
      preco: parseFloat(p.preco)
    }));

    await saveConfig(nomeBarraca, produtosFormatados);
    window.location.reload();
  };

  return (
    <div className="max-w-md mx-auto p-6 fade-in">
      <header className="text-center mb-8 pt-4">
        <div className="flex items-center justify-center mb-4">
          <img src="/logo.png" alt="ContaFeira Logo" className="w-56 h-auto drop-shadow-xl" />
        </div>
        <p className="text-gray-500 font-medium mt-1">Simples. Rápido. Offline.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-[#4CAF50] mb-2 uppercase tracking-widest pl-1">
            Nome da Barraca
          </label>
          <input
            type="text"
            required
            className="w-full p-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-[#4CAF50] focus:ring-4 focus:ring-[#4CAF50]/5 transition-all text-lg shadow-sm outline-none text-gray-900"
            placeholder="Ex: Pastel da Maria"
            value={nomeBarraca}
            onChange={(e) => setNomeBarraca(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#4CAF50] mb-2 uppercase tracking-widest pl-1">
            Seus Produtos
          </label>
          <div className="space-y-3">
            {produtos.map((p, index) => (
              <div key={p.id} className="flex gap-2 items-start bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Produto"
                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#FF9800] outline-none text-gray-900"
                    value={p.nome}
                    onChange={(e) => updateProduto(p.id, 'nome', e.target.value)}
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0,00"
                      className="w-full p-3 pl-10 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#FF9800] outline-none text-gray-900 font-bold"
                      value={p.preco}
                      onChange={(e) => updateProduto(p.id, 'preco', e.target.value)}
                    />
                  </div>
                </div>
                {produtos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProduto(p.id)}
                    className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={24} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {produtos.length < 10 && (
            <button
              type="button"
              onClick={addProduto}
              className="w-full mt-4 p-4 border-2 border-dashed border-[#FF9800]/30 rounded-2xl text-[#FF9800] font-bold hover:bg-[#FF9800]/5 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={24} />
              Adicionar Novo
            </button>
          )}
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
