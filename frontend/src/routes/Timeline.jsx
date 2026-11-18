import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PostFeed from '../componentes/PostFeed'
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

    return (
        <main className="timeline-container container py-4">
            <section className="stories-card" aria-label="Pessoas na Wired">
                <div className="stories-cabecalho">
                    <strong>Pessoas na Wired</strong>
                    <small>{usuarios.length} {usuarios.length === 1 ? 'perfil' : 'perfis'}</small>
                </div>
                <div className="stories-lista">
                    <Link to="/publicar" className="story-item text-decoration-none">
                        <span className="story-adicionar">+</span>
                        <small>Novo post</small>
                    </Link>

                    {usuarios.map((usuario) => (
                        <div className="story-item" key={usuario.id}>
                            <div className="story-borda">
                                {usuario.foto ? (
                                    <img src={usuario.foto} alt={`Foto de ${usuario.nome}`} />
                                ) : (
                                    <span className="story-avatar-vazio">{usuario.nome?.charAt(0)?.toUpperCase() || '♡'}</span>
                                )}
                            </div>
                            <small>{usuario.id === perfil.id ? 'Você' : `@${usuario.nome_usuario}`}</small>
                        </div>
                    ))}
                </div>
            </section>

            <section className="feed-composer" aria-label="Criar uma publicação">
                {perfil.foto ? (
                    <img src={perfil.foto} alt="Sua foto de perfil" />
                ) : (
                    <span className="feed-composer-avatar">{perfil.nome?.charAt(0)?.toUpperCase() || '♡'}</span>
                )}
                <Link to="/publicar" className="feed-composer-link text-decoration-none">
                    Compartilhe algo com a comunidade...
                </Link>
                <Link to="/publicar" className="botao-publicar text-decoration-none">
                    Publicar
                </Link>
            </section>

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
