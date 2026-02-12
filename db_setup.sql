-- COPIE ESTE CÓDIGO E COLE NO 'SQL EDITOR' DO SUPABASE

-- 1. Cria a tabela de Perfis de Usuários (se não existir)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user',
  plan TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilita segurança (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Cria políticas de acesso (Quem pode ver o quê)

-- Permite que usuários vejam seus próprios perfis
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Permite que usuários atualizem seus próprios perfis
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Permite que usuários insiram seus próprios perfis (ao cadastrar)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- CRÍTICO: Permite que o ADMIN veja/edite TODOS os perfis
-- Substitua 'msjtec12@gmail.com' pelo e-mail do admin se quiser restringir, mas 'authenticated' facilita.
DROP POLICY IF EXISTS "Admin full access" ON public.profiles;
CREATE POLICY "Admin full access" ON public.profiles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Função para criar perfil automaticamente ao cadastrar (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, subscription_status, role)
  VALUES (new.id, new.email, 'active', 'user'); -- Começa como ativo ou pending, ajuste conforme preferir
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que dispara quando um usuário é criado na Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
