-- CORREÇÃO DE SEGURANÇA (RODE ISSO NO SUPABASE > SQL EDITOR)

-- 1. Removemos a política antiga que deixava qualquer usuário ver todos (Perigoso!)
DROP POLICY IF EXISTS "Admin full access" ON public.profiles;

-- 2. Criamos a política NOVA e SEGURA
-- Agora, SOMENTE o seu e-mail (msjtec12@gmail.com) pode ver e editar todos os perfis.
CREATE POLICY "Admin full access" ON public.profiles
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'msjtec12@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'msjtec12@gmail.com');

-- 3. Reforça a proteção dos usuários comuns
-- Eles só podem ver e mexer no próprio perfil.
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4. Opcional: Proteção extra contra fraude de status
-- Um usuário técnico poderia tentar mudar seu próprio status para 'active'.
-- Para impedir isso, precisaríamos de um Trigger (gatilho) mais avançado.
-- Por enquanto, as regras acima já impedem que eles APAGUEM ou VEJAM outros usuários.
