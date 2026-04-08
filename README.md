# RotinaFlow — Frontend

Interface web do RotinaFlow, construída com **React 19 + Vite 7 + TypeScript + Tailwind CSS 4**.  
Permite ao usuário criar rotinas personalizadas com IA, gerenciar créditos e assinar planos via Stripe.

---

## Sumário

- [Pré-requisitos](#pré-requisitos)
- [Configuração do ambiente](#configuração-do-ambiente)
- [Instalação](#instalação)
- [Execução](#execução)
- [Build para produção](#build-para-produção)
- [Comandos disponíveis](#comandos-disponíveis)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Aliases de importação](#aliases-de-importação)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Segurança](#segurança)
- [Troubleshooting](#troubleshooting)

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Node.js | 24+ |
| pnpm | 10+ (ou npm 10+) |

---

## Configuração do ambiente

```bash
cp .env.example .env
```

Para desenvolvimento local nenhuma variável é obrigatória — o proxy do Vite redireciona `/api` para `http://localhost:3000` automaticamente.

---

## Instalação

```bash
pnpm install
# ou
npm install
```

---

## Execução

```bash
pnpm dev
# ou
npm run dev
```

Frontend disponível em `http://localhost:5173`.

> O backend precisa estar rodando em `http://localhost:3000` para as chamadas de API funcionarem.

---

## Build para produção

```bash
pnpm build
# ou
npm run build
```

O artefato é gerado em `dist/public/`.

Para pré-visualizar o build localmente:

```bash
pnpm serve
```

---

## Comandos disponíveis

| Comando | Descrição |
|---|---|
| `pnpm dev` | Inicia o servidor de desenvolvimento (Vite) |
| `pnpm build` | Gera o build de produção em `dist/public/` |
| `pnpm serve` | Pré-visualiza o build de produção localmente |
| `pnpm typecheck` | Verifica tipos TypeScript sem compilar |
| `pnpm test` | Executa a suíte de testes (Vitest) |
| `pnpm test:watch` | Testes em modo watch |
| `pnpm test:coverage` | Testes com relatório de cobertura |

---

## Estrutura do projeto

Arquitetura **feature-based** (módulos por domínio):

```
src/
├── modules/            # Módulos de domínio (feature-based)
│   ├── auth/           # Login, cadastro, sessão
│   ├── schedule/       # Criação e visualização de rotinas
│   ├── proposals/      # Propostas de rotina geradas pela IA
│   ├── credits/        # Saldo e consumo de créditos
│   └── payments/       # Checkout e histórico de pagamentos
├── shared/             # Código reutilizável entre módulos
│   ├── lib/            # Cliente HTTP, validação, segurança, utilitários
│   │   └── api/        # client.ts — fetch com base URL configurável
│   ├── ui/             # Componentes de UI genéricos (Shadcn/Radix)
│   ├── hooks/          # Hooks utilitários compartilhados
│   └── types/          # Tipos TypeScript globais
├── layouts/            # Layouts de página (AppLayout, etc.)
├── pages/              # Páginas top-level (landing, chat, rotinas, erros)
├── components/         # Componentes globais (modais, banners, etc.)
├── hooks/              # Hooks de nível de app (toast, PWA, mobile)
├── lib/                # Utilitários de app (utils, api legado, security)
├── api-client/         # Client gerado (fetch + tipos da API)
│   └── generated/      # Schemas e funções de API gerados automaticamente
├── app.ts              # Configuração do QueryClient e providers
└── main.tsx            # Entry point (monta o React na DOM)
```

---

## Aliases de importação

Configurados em `vite.config.ts` e `tsconfig.json`:

| Alias | Caminho real | Uso típico |
|---|---|---|
| `@` | `src/` | Importações absolutas genéricas |
| `@modules` | `src/modules/` | Módulos de domínio |
| `@shared` | `src/shared/` | Código compartilhado |
| `@ui` | `src/shared/ui/` | Componentes de UI |
| `@lib` | `src/shared/lib/` | Utilitários e cliente HTTP |
| `@hooks` | `src/shared/hooks/` | Hooks compartilhados |
| `@layouts` | `src/layouts/` | Layouts de página |
| `@config` | `src/config/` | Configurações da aplicação |
| `@app` | `src/app/` | Setup global (providers, router) |

**Exemplo:**

```typescript
import { apiClient } from "@lib/api/client";
import { useCredits } from "@modules/credits/hooks/use-credits";
import { Button } from "@ui/button";
```

---

## Variáveis de ambiente

Consulte `.env.example` para a lista completa. Resumo:

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `5173` | Porta do servidor Vite |
| `BASE_PATH` | `/` | Base path da aplicação |
| `VITE_API_BASE_URL` | *(vazio)* | URL base da API. Vazio = proxy Vite em dev |
| `VITE_STRIPE_PUBLIC_KEY` | — | Publishable key do Stripe |
| `CHOKIDAR_USEPOLLING` | `false` | Hot-reload por polling (WSL/Docker Desktop) |

> Variáveis prefixadas com `VITE_` ficam expostas no bundle do cliente. **Nunca coloque segredos com prefixo `VITE_`.**

---

## Segurança

Práticas implementadas no frontend:

- **Sanitização de output** — conteúdo gerado por IA é sanitizado com DOMPurify antes de ser renderizado
- **HTTPS obrigatório em produção** — HSTS configurado no backend (Helmet)
- **Sem dados sensíveis no bundle** — chaves secretas ficam exclusivamente no backend
- **Proxy do Vite** — em desenvolvimento, nenhuma URL de API fica exposta no código-fonte
- **Validação de formulários** — todos os forms usam Zod + React Hook Form
- **Cookies HttpOnly** — a sessão é gerenciada por cookie HttpOnly (sem localStorage/sessionStorage para auth)

---

## Troubleshooting

### Hot-reload não funciona (WSL / Docker Desktop)

Adicione ao `.env`:

```env
CHOKIDAR_USEPOLLING=true
```

### Erro de CORS ao chamar a API

Verifique se o backend está rodando em `http://localhost:3000` e se `CORS_ORIGINS` no backend inclui `http://localhost:5173`.

### `VITE_API_BASE_URL` vs proxy do Vite

- **Desenvolvimento**: deixe `VITE_API_BASE_URL` vazio. O proxy do Vite (`/api → localhost:3000`) funciona automaticamente.
- **Produção**: defina `VITE_API_BASE_URL=https://api.rotinaflow.com.br` (ou a URL pública do seu backend).

### Erro de tipo após atualizar a API

Regenere o client da API:

```bash
# No backend, exporte o schema OpenAPI e re-gere o client no frontend
```
