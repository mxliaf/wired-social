import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PostFeed from '../componentes/PostFeed'
import { API_URL } from '../config/api'
import { editarLegenda, excluirPost, listarPosts } from '../services/posts'

const perfilInicial = {
    nome_usuario: 'agaetisbyrju',
    foto: 'https://i.pinimg.com/1200x/6c/ef/fb/6ceffb9310699f63aa4cfe58b67bf2dc.jpg',
}

export default function Timeline() {
    const [posts, setPosts] = useState([])
    const [perfil, setPerfil] = useState(perfilInicial)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState('')

    useEffect(() => {
        async function carregarFeed() {
            try {
                const [postsDaApi, respostaPerfil] = await Promise.all([
                    listarPosts(),
                    fetch(`${API_URL}/api/perfil`),
                ])

                const dadosPerfil = await respostaPerfil.json()

                if (!respostaPerfil.ok) {
                    throw new Error(dadosPerfil.erro || 'Não foi possível carregar o perfil')
                }

                setPosts(postsDaApi)
                setPerfil(dadosPerfil)
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

    const stories = posts.slice(0, 8)

    return (
        <main className="timeline-container container py-4">
            <section className="stories-card" aria-label="Stories">
                <div className="stories-lista">
                    <Link to="/publicar" className="story-item text-decoration-none">
                        <span className="story-adicionar">+</span>
                        <small>Novo post</small>
                    </Link>

                    {stories.map((post, index) => (
                        <div className="story-item" key={post.id}>
                            <div className="story-borda">
                                <img src={post.imagem} alt={`Story ${index + 1}`} />
                            </div>
                            <small>{index === 0 ? 'Você' : `Wired ${index}`}</small>
                        </div>
                    ))}
                </div>
            </section>

            <div className="timeline-titulo">
                <div>
                    <span className="timeline-subtitulo">Sua comunidade</span>
                    <h1>Feed</h1>
                </div>
                <Link to="/publicar" className="botao-publicar text-decoration-none">
                    Publicar
                </Link>
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
