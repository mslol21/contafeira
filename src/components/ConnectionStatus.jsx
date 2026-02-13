import React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useSync } from '../hooks/useSync';

export default function ConnectionStatus() {
  const { status } = useSync();

  const configs = {
    offline: {
      color: 'bg-orange-500',
      text: 'Offline - Gravando Local',
      icon: <WifiOff size={14} />,
      animate: ''
    },
    syncing: {
      color: 'bg-blue-500',
      text: 'Sincronizando Nuvem...',
      icon: <RefreshCw size={14} className="animate-spin" />,
      animate: 'animate-pulse'
    },
    synced: {
      color: 'bg-[#4CAF50]',
      text: 'Dados Protegidos na Nuvem',
      icon: <CheckCircle2 size={14} />,
      animate: ''
    }
  };

  const current = configs[status] || configs.synced;

  return (
    <div className={`fixed top-4 right-4 z-[150] flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border border-white/20 backdrop-blur-md text-white font-black text-[10px] uppercase tracking-[0.15em] transition-all duration-500 ${current.color} ${current.animate}`}>
      {current.icon}
      <span>{current.text}</span>
    </div>
  );
}
