import { useEffect, useState } from 'react'
import { API_URL } from '../config/api'
import { fetchComAuth } from '../services/auth'
import { enviarImagem } from '../services/uploads'

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
    const [email, setEmail] = useState('')
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
                setEmail(perfil.email || '')
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

            const dados = {
                nome,
                nome_usuario: nomeUsuario,
                bio,
            }

            if (foto) {
                dados.foto = await enviarImagem(foto)
            }

            if (capa) {
                dados.capa = await enviarImagem(capa)
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
                    <label className="preview-capa-config upload-perfil" htmlFor="capa">
                        <input id="capa" type="file" accept="image/*,.gif" className="upload-perfil-input"
                            aria-label="Adicionar ou trocar capa" aria-describedby="ajuda-imagens-perfil"
                            onChange={(event) => selecionarImagem(event, setCapa, setCapaPreview, 'capa')} />
                        {(capaPreview || capaAtual) ? (
                            <img src={capaPreview || capaAtual} alt="Prévia da capa" />
                        ) : (
                            <span>Sem capa</span>
                        )}
                        <span className="upload-perfil-overlay">{capaPreview || capaAtual ? 'Trocar capa' : 'Adicionar capa'}</span>
                    </label>

                    <label className="foto-configuracao preview-foto-config upload-perfil" htmlFor="foto">
                        <input id="foto" type="file" accept="image/*,.gif" className="upload-perfil-input"
                            aria-label="Adicionar ou trocar foto de perfil" aria-describedby="ajuda-imagens-perfil"
                            onChange={(event) => selecionarImagem(event, setFoto, setFotoPreview, 'foto')} />
                    {(fotoPreview || fotoAtual) ? (
                        <img
                            src={fotoPreview || fotoAtual}
                            alt="Prévia da foto de perfil"
                            className="upload-perfil-foto"
                        />
                    ) : (
                        <span className="upload-perfil-vazio">
                            Sem foto
                        </span>
                    )}
                        <span className="upload-perfil-overlay">{fotoPreview || fotoAtual ? 'Trocar foto' : 'Adicionar foto'}</span>
                    </label>
                </div>
                <p id="ajuda-imagens-perfil" className="form-text mb-4">Toque na foto ou na capa para escolher JPEG, PNG, WebP ou GIF. Capa ideal: 1200 × 400.</p>

                <form onSubmit={salvarPerfil}>
                    <div className="mb-3">
                        <label htmlFor="emailConta" className="form-label">E-mail da conta</label>
                        <input id="emailConta" type="email" className="form-control campo-padrao" value={email} readOnly />
                        <div className="form-text">Este é o e-mail que você usa para entrar.</div>
                    </div>
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
