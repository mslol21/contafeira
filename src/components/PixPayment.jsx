import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Copy, 
  Check, 
  AlertCircle, 
  ChevronRight, 
  Smartphone, 
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

export default function PixPayment({ plan, onConfirm, onBack }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Exemplo de chave PIX e payload (em um cenário real, isso viria de um backend/MercadoPago)
  const pixKey = "financeiro@contafeira.com.br";
  const pixPayload = "00020126580014BR.GOV.BCB.PIX0136financeiro@contafeira.com.br5204000053039865405" + (plan.price === '24,90' ? '24.90' : '9.90') + "5802BR5910CONTAFEIRA6009SAO PAULO62070503***6304E2B1";

  const handleCopy = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPay = () => {
    setLoading(true);
    // Simular envio de notificação para o admin
    setTimeout(() => {
      onConfirm();
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-['Outfit'] flex flex-col">
      <header className="p-6 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-3 border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">Pagamento via PIX</h1>
      </header>

      <div className="flex-1 p-6 space-y-6 max-w-md mx-auto w-full">
        {/* Plan Summary Card */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plano Selecionado</p>
            <h3 className="text-xl font-black text-gray-900">{plan.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-[#4CAF50]">R$ {plan.price}</p>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-50 flex flex-col items-center text-center space-y-6">
          <div className="p-4 bg-gray-50 rounded-[2.5rem] border-4 border-white shadow-inner">
            <QRCodeSVG value={pixPayload} size={200} level="H" />
          </div>
          
          <div>
            <h4 className="text-lg font-black text-gray-900">Escaneie o QR Code</h4>
            <p className="text-gray-400 text-sm font-medium">Acesse o app do seu banco e escolha "Pagar via Pix"</p>
          </div>

          <div className="w-full space-y-3">
            <button 
              onClick={handleCopy}
              className={`w-full p-5 rounded-[2rem] flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-all ${
                copied ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-gray-900 text-white'
              }`}
            >
              {copied ? (
                <><Check size={20} /> Copiado para Transferência</>
              ) : (
                <><Copy size={20} /> Copiar Código PIX</>
              )}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-blue-50/50 rounded-3xl border border-blue-100">
            <info className="bg-blue-100 p-2 rounded-xl text-blue-600 transition-all">
              <ShieldCheck size={20} />
            </info>
            <div>
              <p className="text-xs font-black text-blue-900 uppercase tracking-widest mb-1">Passo a Passo</p>
              <p className="text-xs text-blue-700 font-medium leading-relaxed">
                Após o pagamento, clique no botão abaixo. Nossa equipe verificará a transação em instantes para liberar seu acesso.
              </p>
            </div>
          </div>

          <button 
            onClick={handleConfirmPay}
            disabled={loading}
            className="w-full py-6 bg-[#4CAF50] text-white rounded-[2.2rem] font-black text-lg shadow-xl shadow-[#4CAF50]/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'PROCESSANDO...' : 'JÁ REALIZEI O PAGAMENTO'}
            {!loading && <ChevronRight size={24} />}
          </button>
        </div>
      </div>
      
      <footer className="p-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
        <Smartphone size={14} /> Sistema de Pagamento Instantâneo
      </footer>
    </div>
  );
}
