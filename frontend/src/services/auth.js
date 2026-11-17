export function obterToken() {
    return localStorage.getItem('wired_token')
}

export function estaAutenticado() {
    return Boolean(obterToken())
}

export function sair() {
    localStorage.removeItem('wired_token')
    localStorage.removeItem('wired_usuario')
}

export function fetchComAuth(url, opcoes = {}) {
    const token = obterToken()

    return fetch(url, {
        ...opcoes,
        headers: {
            ...(opcoes.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    })
}
