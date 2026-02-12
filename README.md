# FeiraConta - PWA de Vendas Offline

Sistema mobile-first desenvolvido para feirantes e ambulantes gerenciarem suas vendas diárias de forma simples, rápida e 100% offline.

## 🚀 Tecnologias Utilizadas

- **React + Vite**: Framework e build tool.
- **Tailwind CSS v4**: Estilização moderna e responsiva.
- **Dexie.js**: Gerenciamento do IndexedDB para persistência local.
- **Vite PWA Plugin**: Configuração de Service Worker e manifest.
- **Lucide React**: Ícones minimalistas.
- **UUID**: Identificadores únicos para registros.

## 📦 Instalação e Execução

1. **Clone o repositório** (ou extraia os arquivos).
2. **Instale as dependências**:
   ```bash
   npm install
   ```
3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
4. **Para gerar a versão de produção (PWA)**:
   ```bash
   npm run build
   ```
5. **Para visualizar o PWA localmente**:
   ```bash
   npm run preview
   ```

## 📱 Como Instalar como PWA

Após abrir o link (em produção ou preview) no seu celular:

- **Android (Chrome)**: Clique nos três pontos (menu) e selecione "Instalar aplicativo" ou "Adicionar à tela inicial".
- **iOS (Safari)**: Clique no botão de compartilhar (quadrado com seta) e selecione "Adicionar à Tela de Início".

## 🛠 Estrutura do Projeto

- `src/db/`: Configuração do banco de dados IndexedDB.
- `src/hooks/`: Lógica de negócios e hooks para interação com o banco.
- `src/pages/`: Telas da aplicação (Vendas, Configuração, Histórico).
- `src/utils/`: Formatadores e funções auxiliares.
- `public/`: Assets estáticos e manifest.

## ☁️ Sincronização em Nuvem (SaaS)

O ContaFeira está preparado para sincronizar dados automaticamente com o **Supabase**. Quando o usuário está online, o sistema detecta alterações no banco local (Dexie) e faz o upload para a nuvem.

### Configuração do Banco de Dados (Supabase SQL Editor):

Execute estes comandos no SQL Editor do Supabase para habilitar a sincronização:

```sql
-- 1. Tabela de Configuração
create table configuracao (
  id text primary key,
  user_id uuid references auth.users not null,
  nome_barraca text not null,
  updated_at timestamp with time zone default now()
);

-- 2. Tabela de Produtos
create table produtos (
  id uuid primary key,
  user_id uuid references auth.users not null,
  nome text not null,
  preco decimal not null,
  updated_at timestamp with time zone default now()
);

-- 3. Tabela de Vendas
create table vendas (
  id uuid primary key,
  user_id uuid references auth.users not null,
  nome_produto text not null,
  valor decimal not null,
  quantidade int default 1,
  forma_pagamento text not null,
  data date not null,
  hora text not null,
  created_at timestamp with time zone default now()
);

-- 4. Tabela de Resumos
create table resumos (
  id uuid primary key,
  user_id uuid references auth.users not null,
  data date not null,
  total decimal not null,
  total_pix decimal default 0,
  total_dinheiro decimal default 0,
  total_cartao decimal default 0,
  quantidade_vendas int default 0,
  created_at timestamp with time zone default now()
);

-- Habilitar RLS em todas as tabelas
alter table configuracao enable row level security;
alter table produtos enable row level security;
alter table vendas enable row level security;
alter table resumos enable row level security;

-- Criar políticas de segurança
create policy "Dono vê seus dados" on configuracao for all using (auth.uid() = user_id);
create policy "Dono vê seus dados" on produtos for all using (auth.uid() = user_id);
create policy "Dono vê seus dados" on vendas for all using (auth.uid() = user_id);
create policy "Dono vê seus dados" on resumos for all using (auth.uid() = user_id);

-- 5. Tabela de Perfis (Planos)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  plan text default 'none', -- 'essencial', 'profissional', 'master'
  subscription_status text default 'active',
  updated_at timestamp with time zone default now()
);

-- RLS para Perfis
alter table profiles enable row level security;
create policy "Usuário vê próprio perfil" on profiles for select using (auth.uid() = id);
create policy "Usuário atualiza próprio perfil" on profiles for update using (auth.uid() = id);
create policy "Usuário insere próprio perfil" on profiles for insert with check (auth.uid() = id);
```

## 🛡 Regras de Negócio

- **Híbrido**: O sistema prioriza o salvamento local para garantir que nunca pare, mesmo sem sinal.
- **Sincronização Ética**: Os dados são sincronizados em background ou assim que o dispositivo detecta internet.
- **Multi-dispositivo**: Ao fazer login em outro aparelho, o sistema está configurado para puxar as configurações e produtos salvos.

---
Desenvolvido com foco em velocidade e simplicidade.
