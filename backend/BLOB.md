# Imagens no Vercel Blob (Hobby)

1. No Vercel, selecione a conta Hobby e o projeto da API.
2. Em Storage, crie um Blob com acesso **Public** e conecte-o ao projeto.
3. Confirme que `BLOB_READ_WRITE_TOKEN` foi adicionado ao ambiente Production do backend.
4. Faça deploy do backend e do frontend. O frontend não recebe esse segredo; não crie uma variável `VITE_` com o token.

Não selecione Pro ou trial pago. O Hobby é gratuito dentro das cotas; ao excedê-las o Blob pode ficar indisponível, sem cobrança adicional no Hobby.

Posts, stories, avatar e capa novos são enviados diretamente pelo navegador ao Blob, após autorização da API. O MongoDB recebe a URL. As mídias públicas podem ser acessadas por quem possui o link.

As imagens antigas em Base64 continuam sendo lidas para compatibilidade. Em 18/11/2026, as imagens que já existiam foram copiadas e verificadas no Blob antes de seus campos no MongoDB serem trocados pelas URLs. Nenhum registro ou arquivo foi excluído. O backup local dessa operação fica em `backend/backups/`, que não entra no Git. O início da API não executa migração nem a antiga correção de dados. Alterar nome ou bio sem escolher novas imagens preserva os campos atuais.

O script `migrarImagens.js` é manual e idempotente: sem argumentos, faz somente o inventário; com `--apply`, cria e verifica um backup, confere o conteúdo de todos os uploads e só depois atualiza o MongoDB. Ele não apaga imagens do MongoDB nem do Blob e evita sobrescrever uma mudança concorrente feita pelo usuário.

As imagens de stories não são apagadas do Blob quando o story expira; continuam ocupando armazenamento. A expiração de 24 horas dos registros de stories já existente foi mantida. Não execute limpeza de arquivos sem backup e aprovação.

Após conectar o Blob, teste login, imagem antiga, post novo, story, foto e capa. No banco, os campos novos devem começar com `https://` em vez de `data:image/`. Na aba Network, os arquivos vão ao Blob e as requisições da aplicação carregam apenas URLs.

Documentação: https://vercel.com/docs/vercel-blob/client-upload e https://vercel.com/docs/vercel-blob/usage-and-pricing
