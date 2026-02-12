import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Package, PieChart, Download } from 'lucide-react';

export default function DashboardPage({ onBack }) {
  const resumos = useLiveQuery(() => db.resumos.orderBy('data').reverse().toArray());
  const produtos = useLiveQuery(() => db.produtos.toArray());

  const exportToCSV = () => {
    if (!resumos || resumos.length === 0) return;
    
    const headers = ['Data', 'Receita Bruta', 'Custos Producao', 'Lucro Liquido', 'Pix', 'Dinheiro', 'Cartao', 'Qtd Vendas'];
    const rows = resumos.map(r => [
      r.data,
      r.total.toFixed(2),
      (r.totalCustos || 0).toFixed(2),
      (r.total - (r.totalCustos || 0)).toFixed(2),
      r.totalPix.toFixed(2),
      r.totalDinheiro.toFixed(2),
      r.totalCartao.toFixed(2),
      r.quantidadeVendas
    ]);

    // Use semicolon as separator for better Excel compatibility in PT-BR
    const csvContent = [headers, ...rows].map(e => e.join(';')).join('\n');
    
    // Add UTF-8 BOM so Excel opens with correct characters
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_vendas_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val) => {
    return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const statsTotal = {
    receita: resumos?.reduce((acc, r) => acc + r.total, 0) || 0,
    custo: resumos?.reduce((acc, r) => acc + (r.totalCustos || 0), 0) || 0,
    lucro: 0
  };
  statsTotal.lucro = statsTotal.receita - statsTotal.custo;

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#FAFAFA] font-['Outfit']">
      <header className="bg-white p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 border border-gray-100 rounded-2xl text-[#4CAF50] hover:bg-[#4CAF50]/5 active:scale-90 transition-all shadow-sm"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Análise Geral</h1>
        </div>
        <button 
          onClick={exportToCSV}
          className="p-3 bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 active:scale-95 transition-all flex items-center gap-2"
          title="Exportar CSV"
        >
          <Download size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Exportar</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
        {/* Main Cards */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 flex items-center gap-5">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
              <TrendingUp size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Receita Total</p>
              <h3 className="text-2xl font-black text-gray-900">{formatCurrency(statsTotal.receita)}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 flex items-center gap-5">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-400">
              <TrendingDown size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Custo Acumulado</p>
              <h3 className="text-2xl font-black text-gray-900">{formatCurrency(statsTotal.custo)}</h3>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] p-8 rounded-[3rem] shadow-xl text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">Lucro Líquido</p>
                <h3 className="text-4xl font-black mt-1">{formatCurrency(statsTotal.lucro)}</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                <PieChart size={24} />
              </div>
            </div>
            <div className="w-full bg-black/10 h-2 rounded-full mt-6">
              <div 
                className="bg-white h-full rounded-full" 
                style={{ width: `${Math.min(100, (statsTotal.lucro / (statsTotal.receita || 1)) * 100)}%` }}
              ></div>
            </div>
            <p className="text-[10px] font-bold mt-2 white/60 uppercase tracking-widest text-right">
                Margem: {((statsTotal.lucro / (statsTotal.receita || 1)) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Insights Section */}
        <section className="space-y-4">
           <div className="flex items-center gap-2">
              <Package size={20} className="text-[#FF9800]" />
              <h4 className="text-gray-900 font-black uppercase text-xs tracking-widest">Desempenho por Item</h4>
           </div>
           
           <div className="space-y-3">
              {produtos?.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center group">
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{p.nome}</p>
                    <p className="text-lg font-black text-gray-800">{formatCurrency(p.preco)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Margem Unitária</p>
                    <span className="bg-green-50 text-green-600 text-[10px] font-black px-3 py-1 rounded-full border border-green-100">
                      {(((p.preco - (p.custo || 0)) / p.preco) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
           </div>
        </section>

        <section className="p-6 bg-[#FFEB3B]/10 rounded-3xl border border-[#FFEB3B]/30">
            <h5 className="text-[#8B7C00] font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                <DollarSign size={16} /> Dica de Lucro
            </h5>
            <p className="text-[#8B7C00] text-sm font-medium leading-relaxed">
                Seus itens com maior margem são os que mais geram lucro real. Tente oferecer combos com esses produtos!
            </p>
        </section>
      </div>
    </div>
  );
}
