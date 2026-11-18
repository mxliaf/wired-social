import { head } from '@vercel/blob'

export const tiposImagem = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

// Só URLs de arquivos deste armazenamento e deste usuário podem ser gravadas.
export async function validarUpload(url, usuarioId, consultarArquivo = head) {
  let endereco
  try { endereco = new URL(url) } catch { throw Object.assign(new Error('Envie a imagem pelo seletor de arquivos'), { status: 400 }) }
  const caminho = endereco.pathname.slice(1)
  if (endereco.protocol !== 'https:' || !endereco.hostname.endsWith('.public.blob.vercel-storage.com') || !caminho.startsWith(`uploads/${usuarioId}/`)) {
    throw Object.assign(new Error('Imagem inválida para esta conta'), { status: 400 })
  }
  const arquivo = await consultarArquivo(caminho, { token: process.env.BLOB_READ_WRITE_TOKEN })
  if (arquivo.url !== url || !tiposImagem.includes(arquivo.contentType)) {
    throw Object.assign(new Error('Arquivo de imagem inválido'), { status: 400 })
  }
  return arquivo.url
}
