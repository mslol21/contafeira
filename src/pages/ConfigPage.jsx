import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useConfig } from '../hooks/useConfig';
import { Plus, Trash2, Store, Package, Tag, LogOut, ArrowUpCircle } from 'lucide-react';
import UpsellModal from '../components/UpsellModal';

export default function ConfigPage() {
  const { saveConfig } = useConfig();
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

  // Get plan from local storage to work offline
  const getPlan = () => {
    try {
      const profile = JSON.parse(localStorage.getItem('user_profile') || '{}');
      return profile.plan || 'essencial';
    } catch {
      return 'essencial';
    }
  };

  const isPro = getPlan() === 'pro cloud' || getPlan() === 'pro';

  const addProduto = () => {
    // Limit for Essential plan
    if (!isPro && produtos.length >= 15) {
      setShowUpsell(true);
      return;
    }

    // Safety limit for local performance if needed, but Pro should be unlimited (let's say 1000 for sanity or just allow)
    // The requirement says "Unlimited", so we remove the specific hard limit, or strict it to something huge.
    // Keeping a reasonable UI limit or just push.
    
    setProdutos([...produtos, { 
      id: uuidv4(), 
      nome: '', 
      preco: '', 
      custo: '', 
      estoque: '', 
      categoria: 'Geral' 
    }]);
  };

  const removeProduto = (id) => {
    setProdutos(produtos.filter(p => p.id !== id));
  };

  const updateProduto = (id, field, value) => {
    setProdutos(produtos.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleUpgrade = () => {
    // Reload to trigger plan check/payment flow or redirect
    // Since we are inside the app, we might need a way to go to Pricing. 
    // But currently App.jsx controls page based on profile status.
    // Use window.location to force App to re-evaluate or just clear profile?
    // Actually, usually user needs to pay via Pix.
    // As per user request: "Botão: [Atualizar Plano]".
    // For now, let's redirect to a payment contact or clear subscription status?
    // Best way: Force "expired" status locally to show PricingPage? No.
    // Let's reload page. If they are 'essencial', they need to go to 'PricingPage' to upgrade? 
    // App.jsx shows PricingPage only if !profile or expired.
    // If they have a profile with 'essencial', App shows SalesPage.
    // We need a way to trigger "Change Plan".
    // I will implementation a simple "contact support" or "clear plan" for now, 
    // but ideally we should have a "Upgrade" route. 
    // Given the constraints and current App.jsx, let's show an alert or open WhatsApp for upgrade if manual.
    // OR: Update local profile to trigger 'expired' state? Risky.
    
    // Simplest: Redirect to pricing by clearing profile? No, they lose data.
    // Let's just alert for now or link to support, as the current Auth flow is simple.
    // Wait, I can simulate "Plan Selection" by modifying the state in App ideally.
    // But I can't easily access App state here.
    // I'll reload window and maybe let them know.
    // Actually, real-world: user contacts admin. 
    // "Deseja atualizar agora? [Atualizar Plano]" -> Redirects to WhatsApp of Admin?
    window.open('https://wa.me/55NUMERO_DO_SUPORTE?text=Quero%20fazer%20o%20upgrade%20para%20o%20Plano%20Pro', '_blank');
    setShowUpsell(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nomeBarraca || produtos.some(p => !p.nome || !p.preco)) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    // Validate stock access for Essential?
    // Req: "Essential user trying to access stock... display modal".
    // Here we mainly INPUT stock. If they input stock, maybe we just save it locally?
    // Or do we block INPUT of stock? 
    // "Controle automático de estoque" is Pro.
    // Let's allow input but warn or just let it be. 
    // The "Access Stock" upsell might be better placed in Dashboard or Stock List view.
    
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
      {showUpsell && (
        <UpsellModal 
          trigger="Adicionar mais produtos" 
          onClose={() => setShowUpsell(false)} 
          onUpgrade={handleUpgrade} 
        />
      )}

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
        
        {!isPro && (
            <div className="mt-4 bg-gray-100 p-2 rounded-xl inline-block">
                <p className="text-xs text-gray-500 flex items-center gap-2">
                    Plano Essencial: <span className="font-bold text-gray-800">{produtos.length} / 15 produtos</span>
                </p>
                <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className="bg-[#4CAF50] h-full rounded-full transition-all" style={{ width: `${(produtos.length / 15) * 100}%` }}></div>
                </div>
            </div>
        )}
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
            {isPro && (
                <span className="text-[10px] bg-[#4CAF50]/10 text-[#4CAF50] px-2 py-1 rounded-md font-black uppercase">
                    PRO: Ilimitado
                </span>
            )}
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
                      placeholder={isPro ? "∞" : "Bloqueado"} // Optional visual limitation
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
