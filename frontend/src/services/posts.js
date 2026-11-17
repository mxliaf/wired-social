import { API_URL } from '../config/api'

function headersComAuth(headers = {}) {
    const token = localStorage.getItem('wired_token')
    return token ? { ...headers, Authorization: `Bearer ${token}` } : headers
}

async function lerResposta(resposta) {
    const dados = await resposta.json()

    if (!resposta.ok) {
        throw new Error(dados.erro || 'Não foi possível concluir a operação')
    }

    return dados
}

export async function listarPosts() {
    const resposta = await fetch(`${API_URL}/api/posts`)
    return lerResposta(resposta)
}

export async function editarLegenda(id, legenda) {
    const resposta = await fetch(`${API_URL}/api/posts/${id}`, {
        method: 'PUT',
        headers: headersComAuth({
            'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ legenda }),
    })

    return lerResposta(resposta)
}

export async function excluirPost(id) {
    const resposta = await fetch(`${API_URL}/api/posts/${id}`, {
        method: 'DELETE',
        headers: headersComAuth(),
    })

    return lerResposta(resposta)
}
