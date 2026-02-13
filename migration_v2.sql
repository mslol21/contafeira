-- MIGRAÇÃO PARA CONTAFEIRA V2 - ROBUSTEZ E ESCALABILIDADE

-- 1. FUNÇÃO AUXILIAR DE TIMESTAMP (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. TABELA: PROFILES (Extensão do Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'essencial', -- 'essencial', 'pro', 'pro_trial'
  subscription_status TEXT DEFAULT 'active',
  subscription_expires_at TIMESTAMPTZ,
  role TEXT DEFAULT 'user',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem ver próprio perfil" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem atualizar próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 3. TABELA: PRODUTOS
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID PRIMARY KEY,
  nome TEXT NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  custo DECIMAL(10,2) DEFAULT 0,
  estoque INTEGER DEFAULT 0,
  categoria TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total produtos por user_id" ON public.produtos;
CREATE POLICY "Acesso total produtos por user_id" ON public.produtos FOR ALL USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS tr_produtos_updated_at ON public.produtos;
CREATE TRIGGER tr_produtos_updated_at BEFORE UPDATE ON public.produtos FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4. TABELA: VENDAS
CREATE TABLE IF NOT EXISTS public.vendas (
  id UUID PRIMARY KEY,
  nome_produto TEXT,
  valor DECIMAL(10,2),
  quantidade INTEGER,
  forma_pagamento TEXT,
  cliente TEXT,
  data DATE,
  hora TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total vendas por user_id" ON public.vendas;
CREATE POLICY "Acesso total vendas por user_id" ON public.vendas FOR ALL USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS tr_vendas_updated_at ON public.vendas;
CREATE TRIGGER tr_vendas_updated_at BEFORE UPDATE ON public.vendas FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 5. TABELA: RESUMOS
CREATE TABLE IF NOT EXISTS public.resumos (
  id UUID PRIMARY KEY,
  data DATE,
  total DECIMAL(10,2),
  total_pix DECIMAL(10,2),
  total_dinheiro DECIMAL(10,2),
  total_cartao DECIMAL(10,2),
  total_custos DECIMAL(10,2),
  quantidade_vendas INTEGER,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.resumos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total resumos por user_id" ON public.resumos;
CREATE POLICY "Acesso total resumos por user_id" ON public.resumos FOR ALL USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS tr_resumos_updated_at ON public.resumos;
CREATE TRIGGER tr_resumos_updated_at BEFORE UPDATE ON public.resumos FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
