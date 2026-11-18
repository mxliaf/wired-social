import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PostFeed from '../componentes/PostFeed'
import { enviarImagem } from '../services/uploads'
import { NovoStory, StoryAvatar } from '../componentes/Stories'
import { API_URL } from '../config/api'
import { editarLegenda, excluirPost, listarPosts } from '../services/posts'
import { fetchComAuth } from '../services/auth'

const perfilInicial = {
    nome: '',
    nome_usuario: '',
    foto: '',
}

export default function Timeline() {
    const [posts, setPosts] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [perfil, setPerfil] = useState(perfilInicial)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState('')
    const [composerAberto, setComposerAberto] = useState(false)
    const [imagemPublicacao, setImagemPublicacao] = useState('')
    const [legendaPublicacao, setLegendaPublicacao] = useState('')
    const [erroPublicacao, setErroPublicacao] = useState('')
    const [publicando, setPublicando] = useState(false)
    const [versaoFormulario, setVersaoFormulario] = useState(0)

    useEffect(() => {
        async function carregarFeed() {
            try {
                const [postsDaApi, respostaPerfil, respostaUsuarios] = await Promise.all([
                    listarPosts(),
                    fetchComAuth(`${API_URL}/api/perfil`),
                    fetchComAuth(`${API_URL}/api/usuarios`),
                ])

                const dadosPerfil = await respostaPerfil.json()
                const dadosUsuarios = await respostaUsuarios.json()

                if (!respostaPerfil.ok) {
                    throw new Error(dadosPerfil.erro || 'Não foi possível carregar o perfil')
                }

                if (!respostaUsuarios.ok) {
                    throw new Error(dadosUsuarios.erro || 'Não foi possível carregar os usuários')
                }

                setPosts(postsDaApi)
                setPerfil(dadosPerfil)
                setUsuarios(dadosUsuarios)
            } catch (error) {
                setErro(error.message)
            } finally {
                setCarregando(false)
            }
        }

        carregarFeed()
    }, [])

    async function editar(id, legenda) {
        const postAtualizado = await editarLegenda(id, legenda)

        setPosts((postsAtuais) =>
            postsAtuais.map((post) =>
                post.id === id ? postAtualizado : post
            )
        )
    }

    async function excluir(id) {
        await excluirPost(id)
        setPosts((postsAtuais) => postsAtuais.filter((post) => post.id !== id))
    }

    function abrirComposer() {
        setComposerAberto(true)
        setErroPublicacao('')
    }

    function cancelarPublicacao() {
        setComposerAberto(false)
        setImagemPublicacao('')
        setLegendaPublicacao('')
        setErroPublicacao('')
        setVersaoFormulario((versao) => versao + 1)
    }

    function selecionarImagem(event) {
        const arquivo = event.target.files?.[0]

        if (!arquivo) return

        const leitor = new FileReader()
        leitor.onload = () => {
            setImagemPublicacao(leitor.result)
            setErroPublicacao('')
        }
        leitor.onerror = () => setErroPublicacao('Não foi possível carregar a imagem')
        leitor.readAsDataURL(arquivo)
    }

    async function publicar(event) {
        event.preventDefault()

        if (!imagemPublicacao || !legendaPublicacao.trim()) {
            setErroPublicacao('Escolha uma imagem e escreva uma legenda')
            return
        }

        try {
            setPublicando(true)
            setErroPublicacao('')

            const imagemUrl = await enviarImagem(imagemPublicacao)
            const resposta = await fetchComAuth(`${API_URL}/api/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imagem: imagemUrl,
                    legenda: legendaPublicacao.trim(),
                }),
            })
            const novoPost = await resposta.json()

            if (!resposta.ok) {
                throw new Error(novoPost.erro || 'Não foi possível publicar')
            }

            setPosts((postsAtuais) => [novoPost, ...postsAtuais])
            cancelarPublicacao()
        } catch (error) {
            setErroPublicacao(error.message)
        } finally {
            setPublicando(false)
        }
    }

    return (
        <main className="timeline-container container py-4">
            <section className="stories-card" aria-label="Pessoas na Wired">
                <div className="stories-cabecalho">
                    <strong>Pessoas na Wired</strong>
                    <small>{usuarios.length} {usuarios.length === 1 ? 'perfil' : 'perfis'}</small>
                </div>
                <div className="stories-lista">
                    <NovoStory />

                    {usuarios.map((usuario) => (
                        <div
                            className="story-item"
                            key={usuario.id}
                        >
                            <StoryAvatar usuario={usuario}>
                            <div className="story-borda">
                                {usuario.foto ? (
                                    <img src={usuario.foto} alt={`Foto de ${usuario.nome}`} />
                                ) : (
                                    <span className="story-avatar-vazio">{usuario.nome?.charAt(0)?.toUpperCase() || '♡'}</span>
                                )}
                            </div>
                            </StoryAvatar>
                            <Link to={usuario.id === perfil.id ? '/home' : `/perfil/${usuario.id}`} className="text-decoration-none"><small>{usuario.id === perfil.id ? 'Você' : `@${usuario.nome_usuario}`}</small></Link>
                        </div>
                    ))}
                </div>
            </section>

            <form className={`feed-composer ${composerAberto ? 'aberto' : ''}`} aria-label="Criar uma publicação" onSubmit={publicar}>
                <div className="feed-composer-linha">
                    {perfil.foto ? (
                        <img src={perfil.foto} alt="Sua foto de perfil" />
                    ) : (
                        <span className="feed-composer-avatar">{perfil.nome?.charAt(0)?.toUpperCase() || '♡'}</span>
                    )}

                    {composerAberto ? (
                        <textarea
                            className="feed-composer-textarea"
                            value={legendaPublicacao}
                            onChange={(event) => setLegendaPublicacao(event.target.value)}
                            placeholder="Compartilhe algo com a comunidade..."
                            rows="3"
                            maxLength="1000"
                            autoFocus
                        />
                    ) : (
                        <button type="button" className="feed-composer-link" onClick={abrirComposer}>
                            Compartilhe algo com a comunidade...
                        </button>
                    )}

                    {!composerAberto && (
                        <button type="button" className="botao-publicar" onClick={abrirComposer}>
                            Publicar
                        </button>
                    )}
                </div>

                {composerAberto && (
                    <div className="feed-composer-expandido">
                        {imagemPublicacao && (
                            <img src={imagemPublicacao} alt="Prévia da publicação" className="feed-composer-preview" />
                        )}

                        <div className="feed-composer-rodape">
                            <label className="feed-composer-imagem">
                                <span aria-hidden="true">▧</span>
                                {imagemPublicacao ? 'Trocar imagem' : 'Escolher imagem'}
                                <input
                                    key={versaoFormulario}
                                    type="file"
                                    accept="image/*"
                                    onChange={selecionarImagem}
                                />
                            </label>

                            <div className="feed-composer-acoes">
                                <button type="button" className="botao-post botao-cancelar" onClick={cancelarPublicacao} disabled={publicando}>
                                    Cancelar
                                </button>
                                <button type="submit" className="botao-publicar" disabled={publicando}>
                                    {publicando ? 'Publicando...' : 'Publicar'}
                                </button>
                            </div>
                        </div>

                        {erroPublicacao && <p className="text-danger small mb-0">{erroPublicacao}</p>}
                    </div>
                )}
            </form>

            <div className="timeline-titulo">
                <div>
                    <span className="timeline-subtitulo">Sua comunidade</span>
                    <h1>Feed</h1>
                </div>
                <span className="timeline-total">{posts.length} {posts.length === 1 ? 'publicação' : 'publicações'}</span>
            </div>

            {carregando && <p className="text-center py-5">Carregando feed...</p>}

            {erro && (
                <p className="alert alert-danger text-center">
                    {erro}. Verifique se o backend está ligado.
                </p>
            )}

            {!carregando && !erro && posts.length === 0 && (
                <p className="text-center py-5">Nenhum post publicado.</p>
            )}

            <section className="timeline-posts">
                {posts.map((post) => (
                    <PostFeed
                        key={post.id}
                        post={post}
                        perfil={perfil}
                        onEditar={editar}
                        onExcluir={excluir}
                    />
                ))}
            </section>
        </main>
    )
}
