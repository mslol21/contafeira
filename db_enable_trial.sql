-- ATIVAR TRIAL DE 7 DIAS AUTOMÁTICO PARA NOVOS USUÁRIOS

-- Atualiza a função que cria o perfil ao se cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    role, 
    plan, 
    subscription_status, 
    subscription_expires_at
  )
  VALUES (
    new.id, 
    new.email, 
    'user', 
    'pro cloud', -- Já começa testando o melhor plano
    'trial', 
    NOW() + INTERVAL '7 days' -- Define validade para daqui a 7 dias
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- (OPCIONAL) Se você quiser dar 7 dias para quem já se cadastrou e está 'pending' ou 'inactive':
-- UPDATE public.profiles
-- SET subscription_status = 'trial',
--     subscription_expires_at = NOW() + INTERVAL '7 days',
--     plan = 'pro cloud'
-- WHERE subscription_status IN ('inactive', 'pending');
