import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowLeft, 
  Search,
  RefreshCcw,
  Zap,
  Rocket
} from 'lucide-react';

export default function AdminPage({ onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(error);
      alert('Erro ao carregar usuários: ' + error.message + '\n\n' + 'Se o erro for "400", você precisa rodar o script SQL no Supabase! Veja o arquivo db_setup.sql no projeto.');
    }
    
    if (data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusUpdate = async (userId, status, plan) => {
    // Definir validade de 30 dias se for ativação
    const expiryDate = status === 'active' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { error } = await supabase
      .from('profiles')
      .update({ 
        subscription_status: status,
        subscription_expires_at: expiryDate,
        plan: plan || 'essencial'
      })
      .eq('id', userId);

    if (!error) {
      fetchUsers();
    } else {
      alert('Erro ao atualizar status: ' + error.message);
    }
  };

  const filteredUsers = users.filter(u => 
    u.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.plan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-['Outfit'] pb-20">
      <header className="bg-white p-6 border-b border-gray-100 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/80">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-3 border border-gray-100 rounded-2xl text-gray-400 hover:text-[#4CAF50] hover:bg-[#4CAF50]/5 transition-all"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Painel de Assinaturas</h1>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Controle Administrativo</p>
            </div>
          </div>
          <button 
            onClick={fetchUsers}
            className="p-3 bg-gray-50 text-gray-500 rounded-2xl hover:bg-gray-100 transition-all"
          >
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Usuários</p>
            <h4 className="text-2xl font-black text-gray-900">{users.length}</h4>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1">Pendentes</p>
            <h4 className="text-2xl font-black text-orange-500">
              {users.filter(u => u.subscription_status === 'pending').length}
            </h4>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-[9px] font-black text-[#4CAF50] uppercase tracking-widest mb-1">Ativos</p>
            <h4 className="text-2xl font-black text-[#4CAF50]">
              {users.filter(u => u.subscription_status === 'active').length}
            </h4>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-[9px] font-black text-gray-900 uppercase tracking-widest mb-1">Receita Mensal</p>
            <h4 className="text-2xl font-black text-gray-900">
              R$ {users.filter(u => u.subscription_status === 'active').reduce((acc, u) => acc + (u.plan === 'pro cloud' ? 24.9 : 9.9), 0).toFixed(2)}
            </h4>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por ID ou Plano..."
            className="w-full p-5 pl-14 bg-white border-2 border-gray-100 rounded-[2rem] focus:border-[#4CAF50] outline-none transition-all shadow-sm font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* User List */}
        <div className="space-y-4">
          {loading && users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
              <Users size={64} className="mb-4 text-gray-300" />
              <p className="font-black text-gray-400 uppercase tracking-widest">Carregando usuários...</p>
            </div>
          ) : filteredUsers.map((user) => (
            <div key={user.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    user.plan === 'pro cloud' ? 'bg-[#4CAF50]/10 text-[#4CAF50]' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {user.plan === 'pro cloud' ? <Rocket size={28} /> : <Zap size={28} />}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest truncate max-w-[200px]">ID: {user.id}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-base font-black ${
                        user.plan === 'pro cloud' ? 'text-[#4CAF50]' : 'text-gray-900'
                      }`}>
                        {user.plan?.toUpperCase() || 'SEM PLANO'}
                      </span>
                      {user.subscription_status === 'active' ? (
                        <span className="bg-green-50 text-green-600 text-[9px] font-black px-2 py-0.5 rounded-full border border-green-100 uppercase">Ativo</span>
                      ) : user.subscription_status === 'pending' ? (
                        <span className="bg-orange-50 text-orange-600 text-[9px] font-black px-2 py-0.5 rounded-full border border-orange-100 uppercase">Pendente PIX</span>
                      ) : (
                        <span className="bg-gray-50 text-gray-400 text-[9px] font-black px-2 py-0.5 rounded-full border border-gray-100 uppercase">Inativo</span>
                      )}
                    </div>
                    {user.subscription_expires_at && (
                      <p className="text-[10px] font-medium text-gray-400 mt-1 flex items-center gap-1">
                        <Clock size={12} /> Expira em: {new Date(user.subscription_expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-0">
                  {user.subscription_status !== 'active' && (
                    <button 
                      onClick={() => handleStatusUpdate(user.id, 'active', user.plan)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#4CAF50] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#4CAF50]/20 active:scale-95 transition-all"
                    >
                      <CheckCircle2 size={18} /> Ativar
                    </button>
                  )}
                  {user.subscription_status === 'active' && (
                    <button 
                      onClick={() => handleStatusUpdate(user.id, 'expired', user.plan)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest border border-red-100 hover:bg-red-100 active:scale-95 transition-all"
                    >
                      <XCircle size={18} /> Suspender
                    </button>
                  )}
                  {user.subscription_status === 'pending' && (
                    <button 
                      onClick={() => handleStatusUpdate(user.id, 'expired', user.plan)}
                      className="p-3 text-red-400 hover:bg-red-50 rounded-2xl transition-all"
                      title="Rejeitar Pagamento"
                    >
                      <XCircle size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
