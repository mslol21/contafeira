import React from 'react';
import { Rocket, X, Check } from 'lucide-react';

export default function UpsellModal({ onClose, onUpgrade, trigger }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 border-4 border-[#4CAF50]">
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4CAF50]/10 rounded-bl-[100%] -mr-10 -mt-10 z-0"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#FF9800]/10 rounded-tr-[100%] -ml-10 -mb-10 z-0"></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-50 rounded-full text-gray-400 hover:bg-gray-100 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-[#e8f5e9] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Rocket size={40} className="text-[#4CAF50]" />
          </div>

          <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight">
            Desbloqueie o <span className="text-[#4CAF50]">Poder Total</span>!
          </h3>
          
          <p className="text-gray-500 font-medium mb-8 text-sm px-2">
            O recurso <span className="font-bold text-gray-800">"{trigger || 'selecionado'}"</span> é exclusivo do Plano Profissional.
          </p>

          <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-left space-y-3 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-[#4CAF50] p-1 rounded-full text-white">
                 <Check size={10} strokeWidth={4} />
              </div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Produtos Ilimitados</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-[#4CAF50] p-1 rounded-full text-white">
                 <Check size={10} strokeWidth={4} />
              </div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Backup na Nuvem</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-[#4CAF50] p-1 rounded-full text-white">
                 <Check size={10} strokeWidth={4} />
              </div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Controle de Estoque</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-[#4CAF50] p-1 rounded-full text-white">
                 <Check size={10} strokeWidth={4} />
              </div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Dashboard Completo</span>
            </div>
          </div>

          <button
            onClick={onUpgrade}
            className="w-full py-4 bg-[#4CAF50] text-white rounded-[2rem] font-black shadow-lg shadow-[#4CAF50]/30 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <Rocket size={18} />
            Quero Ser Profissional
          </button>
          
          <button 
             onClick={onClose}
             className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600"
          >
             Continuar no Básico
          </button>
        </div>
      </div>
    </div>
  );
}
