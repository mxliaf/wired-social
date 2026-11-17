import { useEffect, useState } from 'react'
import Posts from '../componentes/Posts'
import AcoesPost from '../componentes/AcoesPost'
import { editarLegenda, excluirPost, listarPosts } from '../services/posts'

export default function Feed() {
    const [posts, setPosts] = useState([])
    const [abaAtiva, setAbaAtiva] = useState('feed')
    const [postSelecionado, setPostSelecionado] = useState(null)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState('')

    useEffect(() => {
        async function carregarPosts() {
            try {
                const dados = await listarPosts()
                setPosts(dados)
            } catch (error) {
                setErro(error.message)
            } finally {
                setCarregando(false)
            }
        }

        carregarPosts()
    }, [])

    async function editar(id, legenda) {
        const postAtualizado = await editarLegenda(id, legenda)

        setPosts((postsAtuais) =>
            postsAtuais.map((post) =>
                post.id === id ? postAtualizado : post
            )
        )
        setPostSelecionado(postAtualizado)
    }

    async function excluir(id) {
        await excluirPost(id)
        setPosts((postsAtuais) => postsAtuais.filter((post) => post.id !== id))
        setPostSelecionado(null)
    }

    return (
        <>
            <div className="container-fluid px-3">
                

                <ul className="nav feed-tabs my-3 mx-auto" role="tablist">
                    <li className="nav-item" role="presentation">
                        <button
                            className={`feed-tab ${abaAtiva === 'feed' ? 'active' : ''}`}
                            type="button"
                            role="tab"
                            aria-selected={abaAtiva === 'feed'}
                            onClick={() => setAbaAtiva('feed')}
                        >
                            Feed
                        </button>
                    </li>

                    <li className="nav-item" role="presentation">
                        <button
                            className={`feed-tab ${abaAtiva === 'reels' ? 'active' : ''}`}
                            type="button"
                            role="tab"
                            aria-selected={abaAtiva === 'reels'}
                            onClick={() => setAbaAtiva('reels')}
                        >
                            Reels
                        </button>
                    </li>

                    <li className="nav-item" role="presentation">
                        <button
                            className={`feed-tab ${abaAtiva === 'marcacoes' ? 'active' : ''}`}
                            type="button"
                            role="tab"
                            aria-selected={abaAtiva === 'marcacoes'}
                            onClick={() => setAbaAtiva('marcacoes')}
                        >
                            Marcações
                        </button>
                    </li>
                </ul>

                <div className="tab-content">
                    {abaAtiva === 'feed' && (
                        <div className="tab-pane fade show active text-black" role="tabpanel">
                            {carregando && (
                                <p className="text-center py-5">Carregando posts...</p>
                            )}

                            {erro && (
                                <p className="alert alert-danger text-center">
                                    {erro}. Verifique se o backend está ligado.
                                </p>
                            )}

                            {!carregando && !erro && posts.length === 0 && (
                                <p className="text-center py-5">Nenhum post encontrado.</p>
                            )}

                            <div className="row g-3 feed-grid">
                                {posts.map((post) => (
                                    <Posts
                                        key={post.id}
                                        img={post.imagem}
                                        descricao={post.legenda}
                                        onClick={() => setPostSelecionado(post)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {abaAtiva === 'reels' && (
                        <div className="tab-pane fade show active py-5 text-center text-black" role="tabpanel">
                            <p>Nenhum reel publicado.</p>
                        </div>
                    )}

                    {abaAtiva === 'marcacoes' && (
                        <div className="tab-pane fade show active py-5 text-center text-black" role="tabpanel">
                            <p>Nenhuma marcação encontrada.</p>
                        </div>
                    )}
                </div>
            </div>

            {postSelecionado && (
                <div
                    className="post-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Visualização da publicação"
                    onClick={() => setPostSelecionado(null)}
                >
                    <div
                        className="post-modal-conteudo"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="post-modal-fechar"
                            aria-label="Fechar publicação"
                            onClick={() => setPostSelecionado(null)}
                        >
                            ×
                        </button>

                        <img
                            src={postSelecionado.imagem}
                            alt={postSelecionado.legenda}
                        />

                        <p>{postSelecionado.legenda}</p>

                        <AcoesPost
                            post={postSelecionado}
                            onEditar={editar}
                            onExcluir={excluir}
                        />
                    </div>
                </div>
            )}
        </>
    )
}
