import React from 'react';
import { 
  ArrowRight, 
  Smartphone, 
  Zap, 
  WifiOff, 
  CloudSync, 
  BarChart3, 
  Package, 
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Star
} from 'lucide-react';

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-['Outfit'] text-gray-900 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-[100] bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="ContaFeira" className="h-10 w-auto" />
        </div>
        <button 
          onClick={() => onGetStarted(false)}
          className="bg-[#4CAF50] text-white px-6 py-2.5 rounded-full font-black text-sm uppercase tracking-widest shadow-lg shadow-[#4CAF50]/20 hover:scale-105 transition-all"
        >
          Entrar
        </button>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#4CAF50]/10 rounded-full blur-[100px] -z-10 animate-pulse" />
        
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="flex h-2 w-2 rounded-full bg-[#4CAF50] animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4CAF50]">O app nº 1 para feirantes</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black leading-[1.1] mb-8 tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Venda mais, gerencie <br />
          <span className="text-[#4CAF50]">como um profissional.</span>
        </h1>
        
        <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          O primeiro sistema de vendas feito sob medida para ambulantes e feirantes. 
          Funciona 100% offline e sincroniza tudo na nuvem quando houver sinal.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <button 
            onClick={() => onGetStarted(true)}
            className="w-full sm:w-auto bg-gray-900 text-white px-10 py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl hover:bg-[#4CAF50] transition-all hover:scale-105 group"
          >
            Começar Agora Grátis
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="flex items-center gap-4 px-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" />
              ))}
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">+1.200 Vendedores</p>
          </div>
        </div>

        {/* Mockup Preview */}
        <div className="mt-20 relative max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <div className="bg-white rounded-[3rem] p-4 shadow-[0_50px_100px_-20px_rgba(76,175,80,0.15)] border-[12px] border-gray-100 overflow-hidden">
            <div className="aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden relative group">
              <img 
                src="https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=2000" 
                alt="Feira Livre"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-12 text-left">
                <div className="max-w-md">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-[#4CAF50] rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <Smartphone size={24} />
                      </div>
                      <p className="text-white font-black uppercase tracking-widest text-sm">Disponível para Android & iOS</p>
                   </div>
                   <h3 className="text-3xl font-black text-white mb-2">Sua banca na palma da mão</h3>
                   <p className="text-gray-200 font-medium italic">"A praticidade que eu precisava para não perder tempo com papelada."</p>
                </div>
              </div>
              
              {/* Floating App Element */}
              <div className="absolute top-10 right-10 w-64 bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-2xl hidden lg:block transform hover:-translate-y-2 transition-all">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-[#4CAF50]">
                       <BarChart3 size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total de Hoje</p>
                       <p className="text-xl font-black text-gray-900">R$ 1.240,00</p>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full w-[80%] bg-[#4CAF50]" />
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Meta Diária: 80%</p>
                 </div>
              </div>
            </div>
          </div>
          
          {/* Floating Badges */}
          <div className="absolute -top-10 -right-4 bg-[#FF9800] text-white p-6 rounded-3xl shadow-xl rotate-12 hidden md:block z-20">
            <Zap size={32} />
            <p className="font-black text-sm mt-2">Venda em <br />3 segundos</p>
          </div>
          <div className="absolute top-1/2 -left-10 -translate-y-1/2 bg-white p-6 rounded-3xl shadow-xl -rotate-6 border border-gray-100 hidden md:block z-20">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-[#4CAF50]">
                  <WifiOff size={20} />
               </div>
               <div>
                  <p className="font-black text-sm">Modo Offline</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Nunca para de vender</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4CAF50]">Vantagens</span>
            <h2 className="text-4xl font-black mt-4">Feito para o seu dia a dia</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <WifiOff className="text-orange-500" />,
                title: "100% Offline",
                desc: "Não depende de internet. Cadastre vendas na feira, no ônibus ou na rua sem interrupções."
              },
              {
                icon: <CloudSync className="text-blue-500" />,
                title: "Sincronização Cloud",
                desc: "Assim que houver sinal, seus dados são salvos na nuvem automaticamente. Perdeu o celular? Seus dados estão salvos."
              },
              {
                icon: <BarChart3 className="text-[#4CAF50]" />,
                title: "Relatórios Diários",
                desc: "Saiba exatamente quanto ganhou no dia, no mês e quais produtos mais vendem."
              },
              {
                icon: <Package className="text-purple-500" />,
                title: "Catálogo Rápido",
                desc: "Cadastre seus produtos com foto e preço. Venda com apenas um toque na tela."
              },
              {
                icon: <ShieldCheck className="text-emerald-500" />,
                title: "Segurança Total",
                desc: "Acesso protegido por PIN e controle total sobre quem vê suas informações de lucro."
              },
              {
                icon: <Star className="text-yellow-500" />,
                title: "Experiência App",
                desc: "Instale direto pelo navegador. Sem precisar baixar na Play Store ou Apple Store."
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-[#FAFAFA] p-8 rounded-[2.5rem] text-left hover:shadow-xl hover:bg-white transition-all group border border-transparent hover:border-gray-100">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black mb-3">{feature.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-3xl mx-auto px-6 text-center">
           <div className="flex justify-center gap-1 mb-8">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} fill="#FF9800" className="text-[#FF9800]" />)}
           </div>
           <blockquote className="text-2xl md:text-3xl font-black italic mb-8 leading-tight text-gray-800">
             "O ContaFeira mudou meu jogo. Antes eu anotava tudo em papel e perdia as contas. Agora sei exatamente meu lucro no final do dia direto no celular."
           </blockquote>
           <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="text-left">
                 <p className="font-black text-sm">Ricardo Mendes</p>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-[#4CAF50]">Feirante há 15 anos</p>
              </div>
           </div>
        </div>
      </section>

      {/* Plans Preview */}
      <section className="py-20 bg-gray-900 text-white rounded-[3rem] mx-4 md:mx-10 my-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#4CAF50]/10 rounded-full blur-[100px]" />
        
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#4CAF50]">Preços</span>
          <h2 className="text-4xl font-black mt-4 mb-12">Escolha o seu plano</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
             {/* Free Plan */}
             <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] text-left">
                <h3 className="text-2xl font-black mb-1 text-[#4CAF50]">Essencial</h3>
                <p className="text-gray-400 text-sm font-medium mb-6">Comece a organizar sua feira agora</p>
                <div className="flex items-baseline gap-1 mb-10">
                   <span className="text-3xl font-black">R$ 9,90</span>
                   <span className="text-gray-500 text-xs font-bold uppercase px-2">/ mês</span>
                </div>
                <ul className="space-y-4 mb-12">
                   {["Vendas Rápidas & Offline", "Recibo via WhatsApp", "Controle Financeiro Básico", "Dados Salvos no Celular"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-medium">
                         <CheckCircle2 size={18} className="text-[#4CAF50]" /> {item}
                      </li>
                   ))}
                </ul>
                <button 
                   onClick={() => onGetStarted(true)}
                   className="w-full py-5 rounded-3xl border-2 border-white/10 font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all"
                >
                   Começar Agora
                </button>
             </div>

             {/* Pro Plan */}
             <div className="bg-[#4CAF50] p-10 rounded-[3rem] text-left relative transform md:-translate-y-4 shadow-2xl shadow-[#4CAF50]/20">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-[#4CAF50] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                   Mais Popular
                </div>
                <h3 className="text-2xl font-black mb-1">Pro Cloud</h3>
                <p className="text-white/80 text-sm font-medium mb-6">O poder total no seu bolso</p>
                <div className="flex items-baseline gap-1 mb-10">
                   <span className="text-3xl font-black text-yellow-300">R$ 24,90</span>
                   <span className="text-white/60 text-xs font-bold uppercase px-2">/ mês</span>
                </div>
                <ul className="space-y-4 mb-12">
                   {["Produtos Ilimitados", "Controle de Estoque", "Backup Diário Cloud", "Sincronização Multi-device", "Dashboard de Lucro"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-medium">
                         <CheckCircle2 size={18} className="text-white" /> {item}
                      </li>
                   ))}
                </ul>
                <button 
                   onClick={() => onGetStarted(true)}
                   className="w-full py-5 rounded-3xl bg-white text-[#4CAF50] font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 transition-all"
                >
                   Assinar Agora
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-center md:text-left">
            <img src="/logo.png" alt="ContaFeira" className="h-10 w-auto mb-4 mx-auto md:mx-0 grayscale opacity-50" />
            <p className="text-gray-400 text-sm font-medium max-w-xs">
              Ajudando a economia local prosperar com tecnologia simples e eficiente.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 text-center md:text-left">
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-6">Produto</p>
                <ul className="space-y-4 text-sm font-bold text-gray-500">
                   <li>Funcionalidades</li>
                   <li>Preços</li>
                   <li>PWA App</li>
                </ul>
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-6">Suporte</p>
                <ul className="space-y-4 text-sm font-bold text-gray-500">
                   <li>Ajuda</li>
                   <li>Contato</li>
                   <li>Privacidade</li>
                </ul>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-gray-50 text-center">
           <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
             ContaFeira &copy; 2025 - Feito com ❤️ para o empreendedor brasileiro
           </p>
        </div>
      </footer>
    </div>
  );
}
