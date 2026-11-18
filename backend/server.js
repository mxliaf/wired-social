import express from 'express'
import cors from 'cors'
import { MongoClient, ObjectId } from 'mongodb'
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const app = express()
const PORT = process.env.PORT || 3000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || 'wired'
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'troque-este-segredo-em-producao'

function normalizarOrigem(url) {
  try {
    return new URL(url).origin
  } catch {
    return url.replace(/\/+$/, '')
  }
}

const origensPermitidas = [...new Set([
  'http://localhost:5173',
  'https://mxliaf.github.io',
  ...FRONTEND_URL.split(',').map((url) => url.trim()).filter(Boolean).map(normalizarOrigem),
])]

app.use(cors({ origin: origensPermitidas }))
app.use(express.json({ limit: '4mb' }))

app.get('/', (_req, res) => {
  res.json({ ok: true, servico: 'Wired API' })
})

const mongoState = globalThis.__wiredMongoState || (globalThis.__wiredMongoState = {
  client: null,
  databasePromise: null,
})

function getDatabase() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI não configurada')
  if (!mongoState.databasePromise) {
    mongoState.client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
    })
    mongoState.databasePromise = mongoState.client.connect()
      .then(() => mongoState.client.db(MONGODB_DB))
      .catch((error) => {
        mongoState.databasePromise = null
        mongoState.client = null
        throw error
      })
  }
  return mongoState.databasePromise
}

function senhaHash(senha, salt = randomBytes(16).toString('hex')) {
  return `${salt}:${scryptSync(senha, salt, 64).toString('hex')}`
}

function conferirSenha(senha, armazenada) {
  const [salt, hash] = armazenada.split(':')
  return timingSafeEqual(scryptSync(senha, salt, 64), Buffer.from(hash, 'hex'))
}

function criarToken(userId) {
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 })).toString('base64url')
  const assinatura = createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url')
  return `${payload}.${assinatura}`
}

function lerToken(token) {
  if (!token) return null
  const [payload, assinatura] = token.split('.')
  if (!payload || !assinatura) return null
  const esperada = createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url')
  if (assinatura !== esperada) return null
  const dados = JSON.parse(Buffer.from(payload, 'base64url').toString())
  return dados.exp > Date.now() ? dados.sub : null
}

async function usuarioAtual(req) {
  const id = lerToken(req.headers.authorization?.replace('Bearer ', ''))
  if (!id) return null
  const db = await getDatabase()
  return db.collection('users').findOne({ _id: new ObjectId(id) })
}

async function exigirUsuario(req, res, next) {
  try {
    const usuario = await usuarioAtual(req)
    if (!usuario) return res.status(401).json({ erro: 'Faça login para acessar esta rota' })
    req.usuario = usuario
    next()
  } catch (error) {
    next(error)
  }
}

function perfilPublico(usuario) {
  const foto = typeof usuario.foto === 'string' && !usuario.foto.includes('i.pravatar.cc')
    ? usuario.foto
    : ''

  return {
    id: String(usuario._id || usuario.id || ''),
    nome: usuario.nome || usuario.nome_usuario || '',
    nome_usuario: usuario.nome_usuario || '',
    bio: usuario.bio || '',
    foto,
    capa: typeof usuario.capa === 'string' ? usuario.capa : '',
    seguidores: Number(usuario.seguidores) || 0,
    seguindo: Number(usuario.seguindo) || 0,
  }
}

function autorPublico(usuario) {
  const autor = perfilPublico(usuario)
  delete autor.capa
  return autor
}

function postPublico(post) {
  const legendaOriginal = post.legenda ?? post.descricao ?? ''
  const legenda = typeof legendaOriginal === 'string' && legendaOriginal.trim().toUpperCase() !== 'NOT NULL'
    ? legendaOriginal.trim()
    : ''

  return {
    id: post._id.toString(),
    imagem: post.imagem,
    legenda,
    criado_em: post.criado_em,
    autor: post.autor ? autorPublico(post.autor) : null,
  }
}

const exemplos = [
  ['wiredbot', 'https://i.pinimg.com/1200x/8d/78/29/8d78290ddb68ab61bc8c862cc5d63818.jpg', 'Bem-vindo à comunidade Wired ✨'],
  ['luna.codes', 'https://i.pinimg.com/736x/fa/25/2d/fa252d2b60abdd60387cd0fadceae975.jpg', 'Criando coisas bonitas na internet.'],
  ['pixel.night', 'https://i.pinimg.com/736x/e0/03/0f/e0030feb585721c584bb8518d9b1d744.jpg', 'Inspiração para hoje.'],
]

