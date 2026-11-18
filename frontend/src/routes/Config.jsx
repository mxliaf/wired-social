import { useEffect, useState } from 'react'
import { API_URL } from '../config/api'
import { fetchComAuth } from '../services/auth'

export default function Config() {
    const [nome, setNome] = useState('')
    const [nomeUsuario, setNomeUsuario] = useState('')
    const [bio, setBio] = useState('')
    const [foto, setFoto] = useState(null)
    const [fotoAtual, setFotoAtual] = useState('')
    const [mensagem, setMensagem] = useState('')
    const [erro, setErro] = useState('')

    useEffect(() => {
        async function carregarPerfil() {
            try {
                const resposta = await fetchComAuth(`${API_URL}/api/perfil`)
                const perfil = await resposta.json()

                if (!resposta.ok) {
                    throw new Error(perfil.erro || 'Não foi possível carregar o perfil')
                }

                setNome(perfil.nome || '')
                setNomeUsuario(perfil.nome_usuario || '')
                setBio(perfil.bio || '')
                setFotoAtual(perfil.foto || '')
            } catch (error) {
                setErro(error.message)
            }
        }

        carregarPerfil()
    }, [])

    async function salvarPerfil(event) {
        event.preventDefault()

        try {
            setErro('')
            setMensagem('')

            if (foto && foto.size > 2_000_000) {
                throw new Error('A foto deve ter no máximo 2 MB')
            }

            const dados = {
                nome,
                nome_usuario: nomeUsuario,
                bio,
            }

            if (foto) {
                dados.foto = await new Promise((resolve, reject) => {
                    const leitor = new FileReader()
                    leitor.onload = () => resolve(leitor.result)
                    leitor.onerror = () => reject(new Error('Não foi possível ler a foto'))
                    leitor.readAsDataURL(foto)
                })
            }

            const resposta = await fetchComAuth(`${API_URL}/api/perfil`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados),
            })

            const perfilAtualizado = await resposta.json()

            if (!resposta.ok) {
                throw new Error(perfilAtualizado.erro || 'Não foi possível salvar o perfil')
            }

            setNome(perfilAtualizado.nome || '')
            setNomeUsuario(perfilAtualizado.nome_usuario || '')
            setBio(perfilAtualizado.bio || '')
            setFotoAtual(perfilAtualizado.foto || '')
            setFoto(null)
            localStorage.setItem('wired_usuario', JSON.stringify(perfilAtualizado))
            window.dispatchEvent(new Event('wired-user-updated'))
            setMensagem('Perfil atualizado com sucesso!')
        } catch (error) {
            setErro(error.message)
        }
    }

    return (
        <main className="container py-5">
            <div className="card card-formulario card-configuracoes mx-auto p-4">
                <h1 className="h3 mb-4">Configurações do perfil</h1>

                {fotoAtual ? (
                    <img
                        src={fotoAtual}
                        alt="Foto atual do perfil"
                        className="foto-configuracao rounded-circle object-fit-cover mx-auto mb-4"
                        width="120"
                        height="120"
                    />
                ) : (
                    <div className="foto-configuracao foto-configuracao-vazia mx-auto mb-4" aria-label="Perfil sem foto">
                        Sem foto
                    </div>
                )}

                <form onSubmit={salvarPerfil}>
                    <div className="mb-3">
                        <label htmlFor="nome" className="form-label">
                            Nome
                        </label>

                        <input
                            id="nome"
                            type="text"
                            className="form-control campo-padrao"
                            value={nome}
                            onChange={(event) => setNome(event.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="nomeUsuario" className="form-label">
                            Nome de usuário
                        </label>

                        <input
                            id="nomeUsuario"
                            type="text"
                            className="form-control campo-padrao"
                            value={nomeUsuario}
                            onChange={(event) => setNomeUsuario(event.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="bio" className="form-label">
                            Bio
                        </label>

                        <textarea
                            id="bio"
                            className="form-control campo-padrao"
                            rows="4"
                            value={bio}
                            onChange={(event) => setBio(event.target.value)}
                            maxLength="300"
                            placeholder="Conte um pouco sobre você (opcional)"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="foto" className="form-label">
                            Nova foto de perfil
                        </label>

                        <input
                            id="foto"
                            type="file"
                            accept="image/*"
                            className="form-control campo-padrao"
                            onChange={(event) => setFoto(event.target.files[0])}
                        />
                        <div className="form-text">Imagem opcional de até 2 MB.</div>
                    </div>

                    {mensagem && <p className="text-success">{mensagem}</p>}
                    {erro && <p className="text-danger">{erro}</p>}

                    <button type="submit" className="botao-formulario w-100">
                        Salvar alterações
                    </button>
                </form>
            </div>
        </main>
    )
}
