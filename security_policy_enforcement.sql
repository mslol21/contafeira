-- RODE ESTE SCRIPT NO 'SQL EDITOR' DO SUPABASE PARA CORRIGIR VAZAMENTO DE DADOS ENTRE CONTAS

-- 1. GARANTE QUE TODAS AS TABELAS TÊM RLS ATIVADO
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracao ENABLE ROW LEVEL SECURITY;

-- 2. LIMPA POLÍTICAS ANTIGAS QUE POSSAM ESTAR ABERTAS DEMAIS
DROP POLICY IF EXISTS "Acesso total produtos por user_id" ON public.produtos;
DROP POLICY IF EXISTS "Acesso total vendas por user_id" ON public.vendas;
DROP POLICY IF EXISTS "Acesso total resumos por user_id" ON public.resumos;
DROP POLICY IF EXISTS "Users can manage own config" ON public.configuracao;

-- 3. CRIA POLÍTICAS RÍGIDAS DE ISOLAMENTO (auth.uid() deve ser igual ao user_id da linha)

-- PRODUTOS
CREATE POLICY "Strict isolation produtos" ON public.produtos
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- VENDAS
CREATE POLICY "Strict isolation vendas" ON public.vendas
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RESUMOS
CREATE POLICY "Strict isolation resumos" ON public.resumos
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CONFIGURAÇÃO
CREATE POLICY "Strict isolation config" ON public.configuracao
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. EVITA QUE DADOS SEM USER_ID SEJAM CRIADOS OU VISTOS
ALTER TABLE public.produtos ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.vendas ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.resumos ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.configuracao ALTER COLUMN user_id SET NOT NULL;

-- 5. CORREÇÃO DO PERFIL (Protege e-mails e planos)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin full access" ON public.profiles;
CREATE POLICY "Admin full access" ON public.profiles
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'msjtec12@gmail.com');
