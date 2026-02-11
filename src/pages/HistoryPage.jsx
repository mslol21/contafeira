import React from 'react';
import { useHistorico } from '../hooks/useHistorico';
import { ArrowLeft, Calendar, TrendingUp, DollarSign, ShoppingBag, CreditCard } from 'lucide-react';

export default function HistoryPage({ onBack }) {
  const { historico, loading } = useHistorico();

  const formatCurrency = (val) => {
    return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#FAFAFA] font-['Outfit']">
      <header className="bg-white p-6 border-b border-gray-100 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-3 border border-gray-100 rounded-2xl text-[#4CAF50] hover:bg-[#4CAF50]/5 active:scale-90 transition-all shadow-sm"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-black text-gray-800 tracking-tight">Registro Anterior</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-20">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4CAF50]"></div>
          </div>
        ) : historico?.length === 0 ? (
          <div className="text-center py-24 px-8">
            <div className="bg-white w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-[#8BC34A] shadow-lg shadow-[#8BC34A]/10 border border-[#8BC34A]/20">
              <Calendar size={48} />
            </div>
            <p className="text-gray-600 font-black text-lg">Sem registros</p>
            <p className="text-gray-400 text-sm mt-1 font-medium">Suas vendas encerradas aparecerão aqui.</p>
          </div>
        ) : (
          historico.map((item) => (
            <div key={item.id} className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-50 fade-in relative overflow-hidden group hover:shadow-xl hover:shadow-green-900/5 transition-all">
              <div className="absolute top-0 right-0 p-5">
                <div className="bg-[#4CAF50]/10 text-[#4CAF50] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#4CAF50]/10">
                  {item.quantidadeVendas} vendas
                </div>
              </div>

              <div className="flex items-center gap-3 text-[#4CAF50] font-black mb-10">
                <div className="w-10 h-10 bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#4CAF50]/20">
                  <Calendar size={20} />
                </div>
                <span className="text-xl tracking-tight">{formatDate(item.data)}</span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#4CAF50]"></div>
                    <span className="font-bold text-gray-400 text-[10px] uppercase tracking-widest">Pix</span>
                  </div>
                  <span className="font-bold text-gray-800 text-sm">{formatCurrency(item.totalPix)}</span>
                </div>

                <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#FF9800]"></div>
                    <span className="font-bold text-gray-400 text-[10px] uppercase tracking-widest">Dinheiro</span>
                  </div>
                  <span className="font-bold text-gray-800 text-sm">{formatCurrency(item.totalDinheiro)}</span>
                </div>

                <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="font-bold text-gray-400 text-[10px] uppercase tracking-widest">Cartão</span>
                  </div>
                  <span className="font-bold text-gray-800 text-sm">{formatCurrency(item.totalCartao)}</span>
                </div>

                <div className="mt-4 bg-gradient-to-r from-[#4CAF50] to-[#8BC34A] p-7 rounded-[2.5rem] flex justify-between items-end text-white shadow-2xl shadow-[#4CAF50]/30 transform group-hover:scale-[1.02] transition-transform">
                  <div>
                    <span className="font-black text-[10px] uppercase tracking-[0.3em] opacity-80 mb-1 block">Total Consolidado</span>
                    <span className="text-3xl font-black drop-shadow-sm">{formatCurrency(item.total)}</span>
                  </div>
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                    <TrendingUp size={24} />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
