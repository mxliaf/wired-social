import test from 'node:test'
import assert from 'node:assert/strict'
import { validarUpload } from './uploadsBlob.js'

const url = 'https://exemplo.public.blob.vercel-storage.com/uploads/usuario/foto.jpg'

test('aceita a URL confirmada pelo armazenamento para o usuário', async () => {
  const resultado = await validarUpload(url, 'usuario', async (caminho) => {
    assert.equal(caminho, 'uploads/usuario/foto.jpg')
    return { url, contentType: 'image/jpeg' }
  })
  assert.equal(resultado, url)
})

test('rejeita novos Base64, domínios externos e arquivos de outra conta antes de consultar Blob', async () => {
  for (const invalida of ['data:image/png;base64,YQ==', 'https://example.com/uploads/usuario/foto.jpg', url.replace('/usuario/', '/outra-conta/'), url.replace('https:', 'http:')]) {
    await assert.rejects(validarUpload(invalida, 'usuario', () => assert.fail('Não deve consultar arquivo inválido')), { status: 400 })
  }
})

test('rejeita arquivos de outro armazenamento e conteúdo não permitido', async () => {
  await assert.rejects(validarUpload(url, 'usuario', async () => ({ url: url.replace('exemplo.', 'outro.'), contentType: 'image/jpeg' })), { status: 400 })
  await assert.rejects(validarUpload(url, 'usuario', async () => ({ url, contentType: 'text/html' })), { status: 400 })
})
