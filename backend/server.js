import express from 'express'
import cors from 'cors'
import multer from 'multer'
import Database from 'better-sqlite3'
import { existsSync, mkdirSync, unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { basename, extname, dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'

const app = express()
const PORT = process.env.PORT || 3000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

const arquivoAtual = fileURLToPath(import.meta.url)
const pastaBackend = dirname(arquivoAtual)
const pastaUploads = join(pastaBackend, 'uploads')

mkdirSync(pastaUploads, { recursive: true })

app.use(cors({
    origin: FRONTEND_URL,
}))


app.use(express.json())

app.use('/uploads', express.static(pastaUploads))

const db = new Database(join(pastaBackend, 'database.sqlite'))

db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    imagem TEXT NOT NULL,
    legenda TEXT NOT NULL,
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP
    )
`)

db.exec(`
    CREATE TABLE IF NOT EXISTS perfil (
        id INTEGER PRIMARY KEY,
        nome_usuario TEXT NOT NULL,
        bio TEXT NOT NULL,
        foto TEXT NOT NULL
    )
`)

db.prepare(`
    INSERT OR IGNORE INTO perfil (id, nome_usuario, bio, foto)
    VALUES (1, ?, ?, ?)
`).run(
    'agaetisbyrju',
    '2005 / fashion and technology enthusiast',
    'https://i.pinimg.com/1200x/6c/ef/fb/6ceffb9310699f63aa4cfe58b67bf2dc.jpg',
)

//colocar posts que ja tinham pq nao queria apagar
const postsIniciais = [
    {
        id: 1,
        publicacao: "https://i.pinimg.com/1200x/8d/78/29/8d78290ddb68ab61bc8c862cc5d63818.jpg",
        descricao: "Post 1"
    },
    {
        id: 2,
        publicacao: "https://i.pinimg.com/736x/fa/25/2d/fa252d2b60abdd60387cd0fadceae975.jpg",
        descricao: "Post 2"
    },
    {
        id: 3,
        publicacao: "https://i.pinimg.com/originals/35/d5/54/35d554f31bd87bf3f5097830af38332b.gif",
        descricao: "Post 3"
    },
    {
        id: 4,
        publicacao: "https://i.pinimg.com/originals/dd/fe/f6/ddfef6fdb94240cb389b38e6a9a00983.gif",
        descricao: "Post 4"
    },
    {
        id: 5,
        publicacao: "https://i.pinimg.com/736x/e0/03/0f/e0030feb585721c584bb8518d9b1d744.jpg",
        descricao: "Post 5"
    },
    {
        id: 6,
        publicacao: "https://i.pinimg.com/1200x/6c/9d/18/6c9d18cce519748a1ba513e31c0852f7.jpg",
        descricao: "Post 6"
    },
    {
        id: 7,
        publicacao: "https://i.pinimg.com/736x/ec/4b/78/ec4b78cefae7d3dfaf7d9e62751e4f25.jpg",
        descricao: "Post 7"
    },
    {
        id: 8,
        publicacao: "https://i.pinimg.com/1200x/5d/55/a9/5d55a9931224e4f41eae2fe6ffadd116.jpg",
        descricao: "Post 8"
    },
    {
        id: 9,
        publicacao: "https://i.pinimg.com/1200x/d7/d1/4f/d7d14fb6d53c9fde98e4e97330a96a30.jpg",
        descricao: "Post 9"
    },
    {
        id: 10,
        publicacao: "https://i.pinimg.com/736x/69/03/d4/6903d410e49b043ab6917f2a59829fc7.jpg",
        descricao: "Post 10"
    },
    {
        id: 11,
        publicacao: "https://i.pinimg.com/736x/7f/f6/16/7ff6162a8ef573e3fa2085c78c6a42e0.jpg",
        descricao: "Post 11"
    },
    {
        id: 12,
        publicacao: "https://i.pinimg.com/1200x/5e/c7/8b/5ec78bce338be833470c4e83802b45c7.jpg",
        descricao: "Post 12"
    },
    {
        id: 13,
        publicacao: "https://i.pinimg.com/736x/d1/05/ff/d105ff1ea475020662bbc2990ab7dede.jpg",
        descricao: "Post 13"
    },
    {
        id: 14,
        publicacao: "https://i.pinimg.com/736x/da/f8/b0/daf8b09fab19e193d4313174cb884d63.jpg",
        descricao: "Post 14"
    },
]

const inserirPostInicial = db.prepare(`
  INSERT INTO posts (imagem, legenda)
  SELECT ?, ?
  WHERE NOT EXISTS (
    SELECT 1
    FROM posts
    WHERE imagem = ?
      AND legenda = ?
  )
`)

const inserirPostsIniciais = db.transaction((posts) => {
  for (const post of posts) {
    inserirPostInicial.run(
      post.publicacao,
      post.descricao,
      post.publicacao,
      post.descricao,
    )
  }
})

const quantidadePosts = db
  .prepare('SELECT COUNT(*) AS total FROM posts')
  .get()

if (quantidadePosts.total === 0) {
  inserirPostsIniciais(postsIniciais)
}

//configurar upload da foto com Multer 

const armazenamento = multer.diskStorage({
    destination: pastaUploads,

    filename(req, file, callback) {
        const extensao = extname(file.originalname).toLowerCase()
        const nomeArquivo = `${randomUUID()}${extensao}`

        callback(null, nomeArquivo)
    }

})

const upload = multer({
    storage: armazenamento,

    fileFilter(req, file, callback) {
        if(!file.mimetype.startsWith('image')) {
            return callback(new Error('O arquivo precisa ser uma imagem'))
        }

        callback(null, true)
    }
})

//funcao que faz a url da imagem
function adicionarUrlDaApi(post, req) {
  return {
    ...post,
    imagem: post.imagem.startsWith('http')
      ? post.imagem
      : `${req.protocol}://${req.get('host')}${post.imagem}`,
  }
}

