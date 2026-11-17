import AcoesPost from './AcoesPost'

export default function PostFeed({ post, perfil, onEditar, onExcluir }) {
    return (
        <article className="post-feed-card">
            <header className="post-feed-header">
                <img
                    src={post.autor?.foto || perfil.foto}
                    alt="Foto do perfil"
                    className="post-feed-avatar"
                />
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

                <p className="post-feed-legenda">
                    <strong>{post.autor?.nome_usuario || perfil.nome_usuario}</strong> {post.legenda}
                </p>

                <AcoesPost
                    post={post}
                    onEditar={onEditar}
                    onExcluir={onExcluir}
                />
            </div>
        </article>
    )
}
