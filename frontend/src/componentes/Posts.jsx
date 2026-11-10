function Posts({ img, descricao, onClick }) {
    return (
        <div className="col-6 col-sm-3">
            <button
                type="button"
                className="post-card"
                onClick={onClick}
            >
                <img
                    src={img}
                    alt={descricao}
                    className="img-fluid post-thumbnail"
                />
            </button>
        </div>
    )
}

export default Posts