function apagarImagemLocal(caminhoImagem) {
  if (!caminhoImagem?.startsWith('/uploads/')) {
    return
  }

  const caminhoArquivo = join(pastaUploads, basename(caminhoImagem))

  if (existsSync(caminhoArquivo)) {
    unlinkSync(caminhoArquivo)
  }
}

//criar publicacao

app.post('/api/posts', upload.single('imagem'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      erro: 'Selecione uma imagem',
    })
  }

  const legenda = req.body.legenda?.trim()

  if (!legenda) {
    apagarImagemLocal(`/uploads/${req.file.filename}`)

    return res.status(400).json({
      erro: 'Digite uma legenda',
    })
  }

  const caminhoImagem = `/uploads/${req.file.filename}`

  const resultado = db
    .prepare(`
      INSERT INTO posts (imagem, legenda)
      VALUES (?, ?)
    `)
    .run(caminhoImagem, legenda)

  const post = db
    .prepare(`
      SELECT id, imagem, legenda, criado_em
      FROM posts
      WHERE id = ?
    `)
    .get(Number(resultado.lastInsertRowid))

  res.status(201).json({
    ...adicionarUrlDaApi(post, req),
  })
})

//listar as publicacoes
app.get('/api/posts', (req, res) => {
    const posts = db
    .prepare(`
    SELECT id, imagem, legenda, criado_em
    FROM posts
    ORDER BY id DESC
    `)
    .all()

const postsComUrl = posts.map((post) => adicionarUrlDaApi(post, req))

res.json(postsComUrl)
})

// buscar publicacao pelo id 
app.get('/api/posts/:id', (req, res) => {
  const post = db
    .prepare(`
      SELECT id, imagem, legenda, criado_em
      FROM posts
      WHERE id = ?
    `)
    .get(req.params.id)

  if (!post) {
    return res.status(404).json({
      erro: 'Post não encontrado',
    })
  }

  res.json(adicionarUrlDaApi(post, req))
})

