import React from 'react';
import { Check, Star, Zap, Rocket, ShieldCheck } from 'lucide-react';

const plans = [
  {
    name: 'Essencial',
    price: '9,90',
    description: 'Para pequenos feirantes',
    features: ['Até 5 produtos', 'Vendas básicas', 'Suporte por e-mail'],
    color: 'gray',
    icon: Zap
  },
  {
    name: 'Profissional',
    price: '19,90',
    description: 'Mais vendido nas feiras',
    features: ['Produtos ilimitados', 'Histórico completo', 'Relatórios mensais', 'Suporte prioritário'],
    color: 'green',
    icon: Rocket,
    popular: true
  },
  {
    name: 'Master',
    price: '34,90',
    description: 'Gestão total do negócio',
    features: ['Tudo do Profissional', 'Sincronização em nuvem', 'Backup automático', 'Acesso multi-dispositivo'],
    color: 'orange',
    icon: Star
  }
];

export default function PricingPage({ onSelectPlan }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-['Outfit'] pb-20">
      <header className="pt-16 pb-12 text-center px-6">
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
          Sua feira num <span className="text-[#4CAF50]">próximo nível</span>
        </h1>
        <p className="text-gray-500 font-medium max-w-xs mx-auto">
          Escolha o plano ideal para organizar suas vendas hoje mesmo.
        </p>
      </header>

      <div className="px-6 space-y-6 max-w-md mx-auto">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={`relative bg-white rounded-[2.5rem] p-8 shadow-sm border-2 transition-all hover:shadow-xl ${
              plan.popular ? 'border-[#4CAF50] scale-[1.02]' : 'border-gray-100'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#4CAF50] text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                MAIS VENDIDO
              </div>
            )}

            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900">{plan.name}</h3>
                <p className="text-gray-400 text-sm font-medium">{plan.description}</p>
              </div>
              <div className={`p-4 rounded-3xl ${
                plan.color === 'green' ? 'bg-[#4CAF50]/10 text-[#4CAF50]' : 
                plan.color === 'orange' ? 'bg-[#FF9800]/10 text-[#FF9800]' : 'bg-gray-100 text-gray-400'
              }`}>
                <plan.icon size={28} />
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-gray-400 font-bold text-lg">R$</span>
                <span className="text-5xl font-black text-gray-900">{plan.price}</span>
                <span className="text-gray-400 font-bold">/mês</span>
              </div>
            </div>

            <ul className="space-y-4 mb-10">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-gray-600 font-medium">
                  <div className="bg-[#4CAF50]/10 p-1 rounded-full">
                    <Check size={14} className="text-[#4CAF50]" strokeWidth={4} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => onSelectPlan(plan)}
              className={`w-full py-5 rounded-[2rem] font-black text-lg transition-all active:scale-95 shadow-lg ${
                plan.color === 'green' ? 'bg-[#4CAF50] text-white shadow-[#4CAF50]/20' : 
                plan.color === 'orange' ? 'bg-[#FF9800] text-white shadow-[#FF9800]/20' : 
                'bg-gray-900 text-white shadow-gray-900/10'
              }`}
            >
              Começar Agora
            </button>
          </div>
        ))}
      </div>

      <footer className="mt-12 text-center px-8">
        <div className="flex items-center justify-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
          <ShieldCheck size={16} />
          Pagamento Seguro via MercadoPago
        </div>
      </footer>
    </div>
  );
}
