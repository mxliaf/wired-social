# Wired — Instagram clone

Projeto de estudo com frontend em React/Vite e API em Node.js, Express e MongoDB Atlas.

## Requisitos

- Node.js 20.19 ou superior
- npm

## Instalação

Na raiz do projeto, instale as dependências do frontend e do backend:

```bash
npm run setup
```

## Executar frontend e backend juntos

Ainda na raiz do projeto:

```bash
npm run dev
```

Esse comando inicia:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3000`

Use `Ctrl+C` para encerrar os dois processos.

## Usuários de demonstração

Na primeira execução com um banco vazio, a API cria três usuários de exemplo. A senha de todos é `123456`.

## Rotas principais do frontend

- `/`: login
- `/home`: perfil e feed
- `/feed`: feed
- `/publicar`: nova publicação
- `/config`: configurações do perfil

## Rotas da API

- `GET /api/posts`: listar posts
- `GET /api/posts/:id`: buscar um post
- `POST /api/posts`: criar um post com `multipart/form-data`
- `PUT /api/posts/:id`: editar legenda e/ou imagem
- `DELETE /api/posts/:id`: excluir um post
- `GET /api/perfil`: buscar o perfil
- `PUT /api/perfil`: editar o perfil

Nos formulários de upload, use o campo `imagem` para posts e `foto` para a foto do perfil.

## Configuração opcional

O frontend usa `http://localhost:3000` como endereço padrão da API. Para mudar, copie `frontend/.env.example` para `frontend/.env` e altere `VITE_API_URL`.

O backend aceita as variáveis de ambiente `PORT` e `FRONTEND_URL`. Os valores padrão são `3000` e `http://localhost:5173`.

Para rodar localmente com MongoDB, copie `backend/.env.example` para `backend/.env` e preencha `MONGODB_URI` e `TOKEN_SECRET`. Esse arquivo é ignorado pelo Git e nunca deve ser publicado.

Na primeira execução com um banco MongoDB vazio, a API cria três usuários e posts de exemplo automaticamente. O cadastro é aberto pela rota `/cadastro`. Imagens novas são convertidas em data URL e guardadas no MongoDB, com limite de 4 MB para manter o deploy simples e gratuito.

## Deploy gratuito no Vercel + MongoDB Atlas

1. Crie um cluster gratuito no MongoDB Atlas e copie a connection string.
2. No Vercel, importe este repositório como um único projeto.
3. Configure as variáveis `MONGODB_URI`, `MONGODB_DB`, `TOKEN_SECRET` e `FRONTEND_URL` (a URL pública do Vercel).
4. Faça o deploy. O `vercel.json` publica o frontend e encaminha `/api/*` para a função Node.

O plano gratuito não exige servidor ligado continuamente. O banco gratuito possui limites de armazenamento e tráfego; para um projeto de estudo, essa configuração é suficiente.

## Outros comandos

```bash
npm run lint
npm run build
npm run start
```

- `lint`: verifica o código do frontend.
- `build`: gera o build de produção do frontend.
- `start`: inicia somente o backend, sem modo de observação.

## GitHub Pages

Gere o site estático com:

```bash
npm run build
```

O conteúdo será criado em `frontend/dist/`. Essa pasta está liberada no `.gitignore` e pode ser publicada pelo GitHub Pages. O build também cria `404.html`, permitindo atualizar diretamente rotas como `/home` e `/publicar`.

Antes de gerar o build, configure `VITE_API_URL` com o endereço público do backend. O GitHub Pages hospeda apenas o frontend e não executa a API Node/Express.
