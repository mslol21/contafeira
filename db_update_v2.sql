-- ATUALIZAÇÃO PARA SUPORTAR 'FIADO' E NOME DO CLIENTE

-- Adiciona a coluna 'cliente' na tabela de vendas
ALTER TABLE public.vendas ADD COLUMN IF NOT EXISTS cliente TEXT;

-- (Opcional) Cria índice para facilitar busca por cliente no futuro
CREATE INDEX IF NOT EXISTS idx_vendas_cliente ON public.vendas(cliente);

-- Se você ainda não rodou os scripts anteriores, garanta que a tabela vendas exista:
CREATE TABLE IF NOT EXISTS public.vendas (
  id UUID PRIMARY KEY,
  nome_produto TEXT,
  valor NUMERIC,
  quantidade INTEGER,
  forma_pagamento TEXT,
  cliente TEXT,
  data DATE,
  hora TIME,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sales" ON public.vendas
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