// editar publicacao (put no body)
app.put('/api/posts/:id', upload.single('imagem'), (req, res) => {
  const postAtual = db
    .prepare(`
      SELECT id, imagem, legenda, criado_em
      FROM posts
      WHERE id = ?
    `)
    .get(req.params.id)

  
  if (!postAtual) {
    if (req.file) {
      apagarImagemLocal(`/uploads/${req.file.filename}`)
    }

    return res.status(404).json({
      erro: 'Post não encontrado',
    })
  }

  const legendaFoiEnviada = typeof req.body.legenda === 'string'
  const legenda = legendaFoiEnviada
    ? req.body.legenda.trim()
    : postAtual.legenda

  if (legendaFoiEnviada && !legenda) {
    if (req.file) {
      apagarImagemLocal(`/uploads/${req.file.filename}`)
    }

    return res.status(400).json({
      erro: 'A legenda não pode ficar vazia',
    })
  }

  if (!legendaFoiEnviada && !req.file) {
    return res.status(400).json({
      erro: 'Envie uma legenda ou uma imagem para editar o post',
    })
  }

  const imagem = req.file
    ? `/uploads/${req.file.filename}`
    : postAtual.imagem

  db.prepare(`
    UPDATE posts
    SET imagem = ?, legenda = ?
    WHERE id = ?
  `).run(imagem, legenda, req.params.id)

  if (req.file) {
    apagarImagemLocal(postAtual.imagem)
  }

  const postAtualizado = db
    .prepare(`
      SELECT id, imagem, legenda, criado_em
      FROM posts
      WHERE id = ?
    `)
    .get(req.params.id)

  res.json(adicionarUrlDaApi(postAtualizado, req))
})

// apagar uma publicacao
app.delete('/api/posts/:id', (req, res) => {
  const post = db
    .prepare(`
      SELECT id, imagem
      FROM posts
      WHERE id = ?
    `)
    .get(req.params.id)

  if (!post) {
    return res.status(404).json({
      erro: 'Post não encontrado',
    })
  }

  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id)
  apagarImagemLocal(post.imagem)

  res.json({
    mensagem: 'Post apagado com sucesso',
    id: post.id,
  })
})

// buscar dados (get)
app.get('/api/perfil', (req, res) => {
  const perfil = db
    .prepare(`
      SELECT nome_usuario, bio, foto
      FROM perfil
      WHERE id = 1
    `)
    .get()

  res.json({
    ...perfil,
    foto: perfil.foto.startsWith('http')
      ? perfil.foto
      : `${req.protocol}://${req.get('host')}${perfil.foto}`,
  })
})

// atualizar dados (foto, nome de usuario e bio)
app.put('/api/perfil', upload.single('foto'), (req, res) => {
  const nomeUsuario = req.body.nome_usuario?.trim()
  const bio = req.body.bio?.trim()

  if (!nomeUsuario || !bio) {
    if (req.file) {
      apagarImagemLocal(`/uploads/${req.file.filename}`)
    }

    return res.status(400).json({
      erro: 'Preencha o nome de usuário e a bio',
    })
  }

  const perfilAtual = db
    .prepare('SELECT foto FROM perfil WHERE id = 1')
    .get()

  const foto = req.file
    ? `/uploads/${req.file.filename}`
    : perfilAtual.foto

  db.prepare(`
    UPDATE perfil
    SET nome_usuario = ?, bio = ?, foto = ?
    WHERE id = 1
  `).run(nomeUsuario, bio, foto)

  if (req.file) {
    apagarImagemLocal(perfilAtual.foto)
  }

  res.json({
    nome_usuario: nomeUsuario,
    bio,
    foto: foto.startsWith('http')
      ? foto
      : `${req.protocol}://${req.get('host')}${foto}`,
  })
})

app.use((erro, req, res, _next) => {
  console.error(erro)

  res.status(400).json({
    erro: erro.message || 'Erro ao enviar imagem',
  })
})

app.listen(PORT, () => {
    console.log(`API executando em http://localhost:${PORT}`)
})
