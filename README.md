# Wired — Instagram clone

Projeto de estudo com frontend em React/Vite e API em Node.js, Express e SQLite.

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

## Login de demonstração

- E-mail: `admin@wired.com`
- Senha: `1234`

Esse login é apenas didático e não representa autenticação segura.

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

O banco `backend/database.sqlite` e os arquivos de `backend/uploads/` são criados localmente e não são enviados ao Git. Na primeira execução, a API cria o banco e insere os posts iniciais automaticamente.

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