async function semearBanco(db) {
  if (await db.collection('users').countDocuments() > 0) return
  const usuarios = exemplos.map(([nome_usuario]) => ({
    nome: nome_usuario,
    nome_usuario,
    email: `${nome_usuario.replace('.', '')}@example.com`,
    senha: senhaHash('123456'),
    bio: 'Usuário de demonstração da Wired',
    foto: '',
    capa: '',
    seguidores: 0,
    seguindo: 0,
    criado_em: new Date(),
  }))
  const resultado = await db.collection('users').insertMany(usuarios)
  await db.collection('posts').insertMany(exemplos.map(([, imagem, legenda], index) => ({ imagem, legenda, criado_em: new Date(Date.now() - index * 3600000), autor: autorPublico({ ...usuarios[index], _id: resultado.insertedIds[index] }) })))
}

async function corrigirDadosAntigos(db) {
  await Promise.all([
    db.collection('users').updateMany(
      { foto: /^https:\/\/i\.pravatar\.cc\//i },
      { $set: { foto: '' } },
    ),
    db.collection('posts').updateMany(
      { legenda: /^\s*NOT NULL\s*$/i },
      { $set: { legenda: '' } },
    ),
  ])
}

async function prepararBanco(db) {
  await semearBanco(db)
  await corrigirDadosAntigos(db)
}

app.get('/api/health', async (_req, res) => { try { const db = await getDatabase(); await db.command({ ping: 1 }); res.json({ ok: true, banco: 'mongodb' }) } catch (error) { res.status(503).json({ ok: false, erro: error.message }) } })

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const nome = req.body.nome?.trim()
    const nome_usuario = req.body.nome_usuario?.trim().toLowerCase()
    const email = req.body.email?.trim().toLowerCase()
    const senha = req.body.senha || ''

    if (!nome || !nome_usuario || !email || senha.length < 6) {
      return res.status(400).json({ erro: 'Informe nome, usuário, e-mail e senha com pelo menos 6 caracteres' })
    }

    const db = await getDatabase(); const existente = await db.collection('users').findOne({ $or: [{ email }, { nome_usuario }] })
    if (existente) return res.status(409).json({ erro: 'E-mail ou nome de usuário já cadastrado' })
    const usuario = {
      nome,
      nome_usuario,
      email,
      senha: senhaHash(senha),
      bio: '',
      foto: '',
      capa: '',
      seguidores: 0,
      seguindo: 0,
      criado_em: new Date(),
    }
    const { insertedId } = await db.collection('users').insertOne(usuario)
    res.status(201).json({ token: criarToken(insertedId.toString()), usuario: perfilPublico({ ...usuario, _id: insertedId }) })
  } catch (error) { next(error) }
})

app.post('/api/auth/login', async (req, res, next) => {
  try { const db = await getDatabase(); const usuario = await db.collection('users').findOne({ email: req.body.email?.trim().toLowerCase() }); if (!usuario || !conferirSenha(req.body.senha || '', usuario.senha)) return res.status(401).json({ erro: 'E-mail ou senha incorretos' }); res.json({ token: criarToken(usuario._id.toString()), usuario: perfilPublico(usuario) }) } catch (error) { next(error) }
})

app.get('/api/perfil', exigirUsuario, async (req, res, next) => { try { res.json(perfilPublico(req.usuario)) } catch (error) { next(error) } })

app.get('/api/usuarios', exigirUsuario, async (_req, res, next) => {
  try {
    const db = await getDatabase()
    const usuarios = await db.collection('users').find().sort({ nome_usuario: 1 }).limit(100).toArray()
    res.json(usuarios.map(perfilPublico))
  } catch (error) {
    next(error)
  }
})

