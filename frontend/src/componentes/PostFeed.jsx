import AcoesPost from './AcoesPost'
import { Link } from 'react-router-dom'

export default function PostFeed({ post, perfil, onEditar, onExcluir }) {
    const fotoAutor = post.autor?.foto || ''
    const autor = post.autor || perfil
    const linkPerfil = autor.id === perfil.id ? '/home' : `/perfil/${autor.id}`

    return (
        <article className="post-feed-card">
            <header className="post-feed-header">
                <Link to={linkPerfil} className="post-feed-autor text-decoration-none">
                    {fotoAutor ? (
                        <img
                            src={fotoAutor}
                            alt={`Foto de ${autor.nome_usuario}`}
                            className="post-feed-avatar"
                        />
                    ) : (
                        <span className="post-feed-avatar post-feed-avatar-vazio" aria-label="Perfil sem foto">♡</span>
                    )}
                    <span className="post-feed-autor-texto">
                        <strong>{autor.nome_usuario}</strong>
                        <small>Agora mesmo</small>
                    </span>
                </Link>
            </header>

            <img
                src={post.imagem}
                alt={post.legenda}
                className="post-feed-imagem"
            />

            <div className="post-feed-conteudo">
                <div className="post-feed-interacoes" aria-label="Interações do post">
                    <span>♡ Curtir</span>
                    <span>○ Comentar</span>
                    <span>↗ Compartilhar</span>
                </div>

                {post.legenda && (
                    <p className="post-feed-legenda">
                        <Link to={linkPerfil} className="post-feed-legenda-autor"><strong>{autor.nome_usuario}</strong></Link> {post.legenda}
                    </p>
                )}

                <AcoesPost
                    post={post}
                    onEditar={onEditar}
                    onExcluir={onExcluir}
                />
            </div>
        </article>
    )
}
