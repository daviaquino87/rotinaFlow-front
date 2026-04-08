# RotinaFlow Client

Frontend da aplicacao RotinaFlow, construida com React + Vite.

## Requisitos

- Node.js 24+
- pnpm 10+

## Configuracao de ambiente

1. Copie o exemplo:

```bash
cp .env.example .env
```

2. Ajuste as variaveis se necessario.

## Rodando localmente

```bash
pnpm install
pnpm run dev
```

Frontend disponivel em `http://localhost:5173`.

## Build e preview

```bash
pnpm run build
pnpm run serve
```

## Variaveis de ambiente

- `PORT`: porta do Vite (padrao: `5173`)
- `BASE_PATH`: base path da aplicacao (padrao: `/`)
- `VITE_API_BASE_URL`: URL base da API (opcional).  
  Exemplo: `http://localhost:3000`
