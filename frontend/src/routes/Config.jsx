import { useEffect, useState } from 'react'
import { API_URL } from '../config/api'
import { fetchComAuth } from '../services/auth'

function lerImagem(arquivo, descricao) {
    return new Promise((resolve, reject) => {
        const leitor = new FileReader()
        leitor.onload = () => resolve(leitor.result)
        leitor.onerror = () => reject(new Error(`Não foi possível ler ${descricao}`))
        leitor.readAsDataURL(arquivo)
    })
}

export default function Config() {
    const [nome, setNome] = useState('')
    const [nomeUsuario, setNomeUsuario] = useState('')
    const [bio, setBio] = useState('')
    const [foto, setFoto] = useState(null)
    const [fotoAtual, setFotoAtual] = useState('')
    const [fotoPreview, setFotoPreview] = useState('')
    const [capa, setCapa] = useState(null)
    const [capaAtual, setCapaAtual] = useState('')
    const [capaPreview, setCapaPreview] = useState('')
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
                setCapaAtual(perfil.capa || '')
            } catch (error) {
                setErro(error.message)
            }
        }

        carregarPerfil()
    }, [])

    async function selecionarImagem(event, setArquivo, setPreview, descricao) {
        const arquivo = event.target.files[0] || null
        setErro('')

        if (!arquivo) {
            setArquivo(null)
            setPreview('')
            return
        }

        if (!arquivo.type.startsWith('image/')) {
            event.target.value = ''
            setArquivo(null)
            setPreview('')
            setErro(`Escolha uma imagem ou GIF válido para ${descricao}`)
            return
        }

        if (arquivo.size > 2_000_000) {
            event.target.value = ''
            setArquivo(null)
            setPreview('')
            setErro(`A ${descricao} deve ter no máximo 2 MB`)
            return
        }

        try {
            setArquivo(arquivo)
            setPreview(await lerImagem(arquivo, `a ${descricao}`))
        } catch (error) {
            setErro(error.message)
        }
    }

    async function salvarPerfil(event) {
        event.preventDefault()

        try {
            setErro('')
            setMensagem('')

            if (foto && foto.size > 2_000_000) {
                throw new Error('A foto deve ter no máximo 2 MB')
            }

            if (capa && capa.size > 2_000_000) {
                throw new Error('A capa deve ter no máximo 2 MB')
            }

            if ((foto?.size || 0) + (capa?.size || 0) > 2_800_000) {
                throw new Error('Para enviar foto e capa juntas, os arquivos devem somar no máximo 2,8 MB')
            }

            const dados = {
                nome,
                nome_usuario: nomeUsuario,
                bio,
            }

            if (foto) {
                dados.foto = await lerImagem(foto, 'a foto')
            }

            if (capa) {
                dados.capa = await lerImagem(capa, 'a capa')
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
            setCapaAtual(perfilAtualizado.capa || '')
            setFoto(null)
            setCapa(null)
            setFotoPreview('')
            setCapaPreview('')
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

                <div className="preview-perfil-config mb-4">
                    <div className="preview-capa-config">
                        {(capaPreview || capaAtual) ? (
                            <img src={capaPreview || capaAtual} alt="Prévia da capa" />
                        ) : (
                            <span>Sem capa</span>
                        )}
                    </div>

                    {(fotoPreview || fotoAtual) ? (
                        <img
                            src={fotoPreview || fotoAtual}
                            alt="Prévia da foto de perfil"
                            className="foto-configuracao preview-foto-config"
                        />
                    ) : (
                        <div className="foto-configuracao foto-configuracao-vazia preview-foto-config" aria-label="Perfil sem foto">
                            Sem foto
                        </div>
                    )}
                </div>

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
                            onChange={(event) => selecionarImagem(event, setFoto, setFotoPreview, 'foto')}
                        />
                        <div className="form-text">Imagem ou GIF opcional de até 2 MB.</div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="capa" className="form-label">
                            Nova foto de capa
                        </label>

                        <input
                            id="capa"
                            type="file"
                            accept="image/*,.gif"
                            className="form-control campo-padrao"
                            onChange={(event) => selecionarImagem(event, setCapa, setCapaPreview, 'capa')}
                        />
                        <div className="form-text">Imagem ou GIF horizontal de até 2 MB. Recomendado: 1200 × 400.</div>
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
