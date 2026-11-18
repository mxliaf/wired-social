function FotoPerfil({ img }) {
    return (
        <div id="profilepicture">
            {img ? (
                <img src={img} alt="Foto de perfil" className="img-fluid object-fit-cover" />
            ) : (
                <div className="foto-perfil-vazia" aria-label="Perfil sem foto">♡</div>
            )}
        </div>
    )
}

export default FotoPerfil
