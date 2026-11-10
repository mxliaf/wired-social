import { useEffect, useState } from 'react'
import { API_URL } from '../config/api'

export default function Config() {
    const [nomeUsuario, setNomeUsuario] = useState('')
    const [bio, setBio] = useState('')
    const [foto, setFoto] = useState(null)
    const [fotoAtual, setFotoAtual] = useState('')
    const [mensagem, setMensagem] = useState('')
    const [erro, setErro] = useState('')

    useEffect(() => {
        async function carregarPerfil() {
            try {
                const resposta = await fetch(`${API_URL}/api/perfil`)
                const perfil = await resposta.json()

                if (!resposta.ok) {
                    throw new Error(perfil.erro || 'Não foi possível carregar o perfil')
                }

                setNomeUsuario(perfil.nome_usuario)
                setBio(perfil.bio)
                setFotoAtual(perfil.foto)
            } catch (error) {
                setErro(error.message)
            }
        }

        carregarPerfil()
    }, [])

    async function salvarPerfil(event) {
        event.preventDefault()

        const formulario = new FormData()
        formulario.append('nome_usuario', nomeUsuario)
        formulario.append('bio', bio)

        if (foto) {
            formulario.append('foto', foto)
        }

        try {
            setErro('')
            setMensagem('')

            const resposta = await fetch(`${API_URL}/api/perfil`, {
                method: 'PUT',
                body: formulario,
            })

            const perfilAtualizado = await resposta.json()

            if (!resposta.ok) {
                throw new Error(perfilAtualizado.erro || 'Não foi possível salvar o perfil')
            }

            setFotoAtual(perfilAtualizado.foto)
            setMensagem('Perfil atualizado com sucesso!')
        } catch (error) {
            setErro(error.message)
        }
    }

    return (
        <main className="container py-5">
            <div className="card card-formulario card-configuracoes mx-auto p-4">
                <h1 className="h3 mb-4">Configurações do perfil</h1>

                {fotoAtual && (
                    <img
                        src={fotoAtual}
                        alt="Foto atual do perfil"
                        className="foto-configuracao rounded-circle object-fit-cover mx-auto mb-4"
                        width="120"
                        height="120"
                    />
                )}

                <form onSubmit={salvarPerfil}>
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
                            required
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
