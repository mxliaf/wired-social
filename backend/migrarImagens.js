// Execução manual: node migrarImagens.js [--apply]. Sem --apply, apenas inventário.
import { readFile, mkdir, open } from 'node:fs/promises'
import { parseEnv } from 'node:util'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { MongoClient, BSON } from 'mongodb'
import { list, put, head, BlobNotFoundError } from '@vercel/blob'

const base = new URL('./', import.meta.url)
const env = parseEnv(await readFile(new URL('.env', base), 'utf8'))
const token = env.BLOB_READ_WRITE_TOKEN
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const campos = { users: ['foto', 'capa'], posts: ['imagem', 'autor.foto', 'autor.capa'], stories: ['imagem'] }
const extensoes = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp', 'image/avif': 'avif' }
const valorEm = (doc, campo) => campo.split('.').reduce((obj, key) => obj?.[key], doc)
const client = new MongoClient(env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 })
let diario
async function registrar(evento) {
  await diario.write(BSON.EJSON.stringify(evento) + '\n')
  await diario.sync()
}

try {
  await client.connect()
  const db = client.db(env.MONGODB_DB || 'wired')
  const itens = []
  const contagens = {}
  for (const [colecao, camposImagem] of Object.entries(campos)) {
    contagens[colecao] = await db.collection(colecao).countDocuments()
    const projection = Object.fromEntries([...camposImagem, 'autor.id', 'usuarioId'].map(c => [c, 1]))
    for await (const doc of db.collection(colecao).find({}, { projection })) {
      for (const campo of camposImagem) {
        const original = valorEm(doc, campo)
        if (typeof original !== 'string' || !original.startsWith('data:')) continue
        const match = /^data:(image\/(?:jpeg|png|gif|webp|avif));base64,([A-Za-z0-9+/]+={0,2})$/.exec(original)
        if (!match) throw new Error('Imagem Base64 não suportada; nenhum registro foi alterado.')
        const bytes = Buffer.from(match[2], 'base64')
        if (!bytes.length || bytes.toString('base64').replace(/=+$/, '') !== match[2].replace(/=+$/, '')) throw new Error('Base64 inválido')
        const owner = String(colecao === 'users' ? doc._id : colecao === 'posts' ? doc.autor?.id : doc.usuarioId)
        if (!/^[a-f0-9]{24}$/i.test(owner)) throw new Error('Imagem sem proprietário válido; migração interrompida')
        const digest = hash(bytes)
        itens.push({ colecao, id: doc._id, campo, original, mime: match[1], bytes, digest,
          pathname: `uploads/${owner}/migracao-${digest}.${extensoes[match[1]]}` })
      }
    }
  }
  const unicos = [...new Map(itens.map(i => [i.pathname, i])).values()]
  let cursor, bytesExistentes = 0
  do {
    const pagina = await list({ token, cursor, limit: 1000 })
    bytesExistentes += pagina.blobs.reduce((s, b) => s + b.size, 0)
    cursor = pagina.hasMore ? pagina.cursor : undefined
  } while (cursor)
  const bytesNovos = unicos.reduce((s, i) => s + i.bytes.length, 0)
  console.log(JSON.stringify({ registros: contagens, camposBase64: itens.length, arquivosUnicos: unicos.length, bytesNovos, bytesExistentes }))
  // Margem conservadora para manter o armazenamento abaixo da cota gratuita.
  if (bytesExistentes + bytesNovos > 900_000_000) throw new Error('Volume excede margem de segurança gratuita; nada alterado')
  if (process.argv.includes('--apply') && itens.length) {
    const pasta = new URL(`backups/blob-${new Date().toISOString().replace(/[:.]/g, '-')}/`, base)
    await mkdir(pasta, { recursive: true, mode: 0o700 })
    const snapshot = BSON.EJSON.stringify({ banco: db.databaseName, criadoEm: new Date(), contagens,
      itens: itens.map(({ bytes, ...item }) => item) })
    const arquivo = new URL('originais.ejson', pasta)
    const backup = await open(arquivo, 'wx', 0o600)
    try { await backup.writeFile(snapshot); await backup.sync() } finally { await backup.close() }
    if (hash(await readFile(arquivo)) !== hash(snapshot)) throw new Error('Falha na verificação do backup')
    diario = await open(new URL('alteracoes.ejsonl', pasta), 'wx', 0o600)
    console.log(`Backup verificado: ${fileURLToPath(pasta)}`)
    const urls = new Map()
    // Verifica TODOS os uploads antes da primeira alteração no banco.
    for (const item of unicos) {
      let blob
      try { blob = await head(item.pathname, { token }) }
      catch (error) { if (!(error instanceof BlobNotFoundError)) throw error }
      if (!blob) blob = await put(item.pathname, item.bytes, { token, access: 'public', contentType: item.mime,
        addRandomSuffix: false, allowOverwrite: false })
      const metadata = await head(blob.url, { token })
      if (metadata.size !== item.bytes.length || metadata.contentType !== item.mime) throw new Error('Metadados divergentes no Blob')
      const resposta = await fetch(blob.url, { signal: AbortSignal.timeout(60000) })
      if (!resposta.ok || hash(Buffer.from(await resposta.arrayBuffer())) !== item.digest) throw new Error('Cópia no Blob divergente')
      urls.set(item.pathname, blob.url)
      await registrar({ etapa: 'uploadVerificado', pathname: item.pathname, url: blob.url, sha256: item.digest })
      console.log(`Upload verificado ${urls.size}/${unicos.length}`)
    }
    let atualizados = 0, concorrentes = 0
    for (const item of itens) {
      const url = urls.get(item.pathname)
      await registrar({ etapa: 'antesDaTroca', colecao: item.colecao, id: item.id, campo: item.campo, url })
      const r = await db.collection(item.colecao).updateOne({ _id: item.id, [item.campo]: item.original }, { $set: { [item.campo]: url } })
      if (r.modifiedCount) {
        const salvo = await db.collection(item.colecao).findOne({ _id: item.id }, { projection: { [item.campo]: 1 } })
        if (valorEm(salvo, item.campo) !== url) throw new Error('Verificação do registro falhou; consulte backup e diário')
        atualizados++
      } else concorrentes++ // Não sobrescreve alterações feitas por usuários durante a migração.
      await registrar({ etapa: 'resultado', colecao: item.colecao, id: item.id, campo: item.campo, atualizado: !!r.modifiedCount })
    }
    console.log(JSON.stringify({ concluido: true, camposAtualizados: atualizados, ignoradosPorConcorrencia: concorrentes }))
  }
} catch (error) {
  // Não imprime URI, credenciais ou documentos em erros de drivers.
  console.error(`Migração interrompida (${error.name}). Nenhuma exclusão foi executada. Consulte o backup, se criado.`)
  const mensagensSeguras = ['Imagem Base64 não suportada; nenhum registro foi alterado.', 'Base64 inválido', 'Imagem sem proprietário válido; migração interrompida', 'Volume excede margem de segurança gratuita; nada alterado', 'Falha na verificação do backup', 'Metadados divergentes no Blob', 'Cópia no Blob divergente', 'Verificação do registro falhou; consulte backup e diário']
  if (mensagensSeguras.includes(error.message)) console.error(error.message)
  process.exitCode = 1
} finally {
  await diario?.close()
  await client.close()
}
