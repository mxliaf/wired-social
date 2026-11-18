import { API_URL } from '../config/api'
import { fetchComAuth } from './auth'

async function lerResposta(resposta) {
    const dados = await resposta.json()

    if (!resposta.ok) {
        throw new Error(dados.erro || 'Não foi possível concluir a operação')
    }

    return dados
}

export async function listarPosts(apenasDoUsuario = false, usuarioId = '') {
    const filtro = usuarioId
        ? `?usuario=${encodeURIComponent(usuarioId)}`
        : apenasDoUsuario ? '?me=true' : ''
    const resposta = await fetchComAuth(`${API_URL}/api/posts${filtro}`)
    return lerResposta(resposta)
}

export async function editarLegenda(id, legenda) {
    const resposta = await fetchComAuth(`${API_URL}/api/posts/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ legenda }),
    })

    return lerResposta(resposta)
}

export async function excluirPost(id) {
    const resposta = await fetchComAuth(`${API_URL}/api/posts/${id}`, {
        method: 'DELETE',
    })

    return lerResposta(resposta)
}
