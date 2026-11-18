import { upload } from '@vercel/blob/client'
import { API_URL } from '../config/api'
import { obterToken } from './auth'

export async function enviarImagem(imagem) {
    // As prévias podem continuar locais em Base64; somente a URL vai para a API.
    const arquivo = typeof imagem === 'string' ? await (await fetch(imagem)).blob() : imagem
    const extensoes = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp' }
    const extensao = extensoes[arquivo?.type]
    if (!extensao) throw new Error('Escolha uma imagem JPEG, PNG, GIF ou WebP')
    const usuario = JSON.parse(localStorage.getItem('wired_usuario') || 'null')
    if (!usuario?.id || !obterToken()) throw new Error('Faça login para enviar imagens')
    try {
        const resultado = await upload(`uploads/${usuario.id}/${crypto.randomUUID()}.${extensao}`, arquivo, {
            access: 'public',
            handleUploadUrl: `${API_URL}/api/uploads`,
            headers: { Authorization: `Bearer ${obterToken()}` },
            multipart: arquivo.size > 100 * 1024 * 1024,
        })
        return resultado.url
    } catch {
        throw new Error('Não foi possível enviar a imagem. Verifique a conexão e se o armazenamento de imagens está disponível.')
    }
}