app.put('/api/perfil', exigirUsuario, async (req, res, next) => {
  try {
    const nome = req.body.nome?.trim()
    const nome_usuario = req.body.nome_usuario?.trim().toLowerCase()
    const bio = typeof req.body.bio === 'string' ? req.body.bio.trim() : ''
    const foto = typeof req.body.foto === 'string' ? req.body.foto.trim() : req.usuario.foto || ''
    const capa = typeof req.body.capa === 'string' ? req.body.capa.trim() : req.usuario.capa || ''

    if (!nome || !nome_usuario) {
      return res.status(400).json({ erro: 'Informe o nome e o nome de usuário' })
    }

    if (bio.length > 300) {
      return res.status(400).json({ erro: 'A bio pode ter no máximo 300 caracteres' })
    }

    if (foto && !foto.startsWith('data:image/')) {
      return res.status(400).json({ erro: 'Envie uma imagem válida para o perfil' })
    }

    if (capa && !capa.startsWith('data:image/')) {
      return res.status(400).json({ erro: 'Envie uma imagem ou GIF válido para a capa' })
    }

    if (foto.length > 2_800_000 || capa.length > 2_800_000) {
      return res.status(413).json({ erro: 'A foto e a capa devem ter no máximo 2 MB cada' })
    }

    const db = await getDatabase()
    const usuarioComMesmoNome = await db.collection('users').findOne({
      nome_usuario,
      _id: { $ne: req.usuario._id },
    })

    if (usuarioComMesmoNome) {
      return res.status(409).json({ erro: 'Esse nome de usuário já está em uso' })
    }

    const atualizacao = { nome, nome_usuario, bio, foto, capa }
    await db.collection('users').updateOne({ _id: req.usuario._id }, { $set: atualizacao })

    const usuarioAtualizado = { ...req.usuario, ...atualizacao }
    const perfil = perfilPublico(usuarioAtualizado)

    await db.collection('posts').updateMany(
      { 'autor.id': req.usuario._id.toString() },
      { $set: { autor: autorPublico(usuarioAtualizado) } },
    )

    res.json(perfil)
  } catch (error) {
    next(error)
  }
})

app.get('/api/posts', exigirUsuario, async (req, res, next) => {
  try {
    const db = await getDatabase()
    const filtro = req.query.me === 'true' ? { 'autor.id': req.usuario._id.toString() } : {}
    const posts = await db.collection('posts').find(filtro).sort({ criado_em: -1 }).limit(100).toArray()
    res.json(posts.map(postPublico))
  } catch (error) {
    next(error)
  }
})

app.post('/api/posts', async (req, res, next) => {
  try { const usuario = await usuarioAtual(req); if (!usuario) return res.status(401).json({ erro: 'Faça login para publicar' }); const imagem = req.body.imagem?.trim(); const legenda = req.body.legenda?.trim(); if (!imagem || !legenda || legenda.toUpperCase() === 'NOT NULL') return res.status(400).json({ erro: 'Informe imagem e uma legenda válida' }); if (imagem.length > 4_000_000) return res.status(413).json({ erro: 'Imagem muito grande (máximo de 4 MB)' }); const db = await getDatabase(); const post = { imagem, legenda, criado_em: new Date(), autor: autorPublico(usuario) }; const { insertedId } = await db.collection('posts').insertOne(post); res.status(201).json(postPublico({ ...post, _id: insertedId })) } catch (error) { next(error) }
})

app.put('/api/posts/:id', async (req, res, next) => {
  try {
    const usuario = await usuarioAtual(req)
    if (!usuario) return res.status(401).json({ erro: 'Faça login para editar' })

    const legenda = typeof req.body.legenda === 'string' ? req.body.legenda.trim() : ''
    if (!legenda || legenda.toUpperCase() === 'NOT NULL') {
      return res.status(400).json({ erro: 'Informe uma legenda válida' })
    }

    const db = await getDatabase()
    const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) })
    if (!post || post.autor.id !== usuario._id.toString()) return res.status(403).json({ erro: 'Você só pode editar seus próprios posts' })

    await db.collection('posts').updateOne({ _id: post._id }, { $set: { legenda } })
    res.json(postPublico({ ...post, legenda }))
  } catch (error) { next(error) }
})

app.delete('/api/posts/:id', async (req, res, next) => { try { const usuario = await usuarioAtual(req); if (!usuario) return res.status(401).json({ erro: 'Faça login para excluir' }); const db = await getDatabase(); const resultado = await db.collection('posts').deleteOne({ _id: new ObjectId(req.params.id), 'autor.id': usuario._id.toString() }); if (!resultado.deletedCount) return res.status(403).json({ erro: 'Você só pode excluir seus próprios posts' }); res.json({ mensagem: 'Post apagado com sucesso' }) } catch (error) { next(error) } })
app.use((error, _req, res, _next) => { console.error(error); res.status(500).json({ erro: 'Erro interno da API' }) })

if (process.env.VERCEL !== '1') app.listen(PORT, () => console.log(`API executando em http://localhost:${PORT}`))
export default app
if (MONGODB_URI) getDatabase().then(prepararBanco).catch(console.error)
