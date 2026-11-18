import AcoesPost from './AcoesPost'

export default function PostFeed({ post, perfil, onEditar, onExcluir }) {
    const fotoAutor = post.autor?.foto || perfil.foto

    return (
        <article className="post-feed-card">
            <header className="post-feed-header">
                {fotoAutor ? (
                    <img
                        src={fotoAutor}
                        alt="Foto do perfil"
                        className="post-feed-avatar"
                    />
                ) : (
                    <span className="post-feed-avatar post-feed-avatar-vazio" aria-label="Perfil sem foto">♡</span>
                )}
                <div>
                    <strong>{post.autor?.nome_usuario || perfil.nome_usuario}</strong>
                    <small>Agora mesmo</small>
                </div>
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
                        <strong>{post.autor?.nome_usuario || perfil.nome_usuario}</strong> {post.legenda}
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
