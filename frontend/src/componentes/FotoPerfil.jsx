function FotoPerfil({ img }) {
    return (
        <div id="profilepicture">
            <img src={img} alt="Foto de perfil" className="img-fluid object-fit-cover" />
        </div>
    )
}

export default FotoPerfil
