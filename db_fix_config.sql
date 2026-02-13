-- CRIA A TABELA DE CONFIGURAÇÃO DO SISTEMA
CREATE TABLE IF NOT EXISTS public.configuracao (
  id TEXT PRIMARY KEY,
  nome_barraca TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HABILITA RLS (Segurança)
ALTER TABLE public.configuracao ENABLE ROW LEVEL SECURITY;

-- POLÍTICA: Usuários só veem e editam sua própria configuração
DROP POLICY IF EXISTS "Users can manage own config" ON public.configuracao;
CREATE POLICY "Users can manage own config" ON public.configuracao
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- TRIGGER PARA ATUALIZAR TIMESTAMP DE UPDATE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_config_timestamp ON public.configuracao;
CREATE TRIGGER update_config_timestamp BEFORE UPDATE ON public.configuracao FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
